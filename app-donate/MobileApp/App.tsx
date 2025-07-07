import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ListScreen from '../MobileApp/src/screens/ListScreen';
import AddEditScreen from '../MobileApp/src/screens/AddEditScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Danh sách" component={ListScreen} />
        <Stack.Screen name="Thêm / Sửa" component={AddEditScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
