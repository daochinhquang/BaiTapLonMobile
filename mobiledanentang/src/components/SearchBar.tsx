import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { Theme } from '@/constants/theme';

type SearchBarProps = {
  autoFocus?: boolean;
  navigateOnFocus?: boolean;
  onChangeText?: (value: string) => void;
  placeholder?: string;
  value?: string;
};

export default function SearchBar({
  autoFocus = false,
  navigateOnFocus = true,
  onChangeText,
  placeholder = 'Tìm kiếm sản phẩm...',
  value,
}: SearchBarProps) {
  return (
    <Pressable
      accessibilityRole="search"
      onPress={() => {
        if (navigateOnFocus) {
          router.push('/search' as never);
        }
      }}
      style={styles.wrapper}>
      <Ionicons color={Theme.colors.muted} name="search-outline" size={20} />
      <TextInput
        autoFocus={autoFocus}
        editable={!navigateOnFocus || Boolean(onChangeText)}
        onChangeText={onChangeText}
        onFocus={() => {
          if (navigateOnFocus) {
            router.push('/search' as never);
          }
        }}
        placeholder={placeholder}
        placeholderTextColor={Theme.colors.muted}
        style={styles.input}
        value={value}
      />
      <View style={styles.filterButton}>
        <Ionicons color={Theme.colors.primary} name="options-outline" size={20} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: Theme.colors.surface,
    borderColor: Theme.colors.border,
    borderRadius: Theme.radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: Theme.spacing.sm,
    minHeight: 52,
    paddingLeft: Theme.spacing.lg,
    paddingRight: Theme.spacing.sm,
    width: '100%',
  },
  input: {
    color: Theme.colors.text,
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    minWidth: 0,
    paddingVertical: 0,
  },
  filterButton: {
    alignItems: 'center',
    backgroundColor: Theme.colors.primarySoft,
    borderRadius: Theme.radius.md,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
});
