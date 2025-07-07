import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Button } from 'react-native';
import { getPeople, deletePerson } from '../api/peopleApi';

export default function ListScreen({ navigation }) {
  const [people, setPeople] = useState([]);

  const loadData = async () => {
    try {
      const data = await getPeople();
      setPeople(data);
    } catch (e) {
      console.error('Lỗi load API:', e);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadData);
    return unsubscribe;
  }, [navigation]);

  return (
    <View style={{ padding: 20 }}>
      <Button title="➕ Thêm người" onPress={() => navigation.navigate('Thêm / Sửa')} />
      {people.length === 0 ? (
        <Text style={{ marginTop: 20 }}>Không có dữ liệu.</Text>
      ) : (
        <FlatList
          data={people}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => navigation.navigate('Thêm / Sửa', { person: item })}
            >
              <View style={{ padding: 10, borderBottomWidth: 1 }}>
                <Text>{item.name}</Text>
                <Text>{item.area} - {item.status}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}
