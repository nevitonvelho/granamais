import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { auth, db } from '../../firebase/firebaseConfig';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

export default function StatementScreen() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchText, setSearchText] = useState('');
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month' | 'all'>('month');

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, 'users', user.uid, 'transactions'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: any[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        items.push({
          id: doc.id,
          description: data.description,
          amount: Number(data.amount),
          category: data.category,
          type: data.type,
          icon: data.icon || 'card-outline',
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
        });
      });

      setTransactions(items);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // ------------------ FILTROS DE PERÍODO ------------------

  const filterByPeriod = (items: any[]) => {
    const now = new Date();

    return items.filter((t) => {
      if (!t.createdAt) return false;

      const date = new Date(t.createdAt);

      if (selectedPeriod === 'today') {
        return (
          date.getDate() === now.getDate() &&
          date.getMonth() === now.getMonth() &&
          date.getFullYear() === now.getFullYear()
        );
      }

      if (selectedPeriod === 'week') {
        const diff = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
        return diff <= 7;
      }

      if (selectedPeriod === 'month') {
        return (
          date.getMonth() === now.getMonth() &&
          date.getFullYear() === now.getFullYear()
        );
      }

      return true;
    });
  };

  // ------------------ FILTROS DE BUSCA E TIPO ------------------

  const filteredTransactions = filterByPeriod(transactions).filter((transaction) => {
    const matchesSearch =
      transaction.description.toLowerCase().includes(searchText.toLowerCase()) ||
      transaction.category.toLowerCase().includes(searchText.toLowerCase());

    const matchesFilter =
      filter === 'all' ||
      (filter === 'income' && transaction.type === 'income') ||
      (filter === 'expense' && transaction.type === 'expense');

    return matchesSearch && matchesFilter;
  });

  // ------------------ CÁLCULOS ------------------

  const totalIncome = filteredTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = filteredTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpenses;

  const formatCurrency = (value: number) =>
    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR');
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Alimentação': '#FF6B6B',
      'Transporte': '#4ECDC4',
      'Saúde': '#45B7D1',
      'Lazer': '#96CEB4',
      'Receita': '#22C55E',
      'Educação': '#FFA726',
      'Moradia': '#AB47BC',
    };
    return colors[category] || '#95a5a6';
  };

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#22C55E" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Extrato</Text>
        <TouchableOpacity style={styles.exportButton}>
          <Ionicons name="download-outline" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Resumo */}
        <View style={styles.summaryContainer}>
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Saldo do Período</Text>
            <Text style={[
              styles.balanceValue,
              { color: balance >= 0 ? '#22C55E' : '#EF4444' }
            ]}>
              {formatCurrency(balance)}
            </Text>
          </View>

          <View style={styles.incomeExpenseRow}>
            <View style={styles.incomeExpenseItem}>
              <Ionicons name="arrow-up" size={16} color="#22C55E" />
              <Text style={styles.incomeExpenseLabel}>Receitas</Text>
              <Text style={[styles.incomeExpenseValue, { color: '#22C55E' }]}>
                {formatCurrency(totalIncome)}
              </Text>
            </View>

            <View style={styles.incomeExpenseItem}>
              <Ionicons name="arrow-down" size={16} color="#EF4444" />
              <Text style={styles.incomeExpenseLabel}>Despesas</Text>
              <Text style={[styles.incomeExpenseValue, { color: '#EF4444' }]}>
                {formatCurrency(totalExpenses)}
              </Text>
            </View>
          </View>
        </View>

        {/* Filtros */}
        <View style={styles.filtersContainer}>
          {/* Busca */}
          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={20} color="#666" />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar transações..."
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>

          {/* Tipo */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
            {[
              { key: 'all', label: 'Todos' },
              { key: 'income', label: 'Receitas' },
              { key: 'expense', label: 'Despesas' },
            ].map((item) => (
              <TouchableOpacity
                key={item.key}
                style={[
                  styles.filterButton,
                  filter === item.key && styles.filterButtonActive,
                ]}
                onPress={() => setFilter(item.key as any)}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    filter === item.key && styles.filterButtonTextActive,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Período */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.periodRow}>
            {[
              { key: 'today', label: 'Hoje' },
              { key: 'week', label: 'Semana' },
              { key: 'month', label: 'Mês' },
              { key: 'all', label: 'Todo Período' },
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
          </ScrollView>
        </View>

        {/* Lista */}
        <View style={styles.transactionsContainer}>
          <View style={styles.transactionsHeader}>
            <Text style={styles.transactionsTitle}>
              {filteredTransactions.length} Transações
            </Text>
          </View>

          {filteredTransactions.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="receipt-outline" size={64} color="#ddd" />
              <Text style={styles.emptyStateText}>Nenhuma transação encontrada</Text>
            </View>
          ) : (
            filteredTransactions.map((transaction) => (
              <View key={transaction.id} style={styles.transactionCard}>
                <View style={[
                  styles.transactionIcon,
                  { backgroundColor: getCategoryColor(transaction.category) + '20' }
                ]}>
                  <Ionicons
                    name={transaction.icon}
                    size={20}
                    color={getCategoryColor(transaction.category)}
                  />
                </View>

                <View style={styles.transactionInfo}>
                  <Text style={styles.transactionDescription}>
                    {transaction.description}
                  </Text>
                  <View style={styles.transactionMeta}>
                    <Text style={styles.transactionCategory}>{transaction.category}</Text>
                    <Text style={styles.transactionDate}>
                      {formatDate(transaction.createdAt)}
                    </Text>
                  </View>
                </View>

                <Text
                  style={[
                    styles.transactionAmount,
                    { color: transaction.type === 'income' ? '#22C55E' : '#EF4444' }
                  ]}
                >
                  {transaction.type === 'income' ? '+' : '-'}
                  {formatCurrency(transaction.amount)}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

// ------------------------- STYLES -------------------------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', paddingTop: 60 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  title: { fontSize: 24, fontWeight: 'bold', color: '#2c3e50' },
  exportButton: { padding: 8, backgroundColor: 'white', borderRadius: 8, elevation: 2 },

  summaryContainer: { paddingHorizontal: 20, marginBottom: 20 },
  balanceCard: { backgroundColor: 'white', padding: 20, borderRadius: 16, elevation: 2 },
  balanceLabel: { fontSize: 14, color: '#666' },
  balanceValue: { fontSize: 28, fontWeight: 'bold' },

  incomeExpenseRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  incomeExpenseItem: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
    elevation: 2,
    alignItems: 'center',
  },
  incomeExpenseLabel: { fontSize: 12, color: '#666' },
  incomeExpenseValue: { fontSize: 16, fontWeight: 'bold' },

  // Filters
  filtersContainer: { paddingHorizontal: 20, marginBottom: 20 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 2,
    marginBottom: 10,
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 16 },

  filterRow: { marginBottom: 8 },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'white',
    borderRadius: 20,
    marginRight: 8,
    elevation: 1,
  },
  filterButtonActive: { backgroundColor: '#22C55E' },
  filterButtonText: { color: '#666', fontWeight: '600' },
  filterButtonTextActive: { color: 'white' },

  periodRow: {},
  periodButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'white',
    borderRadius: 20,
    marginRight: 8,
    elevation: 1,
  },
  periodButtonActive: { backgroundColor: '#22C55E' },
  periodButtonText: { color: '#666', fontWeight: '600' },
  periodButtonTextActive: { color: 'white' },

  transactionsContainer: { paddingHorizontal: 20 },
  transactionsHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  transactionsTitle: { fontSize: 18, fontWeight: 'bold' },

  emptyState: { alignItems: 'center', padding: 40, backgroundColor: 'white', borderRadius: 12 },
  emptyStateText: { marginTop: 10, fontSize: 16, color: '#666' },

  transactionCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 2,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  transactionInfo: { flex: 1 },
  transactionDescription: { fontSize: 16, fontWeight: '600' },
  transactionMeta: { flexDirection: 'row', marginTop: 4 },
  transactionCategory: {
    marginRight: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: '#f1f3f4',
    borderRadius: 4,
    fontSize: 12,
    color: '#555',
  },
  transactionDate: { fontSize: 12, color: '#777' },

  transactionAmount: { fontSize: 16, fontWeight: 'bold' },
});
