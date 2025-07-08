import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation, CommonActions } from '@react-navigation/native';

export default function HomeScreen() {
  const { user, logout } = useAuth();
  const navigation = useNavigation();

  const handleLogout = async () => {
    await logout(); // xóa user khỏi context và AsyncStorage

    // Reset navigation stack để quay về Login
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      }),
    );
  };

  return (
    <View style={styles.container}>
      <Text>Xin chào, {user?.email || 'người dùng'}</Text>
      <Button title="Đăng xuất" onPress={handleLogout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 24 },
});
