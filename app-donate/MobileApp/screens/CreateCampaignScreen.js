import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ActivityIndicator
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';

const CreateCampaignScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [showStartDate, setShowStartDate] = useState(false);
  const [showEndDate, setShowEndDate] = useState(false);
  const [errors, setErrors] = useState({});
  
  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'fundraising',
    goal_amount: '',
    start_date: new Date(),
    end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    status: 'active'
  });

  const API_BASE_URL = 'http://10.0.2.2:3001/api';

  const handleInputChange = (field, value) => {
    setForm({ ...form, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!form.title.trim()) {
      newErrors.title = 'Tiêu đề là bắt buộc';
    }
    
    if (!form.description.trim()) {
      newErrors.description = 'Mô tả là bắt buộc';
    }
    
    if (!form.goal_amount || isNaN(form.goal_amount) || Number(form.goal_amount) <= 0) {
      newErrors.goal_amount = 'Số tiền mục tiêu phải là số dương';
    }
    
    if (new Date(form.end_date) <= new Date(form.start_date)) {
      newErrors.end_date = 'Ngày kết thúc phải sau ngày bắt đầu';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('⚠️ Lỗi nhập liệu', 'Vui lòng kiểm tra lại thông tin đã nhập');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        type: form.type,
        goal_amount: Number(form.goal_amount),
        start_date: form.start_date,
        end_date: form.end_date,
        status: form.status
      };
      
      const response = await axios.post(`${API_BASE_URL}/campaigns`, payload);
      
      Alert.alert(
        '✅ Thành công', 
        'Chiến dịch đã được tạo thành công!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (err) {
      console.error('Lỗi tạo chiến dịch:', err.response?.data || err.message);
      Alert.alert(
        '❌ Lỗi', 
        err.response?.data?.error || 'Không thể tạo chiến dịch. Vui lòng thử lại sau.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.heading}>Tạo Chiến Dịch Mới</Text>
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin cơ bản</Text>
          
          {/* Tiêu đề */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tiêu đề <Text style={styles.required}>*</Text></Text>
            <TextInput
              value={form.title}
              onChangeText={(text) => handleInputChange('title', text)}
              style={[styles.input, errors.title && styles.inputError]}
              placeholder="Nhập tiêu đề"
            />
            {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
          </View>

          {/* Mô tả */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mô tả <Text style={styles.required}>*</Text></Text>
            <TextInput
              value={form.description}
              onChangeText={(text) => handleInputChange('description', text)}
              style={[styles.input, styles.textArea, errors.description && styles.inputError]}
              placeholder="Nhập mô tả"
              multiline={true}
              numberOfLines={4}
            />
            {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
          </View>

          {/* Loại chiến dịch */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Loại chiến dịch</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={form.type}
                onValueChange={(itemValue) => handleInputChange('type', itemValue)}
                style={styles.picker}
              >
                <Picker.Item label="Gây quỹ" value="fundraising" />
                <Picker.Item label="Chia sẻ" value="share" />
                <Picker.Item label="Sự kiện" value="event" />
                <Picker.Item label="Nổi bật" value="highlighted" />
              </Picker>
            </View>
          </View>

          {/* Số tiền mục tiêu */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Số tiền mục tiêu <Text style={styles.required}>*</Text></Text>
            <TextInput
              value={form.goal_amount}
              onChangeText={(text) => handleInputChange('goal_amount', text)}
              style={[styles.input, errors.goal_amount && styles.inputError]}
              placeholder="Nhập số tiền (VND)"
              keyboardType="numeric"
            />
            {errors.goal_amount && <Text style={styles.errorText}>{errors.goal_amount}</Text>}
          </View>

          {/* Ngày bắt đầu */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ngày bắt đầu</Text>
            <TouchableOpacity 
              style={styles.dateButton} 
              onPress={() => setShowStartDate(true)}
            >
              <Text style={styles.dateButtonText}>{formatDate(form.start_date)}</Text>
              <Icon name="calendar" size={20} color="#555" />
            </TouchableOpacity>
            {showStartDate && (
              <DateTimePicker
                value={form.start_date}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowStartDate(false);
                  if (selectedDate) {
                    handleInputChange('start_date', selectedDate);
                  }
                }}
              />
            )}
          </View>

          {/* Ngày kết thúc */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ngày kết thúc</Text>
            <TouchableOpacity 
              style={[styles.dateButton, errors.end_date && styles.inputError]} 
              onPress={() => setShowEndDate(true)}
            >
              <Text style={styles.dateButtonText}>{formatDate(form.end_date)}</Text>
              <Icon name="calendar" size={20} color="#555" />
            </TouchableOpacity>
            {errors.end_date && <Text style={styles.errorText}>{errors.end_date}</Text>}
            {showEndDate && (
              <DateTimePicker
                value={form.end_date}
                mode="date"
                display="default"
                minimumDate={form.start_date}
                onChange={(event, selectedDate) => {
                  setShowEndDate(false);
                  if (selectedDate) {
                    handleInputChange('end_date', selectedDate);
                  }
                }}
              />
            )}
          </View>

          {/* Trạng thái */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Trạng thái</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={form.status}
                onValueChange={(itemValue) => handleInputChange('status', itemValue)}
                style={styles.picker}
              >
                <Picker.Item label="Hoạt động" value="active" />
                <Picker.Item label="Đang chờ" value="pending" />
                <Picker.Item label="Hoàn thành" value="completed" />
                <Picker.Item label="Tạm dừng" value="paused" />
                <Picker.Item label="Đã hủy" value="cancelled" />
              </Picker>
            </View>
          </View>
        </View>
        
        <TouchableOpacity 
          style={[styles.submitButton, loading && styles.submitButtonDisabled]} 
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.submitButtonText}>Tạo chiến dịch</Text>
          )}
        </TouchableOpacity>
        
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f5f5f5' 
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#e74c3c',
    paddingVertical: 15,
    paddingHorizontal: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  backButton: {
    padding: 5,
  },
  placeholder: {
    width: 24,
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  scroll: { 
    flex: 1, 
    padding: 16 
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 8,
  },
  inputGroup: { 
    marginBottom: 16 
  },
  label: { 
    marginBottom: 8, 
    fontSize: 14, 
    color: '#555',
    fontWeight: '500'
  },
  required: {
    color: '#e74c3c',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#333',
  },
  inputError: {
    borderColor: '#e74c3c',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 12,
    marginTop: 4,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  dateButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#333',
  },
  submitButton: {
    backgroundColor: '#e74c3c',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginVertical: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  submitButtonDisabled: {
    backgroundColor: '#bdc3c7',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  bottomPadding: {
    height: 40,
  }
});

export default CreateCampaignScreen;