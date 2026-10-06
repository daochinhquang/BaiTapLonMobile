import { Link, router } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Theme } from '@/constants/theme';
import { useShop } from '@/context/ShopContext';
import { register } from '@/services/authService';

export default function RegisterScreen() {
  const { setAuthenticatedUser } = useShop();
  const [fullName, setFullName] = useState('Nguyễn Minh Anh');
  const [email, setEmail] = useState('minhanh@example.com');
  const [password, setPassword] = useState('12345678');
  const [phone, setPhone] = useState('0902345678');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    const nextFullName = fullName.trim();
    const nextEmail = email.trim();
    const nextPhone = phone.trim();

    if (!nextFullName || !password || (!nextEmail && !nextPhone)) {
      setError('Vui lòng nhập họ tên, mật khẩu và email hoặc số điện thoại.');
      return;
    }

    if (password.length < 6) {
      setError('Mật khẩu cần có ít nhất 6 ký tự.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const newUser = await register({
        email: nextEmail,
        fullName: nextFullName,
        password,
        phone: nextPhone,
      });
      setAuthenticatedUser(newUser);
      router.replace('/');
    } catch (registerError) {
      setError(registerError instanceof Error ? registerError.message : 'Đăng ký không thành công.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
          <Text style={styles.title}>Tạo tài khoản</Text>
          <Text style={styles.subtitle}>Mua bóng chuyền, lưu voucher và đặt lại đơn nhanh hơn.</Text>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TextInput
            onChangeText={setFullName}
            placeholder="Họ tên"
            placeholderTextColor={Theme.colors.muted}
            style={styles.input}
            value={fullName}
          />
          <TextInput
            autoCapitalize="none"
            keyboardType="email-address"
            onChangeText={setEmail}
            placeholder="Email"
            placeholderTextColor={Theme.colors.muted}
            style={styles.input}
            value={email}
          />
          <TextInput
            keyboardType="phone-pad"
            onChangeText={setPhone}
            placeholder="Số điện thoại"
            placeholderTextColor={Theme.colors.muted}
            style={styles.input}
            value={phone}
          />
          <TextInput
            onChangeText={setPassword}
            placeholder="Mật khẩu"
            placeholderTextColor={Theme.colors.muted}
            secureTextEntry
            style={styles.input}
            value={password}
          />

          <Pressable
            accessibilityRole="button"
            disabled={loading}
            onPress={() => void handleRegister()}
            style={({ pressed }) => [
              styles.primaryButton,
              loading && styles.disabledButton,
              pressed && styles.pressed,
            ]}>
            <Text style={styles.primaryText}>{loading ? 'Đang tạo...' : 'Đăng ký'}</Text>
          </Pressable>

          <Link href="/login" asChild>
            <Pressable style={({ pressed }) => pressed && styles.pressed}>
              <Text style={styles.loginLink}>Đã có tài khoản? Đăng nhập</Text>
            </Pressable>
          </Link>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: Theme.colors.background,
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  content: {
    gap: Theme.spacing.md,
    padding: Theme.spacing.xl,
    paddingTop: 72,
  },
  title: {
    color: Theme.colors.text,
    fontSize: 30,
    fontWeight: '900',
    lineHeight: 36,
  },
  subtitle: {
    color: Theme.colors.muted,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
    marginBottom: Theme.spacing.md,
  },
  input: {
    backgroundColor: Theme.colors.surface,
    borderColor: Theme.colors.border,
    borderRadius: Theme.radius.md,
    borderWidth: 1,
    color: Theme.colors.text,
    fontSize: 15,
    fontWeight: '700',
    minHeight: 54,
    paddingHorizontal: Theme.spacing.lg,
  },
  errorText: {
    backgroundColor: '#FFF1ED',
    borderColor: Theme.colors.danger,
    borderRadius: Theme.radius.md,
    borderWidth: 1,
    color: Theme.colors.danger,
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18,
    padding: Theme.spacing.md,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.radius.md,
    justifyContent: 'center',
    minHeight: 54,
    marginTop: Theme.spacing.sm,
  },
  primaryText: {
    color: Theme.colors.white,
    fontSize: 15,
    fontWeight: '900',
  },
  disabledButton: {
    opacity: 0.62,
  },
  loginLink: {
    color: Theme.colors.primary,
    fontSize: 14,
    fontWeight: '900',
    marginTop: Theme.spacing.sm,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.72,
  },
});
