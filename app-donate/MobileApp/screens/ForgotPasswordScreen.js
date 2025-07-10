import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView,
  StatusBar
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      Alert.alert('⚠️ Thông báo', 'Vui lòng nhập email!');
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
      
      // Replace with actual forgot password service
      // await forgotPassword(email);
      
      Alert.alert(
        '✅ Thành công', 
        'Chúng tôi đã gửi link khôi phục mật khẩu đến email của bạn. Vui lòng kiểm tra hộp thư!',
        [
          { text: 'OK', onPress: () => navigation.navigate('Login') }
        ]
      );
    } catch (err) {
      Alert.alert('❌ Lỗi', err?.response?.data?.message || 'Không thể gửi email khôi phục!');
    } finally {
      setIsLoading(false);
    }
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
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
          {/* Header Section */}
          <View style={styles.header}>
            {/* Back Button */}
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Icon name="arrow-back-outline" size={24} color="#FFFFFF" />
            </TouchableOpacity>

            {/* Logo */}
            <View style={styles.logoContainer}>
              <LinearGradient
                colors={['#FFD700', '#FFA500', '#FF8C00']}
                style={styles.logoGradient}
              >
                <View style={styles.logoIcon}>
                  <Text style={styles.logoText}>🔑</Text>
                </View>
              </LinearGradient>
              <Text style={styles.logoTitle}>Khôi Phục Mật Khẩu</Text>
              <Text style={styles.logoSubtitle}>Nhập email để lấy lại mật khẩu</Text>
            </View>

            <Text style={styles.title}>Quên Mật Khẩu</Text>
            <Text style={styles.subtitle}>Đừng lo lắng, chúng tôi sẽ giúp bạn!</Text>
          </View>

          {/* Form Section */}
          <View style={styles.formContainer}>
            {/* Instructions */}
            <View style={styles.instructionsContainer}>
              <Text style={styles.instructionsText}>
                Nhập địa chỉ email bạn đã đăng ký. Chúng tôi sẽ gửi link khôi phục mật khẩu đến email này.
              </Text>
            </View>

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

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
              onPress={handleForgotPassword}
              disabled={isLoading}
            >
              <LinearGradient
                colors={isLoading ? ['#A0A0A0', '#808080'] : ['#2E8B57', '#228B22']}
                style={styles.submitButtonGradient}
              >
                <Text style={styles.submitButtonText}>
                  {isLoading ? 'Đang gửi...' : 'Gửi Email Khôi Phục'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Help Section */}
            <View style={styles.helpContainer}>
              <View style={styles.helpItem}>
                <Icon name="mail-outline" size={16} color="#2E8B57" />
                <Text style={styles.helpText}>Kiểm tra cả hộp thư spam/junk</Text>
              </View>
              <View style={styles.helpItem}>
                <Icon name="time-outline" size={16} color="#2E8B57" />
                <Text style={styles.helpText}>Email có thể mất 5-10 phút để nhận được</Text>
              </View>
              <View style={styles.helpItem}>
                <Icon name="shield-checkmark-outline" size={16} color="#2E8B57" />
                <Text style={styles.helpText}>Link khôi phục có hiệu lực trong 24h</Text>
              </View>
            </View>

            {/* Contact Support */}
            <View style={styles.supportContainer}>
              <Text style={styles.supportText}>Vẫn gặp khó khăn? </Text>
              <TouchableOpacity onPress={() => Alert.alert('Hỗ trợ', 'Liên hệ: support@caplayeuthong.com')}>
                <Text style={styles.supportLink}>Liên hệ hỗ trợ</Text>
              </TouchableOpacity>
            </View>

            {/* Back to Login */}
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Đã nhớ mật khẩu? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.loginLink}>Đăng nhập ngay</Text>
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
    marginBottom: 30,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 0,
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 40,
  },
  logoGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
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
    fontSize: 32,
  },
  logoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 6,
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
    fontSize: 28,
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
  instructionsContainer: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#F0F8FF',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#2E8B57',
  },
  instructionsText: {
    fontSize: 14,
    color: '#2E8B57',
    lineHeight: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
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
  submitButton: {
    marginTop: 8,
    borderRadius: 16,
    elevation: 5,
    shadowColor: '#2E8B57',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  submitButtonDisabled: {
    elevation: 2,
    shadowOpacity: 0.1,
  },
  submitButtonGradient: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  helpContainer: {
    marginTop: 24,
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
  },
  helpItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  helpText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  supportContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  supportText: {
    color: '#666',
    fontSize: 14,
  },
  supportLink: {
    color: '#2E8B57',
    fontSize: 14,
    fontWeight: 'bold',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  loginText: {
    color: '#666',
    fontSize: 15,
  },
  loginLink: {
    color: '#2E8B57',
    fontSize: 15,
    fontWeight: 'bold',
  },
});