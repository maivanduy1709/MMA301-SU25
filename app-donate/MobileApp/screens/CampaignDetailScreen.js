import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  ActivityIndicator,
  Dimensions,
  StatusBar,
  Clipboard,
  Share,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { Buffer } from 'buffer';

const { width } = Dimensions.get('window');

const CampaignDetailScreen = ({ route }) => {
  const { campaign } = route.params;
  const campaignId = campaign?._id;
  const navigation = useNavigation();
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [qrBase64, setQrBase64] = useState(null);


  if (!campaignId) {
    console.warn("⚠️ Không tìm thấy campaignId từ route.params");
    Alert.alert(
      "Lỗi",
      "Không có ID chiến dịch để truy vấn dữ liệu.",
      [{ text: "Quay lại", onPress: () => navigation.goBack() }]
    );
    return null;
  }

  // State management
  const [campaignData, setCampaignData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [donationModalVisible, setDonationModalVisible] = useState(false);
  const [qrVisible, setQrVisible] = useState(false);
  const [donationId, setDonationId] = useState(null);
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  const [qrLoading, setQrLoading] = useState(false);
  const [qrError, setQrError] = useState(false);

  const API_BASE_URL = 'http://10.0.2.2:3001/api';

  useEffect(() => {
    fetchCampaignFromDatabase();
  }, [campaignId]);

  const fetchCampaignFromDatabase = async () => {
    try {
      setLoading(true);
      console.log(`📡 Requesting: ${API_BASE_URL}/campaigns/${campaignId}`);
      const response = await axios.get(`${API_BASE_URL}/campaigns/${campaignId}`);
      console.log("✅ Data:", response.data);
      setCampaignData(response.data);
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

  // Utility functions
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

  const copyToClipboard = (text, label) => {
    Clipboard.setString(text);
    Alert.alert('Đã sao chép', `${label} đã được sao chép vào clipboard`);
  };
  

  // Hàm getBankContent được sửa lại - giữ lại dấu tiếng Việt
  const getBankContent = () => {
    if (!campaignData) return 'Ung ho CLYT';
    
    try {
      const campaignCode = campaignData._id ? campaignData._id.slice(-8).toUpperCase() : 'CLYT';
      const title = campaignData.title ? campaignData.title.substring(0, 30) : 'Ung ho';
      
      // Chỉ loại bỏ các ký tự có thể gây lỗi URL, giữ lại dấu tiếng Việt
      const cleanTitle = title.replace(/[<>\"'&]/g, '').trim();
      
      return `${cleanTitle} ${campaignCode}`;
    } catch (error) {
      console.error('❌ Error in getBankContent:', error);
      return 'Ung ho CLYT';
    }
  };

  // Hàm generateQRUrl được sửa lại
  const generateQRUrl = (desContent) => {
    const acc = '686829078888';
    const bank = 'MBBank';
    
    // Đảm bảo desContent không null/undefined
    let content = desContent || 'Ung ho CLYT';
    
    // Chỉ loại bỏ các ký tự có thể gây lỗi URL, giữ lại dấu tiếng Việt
    content = content.replace(/[<>\"'&]/g, '').trim();
    
    // Giới hạn độ dài để tránh URL quá dài
    if (content.length > 50) {
      content = content.substring(0, 50);
    }
    
    // Encode URL đúng cách cho tiếng Việt
    const encodedDes = encodeURIComponent(content);
    const qrUrl = `https://qr.sepay.vn/img?acc=${acc}&bank=${bank}&des=${encodedDes}&template=compact&download=false`;
    
    console.log('🔗 QR URL:', qrUrl);
    console.log('📝 Content:', content);
    
    return qrUrl;
  };
const loadQrAsBase64 = async () => {
  try {
    setQrLoading(true);
    const qrUrl = generateQRUrl(getBankContent());
    const response = await axios.get(qrUrl, { responseType: 'arraybuffer' });
    const base64 = Buffer.from(response.data, 'binary').toString('base64');
    setQrBase64(`data:image/png;base64,${base64}`);
    setQrLoading(false);
    setQrError(false);
  } catch (error) {
    console.error('❌ QR tải lỗi:', error);
    setQrLoading(false);
    setQrError(true);
  }
};

  const createDonationId = () => {
    return uuidv4();
  };

  const copyDonationId = () => {
    if (donationId) {
      Clipboard.setString(donationId);
      Alert.alert('📋 Đã sao chép', `Mã quyên góp: ${donationId}`);
    }
  };

  // Implement chức năng chia sẻ
  const handleShare = () => {
    if (!campaignData) {
      Alert.alert('Lỗi', 'Không có dữ liệu chiến dịch để chia sẻ');
      return;
    }

    const shareUrl = `https://caplayeuthuong.vn/campaign/${campaignData._id}`;
    Clipboard.setString(shareUrl);
    Alert.alert('📋 Đã sao chép', 'Link chiến dịch đã được sao chép:\n\n' + shareUrl);
  };

  // Donation handlers
  const handleDonate = () => {
    if (!campaignData) {
      Alert.alert('Lỗi', 'Không có dữ liệu chiến dịch');
      return;
    }
    setDonationModalVisible(true);
  };

  // Cập nhật hàm tạo QR
  const handleDonateWithQR = async () => {
    if (!campaignData) {
      Alert.alert('Lỗi', 'Không có dữ liệu chiến dịch');
      return;
    }

    setIsGeneratingQR(true);
    
    const newId = createDonationId();
    setDonationId(newId);

    try {
      const response = await fetch(`${API_BASE_URL}/initiate-donation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donationId: newId,
          campaignId: campaignData._id,
          amount: campaignData.goal_amount,
          createdAt: new Date(),
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      setDonationModalVisible(false);
      setQrVisible(true);
      setIsGeneratingQR(false);
      setQrLoading(true);
      setQrError(false);
      
      // Sao chép donation ID vào clipboard
      Clipboard.setString(newId);
      Alert.alert('📋 Đã tạo mã QR', `Mã quyên góp: ${newId}\n(Đã sao chép vào clipboard)`);
      
    } catch (error) {
      console.error('Donation initiation error:', error);
      Alert.alert('Lỗi', 'Không thể tạo mã ủng hộ. Vui lòng thử lại.');
      setIsGeneratingQR(false);
    }
  };

  // Check donation status polling
  useEffect(() => {
    let interval = null;

    if (donationId && qrVisible) {
      interval = setInterval(async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/check-donation/${donationId}`);
          const data = await res.json();

          if (data.status === 'confirmed') {
            clearInterval(interval);
            Alert.alert('🎉 Cảm ơn bạn', 'Thông tin chuyển khoản đã được xác nhận!');
            setQrVisible(false);
            setDonationId(null);
            // Refresh campaign data
            fetchCampaignFromDatabase();
          }
        } catch (error) {
          console.log('Polling error:', error);
        }
      }, 5000);
    }

    return () => clearInterval(interval);
  }, [donationId, qrVisible]);

  // Loading state
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

  // Error state
  if (!campaignData) {
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

  // Main render
  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#e74c3c" barStyle="light-content" />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Back Button */}
        <TouchableOpacity 
          style={styles.backButtonTop} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonTopText}>← Quay lại</Text>
        </TouchableOpacity>

        {/* Main Image */}
        <Image 
          source={{ uri: campaignData.image || 'https://via.placeholder.com/400x200' }} 
          style={styles.mainImage} 
        />

        {/* Campaign Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.title}>{campaignData.title}</Text>
          <Text style={styles.hashtag}>{campaignData.hashtag || '#CặpLáYêuThương'}</Text>
          <Text style={styles.address}>📍 {campaignData.address}</Text>

          {/* Database Info Badge */}
          <View style={styles.dbBadge}>
            <Text style={styles.dbBadgeText}>
              🗄️ Từ database: {campaignData._id}
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

          {/* Stats Section */}
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

          {/* Description */}
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>Thông tin chi tiết</Text>
            <Text style={styles.description}>{campaignData.description}</Text>

            <Text style={styles.sectionTitle}>Thời gian chiến dịch</Text>
            <Text style={styles.campaignTime}>
              Từ {formatDate(campaignData.start_date)} đến {formatDate(campaignData.end_date)}
            </Text>
          </View>

          {/* Contact Section */}
          <View style={styles.contactSection}>
            <Text style={styles.contactTitle}>📞 Thông tin liên hệ</Text>

            <View style={styles.contactBox}>
              <Text style={styles.contactBoxTitle}>
                Ban BTV Cặp Lá Yêu Thương - VTV Digital
              </Text>
              <Text style={styles.contactRow}>📍 43 Nguyễn Chí Thanh, Hà Nội</Text>
              <Text style={styles.contactRow}>📞 096 277 37 77</Text>
              <Text style={styles.contactRow}>✉️ caplayeuthuong@vtv.vn</Text>
            </View>

            <View style={styles.contactBox}>
              <Text style={styles.contactBoxTitle}>
                Truyền thông - Công ty CP TAJ Việt Nam
              </Text>
              <Text style={styles.contactRow}>
                📍 Tầng 3, Tòa NO2-T1, Khu ngoại giao đoàn, đường Xuân Tảo, Bắc Từ Liêm, Hà Nội
              </Text>
              <Text style={styles.contactRow}>📞 098 322 71 87</Text>
              <Text style={styles.contactRow}>✉️ caplayeuthuong@taj.vn</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Buttons */}
      <View style={styles.bottomActions}>
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Text style={styles.shareButtonText}>📋 Sao chép link</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.donateButton} onPress={handleDonate}>
          <Text style={styles.donateButtonText}>Quyên góp ngay 💝</Text>
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
                    <Text style={styles.bankInfoValue}>Cặp lá yêu thương 📋</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.bankInfoRow}>
                  <Text style={styles.bankInfoLabel}>Số tài khoản:</Text>
                  <TouchableOpacity
                    onPress={() =>
                      copyToClipboard('686829078888', 'Số tài khoản')
                    }
                  >
                    <Text style={styles.bankInfoValue}>686829078888 📋</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.bankInfoRow}>
                  <Text style={styles.bankInfoLabel}>Ngân hàng:</Text>
                  <Text style={styles.bankInfoValue}>MBBank</Text>
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
              
              <Text style={{ color: '#2980b9', marginTop: 10 }} selectable>
                https://caplayeuthuong.vn/campaign/{campaignData._id}
              </Text>

              {/* Content Options */}
              <View style={styles.contentSection}>
                <Text style={styles.contentTitle}>Nội dung chuyển khoản:</Text>

                <View style={styles.contentOption}>
                  <Text style={styles.contentOptionTitle}>1/ Ủng hộ chung cho quỹ:</Text>
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
                    <Text style={styles.contentValue}>{getBankContent()} 📋</Text>
                  </TouchableOpacity>
                  <Text style={styles.contentNote}>
                    (Tên chiến dịch + mã số để hỗ trợ riêng)
                  </Text>
                </View>
              </View>

              {/* QR Code Option */}
              <TouchableOpacity 
                style={styles.qrButton} 
                onPress={handleDonateWithQR}
                disabled={isGeneratingQR}
              >
                {isGeneratingQR ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.qrButtonText}>🔲 Tạo mã QR để ủng hộ</Text>
                )}
              </TouchableOpacity>

              {/* Suggested Amounts */}
              <View style={styles.suggestedAmountSection}>
                <Text style={styles.amountTitle}>Gợi ý số tiền quyên góp:</Text>
                <View style={styles.amountGrid}>
                  {['50.000đ', '100.000đ', '200.000đ', '500.000đ', '1.000.000đ', '2.000.000đ'].map(amount => (
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

      {/* QR Modal - Được sửa lại với loading state tốt hơn */}
      <Modal visible={qrVisible} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.qrModalContent}>
            <Text style={styles.qrTitle}>Quét mã QR để ủng hộ</Text>
            
            <View style={styles.qrImageContainer}>
              <Image
                source={{ uri: generateQRUrl(getBankContent()) }}
                style={styles.qrImage}
                resizeMode="contain"
                onLoadStart={() => setQrLoading(true)}
                onLoad={() => {
                  setQrLoading(false);
                  setQrError(false);
                }}
                onError={() => {
                  setQrLoading(false);
                  setQrError(true);
                }}
              />
              
              {qrLoading && (
                <View style={styles.qrLoadingOverlay}>
                  <ActivityIndicator size="large" color="#e74c3c" />
                  <Text style={styles.qrLoadingText}>Đang tải mã QR...</Text>
                </View>
              )}
              
              {qrError && (
                <View style={styles.qrErrorOverlay}>
                  <Text style={styles.qrErrorIcon}>❌</Text>
                  <Text style={styles.qrErrorText}>Không thể tải mã QR</Text>
                  <TouchableOpacity 
                    style={styles.retryQrButton}
                    onPress={() => {
                      setQrError(false);
                      setQrLoading(true);
                      // Force reload image
                      const img = new Image();
                      img.src = generateQRUrl(getBankContent());
                    }}
                  >
                    <Text style={styles.retryQrButtonText}>Thử lại</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Hiển thị nội dung chuyển khoản */}
            <View style={styles.bankContentInfo}>
              <Text style={styles.bankContentLabel}>Nội dung chuyển khoản:</Text>
              <TouchableOpacity 
                style={styles.bankContentContainer}
                onPress={() => copyToClipboard(getBankContent(), 'Nội dung chuyển khoản')}
              >
                <Text style={styles.bankContentText}>{getBankContent()}</Text>
                <Text style={styles.copyIcon}>📋</Text>
              </TouchableOpacity>
            </View>

            {/* Donation Info */}
            <View style={styles.donationInfo}>
              <Text style={styles.donationLabel}>Mã quyên góp:</Text>
              <TouchableOpacity 
                style={styles.donationIdContainer}
                onPress={copyDonationId}
              >
                <Text style={styles.donationId}>{donationId}</Text>
                <Text style={styles.copyIcon}>📋</Text>
              </TouchableOpacity>
            </View>

            {/* Status */}
            <View style={styles.statusContainer}>
              <Text style={styles.qrSubText}>Đang chờ xác nhận thanh toán...</Text>
              <ActivityIndicator size="small" color="#e74c3c" style={{marginTop: 10}} />
            </View>

            {/* Instructions */}
            <View style={styles.instructionContainer}>
              <Text style={styles.instructionTitle}>📱 Hướng dẫn:</Text>
              <Text style={styles.instructionText}>
                1. Mở ứng dụng Mobile Banking{'\n'}
                2. Quét mã QR hoặc nhập thông tin chuyển khoản{'\n'}
                3. Nhập số tiền bạn muốn ủng hộ{'\n'}
                4. Xác nhận giao dịch
              </Text>
            </View>

            <TouchableOpacity 
              onPress={() => {
                setQrVisible(false);
                setDonationId(null);
                setQrLoading(false);
                setQrError(false);
              }}
              style={styles.qrCloseButton}
            >
              <Text style={styles.qrCloseButtonText}>Đóng</Text>
            </TouchableOpacity>
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