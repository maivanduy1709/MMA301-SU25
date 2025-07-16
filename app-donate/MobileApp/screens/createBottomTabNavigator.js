import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';

// Các màn hình
import HomeScreen from './HomeScreen';
import SupportPage from './SupportPage';
import NewsFeed from './NewsFeed';
import ExplorePage from './ExplorePage';
import ProfileScreen from './ProfileScreen'; // ⬅️ Thêm dòng này

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => {
          const iconSize = 24;
          if (route.name === 'Home') return <Text style={{ fontSize: iconSize }}>❤️</Text>;
          if (route.name === 'SupportPage') return <Text style={{ fontSize: iconSize }}>👥</Text>;
          if (route.name === 'NewsFeed') return <Text style={{ fontSize: iconSize }}>💬</Text>;
          if (route.name === 'ExplorePage') return <Text style={{ fontSize: iconSize }}>🔍</Text>;
          if (route.name === 'Profile') return <Text style={{ fontSize: iconSize }}>👤</Text>;
        },
        tabBarActiveTintColor: '#FF6B6B',
        tabBarInactiveTintColor: '#888',
        tabBarLabelStyle: { fontSize: 12 },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Trang chủ' }} />
      <Tab.Screen name="SupportPage" component={SupportPage} options={{ title: 'Ủng hộ' }} />
      <Tab.Screen name="NewsFeed" component={NewsFeed} options={{ title: 'Bảng tin' }} />
      <Tab.Screen name="ExplorePage" component={ExplorePage} options={{ title: 'Khám phá' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Hồ sơ' }} />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;
