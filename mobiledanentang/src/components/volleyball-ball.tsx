import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

type VolleyballBallProps = {
  accentColor: string;
  baseColor?: string;
  seamColor?: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
};

export function VolleyballBall({
  accentColor,
  baseColor = '#FFFFFF',
  seamColor = '#1E293B',
  size = 112,
  style,
}: VolleyballBallProps) {
  const lineWidth = Math.max(2, Math.round(size * 0.03));
  const arcSize = size * 0.82;

  return (
    <View
      style={[
        styles.shell,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: baseColor,
        },
        style,
      ]}>
      <View
        style={[
          styles.arc,
          {
            width: arcSize,
            height: arcSize,
            borderRadius: arcSize / 2,
            borderWidth: lineWidth,
            borderColor: accentColor,
            left: -arcSize * 0.38,
            top: size * 0.08,
          },
        ]}
      />
      <View
        style={[
          styles.arc,
          {
            width: arcSize,
            height: arcSize,
            borderRadius: arcSize / 2,
            borderWidth: lineWidth,
            borderColor: accentColor,
            right: -arcSize * 0.38,
            top: size * 0.08,
          },
        ]}
      />
      <View
        style={[
          styles.seam,
          {
            width: size * 1.2,
            height: lineWidth,
            backgroundColor: seamColor,
            top: size * 0.46,
            left: -size * 0.1,
            transform: [{ rotate: '-18deg' }],
          },
        ]}
      />
      <View
        style={[
          styles.seam,
          {
            width: size * 1.05,
            height: lineWidth,
            backgroundColor: seamColor,
            top: size * 0.63,
            left: -size * 0.04,
            transform: [{ rotate: '24deg' }],
          },
        ]}
      />
      <View
        style={[
          styles.glow,
          {
            width: size * 0.36,
            height: size * 0.16,
            borderRadius: size * 0.08,
            left: size * 0.2,
            top: size * 0.16,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.08)',
    elevation: 6,
    overflow: 'hidden',
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
  },
  arc: {
    backgroundColor: 'transparent',
    position: 'absolute',
  },
  seam: {
    borderRadius: 99,
    position: 'absolute',
  },
  glow: {
    backgroundColor: 'rgba(255, 255, 255, 0.62)',
    position: 'absolute',
    transform: [{ rotate: '-18deg' }],
  },
});
