import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { resetPassword } from '../services/authService';
export default function ResetPasswordScreen({ route, navigation }) {
  const { email } = route.params;
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleReset = async () => {
    if (!newPassword || !confirmPassword) {
      return Alert.alert(' Lỗi', 'Vui lòng nhập đầy đủ thông tin');
    }

    if (newPassword !== confirmPassword) {
      return Alert.alert(' Lỗi', 'Mật khẩu không trùng khớp');
    }

    try {
      await resetPassword(email, newPassword);

      Alert.alert(' Thành công', 'Mật khẩu đã được đặt lại');
      navigation.navigate('Login');
    } catch (error) {
      Alert.alert(' Lỗi', 'Không thể đặt lại mật khẩu');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đặt lại mật khẩu</Text>

      <TextInput
        style={styles.input}
        placeholder="Mật khẩu mới"
        secureTextEntry
        value={newPassword}
        onChangeText={setNewPassword}
      />
      <TextInput
        style={styles.input}
        placeholder="Xác nhận mật khẩu"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      <Button title="Xác nhận" onPress={handleReset} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, marginBottom: 20, textAlign: 'center' },
  input: { borderBottomWidth: 1, marginBottom: 15, padding: 8 },
});