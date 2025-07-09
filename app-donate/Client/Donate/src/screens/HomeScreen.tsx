import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../AppNavigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

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

const { width } = Dimensions.get('window');

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // 🔧 Cấu hình API URL - Thay đổi theo server của bạn
  // const API_BASE_URL = 'http://192.168.1.4:3001/api'; ❌ không dùng
  const API_BASE_URL = 'http://10.0.2.2:3001/api';

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async (): Promise<void> => {
    try {
      setLoading(true);

      console.log('🔄 Fetching campaigns from database...');

      const response = await fetch(`${API_BASE_URL}/campaigns`, {
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

      if (Array.isArray(data)) {
        setCampaigns(data);
        console.log(`✅ Loaded ${data.length} campaigns from database`);
      } else {
        throw new Error('Server response is not an array');
      }

      setLoading(false);
    } catch (error) {
      console.error('❌ Error fetching campaigns from database:', error);
      setLoading(false);

      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';

      Alert.alert(
        'Lỗi kết nối',
        `Không thể tải danh sách chiến dịch từ database.\n\nLỗi: ${errorMessage}\n\nVui lòng kiểm tra:\n- Server backend đã chạy chưa?\n- MongoDB đã kết nối chưa?\n- Database có dữ liệu không?`,
        [{ text: 'Thử lại', onPress: () => fetchCampaigns() }, { text: 'OK' }],
      );
    }
  };

  const handleRefresh = async (): Promise<void> => {
    setRefreshing(true);
    await fetchCampaigns();
    setRefreshing(false);
  };

  const calculateTotalDonors = (campaign: Campaign): number => {
    // Giả lập số lượng người ủng hộ dựa trên số tiền đã quyên góp
    // Trung bình mỗi người ủng hộ khoảng 200,000 VND
    return (
      Math.floor(campaign.current_amount / 200000) +
      Math.floor(Math.random() * 50)
    );
  };

  const getStatusText = (campaign: Campaign): string => {
    const endDate = new Date(campaign.end_date);
    const today = new Date();

    if (endDate > today) {
      return 'Đang hoạt động';
    } else {
      return 'Đã kết thúc';
    }
  };

  const renderCampaignItem = ({ item }: { item: Campaign }) => {
    const percent = Math.min(
      (item.current_amount / item.goal_amount) * 100,
      100,
    );
    const totalDonors = calculateTotalDonors(item);
    const status = getStatusText(item);

    return (
      <TouchableOpacity
        style={styles.campaignCard}
        onPress={() =>
          navigation.navigate('CaseDetail', { campaignId: item._id })
        }
      >
        <Image source={{ uri: item.image }} style={styles.campaignImage} />

        {/* Database Badge */}
        <View style={styles.dbBadge}>
          <Text style={styles.dbBadgeText}>🗄️ Database</Text>
        </View>

        <View style={styles.campaignContent}>
          <Text style={styles.campaignTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.campaignDescription} numberOfLines={1}>
            {item.description}
          </Text>
          <Text style={styles.addressInfo}>📍 {item.address}</Text>

          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${percent}%` }]} />
            </View>
            <Text style={styles.progressText}>{percent.toFixed(1)}%</Text>
          </View>

          <View style={styles.amountContainer}>
            <Text style={styles.currentAmount}>
              {item.current_amount.toLocaleString('vi-VN')}đ
            </Text>
            <Text style={styles.goalAmount}>
              / {item.goal_amount.toLocaleString('vi-VN')}đ
            </Text>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.iconText}>👥</Text>
              <Text style={styles.statText}>{totalDonors} người ủng hộ</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.iconText}>❤️</Text>
              <Text style={styles.statText}>{status}</Text>
            </View>
          </View>

          {/* Campaign Meta Info */}
          <View style={styles.metaInfo}>
            <Text style={styles.metaText}>ID: {item._id.slice(-8)}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📭</Text>
      <Text style={styles.emptyTitle}>Chưa có chiến dịch nào</Text>
      <Text style={styles.emptyText}>
        Database chưa có dữ liệu chiến dịch quyên góp.{'\n'}
        Vui lòng thêm dữ liệu vào database hoặc kiểm tra kết nối.
      </Text>
      <TouchableOpacity style={styles.retryButton} onPress={fetchCampaigns}>
        <Text style={styles.retryButtonText}>Thử lại</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#e74c3c" />
        <Text style={styles.loadingText}>
          Đang tải danh sách từ database...
        </Text>
        <Text style={styles.loadingSubText}>Kết nối với MongoDB</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Cáp Lày Yêu Thương</Text>
        <Text style={styles.headerSubtitle}>
          Kết nối trái tim - Chia sẻ yêu thương
        </Text>
        {campaigns.length > 0 && (
          <Text style={styles.headerCount}>
            🗄️ {campaigns.length} chiến dịch từ database
          </Text>
        )}
      </View>

      <FlatList
        data={campaigns}
        renderItem={renderCampaignItem}
        keyExtractor={item => item._id}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#e74c3c']}
            tintColor="#e74c3c"
          />
        }
        contentContainerStyle={[
          styles.listContainer,
          campaigns.length === 0 && styles.emptyListContainer,
        ]}
        ListEmptyComponent={renderEmptyList}
      />
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
    marginTop: 12,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  loadingSubText: {
    marginTop: 5,
    fontSize: 12,
    color: '#95a5a6',
    textAlign: 'center',
  },
  header: {
    backgroundColor: '#e74c3c',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    marginTop: 4,
    opacity: 0.9,
  },
  headerCount: {
    fontSize: 12,
    color: '#fff',
    textAlign: 'center',
    marginTop: 8,
    opacity: 0.8,
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
  },
  emptyListContainer: {
    flexGrow: 1,
  },
  campaignCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  campaignImage: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  dbBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(39, 174, 96, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  dbBadgeText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  campaignContent: {
    padding: 16,
  },
  campaignTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 8,
    lineHeight: 24,
  },
  campaignDescription: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 8,
  },
  addressInfo: {
    fontSize: 12,
    color: '#95a5a6',
    marginBottom: 12,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#ecf0f1',
    borderRadius: 4,
    marginRight: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#e74c3c',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
    minWidth: 45,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  currentAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#e74c3c',
  },
  goalAmount: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 14,
    marginRight: 4,
  },
  statText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  metaInfo: {
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
    paddingTop: 8,
    marginTop: 4,
  },
  metaText: {
    fontSize: 10,
    color: '#95a5a6',
    fontFamily: 'monospace',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 30,
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
});

export default HomeScreen;
