import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Theme } from '@/constants/theme';

type QuantitySelectorProps = {
  max?: number;
  min?: number;
  onChange: (value: number) => void;
  value: number;
};

export default function QuantitySelector({ max = 99, min = 1, onChange, value }: QuantitySelectorProps) {
  return (
    <View style={styles.selector}>
      <Pressable
        accessibilityLabel="Giảm số lượng"
        accessibilityRole="button"
        onPress={() => onChange(Math.max(min, value - 1))}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
        <Text style={styles.buttonText}>-</Text>
      </Pressable>
      <Text style={styles.value}>{value}</Text>
      <Pressable
        accessibilityLabel="Tăng số lượng"
        accessibilityRole="button"
        onPress={() => onChange(Math.min(max, value + 1))}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
        <Text style={styles.buttonText}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  selector: {
    alignItems: 'center',
    backgroundColor: Theme.colors.surfaceMuted,
    borderColor: Theme.colors.border,
    borderRadius: Theme.radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 40,
  },
  button: {
    alignItems: 'center',
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  buttonText: {
    color: Theme.colors.text,
    fontSize: 20,
    fontWeight: '900',
    lineHeight: 24,
  },
  value: {
    color: Theme.colors.text,
    fontSize: 15,
    fontWeight: '900',
    lineHeight: 20,
    minWidth: 28,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.72,
  },
});
