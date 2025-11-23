import { useAuth } from '../context/AuthContext';
import { Redirect } from 'expo-router';

export default function Index() {
  const { user, loading } = useAuth();

  if (loading) return null; // evita bug piscando tela

  return user
    ? <Redirect href="/(tabs)/DashboardScreen" />
    : <Redirect href="/(auth)/login" />;
}
