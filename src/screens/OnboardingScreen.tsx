import React from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PrimaryButton } from '@/components/PrimaryButton';
import { TextButton } from '@/components/TextButton';
import { RootStackParamList } from '@/navigation/types';
import { ScreenLayout } from './ScreenLayout';
import { AppTheme } from '@/config/theme';
import { useAppTheme } from '@/hooks/useAppTheme';

// Translucent brand-glass layers drawn on the hero gradient — intentionally not theme tokens.
const GLASS_SOFT = 'rgba(255, 255, 255, 0.16)';
const GLASS_MEDIUM = 'rgba(255, 255, 255, 0.32)';
const GLASS_STRONG = 'rgba(255, 255, 255, 0.55)';

type IconName = keyof typeof MaterialIcons.glyphMap;

const FloatingChip = ({
  icon,
  size,
  iconColor,
  style
}: {
  icon: IconName;
  size: number;
  iconColor: string;
  style: object;
}) => (
  <View
    style={[
      styles.floatingChip,
      { width: size, height: size, borderRadius: size * 0.32 },
      style
    ]}
  >
    <MaterialIcons name={icon} size={size * 0.52} color={iconColor} />
  </View>
);

/** Step 1 — community: central mark with orbiting feature chips. */
const HeroCommunity = ({ theme }: { theme: AppTheme }) => (
  <View style={styles.heroCanvas}>
    <View style={[styles.orbitRing, { width: 220, height: 220, borderRadius: 110 }]} />
    <View style={[styles.orbitRing, { width: 290, height: 290, borderRadius: 145 }]} />
    <View style={styles.heroCenterCircle}>
      <MaterialIcons name="groups" size={52} color={theme.colors.textOnPrimary} />
    </View>
    <FloatingChip icon="event" size={48} iconColor={theme.colors.textOnPrimary} style={{ top: 34, left: 42 }} />
    <FloatingChip icon="poll" size={44} iconColor={theme.colors.textOnPrimary} style={{ top: 52, right: 40 }} />
    <FloatingChip icon="chat-bubble-outline" size={44} iconColor={theme.colors.textOnPrimary} style={{ bottom: 40, left: 60 }} />
    <FloatingChip icon="campaign" size={48} iconColor={theme.colors.textOnPrimary} style={{ bottom: 32, right: 56 }} />
    <View style={[styles.dotAccent, { top: 96, right: 96 }]} />
    <View style={[styles.dotAccent, { bottom: 86, left: 34, width: 8, height: 8, borderRadius: 4 }]} />
  </View>
);

/** Step 2 — events: mock event-card silhouette under an event mark. */
const HeroEvents = ({ theme }: { theme: AppTheme }) => (
  <View style={styles.heroCanvas}>
    <View style={[styles.heroCenterCircle, styles.heroSmallCircle]}>
      <MaterialIcons name="event-available" size={36} color={theme.colors.textOnPrimary} />
    </View>
    <View style={styles.mockCard}>
      <View style={styles.mockCardRow}>
        <View style={styles.mockDateBadge}>
          <Text style={[styles.mockDateText, { color: theme.colors.textOnPrimary }]}>18</Text>
        </View>
        <View style={styles.mockCardLines}>
          <View style={[styles.mockLine, { width: '78%', backgroundColor: GLASS_STRONG }]} />
          <View style={[styles.mockLine, { width: '52%' }]} />
        </View>
      </View>
      <View style={styles.mockCardFooter}>
        <View style={[styles.mockPill, { width: 76 }]} />
        <View style={[styles.mockPill, { width: 52 }]} />
      </View>
    </View>
    <View style={[styles.mockCardGhost, { top: 176 }]} />
  </View>
);

/** Step 3 — rewards: trophy mark orbited by points & perk chips. */
const HeroRewards = ({ theme }: { theme: AppTheme }) => (
  <View style={styles.heroCanvas}>
    <View style={[styles.orbitRing, { width: 220, height: 220, borderRadius: 110 }]} />
    <View style={[styles.orbitRing, { width: 290, height: 290, borderRadius: 145 }]} />
    <View style={styles.heroCenterCircle}>
      <MaterialIcons name="emoji-events" size={52} color={theme.colors.textOnPrimary} />
    </View>
    <FloatingChip icon="star" size={48} iconColor={theme.colors.textOnPrimary} style={{ top: 36, left: 46 }} />
    <FloatingChip icon="redeem" size={44} iconColor={theme.colors.textOnPrimary} style={{ top: 54, right: 44 }} />
    <FloatingChip icon="local-activity" size={44} iconColor={theme.colors.textOnPrimary} style={{ bottom: 42, left: 62 }} />
    <FloatingChip icon="bolt" size={48} iconColor={theme.colors.textOnPrimary} style={{ bottom: 34, right: 58 }} />
    <View style={[styles.dotAccent, { top: 96, right: 96 }]} />
    <View style={[styles.dotAccent, { bottom: 86, left: 34, width: 8, height: 8, borderRadius: 4 }]} />
  </View>
);

export const OnboardingScreen = () => {
  const theme = useAppTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [step, setStep] = React.useState(0);
  const [fade] = React.useState(() => new Animated.Value(1));

  const steps: {
    title: string;
    subtitle: string;
    gradient: [string, string];
    Hero: ({ theme }: { theme: AppTheme }) => React.JSX.Element;
  }[] = [
    {
      title: 'Find your people',
      subtitle: 'Discover societies matched to your interests and university — your community is one tap away.',
      gradient: [theme.colors.primary, theme.colors.primaryPressed],
      Hero: HeroCommunity
    },
    {
      title: 'Never miss out',
      subtitle: 'Events, RSVPs, and updates from every society you join — all in one live feed.',
      gradient: [theme.colors.primaryPressed, theme.colors.primary],
      Hero: HeroEvents
    },
    {
      title: 'Get rewarded',
      subtitle: 'Earn Campus Points and unlock member perks as you join societies and show up.',
      gradient: [theme.colors.primary, theme.colors.primaryPressed],
      Hero: HeroRewards
    }
  ];

  const goToStep = (next: number) => {
    Animated.timing(fade, { toValue: 0, duration: 130, useNativeDriver: true }).start(() => {
      setStep(next);
      Animated.timing(fade, { toValue: 1, duration: 170, useNativeDriver: true }).start();
    });
  };

  const current = steps[step];
  const isLastStep = step === steps.length - 1;

  return (
    <ScreenLayout scroll={false}>
      <View style={[styles.container, { paddingHorizontal: theme.spacing.lg }]}>
        <View style={styles.backSlot}>
          {step > 0 ? (
            <Pressable
              onPress={() => goToStep(step - 1)}
              hitSlop={8}
              style={({ pressed }) => [styles.backButton, { opacity: pressed ? 0.6 : 1 }]}
              accessibilityRole="button"
              accessibilityLabel="Previous step"
            >
              <MaterialIcons name="arrow-back" size={24} color={theme.colors.textSecondary} />
            </Pressable>
          ) : null}
        </View>

        <Animated.View style={{ opacity: fade }}>
          <LinearGradient
            colors={current.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.hero, { borderRadius: theme.radius.xl }, theme.elevation.e2]}
          >
            <current.Hero theme={theme} />
          </LinearGradient>

          <View style={[styles.textBlock, { marginTop: theme.spacing.xl }]}>
            <Text style={[theme.typography.h1, styles.centeredText, { color: theme.colors.textPrimary }]}>
              {current.title}
            </Text>
            <Text
              style={[
                theme.typography.body,
                styles.centeredText,
                { color: theme.colors.textSecondary, marginTop: theme.spacing.sm }
              ]}
            >
              {current.subtitle}
            </Text>
          </View>
        </Animated.View>

        <View style={[styles.dots, { marginTop: theme.spacing.xl }]}>
          {steps.map((_, index) => (
            <View
              key={index}
              style={{
                width: index === step ? 24 : 8,
                height: 8,
                borderRadius: theme.radius.pill,
                backgroundColor: index === step ? theme.colors.primary : theme.colors.border
              }}
            />
          ))}
        </View>

        <View style={styles.spacer} />

        <View style={{ gap: theme.spacing.md, paddingBottom: theme.spacing.xl }}>
          {!isLastStep ? (
            <PrimaryButton label="Next" size="lg" icon="arrow-forward" onPress={() => goToStep(step + 1)} />
          ) : (
            <PrimaryButton label="Join Society" size="lg" onPress={() => navigation.navigate('SignUp')} />
          )}
          <View style={styles.loginLink}>
            <TextButton label="Already a member? Log in" onPress={() => navigation.navigate('Login')} />
          </View>
        </View>
      </View>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  backSlot: {
    height: 48,
    justifyContent: 'center'
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -10
  },
  hero: {
    height: 300,
    overflow: 'hidden'
  },
  heroCanvas: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  heroCenterCircle: {
    width: 104,
    height: 104,
    borderRadius: 52,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: GLASS_SOFT
  },
  heroSmallCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    marginBottom: 18
  },
  orbitRing: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: GLASS_SOFT
  },
  floatingChip: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: GLASS_SOFT
  },
  dotAccent: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: GLASS_MEDIUM
  },
  mockCard: {
    width: 236,
    borderRadius: 16,
    padding: 14,
    gap: 12,
    backgroundColor: GLASS_SOFT
  },
  mockCardGhost: {
    position: 'absolute',
    width: 196,
    height: 22,
    borderRadius: 11,
    backgroundColor: GLASS_SOFT,
    opacity: 0.6
  },
  mockCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  mockDateBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: GLASS_MEDIUM
  },
  mockDateText: {
    fontSize: 15,
    fontWeight: '800'
  },
  mockCardLines: {
    flex: 1,
    gap: 8
  },
  mockLine: {
    height: 8,
    borderRadius: 4,
    backgroundColor: GLASS_MEDIUM
  },
  mockCardFooter: {
    flexDirection: 'row',
    gap: 8
  },
  mockPill: {
    height: 18,
    borderRadius: 9,
    backgroundColor: GLASS_MEDIUM
  },
  textBlock: {
    alignItems: 'center',
    paddingHorizontal: 8
  },
  centeredText: {
    textAlign: 'center'
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8
  },
  spacer: {
    flex: 1
  },
  loginLink: {
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center'
  }
});
