import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './screens/HomeScreen';
import AddPersonScreen from './screens/AddPersonScreen';
import EditPersonScreen from './screens/EditPersonScreen';
import LandingPage from './components/LandingPage';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Landing">
  <Stack.Screen name="Landing" component={LandingPage} />
  <Stack.Screen name="Home" component={HomeScreen} />
  <Stack.Screen name="Add" component={AddPersonScreen} />
  <Stack.Screen name="Edit" component={EditPersonScreen} />
</Stack.Navigator>

    </NavigationContainer>
  );
}
