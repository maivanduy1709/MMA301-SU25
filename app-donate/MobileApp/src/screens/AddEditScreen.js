import React, { useState } from 'react';
import { View, TextInput, Button, ScrollView } from 'react-native';
import { createPerson, updatePerson } from '../api/peopleApi';

export default function AddEditScreen({ route, navigation }) {
  const person = route.params?.person;
  const [form, setForm] = useState({
    id: person?.id || '',
    name: person?.name || '',
    birthYear: person?.birthYear || '',
    address: person?.address || '',
    province: person?.province || '',
    district: person?.district || '',
    area: person?.area || '',
    status: person?.status || ''
  });

  const handleChange = (key, val) => setForm({ ...form, [key]: val });

  const handleSubmit = async () => {
    if (person) {
      await updatePerson(person._id, form);
    } else {
      await createPerson(form);
    }
    navigation.goBack();
  };

  return (
    <ScrollView style={{ padding: 10 }}>
      {Object.entries(form).map(([key, value]) => (
        <TextInput
          key={key}
          placeholder={key}
          value={value}
          onChangeText={(val) => handleChange(key, val)}
          style={{ borderWidth: 1, padding: 8, marginBottom: 10 }}
        />
      ))}
      <Button title="Lưu" onPress={handleSubmit} />
    </ScrollView>
  );
}
