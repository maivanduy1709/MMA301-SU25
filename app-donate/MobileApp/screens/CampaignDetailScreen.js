import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';

const { width, height } = Dimensions.get('window');

const CampaignDetailScreen = ({ route }) => {
  const { campaign } = route.params;
  const campaignId = campaign?._id;
  const navigation = useNavigation();

  const [campaignData, setCampaignData] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = 'http://10.0.2.2:3001/api';

  useEffect(() => {
    fetchCampaignFromDatabase();
  }, [campaignId]);

  const fetchCampaignFromDatabase = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/campaigns/${campaignId}`);
      setCampaignData(response.data.campaign);
    } catch (error) {
      console.error("❌ Axios error:", error.response?.data || error.message);
      Alert.alert(
        "Lỗi kết nối",
        `Không thể tải dữ liệu.\n${error.message}`,
        [
          { text: "Thử lại", onPress: () => fetchCampaignFromDatabase() },
          { text: "Quay lại", onPress: () => navigation.goBack() }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return '0 đ';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const getProgressPercentage = () => {
    if (!campaignData) return 0;
    return Math.min((campaignData.current_amount / campaignData.goal_amount) * 100, 100);
  };

  const getDaysRemaining = () => {
    if (!campaignData) return 0;
    const endDate = new Date(campaignData.end_date);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleShare = () => {
    if (!campaignData) {
      Alert.alert('Lỗi', 'Không có dữ liệu chiến dịch để chia sẻ');
      return;
    }
    const shareUrl = `https://caplayeuthuong.vn/campaign/${campaignData._id}`;
    Alert.alert('📋 Đã sao chép', `Link chiến dịch đã được sao chép:\n\n${shareUrl}`);
  };

  const handleDonate = () => {
    if (!campaignData) {
      Alert.alert('Lỗi', 'Không có dữ liệu chiến dịch');
      return;
    }
    navigation.navigate('DonationScreen', { campaign: campaignData });
  };

  if (loading || !campaignData) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#e74c3c" />
        <Text style={styles.loadingText}>Đang tải dữ liệu chiến dịch...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#e74c3c" barStyle="light-content" />

      <ScrollView style={styles.content}>
        <TouchableOpacity
          style={styles.backButtonTop}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonTopText}>← Quay lại</Text>
        </TouchableOpacity>

        <Image
          source={{ uri: campaignData.image || 'https://via.placeholder.com/400x200' }}
          style={styles.mainImage}
          resizeMode="cover"
        />

        <View style={styles.infoContainer}>
          <Text style={styles.title}>{campaignData.title}</Text>
          <Text style={styles.hashtag}>{campaignData.hashtag || '#CặpLáYêuThương'}</Text>
          <Text style={styles.address}>📍 {campaignData.address}</Text>

          <View style={styles.dbBadge}>
            <Text style={styles.dbBadgeText}>🗄️ Từ database: {campaignData._id}</Text>
          </View>

          <View style={styles.progressSection}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${getProgressPercentage()}%` }]} />
            </View>
            <Text style={styles.progressText}>{getProgressPercentage().toFixed(1)}% hoàn thành</Text>
          </View>

          <View style={styles.statsSection}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Đã quyên góp:</Text>
              <Text style={styles.statValue}>{formatCurrency(campaignData.current_amount)}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Mục tiêu:</Text>
              <Text style={styles.statValue}>{formatCurrency(campaignData.goal_amount)}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Lượt ủng hộ:</Text>
              <Text style={styles.statValue}>{campaignData.supporters_count || 0}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Còn lại:</Text>
              <Text style={styles.statValue}>{getDaysRemaining()} ngày</Text>
            </View>
          </View>

          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>Thông tin chi tiết</Text>
            <Text style={styles.description}>{campaignData.description}</Text>

            <Text style={styles.sectionTitle}>Thời gian chiến dịch</Text>
            <Text style={styles.campaignTime}>
              Từ {formatDate(campaignData.start_date)} đến {formatDate(campaignData.end_date)}
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomActions}>
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Text style={styles.shareButtonText}>📋 Sao chép link</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.donateButton} onPress={handleDonate}>
          <Text style={styles.donateButtonText}>Quyên góp ngay 💝</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 20,
  },

  errorText: {
    fontSize: 18,
    color: '#e74c3c',
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: '600',
  },
  errorSubText: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 30,
  },
  errorButtonContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  
  retryButton: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    backgroundColor: '#95a5a6',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  backButtonTop: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  backButtonTopText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  mainImage: {
    width: '100%',
    height: 250,
  },
  infoContainer: {
    padding: 20,
    backgroundColor: '#fff',
    marginTop: -20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
 
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
    lineHeight: 30,
  },
  hashtag: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
    marginBottom: 5,
  },
  address: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 10,
  },
  dbBadge: {
    backgroundColor: '#e8f5e8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  dbBadgeText: {
    fontSize: 12,
    color: '#27ae60',
    fontWeight: '600',
  },

  progressSection: {
    marginBottom: 20,
  },
  progressBar: {
    height: 12,
    backgroundColor: '#ecf0f1',
    borderRadius: 6,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF6B6B',
  },
  progressText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF6B6B',
    textAlign: 'center',
  },
  statsSection: {
    marginBottom: 20,
  },
  statItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  statLabel: {
    fontSize: 14,
    color: '#555',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111',
  },
  descriptionSection: {
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
    paddingTop: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#7f8c8d',
    lineHeight: 24,
    marginBottom: 20,
  },
  campaignTime: {
    fontSize: 16,
    color: '#7f8c8d',
    lineHeight: 24,
    marginBottom: 20,
  },
  contactSection: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#f0f8f5',
    borderRadius: 12,
    borderColor: '#27ae60',
    borderWidth: 1,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#27ae60',
    marginBottom: 10,
  },
  contactBox: {
    marginBottom: 15,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    borderColor: '#c8e6c9',
    borderWidth: 1,
  },
  contactBoxTitle: {
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 6,
  },
  contactRow: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  bottomActions: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
  },
  shareButton: {
    flex: 1,
    backgroundColor: '#95a5a6',
    paddingVertical: 15,
    borderRadius: 8,
    marginRight: 10,
    alignItems: 'center',
  },
  
  shareButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  donateButton: {
    flex: 2,
    backgroundColor: '#FF6B6B',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },

  donateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
  backgroundColor: '#fff',
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
  maxHeight: '90%',
  padding: 20,
  marginBottom: 40, // giúp tránh bị chồng khi modal hiển thị kèm bottom actions
},

  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 20,
  },
  bankInfoSection: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  bankInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  bankInfoLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  bankInfoValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#e74c3c',
    flex: 2,
    textAlign: 'right',
  },
  noteSection: {
    backgroundColor: '#fff3cd',
    padding: 15,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
    marginBottom: 20,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 5,
  },
  noteText: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
  },
  contentSection: {
    marginBottom: 20,
  },
  contentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  contentOption: {
    marginBottom: 15,
  },
  contentOptionTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  contentValueContainer: {
    backgroundColor: '#e8f5e8',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#27ae60',
  },
  contentValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#27ae60',
    textAlign: 'center',
  },
  contentNote: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
    marginTop: 5,
  },
  qrButton: {
    backgroundColor: '#3498db',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  qrButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
suggestedAmountSection: {
    marginBottom: 20,
  },
  amountTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  amountGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  amountButton: {
    width: '30%',
    backgroundColor: '#e74c3c',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  amountButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: '#95a5a6',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CampaignDetailScreen;