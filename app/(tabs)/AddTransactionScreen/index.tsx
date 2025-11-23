// app/(tabs)/AddTransactionScreen/index.tsx
import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import {
  collection, addDoc, doc, getDoc, updateDoc, serverTimestamp
} from 'firebase/firestore';
import { db, auth } from '../../../firebase/firebaseConfig';

export default function AddTransactionScreen() {
  const { editId } = useLocalSearchParams() as { editId?: string };

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [loading, setLoading] = useState(false);

  const categories = [
    'Alimentação', 'Transporte', 'Saúde', 'Lazer', 'Educação', 'Moradia', 'Outros'
  ];

  useEffect(() => {
    // se vier editId, carrega a transação
    const load = async () => {
      if (!editId) return;
      setLoading(true);
      try {
        const user = auth.currentUser;
        if (!user) {
          Alert.alert('Erro', 'Usuário não autenticado');
          router.replace('/(auth)/login');
          return;
        }
        const ref = doc(db, 'users', user.uid, 'transactions', String(editId));
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          setDescription(data.description || '');
          setAmount(String(data.amount ?? ''));
          setCategory(data.category || '');
          setType(data.type || 'expense');
        } else {
          Alert.alert('Erro', 'Transação não encontrada');
          router.back();
        }
      } catch (error) {
        console.log('load edit error', error);
        Alert.alert('Erro', 'Não foi possível carregar a transação');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [editId]);

  const handleSave = async () => {
    if (!description || !amount) {
      Alert.alert('Erro', 'Preencha descrição e valor');
      return;
    }

    const parsedAmount = Number(amount.toString().replace(',', '.'));
    if (isNaN(parsedAmount)) {
      Alert.alert('Erro', 'Valor inválido');
      return;
    }

    try {
      setLoading(true);
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('Erro', 'Usuário não autenticado');
        router.replace('/(auth)/login');
        return;
      }

      if (editId) {
        // atualizar existente
        await updateDoc(doc(db, 'users', user.uid, 'transactions', String(editId)), {
          description,
          amount: parsedAmount,
          category,
          type,
          updatedAt: serverTimestamp()
        });
        Alert.alert('Atualizado', 'Transação atualizada com sucesso');
        router.back();
        return;
      }

      // criar nova transação
      await addDoc(collection(db, 'users', user.uid, 'transactions'), {
        description,
        amount: parsedAmount,
        category,
        type,
        createdAt: serverTimestamp()
      });

      Alert.alert('Sucesso', 'Transação adicionada');
      router.back();
    } catch (error) {
      console.log('save transaction error', error);
      Alert.alert('Erro', 'Não foi possível salvar a transação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.form}>
        <View style={styles.typeContainer}>
          <TouchableOpacity
            style={[styles.typeButton, type === 'expense' && styles.typeButtonActive]}
            onPress={() => setType('expense')}
          >
            <Ionicons name="arrow-down" size={20} color={type === 'expense' ? 'white' : '#666'} />
            <Text style={[styles.typeButtonText, type === 'expense' && styles.typeButtonTextActive]}>Despesa</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.typeButton, type === 'income' && styles.typeButtonActive]}
            onPress={() => setType('income')}
          >
            <Ionicons name="arrow-up" size={20} color={type === 'income' ? 'white' : '#666'} />
            <Text style={[styles.typeButtonText, type === 'income' && styles.typeButtonTextActive]}>Receita</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Descrição *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Almoço, Venda, Salário..."
            value={description}
            onChangeText={setDescription}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Valor *</Text>
          <TextInput
            style={styles.input}
            placeholder="0.00"
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Categoria</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryButton, category === cat && styles.categoryButtonActive]}
                onPress={() => setCategory(cat)}
              >
                <Text style={[styles.categoryButtonText, category === cat && styles.categoryButtonTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading}>
          <Text style={styles.saveButtonText}>{editId ? 'Atualizar Transação' : 'Salvar Transação'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  form: { padding: 20 },

  typeContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 4,
  },
  typeButton: {
    flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: 8,
  },
  typeButtonActive: { backgroundColor: '#22C55E' },
  typeButtonText: { marginLeft: 8, fontSize: 16, fontWeight: '600', color: '#666' },
  typeButtonTextActive: { color: 'white' },

  inputGroup: { marginBottom: 16 },
  label: { fontSize: 16, fontWeight: '600', color: '#2c3e50', marginBottom: 8 },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e1e8e9',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
  },

  categoryButton: {
    backgroundColor: 'white',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e1e8e9',
  },
  categoryButtonActive: { backgroundColor: '#22C55E', borderColor: '#22C55E' },
  categoryButtonText: { color: '#666', fontWeight: '500' },
  categoryButtonTextActive: { color: 'white' },

  saveButton: {
    backgroundColor: '#22C55E',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  saveButtonText: { color: 'white', fontSize: 16, fontWeight: '700' },
});
