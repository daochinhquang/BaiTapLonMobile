import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { Theme } from '@/constants/theme';
import type { IoniconName } from '@/types/product';

type EmptyStateProps = {
  icon?: IoniconName;
  text: string;
  title: string;
};

export default function EmptyState({ icon = 'cube-outline', text, title }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Ionicons color={Theme.colors.primary} name={icon} size={28} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: Theme.colors.surface,
    borderColor: Theme.colors.border,
    borderRadius: Theme.radius.md,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 190,
    padding: Theme.spacing.xl,
  },
  iconWrap: {
    alignItems: 'center',
    backgroundColor: Theme.colors.primarySoft,
    borderRadius: Theme.radius.md,
    height: 58,
    justifyContent: 'center',
    marginBottom: Theme.spacing.md,
    width: 58,
  },
  title: {
    color: Theme.colors.text,
    fontSize: 18,
    fontWeight: '900',
    lineHeight: 24,
    textAlign: 'center',
  },
  text: {
    color: Theme.colors.muted,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
    marginTop: Theme.spacing.xs,
    textAlign: 'center',
  },
});
