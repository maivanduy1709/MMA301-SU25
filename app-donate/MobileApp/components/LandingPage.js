import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  RefreshControl,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
  FlatList,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';

const { width, height } = Dimensions.get('window');

const LandingPage = () => {
  const [supportedPeople, setSupportedPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [donationAmount, setDonationAmount] = useState('');
  const [donorName, setDonorName] = useState('');
  const [message, setMessage] = useState('');

  // Fetch supported people data
  const fetchSupportedPeople = async () => {
    try {
      const response = await fetch('http://10.0.2.2:3001/api/supported-people') 
      const data = await response.json();
      // Chọn 2 người đầu tiên từ danh sách
      setSupportedPeople(data.slice(0, 2));
    } catch (error) {
      console.error('Error fetching supported people:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách người cần hỗ trợ');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSupportedPeople();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchSupportedPeople();
  };

  const handleDonate = (person) => {
    setSelectedPerson(person);
    setModalVisible(true);
  };

  const submitDonation = () => {
    if (!donationAmount || !donorName) {
      Alert.alert('Thông báo', 'Vui lòng điền đầy đủ thông tin');
      return;
    }

    Alert.alert(
      'Xác nhận ủng hộ',
      `Bạn có chắc chắn muốn ủng hộ ${donationAmount} VND cho ${selectedPerson?.name}?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xác nhận',
          onPress: () => {
            // Xử lý logic ủng hộ ở đây
            setModalVisible(false);
            setDonationAmount('');
            setDonorName('');
            setMessage('');
            Alert.alert('Thành công', 'Cảm ơn bạn đã ủng hộ!');
          },
        },
      ]
    );
  };

  const renderPersonCard = ({ item }) => (
    <View style={styles.personCard}>
      <Image 
        source={{ uri: item.image || 'https://via.placeholder.com/300x200' }} 
        style={styles.personImage}
      />
      <View style={styles.personInfo}>
        <Text style={styles.personName}>{item.name}</Text>
        <Text style={styles.personAge}>Tuổi: {item.age}</Text>
        <Text style={styles.personLocation}>Địa chỉ: {item.location}</Text>
        <Text style={styles.personStory} numberOfLines={3}>
          {item.story || 'Hoàn cảnh khó khăn, cần sự hỗ trợ của mọi người'}
        </Text>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${((item.raised || 0) / (item.goal || 1)) * 100}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            {(item.raised || 0).toLocaleString()} / {(item.goal || 0).toLocaleString()} VND
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.donateButton}
          onPress={() => handleDonate(item)}
        >
          <Text style={styles.donateButtonText}>Ủng hộ ngay</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Đang tải...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2E7D32" />
      
      {/* Header */}
      <LinearGradient
        colors={['#4CAF50', '#2E7D32']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Cặp lá yêu thương</Text>
          <Text style={styles.headerSubtitle}>Trao cơ hội đi học - Cho cơ hội đổi đời</Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Image
            source={{ uri: 'https://caplayeuthuong.vn/wp-content/uploads/2024/07/2.png' }}
            style={styles.heroImage}
          />
          <Text style={styles.heroTitle}>
            Hành trình cùng em viết tiếp ước mơ tới trường
          </Text>
          <Text style={styles.heroDescription}>
            Ra đời cùng sứ mệnh "Trao cơ hội đi học – Cho cơ hội đổi đời", 
            Cặp lá yêu thương là cầu nối giữa những trái tim nhân ái với các em nhỏ 
            có hoàn cảnh khó khăn, để mang tới sự đồng hành và hỗ trợ lâu dài.
          </Text>
        </View>

        {/* Stats Section */}
        <View style={styles.statsSection}>
          <View style={styles.statItem}>
            <Ionicons name="people" size={24} color="#4CAF50" />
            <Text style={styles.statNumber}>1,234</Text>
            <Text style={styles.statLabel}>Trẻ em được hỗ trợ</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="heart" size={24} color="#4CAF50" />
            <Text style={styles.statNumber}>5,678</Text>
            <Text style={styles.statLabel}>Người ủng hộ</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="school" size={24} color="#4CAF50" />
            <Text style={styles.statNumber}>890</Text>
            <Text style={styles.statLabel}>Học bổng</Text>
          </View>
        </View>

        {/* Supported People Section */}
        <View style={styles.supportedSection}>
          <Text style={styles.sectionTitle}>Những em cần được hỗ trợ</Text>
          <FlatList
            data={supportedPeople}
            renderItem={renderPersonCard}
            keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
          />
        </View>

        {/* Call to Action */}
        <View style={styles.ctaSection}>
          <Text style={styles.ctaTitle}>Hãy cùng chúng tôi tạo nên những thay đổi tích cực</Text>
          <Text style={styles.ctaDescription}>
            Mỗi sự đóng góp của bạn sẽ giúp một em nhỏ có cơ hội đến trường và thay đổi cuộc đời
          </Text>
          <TouchableOpacity style={styles.ctaButton}>
            <Text style={styles.ctaButtonText}>Tham gia ngay</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Donation Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Ủng hộ cho {selectedPerson?.name}
            </Text>
            
            <TextInput
              style={styles.input}
              placeholder="Số tiền ủng hộ (VND)"
              value={donationAmount}
              onChangeText={setDonationAmount}
              keyboardType="numeric"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Tên người ủng hộ"
              value={donorName}
              onChangeText={setDonorName}
            />
            
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Lời nhắn (không bắt buộc)"
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={3}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmButton]}
                onPress={submitDonation}
              >
                <Text style={styles.confirmButtonText}>Xác nhận</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    paddingTop: StatusBar.currentHeight + 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#FFF',
    opacity: 0.9,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  heroSection: {
    backgroundColor: '#FFF',
    padding: 20,
    alignItems: 'center',
  },
  heroImage: {
    width: width - 40,
    height: 200,
    borderRadius: 10,
    marginBottom: 15,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  heroDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  statsSection: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    marginTop: 10,
    paddingVertical: 20,
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  supportedSection: {
    backgroundColor: '#FFF',
    marginTop: 10,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  personCard: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  personImage: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  personInfo: {
    padding: 15,
  },
  personName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  personAge: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  personLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  personStory: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 15,
  },
  progressContainer: {
    marginBottom: 15,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 5,
  },
  donateButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  donateButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  ctaSection: {
    backgroundColor: '#FFF',
    marginTop: 10,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  ctaTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  ctaDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  ctaButton: {
    backgroundColor: '#FF5722',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  ctaButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 20,
    width: width - 40,
    maxHeight: height * 0.8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#E0E0E0',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: 'bold',
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
  },
  confirmButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  });

export default LandingPage;