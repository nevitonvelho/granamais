import { Stack } from 'expo-router';

export default function AddTransactionLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{
          title: 'Nova Transação',
          headerShown: true,
          headerStyle: {
            backgroundColor: '#22C55E',
          },
          headerTintColor: 'white',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }} 
      />
    </Stack>
  );
}