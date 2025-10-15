import React from 'react';
import { View, Text, StyleSheet, Image, FlatList, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native-gesture-handler';

const transactions = [
  { id: '1', title: 'Saúde', percent: '50%', value: 'R$ 50.00', color: '#FF6B6B', icon: 'medkit-outline' },
  { id: '2', title: 'Alimentação', percent: '30%', value: 'R$ 30.00', color: '#4ECDC4', icon: 'restaurant-outline' },
  { id: '3', title: 'Transporte', percent: '15%', value: 'R$ 15.00', color: '#45B7D1', icon: 'car-outline' },
  { id: '4', title: 'Lazer', percent: '5%', value: 'R$ 5.00', color: '#96CEB4', icon: 'game-controller-outline' },
];

const quickActions = [
  { id: '1', title: 'Adicionar', icon: 'add-circle-outline', color: '#2ecc71' },
  { id: '2', title: 'Transferir', icon: 'swap-horizontal-outline', color: '#3498db' },
  { id: '3', title: 'Pagar', icon: 'card-outline', color: '#e74c3c' },
  { id: '4', title: 'Investir', icon: 'trending-up-outline', color: '#f39c12' },
];

export default function DashboardScreen() {
  const renderTransactionItem = ({ item }) => (
    <View style={styles.transactionCard}>
      <View style={[styles.transactionIcon, { backgroundColor: item.color + '20' }]}>
        <Ionicons name={item.icon} size={20} color={item.color} />
      </View>
      <View style={styles.transactionInfo}>
        <Text style={styles.transactionTitle}>{item.title}</Text>
        <Text style={styles.transactionPercent}>{item.percent}</Text>
      </View>
      <Text style={styles.transactionValue}>{item.value}</Text>
    </View>
  );

  const renderQuickAction = ({ item }) => (
    <TouchableOpacity style={styles.quickActionItem}>
      <View style={[styles.quickActionIcon, { backgroundColor: item.color }]}>
        <Ionicons name={item.icon} size={24} color="white" />
      </View>
      <Text style={styles.quickActionText}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <Image
          source={require('../../assets/images/logo2.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <TouchableOpacity style={styles.notificationButton}>
          <Ionicons name="notifications-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        {/* Card de saldo */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Saldo Disponível</Text>
          <Text style={styles.balanceValue}>R$ 2.500,00</Text>
          <View style={styles.balanceFooter}>
            <Text style={styles.balanceFooterText}>+ R$ 350,00 este mês</Text>
          </View>
        </View>

        {/* Ações rápidas */}
        <Text style={styles.sectionTitle}>Ações Rápidas</Text>
        <FlatList
          data={quickActions}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          renderItem={renderQuickAction}
          style={styles.quickActionsList}
          contentContainerStyle={styles.quickActionsContent}
        />

        {/* Gráfico circular */}
        <View style={styles.circleContainer}>
          <View style={styles.circle}>
            <Text style={styles.circleText}>R$ 100</Text>
            <Text style={styles.circleSubtext}>Restante</Text>
          </View>
          <View style={styles.circleLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#FF6B6B' }]} />
              <Text style={styles.legendText}>Saúde</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#4ECDC4' }]} />
              <Text style={styles.legendText}>Alimentação</Text>
            </View>
          </View>
        </View>

        {/* Lista de movimentações */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Últimas Movimentações</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>Ver tudo</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={transactions}
          scrollEnabled={false}
          keyExtractor={(item) => item.id}
          renderItem={renderTransactionItem}
          style={styles.transactionsList}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: '#fff',
  },
  logo: {
    width: 205,
    height: 50,
  },
  notificationButton: {
    padding: 5,
  },
  balanceCard: {
    backgroundColor: '#2ecc71',
    margin: 20,
    borderRadius: 20,
    padding: 25,
    shadowColor: '#2ecc71',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  balanceLabel: {
    color: 'white',
    fontSize: 16,
    opacity: 0.9,
    marginBottom: 5,
  },
  balanceValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  balanceFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  balanceFooterText: {
    color: 'white',
    fontSize: 14,
    opacity: 0.9,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2c3e50',
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 10,
  },
  seeAllText: {
    color: '#2ecc71',
    fontWeight: '600',
  },
  quickActionsList: {
    marginBottom: 25,
  },
  quickActionsContent: {
    paddingHorizontal: 15,
  },
  quickActionItem: {
    alignItems: 'center',
    marginHorizontal: 10,
  },
  quickActionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    color: '#2c3e50',
    fontWeight: '500',
  },
  circleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 25,
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  circle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 12,
    borderColor: '#2ecc71',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2ecc71',
  },
  circleSubtext: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 4,
  },
  circleLegend: {
    flex: 1,
    marginLeft: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    color: '#2c3e50',
  },
  transactionsList: {
    paddingHorizontal: 15,
    marginBottom: 20, // Adiciona espaço na parte inferior
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
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
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 2,
  },
  transactionPercent: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  transactionValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
});