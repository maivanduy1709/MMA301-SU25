import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  Image,
  ScrollView,
  Animated,
  FlatList,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    id: 1,
    title: "Mừng bạn đến với",
    highlight: "nền tảng thiện nguyện",
    subtitle: "minh bạch",
    description: "Kết nối những trái tim nhân ái, trao cơ hội đi học cho trẻ em vùng cao",
    image: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
  },
  {
    id: 2,
    title: "Trao yêu thương",
    highlight: "nhận hạnh phúc",
    subtitle: "vô hạn",
    description: "Mỗi đóng góp của bạn là một cánh cửa tri thức mở ra cho các em nhỏ",
    image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
  },
  {
    id: 3,
    title: "Cùng nhau",
    highlight: "thay đổi cuộc sống",
    subtitle: "tốt đẹp hơn",
    description: "Hãy cùng chúng tôi tạo nên những điều kỳ diệu cho tương lai của trẻ em",
    image: "https://images.unsplash.com/photo-1497486751825-1233686d5d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
  }
];

export default function WelcomeScreen({ navigation }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slideRef = useRef(null);
  const intervalRef = useRef(null);

  // Auto slide every 5 seconds
  useEffect(() => {
    startAutoSlide();
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const startAutoSlide = () => {
    intervalRef.current = setInterval(() => {
      setCurrentSlide((prevSlide) => {
        const nextSlide = (prevSlide + 1) % slides.length;
        goToSlideWithoutClearInterval(nextSlide);
        return nextSlide;
      });
    }, 3000);
  };

  const stopAutoSlide = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const restartAutoSlide = () => {
    stopAutoSlide();
    startAutoSlide();
  };

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentSlide(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({
    viewAreaCoveragePercentThreshold: 50,
  }).current;

  const goToSlide = (slideIndex) => {
    const offset = slideIndex * width;
    slideRef.current?.scrollToOffset({ offset });
    setCurrentSlide(slideIndex);
    restartAutoSlide(); // Restart auto slide when user manually changes slide
  };

  const goToSlideWithoutClearInterval = (slideIndex) => {
    const offset = slideIndex * width;
    slideRef.current?.scrollToOffset({ offset });
  };

  const renderSlide = ({ item }) => (
    <View style={styles.slideContainer}>
      {/* Image */}
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: item.image }} 
          style={styles.slideImage}
          resizeMode="cover"
        />
      </View>

      {/* Content */}
      <View style={styles.slideContent}>
        <Text style={styles.slideTitle}>{item.title}</Text>
        <Text style={styles.slideHighlight}>{item.highlight}</Text>
        <Text style={styles.slideSubtitle}>{item.subtitle}</Text>
        <Text style={styles.slideDescription}>{item.description}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2E8B57" />
      
      <LinearGradient
        colors={['#2E8B57', '#228B22', '#32CD32']}
        style={styles.gradient}
      >
        {/* Background Pattern */}
        <View style={styles.backgroundPattern}>
          <View style={[styles.patternDot, styles.dot1]} />
          <View style={[styles.patternDot, styles.dot2]} />
          <View style={[styles.patternDot, styles.dot3]} />
          <View style={[styles.patternDot, styles.dot4]} />
        </View>

        {/* Skip Button */}
        <TouchableOpacity 
          style={styles.skipButton}
         onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })}

        >
          <Text style={styles.skipText}>Bỏ qua →</Text>
        </TouchableOpacity>

        {/* Logo Section */}
        <View style={styles.logoSection}>
          <LinearGradient
            colors={['#FFD700', '#FFA500', '#FF8C00']}
            style={styles.logoGradient}
          >
            <View style={styles.logoIcon}>
              <Text style={styles.logoText}>🍀</Text>
            </View>
          </LinearGradient>
          <Text style={styles.logoTitle}>Cặp Lá Yêu Thương</Text>
          <Text style={styles.logoSubtitle}>Trao cơ hội đi học - Cho cơ hội đổi đời</Text>
        </View>

        {/* Slides */}
        <View style={styles.slidesContainer}>
          <FlatList
            ref={slideRef}
            data={slides}
            renderItem={renderSlide}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id.toString()}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            onTouchStart={stopAutoSlide}
            onMomentumScrollEnd={restartAutoSlide}
          />
        </View>

        {/* Dots Indicator */}
        <View style={styles.dotsContainer}>
          {slides.map((_, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.dot,
                index === currentSlide ? styles.activeDot : styles.inactiveDot
              ]}
              onPress={() => goToSlide(index)}
            />
          ))}
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.navigate('Login')}
          >
            <LinearGradient
              colors={['#FF8C00', '#FF7F00']}
              style={styles.loginButtonGradient}
            >
              <Text style={styles.loginButtonText}>Đăng nhập</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.registerButton}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.registerButtonText}>Đăng ký</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Features */}
        <View style={styles.featuresContainer}>
          <View style={styles.featureItem}>
            <Icon name="heart" size={16} color="#FFFFFF" />
            <Text style={styles.featureText}>Yêu thương</Text>
          </View>
          <View style={styles.featureItem}>
            <Icon name="people" size={16} color="#FFFFFF" />
            <Text style={styles.featureText}>Cộng đồng</Text>
          </View>
          <View style={styles.featureItem}>
            <Icon name="book" size={16} color="#FFFFFF" />
            <Text style={styles.featureText}>Tri thức</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  backgroundPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.1,
  },
  patternDot: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderRadius: 50,
  },
  dot1: {
    width: 80,
    height: 80,
    top: 40,
    left: 40,
  },
  dot2: {
    width: 64,
    height: 64,
    top: 160,
    right: 80,
  },
  dot3: {
    width: 96,
    height: 96,
    bottom: 80,
    left: 80,
  },
  dot4: {
    width: 48,
    height: 48,
    bottom: 160,
    right: 40,
  },
  skipButton: {
    position: 'absolute',
    top: 50,
    right: 24,
    zIndex: 10,
  },
  skipText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  logoSection: {
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
  },
  logoGradient: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginBottom: 10,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  logoIcon: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 24,
  },
  logoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  logoSubtitle: {
    fontSize: 9,
    color: '#E0E0E0',
    textAlign: 'center',
    fontStyle: 'italic',
    paddingHorizontal: 10,
  },
  slidesContainer: {
    flex: 1,
    justifyContent: 'center',
    minHeight: height * 0.5,
  },
  slideContainer: {
    width: width,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  imageContainer: {
    width: width * 0.75,
    height: width * 0.6,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 25,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  slideImage: {
    width: '100%',
    height: '100%',
  },
  slideContent: {
    alignItems: 'center',
    paddingHorizontal: 15,
    maxWidth: width * 0.9,
  },
  slideTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  slideHighlight: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  slideSubtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  slideDescription: {
    fontSize: 15,
    color: '#E0E0E0',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 5,
    flexWrap: 'wrap',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 25,
    marginTop: 15,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#FFFFFF',
    transform: [{ scale: 1.2 }],
  },
  inactiveDot: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  buttonsContainer: {
    paddingHorizontal: 24,
    marginBottom: 15,
  },
  loginButton: {
    borderRadius: 16,
    marginBottom: 12,
    elevation: 5,
    shadowColor: '#FF8C00',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  loginButtonGradient: {
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  registerButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    paddingVertical: 14,
    alignItems: 'center',
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 25,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  featureText: {
    color: '#E0E0E0',
    fontSize: 12,
    marginLeft: 4,
  },
});