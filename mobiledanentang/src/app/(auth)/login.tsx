import { Ionicons } from "@expo/vector-icons";
import { Link, router } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Theme } from "@/constants/theme";
import { useShop } from "@/context/ShopContext";
import { login } from "@/services/authService";

export default function LoginScreen() {
  const { setAuthenticatedUser } = useShop();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin() {
    if (!email.trim() || !password) {
      setError("Vui lòng nhập tài khoản và mật khẩu.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const loggedInUser = await login(email.trim(), password);
      setAuthenticatedUser(loggedInUser);
      router.replace("/");
    } catch (loginError) {
      setError(
        loginError instanceof Error
          ? loginError.message
          : "Đăng nhập không thành công.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.content}
        >
          <View style={styles.logo}>
            <Ionicons
              color={Theme.colors.primary}
              name="basketball-outline"
              size={42}
            />
          </View>
          <Text style={styles.title}>Đăng nhập</Text>
          <Text style={styles.subtitle}>
            Theo dõi đơn hàng, voucher và sản phẩm yêu thích của bạn.
          </Text>

          <View style={styles.form}>
            {error ? (
              <View style={styles.errorCard}>
                <Ionicons
                  color={Theme.colors.danger}
                  name="alert-circle-outline"
                  size={20}
                />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}
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
              onPress={() => void handleLogin()}
              style={({ pressed }) => [
                styles.primaryButton,
                loading && styles.disabledButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.primaryText}>
                {loading ? "Đang đăng nhập..." : "Đăng nhập"}
              </Text>
            </Pressable>
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.switchText}>Chưa có tài khoản?</Text>
            <Link href="/register" asChild>
              <Pressable>
                <Text style={styles.switchLink}>Đăng ký</Text>
              </Pressable>
            </Link>
          </View>
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
    gap: Theme.spacing.lg,
    padding: Theme.spacing.xl,
  },
  logo: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: Theme.colors.primarySoft,
    borderRadius: Theme.radius.md,
    height: 86,
    justifyContent: "center",
    marginTop: Theme.spacing.xl,
    width: 86,
  },
  title: {
    color: Theme.colors.text,
    fontSize: 30,
    fontWeight: "900",
    lineHeight: 36,
    textAlign: "center",
  },
  subtitle: {
    color: Theme.colors.muted,
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20,
    textAlign: "center",
  },
  form: {
    gap: Theme.spacing.md,
  },
  errorCard: {
    alignItems: "center",
    backgroundColor: "#FFF1ED",
    borderColor: Theme.colors.danger,
    borderRadius: Theme.radius.md,
    borderWidth: 1,
    flexDirection: "row",
    gap: Theme.spacing.sm,
    padding: Theme.spacing.md,
  },
  errorText: {
    color: Theme.colors.danger,
    flex: 1,
    fontSize: 13,
    fontWeight: "800",
    lineHeight: 18,
  },
  input: {
    backgroundColor: Theme.colors.surface,
    borderColor: Theme.colors.border,
    borderRadius: Theme.radius.md,
    borderWidth: 1,
    color: Theme.colors.text,
    fontSize: 15,
    fontWeight: "700",
    minHeight: 54,
    paddingHorizontal: Theme.spacing.lg,
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.radius.md,
    justifyContent: "center",
    minHeight: 54,
  },
  disabledButton: {
    opacity: 0.62,
  },
  primaryText: {
    color: Theme.colors.white,
    fontSize: 15,
    fontWeight: "900",
    lineHeight: 20,
  },
  switchRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: Theme.spacing.xs,
    justifyContent: "center",
  },
  switchText: {
    color: Theme.colors.muted,
    fontSize: 14,
    fontWeight: "700",
  },
  switchLink: {
    color: Theme.colors.primary,
    fontSize: 14,
    fontWeight: "900",
  },
  pressed: {
    opacity: 0.72,
  },
});
