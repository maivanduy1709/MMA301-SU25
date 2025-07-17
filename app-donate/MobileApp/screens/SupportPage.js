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
  TextInput,
  FlatList,
  Modal,
} from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const SupportPage = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  // Cấu hình API base URL
  const API_BASE_URL = 'http://10.0.2.2:3001/api';

  // Hàm tạo key an toàn
  const generateSafeKey = (prefix, item, index) => {
    const id = item?.id || item?.uuid || item?.key || `${prefix}-${index}`;
    return `${prefix}-${id}`;
  };

  // Hàm normalize dữ liệu
  const normalizeData = (data, prefix = 'item') => {
    if (!Array.isArray(data)) return [];
    return data.map((item, index) => ({
      ...item,
      id: item.id || item.uuid || item.key || `${prefix}-${index}`,
    }));
  };

  // Hàm gọi API
  const apiCall = async (endpoint, options = {}) => {
    try {
      const response = await axios({
        url: `${API_BASE_URL}${endpoint}`,
        method: 'GET',
        timeout: 10000,
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

      const [campaignsData, categoriesData] = await Promise.allSettled([
        apiCall('/campaigns'),
        apiCall('/categories'),
      ]);

      if (campaignsData.status === 'fulfilled') {
        const campaigns = campaignsData.value.campaigns || campaignsData.value;
        setCampaigns(normalizeData(campaigns, 'campaign'));
      }

      if (categoriesData.status === 'fulfilled') {
        const categories = categoriesData.value.categories || categoriesData.value;
        setCategories(normalizeData(categories, 'category'));
      }

    } catch (err) {
      console.error('❌ Lỗi khi tải dữ liệu:', err);
      setError('Không thể tải dữ liệu. Vui lòng kiểm tra kết nối mạng.');
    } finally {
      setLoading(false);
    }
  };

  // Hàm refresh dữ liệu
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
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

  // Hàm lọc và sắp xếp chiến dịch
  const getFilteredCampaigns = () => {
    let filtered = campaigns;

    // Lọc theo tìm kiếm
    if (searchQuery) {
      filtered = filtered.filter(campaign =>
        campaign.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        campaign.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Lọc theo danh mục
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(campaign => 
        campaign.category_id === selectedCategory || 
        campaign.category?.id === selectedCategory
      );
    }

    // Sắp xếp
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        break;
      case 'most_funded':
        filtered.sort((a, b) => (b.current_amount || 0) - (a.current_amount || 0));
        break;
      case 'deadline':
        filtered.sort((a, b) => new Date(a.end_date) - new Date(b.end_date));
        break;
      default:
        break;
    }

    return filtered;
  };

  // Component Card chiến dịch
  const CampaignCard = ({ campaign, index }) => {
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
          
          <View style={styles.campaignOverlay}>
            <View style={styles.topSection}>
              <View style={styles.hashtagContainer}>
                <Text style={styles.hashtag}>
                  {campaign.hashtag || '#Charity'}
                </Text>
              </View>
              <View style={styles.priorityBadge}>
                <Text style={styles.priorityText}>
                  {daysLeft <= 7 ? 'Gấp' : 'Mở'}
                </Text>
              </View>
            </View>
            
            <View style={styles.bottomSection}>
              <Text style={styles.campaignTitleOverlay} numberOfLines={2}>
                {campaign.title?.toUpperCase() || 'CHIẾN DỊCH THIỆN NGUYỆN'}
              </Text>
              <Text style={styles.campaignSubtitle} numberOfLines={3}>
                {campaign.description || 'Hãy cùng chung tay giúp đỡ những hoàn cảnh khó khăn'}
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
                    <View style={[styles.progressOverlay, { width: `${Math.min(progressPercentage, 100)}%` }]} />
                  </View>
                </View>
              </View>
            </View>
          </View>
          
          <View style={styles.donationIconContainer}>
            <View style={styles.donationIcon}>
              <Text style={styles.donationIconText}>💝</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.bottomInfo}>
          <Text style={styles.campaignTitle} numberOfLines={2}>
            {campaign.title || 'Chiến dịch thiện nguyện'}
          </Text>
          <View style={styles.statsRow}>
            <Text style={styles.supportersText}>
              {campaign.supporters_count || 0} lượt ủng hộ
            </Text>
            <Text style={styles.daysLeftText}>
              Còn lại {daysLeft} ngày
            </Text>
          </View>
          <View style={styles.goalRow}>
            <Text style={styles.goalText}>
              Mục tiêu: {formatCurrency(campaign.goal_amount)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Component Modal lọc
  const FilterModal = () => (
    <Modal
      visible={showFilterModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowFilterModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Lọc chiến dịch</Text>
            <TouchableOpacity onPress={() => setShowFilterModal(false)}>
              <Text style={styles.modalCloseButton}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalBody}>
            {/* Danh mục */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Danh mục</Text>
              <TouchableOpacity 
                style={[styles.filterOption, selectedCategory === 'all' && styles.selectedFilter]}
                onPress={() => setSelectedCategory('all')}
              >
                <Text style={[styles.filterOptionText, selectedCategory === 'all' && styles.selectedFilterText]}>
                  Tất cả
                </Text>
              </TouchableOpacity>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[styles.filterOption, selectedCategory === category.id && styles.selectedFilter]}
                  onPress={() => setSelectedCategory(category.id)}
                >
                  <Text style={[styles.filterOptionText, selectedCategory === category.id && styles.selectedFilterText]}>
                    {category.icon} {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Sắp xếp */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Sắp xếp theo</Text>
              {[
                { key: 'newest', label: 'Mới nhất' },
                { key: 'oldest', label: 'Cũ nhất' },
                { key: 'most_funded', label: 'Quyên góp nhiều nhất' },
                { key: 'deadline', label: 'Sắp hết hạn' },
              ].map((option) => (
                <TouchableOpacity
                  key={option.key}
                  style={[styles.filterOption, sortBy === option.key && styles.selectedFilter]}
                  onPress={() => setSortBy(option.key)}
                >
                  <Text style={[styles.filterOptionText, sortBy === option.key && styles.selectedFilterText]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
          
          <View style={styles.modalFooter}>
            <TouchableOpacity 
              style={styles.applyButton}
              onPress={() => setShowFilterModal(false)}
            >
              <Text style={styles.applyButtonText}>Áp dụng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B6B" />
          <Text style={styles.loadingText}>Đang tải chiến dịch...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const filteredCampaigns = getFilteredCampaigns();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#FF6B6B" />
      
      {/* Header */}
      <View style={styles.header}>
  <Text style={styles.headerTitle}>Ủng hộ</Text>
  <View style={{ flexDirection: 'row', gap: 8 }}>
    <TouchableOpacity
      style={styles.headerButton}
      onPress={() => navigation.navigate('CreateCampaignScreen')}
    >
      <Text style={styles.headerButtonText}>➕ Tạo</Text>
    </TouchableOpacity>
    <TouchableOpacity
      style={styles.headerButton}
      onPress={() => setShowFilterModal(true)}
    >
      <Text style={styles.headerButtonText}>🔍 Lọc</Text>
    </TouchableOpacity>
  </View>
</View>


      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm chiến dịch..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
      </View>

      {/* Category Filter */}
      <View style={styles.categoryFilterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryFilter}>
          <TouchableOpacity 
            style={[styles.categoryFilterItem, selectedCategory === 'all' && styles.selectedCategoryFilter]}
            onPress={() => setSelectedCategory('all')}
          >
            <Text style={[styles.categoryFilterText, selectedCategory === 'all' && styles.selectedCategoryFilterText]}>
              Tất cả
            </Text>
          </TouchableOpacity>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[styles.categoryFilterItem, selectedCategory === category.id && styles.selectedCategoryFilter]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Text style={[styles.categoryFilterText, selectedCategory === category.id && styles.selectedCategoryFilterText]}>
                {category.icon} {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Results Count */}
      <View style={styles.resultsContainer}>
        <Text style={styles.resultsText}>
          Tìm thấy {filteredCampaigns.length} chiến dịch
        </Text>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchData}>
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Campaigns List */}
      <FlatList
        data={filteredCampaigns}
        renderItem={({ item, index }) => (
          <CampaignCard campaign={item} index={index} />
        )}
        keyExtractor={(item, index) => generateSafeKey('campaign', item, index)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.campaignsList}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Không tìm thấy chiến dịch nào</Text>
            <Text style={styles.emptySubtext}>Hãy thử tìm kiếm với từ khóa khác</Text>
          </View>
        }
      />

      <FilterModal />
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FF6B6B',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  filterButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  filterButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#F8F9FA',
  },
  searchInput: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  categoryFilterContainer: {
    backgroundColor: '#F8F9FA',
    paddingBottom: 16,
  },
  categoryFilter: {
    paddingHorizontal: 16,
  },
  categoryFilterItem: {
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  selectedCategoryFilter: {
    backgroundColor: '#FF6B6B',
    borderColor: '#FF6B6B',
  },
  categoryFilterText: {
    fontSize: 14,
    color: '#666',
  },
  selectedCategoryFilterText: {
    color: '#FFF',
    fontWeight: '600',
  },
  resultsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F8F9FA',
  },
  resultsText: {
    fontSize: 14,
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
  campaignsList: {
    padding: 16,
  },
  campaignCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
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
  bottomSection: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  campaignTitleOverlay: {
    fontSize: 24,
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
    marginBottom: 4,
  },
  supportersText: {
    fontSize: 14,
    color: '#666',
  },
  daysLeftText: {
    fontSize: 14,
    color: '#666',
  },
  goalRow: {
    marginTop: 4,
  },
  goalText: {
    fontSize: 14,
    color: '#FF6B6B',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: height * 0.7,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  modalCloseButton: {
    fontSize: 18,
    color: '#666',
    fontWeight: 'bold',
  },
  modalBody: {
    flex: 1,
    padding: 16,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  filterOption: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#F8F9FA',
  },
  selectedFilter: {
    backgroundColor: '#FF6B6B',
  },
  filterOptionText: {
    fontSize: 14,
    color: '#666',
  },
  selectedFilterText: {
    color: '#FFF',
    fontWeight: '600',
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
  },
  applyButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SupportPage;