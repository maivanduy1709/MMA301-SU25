import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const CampaignCardSimple = ({ campaign }) => {
  const navigation = useNavigation();

  // Thêm validation để tránh crash khi campaign không có dữ liệu
  if (!campaign) {
    console.warn('CampaignCardSimple: campaign prop is undefined or null');
    return null;
  }

  const handlePress = () => {
  if (navigation && navigation.navigate) {
    navigation.navigate('CampaignDetail', { campaign });
  } else {
    console.error('Navigation is not available');
  }
};


  return (
    <TouchableOpacity
      style={styles.cardContainer}
      onPress={handlePress}
    >
      <Image
        source={{ uri: campaign.image || 'https://via.placeholder.com/400x200' }}
        style={styles.cardImage}
        onError={(error) => {
          console.log('Image loading error:', error);
        }}
      />
      <View style={styles.overlay}>
        <Text style={styles.title} numberOfLines={2}>
          {campaign.title || 'Không có tiêu đề'}
        </Text>
        <Text style={styles.hashtag}>
          {campaign.hashtag || '#CặpLáYêuThương'}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    marginHorizontal: 12,
    elevation: 4,
    backgroundColor: '#fff',
    // Thêm shadow cho iOS
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  cardImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#f0f0f0', // Thêm background color khi image đang load
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    padding: 12,
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  title: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
    lineHeight: 22, // Thêm line height để text hiển thị tốt hơn
  },
  hashtag: {
    fontSize: 13,
    color: '#ddd',
    marginTop: 4,
  },
});

export default CampaignCardSimple;