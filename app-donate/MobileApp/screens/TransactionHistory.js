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
  TouchableOpacity,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const API_BASE_URL = __DEV__
  ? (Platform.OS === 'android' ? 'http://10.0.2.2:3001/api' : 'http://localhost:3001/api')
  : 'http://localhost:3001/api';

const TransactionHistory = ({ navigation }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);

  const fetchTransactions = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/transactions`);
      const result = await response.json();

      if (result.success) {
       // Sắp xếp theo thời gian giảm dần (mới nhất trước)
const sortedData = (result.data || []).sort((a, b) => {
  const timeA = new Date(a.raw?.transactionDate || a.time || 0).getTime();
  const timeB = new Date(b.raw?.transactionDate || b.time || 0).getTime();
  return timeB - timeA;
});

setTransactions(sortedData);

        
        // Tính tổng số tiền
        const total = (result.data || []).reduce((sum, transaction) => {
          const amount = transaction.raw?.transferAmount || transaction.raw?.amount || 0;
          return sum + amount;
        }, 0);
        setTotalAmount(total);
      } else {
        Alert.alert('Lỗi', 'Không thể lấy danh sách giao dịch.');
      }
    } catch (error) {
      console.error('Lỗi lấy giao dịch:', error);
      Alert.alert('Lỗi', 'Không thể kết nối tới server. Vui lòng kiểm tra mạng.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);
  useEffect(() => {
  const interval = setInterval(() => {
    console.log('🔄 Đang tự động cập nhật giao dịch...');
    fetchTransactions();
  }, 300000); // 5 phút = 300.000 ms

  return () => clearInterval(interval); // Dọn dẹp khi unmount
}, []);


  const onRefresh = () => {
    setRefreshing(true);
    fetchTransactions();
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      return dateString;
    }
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Icon name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Lịch sử giao dịch</Text>
      <View style={styles.placeholder} />
    </View>
  );

  const renderSummary = () => (
    
    <View style={styles.summaryCard}>
      <Text style={styles.summaryTitle}>📊 Tổng quan</Text>
      
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Tổng số giao dịch:</Text>
        <Text style={styles.summaryValue}>{transactions.length}</Text>
      </View>
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Tổng số tiền:</Text>
        <Text style={styles.summaryAmount}>{totalAmount.toLocaleString('vi-VN')} VNĐ</Text>
      </View>
    </View>
  );

  const renderItem = ({ item, index }) => {
    const raw = item.raw || {};
    const amount = raw.transferAmount || raw.amount || 0;
    const gateway = raw.gateway || 'N/A';
    const referenceCode = raw.referenceCode || 'N/A';
    const content = raw.content || raw.message || 'Không có nội dung';
    const transactionDate = raw.transactionDate || item.time || 'N/A';
    const description = raw.description || 'Giao dịch thành công';

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={{ textAlign: 'center', fontSize: 12, color: '#999', marginBottom: 10 }}>
  Giao dịch được cập nhật tự động mỗi 5 phút
</Text>

          <Text style={styles.transactionNumber}>#{index + 1}</Text>
          <Text style={styles.transactionType}>{item.type || 'Tiền vào'}</Text>
        </View>
        
        <Text style={styles.amount}>💰 {amount.toLocaleString('vi-VN')} VNĐ</Text>
        
        <View style={styles.detailRow}>
          <Text style={styles.label}>🏦 Ngân hàng:</Text>
          <Text style={styles.value}>{gateway}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.label}>📄 Mã giao dịch:</Text>
          <Text style={styles.value}>{referenceCode}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.label}>👤 Người gửi:</Text>
          <Text style={styles.value}>{description}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.label}>📝 Nội dung:</Text>
          <Text style={styles.value}>{content}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.label}>🕒 Thời gian:</Text>
          <Text style={styles.value}>{formatDate(transactionDate)}</Text>
        </View>
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📋</Text>
      <Text style={styles.emptyTitle}>Chưa có giao dịch nào</Text>
      <Text style={styles.emptyDescription}>
        Các giao dịch sẽ được hiển thị tại đây khi có người ủng hộ
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Đang tải giao dịch...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderHeader()}
      <FlatList
        data={transactions}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        ListHeaderComponent={transactions.length > 0 ? renderSummary : null}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  summaryCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  summaryAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  list: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  transactionNumber: {
    fontSize: 12,
    color: '#666',
    fontWeight: 'bold',
  },
  transactionType: {
    fontSize: 12,
    color: '#4CAF50',
    backgroundColor: '#e8f5e8',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  label: {
    fontSize: 14,
    color: '#666',
    width: 120,
  },
  value: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default TransactionHistory;