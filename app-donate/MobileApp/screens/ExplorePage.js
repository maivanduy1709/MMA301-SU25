import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  FlatList, ScrollView, Image, ActivityIndicator,
  Alert, Dimensions, RefreshControl, Platform,
} from 'react-native';

const API_BASE_URL = __DEV__
  ? (Platform.OS === 'android' ? 'http://10.0.2.2:3001/api' : 'http://localhost:3001/api')
  : 'http://localhost:3001/api';

const { width } = Dimensions.get('window');

const ExplorePage = ({ navigation }) => {
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');
  const [trendingCampaigns, setTrendingCampaigns] = useState([]);
  const [topOrganizations, setTopOrganizations] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  // AI States - Optimized
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const processCampaignsData = (campaigns) => {
    return campaigns.map(campaign => {
      const targetAmount = campaign.goal_amount || 0;
      const raisedAmount = campaign.current_amount || 0;
      const progress = targetAmount > 0 ? Math.round((raisedAmount / targetAmount) * 100) : 0;

      return {
        ...campaign,
        target_amount: targetAmount,
        raised_amount: raisedAmount,
        progress,
        location: campaign.address || 'Chưa có thông tin',
        image: campaign.image || 'https://via.placeholder.com/300x200',
      };
    });
  };
useEffect(() => {
  const timeout = setTimeout(() => {
    setDebouncedSearch(search);
  }, 500); // 500ms delay sau khi ngưng gõ

  return () => clearTimeout(timeout); // clear nếu người dùng gõ tiếp
}, [search]);

  // AI Function - Optimized
  const fetchAiSuggestion = async () => {
    if (!search.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập từ khóa tìm kiếm');
      return;
    }

    setAiLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/genmini`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: `Gợi ý 3 chiến dịch từ thiện phù hợp với: ${search}. Trả lời ngắn gọn dưới 100 từ.` 
        }),
      });

      const data = await res.json();
      if (data.result) {
        setAiSuggestion(data.result);
        setShowAiPanel(true);
      } else {
        Alert.alert('Lỗi', 'Không có phản hồi từ AI');
      }
    } catch (err) {
      console.error('Lỗi gọi AI:', err);
      Alert.alert('Lỗi', 'Không thể kết nối AI');
    } finally {
      setAiLoading(false);
    }
  };

  const processOrganizationsData = (organizationsResponse) => {
    const organizations = organizationsResponse.organizations || [];
    return organizations.map(org => ({
      _id: org._id,
      name: org.name,
      short_name: org.short_name,
      description: org.description,
      logo: org.logo || 'https://via.placeholder.com/80x80',
      badge_type: org.badge_type,
      campaigns_count: org.campaigns_count || 0,
      total_raised: org.total_raised || 0,
      is_active: org.is_active,
    }));
  };

  const processTransactionsData = (transactionsResponse) => {
    const transactions = transactionsResponse.data || [];
    return transactions.slice(0, 10).map(transaction => {
      const raw = transaction.raw || {};
      return {
        _id: transaction._id,
        amount: raw.transferAmount || raw.amount || 0,
        gateway: raw.gateway || 'N/A',
        referenceCode: raw.referenceCode || 'N/A',
        content: raw.content || raw.message || 'Không có nội dung',
        transactionDate: raw.transactionDate || transaction.time || 'N/A',
        description: raw.description || 'Giao dịch thành công',
        type: transaction.type || 'Tiền vào',
      };
    });
  };

  const fetchExploreData = async () => {
    try {
      setLoading(true);

      const [campaignsResponse, organizationsResponse, transactionsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/campaigns`),
        fetch(`${API_BASE_URL}/organizations`),
        fetch(`${API_BASE_URL}/transactions`)
      ]);

      if (!campaignsResponse.ok) throw new Error('Lỗi tải chiến dịch');
      const campaignsData = await campaignsResponse.json();
      let campaigns = Array.isArray(campaignsData) ? campaignsData : [];

    if (debouncedSearch) {
  const keyword = debouncedSearch.toLowerCase();
  campaigns = campaigns.filter(c =>
    c?.title?.toLowerCase()?.includes(keyword) ||
    c?.description?.toLowerCase()?.includes(keyword)
  );
}
      if (search) {
        campaigns = campaigns.filter(c =>
          c.title.toLowerCase().includes(search.toLowerCase()) ||
          c.description.toLowerCase().includes(search.toLowerCase())
        );

      }
      if (location) {
        campaigns = campaigns.filter(c =>
          c.address?.toLowerCase().includes(location.toLowerCase())
        );
      }
      if (category) {
        campaigns = campaigns.filter(c =>
          c.tags?.some(tag => tag.toLowerCase().includes(category.toLowerCase()))
        );
      }

      setTrendingCampaigns(processCampaignsData(campaigns));

      if (organizationsResponse.ok) {
        const orgData = await organizationsResponse.json();
        const processedOrganizations = processOrganizationsData(orgData);
        const sortedOrganizations = processedOrganizations
          .filter(org => org.is_active)
          .sort((a, b) => b.total_raised - a.total_raised);
        setTopOrganizations(sortedOrganizations);
      }

      if (transactionsResponse.ok) {
        const transactionsData = await transactionsResponse.json();
        if (transactionsData.success) {
          setRecentTransactions(processTransactionsData(transactionsData));
        }
      }
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu:', error);
      Alert.alert('Lỗi', 'Không thể kết nối tới server. Vui lòng kiểm tra mạng.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

 useEffect(() => {
  fetchExploreData();
}, [debouncedSearch, location, category]);


  const onRefresh = () => {
    setRefreshing(true);
    fetchExploreData();
  };

  const renderCampaign = ({ item }) => (
    <TouchableOpacity
      style={styles.campaignCard}
      onPress={() => navigation.navigate('CampaignDetail', { campaignId: item._id })}
    >
      <Image source={{ uri: item.image }} style={styles.campaignImage} />
      <View style={styles.campaignContent}>
        <Text style={styles.campaignTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.campaignLocation}>📍 {item.location}</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${item.progress}%` }]} />
        </View>
        <Text style={styles.progressText}>{item.progress}% đạt được</Text>
        <Text style={styles.campaignAmount}>
          {item.raised_amount.toLocaleString('vi-VN')} VNĐ / {item.target_amount.toLocaleString('vi-VN')} VNĐ
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderOrganization = ({ item }) => (
    <TouchableOpacity
      style={styles.organizationCard}
      onPress={() => navigation.navigate('OrganizationDetail', { organizationId: item._id })}
    >
      <Image source={{ uri: item.logo }} style={styles.organizationLogo} />
      <Text style={styles.organizationName} numberOfLines={2}>{item.name}</Text>
      <Text style={styles.organizationStats}>{item.campaigns_count} chiến dịch</Text>
      <Text style={styles.organizationAmount}>
        {item.total_raised.toLocaleString('vi-VN')} VNĐ
      </Text>
    </TouchableOpacity>
  );

  const renderTransaction = ({ item }) => (
    <View style={styles.transactionCard}>
      <View style={styles.transactionHeader}>
        <Text style={styles.transactionAmount}>
          💰 {item.amount.toLocaleString('vi-VN')} VNĐ
        </Text>
        <Text style={styles.transactionType}>{item.type}</Text>
      </View>
      <View style={styles.transactionDetails}>
        <Text style={styles.transactionDetail}>🏦 {item.gateway}</Text>
        <Text style={styles.transactionDetail}>📄 {item.referenceCode}</Text>
      </View>
      <Text style={styles.transactionContent} numberOfLines={2}>
        📝 {item.content}
      </Text>
      <Text style={styles.transactionTime}>
        🕒 {typeof item.transactionDate === 'string' ? item.transactionDate : new Date(item.transactionDate).toLocaleString('vi-VN')}
      </Text>
    </View>
  );

  const navigateToTransactionHistory = () => {
    navigation.navigate('TransactionHistory');
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.searchContainer}>
        <Text style={styles.pageTitle}>🔍 Khám phá</Text>
        <View style={styles.searchInputContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm chiến dịch..."
            value={search}
            onChangeText={setSearch}
          />
          {/* AI Button - Optimized */}
          <TouchableOpacity 
            style={styles.aiButton}
            onPress={fetchAiSuggestion}
            disabled={aiLoading}
          >
            {aiLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.aiButtonText}>✨ AI</Text>
            )}
          </TouchableOpacity>
        </View>
        
        <View style={styles.filterRow}>
          <TextInput
            style={styles.filterInput}
            placeholder="Khu vực"
            value={location}
            onChangeText={setLocation}
          />
          <TextInput
            style={styles.filterInput}
            placeholder="Danh mục"
            value={category}
            onChangeText={setCategory}
          />
        </View>
      </View>

      {/* AI Suggestion Panel - Optimized */}
      {showAiPanel && aiSuggestion && (
        <View style={styles.aiPanel}>
          <View style={styles.aiHeader}>
            <Text style={styles.aiTitle}>🤖 Gợi ý AI</Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowAiPanel(false)}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.aiSuggestionText}>{aiSuggestion}</Text>
          <TouchableOpacity 
            style={styles.applyButton}
            onPress={() => {
              setSearch(aiSuggestion.split(' ').slice(0, 3).join(' '));
              setShowAiPanel(false);
            }}
          >
            <Text style={styles.applyButtonText}>🔍 Áp dụng gợi ý</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔥 Chiến dịch nổi bật</Text>
        {trendingCampaigns.length > 0 ? (
          <FlatList
            data={trendingCampaigns}
            keyExtractor={item => item._id}
            renderItem={renderCampaign}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          />
        ) : <Text style={styles.noDataText}>Không có chiến dịch nào</Text>}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🏆 Tổ chức tiêu biểu</Text>
        {topOrganizations.length > 0 ? (
          <FlatList
            data={topOrganizations}
            keyExtractor={item => item._id}
            renderItem={renderOrganization}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          />
        ) : <Text style={styles.noDataText}>Không có tổ chức nào</Text>}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>💳 Giao dịch minh bạch</Text>
          <TouchableOpacity onPress={navigateToTransactionHistory}>
            <Text style={styles.viewAllText}>Xem tất cả →</Text>
          </TouchableOpacity>
        </View>
        {recentTransactions.length > 0 ? (
          <FlatList
            data={recentTransactions}
            keyExtractor={item => item._id}
            renderItem={renderTransaction}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          />
        ) : <Text style={styles.noDataText}>Không có giao dịch nào</Text>}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, fontSize: 16, color: '#666' },
  searchContainer: { backgroundColor: '#fff', padding: 16, borderBottomWidth: 1, borderBottomColor: '#ddd' },
  pageTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 12 },
  searchInputContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#eee', borderRadius: 8, paddingHorizontal: 10,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, height: 40 },
  
  // AI Button Styles
  aiButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginLeft: 8,
    minWidth: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  
  // AI Panel Styles
  aiPanel: {
    backgroundColor: '#f8f9fa',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
    elevation: 2,
  },
  aiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  aiTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  closeButton: {
    backgroundColor: '#e0e0e0',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: 'bold',
  },
  aiSuggestionText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 12,
  },
  applyButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  
  filterRow: { flexDirection: 'row', gap: 12, marginTop: 10 },
  filterInput: {
    flex: 1, backgroundColor: '#eee', borderRadius: 8, paddingHorizontal: 10, height: 40,
  },
  section: { marginTop: 16 },
  sectionHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginLeft: 16, 
    marginRight: 16, 
    marginBottom: 10 
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginLeft: 16, marginBottom: 10 },
  viewAllText: { color: '#4CAF50', fontSize: 14, fontWeight: '600' },
  horizontalList: { paddingLeft: 16 },
  noDataText: { textAlign: 'center', color: '#666', fontStyle: 'italic', marginVertical: 20 },

  campaignCard: {
    backgroundColor: '#fff', borderRadius: 12, marginRight: 16, width: width * 0.7,
    overflow: 'hidden', elevation: 2,
  },
  campaignImage: { width: '100%', height: 150 },
  campaignContent: { padding: 12 },
  campaignTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  campaignLocation: { fontSize: 14, color: '#666' },
  progressBar: {
    height: 6, backgroundColor: '#ddd', borderRadius: 3, marginTop: 8, marginBottom: 4,
  },
  progressFill: { height: '100%', backgroundColor: '#4CAF50', borderRadius: 3 },
  progressText: { fontSize: 12, color: '#666' },
  campaignAmount: { fontSize: 14, fontWeight: 'bold', color: '#4CAF50', marginTop: 4 },

  organizationCard: {
    backgroundColor: '#fff', borderRadius: 12, padding: 16, marginRight: 16,
    width: width * 0.4, alignItems: 'center', elevation: 2,
  },
  organizationLogo: { width: 60, height: 60, borderRadius: 30, marginBottom: 8 },
  organizationName: { fontSize: 14, fontWeight: 'bold', textAlign: 'center', marginBottom: 4 },
  organizationStats: { fontSize: 12, color: '#666', marginBottom: 4 },
  organizationAmount: { fontSize: 12, fontWeight: 'bold', color: '#4CAF50' },

  transactionCard: {
    backgroundColor: '#fff', borderRadius: 12, padding: 12, marginRight: 16,
    width: width * 0.8, elevation: 2,
  },
  transactionHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  transactionAmount: { fontSize: 16, fontWeight: 'bold', color: '#4CAF50' },
  transactionType: { fontSize: 12, color: '#666', backgroundColor: '#e8f5e8', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  transactionDetails: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  transactionDetail: { fontSize: 12, color: '#666' },
  transactionContent: { fontSize: 12, color: '#333', marginBottom: 4 },
  transactionTime: { fontSize: 11, color: '#999' },
});

export default ExplorePage;