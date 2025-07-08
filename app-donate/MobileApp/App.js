import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  Text,
  View,
  StyleSheet,
} from 'react-native';

const App = () => {
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPeople = async () => {
  try {
    const response = await fetch('http://10.0.2.2:3001/api/supported-people');
    const data = await response.json();
    setPeople(data);
  } catch (error) {
    console.error('Lỗi khi gọi API:', error.message);
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    fetchPeople();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.name}>{item.name}</Text>
      <Text>ID: {item.id}</Text>
      <Text>Năm sinh: {item.birthYear}</Text>
      <Text>Địa chỉ: {item.address}</Text>
      <Text>Tỉnh: {item.province}</Text>
      <Text>Huyện: {item.district}</Text>
      <Text>Khu vực: {item.area}</Text>
      <Text style={styles.status}>Trạng thái: {item.status}</Text>
    </View>
  );

  if (loading) {
    return <ActivityIndicator style={{ flex: 1 }} size="large" color="#007AFF" />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={people}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.empty}>Không có dữ liệu</Text>}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
    backgroundColor: '#F2F2F2',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    elevation: 2,
  },
  name: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  status: {
    marginTop: 4,
    fontStyle: 'italic',
    color: '#28a745',
  },
  empty: {
    textAlign: 'center',
    marginTop: 40,
    color: '#777',
  },
});

export default App;
