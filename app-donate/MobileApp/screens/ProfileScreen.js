import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, SafeAreaView } from 'react-native';
import { useAuth } from '../contexts/AuthContext'; // Assuming this path is correct

const ProfileScreen = ({ navigation }) => {
 const { user, logout } = useAuth();


  if (!user) {
    // You might want to show a loading spinner or redirect if user is not available
    return (
      <View style={styles.loadingContainer}>
        <Text>Vui lòng đăng nhập để xem </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.profileHeader}>
          <Image source={{ uri: user.avatar || 'https://i.pravatar.cc/300' }} style={styles.avatar} />
          <Text style={styles.name}>{user.name || 'User Name'}</Text>
          <Text style={styles.email}>{user.email || 'user@example.com'}</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Account Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email:</Text>
            <Text style={styles.infoValue}>{user.email || 'N/A'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Verified:</Text>
            <Text style={styles.infoValue}>{user.is_verified ? 'Yes' : 'No'}</Text>
          </View>
          {/* Add more user details here if available, e.g., total_donated, campaigns_supported */}
          {user.total_donated !== undefined && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Total Donated:</Text>
              <Text style={styles.infoValue}>{user.total_donated}</Text>
            </View>
          )}
          {user.campaigns_supported !== undefined && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Campaigns Supported:</Text>
              <Text style={styles.infoValue}>{user.campaigns_supported}</Text>
            </View>
          )}
        </View>

        <TouchableOpacity
  style={styles.logoutButton}
  onPress={async () => {
    await logout();
    navigation.reset({
      index: 0,
      routes: [{ name: 'Welcome' }], // hoặc 'Login' hoặc 'Home'
    });
  }}
>
  <Text style={styles.logoutText}>Đăng xuất</Text>
</TouchableOpacity>

      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f0f2f5', // Light background for the whole screen
  },
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 40, // Add some padding from the top
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 30,
    backgroundColor: '#ffffff',
    width: '90%',
    borderRadius: 15,
    paddingVertical: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
    borderWidth: 3,
    borderColor: '#4CAF50', // A nice green border
  },
  name: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: '#666',
  },
  infoCard: {
    width: '90%',
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 16,
    color: '#555',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
  },
  logoutButton: {
    marginTop: 20,
    paddingVertical: 14,
    paddingHorizontal: 30,
    backgroundColor: '#E53935', // A slightly darker red for logout
    borderRadius: 12,
    shadowColor: '#E53935',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
});

export default ProfileScreen;