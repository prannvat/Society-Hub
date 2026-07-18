import React from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Avatar } from '@/components/Avatar';
import { spacing } from '@/config/theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useUserRoles } from '@/hooks/useUserRoles';
import { useLocalAppState } from '@/hooks/useLocalAppState';

type AccountSwitcherProps = {
  visible: boolean;
  onClose: () => void;
};

/**
 * Instagram-style account switcher. Lists the personal account plus every society
 * the user runs; picking one fully switches the app into that account's world.
 */
export const AccountSwitcher = ({ visible, onClose }: AccountSwitcherProps) => {
  const theme = useAppTheme();
  const { activeAccount, adminSocieties, switchToPersonal, switchToSociety } = useUserRoles();
  const { profile, allSocieties } = useLocalAppState();
  const [switching, setSwitching] = React.useState<string | null>(null);

  const handle = async (fn: () => Promise<void>, key: string) => {
    setSwitching(key);
    try {
      await fn();
      onClose();
    } finally {
      setSwitching(null);
    }
  };

  const personalActive = activeAccount.kind === 'personal';

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={[styles.scrim, { backgroundColor: theme.colors.overlay }]} onPress={onClose}>
        <Pressable
          style={[
            styles.sheet,
            { backgroundColor: theme.colors.surfaceElevated, borderTopLeftRadius: theme.radius.xl, borderTopRightRadius: theme.radius.xl },
            theme.elevation.e3,
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={[styles.handle, { backgroundColor: theme.colors.borderStrong }]} />
          <Text style={[theme.typography.h3, { color: theme.colors.textPrimary }]}>Switch account</Text>
          <Text style={[theme.typography.caption, styles.subtitle, { color: theme.colors.textSecondary }]}>
            You stay signed in as yourself — this changes what you post and manage as.
          </Text>

          {/* Personal account */}
          <AccountRow
            name={profile.fullName || 'You'}
            handle="Personal account"
            avatarUrl={profile.avatarUrl}
            active={personalActive}
            loading={switching === 'personal'}
            onPress={() => handle(switchToPersonal, 'personal')}
          />

          {adminSocieties.length > 0 ? (
            <Text style={[theme.typography.micro, styles.section, { color: theme.colors.textTertiary }]}>SOCIETIES YOU MANAGE</Text>
          ) : null}

          {adminSocieties.map((soc) => {
            const society = allSocieties.find((s) => s.id === soc.societyId);
            const active = activeAccount.kind === 'society' && activeAccount.societyId === soc.societyId;
            const brand = society?.primaryColor || theme.colors.primary;
            const shortName = society?.shortName;
            return (
              <AccountRow
                key={soc.societyId}
                name={soc.societyName}
                handle={shortName ? `@${shortName} · ${soc.role}` : soc.role}
                avatarUrl={society?.logoUrl ?? undefined}
                brand={brand}
                active={active}
                loading={switching === soc.societyId}
                onPress={() => handle(() => switchToSociety(soc.societyId), soc.societyId)}
              />
            );
          })}
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const AccountRow = ({
  name,
  handle,
  avatarUrl,
  brand,
  active,
  loading,
  onPress,
}: {
  name: string;
  handle: string;
  avatarUrl?: string;
  brand?: string;
  active: boolean;
  loading: boolean;
  onPress: () => void;
}) => {
  const theme = useAppTheme();
  const accent = brand ?? theme.colors.primary;
  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      accessibilityRole="button"
      accessibilityState={{ selected: active, disabled: loading }}
      style={({ pressed }) => [
        styles.row,
        {
          borderRadius: theme.radius.card,
          backgroundColor: active ? theme.colors.primarySoft : pressed ? theme.colors.surfaceSunken : 'transparent',
          borderColor: active ? accent : theme.colors.border,
          opacity: loading ? 0.7 : 1,
        },
      ]}
    >
      <View style={[styles.avatarRing, { borderColor: active ? accent : 'transparent' }]}>
        <Avatar name={name} url={avatarUrl} size={44} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[theme.typography.bodyMedium, { color: theme.colors.textPrimary }]} numberOfLines={1}>
          {name}
        </Text>
        <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]} numberOfLines={1}>
          {handle}
        </Text>
      </View>
      {loading ? (
        <ActivityIndicator size="small" color={accent} />
      ) : active ? (
        <MaterialIcons name="check-circle" size={24} color={accent} />
      ) : (
        <MaterialIcons name="radio-button-unchecked" size={24} color={theme.colors.borderStrong} />
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  scrim: { flex: 1, justifyContent: 'flex-end' },
  sheet: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl, paddingTop: spacing.sm, gap: spacing.xs },
  handle: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: spacing.sm },
  subtitle: { marginBottom: spacing.xs, marginTop: 2 },
  section: { marginTop: spacing.md, marginBottom: spacing.xs },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.sm, borderWidth: 1, minHeight: 64 },
  avatarRing: { padding: 2, borderRadius: 999, borderWidth: 2 },
});
