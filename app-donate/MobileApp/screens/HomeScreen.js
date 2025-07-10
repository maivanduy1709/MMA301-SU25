import React, { useEffect, useState } from 'react';
import {
  View,
  FlatList,
  ActivityIndicator,
  Text,
  Button,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { getSupportedPeople, deletePerson } from '../services/api';

const generateQRUrl = (id) => {
  const account = '686829078888';
  const bank = 'MBBank';
  const template = 'compact';
  const download = 'false';
  const query = `acc=${account}&bank=${bank}&des=${id}&template=${template}&download=${download}`;
  return `https://qr.sepay.vn/img?${query}`;
};

const HomeScreen = ({ navigation }) => {
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const data = await getSupportedPeople();
    setPeople(data);
    setLoading(false);
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', fetchData);
    return unsubscribe;
  }, [navigation]);

  const handleDelete = async (id) => {
    await deletePerson(id);
    fetchData();
  };

  const renderPersonCard = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.name}>{item.name}</Text>
      <Text>Tuổi: {item.age}</Text>
      <Text>Địa chỉ: {item.location}</Text>
      <Text>Câu chuyện:</Text>
      <Text style={styles.story}>{item.story}</Text>
      <Text>Đã nhận: {(item.raised || 0).toLocaleString()} / {(item.goal || 0).toLocaleString()} VND</Text>

      {/* QR Image */}
      <View style={styles.qrContainer}>
        <Text style={{ fontWeight: 'bold', marginBottom: 6 }}>Mã QR chuyển khoản</Text>
        <Image
          source={{ uri: generateQRUrl(item.id) }}
          style={{ width: 180, height: 180 }}
          resizeMode="contain"
        />
        <Text style={{ fontSize: 12, color: '#666', marginTop: 6 }}>
          Nội dung chuyển khoản: {item.id}
        </Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate('Edit', { person: item })}
        >
          <Text style={styles.buttonText}>✏️ Sửa</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDelete(item._id)}
        >
          <Text style={styles.buttonText}>🗑️ Xoá</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Button title="➕ Thêm người mới" onPress={() => navigation.navigate('Add')} />
      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={people}
          keyExtractor={(item) => item._id}
          renderItem={renderPersonCard}
          ListEmptyComponent={<Text style={{ marginTop: 20 }}>Không có dữ liệu</Text>}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
    backgroundColor: '#F5F5F5',
  },
  card: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 10,
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#2E7D32',
  },
  story: {
    fontStyle: 'italic',
    marginVertical: 8,
    color: '#444',
  },
  qrContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  editButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 6,
  },
  deleteButton: {
    backgroundColor: '#F44336',
    padding: 10,
    borderRadius: 6,
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
});

export default HomeScreen;
