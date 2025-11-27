import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase/firebaseConfig";
import { router } from "expo-router";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function login() {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.replace("/(tabs)/DashboardScreen");
    } catch (error) {
      alert(error.message);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Entrar</Text>

      <TextInput 
        placeholder="Email"
        style={styles.input}
        onChangeText={setEmail}
        value={email}
      />

      <TextInput 
        placeholder="Senha"
        secureTextEntry
        style={styles.input}
        onChangeText={setPassword}
        value={password}
      />

      <TouchableOpacity style={styles.button} onPress={login}>
        <Text style={styles.buttonText}>Entrar</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
        <Text style={styles.link}>Criar conta</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: "center", 
    padding: 20 
  },
  title: { 
    fontSize: 26, 
    fontWeight: "bold", 
    marginBottom: 20 
  },
  input: { 
    backgroundColor: "#eee", 
    padding: 12, 
    borderRadius: 8, 
    marginVertical: 8 
  },
  button: { 
    backgroundColor: "#22C55E", 
    padding: 14, borderRadius: 8, 
    marginVertical: 12 
  },
  buttonText: { color: "white", fontSize: 16, textAlign: "center", fontWeight: "600" },
  link: { color: "#22C55E", textAlign: "center" }
});
