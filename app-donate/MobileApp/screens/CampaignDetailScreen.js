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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { v4 as uuidv4 } from 'uuid';

const CampaignDetailScreen = ({ route }) => {
  const { campaign } = route.params;
  const navigation = useNavigation();

  const [qrVisible, setQrVisible] = useState(false);
  const [donationId, setDonationId] = useState(null);

  // Format tiền tệ
  const formatCurrency = (amount) => {
    if (!amount) return '0 đ';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const calculateDaysLeft = (endDate) => {
    if (!endDate) return 0;
    const now = new Date();
    const end = new Date(endDate);
    const diffTime = end - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const daysLeft = calculateDaysLeft(campaign.end_date);
  const progress = Math.min(
    100,
    Math.round((campaign.current_amount / campaign.goal_amount) * 100)
  );

  // Gửi dữ liệu ủng hộ & tạo mã QR
  const handleDonate = async () => {
    const newId = uuidv4();
    setDonationId(newId);

    try {
      await fetch('http://localhost:3001/api/initiate-donation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donationId: newId,
          campaignId: campaign.id,
          amount: campaign.goal_amount, // hoặc bạn có thể thêm input chọn số tiền
          createdAt: new Date(),
        }),
      });

      setQrVisible(true);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tạo mã ủng hộ. Vui lòng thử lại.');
    }
  };

  // Tạo URL QR
  const generateQRUrl = (id) => {
    const acc = '686829078888';
    const bank = 'MBBank';
    return `https://qr.sepay.vn/img?acc=${acc}&bank=${bank}&des=${id}&template=compact&download=false`;
  };

  // Kiểm tra trạng thái ủng hộ (polling)
  useEffect(() => {
    let interval = null;

    if (donationId && qrVisible) {
      interval = setInterval(async () => {
        try {
          const res = await fetch(`http://localhost:3001/api/check-donation/${donationId}`);
          const data = await res.json();

          if (data.status === 'confirmed') {
            clearInterval(interval);
            Alert.alert('🎉 Cảm ơn bạn', 'Thông tin chuyển khoản đã được xác nhận!');
            setQrVisible(false);
            setDonationId(null);
          }
        } catch (error) {
          console.log('Polling error:', error);
        }
      }, 5000);
    }

    return () => clearInterval(interval);
  }, [donationId, qrVisible]);

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Home')}>
        <Text style={styles.backButtonText}>← Quay về Trang chủ</Text>
      </TouchableOpacity>

      <Image
        source={{ uri: campaign.image || 'https://via.placeholder.com/400x200' }}
        style={styles.image}
      />

      <View style={styles.header}>
        <Text style={styles.title}>{campaign.title}</Text>
        <Text style={styles.hashtag}>{campaign.hashtag || '#HiGreen'}</Text>
      </View>

      <Text style={styles.description}>{campaign.description}</Text>

      <View style={styles.statsSection}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Đã quyên góp:</Text>
          <Text style={styles.statValue}>{formatCurrency(campaign.current_amount)}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Mục tiêu:</Text>
          <Text style={styles.statValue}>{formatCurrency(campaign.goal_amount)}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Lượt ủng hộ:</Text>
          <Text style={styles.statValue}>{campaign.supporters_count || 0}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Còn lại:</Text>
          <Text style={styles.statValue}>{daysLeft} ngày</Text>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>{progress}% đạt được</Text>
      </View>

      <TouchableOpacity style={styles.donateButton} onPress={handleDonate}>
        <Text style={styles.donateButtonText}>Ủng hộ ngay 💝</Text>
      </TouchableOpacity>

      {/* MODAL QR */}
      <Modal visible={qrVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.qrBox}>
            <Text style={styles.qrTitle}>Quét mã QR để ủng hộ</Text>
            <Image
              source={{ uri: generateQRUrl(donationId) }}
              style={{ width: 200, height: 200 }}
            />
            <Text style={{ marginTop: 10 }}>Nội dung chuyển khoản: {donationId}</Text>
            <TouchableOpacity onPress={() => setQrVisible(false)} style={styles.closeButton}>
              <Text style={{ color: '#fff' }}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: '#fff', flex: 1 },
  image: { width: '100%', height: 220, resizeMode: 'cover' },
  header: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  hashtag: { fontSize: 14, color: '#4CAF50', fontWeight: '500' },
  description: { paddingHorizontal: 16, fontSize: 16, color: '#444', marginVertical: 12 },
  statsSection: { paddingHorizontal: 16, marginBottom: 16 },
  statItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  statLabel: { fontSize: 14, color: '#555' },
  statValue: { fontSize: 14, fontWeight: '600', color: '#111' },
  progressContainer: { paddingHorizontal: 16, alignItems: 'center', marginBottom: 20 },
  progressBar: { width: '100%', height: 10, backgroundColor: '#eee', borderRadius: 5, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#FF6B6B' },
  progressText: { marginTop: 8, fontSize: 14, color: '#555' },
  donateButton: { backgroundColor: '#FF6B6B', paddingVertical: 14, marginHorizontal: 40, borderRadius: 30, alignItems: 'center', marginBottom: 40 },
  donateButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  backButton: { marginTop: 16, marginHorizontal: 16, padding: 12, borderRadius: 8, backgroundColor: '#eee', alignSelf: 'flex-start' },
  backButtonText: { color: '#333', fontSize: 14, fontWeight: '600' },
  modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  qrBox: { backgroundColor: '#fff', padding: 20, borderRadius: 10, alignItems: 'center' },
  qrTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  closeButton: { marginTop: 20, backgroundColor: '#FF6B6B', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
});

export default CampaignDetailScreen;
