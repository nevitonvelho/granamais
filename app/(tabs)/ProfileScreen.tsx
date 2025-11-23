import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Switch, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '../../firebase/firebaseConfig';
import { signOut } from 'firebase/auth';
import { router } from 'expo-router';

export default function ProfileScreen() {
  const [user, setUser] = useState({
    name: 'Neviton Velho',
    email: auth.currentUser?.email ?? '...',
    phone: '(11) 99999-9999',
    joinDate: '15/01/2023',
  });

  const [notifications, setNotifications] = useState(true);
  const [biometric, setBiometric] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const handleEditProfile = () => {
    Alert.alert('Editar Perfil', 'Funcionalidade em desenvolvimento');
  };

  const handleChangePhoto = () => {
    Alert.alert('Alterar Foto', 'Funcionalidade em desenvolvimento');
  };

  const menuItems = [
    {
      title: 'Conta',
      icon: 'person-outline',
      items: [
        { icon: 'lock-closed-outline', label: 'Segurança', onPress: () => Alert.alert('Segurança', 'Em desenvolvimento') },
        { icon: 'card-outline', label: 'Métodos de Pagamento', onPress: () => Alert.alert('Pagamentos', 'Em desenvolvimento') },
        { icon: 'shield-checkmark-outline', label: 'Privacidade', onPress: () => Alert.alert('Privacidade', 'Em desenvolvimento') },
      ]
    },
    {
      title: 'Preferências',
      icon: 'settings-outline',
      items: [
        { icon: 'notifications-outline', label: 'Notificações', type: 'switch', value: notifications, onValueChange: setNotifications },
        { icon: 'finger-print-outline', label: 'Biometria', type: 'switch', value: biometric, onValueChange: setBiometric },
        { icon: 'moon-outline', label: 'Modo Escuro', type: 'switch', value: darkMode, onValueChange: setDarkMode },
      ]
    },
    {
      title: 'Suporte',
      icon: 'help-circle-outline',
      items: [
        { icon: 'headset-outline', label: 'Central de Ajuda', onPress: () => Alert.alert('Ajuda', 'Em desenvolvimento') },
        { icon: 'document-text-outline', label: 'Termos de Uso', onPress: () => Alert.alert('Termos', 'Em desenvolvimento') },
        { icon: 'shield-checkmark-outline', label: 'Política de Privacidade', onPress: () => Alert.alert('Privacidade', 'Em desenvolvimento') },
      ]
    }
  ];

  const stats = [
    { label: 'Transações', value: '142', icon: 'receipt-outline' },
    { label: 'Categorias', value: '8', icon: 'pricetags-outline' },
    { label: 'Meses', value: '12', icon: 'calendar-outline' },
  ];

  const quickActions = [
    { icon: 'share-social-outline', label: 'Indicar Amigos', onPress: () => Alert.alert('Indicar', 'Em desenvolvimento') },
    { icon: 'star-outline', label: 'Avaliar App', onPress: () => Alert.alert('Avaliar', 'Em desenvolvimento') },
    { 
      icon: 'log-out-outline',
      label: 'Sair',
      onPress: () => {
        Alert.alert('Sair', 'Tem certeza que deseja sair?', [
          { text: 'Cancelar', style: 'cancel' },
          { 
            text: 'Sair',
            style: 'destructive',
            onPress: async () => {
              await signOut(auth);
              router.replace('/(auth)/login');
            }
          }
        ])
      }
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Perfil</Text>
        <TouchableOpacity style={styles.settingsButton} onPress={handleEditProfile}>
          <Ionicons name="settings-outline" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* Perfil */}
        <View style={styles.profileSection}>
          <TouchableOpacity style={styles.avatarContainer} onPress={handleChangePhoto}>
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={40} color="#666" />
            </View>
            <View style={styles.cameraBadge}>
              <Ionicons name="camera" size={16} color="white" />
            </View>
          </TouchableOpacity>

          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          <Text style={styles.joinDate}>Membro desde {user.joinDate}</Text>

          <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
            <Ionicons name="create-outline" size={16} color="#22C55E" />
            <Text style={styles.editButtonText}>Editar Perfil</Text>
          </TouchableOpacity>
        </View>

        {/* Estatísticas */}
        <View style={styles.statsContainer}>
          {stats.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <View style={styles.statIcon}>
                <Ionicons name={stat.icon} size={20} color="#22C55E" />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Menu */}
        <View style={styles.menuContainer}>
          {menuItems.map((section, sectionIndex) => (
            <View key={sectionIndex} style={styles.menuSection}>
              <View style={styles.sectionHeader}>
                <Ionicons name={section.icon} size={20} color="#666" />
                <Text style={styles.sectionTitle}>{section.title}</Text>
              </View>

              <View style={styles.sectionItems}>
                {section.items.map((item, itemIndex) => (
                  <TouchableOpacity
                    key={itemIndex}
                    style={styles.menuItem}
                    onPress={item.onPress}
                    disabled={item.type === 'switch'}
                  >
                    <View style={styles.menuItemLeft}>
                      <Ionicons name={item.icon} size={22} color="#666" />
                      <Text style={styles.menuItemText}>{item.label}</Text>
                    </View>

                    {item.type === 'switch' ? (
                      <Switch
                        value={item.value}
                        onValueChange={item.onValueChange}
                        trackColor={{ false: '#f1f3f4', true: '#22C55E' }}
                        thumbColor={item.value ? 'white' : '#f4f3f4'}
                      />
                    ) : (
                      <Ionicons name="chevron-forward" size={20} color="#ccc" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
        </View>

        {/* Ações Rápidas */}
        <View style={styles.quickActions}>
          {quickActions.map((action, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.quickActionButton}
              onPress={action.onPress}
            >
              <Ionicons 
                name={action.icon}
                size={20} 
                color={action.label === 'Sair' ? '#EF4444' : '#666'} 
              />
              <Text style={[
                styles.quickActionText,
                action.label === 'Sair' && { color: '#EF4444' }
              ]}>
                {action.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Grana+ v1.0.0</Text>
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
  settingsButton: {
    padding: 8,
    backgroundColor: 'white',
    borderRadius: 8,
    elevation: 2,
  },
  profileSection: {
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 20,
    paddingVertical: 30,
    borderRadius: 20,
    elevation: 2,
    marginBottom: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f1f3f4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#22C55E',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  joinDate: {
    fontSize: 14,
    color: '#999',
    marginBottom: 20,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#22C55E',
  },
  editButtonText: {
    color: '#22C55E',
    fontWeight: '600',
    marginLeft: 6,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
    alignItems: 'center',
    elevation: 2,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F5E8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  menuContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  menuSection: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 16,
    elevation: 2,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginLeft: 12,
  },
  sectionItems: {
    paddingVertical: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemText: {
    fontSize: 16,
    color: '#2c3e50',
    marginLeft: 12,
    flex: 1,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  quickActionButton: {
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    minWidth: 100,
  },
  quickActionText: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  versionText: {
    fontSize: 14,
    color: '#999',
  },
});