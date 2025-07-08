import React, { useEffect, useState } from 'react';
import { View, FlatList, ActivityIndicator, Text, Button } from 'react-native';
import PersonItem from '../components/PersonItem';
import { getSupportedPeople, deletePerson } from '../services/api';

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

  return (
    <View style={{ flex: 1, padding: 12 }}>
      <Button title="Add New" onPress={() => navigation.navigate('Add')} />
      {loading ? (
        <ActivityIndicator />
      ) : (
        <FlatList
          data={people}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <PersonItem
              person={item}
              onEdit={(p) => navigation.navigate('Edit', { person: p })}
              onDelete={handleDelete}
            />
          )}
          ListEmptyComponent={<Text>No data</Text>}
        />
      )}
    </View>
  );
};

export default HomeScreen;
