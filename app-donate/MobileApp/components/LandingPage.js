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
  Animated,
  Share,
  Linking,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';


const { width, height } = Dimensions.get('window');

const LandingPage = () => {
  const [supportedPeople, setSupportedPeople] = useState([]);
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [donationAmount, setDonationAmount] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [donorName, setDonorName] = useState('');
  const [donorPhone, setDonorPhone] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [message, setMessage] = useState('');
  const [animationValue] = useState(new Animated.Value(0));
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showQRInDetail, setShowQRInDetail] = useState(false);
  const [totalStats, setTotalStats] = useState({
    totalSupported: 0,
    totalDonors: 0,
    totalAmount: 0,
    totalScholarships: 0
  });

  // Predefined donation amounts
  const donationAmounts = [
    { label: '50,000 VND', value: '50000' },
    { label: '100,000 VND', value: '100000' },
    { label: '200,000 VND', value: '200000' },
    { label: '500,000 VND', value: '500000' },
    { label: '1,000,000 VND', value: '1000000' },
    { label: 'Khác', value: 'custom' },
  ];

  // Filter options
  const filterOptions = [
    { label: 'Tất cả', value: 'all' },
    { label: 'Cần gấp', value: 'urgent' },
    { label: 'Gần hoàn thành', value: 'nearly_complete' },
    { label: 'Mới bắt đầu', value: 'new' },
  ];

  // Fetch supported people data
  const fetchSupportedPeople = async () => {
    try {
      // Thay đổi URL để phù hợp với môi trường thực tế
      const apiUrl = Platform.OS === 'android' 
        ? 'http://10.0.2.2:3001/api/supported-people'
        : 'http://localhost:3001/api/supported-people';
        
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      
      // Process data and calculate stats
      const processedData = data.map(person => ({
        ...person,
        progressPercentage: ((person.raised || 0) / (person.goal || 1)) * 100,
        urgency: getUrgencyLevel(person),
        remainingAmount: (person.goal || 0) - (person.raised || 0)
      }));

      setSupportedPeople(processedData);
      
      // Calculate total stats
      const stats = {
        totalSupported: data.length,
        totalDonors: data.reduce((sum, person) => sum + (person.donorCount || 0), 0),
        totalAmount: data.reduce((sum, person) => sum + (person.raised || 0), 0),
        totalScholarships: data.filter(person => person.progressPercentage >= 100).length
      };
      setTotalStats(stats);
      
    } catch (error) {
      console.error('Error fetching supported people:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách người cần hỗ trợ. Vui lòng kiểm tra kết nối mạng.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Get urgency level based on progress and time
  const getUrgencyLevel = (person) => {
    const progress = ((person.raised || 0) / (person.goal || 1)) * 100;
    if (progress < 20) return 'urgent';
    if (progress > 80) return 'nearly_complete';
    return 'new';
  };

  // Filter people based on selected filter and search
  const getFilteredPeople = () => {
    let filtered = supportedPeople;

    // Apply filter
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(person => person.urgency === selectedFilter);
    }

    // Apply search
    if (searchQuery) {
      filtered = filtered.filter(person => 
        person.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        person.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  useEffect(() => {
    fetchSupportedPeople();
    startAnimation();
  }, []);

  const startAnimation = () => {
    Animated.timing(animationValue, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchSupportedPeople();
  };

  const handleDonate = (person) => {
    setSelectedPerson(person);
    setModalVisible(true);
  };

  const handleViewDetails = (person) => {
    setSelectedPerson(person);
    setDetailModalVisible(true);
  };

  const handleShare = async (person) => {
    try {
      const message = `Hãy cùng tôi giúp đỡ ${person.name} - ${person.age} tuổi từ ${person.location}. 
      
${person.story}

Đã gây quỹ được: ${person.raised?.toLocaleString()} / ${person.goal?.toLocaleString()} VND

Tham gia ủng hộ tại: https://caplayeuthuong.vn`;

      await Share.share({
        message,
        title: `Hỗ trợ ${person.name}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleCall = (phoneNumber) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const submitDonation = async () => {
    if (!donationAmount || !donorName || !donorPhone) {
      Alert.alert('Thông báo', 'Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    if (donationAmount === 'custom' && !customAmount) {
      Alert.alert('Thông báo', 'Vui lòng nhập số tiền ủng hộ');
      return;
    }

    const amount = donationAmount === 'custom' ? customAmount : donationAmount;

    Alert.alert(
      'Xác nhận ủng hộ',
      `Bạn có chắc chắn muốn ủng hộ ${parseInt(amount).toLocaleString()} VND cho ${selectedPerson?.name}?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xác nhận',
          onPress: async () => {
            try {
              const apiUrl = Platform.OS === 'android' 
                ? 'http://10.0.2.2:3001/api/donations'
                : 'http://localhost:3001/api/donations';
                
              const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  personId: selectedPerson.id,
                  amount: parseInt(amount),
                  donorName,
                  donorPhone,
                  donorEmail,
                  message,
                }),
              });

              if (response.ok) {
                resetModal();
                Alert.alert('Thành công', 'Cảm ơn bạn đã ủng hộ! Chúng tôi sẽ liên hệ với bạn sớm nhất.');
                fetchSupportedPeople(); // Refresh data
              } else {
                Alert.alert('Lỗi', 'Có lỗi xảy ra khi gửi thông tin. Vui lòng thử lại.');
              }
            } catch (error) {
              console.error('Error submitting donation:', error);
              Alert.alert('Lỗi', 'Không thể kết nối đến server. Vui lòng thử lại.');
            }
          },
        },
      ]
    );
  };
 const generateQRUrl = (id) => {
  const account = '686829078888';
  const bank = 'MBBank';
  const template = 'compact';
  const download = 'false';
  const query = `acc=${account}&bank=${bank}&des=${id}&template=${template}&download=${download}`;
  return `https://qr.sepay.vn/img?${query}`;
};




  const resetModal = () => {
    setModalVisible(false);
    setDetailModalVisible(false);
    setDonationAmount('');
    setCustomAmount('');
    setDonorName('');
    setDonorPhone('');
    setDonorEmail('');
    setMessage('');
  };

  const renderPersonCard = ({ item }) => (
  <Animated.View style={[styles.personCard, { opacity: animationValue }]}>
    <View style={styles.personInfo}>
      <View style={styles.personHeader}>
        <Text style={styles.personName}>{item.name}</Text>
        <TouchableOpacity onPress={() => handleShare(item)}>
          <Icon name="share-social" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      <View style={styles.personMeta}>
        <View style={styles.metaItem}>
          <Icon name="person" size={14} color="#666" />
          <Text style={styles.metaText}>{item.age} tuổi</Text>
        </View>
        <View style={styles.metaItem}>
          <Icon name="location" size={14} color="#666" />
          <Text style={styles.metaText}>{item.location}</Text>
        </View>
      </View>

      <Text style={styles.personStory} numberOfLines={3}>
        {item.story}
      </Text>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: `${Math.min(item.progressPercentage, 100)}%`,
                backgroundColor:
                  item.progressPercentage >= 100 ? '#4CAF50' : '#FF9800',
              },
            ]}
          />
        </View>
        <View style={styles.progressInfo}>
          <Text style={styles.progressText}>
            {(item.raised || 0).toLocaleString()} / {(item.goal || 0).toLocaleString()} VND
          </Text>
          <Text style={styles.progressPercentage}>
            {Math.round(item.progressPercentage)}%
          </Text>
        </View>
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity
          style={styles.detailButton}
          onPress={() => handleViewDetails(item)}
        >
          <Icon name="information-circle" size={16} color="#4CAF50" />
          <Text style={styles.detailButtonText}>Chi tiết</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.donateButton}
          onPress={() => handleDonate(item)}
        >
          <Icon name="heart" size={16} color="#FFF" />
          <Text style={styles.donateButtonText}>Ủng hộ</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Animated.View>
);


  const renderFilterButton = ({ item }) => (
    <TouchableOpacity 
      style={[
        styles.filterButton,
        selectedFilter === item.value && styles.filterButtonActive
      ]}
      onPress={() => setSelectedFilter(item.value)}
    >
      <Text style={[
        styles.filterButtonText,
        selectedFilter === item.value && styles.filterButtonTextActive
      ]}>
        {item.label}
      </Text>
    </TouchableOpacity>
  );

  const renderDonationAmount = ({ item }) => (
    <TouchableOpacity 
      style={[
        styles.amountButton,
        donationAmount === item.value && styles.amountButtonActive
      ]}
      onPress={() => setDonationAmount(item.value)}
    >
      <Text style={[
        styles.amountButtonText,
        donationAmount === item.value && styles.amountButtonTextActive
      ]}>
        {item.label}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
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
        <View style={styles.headerTop}>
  <Text style={styles.headerTitle}>Cặp lá yêu thương</Text>

  <View style={{ flexDirection: 'row' }}>
    <TouchableOpacity onPress={() => setShowSearch(!showSearch)} style={{ marginRight: 10 }}>
      <Icon name="search" size={24} color="#FFF" />
    </TouchableOpacity>

    {/* ➕ Thêm nút này */}
    <TouchableOpacity onPress={() => navigation.navigate('Giao dịch')}>
      <Icon name="list-circle" size={26} color="#FFF" />
    </TouchableOpacity>
  </View>
</View>

        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <Text style={styles.headerTitle}>Cặp lá yêu thương</Text>
            <TouchableOpacity onPress={() => setShowSearch(!showSearch)}>
              <Icon name="search" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>
          <Text style={styles.headerSubtitle}>Trao cơ hội đi học - Cho cơ hội đổi đời</Text>
          
          {showSearch && (
            <View style={styles.searchContainer}>
              <Icon name="search" size={20} color="#666" />
              <TextInput
                style={styles.searchInput}
                placeholder="Tìm kiếm theo tên hoặc địa chỉ..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#666"
              />
            </View>
          )}
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
            <Icon name="people" size={24} color="#4CAF50" />
            <Text style={styles.statNumber}>{totalStats.totalSupported.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Trẻ em được hỗ trợ</Text>
          </View>
          <View style={styles.statItem}>
            <Icon name="heart" size={24} color="#4CAF50" />
            <Text style={styles.statNumber}>{totalStats.totalDonors.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Người ủng hộ</Text>
          </View>
          <View style={styles.statItem}>
            <Icon name="wallet" size={24} color="#4CAF50" />
            <Text style={styles.statNumber}>{(totalStats.totalAmount / 1000000).toFixed(1)}M</Text>
            <Text style={styles.statLabel}>Tổng quyên góp</Text>
          </View>
          <View style={styles.statItem}>
            <Icon name="school" size={24} color="#4CAF50" />
            <Text style={styles.statNumber}>{totalStats.totalScholarships}</Text>
            <Text style={styles.statLabel}>Học bổng</Text>
          </View>
        </View>

        {/* Filter Section */}
        <View style={styles.filterSection}>
          <Text style={styles.filterTitle}>Lọc theo tình trạng:</Text>
          <FlatList
            data={filterOptions}
            renderItem={renderFilterButton}
            keyExtractor={(item) => item.value}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterList}
          />
        </View>

        {/* Supported People Section */}
        <View style={styles.supportedSection}>
          <Text style={styles.sectionTitle}>
            Những em cần được hỗ trợ ({getFilteredPeople().length})
          </Text>
          <FlatList
            data={getFilteredPeople()}
            renderItem={renderPersonCard}
            keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
            numColumns={1}
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

        {/* Contact Section */}
        <View style={styles.contactSection}>
          <Text style={styles.sectionTitle}>Liên hệ với chúng tôi</Text>
          <View style={styles.contactItem}>
            <Icon name="call" size={20} color="#4CAF50" />
            <TouchableOpacity onPress={() => handleCall('0123456789')}>
              <Text style={styles.contactText}>0123-456-789</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.contactItem}>
            <Icon name="mail" size={20} color="#4CAF50" />
            <Text style={styles.contactText}>info@caplayeuthuong.vn</Text>
          </View>
          <View style={styles.contactItem}>
            <Icon name="location" size={20} color="#4CAF50" />
            <Text style={styles.contactText}>Hà Nội, Việt Nam</Text>
          </View>
        </View>
      </ScrollView>

      {/* Detail Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={detailModalVisible}
        onRequestClose={() => setDetailModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.detailModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chi tiết về {selectedPerson?.name}</Text>
              <TouchableOpacity onPress={() => setDetailModalVisible(false)}>
                <Icon name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.detailScrollView}>
              <Image 
                source={{ uri: selectedPerson?.image || 'https://via.placeholder.com/300x200' }} 
                style={styles.detailImage}
              />
              
              <View style={styles.detailInfo}>
                <Text style={styles.detailName}>{selectedPerson?.name}</Text>
                <Text style={styles.detailAge}>Tuổi: {selectedPerson?.age}</Text>
                <Text style={styles.detailLocation}>Địa chỉ: {selectedPerson?.location}</Text>
                
                <Text style={styles.detailStoryTitle}>Câu chuyện:</Text>
                <Text style={styles.detailStory}>{selectedPerson?.story}</Text>
                
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill, 
                        { width: `${Math.min(selectedPerson?.progressPercentage || 0, 100)}%` }
                      ]} 
                    />
                  </View>
                  <View style={styles.progressInfo}>
                    <Text style={styles.progressText}>
                      {(selectedPerson?.raised || 0).toLocaleString()} / {(selectedPerson?.goal || 0).toLocaleString()} VND
                    </Text>
                    <Text style={styles.progressPercentage}>
                      {Math.round(selectedPerson?.progressPercentage || 0)}%
                    </Text>
                  </View>
                </View>
                
                <View style={styles.detailActions}>
                  <TouchableOpacity 
                    style={styles.shareButton}
                    onPress={() => handleShare(selectedPerson)}
                  >
                    <Icon name="share-social" size={16} color="#4CAF50" />
                    <Text style={styles.shareButtonText}>Chia sẻ</Text>
                  </TouchableOpacity>
                  
            <TouchableOpacity 
  style={styles.donateButton}
  onPress={() => setShowQRInDetail(true)}
>
  <Icon name="heart" size={16} color="#FFF" />
  <Text style={styles.donateButtonText}>Ủng hộ ngay</Text>
</TouchableOpacity>
{selectedPerson && (
  <View style={{ alignItems: 'center', marginTop: 20 }}>
    <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>
      Quét mã QR để chuyển khoản
    </Text>
    <Image
      source={{
        uri: generateQRUrl(selectedPerson.id),
        
      }}
      style={{ width: 200, height: 200, borderRadius: 8 }}
      resizeMode="contain"
    />
    <Text style={{ fontSize: 12, color: '#666', marginTop: 10 }}>
      Nội dung chuyển khoản: {selectedPerson.id}
    </Text>
  </View>
)}




                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Donation Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Ủng hộ cho {selectedPerson?.name}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Icon name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalScrollView}>
              <Text style={styles.sectionLabel}>Chọn số tiền ủng hộ:</Text>
              <FlatList
                data={donationAmounts}
                renderItem={renderDonationAmount}
                keyExtractor={(item) => item.value}
                numColumns={2}
                scrollEnabled={false}
                style={styles.amountGrid}
              />
              
              {donationAmount === 'custom' && (
                <TextInput
                  style={styles.input}
                  placeholder="Nhập số tiền (VND)"
                  value={customAmount}
                  onChangeText={setCustomAmount}
                  keyboardType="numeric"
                />
              )}
              
              <Text style={styles.sectionLabel}>Thông tin người ủng hộ:</Text>
              <TextInput
                style={styles.input}
                placeholder="Họ và tên *"
                value={donorName}
                onChangeText={setDonorName}
              />
              
              <TextInput
                style={styles.input}
                placeholder="Số điện thoại *"
                value={donorPhone}
                onChangeText={setDonorPhone}
                keyboardType="phone-pad"
              />
              
              <TextInput
                style={styles.input}
                placeholder="Email (không bắt buộc)"
                value={donorEmail}
                onChangeText={setDonorEmail}
                keyboardType="email-address"
              />
              
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Lời nhắn gửi tới em bé (không bắt buộc)"
                value={message}
                onChangeText={setMessage}
                multiline
                numberOfLines={3}
              />

              {selectedPerson && donationAmount && (donationAmount !== 'custom' || customAmount) && (
  <View style={{ alignItems: 'center', marginTop: 20 }}>
    <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>
      Quét mã QR để chuyển khoản 
    </Text>
    <Image
      source={{
        uri: generateQRUrl(
          selectedPerson.id,
          donationAmount === 'custom' ? customAmount : donationAmount
        ),
      }}
      style={{ width: 200, height: 200, borderRadius: 8 }}
      resizeMode="contain"
    />
    <Text style={{ fontSize: 12, color: '#666', marginTop: 10 }}>
      <Text>Debug ID: {selectedPerson?.id}</Text>
      Nội dung chuyển khoản: {selectedPerson.id}
      
    </Text>
  </View>
)}

              
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
                  <Text style={styles.confirmButtonText}>Xác nhận ủng hộ</Text>
                </TouchableOpacity>
              </View>
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
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 5,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#FFF',
    opacity: 0.9,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginTop: 15,
    width: '100%',
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
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
    textAlign: 'center',
  },
  filterSection: {
    backgroundColor: '#FFF',
    marginTop: 10,
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  filterList: {
    flexGrow: 0,
  },
 
  filterButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    marginRight: 10,
  },
  filterButtonActive: {
    backgroundColor: '#4CAF50',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#666',
  },
  filterButtonTextActive: {
    color: '#FFF',
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