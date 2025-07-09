import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  StatusBar,
  Alert,
  Modal,
  Clipboard,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../AppNavigation';

const { width } = Dimensions.get('window');

type CaseDetailNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'CaseDetail'
>;
type CaseDetailRouteProp = RouteProp<RootStackParamList, 'CaseDetail'>;

interface CaseDetailProps {
  navigation: CaseDetailNavigationProp;
  route: CaseDetailRouteProp;
}

interface Campaign {
  _id: string;
  title: string;
  description: string;
  goal_amount: number;
  current_amount: number;
  start_date: string;
  end_date: string;
  created_by: string;
  created_at: string;
  address: string;
  image: string;
}

const CaseDetailScreen: React.FC<CaseDetailProps> = ({ route, navigation }) => {
  const { campaignId } = route.params;
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [donationModalVisible, setDonationModalVisible] = useState(false);

  // 🔧 Cấu hình API URL - Thay đổi theo server của bạn
  const API_BASE_URL = 'http://192.168.1.4:3001/api';

  useEffect(() => {
    fetchCampaignFromDatabase();
  }, [campaignId]);

  const fetchCampaignFromDatabase = async () => {
    try {
      setLoading(true);

      console.log(`🔄 Fetching campaign from database: ${campaignId}`);

      const response = await fetch(`${API_BASE_URL}/campaigns/${campaignId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log(`📡 API Response status: ${response.status}`);

      if (!response.ok) {
        throw new Error(
          `HTTP error! status: ${response.status} - ${response.statusText}`,
        );
      }

      const data = await response.json();
      console.log('📦 API Response data:', data);

      if (data && data._id) {
        setCampaign(data);
      } else {
        throw new Error('Campaign not found in database');
      }

      setLoading(false);
    } catch (error) {
      console.error('❌ Error fetching campaign from database:', error);
      setLoading(false);

      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';

      Alert.alert(
        'Lỗi kết nối',
        `Không thể tải thông tin chiến dịch từ database.\n\nLỗi: ${errorMessage}\n\nVui lòng kiểm tra:\n- Server backend đã chạy chưa?\n- MongoDB đã kết nối chưa?\n- Campaign ID có tồn tại không?`,
        [
          { text: 'Thử lại', onPress: () => fetchCampaignFromDatabase() },
          { text: 'Quay lại', onPress: () => navigation.goBack() },
        ],
      );
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const getProgressPercentage = () => {
    if (!campaign) return 0;
    return Math.min(
      (campaign.current_amount / campaign.goal_amount) * 100,
      100,
    );
  };

  const getDaysRemaining = () => {
    if (!campaign) return 0;
    const endDate = new Date(campaign.end_date);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleDonate = () => {
    setDonationModalVisible(true);
  };

  const copyToClipboard = (text: string, label: string) => {
    Clipboard.setString(text);
    Alert.alert('Đã sao chép', `${label} đã được sao chép vào clipboard`);
  };

  const getBankContent = () => {
    if (!campaign) return '';
    // Tạo mã số chiến dịch từ _id (lấy 8 ký tự cuối)
    const campaignCode = campaign._id.slice(-8).toUpperCase();
    return `${campaign.title.substring(0, 20)} ${campaignCode}`;
  };

  const handleShare = () => {
    Alert.alert('Chia sẻ', 'Chức năng chia sẻ đang được phát triển.', [
      { text: 'OK' },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#e74c3c" />
        <Text style={styles.loadingText}>
          Đang tải thông tin từ database...
        </Text>
        <Text style={styles.loadingSubText}>ID: {campaignId}</Text>
      </View>
    );
  }

  if (!campaign) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>😞</Text>
        <Text style={styles.errorText}>
          Không tìm thấy thông tin chiến dịch trong database
        </Text>
        <Text style={styles.errorSubText}>Campaign ID: {campaignId}</Text>
        <View style={styles.errorButtonContainer}>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => fetchCampaignFromDatabase()}
          >
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Quay lại</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#e74c3c" barStyle="light-content" />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Main Image */}
        <Image source={{ uri: campaign.image }} style={styles.mainImage} />

        {/* Campaign Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.title}>{campaign.title}</Text>
          <Text style={styles.address}>📍 {campaign.address}</Text>

          {/* Database Info Badge */}
          <View style={styles.dbBadge}>
            <Text style={styles.dbBadgeText}>
              🗄️ Từ database: {campaign._id}
            </Text>
          </View>

          {/* Progress Section */}
          <View style={styles.progressSection}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${getProgressPercentage()}%` },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {getProgressPercentage().toFixed(1)}% hoàn thành
            </Text>
          </View>

          {/* Amount Info */}
          <View style={styles.amountSection}>
            <View style={styles.amountRow}>
              <View>
                <Text style={styles.amountLabel}>Đã quyên góp</Text>
                <Text style={styles.currentAmount}>
                  {formatCurrency(campaign.current_amount)}
                </Text>
              </View>
              <View style={styles.goalAmountContainer}>
                <Text style={styles.amountLabel}>Mục tiêu</Text>
                <Text style={styles.goalAmount}>
                  {formatCurrency(campaign.goal_amount)}
                </Text>
              </View>
            </View>
          </View>

          {/* Time Info */}
          <View style={styles.timeSection}>
            <View style={styles.timeRow}>
              <View style={styles.timeItem}>
                <Text style={styles.timeLabel}>Ngày bắt đầu</Text>
                <Text style={styles.timeValue}>
                  {formatDate(campaign.start_date)}
                </Text>
              </View>
              <View style={styles.timeItem}>
                <Text style={styles.timeLabel}>Còn lại</Text>
                <Text style={styles.timeValue}>{getDaysRemaining()} ngày</Text>
              </View>
            </View>
          </View>

          {/* Description */}
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>Thông tin chi tiết</Text>
            <Text style={styles.description}>{campaign.description}</Text>

            <Text style={styles.sectionTitle}>Thời gian chiến dịch</Text>
            <Text style={styles.campaignTime}>
              Từ {formatDate(campaign.start_date)} đến{' '}
              {formatDate(campaign.end_date)}
            </Text>

            <Text style={styles.sectionTitle}>Địa chỉ</Text>
            <Text style={styles.campaignAddress}>{campaign.address}</Text>
          </View>
        </View>
        <View style={styles.contactSection}>
          <Text style={styles.contactTitle}>📞 Thông tin liên hệ</Text>

          <View style={styles.contactBox}>
            <Text style={styles.contactBoxTitle}>
              Ban BTV Cặp Lá Yêu Thương - VTV Digital
            </Text>
            <Text style={styles.contactRow}>
              📍 43 Nguyễn Chí Thanh, Hà Nội
            </Text>
            <Text style={styles.contactRow}>📞 096 277 37 77</Text>
            <Text style={styles.contactRow}>✉️ caplayeuthuong@vtv.vn</Text>
          </View>

          <View style={styles.contactBox}>
            <Text style={styles.contactBoxTitle}>
              Truyền thông - Công ty CP TAJ Việt Nam
            </Text>
            <Text style={styles.contactRow}>
              📍 Tầng 3, Tòa NO2-T1, Khu ngoại giao đoàn, đường Xuân Tảo, Bắc Từ
              Liêm, Hà Nội
            </Text>
            <Text style={styles.contactRow}>📞 098 322 71 87</Text>
            <Text style={styles.contactRow}>✉️ caplayeuthuong@taj.vn</Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Buttons */}
      <View style={styles.bottomActions}>
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Text style={styles.shareButtonText}>Chia sẻ</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.donateButton} onPress={handleDonate}>
          <Text style={styles.donateButtonText}>Quyên góp ngay</Text>
        </TouchableOpacity>
      </View>

      {/* Donation Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={donationModalVisible}
        onRequestClose={() => setDonationModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>Thông tin chuyển khoản</Text>

              {/* Bank Info */}
              <View style={styles.bankInfoSection}>
                <View style={styles.bankInfoRow}>
                  <Text style={styles.bankInfoLabel}>Chủ tài khoản:</Text>
                  <TouchableOpacity
                    onPress={() =>
                      copyToClipboard('Cặp lá yêu thương', 'Tên chủ tài khoản')
                    }
                  >
                    <Text style={styles.bankInfoValue}>
                      Cặp lá yêu thương 📋
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.bankInfoRow}>
                  <Text style={styles.bankInfoLabel}>Số tài khoản:</Text>
                  <TouchableOpacity
                    onPress={() =>
                      copyToClipboard('1000001001242424', 'Số tài khoản')
                    }
                  >
                    <Text style={styles.bankInfoValue}>
                      1000001001242424 📋
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.bankInfoRow}>
                  <Text style={styles.bankInfoLabel}>Ngân hàng:</Text>
                  <Text style={styles.bankInfoValue}>
                    Chính sách xã hội (VBSP)
                  </Text>
                </View>

                <View style={styles.bankInfoRow}>
                  <Text style={styles.bankInfoLabel}>Chi nhánh:</Text>
                  <Text style={styles.bankInfoValue}>Sở giao dịch</Text>
                </View>
              </View>

              {/* Important Note */}
              <View style={styles.noteSection}>
                <Text style={styles.noteTitle}>⚠️ Lưu ý quan trọng</Text>
                <Text style={styles.noteText}>
                  Quý vị vui lòng chọn chuyển tiền ở chế độ thường.
                </Text>
              </View>

              {/* Content Options */}
              <View style={styles.contentSection}>
                <Text style={styles.contentTitle}>Nội dung chuyển khoản:</Text>

                <View style={styles.contentOption}>
                  <Text style={styles.contentOptionTitle}>
                    1/ Ủng hộ chung cho quỹ:
                  </Text>
                  <TouchableOpacity
                    style={styles.contentValueContainer}
                    onPress={() =>
                      copyToClipboard('Ung ho CLYT', 'Nội dung chuyển khoản')
                    }
                  >
                    <Text style={styles.contentValue}>Ung ho CLYT 📋</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.contentOption}>
                  <Text style={styles.contentOptionTitle}>
                    2/ Hỗ trợ riêng cho chiến dịch này:
                  </Text>
                  <TouchableOpacity
                    style={styles.contentValueContainer}
                    onPress={() =>
                      copyToClipboard(getBankContent(), 'Nội dung chuyển khoản')
                    }
                  >
                    <Text style={styles.contentValue}>
                      {getBankContent()} 📋
                    </Text>
                  </TouchableOpacity>
                  <Text style={styles.contentNote}>
                    (Tên chiến dịch + mã số để hỗ trợ riêng)
                  </Text>
                </View>
              </View>

              {/* Suggested Amounts */}
              <View style={styles.suggestedAmountSection}>
                <Text style={styles.amountTitle}>Gợi ý số tiền quyên góp:</Text>
                <View style={styles.amountGrid}>
                  {[
                    '50.000đ',
                    '100.000đ',
                    '200.000đ',
                    '500.000đ',
                    '1.000.000đ',
                    '2.000.000đ',
                  ].map(amount => (
                    <TouchableOpacity key={amount} style={styles.amountButton}>
                      <Text style={styles.amountButtonText}>{amount}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Close Button */}
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setDonationModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>Đóng</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

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
  loadingSubText: {
    marginTop: 5,
    fontSize: 12,
    color: '#95a5a6',
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
  contactSection: {
    marginTop: 20,
    marginHorizontal: 20,
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
    marginBottom: 10,
    lineHeight: 30,
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
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#27ae60',
    borderRadius: 6,
  },
  progressText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#27ae60',
    textAlign: 'center',
  },
  amountSection: {
    marginBottom: 25,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  amountLabel: {
    fontSize: 14,
    color: '#95a5a6',
    marginBottom: 5,
  },
  currentAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#e74c3c',
  },
  goalAmountContainer: {
    alignItems: 'flex-end',
  },
  goalAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7f8c8d',
  },
  descriptionSection: {
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
    paddingTop: 20,
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
  timeSection: {
    marginBottom: 20,
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeItem: {
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: 12,
    color: '#95a5a6',
    marginBottom: 5,
  },
  timeValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e74c3c',
  },
  campaignTime: {
    fontSize: 16,
    color: '#7f8c8d',
    lineHeight: 24,
    marginBottom: 20,
  },
  campaignAddress: {
    fontSize: 16,
    color: '#7f8c8d',
    lineHeight: 24,
    marginBottom: 20,
  },
  campaignMeta: {
    fontSize: 14,
    color: '#95a5a6',
    lineHeight: 20,
    fontFamily: 'monospace',
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
    backgroundColor: '#e74c3c',
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

export default CaseDetailScreen;
