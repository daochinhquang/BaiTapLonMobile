import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router, useNavigation } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Theme } from '@/constants/theme';
import { useShop } from '@/context/ShopContext';

type Gender = 'Nam' | 'Nữ' | 'Khác';

const genderOptions: Gender[] = ['Nam', 'Nữ', 'Khác'];

function normalizeGender(value?: string): Gender {
  const normalizedValue = value?.trim().toLowerCase();

  if (normalizedValue === 'nữ' || normalizedValue === 'nu') {
    return 'Nữ';
  }

  if (normalizedValue === 'khác' || normalizedValue === 'khac') {
    return 'Khác';
  }

  return 'Nam';
}

export default function PersonalInfoScreen() {
  const navigation = useNavigation();
  const { changePassword, saveUserProfile, user } = useShop();
  const [avatarUri, setAvatarUri] = useState(user.avatar);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [fullName, setFullName] = useState(user.fullName);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone.replaceAll(' ', ''));
  const [gender, setGender] = useState<Gender>(normalizeGender(user.gender));
  const [birthday, setBirthday] = useState(user.birthday ?? '10/05/2004');
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  async function handlePickAvatar() {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          'Chưa có quyền truy cập',
          'Vui lòng cho phép app truy cập thư viện ảnh để chọn ảnh đại diện.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [1, 1],
        base64: true,
        mediaTypes: ['images'],
        quality: 0.85,
      });

      if (!result.canceled) {
        const selectedAsset = result.assets[0];

        if (selectedAsset?.base64) {
          const mimeType = selectedAsset.mimeType ?? 'image/jpeg';
          setAvatarUri(`data:${mimeType};base64,${selectedAsset.base64}`);
          return;
        }

        if (selectedAsset?.uri) {
          setAvatarUri(selectedAsset.uri);
        }
      }
    } catch {
      Alert.alert('Không thể chọn ảnh', 'Vui lòng thử lại sau.');
    }
  }

  async function handleSave() {
    const nextFullName = fullName.trim();
    const nextEmail = email.trim();
    const nextPhone = phone.trim();
    const nextBirthday = birthday.trim();

    if (!nextFullName || !nextEmail || !nextPhone) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập đầy đủ họ tên, email và số điện thoại.');
      return;
    }

    setIsSaving(true);

    try {
      await saveUserProfile({
        ...user,
        avatar: avatarUri || user.avatar,
        birthday: nextBirthday,
        email: nextEmail,
        fullName: nextFullName,
        gender,
        phone: nextPhone,
      });
      Alert.alert('Đã lưu thay đổi', 'Thông tin cá nhân đã được lưu vào tài khoản của bạn.');
    } catch (saveError) {
      Alert.alert(
        'Không thể lưu thay đổi',
        saveError instanceof Error ? saveError.message : 'Vui lòng thử lại sau.'
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleChangePassword() {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập đầy đủ các trường mật khẩu.');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Mật khẩu quá ngắn', 'Mật khẩu mới cần có ít nhất 6 ký tự.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Xác nhận chưa khớp', 'Mật khẩu mới và xác nhận mật khẩu không giống nhau.');
      return;
    }

    setIsChangingPassword(true);

    try {
      await changePassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      Alert.alert('Đã đổi mật khẩu', 'Bạn có thể dùng mật khẩu mới trong lần đăng nhập tiếp theo.');
    } catch (error) {
      Alert.alert(
        'Không thể đổi mật khẩu',
        error instanceof Error ? error.message : 'Vui lòng thử lại sau.'
      );
    } finally {
      setIsChangingPassword(false);
    }
  }

  function handleBack() {
    if (navigation.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/profile' as never);
  }

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable
          accessibilityLabel="Quay lại"
          accessibilityRole="button"
          onPress={handleBack}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
          <Ionicons color={Theme.colors.text} name="chevron-back" size={24} />
        </Pressable>
        <Text style={styles.headerTitle}>Thông tin cá nhân</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}>
        <View style={styles.avatarSection}>
          <View style={styles.avatarRing}>
            <Image source={{ uri: avatarUri }} style={styles.avatar} />
          </View>
          <TouchableOpacity
            accessibilityRole="button"
            activeOpacity={0.75}
            onPress={() => void handlePickAvatar()}
            style={styles.changePhotoButton}>
            <Ionicons color={Theme.colors.primary} name="camera-outline" size={18} />
            <Text style={styles.changePhotoText}>Thay đổi ảnh</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.formCard}>
          <InputField
            icon="person-outline"
            label="Họ và tên"
            onChangeText={setFullName}
            placeholder="Nhập họ và tên"
            value={fullName}
          />
          <InputField
            autoCapitalize="none"
            icon="mail-outline"
            keyboardType="email-address"
            label="Email"
            onChangeText={setEmail}
            placeholder="Nhập email"
            value={email}
          />
          <InputField
            icon="call-outline"
            keyboardType="phone-pad"
            label="Số điện thoại"
            onChangeText={setPhone}
            placeholder="Nhập số điện thoại"
            value={phone}
          />

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Giới tính</Text>
            <View style={styles.genderRow}>
              {genderOptions.map((option) => {
                const selected = gender === option;

                return (
                  <Pressable
                    accessibilityRole="radio"
                    accessibilityState={{ checked: selected }}
                    key={option}
                    onPress={() => setGender(option)}
                    style={({ pressed }) => [
                      styles.genderButton,
                      selected && styles.genderButtonSelected,
                      pressed && styles.pressed,
                    ]}>
                    <Text style={[styles.genderText, selected && styles.genderTextSelected]}>
                      {option}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <InputField
            icon="calendar-outline"
            keyboardType="numbers-and-punctuation"
            label="Ngày sinh"
            onChangeText={setBirthday}
            placeholder="dd/mm/yyyy"
            value={birthday}
          />
        </View>

        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>Đổi mật khẩu</Text>
          <InputField
            icon="lock-closed-outline"
            label="Mật khẩu hiện tại"
            onChangeText={setCurrentPassword}
            placeholder="Nhập mật khẩu hiện tại"
            secureTextEntry
            value={currentPassword}
          />
          <InputField
            icon="key-outline"
            label="Mật khẩu mới"
            onChangeText={setNewPassword}
            placeholder="Ít nhất 6 ký tự"
            secureTextEntry
            value={newPassword}
          />
          <InputField
            icon="checkmark-circle-outline"
            label="Xác nhận mật khẩu mới"
            onChangeText={setConfirmPassword}
            placeholder="Nhập lại mật khẩu mới"
            secureTextEntry
            value={confirmPassword}
          />
          <TouchableOpacity
            activeOpacity={0.8}
            disabled={isChangingPassword}
            onPress={() => void handleChangePassword()}
            style={[styles.passwordButton, isChangingPassword && styles.saveButtonDisabled]}>
            <Text style={styles.passwordButtonText}>
              {isChangingPassword ? 'ĐANG ĐỔI...' : 'ĐỔI MẬT KHẨU'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          activeOpacity={0.8}
          disabled={isSaving}
          onPress={() => void handleSave()}
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}>
          <Text style={styles.saveButtonText}>{isSaving ? 'ĐANG LƯU...' : 'LƯU THAY ĐỔI'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

type InputFieldProps = {
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  icon: keyof typeof Ionicons.glyphMap;
  keyboardType?: 'default' | 'email-address' | 'numbers-and-punctuation' | 'phone-pad';
  label: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
  value: string;
};

function InputField({
  autoCapitalize,
  icon,
  keyboardType = 'default',
  label,
  onChangeText,
  placeholder,
  secureTextEntry,
  value,
}: InputFieldProps) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrapper}>
        <Ionicons color={Theme.colors.muted} name={icon} size={20} />
        <TextInput
          autoCapitalize={autoCapitalize}
          keyboardType={keyboardType}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Theme.colors.muted}
          secureTextEntry={secureTextEntry}
          selectionColor={Theme.colors.primary}
          style={styles.input}
          value={value}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: Theme.colors.background,
    flex: 1,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 58,
    paddingHorizontal: Theme.spacing.lg,
  },
  backButton: {
    alignItems: 'center',
    backgroundColor: Theme.colors.surface,
    borderColor: Theme.colors.border,
    borderRadius: Theme.radius.md,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  headerTitle: {
    color: Theme.colors.text,
    flex: 1,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 24,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 42,
  },
  content: {
    padding: Theme.spacing.lg,
    paddingBottom: 116,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: Theme.spacing.xl,
  },
  avatarRing: {
    alignItems: 'center',
    backgroundColor: Theme.colors.surface,
    borderColor: Theme.colors.primarySoft,
    borderRadius: 58,
    borderWidth: 6,
    height: 116,
    justifyContent: 'center',
    width: 116,
  },
  avatar: {
    borderRadius: 50,
    height: 100,
    width: 100,
  },
  changePhotoButton: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Theme.spacing.xs,
    marginTop: Theme.spacing.md,
    minHeight: 36,
    paddingHorizontal: Theme.spacing.md,
  },
  changePhotoText: {
    color: Theme.colors.primary,
    fontSize: 14,
    fontWeight: '900',
    lineHeight: 18,
  },
  formCard: {
    backgroundColor: Theme.colors.surface,
    borderColor: Theme.colors.border,
    borderRadius: Theme.radius.md,
    borderWidth: 1,
    gap: Theme.spacing.lg,
    padding: Theme.spacing.lg,
    ...Theme.shadow,
  },
  sectionTitle: {
    color: Theme.colors.text,
    fontSize: 17,
    fontWeight: '900',
    lineHeight: 22,
  },
  inputGroup: {
    gap: Theme.spacing.sm,
  },
  label: {
    color: Theme.colors.text,
    fontSize: 14,
    fontWeight: '900',
    lineHeight: 18,
  },
  inputWrapper: {
    alignItems: 'center',
    backgroundColor: Theme.colors.surfaceMuted,
    borderColor: Theme.colors.border,
    borderRadius: Theme.radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: Theme.spacing.sm,
    minHeight: 54,
    paddingHorizontal: Theme.spacing.md,
  },
  input: {
    color: Theme.colors.text,
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    minWidth: 0,
    paddingVertical: 0,
  },
  genderRow: {
    flexDirection: 'row',
    gap: Theme.spacing.sm,
  },
  genderButton: {
    alignItems: 'center',
    backgroundColor: Theme.colors.surfaceMuted,
    borderColor: Theme.colors.border,
    borderRadius: Theme.radius.md,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 46,
  },
  genderButtonSelected: {
    backgroundColor: Theme.colors.primary,
    borderColor: Theme.colors.primary,
  },
  genderText: {
    color: Theme.colors.text,
    fontSize: 14,
    fontWeight: '900',
    lineHeight: 18,
  },
  genderTextSelected: {
    color: Theme.colors.white,
  },
  footer: {
    backgroundColor: Theme.colors.surface,
    borderTopColor: Theme.colors.border,
    borderTopWidth: 1,
    bottom: 0,
    left: 0,
    padding: Theme.spacing.lg,
    position: 'absolute',
    right: 0,
  },
  saveButton: {
    alignItems: 'center',
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.radius.md,
    justifyContent: 'center',
    minHeight: 54,
  },
  saveButtonDisabled: {
    opacity: 0.62,
  },
  saveButtonText: {
    color: Theme.colors.white,
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 20,
  },
  passwordButton: {
    alignItems: 'center',
    backgroundColor: Theme.colors.text,
    borderRadius: Theme.radius.md,
    justifyContent: 'center',
    minHeight: 50,
  },
  passwordButtonText: {
    color: Theme.colors.white,
    fontSize: 14,
    fontWeight: '900',
    lineHeight: 18,
  },
  pressed: {
    opacity: 0.72,
  },
});
