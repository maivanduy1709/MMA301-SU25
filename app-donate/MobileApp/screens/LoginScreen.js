import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { login } from '../services/authService';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');   

  const handleLogin = async () => {
    // Add validation
    if (!email || !password) {
      Alert.alert('❌ Lỗi', 'Vui lòng nhập đầy đủ email và mật khẩu');
      return;
    }

    try {
      const data = await login(email, password);
      if (data.token) {
        Alert.alert('✅ Thành công', 'Đăng nhập thành công');
        navigation.navigate('Home');
      } else {
        Alert.alert('❌ Lỗi', 'Đăng nhập thất bại');
      }
    } catch (err) {
      const errorMessage = err?.response?.data?.message || 'Lỗi đăng nhập. Vui lòng kiểm tra lại thông tin.';
      Alert.alert('❌ Lỗi', errorMessage);
      console.log('Login error:', err);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đăng nhập</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Mật khẩu"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Button title="Đăng nhập" onPress={handleLogin} />

      <Text
        style={styles.forgotPassword}
        onPress={() => navigation.navigate('ForgotPassword')}
      >
        Quên mật khẩu?
      </Text>

      <Text style={styles.link} onPress={() => navigation.navigate('Register')}>
        Chưa có tài khoản? Đăng ký
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  forgotPassword: {
    marginTop: 15,
    color: 'blue',
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  title: { fontSize: 24, marginBottom: 20, textAlign: 'center' },
  input: { borderBottomWidth: 1, marginBottom: 10, padding: 8 },
  link: { marginTop: 20, color: 'blue', textAlign: 'center' },
});