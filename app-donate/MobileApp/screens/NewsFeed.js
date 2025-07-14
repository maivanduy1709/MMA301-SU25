import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  Image,
  TouchableOpacity,
  Alert,
  StatusBar,
  ActivityIndicator,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

const NewsFeed = () => {
  const [feedData, setFeedData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch dữ liệu từ API
  const fetchFeedData = async () => {
    try {
      const response = await fetch('http://10.0.2.2:3001/api/feed');
      const data = await response.json();
      
      if (data.feed && data.feed.length > 0) {
        setFeedData(data.feed[0].feed);
      }
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu:', error);
      Alert.alert('Lỗi', 'Không thể tải dữ liệu bảng tin');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFeedData();
  }, []);

  // Xử lý refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchFeedData();
  };

  // Format thời gian
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Vừa xong';
    } else if (diffInHours < 24) {
      return `${diffInHours} giờ trước`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} ngày trước`;
    }
  };

  // Lấy icon cho từng loại bài đăng
  const getPostIcon = (type) => {
    switch (type) {
      case 'donation':
        return '💚';
      case 'campaign_created':
        return '🚀';
      case 'thank_you':
        return '🙏';
      case 'event':
        return '🎪';
      case 'system_announcement':
        return '📢';
      default:
        return '📝';
    }
  };

  // Lấy màu cho từng loại bài đăng
  const getPostColor = (type) => {
    switch (type) {
      case 'donation':
        return '#4CAF50';
      case 'campaign_created':
        return '#2196F3';
      case 'thank_you':
        return '#FF9800';
      case 'event':
        return '#9C27B0';
      case 'system_announcement':
        return '#F44336';
      default:
        return '#757575';
    }
  };

  // Xử lý khi nhấn vào bài đăng
  const handlePostPress = (item) => {
    if (item.campaign_id) {
      Alert.alert('Thông báo', `Mở chiến dịch: ${item.campaign_id}`);
    } else {
      Alert.alert('Thông báo', 'Xem chi tiết bài đăng');
    }
  };

  // Render từng item trong feed
  const renderFeedItem = ({ item }) => (
    <TouchableOpacity
      style={styles.feedItem}
      onPress={() => handlePostPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.feedHeader}>
        <View style={[styles.iconContainer, { backgroundColor: getPostColor(item.type) }]}>
          <Text style={styles.icon}>{getPostIcon(item.type)}</Text>
        </View>
        <View style={styles.headerText}>
          <Text style={styles.title} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.time}>{formatTime(item.created_at)}</Text>
        </View>
      </View>
      
      <Text style={styles.content} numberOfLines={3}>
        {item.content}
      </Text>
      
      {item.image && (
        <Image
          source={{ uri: item.image }}
          style={styles.postImage}
          resizeMode="cover"
        />
      )}
      
      {item.user_name && (
        <View style={styles.donorInfo}>
          <Text style={styles.donorText}>
            Từ: <Text style={styles.donorName}>{item.user_name}</Text>
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Đang tải bảng tin...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bảng Tin Thiện Nguyện</Text>
        <Text style={styles.headerSubtitle}>Cập nhật hoạt động mới nhất</Text>
      </View>

      <FlatList
        data={feedData}
        renderItem={renderFeedItem}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#2196F3']}
            tintColor="#2196F3"
          />
        }
        contentContainerStyle={styles.feedContainer}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Chưa có hoạt động nào</Text>
            <Text style={styles.emptySubtext}>Kéo xuống để tải lại</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  feedContainer: {
    padding: 16,
  },
  feedItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  feedHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 20,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    lineHeight: 22,
  },
  time: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  content: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    marginBottom: 12,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  donorInfo: {
    backgroundColor: '#f8f9fa',
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
  },
  donorText: {
    fontSize: 13,
    color: '#666',
  },
  donorName: {
    fontWeight: '600',
    color: '#4CAF50',
  },
  separator: {
    height: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
});

export default NewsFeed;