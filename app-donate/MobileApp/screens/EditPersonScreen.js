import React, { useState } from 'react';
import { View, TextInput, Button } from 'react-native';
import { updatePerson } from '../services/api';

const EditPersonScreen = ({ route, navigation }) => {
  const { person } = route.params;
  const [form, setForm] = useState(person);

  const handleChange = (key, value) => setForm({ ...form, [key]: value });

  const handleSubmit = async () => {
    await updatePerson(form._id, form);
    navigation.goBack();
  };

  return (
    <View style={{ padding: 12 }}>
      {Object.keys(form).filter(k => k !== '_id').map((key) => (
        <TextInput
          key={key}
          placeholder={key}
          value={form[key]}
          onChangeText={(text) => handleChange(key, text)}
          style={{ borderWidth: 1, marginVertical: 6, padding: 8 }}
        />
      ))}
      <Button title="Update" onPress={handleSubmit} />
    </View>
  );
};

export default EditPersonScreen;
