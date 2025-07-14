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
  Clipboard,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { v4 as uuidv4 } from 'uuid';
import { WebView } from 'react-native-webview';

const DonationScreen = ({ route }) => {
  const { campaign } = route.params;
  const navigation = useNavigation();
  const [donationId, setDonationId] = useState(null);
  const [qrImageUri, setQrImageUri] = useState(null);
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  const [qrLoading, setQrLoading] = useState(false);
  const [qrError, setQrError] = useState(false);
  const [showQRSection, setShowQRSection] = useState(false);

  const API_BASE_URL = 'http://10.0.2.2:3001/api';

  // Utility functions
  const copyToClipboard = (text, label) => {
    Clipboard.setString(text);
    Alert.alert('Đã sao chép', `${label} đã được sao chép vào clipboard`);
  };

  const getBankContent = () => {
    return donationId || 'Ung ho CLYT';
  };

  const removeVietnameseTones = (str) => {
    return str.normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd').replace(/Đ/g, 'D')
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .trim();
  };

 const generateQRUrl = (id) => {
  const account = '686829078888';
  const bank = 'MBBank';
  const template = 'compact';
  const download = 'false';
  const des = removeVietnameseTones(id).replace(/[<>\"'&]/g, '').trim();

  const query = `acc=${account}&bank=${bank}&des=${encodeURIComponent(des)}&template=${template}&download=${download}`;
  const url = `https://qr.sepay.vn/img?${query}`;

  console.log('📦 QR URL tạo bởi Sepay:', url); // <-- THÊM DÒNG NÀY ĐỂ LOG
  return url;
};




  const createDonationId = () => {
    try {
      return uuidv4();
    } catch (error) {
      const timestamp = Date.now().toString();
      const random = Math.random().toString(36).substr(2, 9);
      return `DON_${timestamp}_${random}`;
    }
  };

  const handleGenerateQR = async () => {
    setIsGeneratingQR(true);
    setQrError(false);

    if (!campaign?._id) {
      Alert.alert("Lỗi", "Không có dữ liệu chiến dịch");
      setIsGeneratingQR(false);
      return;
    }

    let newId;
    try {
      newId = createDonationId();
      setDonationId(newId);
    } catch (err) {
      Alert.alert("Lỗi", "Không thể tạo mã donationId");
      setIsGeneratingQR(false);
      return;
    }

    try {
      const bodyData = {
        donationId: newId,
        campaignId: campaign._id,
        amount: Number(campaign.goal_amount),
        createdAt: new Date().toISOString(),
      };

      const response = await fetch(`${API_BASE_URL}/initiate-donation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.message || 'Lỗi không xác định');
      }

    const qrUrl = generateQRUrl(newId);
      setQrImageUri(qrUrl);
      setShowQRSection(true);

    } catch (error) {
      Alert.alert("Lỗi", "Không thể tạo mã QR: " + error.message);
    } finally {
      setIsGeneratingQR(false);
    }
  };

  const copyDonationId = () => {
    if (donationId) {
      Clipboard.setString(donationId);
      Alert.alert('📋 Đã sao chép', `Mã quyên góp: ${donationId}`);
    }
  };

  const retryLoadQR = () => {
    setQrLoading(true);
    setQrError(false);
    const newQrUrl = generateQRUrl(donationId);

    setQrImageUri(newQrUrl);
  };

  // Check donation status polling
 useEffect(() => {
  const autoInitDonation = async () => {
    if (!donationId && campaign?._id) {
      const newId = createDonationId();
      setDonationId(newId);

      try {
        const bodyData = {
          donationId: newId,
          campaignId: campaign._id,
          amount: Number(campaign.goal_amount),
          createdAt: new Date().toISOString(),
        };

        const response = await fetch(`${API_BASE_URL}/initiate-donation`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bodyData),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result?.message || 'Lỗi không xác định');
        }

        const qrUrl = generateQRUrl(newId);
        setQrImageUri(qrUrl);
        setShowQRSection(true);
      } catch (err) {
        console.log('Auto QR init failed:', err.message);
        Alert.alert("Lỗi", "Không thể tạo mã QR tự động");
      }
    }
  };

  autoInitDonation();
}, [campaign?._id]); // thêm dependency chính xác để đảm bảo cập nhật đúng chiến dịch


  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#e74c3c" barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Quay lại</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quyên góp</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Campaign Info */}
        <View style={styles.campaignInfo}>
          <Image 
            source={{ uri: campaign?.image || 'https://via.placeholder.com/100x60' }} 
            style={styles.campaignImage}
          />
          <View style={styles.campaignDetails}>
            <Text style={styles.campaignTitle} numberOfLines={2}>
              {campaign?.title || 'Chiến dịch quyên góp'}
            </Text>
            <Text style={styles.campaignId}>ID: {campaign?._id}</Text>
          </View>
        </View>

        {/* Bank Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin chuyển khoản</Text>
          
          <View style={styles.bankInfoContainer}>
            <View style={styles.bankInfoRow}>
              <Text style={styles.bankInfoLabel}>Chủ tài khoản:</Text>
              <TouchableOpacity
                onPress={() => copyToClipboard('Cặp lá yêu thương', 'Tên chủ tài khoản')}
              >
                <Text style={styles.bankInfoValue}>Cặp lá yêu thương 📋</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.bankInfoRow}>
              <Text style={styles.bankInfoLabel}>Số tài khoản:</Text>
              <TouchableOpacity
                onPress={() => copyToClipboard('686829078888', 'Số tài khoản')}
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
        </View>

        {/* Important Note */}
        <View style={styles.noteSection}>
          <Text style={styles.noteTitle}>⚠️ Lưu ý quan trọng</Text>
          <Text style={styles.noteText}>
            Quý vị vui lòng chọn chuyển tiền ở chế độ thường.
          </Text>
        </View>

        {/* Content Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nội dung chuyển khoản</Text>

          <View style={styles.contentOption}>
            <Text style={styles.contentOptionTitle}>1/ Ủng hộ chung cho quỹ:</Text>
            <TouchableOpacity
              style={styles.contentValueContainer}
              onPress={() => copyToClipboard('Ung ho CLYT', 'Nội dung chuyển khoản')}
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
    disabled={!donationId}
    onPress={() => copyToClipboard(getBankContent(), 'Nội dung chuyển khoản')}
  >
    <Text style={styles.contentValue}>
      {donationId ? `${getBankContent()} 📋` : '⚠️ Vui lòng tạo mã để lấy nội dung'}
    </Text>
  </TouchableOpacity>

  <Text style={styles.contentNote}>
    (Tên chiến dịch + mã số để hỗ trợ riêng)
  </Text>
</View>

        </View>

        {/* QR Code Section */}
     {/* QR Code Section */}
<View style={styles.section}>
  <Text style={styles.sectionTitle}>Mã QR chuyển khoản</Text>

  {qrImageUri ? (
    <View style={styles.qrSection}>
      {/* QR Image */}
      <View style={styles.qrImageContainer}>
        {qrLoading ? (
          <View style={styles.qrLoadingContainer}>
            <ActivityIndicator size="large" color="#e74c3c" />
            <Text style={styles.qrLoadingText}>Đang tải mã QR...</Text>
          </View>
        ) : qrError ? (
          <View style={styles.qrErrorContainer}>
            <Text style={styles.qrErrorIcon}>❌</Text>
            <Text style={styles.qrErrorText}>Không thể tải mã QR</Text>
            <TouchableOpacity style={styles.qrRetryButton} onPress={retryLoadQR}>
              <Text style={styles.qrRetryButtonText}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <WebView
            source={{ uri: qrImageUri }}
            style={{ width: 250, height: 250, borderRadius: 12 }}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            scalesPageToFit={true}
            originWhitelist={['*']}
          />
        )}
      </View>

      {/* QR Info */}
      <View style={styles.qrInfoContainer}>
        <Text style={styles.qrInfoTitle}>Thông tin mã QR:</Text>

        <View style={styles.qrInfoRow}>
          <Text style={styles.qrInfoLabel}>Số tài khoản:</Text>
          <TouchableOpacity onPress={() => copyToClipboard('686829078888', 'Số tài khoản')}>
            <Text style={styles.qrInfoValue}>686829078888 📋</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.qrInfoRow}>
          <Text style={styles.qrInfoLabel}>Nội dung:</Text>
          <TouchableOpacity onPress={() => copyToClipboard(getBankContent(), 'Nội dung')}>
            <Text style={styles.qrInfoValue}>{getBankContent()} 📋</Text>
          </TouchableOpacity>
        </View>

        {donationId && (
          <View style={styles.qrInfoRow}>
            <Text style={styles.qrInfoLabel}>Mã donation:</Text>
            <TouchableOpacity onPress={copyDonationId}>
              <Text style={styles.qrInfoValue}>{donationId} 📋</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  ) : (
    <View style={styles.qrLoadingContainer}>
      <ActivityIndicator size="large" color="#e74c3c" />
      <Text style={styles.qrLoadingText}>Đang tạo mã QR tự động...</Text>
    </View>
  )}
</View>


        {/* Instructions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hướng dẫn</Text>
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsText}>
              1. Mở app banking của bạn{'\n'}
              2. Chọn tính năng quét mã QR hoặc chuyển khoản{'\n'}
              3. Nhập thông tin tài khoản và nội dung chuyển khoản{'\n'}
              4. Xác nhận chuyển khoản{'\n'}
              5. Hệ thống sẽ tự động xác nhận sau khi chuyển khoản thành công
            </Text>
          </View>
        </View>

        {/* Suggested Amounts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gợi ý số tiền quyên góp</Text>
          <View style={styles.amountGrid}>
            {['50.000đ', '100.000đ', '200.000đ', '500.000đ', '1.000.000đ', '2.000.000đ'].map(amount => (
              <TouchableOpacity key={amount} style={styles.amountButton}>
                <Text style={styles.amountButtonText}>{amount}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Campaign URL */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Link chiến dịch</Text>
          <TouchableOpacity 
            style={styles.urlContainer}
            onPress={() => copyToClipboard(`https://caplayeuthuong.vn/campaign/${campaign?._id}`, 'Link chiến dịch')}
          >
            <Text style={styles.campaignUrl} numberOfLines={2}>
              https://caplayeuthuong.vn/campaign/{campaign?._id} 📋
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#e74c3c',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerPlaceholder: {
    width: 60,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  campaignInfo: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  campaignImage: {
    width: 80,
    height: 60,
    borderRadius: 8,
    marginRight: 15,
  },
  campaignDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  campaignTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  campaignId: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  section: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  bankInfoContainer: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
  },
  bankInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
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
    textAlign: 'right',
  },
  noteSection: {
    backgroundColor: '#fff3cd',
    padding: 15,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
    marginBottom: 20,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 8,
  },
  noteText: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
  },
  contentOption: {
    marginBottom: 20,
  },
  contentOptionTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  contentValueContainer: {
    backgroundColor: '#e8f5e8',
    padding: 15,
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
    marginTop: 8,
  },
  generateQRButton: {
    backgroundColor: '#3498db',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  generateQRButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  qrSection: {
    alignItems: 'center',
  },
  qrImageContainer: {
    width: 250,
    height: 250,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e74c3c',
  },
  qrLoadingContainer: {
    alignItems: 'center',
  },
  qrLoadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },
  qrErrorContainer: {
    alignItems: 'center',
  },
  qrErrorIcon: {
    fontSize: 32,
    marginBottom: 10,
  },
  qrErrorText: {
    fontSize: 14,
    color: '#e74c3c',
    marginBottom: 10,
  },
  qrRetryButton: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 6,
  },
  qrRetryButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  qrImage: {
    width: '100%',
    height: '100%',
  },
  qrInfoContainer: {
    width: '100%',
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
  },
  qrInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
  },
  qrInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  qrInfoLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  qrInfoValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#e74c3c',
  },
  instructionsContainer: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
  },
  instructionsText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
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
  urlContainer: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
  },
  campaignUrl: {
    fontSize: 14,
    color: '#3498db',
    fontWeight: '500',
  },
});

export default DonationScreen;