import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { Theme } from '@/constants/theme';
import type { Category } from '@/types/product';

type CategoryCardProps = {
  category: Category;
  compact?: boolean;
};

export default function CategoryCard({ category, compact = false }: CategoryCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() =>
        router.push({ pathname: '/category/[id]', params: { id: category.id } } as never)
      }
      style={({ pressed }) => [
        compact ? styles.compactCard : styles.card,
        pressed && styles.pressed,
      ]}>
      {compact ? (
        <View style={[styles.compactIcon, { backgroundColor: `${category.color}18` }]}>
          <Ionicons color={category.color} name={category.icon} size={24} />
        </View>
      ) : (
        <Image source={{ uri: category.image }} style={styles.image} />
      )}
      <Text numberOfLines={2} style={compact ? styles.compactName : styles.name}>
        {category.name}
      </Text>
      {!compact ? <Text style={styles.description}>{category.description}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Theme.colors.surface,
    borderColor: Theme.colors.border,
    borderRadius: Theme.radius.md,
    borderWidth: 1,
    overflow: 'hidden',
    width: 150,
  },
  image: {
    backgroundColor: Theme.colors.surfaceMuted,
    height: 92,
    width: '100%',
  },
  name: {
    color: Theme.colors.text,
    fontSize: 15,
    fontWeight: '900',
    lineHeight: 20,
    paddingHorizontal: Theme.spacing.md,
    paddingTop: Theme.spacing.md,
  },
  description: {
    color: Theme.colors.muted,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
    paddingBottom: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.md,
    paddingTop: 2,
  },
  compactCard: {
    alignItems: 'center',
    gap: Theme.spacing.sm,
    width: 82,
  },
  compactIcon: {
    alignItems: 'center',
    borderRadius: Theme.radius.md,
    height: 58,
    justifyContent: 'center',
    width: 58,
  },
  compactName: {
    color: Theme.colors.text,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 16,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.72,
  },
});
