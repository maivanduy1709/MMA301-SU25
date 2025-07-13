import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  Dimensions,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const CharityHomepage = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [campaigns, setCampaigns] = useState([]);
  const [categories, setCategories] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigation = useNavigation();


  // Cấu hình API base URL - thay đổi theo server thật của bạn
  const API_BASE_URL = 'http://10.0.2.2:3001/api'; // Thay bằng URL thật
  

  // Hàm tạo key an toàn
  const generateSafeKey = (prefix, item, index) => {
    const id = item?.id || item?.uuid || item?.key || `${prefix}-${index}`;
    return `${prefix}-${id}`;
  };

  // Hàm normalize dữ liệu để đảm bảo có id
  const normalizeData = (data, prefix = 'item') => {
    if (!Array.isArray(data)) return [];
    
    return data.map((item, index) => ({
      ...item,
      id: item.id || item.uuid || item.key || `${prefix}-${index}`,
    }));
  };

  // Hàm gọi API với error handling
  const apiCall = async (endpoint, options = {}) => {
    try {
      const response = await axios({
        url: `${API_BASE_URL}${endpoint}`,
        method: 'GET',
        timeout: 10000, // 10 giây timeout
        ...options,
      });
      return response.data;
    } catch (error) {
      console.error(`❌ API Error [${endpoint}]:`, error.message);
      throw error;
    }
  };

  // Fetch dữ liệu từ API
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Gọi tất cả API song song để tăng hiệu suất
      const [
        campaignsData,
        categoriesData,
        organizationsData,
        eventsData,
        statsData
      ] = await Promise.allSettled([
        apiCall('/campaigns'),
        apiCall('/categories'),
        apiCall('/organizations'),
        apiCall('/events'),
        apiCall('/dashboard/stats')
      ]);

      // Xử lý campaigns
      if (campaignsData.status === 'fulfilled') {
        const campaigns = campaignsData.value.campaigns || campaignsData.value;
        setCampaigns(normalizeData(campaigns, 'campaign'));
      } else {
        console.warn('Failed to fetch campaigns:', campaignsData.reason);
      }

      // Xử lý categories
      if (categoriesData.status === 'fulfilled') {
        const categories = categoriesData.value.categories || categoriesData.value;
        setCategories(normalizeData(categories, 'category'));
      } else {
        console.warn('Failed to fetch categories:', categoriesData.reason);
      }

      // Xử lý organizations
      if (organizationsData.status === 'fulfilled') {
        const orgs = organizationsData.value.organizations || organizationsData.value;
        setOrganizations(normalizeData(orgs, 'organization'));
      } else {
        console.warn('Failed to fetch organizations:', organizationsData.reason);
      }

      // Xử lý events
      if (eventsData.status === 'fulfilled') {
        const events = eventsData.value.events || eventsData.value;
        setEvents(normalizeData(events, 'event'));
      } else {
        console.warn('Failed to fetch events:', eventsData.reason);
      }

      // Xử lý stats
      if (statsData.status === 'fulfilled') {
        const stats = statsData.value.stats || statsData.value;
        setStats(stats);
      } else {
        console.warn('Failed to fetch stats:', statsData.reason);
      }

    } catch (err) {
      console.error('❌ Lỗi khi tải dữ liệu:', err);
      setError('Không thể tải dữ liệu. Vui lòng kiểm tra kết nối mạng.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Hàm format số tiền
  const formatCurrency = (amount) => {
    if (!amount) return '0 đ';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  // Hàm format ngày
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Hàm tính số ngày còn lại
  const calculateDaysLeft = (endDate) => {
    if (!endDate) return 0;
    const now = new Date();
    const end = new Date(endDate);
    const diffTime = end - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B6B" />
          <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const TabButton = ({ icon, label, isActive, onPress }) => (
    <TouchableOpacity style={styles.tabButton} onPress={onPress}>
      <Text style={[styles.tabIcon, isActive && styles.activeTabIcon]}>{icon}</Text>
      <Text style={[styles.tabLabel, isActive && styles.activeTabLabel]}>{label}</Text>
    </TouchableOpacity>
  );

 // Thay thế CampaignCard component hiện tại bằng code này

const CampaignCard = ({ campaign }) => {
  const navigation = useNavigation(); 
  const daysLeft = calculateDaysLeft(campaign.end_date);
  const progressPercentage = Math.round((campaign.current_amount / campaign.goal_amount) * 100) || 0;
  
  return (
    <TouchableOpacity 
      style={styles.campaignCard}
      activeOpacity={0.9}
     onPress={() => navigation.navigate('CampaignDetail', { campaign })}

    >
      <View style={styles.campaignImageContainer}>
        <Image
          source={{ uri: campaign.image || 'https://tse1.mm.bing.net/th/id/OIP.9r6r7C-Q7RwQae80y9MK3gHaFj?pid=Api' }}
          style={styles.campaignBackgroundImage}
        />
        <View style={styles.gradientOverlay} />
        
        {/* Overlay Content */}
        <View style={styles.campaignOverlay}>
          <View style={styles.topSection}>
            <View style={styles.hashtagContainer}>
              <Text style={styles.hashtag}>
                {campaign.hashtag || '#HiGreen'}
              </Text>
            </View>
          </View>
          
          <View style={styles.bottomSection}>
            <Text style={styles.campaignTitleOverlay}>
              {campaign.title?.toUpperCase() || 'TRƯỜNG SA'}
            </Text>
            <Text style={styles.campaignSubtitle}>
              {campaign.description || 'Gửi lòng yêu nước\nGóp 1 triệu cây xanh'}
            </Text>
            
            <View style={styles.progressSection}>
              <View style={styles.amountRow}>
                <Text style={styles.raisedAmountOverlay}>
                  {formatCurrency(campaign.current_amount)}
                </Text>
                <Text style={styles.progressPercentageOverlay}>
                  {progressPercentage}%
                </Text>
              </View>
              
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBarOverlay}>
                  <View style={[styles.progressOverlay, { width: `${progressPercentage}%` }]} />
                </View>
              </View>
            </View>
          </View>
        </View>
        
        {/* Donation Icon */}
        <View style={styles.donationIconContainer}>
          <View style={styles.donationIcon}>
            <Text style={styles.donationIconText}>💝</Text>
          </View>
        </View>
      </View>
      
      {/* Bottom Info Section */}
      <View style={styles.bottomInfo}>
        <Text style={styles.campaignTitle} numberOfLines={2}>
          {campaign.title || 'Chương trình trồng 1 triệu cây xanh cho Trường Sa'}
        </Text>
        <View style={styles.statsRow}>
          <Text style={styles.supportersText}>
            {campaign.supporters_count || 51694} lượt ủng hộ
          </Text>
          <Text style={styles.daysLeftText}>
            Còn lại {daysLeft} ngày
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// Cập nhật styles - thêm các style này vào StyleSheet hiện tại
const updatedStyles = StyleSheet.create({
  // Giữ nguyên tất cả styles hiện có và thêm những style mới này:
  
  campaignCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    overflow: 'hidden',
  },
  
  campaignImageContainer: {
    position: 'relative',
    height: 200,
    overflow: 'hidden',
  },
  
  campaignBackgroundImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  
  campaignOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    justifyContent: 'space-between',
  },
  
  topSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  
  hashtagContainer: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  
  hashtag: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  
  bottomSection: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  
  campaignTitleOverlay: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  
  campaignSubtitle: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 16,
    lineHeight: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  
  progressSection: {
    marginTop: 8,
  },
  
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  
  raisedAmountOverlay: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  
  progressPercentageOverlay: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  
  progressBarContainer: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  
  progressBarOverlay: {
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
  },
  
  progressOverlay: {
    height: '100%',
    backgroundColor: '#FF9800',
    borderRadius: 4,
  },
  
  donationIconContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  
  donationIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  
  donationIconText: {
    fontSize: 20,
  },
  
  bottomInfo: {
    padding: 16,
    backgroundColor: '#fff',
  },
  
  campaignTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    lineHeight: 22,
  },
  
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  supportersText: {
    fontSize: 14,
    color: '#666',
  },
  
  daysLeftText: {
    fontSize: 14,
    color: '#666',
  },
  
  // Xóa hoặc comment các style cũ không cần thiết:
  /*
  priorityBadge: {
    backgroundColor: 'rgba(255, 107, 107, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  
  priorityText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  
  campaignDescription: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 12,
    lineHeight: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  
  amountSection: {
    marginTop: 8,
  },
  
  goalAmountOverlay: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.8,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  statIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  
  statText: {
    fontSize: 12,
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  */
});

// Để sử dụng, merge updatedStyles vào styles hiện tại:
// const styles = StyleSheet.create({
//   ...existingStyles,
//   ...updatedStyles,
// });

  const ConnectionNetwork = () => (
    <View style={styles.connectionNetwork}>
      <Text style={styles.networkTitle}>
        Thiện Nguyện tự hào được đồng hành cùng bạn trên hành trình{' '}
        <Text style={styles.highlightText}>lan tỏa yêu thương</Text>
      </Text>
      <View style={styles.networkContainer}>
        <View style={styles.centerHeart}>
          <Text style={styles.heartIcon}>❤️</Text>
        </View>
        {/* Hiển thị một số avatar từ organizations */}
        {organizations.slice(0, 4).map((org, index) => (
          <View
            key={generateSafeKey('org-avatar', org, index)}
            style={[
              styles.userAvatar,
              {
                position: 'absolute',
                top: index === 0 ? 20 : index === 1 ? 60 : index === 2 ? 120 : 100,
                left: index === 0 ? 50 : index === 1 ? 250 : index === 2 ? 200 : 30,
              },
            ]}
          >
            <Image 
              source={{ uri: org.logo || 'https://via.placeholder.com/40x40' }} 
              style={styles.avatarImage} 
            />
          </View>
        ))}
      </View>
    </View>
  );

  const refreshData = async () => {
    await fetchData();
  };

  

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#FF6B6B" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>Môi trường</Text>
            <Text style={styles.categorySubtext}>
              {new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} 🌙
            </Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.educationBadge}>
            <Text style={styles.categoryText}>Tổng chiến dịch</Text>
            <Text style={styles.categoryCount}>
              {stats.total_campaigns || campaigns.length} chiến dịch
            </Text>
          </View>
        </View>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refreshData}>
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Welcome Message */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>
            Chào mừng bạn đến với{' '}
            <Text style={styles.highlightText}>Cộng đồng người Việt nhân ái</Text>
          </Text>
          <View style={styles.filterTags}>
            {categories.slice(0, 3).map((category, index) => (
              <TouchableOpacity 
                key={generateSafeKey('filter', category, index)}
                style={styles.filterTag}
                onPress={() => {
                  // Handle filter by category
                  Alert.alert('Lọc', `Lọc theo danh mục: ${category.name}`);
                }}
              >
                <Text style={styles.filterTagText}>
                  {category.icon} {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Organization Badges */}
        <View style={styles.orgBadges}>
          {organizations.slice(0, 5).map((org, index) => (
            <TouchableOpacity 
              key={generateSafeKey('org-badge', org, index)}
              style={styles.orgBadge}
              onPress={() => {
                Alert.alert('Tổ chức', `Xem chi tiết: ${org.name}`);
              }}
            >
              <Text style={styles.orgBadgeText}>
                {org.badge_type === 'verified' ? '⭐' : 
                 org.badge_type === 'trusted' ? '🏆' : '👤'} {org.short_name || org.name}
              </Text>
              {org.description && (
                <Text style={styles.orgBadgeSubtext}>{org.description}</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Categories */}
        <View style={styles.categoriesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Chiến dịch quan tâm</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>Xem tất cả ›</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.categoriesGrid}>
            {categories.map((category, index) => (
              <TouchableOpacity
                key={generateSafeKey('cat', category, index)}
                style={[styles.categoryCard, { backgroundColor: category.color }]}
                onPress={() => {
                  Alert.alert('Danh mục', `Xem chiến dịch: ${category.name}`);
                }}
              >
                <Text style={styles.categoryIcon}>{category.icon}</Text>
                <Text style={styles.categoryName}>{category.name}</Text>
                <Text style={styles.categoryCount}>
                  {category.campaigns_count || 0} chiến dịch
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Connection Network */}
        <ConnectionNetwork />

        {/* Campaigns */}
        <View style={styles.campaignsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Chiến dịch nổi bật</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>Xem tất cả ›</Text>
            </TouchableOpacity>
          </View>
          {campaigns.slice(0, 5).map((campaign, index) => (
            <CampaignCard key={generateSafeKey('campaign', campaign, index)} campaign={campaign} />
          ))}
        </View>

        {/* Events */}
        {events.length > 0 && (
          <View style={styles.featuredSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Sự kiện sắp tới</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>Xem tất cả ›</Text>
              </TouchableOpacity>
            </View>
            {events.slice(0, 3).map((event, index) => (
              <CampaignCard key={generateSafeKey('event', event, index)} campaign={{...event, type: 'event'}} />
            ))}
          </View>
        )}

        {/* Stats Section */}
        {Object.keys(stats).length > 0 && (
          <View style={styles.statsSection}>
            <Text style={styles.sectionTitle}>Thống kê tổng quan</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{stats.total_campaigns || 0}</Text>
                <Text style={styles.statLabel}>Tổng chiến dịch</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{formatCurrency(stats.total_raised || 0)}</Text>
                <Text style={styles.statLabel}>Đã quyên góp</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{stats.total_supporters || 0}</Text>
                <Text style={styles.statLabel}>Người ủng hộ</Text>
              </View>
            </View>
          </View>
        )}

        {/* Bottom spacing */}
        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TabButton
          icon="❤️"
          label="Trang chủ"
          isActive={activeTab === 'home'}
          onPress={() => setActiveTab('home')}
        />
        <TabButton
          icon="👥"
          label="Ủng hộ"
          isActive={activeTab === 'support'}
    onPress={() => {
    setActiveTab('support');
    navigation.navigate('SupportPage');
  }}
          
        />
        <TabButton
          icon="💬"
          label="Bảng tin"
          isActive={activeTab === 'news'}
          onPress={() => {
    setActiveTab('news');
    navigation.navigate('NewsFeed');
  }}
        />
        <TabButton
          icon="🔍"
          label="Khám phá"
          isActive={activeTab === 'explore'}
          onPress={() => setActiveTab('explore')}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    backgroundColor: '#FFF3F3',
    padding: 12,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B6B',
  },
  errorText: {
    color: '#CC0000',
    fontSize: 14,
    marginBottom: 8,
  },
  retryButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FF6B6B',
    borderRadius: 6,
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F8F9FA',
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flex: 1,
  },
  categoryBadge: {
    backgroundColor: '#E6E6FA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  educationBadge: {
    backgroundColor: '#E0F7FA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  categorySubtext: {
    fontSize: 10,
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  welcomeSection: {
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    color: '#333',
    marginBottom: 16,
  },
  highlightText: {
    color: '#FF6B6B',
  },
  filterTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  filterTag: {
    backgroundColor: '#E9ECEF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  filterTagText: {
    fontSize: 12,
    color: '#666',
  },
  orgBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
  },
  orgBadge: {
    backgroundColor: '#FFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    alignItems: 'center',
  },
  orgBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  orgBadgeSubtext: {
    fontSize: 10,
    color: '#666',
  },
  categoriesSection: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  seeAllText: {
    fontSize: 14,
    color: '#FF6B6B',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  categoryCount: {
    fontSize: 12,
    color: '#666',
  },
  connectionNetwork: {
    padding: 16,
    alignItems: 'center',
  },
  networkTitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#333',
    marginBottom: 24,
  },
  networkContainer: {
    width: '100%',
    height: 200,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerHeart: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FF6B6B',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  heartIcon: {
    fontSize: 24,
    color: '#FFF',
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E9ECEF',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  campaignsSection: {
    padding: 16,
  },
  campaignCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  gradientCard: {
    padding: 16,
    borderRadius: 12,
    minHeight: 200,
    backgroundColor: '#4A90E2',
  },
  campaignTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 16,
  },
  shareButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  shareButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  campaignImage: {
    width: 120,
    height: 90,
    borderRadius: 8,
    alignSelf: 'flex-end',
  },
  campaignBanner: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  campaignContent: {
    padding: 16,
  },
  hashtag: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
    marginBottom: 4,
  },
  campaignLocation: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  campaignSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E9ECEF',
    borderRadius: 4,
    marginRight: 8,
  },
  progress: {
    height: '100%',
    backgroundColor: '#FF6B6B',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
  },
  raisedAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  campaignStats: {
    fontSize: 12,
    color: '#666',
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  eventLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  eventDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  eventParticipants: {
    fontSize: 14,
    color: '#666',
  },
  featuredSection: {
    padding: 16,
  },
  statsSection: {
    padding: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginHorizontal: 4,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
    paddingVertical: 8,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  tabLabel: {
    fontSize: 12,
    color: '#666',
  },
  activeTabIcon: {
    color: '#FF6B6B',
  },
  activeTabLabel: {
    color: '#FF6B6B',
    fontWeight: '600',
  },
});

export default CharityHomepage;