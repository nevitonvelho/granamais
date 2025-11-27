import { Tabs, Redirect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../context/AuthContext';

export default function TabLayout() {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#22C55E',
        tabBarInactiveTintColor: '#95a5a6',
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: '#ecf0f1',
          height: 85,
          paddingBottom: 20,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: 4,
          marginBottom: 4,
        },
        tabBarItemStyle: {
          paddingVertical: 6,
        },
      }}
    >

      {/* INÍCIO */}
      <Tabs.Screen
        name="DashboardScreen"
        options={{
          title: 'Início',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />

      {/* GRÁFICOS */}
      <Tabs.Screen
        name="ChartsScreen"
        options={{
          title: 'Gráficos',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "bar-chart" : "bar-chart-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />

      {/* BOTÃO CENTRAL */}
      <Tabs.Screen
        name="AddTransactionScreen"
        options={{
          title: '',
          tabBarButton: () => (
            <View style={styles.fabWrapper}>
              <TouchableOpacity
                style={styles.fabButton}
                onPress={() => router.push('/(tabs)/AddTransactionScreen')}
              >
                <Ionicons name="add" size={32} color="white" />
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      {/* EXTRATO */}
      <Tabs.Screen
        name="StatementScreen"
        options={{
          title: 'Extrato',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "list" : "list-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />

      {/* PERFIL */}
      <Tabs.Screen
        name="ProfileScreen"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}


const styles = StyleSheet.create({
  fabWrapper: {
    position: 'absolute',
    top: -25,
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },

  fabButton: {
    backgroundColor: '#22C55E',
    width: 62,
    height: 62,
    borderRadius: 31,
    justifyContent: 'center',
    alignItems: 'center',

    borderWidth: 3,
    borderColor: 'white',

    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 10,
  },
});
