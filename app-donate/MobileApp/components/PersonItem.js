import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';

const PersonItem = ({ person, onEdit, onDelete }) => (
  <View style={styles.card}>
    <Text style={styles.name}>{person.name}</Text>
    <Text>ID: {person.id}</Text>
    <Text>Birth Year: {person.birthYear}</Text>
    <Text>Address: {person.address}</Text>
    <Text>Status: {person.status}</Text>
    <View style={styles.row}>
      <Button title="Edit" onPress={() => onEdit(person)} />
      <Button title="Delete" color="red" onPress={() => onDelete(person._id)} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  card: { padding: 12, marginVertical: 8, borderWidth: 1, borderRadius: 6 },
  name: { fontWeight: 'bold', fontSize: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }
});

export default PersonItem;
