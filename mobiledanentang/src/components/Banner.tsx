import { ImageBackground, StyleSheet, Text, View } from 'react-native';

import { Theme } from '@/constants/theme';

type BannerProps = {
  image: string;
};

export default function Banner({ image }: BannerProps) {
  return (
    <ImageBackground imageStyle={styles.image} source={{ uri: image }} style={styles.banner}>
      <View style={styles.overlay} />
      <View style={styles.copy}>
        <Text style={styles.kicker}>ƯU ĐÃI BÓNG CHUYỀN</Text>
        <Text style={styles.title}>GIẢM GIÁ ĐẾN 30%</Text>
        <Text style={styles.text}>Bóng thi đấu, giày sân trong nhà và phụ kiện CLB.</Text>
      </View>
      <View style={styles.discountBadge}>
        <Text style={styles.discountText}>30%</Text>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  banner: {
    alignSelf: 'center',
    borderRadius: Theme.radius.md,
    minHeight: 168,
    overflow: 'hidden',
    width: '100%',
  },
  image: {
    borderRadius: Theme.radius.md,
  },
  overlay: {
    backgroundColor: 'rgba(16, 19, 20, 0.52)',
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  copy: {
    gap: Theme.spacing.sm,
    maxWidth: '74%',
    padding: Theme.spacing.lg,
  },
  kicker: {
    color: Theme.colors.warning,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 16,
  },
  title: {
    color: Theme.colors.white,
    fontSize: 25,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 30,
  },
  text: {
    color: '#EAF2EE',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  discountBadge: {
    alignItems: 'center',
    backgroundColor: Theme.colors.accent,
    borderRadius: Theme.radius.md,
    bottom: Theme.spacing.lg,
    justifyContent: 'center',
    minHeight: 46,
    paddingHorizontal: Theme.spacing.md,
    position: 'absolute',
    right: Theme.spacing.lg,
  },
  discountText: {
    color: Theme.colors.white,
    fontSize: 17,
    fontWeight: '900',
    lineHeight: 22,
  },
});
