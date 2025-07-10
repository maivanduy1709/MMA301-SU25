import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  StyleSheet, 
  Image, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView,
  Dimensions,
  StatusBar
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';

const { width, height } = Dimensions.get('window');

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('⚠️ Thông báo', 'Vui lòng nhập đầy đủ thông tin!');
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert('⚠️ Thông báo', 'Email không hợp lệ!');
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Replace with actual login service
      // const data = await login(email, password);
      
      Alert.alert('✅ Thành công', 'Đăng nhập thành công!');
      // navigation.navigate('Home');
      navigation.reset({
  index: 0,
  routes: [{ name: 'Home' }],
});
    } catch (err) {
      Alert.alert('❌ Lỗi', err?.response?.data?.message || 'Đăng nhập thất bại!');
    } finally {
      setIsLoading(false);
    }
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSocialLogin = (provider) => {
    Alert.alert('🔄 Thông báo', `Đăng nhập bằng ${provider} sẽ được cập nhật sớm!`);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" backgroundColor="#2E8B57" />
      
      <LinearGradient
        colors={['#2E8B57', '#228B22', '#32CD32']}
        style={styles.gradient}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity 
  style={styles.closeButton}
  onPress={() => navigation.navigate('Welcome')} // hoặc navigation.goBack()
>
  <Icon name="close-outline" size={28} color="#FFFFFF" />
</TouchableOpacity>
          {/* Header Section */}
          <View style={styles.header}>
            {/* Logo */}
            <View style={styles.logoContainer}>
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

            <Text style={styles.title}>Đăng Nhập</Text>
            <Text style={styles.subtitle}>Chào mừng bạn trở lại!</Text>
          </View>
          


          {/* Form Section */}
          <View style={styles.formContainer}>
            {/* Email Input */}
            <View style={styles.inputContainer}>
              <View style={styles.inputIconContainer}>
                <Icon name="mail-outline" size={20} color="#2E8B57" />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Nhập email của bạn"
                placeholderTextColor="#A0A0A0"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <View style={styles.inputIconContainer}>
                <Icon name="lock-closed-outline" size={20} color="#2E8B57" />
              </View>
              <TextInput
                style={[styles.input, { paddingRight: 50 }]}
                placeholder="Nhập mật khẩu"
                placeholderTextColor="#A0A0A0"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={styles.passwordToggle}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Icon 
                  name={showPassword ? "eye-off-outline" : "eye-outline"} 
                  size={20} 
                  color="#2E8B57" 
                />
              </TouchableOpacity>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              <LinearGradient
                colors={isLoading ? ['#A0A0A0', '#808080'] : ['#2E8B57', '#228B22']}
                style={styles.loginButtonGradient}
              >
                <Text style={styles.loginButtonText}>
                  {isLoading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Forgot Password */}
            <TouchableOpacity 
              style={styles.forgotPasswordContainer}
              onPress={() => navigation.navigate('ForgotPassword')}
            >
              <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
            </TouchableOpacity>

            {/* Social Login */}
            <View style={styles.socialContainer}>
              <View style={styles.dividerContainer}>
                <View style={styles.divider} />
                <Text style={styles.dividerText}>Hoặc đăng nhập bằng</Text>
                <View style={styles.divider} />
              </View>

              <View style={styles.socialButtons}>
                <TouchableOpacity
                  style={styles.socialButton}
                  onPress={() => handleSocialLogin('Google')}
                >
                  <Text style={styles.socialButtonText}>🔍</Text>
                  <Text style={styles.socialButtonLabel}>Google</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.socialButton}
                  onPress={() => handleSocialLogin('Facebook')}
                >
                  <Text style={styles.socialButtonText}>📘</Text>
                  <Text style={styles.socialButtonLabel}>Facebook</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Register Link */}
            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>Chưa có tài khoản? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.registerLink}>Đăng ký ngay</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 50,
    paddingBottom: 30,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
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
    fontSize: 40,
  },
  logoTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  logoSubtitle: {
    fontSize: 12,
    color: '#E0E0E0',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    fontSize: 16,
    color: '#E0E0E0',
    marginBottom: 10,
  },
  formContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    padding: 32,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    position: 'relative',
  },
  inputIconContainer: {
    padding: 16,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    paddingRight: 16,
    fontSize: 16,
    color: '#2E8B57',
  },
  passwordToggle: {
    position: 'absolute',
    right: 16,
    padding: 4,
  },
  loginButton: {
    marginTop: 8,
    borderRadius: 16,
    elevation: 5,
    shadowColor: '#2E8B57',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  loginButtonDisabled: {
    elevation: 2,
    shadowOpacity: 0.1,
  },
  closeButton: {
  position: 'absolute',
  top: 40, // hoặc phù hợp với khoảng cách status bar
  right: 24, // đưa nút sang phải
  zIndex: 10,
  padding: 8,
},

  loginButtonGradient: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  forgotPasswordContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  forgotPasswordText: {
    color: '#2E8B57',
    fontSize: 15,
    fontWeight: '500',
  },
  socialContainer: {
    marginBottom: 30,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dividerText: {
    paddingHorizontal: 16,
    color: '#888',
    fontSize: 14,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  socialButtonText: {
    fontSize: 18,
    marginRight: 8,
  },
  socialButtonLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  registerText: {
    color: '#666',
    fontSize: 15,
  },
  registerLink: {
    color: '#2E8B57',
    fontSize: 15,
    fontWeight: 'bold',
  },
});


export { styles };