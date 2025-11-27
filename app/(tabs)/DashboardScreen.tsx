// app/(tabs)/DashboardScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, Image, FlatList, ScrollView,
  TouchableOpacity, ActivityIndicator, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  collection, query, orderBy, onSnapshot, deleteDoc, doc
} from 'firebase/firestore';
import { db, auth } from '../../firebase/firebaseConfig';
import { router } from 'expo-router';

export default function DashboardScreen() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState<number>(0);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      router.replace('/(auth)/login');
      return;
    }

    const q = query(
      collection(db, 'users', user.uid, 'transactions'),
      orderBy('createdAt', 'desc')
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const items: any[] = [];
      snapshot.forEach((d) => {
        const data = d.data();
        items.push({
          id: d.id,
          description: data.description,
          amount: data.amount,
          category: data.category,
          type: data.type,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date()
        });
      });

      setTransactions(items);

      const totalIncome = items
        .filter((i) => i.type === 'income')
        .reduce((s, i) => s + Number(i.amount || 0), 0);

      const totalExpense = items
        .filter((i) => i.type === 'expense')
        .reduce((s, i) => s + Number(i.amount || 0), 0);

      setBalance(totalIncome - totalExpense);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  // Agrupar despesas por categoria
  const expensesByCategory: Record<string, number> = {};
  const totalExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => {
      const cat = t.category || 'Outros';
      expensesByCategory[cat] = (expensesByCategory[cat] || 0) + Number(t.amount || 0);
      return sum + Number(t.amount || 0);
    }, 0);

  const categoryColors: { [key: string]: string } = {
    'Alimentação': '#4ECDC4',
    'Transporte': '#45B7D1',
    'Saúde': '#FF6B6B',
    'Lazer': '#96CEB4',
    'Educação': '#FFA726',
    'Moradia': '#AB47BC',
    'Outros': '#95a5a6',
  };

  const iconByCategory: { [key: string]: string } = {
    'Saúde': 'medkit-outline',
    'Alimentação': 'restaurant-outline',
    'Transporte': 'car-outline',
    'Lazer': 'game-controller-outline',
    'Educação': 'school-outline',
    'Moradia': 'home-outline',
    'Outros': 'card-outline',
    'Receita': 'cash-outline',
  };

  const deleteTransaction = async (id: string) => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      await deleteDoc(doc(db, 'users', user.uid, 'transactions', id));
      Alert.alert('Removida', 'Transação excluída com sucesso.');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível excluir.');
    }
  };

  const handleLongPress = (item: any) => {
    Alert.alert(
      'O que deseja fazer?',
      item.description,
      [
        {
          text: 'Editar',
          onPress: () =>
            router.push({
              pathname: '/(tabs)/AddTransactionScreen',
              params: { editId: item.id },
            }),
        },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () =>
            Alert.alert('Confirmar exclusão', 'Deseja realmente excluir?', [
              { text: 'Cancelar', style: 'cancel' },
              { text: 'Excluir', onPress: () => deleteTransaction(item.id) },
            ]),
        },
        { text: 'Cancelar', style: 'cancel' },
      ]
    );
  };

  const renderTransactionItem = ({ item }: { item: any }) => {
    const color = categoryColors[item.category] || '#95a5a6';
    const icon = iconByCategory[item.category] || 'card-outline';

    return (
      <TouchableOpacity onLongPress={() => handleLongPress(item)} delayLongPress={300}>
        <View style={styles.transactionCard}>
          <View style={[styles.transactionIcon, { backgroundColor: color + '20' }]}>
            <Ionicons name={icon as any} size={20} color={color} />
          </View>

          <View style={styles.transactionInfo}>
            <Text style={styles.transactionTitle}>{item.description}</Text>
            <Text style={styles.transactionPercent}>
              {item.category} • {item.createdAt.toLocaleDateString('pt-BR')}
            </Text>
          </View>

          <Text
            style={[
              styles.transactionValue,
              { color: item.type === 'income' ? '#22C55E' : '#EF4444' },
            ]}
          >
            {(item.type === 'expense' ? '-' : '') +
              Number(item.amount).toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const quickActions = [
    { id: '1', title: 'Adicionar', icon: 'add-circle-outline', color: '#22C55E', onPress: () => router.push('/(tabs)/AddTransactionScreen') },
  ];

  return (
    <View style={styles.container}>

      {/* HEADER SIMPLES COM LOGO CENTRAL */}
      <View style={styles.header}>
        <Image
          source={require('../../assets/images/logo2.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* SALDO */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Saldo Disponível</Text>
          {loading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.balanceValue}>
              {balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </Text>
          )}
          <View style={styles.balanceFooter}>
            <Text style={styles.balanceFooterText}>Resumo atualizado em tempo real</Text>
          </View>
        </View>

        {/* AÇÕES RÁPIDAS */}
        <Text style={styles.sectionTitle}>Ações Rápidas</Text>
        <FlatList
          data={quickActions}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.quickActionItem} onPress={item.onPress}>
              <View style={[styles.quickActionIcon, { backgroundColor: item.color }]}>
                <Ionicons name={item.icon as any} size={24} color="white" />
              </View>
              <Text style={styles.quickActionText}>{item.title}</Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.quickActionsContent}
        />

        {/* PRINCIPAIS DESPESAS */}
        <View style={styles.topExpensesCard}>
          <Text style={styles.topExpensesTitle}>Principais Despesas</Text>

          {Object.keys(expensesByCategory).length === 0 ? (
            <Text style={{ color: '#999', marginTop: 10 }}>Nenhuma despesa registrada</Text>
          ) : (
            Object.entries(expensesByCategory)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 4)
              .map(([cat, value]) => {
                const percent = totalExpenses > 0 ? Math.round((value / totalExpenses) * 100) : 0;
                const color = categoryColors[cat] || '#999';

                return (
                  <View key={cat} style={styles.expenseRow}>
                    <View style={styles.expenseRowHeader}>
                      <Text style={styles.expenseLabel}>{cat}</Text>
                      <Text style={styles.expenseValue}>
                        {value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </Text>
                    </View>

                    <View style={styles.expenseBarBackground}>
                      <View style={[styles.expenseBarFill, { width: `${percent}%`, backgroundColor: color }]} />
                    </View>

                    <Text style={styles.expensePercent}>{percent}%</Text>
                  </View>
                );
              })
          )}
        </View>

        {/* LISTA DE TRANSACOES */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Últimas Movimentações</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/StatementScreen')}>
            <Text style={styles.seeAllText}>Ver tudo</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#22C55E" style={{ marginTop: 20 }} />
        ) : (
          <FlatList
            data={transactions}
            scrollEnabled={false}
            keyExtractor={(item) => item.id}
            renderItem={renderTransactionItem}
            contentContainerStyle={{ paddingHorizontal: 15 }}
            ListEmptyComponent={() => (
              <View style={[styles.transactionCard, { justifyContent: 'center' }]}>
                <Text style={{ color: '#999' }}>Nenhuma transação encontrada</Text>
              </View>
            )}
          />
        )}
      </ScrollView>
    </View>
  );
}

// ESTILOS
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },

  header: {
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 10,
    backgroundColor: '#fff',
  },

  logo: {
    width: 180,
    height: 55,
  },

  balanceCard: {
    backgroundColor: '#22C55E',
    margin: 20,
    borderRadius: 20,
    padding: 25,
  },

  balanceLabel: { color: 'white', fontSize: 16 },

  balanceValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginVertical: 10,
  },

  balanceFooterText: { color: 'white', fontSize: 14, opacity: 0.95 },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2c3e50',
    marginTop: 10,
    marginBottom: 10,
    paddingHorizontal: 20,
  },

  seeAllText: { color: '#22C55E', fontWeight: '600' },

  quickActionsContent: { paddingLeft: 20, paddingRight: 20 },

  quickActionItem: { alignItems: 'center', marginHorizontal: 10 },

  quickActionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },

  quickActionText: { fontSize: 12, color: '#2c3e50' },

  topExpensesCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 16,
    marginBottom: 25,
  },

  topExpensesTitle: { fontSize: 18, fontWeight: '700', marginBottom: 15 },

  expenseRow: { marginBottom: 18 },

  expenseRowHeader: { flexDirection: 'row', justifyContent: 'space-between' },

  expenseLabel: { fontSize: 14, fontWeight: '600' },

  expenseValue: { fontSize: 14, fontWeight: '600', color: '#EF4444' },

  expenseBarBackground: {
    width: '100%',
    height: 10,
    backgroundColor: '#e5e5e5',
    borderRadius: 6,
    marginTop: 5,
    overflow: 'hidden',
  },

  expenseBarFill: { height: '100%', borderRadius: 6 },

  expensePercent: { marginTop: 4, fontSize: 12, color: '#777' },

  transactionCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
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

  transactionTitle: { fontSize: 16, fontWeight: '600' },

  transactionPercent: { fontSize: 14, color: '#7f8c8d' },

  transactionValue: { fontSize: 16, fontWeight: '700' },
});
