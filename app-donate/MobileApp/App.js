import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AuthProvider, useAuth } from './contexts/AuthContext'; // ✅ Sử dụng context từ file riêng

// Screens
import WelcomeScreen from './screens/WelcomeScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import VerifyCodeScreen from './screens/VerifyCodeScreen';
import ResetPasswordScreen from './screens/ResetPasswordScreen';
import CampaignDetailScreen from './screens/CampaignDetailScreen';
import SupportPage from './screens/SupportPage';
import NewsFeed from './screens/NewsFeed';
import ExplorePage from './screens/ExplorePage';
import TransactionHistory from './screens/TransactionHistory';
import DonationScreen from './screens/DonationScreen';
import BottomTabNavigator from './screens/createBottomTabNavigator';
import CreateCampaignScreen from './screens/CreateCampaignScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <AuthProvider>
      <MainNavigation />
    </AuthProvider>
  );
}

function MainNavigation() {
  const { user } = useAuth();
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    const prepare = async () => {
      await AsyncStorage.removeItem('alreadyLaunched'); // 👈 reset test
      const alreadyLaunched = await AsyncStorage.getItem('alreadyLaunched');

      if (!alreadyLaunched) {
        await AsyncStorage.setItem('alreadyLaunched', 'true');
        setInitialRoute('Welcome');
      } else {
        setInitialRoute(user ? 'MainTabs' : 'Login');
      }
    };
    prepare();
  }, [user]);

  if (!initialRoute) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={initialRoute}>
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="VerifyCode" component={VerifyCodeScreen} />
        <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
        <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
        <Stack.Screen name="CampaignDetail" component={CampaignDetailScreen} />
        <Stack.Screen name="SupportPage" component={SupportPage} />
        <Stack.Screen name="NewsFeed" component={NewsFeed} />
        <Stack.Screen name="ExplorePage" component={ExplorePage} />
        <Stack.Screen name="DonationScreen" component={DonationScreen} />
        <Stack.Screen name="TransactionHistory" component={TransactionHistory} />
        <Stack.Screen name="CreateCampaignScreen" component={CreateCampaignScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
