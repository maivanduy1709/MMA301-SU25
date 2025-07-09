// screens/TransactionHistory.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Platform,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTransactions = async () => {
    try {
      const apiUrl =
        Platform.OS === 'android'
          ? 'http://10.0.2.2:3001/api/transactions'
          : 'http://localhost:3001/api/transactions';

      const response = await fetch(apiUrl);
      const result = await response.json();

      if (result.success) {
        setTransactions(result.data);
      } else {
        console.warn('Không thể lấy danh sách giao dịch.');
      }
    } catch (error) {
      console.error('Lỗi lấy giao dịch:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTransactions();
  };

  const renderItem = ({ item }) => {
    const raw = item.raw || {};
    return (
      <View style={styles.card}>
        <Text style={styles.amount}>💰 {raw.transferAmount?.toLocaleString()} VND</Text>
        <Text style={styles.label}>👤 Người gửi: {raw.description || 'Không rõ'}</Text>
        <Text style={styles.label}>🏦 Ngân hàng: {raw.gateway}</Text>
        <Text style={styles.label}>📄 Mã giao dịch: {raw.referenceCode}</Text>
        <Text style={styles.label}>📝 Nội dung: {raw.content}</Text>
        <Text style={styles.label}>🕒 Thời gian: {raw.transactionDate}</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text>Đang tải giao dịch...</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={transactions}
      keyExtractor={(item) => item._id}
      renderItem={renderItem}
      contentContainerStyle={styles.list}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      ListEmptyComponent={
        <Text style={{ textAlign: 'center', marginTop: 20 }}>
          Không có giao dịch nào.
        </Text>
      }
    />
  );
};

const styles = StyleSheet.create({
  list: {
    padding: 15,
    backgroundColor: '#F5F5F5',
  },
  card: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    elevation: 2,
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 5,
  },
  label: {
    fontSize: 14,
    color: '#333',
    marginBottom: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default TransactionHistory;
