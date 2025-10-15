import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';

const { width: screenWidth } = Dimensions.get('window');

export default function ChartsScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [selectedChart, setSelectedChart] = useState<'line' | 'bar' | 'pie'>('line');

  // Dados de exemplo para os gráficos
  const lineChartData = {
    labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
    datasets: [
      {
        data: [1200, 1900, 1500, 2000, 1800, 2200],
        color: () => '#22C55E',
        strokeWidth: 2,
      },
    ],
  };

  const barChartData = {
    labels: ['Alim', 'Transp', 'Saúde', 'Lazer', 'Educ', 'Outros'],
    datasets: [
      {
        data: [800, 400, 300, 200, 150, 150],
      },
    ],
  };

  const pieChartData = [
    {
      name: 'Alimentação',
      population: 800,
      color: '#FF6B6B',
      legendFontColor: '#2c3e50',
      legendFontSize: 12,
    },
    {
      name: 'Transporte',
      population: 400,
      color: '#4ECDC4',
      legendFontColor: '#2c3e50',
      legendFontSize: 12,
    },
    {
      name: 'Saúde',
      population: 300,
      color: '#45B7D1',
      legendFontColor: '#2c3e50',
      legendFontSize: 12,
    },
    {
      name: 'Lazer',
      population: 200,
      color: '#96CEB4',
      legendFontColor: '#2c3e50',
      legendFontSize: 12,
    },
    {
      name: 'Outros',
      population: 150,
      color: '#FFEAA7',
      legendFontColor: '#2c3e50',
      legendFontSize: 12,
    },
  ];

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(44, 62, 80, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: '#22C55E',
    },
  };

  const stats = [
    { label: 'Total Gasto', value: 'R$ 2.850,00', change: '+12%', isPositive: false },
    { label: 'Maior Categoria', value: 'Alimentação', change: 'R$ 800,00', isPositive: false },
    { label: 'Economia', value: 'R$ 450,00', change: '+8%', isPositive: true },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Análise Financeira</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="filter-outline" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Filtros de Período */}
        <View style={styles.periodContainer}>
          {[
            { key: 'week', label: 'Semana' },
            { key: 'month', label: 'Mês' },
            { key: 'year', label: 'Ano' },
          ].map((period) => (
            <TouchableOpacity
              key={period.key}
              style={[
                styles.periodButton,
                selectedPeriod === period.key && styles.periodButtonActive,
              ]}
              onPress={() => setSelectedPeriod(period.key as any)}
            >
              <Text
                style={[
                  styles.periodButtonText,
                  selectedPeriod === period.key && styles.periodButtonTextActive,
                ]}
              >
                {period.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Cards de Estatísticas */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsContainer}>
          {stats.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <Text style={styles.statLabel}>{stat.label}</Text>
              <Text style={styles.statValue}>{stat.value}</Text>
              <View style={styles.statChange}>
                <Ionicons
                  name={stat.isPositive ? 'trending-up' : 'trending-down'}
                  size={14}
                  color={stat.isPositive ? '#22C55E' : '#EF4444'}
                />
                <Text
                  style={[
                    styles.statChangeText,
                    { color: stat.isPositive ? '#22C55E' : '#EF4444' },
                  ]}
                >
                  {stat.change}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Seletor de Tipo de Gráfico */}
        <View style={styles.chartTypeContainer}>
          {[
            { key: 'line', icon: 'trending-up', label: 'Linha' },
            { key: 'bar', icon: 'bar-chart', label: 'Barras' },
            { key: 'pie', icon: 'pie-chart', label: 'Pizza' },
          ].map((chart) => (
            <TouchableOpacity
              key={chart.key}
              style={[
                styles.chartTypeButton,
                selectedChart === chart.key && styles.chartTypeButtonActive,
              ]}
              onPress={() => setSelectedChart(chart.key as any)}
            >
              <Ionicons
                name={chart.icon as any}
                size={20}
                color={selectedChart === chart.key ? '#22C55E' : '#666'}
              />
              <Text
                style={[
                  styles.chartTypeText,
                  selectedChart === chart.key && styles.chartTypeTextActive,
                ]}
              >
                {chart.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Gráfico */}
        <View style={styles.chartContainer}>
          {selectedChart === 'line' && (
            <LineChart
              data={lineChartData}
              width={screenWidth - 40}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
            />
          )}

          {selectedChart === 'bar' && (
            <BarChart
              data={barChartData}
              width={screenWidth - 40}
              height={220}
              chartConfig={chartConfig}
              style={styles.chart}
              showValuesOnTopOfBars
            />
          )}

          {selectedChart === 'pie' && (
            <PieChart
              data={pieChartData}
              width={screenWidth - 40}
              height={220}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
            />
          )}
        </View>

        {/* Legenda do Gráfico */}
        <View style={styles.legendContainer}>
          <Text style={styles.legendTitle}>Distribuição por Categoria</Text>
          {pieChartData.map((item, index) => (
            <View key={index} style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: item.color }]} />
              <Text style={styles.legendText}>{item.name}</Text>
              <Text style={styles.legendValue}>R$ {item.population},00</Text>
            </View>
          ))}
        </View>

        {/* Insights */}
        <View style={styles.insightsContainer}>
          <Text style={styles.insightsTitle}>Insights</Text>
          <View style={styles.insightItem}>
            <Ionicons name="alert-circle-outline" size={20} color="#F59E0B" />
            <Text style={styles.insightText}>
              Seus gastos com alimentação aumentaram 15% este mês
            </Text>
          </View>
          <View style={styles.insightItem}>
            <Ionicons name="checkmark-circle-outline" size={20} color="#22C55E" />
            <Text style={styles.insightText}>
              Você economizou R$ 200,00 comparado ao mês anterior
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  filterButton: {
    padding: 8,
    backgroundColor: 'white',
    borderRadius: 8,
    elevation: 2,
  },
  periodContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  periodButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: 'white',
  },
  periodButtonActive: {
    backgroundColor: '#22C55E',
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  periodButtonTextActive: {
    color: 'white',
  },
  statsContainer: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  statCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginRight: 12,
    minWidth: 140,
    elevation: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  statChange: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statChangeText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  chartTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  chartTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: 'white',
  },
  chartTypeButtonActive: {
    backgroundColor: '#E8F5E8',
    borderColor: '#22C55E',
    borderWidth: 1,
  },
  chartTypeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginLeft: 6,
  },
  chartTypeTextActive: {
    color: '#22C55E',
  },
  chartContainer: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    marginBottom: 20,
  },
  chart: {
    borderRadius: 16,
  },
  legendContainer: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    marginBottom: 20,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    flex: 1,
    fontSize: 14,
    color: '#2c3e50',
  },
  legendValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
  insightsContainer: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    marginBottom: 20,
  },
  insightsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  insightText: {
    flex: 1,
    fontSize: 14,
    color: '#2c3e50',
    marginLeft: 8,
    lineHeight: 20,
  },
});