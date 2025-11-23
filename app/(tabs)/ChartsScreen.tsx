// app/(tabs)/ChartsScreen.tsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator, Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../../firebase/firebaseConfig';

const { width: screenWidth } = Dimensions.get('window');

// caminho local da logo (conforme seu upload)
const LOGO_PATH = '/mnt/data/c4377870-3b09-49ac-98b2-891fe437c115.png';

type Tx = {
  id: string;
  amount: number;
  category?: string;
  type?: 'income' | 'expense';
  createdAt: Date;
  description?: string;
};

export default function ChartsScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [selectedChart, setSelectedChart] = useState<'line' | 'bar' | 'pie'>('line');
  const [transactions, setTransactions] = useState<Tx[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      // sem usuário, não tenta escutar
      setTransactions([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'users', user.uid, 'transactions'),
      orderBy('createdAt', 'desc')
    );

    const unsub = onSnapshot(q, (snap) => {
      const items: Tx[] = [];
      snap.forEach((d) => {
        const data = d.data() as any;
        const createdAtRaw = data.createdAt;
        const createdAt = createdAtRaw?.toDate ? createdAtRaw.toDate() : (createdAtRaw instanceof Date ? createdAtRaw : new Date());
        items.push({
          id: d.id,
          amount: Number(data.amount || 0),
          category: data.category || 'Outros',
          type: data.type || 'expense',
          createdAt,
          description: data.description || ''
        });
      });
      setTransactions(items);
      setLoading(false);
    }, (err) => {
      console.log('Charts onSnapshot error', err);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  // Helpers para período
  const startOfPeriod = (period: typeof selectedPeriod) => {
    const now = new Date();
    if (period === 'week') {
      const d = new Date(now);
      d.setDate(now.getDate() - 6); // últimos 7 dias (inclui hoje)
      d.setHours(0, 0, 0, 0);
      return d;
    }
    if (period === 'month') {
      const d = new Date(now);
      d.setDate(now.getDate() - 29); // últimos 30 dias
      d.setHours(0, 0, 0, 0);
      return d;
    }
    // year
    const d = new Date(now);
    d.setFullYear(now.getFullYear() - 1);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  // filtra apenas despesas (conforme sua escolha)
  const filteredExpenses = useMemo(() => {
    const start = startOfPeriod(selectedPeriod);
    return transactions.filter(t => t.type === 'expense' && t.createdAt >= start);
  }, [transactions, selectedPeriod]);

  // --- LINE CHART DATA: soma por dia no período selecionado ---
  const lineChartData = useMemo(() => {
    const start = startOfPeriod(selectedPeriod);
    const days: string[] = [];
    const totalsByDay: Record<string, number> = {};
    const now = new Date();

    // gerar lista de dias do start até hoje
    for (let d = new Date(start); d <= now; d.setDate(d.getDate() + 1)) {
      const key = d.toISOString().slice(0, 10); // YYYY-MM-DD
      days.push(key);
      totalsByDay[key] = 0;
    }

    filteredExpenses.forEach(tx => {
      const key = tx.createdAt.toISOString().slice(0, 10);
      if (totalsByDay[key] !== undefined) totalsByDay[key] += Number(tx.amount || 0);
    });

    const labels = days.map((k, i) => {
      // rótulos curtos: se muitos dias, mostrar menos ticks
      const date = new Date(k);
      if (selectedPeriod === 'week') return date.toLocaleDateString('pt-BR', { weekday: 'short' }); // seg, ter...
      if (selectedPeriod === 'month') {
        return `${date.getDate()}/${date.getMonth() + 1}`;
      }
      // year -> mostrar mês
      return date.toLocaleDateString('pt-BR', { month: 'short' });
    });

    const data = days.map(k => Math.round((totalsByDay[k] || 0) * 100) / 100);

    return { labels, datasets: [{ data }] };
  }, [filteredExpenses, selectedPeriod]);

  // --- BAR CHART: total por categoria (top categories) ---
  const barChartData = useMemo(() => {
    const sums: Record<string, number> = {};
    filteredExpenses.forEach(tx => {
      const cat = tx.category || 'Outros';
      sums[cat] = (sums[cat] || 0) + Number(tx.amount || 0);
    });

    const entries = Object.entries(sums).sort((a, b) => b[1] - a[1]);
    const top = entries.slice(0, 6); // até 6 barras

    const labels = top.map(e => e[0].length > 8 ? e[0].slice(0, 7) + '…' : e[0]);
    const data = top.map(e => Math.round(e[1] * 100) / 100);

    return { labels, datasets: [{ data }] };
  }, [filteredExpenses]);

  // --- PIE CHART: distribuição por categoria ---
  const pieChartData = useMemo(() => {
    const sums: Record<string, number> = {};
    filteredExpenses.forEach(tx => {
      const cat = tx.category || 'Outros';
      sums[cat] = (sums[cat] || 0) + Number(tx.amount || 0);
    });

    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFA726', '#AB47BC', '#95a5a6'
    ];

    const entries = Object.entries(sums).sort((a, b) => b[1] - a[1]).slice(0, 8);
    const total = entries.reduce((s, e) => s + e[1], 0) || 1;

    return entries.map((e, i) => ({
      name: e[0],
      population: Math.round(e[1] * 100) / 100,
      color: colors[i % colors.length],
      legendFontColor: '#2c3e50',
      legendFontSize: 12,
      percent: Math.round((e[1] / total) * 100),
    }));
  }, [filteredExpenses]);

  // Stats simples
  const stats = useMemo(() => {
    const totalSpent = filteredExpenses.reduce((s, t) => s + Number(t.amount || 0), 0);
    const topCategory = pieChartData.length ? pieChartData[0].name : '-';
    // economia: exemplo simples = diferença entre mês atual e anterior (não implementado complexo)
    return [
      { label: 'Total Gasto', value: totalSpent.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), change: '', isPositive: false },
      { label: 'Maior Categoria', value: topCategory, change: '', isPositive: false },
      { label: 'Registros', value: String(filteredExpenses.length), change: '', isPositive: true },
    ];
  }, [filteredExpenses, pieChartData]);

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(44, 62, 80, ${opacity})`,
    style: { borderRadius: 16 },
    propsForDots: { r: '4', strokeWidth: '2', stroke: '#22C55E' },
  };

  // medidas para charts
  const chartWidth = screenWidth - 40;
  const chartHeight = 220;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Image source={{ uri: LOGO_PATH }} style={{ width: 36, height: 36, marginRight: 10 }} resizeMode="contain" />
          <Text style={styles.title}>Análise Financeira</Text>
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="filter-outline" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
        {/* Período */}
        <View style={styles.periodContainer}>
          {[
            { key: 'week', label: 'Semana' },
            { key: 'month', label: 'Mês' },
            { key: 'year', label: 'Ano' },
          ].map(p => (
            <TouchableOpacity
              key={p.key}
              style={[styles.periodButton, selectedPeriod === p.key && styles.periodButtonActive]}
              onPress={() => setSelectedPeriod(p.key as any)}
            >
              <Text style={[styles.periodButtonText, selectedPeriod === p.key && styles.periodButtonTextActive]}>
                {p.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Stats */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsContainer}>
          {stats.map((s, i) => (
            <View key={i} style={styles.statCard}>
              <Text style={styles.statLabel}>{s.label}</Text>
              <Text style={styles.statValue}>{s.value}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Chart Type Selector */}
        <View style={styles.chartTypeContainer}>
          {[
            { key: 'line', icon: 'trending-up', label: 'Linha' },
            { key: 'bar', icon: 'bar-chart', label: 'Barras' },
            { key: 'pie', icon: 'pie-chart', label: 'Pizza' },
          ].map(c => (
            <TouchableOpacity
              key={c.key}
              style={[styles.chartTypeButton, selectedChart === c.key && styles.chartTypeButtonActive]}
              onPress={() => setSelectedChart(c.key as any)}
            >
              <Ionicons name={c.icon as any} size={18} color={selectedChart === c.key ? '#22C55E' : '#666'} />
              <Text style={[styles.chartTypeText, selectedChart === c.key && styles.chartTypeTextActive]}>{c.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Chart */}
        <View style={styles.chartContainer}>
          {loading ? (
            <ActivityIndicator size="large" color="#22C55E" />
          ) : (
            <>
              {selectedChart === 'line' && (
                <LineChart
                  data={lineChartData}
                  width={chartWidth}
                  height={chartHeight}
                  chartConfig={chartConfig}
                  bezier
                  style={styles.chart}
                  fromZero
                />
              )}

              {selectedChart === 'bar' && (
                <BarChart
                  data={barChartData}
                  width={chartWidth}
                  height={chartHeight}
                  chartConfig={chartConfig}
                  style={styles.chart}
                  showValuesOnTopOfBars
                  fromZero
                />
              )}

              {selectedChart === 'pie' && (
                <PieChart
                  data={pieChartData}
                  width={chartWidth}
                  height={chartHeight}
                  chartConfig={chartConfig}
                  accessor="population"
                  backgroundColor="transparent"
                  paddingLeft="15"
                  absolute
                />
              )}
            </>
          )}
        </View>

        {/* Legend (pie) */}
        {selectedChart === 'pie' && pieChartData.length > 0 && (
          <View style={styles.legendContainer}>
            <Text style={styles.legendTitle}>Distribuição por Categoria</Text>
            {pieChartData.map((item, i) => (
              <View key={i} style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: item.color }]} />
                <Text style={styles.legendText}>{item.name}</Text>
                <Text style={styles.legendValue}>
                  {item.population.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} ({item.percent}%)
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Insights */}
        <View style={styles.insightsContainer}>
          <Text style={styles.insightsTitle}>Insights</Text>
          <View style={styles.insightItem}>
            <Ionicons name="alert-circle-outline" size={20} color="#F59E0B" />
            <Text style={styles.insightText}>
              {filteredExpenses.length === 0 ? 'Sem despesas no período selecionado' : `Você registrou ${filteredExpenses.length} despesas no período.`}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', paddingTop: 60 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, marginBottom: 12
  },
  title: { fontSize: 22, fontWeight: '700', color: '#2c3e50' },
  filterButton: { padding: 8, backgroundColor: 'white', borderRadius: 8, elevation: 2 },

  periodContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 12, paddingHorizontal: 20 },
  periodButton: { paddingHorizontal: 16, paddingVertical: 8, marginHorizontal: 6, borderRadius: 20, backgroundColor: 'white' },
  periodButtonActive: { backgroundColor: '#22C55E' },
  periodButtonText: { fontSize: 14, fontWeight: '600', color: '#666' },
  periodButtonTextActive: { color: 'white' },

  statsContainer: { marginBottom: 12, paddingHorizontal: 20 },
  statCard: { backgroundColor: 'white', padding: 14, borderRadius: 12, marginRight: 12, minWidth: 140, elevation: 2 },
  statLabel: { fontSize: 12, color: '#666', marginBottom: 6 },
  statValue: { fontSize: 16, fontWeight: '700', color: '#2c3e50' },

  chartTypeContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 12, paddingHorizontal: 20 },
  chartTypeButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, marginHorizontal: 6, borderRadius: 20, backgroundColor: 'white' },
  chartTypeButtonActive: { backgroundColor: '#E8F5E8', borderColor: '#22C55E', borderWidth: 1 },
  chartTypeText: { fontSize: 14, fontWeight: '600', color: '#666', marginLeft: 6 },
  chartTypeTextActive: { color: '#22C55E' },

  chartContainer: { backgroundColor: 'white', marginHorizontal: 20, borderRadius: 16, padding: 12, elevation: 2, marginBottom: 16 },
  chart: { borderRadius: 16 },

  legendContainer: { backgroundColor: 'white', marginHorizontal: 20, borderRadius: 12, padding: 14, elevation: 2, marginBottom: 16 },
  legendTitle: { fontSize: 16, fontWeight: '700', color: '#2c3e50', marginBottom: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  legendColor: { width: 12, height: 12, borderRadius: 6, marginRight: 8 },
  legendText: { flex: 1, fontSize: 14, color: '#2c3e50' },
  legendValue: { fontSize: 14, fontWeight: '600', color: '#2c3e50' },

  insightsContainer: { backgroundColor: 'white', marginHorizontal: 20, borderRadius: 12, padding: 14, elevation: 2, marginBottom: 30 },
  insightsTitle: { fontSize: 16, fontWeight: '700', color: '#2c3e50', marginBottom: 8 },
  insightItem: { flexDirection: 'row', alignItems: 'flex-start' },
  insightText: { flex: 1, fontSize: 14, color: '#2c3e50', marginLeft: 8 }
});
