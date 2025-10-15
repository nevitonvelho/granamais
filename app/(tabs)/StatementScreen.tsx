import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const transactionsData = [
  {
    id: '1',
    description: 'Mercado',
    amount: -150.75,
    category: 'Alimentação',
    date: '2024-01-15',
    type: 'expense',
    icon: 'cart-outline'
  },
  {
    id: '2',
    description: 'Salário',
    amount: 2500.00,
    category: 'Receita',
    date: '2024-01-10',
    type: 'income',
    icon: 'card-outline'
  },
  {
    id: '3',
    description: 'Uber',
    amount: -25.50,
    category: 'Transporte',
    date: '2024-01-14',
    type: 'expense',
    icon: 'car-outline'
  },
  {
    id: '4',
    description: 'Academia',
    amount: -89.90,
    category: 'Saúde',
    date: '2024-01-12',
    type: 'expense',
    icon: 'fitness-outline'
  },
  {
    id: '5',
    description: 'Restaurante',
    amount: -85.00,
    category: 'Alimentação',
    date: '2024-01-11',
    type: 'expense',
    icon: 'restaurant-outline'
  },
  {
    id: '6',
    description: 'Freelance',
    amount: 500.00,
    category: 'Receita',
    date: '2024-01-08',
    type: 'income',
    icon: 'laptop-outline'
  },
  {
    id: '7',
    description: 'Cinema',
    amount: -45.00,
    category: 'Lazer',
    date: '2024-01-05',
    type: 'expense',
    icon: 'film-outline'
  },
];

export default function StatementScreen() {
  const [searchText, setSearchText] = useState('');
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month' | 'all'>('month');

  const filteredTransactions = transactionsData.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchText.toLowerCase()) ||
                         transaction.category.toLowerCase().includes(searchText.toLowerCase());
    const matchesFilter = filter === 'all' || 
                         (filter === 'income' && transaction.amount > 0) ||
                         (filter === 'expense' && transaction.amount < 0);
    
    return matchesSearch && matchesFilter;
  });

  const totalIncome = filteredTransactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = filteredTransactions
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const balance = totalIncome - totalExpenses;

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Extrato</Text>
        <TouchableOpacity style={styles.exportButton}>
          <Ionicons name="download-outline" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.summaryContainer}>
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Saldo do Período</Text>
            <Text style={[styles.balanceValue, { color: balance >= 0 ? '#22C55E' : '#EF4444' }]}>
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

        <View style={styles.filtersContainer}>
          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={20} color="#666" />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar transações..."
              value={searchText}
              onChangeText={setSearchText}
            />
            {searchText.length > 0 && (
              <TouchableOpacity onPress={() => setSearchText('')}>
                <Ionicons name="close-circle" size={20} color="#666" />
              </TouchableOpacity>
            )}
          </View>

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

        <View style={styles.transactionsContainer}>
          <View style={styles.transactionsHeader}>
            <Text style={styles.transactionsTitle}>
              {filteredTransactions.length} Transações
            </Text>
            <TouchableOpacity style={styles.sortButton}>
              <Ionicons name="filter" size={16} color="#666" />
              <Text style={styles.sortButtonText}>Ordenar</Text>
            </TouchableOpacity>
          </View>

          {filteredTransactions.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="receipt-outline" size={64} color="#ddd" />
              <Text style={styles.emptyStateText}>Nenhuma transação encontrada</Text>
              <Text style={styles.emptyStateSubtext}>
                Tente ajustar os filtros ou buscar por outros termos
              </Text>
            </View>
          ) : (
            filteredTransactions.map((transaction) => (
              <View key={transaction.id} style={styles.transactionCard}>
                <View style={[
                  styles.transactionIcon,
                  { backgroundColor: getCategoryColor(transaction.category) + '20' }
                ]}>
                  <Ionicons 
                    name={transaction.icon as any} 
                    size={20} 
                    color={getCategoryColor(transaction.category)} 
                  />
                </View>
                
                <View style={styles.transactionInfo}>
                  <Text style={styles.transactionDescription}>
                    {transaction.description}
                  </Text>
                  <View style={styles.transactionMeta}>
                    <Text style={styles.transactionCategory}>
                      {transaction.category}
                    </Text>
                    <Text style={styles.transactionDate}>
                      {formatDate(transaction.date)}
                    </Text>
                  </View>
                </View>
                
                <Text 
                  style={[
                    styles.transactionAmount,
                    { color: transaction.amount > 0 ? '#22C55E' : '#EF4444' }
                  ]}
                >
                  {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                </Text>
              </View>
            ))
          )}
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
  exportButton: {
    padding: 8,
    backgroundColor: 'white',
    borderRadius: 8,
    elevation: 2,
  },
  summaryContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  balanceCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    elevation: 2,
    marginBottom: 12,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  balanceValue: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  incomeExpenseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  incomeExpenseItem: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
    elevation: 2,
    alignItems: 'center',
  },
  incomeExpenseLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    marginBottom: 2,
  },
  incomeExpenseValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  filtersContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    marginRight: 8,
    fontSize: 16,
  },
  filterRow: {
    marginBottom: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'white',
    borderRadius: 20,
    marginRight: 8,
    elevation: 1,
  },
  filterButtonActive: {
    backgroundColor: '#22C55E',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  filterButtonTextActive: {
    color: 'white',
  },
  periodRow: {
    marginBottom: 8,
  },
  periodButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'white',
    borderRadius: 20,
    marginRight: 8,
    elevation: 1,
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
  transactionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  transactionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  transactionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    elevation: 1,
  },
  sortButtonText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    backgroundColor: 'white',
    borderRadius: 16,
    elevation: 2,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    elevation: 1,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  transactionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionCategory: {
    fontSize: 12,
    color: '#666',
    marginRight: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: '#f1f3f4',
    borderRadius: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: '#999',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});