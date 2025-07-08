import React, { useState } from 'react';
import { View, TextInput, Button } from 'react-native';
import { addPerson } from '../services/api';

const AddPersonScreen = ({ navigation }) => {
  const [form, setForm] = useState({
    id: '', name: '', birthYear: '', address: '', province: '', district: '', area: '', status: '',
  });

  const handleChange = (key, value) => setForm({ ...form, [key]: value });

  const handleSubmit = async () => {
    await addPerson(form);
    navigation.goBack();
  };

  return (
    <View style={{ padding: 12 }}>
      {Object.keys(form).map((key) => (
        <TextInput
          key={key}
          placeholder={key}
          value={form[key]}
          onChangeText={(text) => handleChange(key, text)}
          style={{ borderWidth: 1, marginVertical: 6, padding: 8 }}
        />
      ))}
      <Button title="Save" onPress={handleSubmit} />
    </View>
  );
};

export default AddPersonScreen;
