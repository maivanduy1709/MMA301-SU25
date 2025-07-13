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
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

  const fetchExploreData = async () => {
    try {
      setLoading(true);

      const [campaignsResponse, organizationsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/campaigns`),
        fetch(`${API_BASE_URL}/organizations`)
      ]);

      if (!campaignsResponse.ok) throw new Error('Lỗi tải chiến dịch');
      const campaignsData = await campaignsResponse.json();
      let campaigns = Array.isArray(campaignsData) ? campaignsData : [];

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
  }, [search, location, category]);

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
  filterRow: { flexDirection: 'row', gap: 12, marginTop: 10 },
  filterInput: {
    flex: 1, backgroundColor: '#eee', borderRadius: 8, paddingHorizontal: 10, height: 40,
  },
  section: { marginTop: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginLeft: 16, marginBottom: 10 },
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
});

export default ExplorePage;
