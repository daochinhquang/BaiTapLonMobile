import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Header from '@/components/Header';
import { Theme } from '@/constants/theme';
import { useShop } from '@/context/ShopContext';

const menuItems = [
  { icon: 'person-outline', label: 'Thông tin cá nhân', href: '/personal-info' },
  { icon: 'location-outline', label: 'Địa chỉ nhận hàng', href: '/address' },
  { icon: 'receipt-outline', label: 'Đơn hàng của tôi', href: '/orders' },
  { icon: 'heart-outline', label: 'Sản phẩm yêu thích', href: '/favorites' },
  { icon: 'ticket-outline', label: 'Kho voucher', href: '/vouchers' },
  { icon: 'settings-outline', label: 'Cài đặt', href: '/profile' },
] as const;

export default function ProfileScreen() {
  const { clearAuthenticatedUser, favoriteProducts, orders, user, vouchers } = useShop();

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <Header subtitle="Tài khoản và đơn hàng" title="Tài khoản" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.profileCard}>
          <Image source={{ uri: user.avatar }} style={styles.avatar} />
          <View style={styles.userInfo}>
            <Text style={styles.name}>{user.fullName}</Text>
            <Text style={styles.email}>{user.email}</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <StatItem label="Đơn hàng" value={orders.length.toString()} />
          <StatItem label="Yêu thích" value={favoriteProducts.length.toString()} />
          <StatItem label="Voucher" value={vouchers.length.toString()} />
        </View>

        <View style={styles.menu}>
          {menuItems.map((item) => (
            <Pressable
              key={item.label}
              onPress={() => router.push(item.href as never)}
              style={({ pressed }) => [styles.menuItem, pressed && styles.pressed]}>
              <View style={styles.menuIcon}>
                <Ionicons color={Theme.colors.primary} name={item.icon} size={21} />
              </View>
              <Text style={styles.menuText}>{item.label}</Text>
              <Ionicons color={Theme.colors.muted} name="chevron-forward" size={18} />
            </Pressable>
          ))}
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => {
            clearAuthenticatedUser();
            router.replace('/login');
          }}
          style={({ pressed }) => [styles.logoutButton, pressed && styles.pressed]}>
          <Ionicons color={Theme.colors.danger} name="log-out-outline" size={21} />
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: Theme.colors.background,
    flex: 1,
  },
  content: {
    gap: Theme.spacing.lg,
    padding: Theme.spacing.lg,
    paddingBottom: 100,
  },
  profileCard: {
    alignItems: 'center',
    backgroundColor: Theme.colors.surface,
    borderColor: Theme.colors.border,
    borderRadius: Theme.radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: Theme.spacing.md,
    padding: Theme.spacing.lg,
  },
  avatar: {
    borderRadius: Theme.radius.md,
    height: 68,
    width: 68,
  },
  userInfo: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    color: Theme.colors.text,
    fontSize: 20,
    fontWeight: '900',
    lineHeight: 26,
  },
  email: {
    color: Theme.colors.muted,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Theme.spacing.md,
  },
  statItem: {
    backgroundColor: Theme.colors.surface,
    borderColor: Theme.colors.border,
    borderRadius: Theme.radius.md,
    borderWidth: 1,
    flex: 1,
    padding: Theme.spacing.md,
  },
  statValue: {
    color: Theme.colors.text,
    fontSize: 20,
    fontWeight: '900',
    lineHeight: 26,
    textAlign: 'center',
  },
  statLabel: {
    color: Theme.colors.muted,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
    textAlign: 'center',
  },
  menu: {
    backgroundColor: Theme.colors.surface,
    borderColor: Theme.colors.border,
    borderRadius: Theme.radius.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  menuItem: {
    alignItems: 'center',
    borderBottomColor: Theme.colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: Theme.spacing.md,
    minHeight: 58,
    paddingHorizontal: Theme.spacing.md,
  },
  menuIcon: {
    alignItems: 'center',
    backgroundColor: Theme.colors.primarySoft,
    borderRadius: Theme.radius.md,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  menuText: {
    color: Theme.colors.text,
    flex: 1,
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 20,
  },
  logoutButton: {
    alignItems: 'center',
    backgroundColor: Theme.colors.surface,
    borderColor: Theme.colors.border,
    borderRadius: Theme.radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: Theme.spacing.sm,
    justifyContent: 'center',
    minHeight: 52,
  },
  logoutText: {
    color: Theme.colors.danger,
    fontSize: 15,
    fontWeight: '900',
    lineHeight: 20,
  },
  pressed: {
    opacity: 0.72,
  },
});
