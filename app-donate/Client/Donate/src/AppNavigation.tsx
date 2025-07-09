import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './screens/HomeScreen';
import CaseDetailScreen from './screens/CaseDetailScreen';

export type RootStackParamList = {
  Home: undefined;
  CaseDetail: { campaignId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigation = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            headerShown: false, // ẩn header ở màn hình Home
          }}
        />
        <Stack.Screen
          name="CaseDetail"
          component={CaseDetailScreen}
          options={{
            headerShown: true, // ✅ Hiện header ở CaseDetail
            title: 'Chi tiết hoàn cảnh',
            headerStyle: {
              backgroundColor: '#e74c3c', // màu nền header
            },
            headerTintColor: '#fff', // màu chữ và nút quay lại
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigation;
