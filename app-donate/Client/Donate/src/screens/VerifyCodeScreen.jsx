import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { verifyResetCode } from '../services/authService';
export default function VerifyCodeScreen({ route, navigation }) {
  const { email } = route.params;
  const [code, setCode] = useState('');

  const handleVerify = async () => {
    try {
      await verifyResetCode(email, code);

      Alert.alert(' Mã chính xác', 'Vui lòng đặt lại mật khẩu');
      navigation.navigate('ResetPassword', { email, code });
    } catch (error) {
      Alert.alert(' Mã không đúng', 'Mã xác nhận sai hoặc đã hết hạn');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nhập mã xác nhận</Text>

      <TextInput
        style={styles.input}
        placeholder="Mã xác nhận"
        keyboardType="numeric"
        value={code}
        onChangeText={setCode}
      />

      <Button title="Xác minh mã" onPress={handleVerify} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, marginBottom: 20, textAlign: 'center' },
  input: { borderBottomWidth: 1, marginBottom: 20, padding: 8 },
});
