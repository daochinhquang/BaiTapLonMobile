import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Header from '@/components/Header';
import { Theme } from '@/constants/theme';
import { useShop } from '@/context/ShopContext';
import type { Address, AddressInput } from '@/types/user';

function createEmptyAddress(userName: string, phone: string, isDefault: boolean): AddressInput {
  return {
    detail: '',
    district: '',
    isDefault,
    phone: phone.replaceAll(' ', ''),
    province: '',
    receiverName: userName,
    ward: '',
  };
}

export default function AddressScreen() {
  const { addAddress, addresses, deleteAddress, editAddress, setDefaultAddress, user } = useShop();
  const [editingAddressId, setEditingAddressId] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<AddressInput>(() =>
    createEmptyAddress(user.fullName, user.phone, addresses.length === 0)
  );
  const [saving, setSaving] = useState(false);
  const [changingDefaultId, setChangingDefaultId] = useState('');

  function updateField(field: keyof AddressInput, value: string | boolean) {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  }

  function openAddForm() {
    setEditingAddressId('');
    setForm(createEmptyAddress(user.fullName, user.phone, addresses.length === 0));
    setShowForm(true);
  }

  function openEditForm(address: Address) {
    setEditingAddressId(address.id);
    setForm({
      detail: address.detail,
      district: address.district,
      isDefault: address.isDefault,
      phone: address.phone,
      province: address.province,
      receiverName: address.receiverName,
      ward: address.ward,
    });
    setShowForm(true);
  }

  async function handleSaveAddress() {
    const payload: AddressInput = {
      detail: form.detail.trim(),
      district: form.district.trim(),
      isDefault: Boolean(form.isDefault),
      phone: form.phone.trim(),
      province: form.province.trim(),
      receiverName: form.receiverName.trim(),
      ward: form.ward.trim(),
    };

    if (
      !payload.receiverName ||
      !payload.phone ||
      !payload.province ||
      !payload.district ||
      !payload.ward ||
      !payload.detail
    ) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập đầy đủ thông tin địa chỉ nhận hàng.');
      return;
    }

    setSaving(true);

    try {
      if (editingAddressId) {
        await editAddress(editingAddressId, payload);
      } else {
        await addAddress(payload);
      }
      setShowForm(false);
      setEditingAddressId('');
      setForm(createEmptyAddress(user.fullName, user.phone, false));
      Alert.alert(
        editingAddressId ? 'Đã cập nhật địa chỉ' : 'Đã thêm địa chỉ',
        editingAddressId
          ? 'Địa chỉ nhận hàng đã được cập nhật.'
          : 'Địa chỉ mới đã được lưu cho tài khoản này.'
      );
    } catch (error) {
      Alert.alert(
        editingAddressId ? 'Không thể cập nhật địa chỉ' : 'Không thể thêm địa chỉ',
        error instanceof Error ? error.message : 'Vui lòng thử lại sau.'
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteAddress(addressId: string) {
    setChangingDefaultId(addressId);

    try {
      await deleteAddress(addressId);
      Alert.alert('Đã xóa địa chỉ', 'Địa chỉ nhận hàng đã được xóa khỏi tài khoản.');
    } catch (error) {
      Alert.alert(
        'Không thể xóa địa chỉ',
        error instanceof Error ? error.message : 'Vui lòng thử lại sau.'
      );
    } finally {
      setChangingDefaultId('');
    }
  }

  async function handleSetDefault(addressId: string) {
    setChangingDefaultId(addressId);

    try {
      await setDefaultAddress(addressId);
    } catch (error) {
      Alert.alert(
        'Không thể đổi địa chỉ mặc định',
        error instanceof Error ? error.message : 'Vui lòng thử lại sau.'
      );
    } finally {
      setChangingDefaultId('');
    }
  }

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <Header showBack subtitle="Địa chỉ lưu riêng cho tài khoản đang đăng nhập" title="Địa chỉ" />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}>
        <Pressable
          accessibilityRole="button"
          onPress={openAddForm}
          style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}>
          <Ionicons color={Theme.colors.white} name="add-circle-outline" size={20} />
          <Text style={styles.addButtonText}>Thêm địa chỉ mới</Text>
        </Pressable>

        {showForm ? (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>
              {editingAddressId ? 'Sửa địa chỉ' : 'Thông tin địa chỉ'}
            </Text>
            <InputField
              icon="person-outline"
              label="Người nhận"
              onChangeText={(value) => updateField('receiverName', value)}
              placeholder="Nhập tên người nhận"
              value={form.receiverName}
            />
            <InputField
              icon="call-outline"
              keyboardType="phone-pad"
              label="Số điện thoại"
              onChangeText={(value) => updateField('phone', value)}
              placeholder="Nhập số điện thoại"
              value={form.phone}
            />
            <InputField
              icon="map-outline"
              label="Tỉnh/Thành phố"
              onChangeText={(value) => updateField('province', value)}
              placeholder="VD: TP. Hồ Chí Minh"
              value={form.province}
            />
            <InputField
              icon="business-outline"
              label="Quận/Huyện"
              onChangeText={(value) => updateField('district', value)}
              placeholder="VD: Quận 1"
              value={form.district}
            />
            <InputField
              icon="navigate-outline"
              label="Phường/Xã"
              onChangeText={(value) => updateField('ward', value)}
              placeholder="VD: Phường Bến Nghé"
              value={form.ward}
            />
            <InputField
              icon="home-outline"
              label="Địa chỉ chi tiết"
              onChangeText={(value) => updateField('detail', value)}
              placeholder="Số nhà, tên đường"
              value={form.detail}
            />

            <Pressable
              accessibilityRole="checkbox"
              accessibilityState={{ checked: Boolean(form.isDefault) }}
              onPress={() => updateField('isDefault', !form.isDefault)}
              style={({ pressed }) => [styles.defaultToggle, pressed && styles.pressed]}>
              <View style={[styles.checkbox, form.isDefault && styles.checkboxChecked]}>
                {form.isDefault ? <Ionicons color={Theme.colors.white} name="checkmark" size={16} /> : null}
              </View>
              <Text style={styles.defaultToggleText}>Đặt làm địa chỉ mặc định</Text>
            </Pressable>

            <View style={styles.formActions}>
              <Pressable
                accessibilityRole="button"
                disabled={saving}
                onPress={() => {
                  setEditingAddressId('');
                  setShowForm(false);
                }}
                style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}>
                <Text style={styles.secondaryButtonText}>Hủy</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                disabled={saving}
                onPress={() => void handleSaveAddress()}
                style={({ pressed }) => [
                  styles.saveButton,
                  saving && styles.disabledButton,
                  pressed && styles.pressed,
                ]}>
                <Text style={styles.saveButtonText}>
                  {saving ? 'Đang lưu...' : editingAddressId ? 'Cập nhật' : 'Lưu địa chỉ'}
                </Text>
              </Pressable>
            </View>
          </View>
        ) : null}

        {addresses.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons color={Theme.colors.primary} name="location-outline" size={28} />
            <Text style={styles.emptyTitle}>Chưa có địa chỉ</Text>
            <Text style={styles.emptyText}>Thêm địa chỉ nhận hàng đầu tiên cho tài khoản này.</Text>
          </View>
        ) : null}

        {addresses.map((address) => (
          <View
            key={address.id}
            style={[styles.card, address.isDefault && styles.selectedCard]}>
            <View style={styles.topRow}>
              <View style={styles.iconWrap}>
                <Ionicons color={Theme.colors.primary} name="location-outline" size={22} />
              </View>
              <View style={styles.copy}>
                <Text style={styles.name}>{address.receiverName}</Text>
                <Text style={styles.phone}>{address.phone}</Text>
              </View>
              {address.isDefault ? (
                <View style={styles.defaultBadge}>
                  <Text style={styles.defaultText}>Mặc định</Text>
                </View>
              ) : (
                <Pressable
                  accessibilityRole="button"
                  disabled={Boolean(changingDefaultId)}
                  onPress={() => void handleSetDefault(address.id)}
                  style={({ pressed }) => pressed && styles.pressed}>
                  <Text style={styles.chooseText}>
                    {changingDefaultId === address.id ? 'Đang đổi...' : 'Chọn'}
                  </Text>
                </Pressable>
              )}
            </View>
            <Text style={styles.address}>
              {address.detail}, {address.ward}, {address.district}, {address.province}
            </Text>
            <View style={styles.addressActions}>
              <Pressable
                accessibilityRole="button"
                onPress={() => openEditForm(address)}
                style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}>
                <Ionicons color={Theme.colors.primary} name="create-outline" size={18} />
                <Text style={styles.actionText}>Sửa</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                disabled={changingDefaultId === address.id}
                onPress={() =>
                  Alert.alert('Xóa địa chỉ', 'Bạn chắc chắn muốn xóa địa chỉ này?', [
                    { style: 'cancel', text: 'Không' },
                    { onPress: () => void handleDeleteAddress(address.id), style: 'destructive', text: 'Xóa' },
                  ])
                }
                style={({ pressed }) => [styles.actionButton, styles.deleteButton, pressed && styles.pressed]}>
                <Ionicons color={Theme.colors.danger} name="trash-outline" size={18} />
                <Text style={styles.deleteText}>Xóa</Text>
              </Pressable>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

type InputFieldProps = {
  icon: keyof typeof Ionicons.glyphMap;
  keyboardType?: 'default' | 'phone-pad';
  label: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  value: string;
};

function InputField({
  icon,
  keyboardType = 'default',
  label,
  onChangeText,
  placeholder,
  value,
}: InputFieldProps) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrapper}>
        <Ionicons color={Theme.colors.muted} name={icon} size={19} />
        <TextInput
          keyboardType={keyboardType}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Theme.colors.muted}
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
  content: {
    gap: Theme.spacing.md,
    padding: Theme.spacing.lg,
    paddingBottom: 100,
  },
  addButton: {
    alignItems: 'center',
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.radius.md,
    flexDirection: 'row',
    gap: Theme.spacing.sm,
    justifyContent: 'center',
    minHeight: 50,
  },
  addButtonText: {
    color: Theme.colors.white,
    fontSize: 15,
    fontWeight: '900',
    lineHeight: 20,
  },
  formCard: {
    backgroundColor: Theme.colors.surface,
    borderColor: Theme.colors.border,
    borderRadius: Theme.radius.md,
    borderWidth: 1,
    gap: Theme.spacing.md,
    padding: Theme.spacing.lg,
  },
  formTitle: {
    color: Theme.colors.text,
    fontSize: 17,
    fontWeight: '900',
    lineHeight: 22,
  },
  inputGroup: {
    gap: Theme.spacing.xs,
  },
  label: {
    color: Theme.colors.text,
    fontSize: 13,
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
    minHeight: 50,
    paddingHorizontal: Theme.spacing.md,
  },
  input: {
    color: Theme.colors.text,
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    minWidth: 0,
    paddingVertical: 0,
  },
  defaultToggle: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Theme.spacing.sm,
    minHeight: 36,
  },
  checkbox: {
    alignItems: 'center',
    backgroundColor: Theme.colors.surfaceMuted,
    borderColor: Theme.colors.border,
    borderRadius: 6,
    borderWidth: 1,
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  checkboxChecked: {
    backgroundColor: Theme.colors.primary,
    borderColor: Theme.colors.primary,
  },
  defaultToggleText: {
    color: Theme.colors.text,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 18,
  },
  formActions: {
    flexDirection: 'row',
    gap: Theme.spacing.sm,
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: Theme.colors.surfaceMuted,
    borderColor: Theme.colors.border,
    borderRadius: Theme.radius.md,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 48,
  },
  secondaryButtonText: {
    color: Theme.colors.text,
    fontSize: 14,
    fontWeight: '900',
  },
  saveButton: {
    alignItems: 'center',
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.radius.md,
    flex: 1,
    justifyContent: 'center',
    minHeight: 48,
  },
  saveButtonText: {
    color: Theme.colors.white,
    fontSize: 14,
    fontWeight: '900',
  },
  disabledButton: {
    opacity: 0.62,
  },
  emptyCard: {
    alignItems: 'center',
    backgroundColor: Theme.colors.surface,
    borderColor: Theme.colors.border,
    borderRadius: Theme.radius.md,
    borderWidth: 1,
    gap: Theme.spacing.xs,
    padding: Theme.spacing.xl,
  },
  emptyTitle: {
    color: Theme.colors.text,
    fontSize: 16,
    fontWeight: '900',
    lineHeight: 21,
  },
  emptyText: {
    color: Theme.colors.muted,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
    textAlign: 'center',
  },
  card: {
    backgroundColor: Theme.colors.surface,
    borderColor: Theme.colors.border,
    borderRadius: Theme.radius.md,
    borderWidth: 1,
    gap: Theme.spacing.md,
    padding: Theme.spacing.lg,
  },
  selectedCard: {
    backgroundColor: Theme.colors.primarySoft,
    borderColor: Theme.colors.primary,
  },
  topRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Theme.spacing.md,
  },
  iconWrap: {
    alignItems: 'center',
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.radius.md,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    color: Theme.colors.text,
    fontSize: 16,
    fontWeight: '900',
    lineHeight: 21,
  },
  phone: {
    color: Theme.colors.muted,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
    marginTop: 2,
  },
  defaultBadge: {
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.radius.md,
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: 5,
  },
  defaultText: {
    color: Theme.colors.white,
    fontSize: 11,
    fontWeight: '900',
  },
  chooseText: {
    color: Theme.colors.primary,
    fontSize: 12,
    fontWeight: '900',
    lineHeight: 16,
  },
  address: {
    color: Theme.colors.muted,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 19,
  },
  addressActions: {
    borderTopColor: Theme.colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: Theme.spacing.sm,
    paddingTop: Theme.spacing.md,
  },
  actionButton: {
    alignItems: 'center',
    backgroundColor: Theme.colors.surface,
    borderColor: Theme.colors.border,
    borderRadius: Theme.radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: Theme.spacing.xs,
    justifyContent: 'center',
    minHeight: 38,
    paddingHorizontal: Theme.spacing.md,
  },
  actionText: {
    color: Theme.colors.primary,
    fontSize: 12,
    fontWeight: '900',
  },
  deleteButton: {
    borderColor: '#F6C8C5',
  },
  deleteText: {
    color: Theme.colors.danger,
    fontSize: 12,
    fontWeight: '900',
  },
  pressed: {
    opacity: 0.72,
  },
});
