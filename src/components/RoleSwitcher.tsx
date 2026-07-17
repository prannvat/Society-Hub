import React, { useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useUserRoles } from '@/hooks/useUserRoles';
import { Avatar } from '@/components/Avatar';
import { BadgeChip } from '@/components/BadgeChip';
import { AppMode } from '@/types';

type RoleSwitcherProps = {
  showModeText?: boolean;
  compact?: boolean;
  /**
   * 'trigger' (default) renders the compact pill that opens the switch sheet.
   * 'banner' renders the slim persistent mode bar used above the admin tab
   * navigators — tapping it (or its Switch action) opens the same sheet.
   */
  variant?: 'trigger' | 'banner';
};

export const RoleSwitcher = ({ showModeText = true, compact = false, variant = 'trigger' }: RoleSwitcherProps) => {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const {
    currentMode,
    setCurrentMode,
    canSwitchToAdmin,
    adminSocieties,
    selectedAdminSocietyId,
    setSelectedAdminSocietyId,
    canSwitchToUnionAdmin,
    unionAdminRelationships,
    selectedUniversityId,
    setSelectedUniversityId
  } = useUserRoles();
  const [modalVisible, setModalVisible] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);

  const handleModeSwitch = () => {
    if (!canSwitchToAdmin && !canSwitchToUnionAdmin) return;
    setModalVisible(true);
  };

  const closeSheet = () => {
    if (isSwitching) return;
    setModalVisible(false);
  };

  const selectMode = async (mode: AppMode) => {
    if (isSwitching) return;
    setIsSwitching(true);
    try {
      await setCurrentMode(mode);

      // Auto-select first admin society when switching to admin mode
      if (mode === 'Admin' && !selectedAdminSocietyId && adminSocieties.length > 0) {
        setSelectedAdminSocietyId(adminSocieties[0].societyId);
      }
    } finally {
      setIsSwitching(false);
      setModalVisible(false);
    }
  };

  const selectAdminSociety = async (societyId: string) => {
    if (isSwitching) return;
    setIsSwitching(true);
    try {
      setSelectedAdminSocietyId(societyId);
      await setCurrentMode('Admin');
    } finally {
      setIsSwitching(false);
      setModalVisible(false);
    }
  };

  const selectUnionAdmin = async (universityId: string) => {
    if (isSwitching) return;
    setIsSwitching(true);
    try {
      setSelectedUniversityId(universityId);
      await setCurrentMode('UnionAdmin');
    } finally {
      setIsSwitching(false);
      setModalVisible(false);
    }
  };

  const selectedSociety = adminSocieties.find(s => s.societyId === selectedAdminSocietyId);
  const selectedUniversity = unionAdminRelationships.find(u => u.universityId === selectedUniversityId);

  if (!canSwitchToAdmin && !canSwitchToUnionAdmin) {
    return null; // Don't show switcher if user can't switch
  }

  const renderOptionCard = ({
    key,
    icon,
    iconColor,
    iconBackground,
    leading,
    title,
    description,
    chipLabel,
    chipVariant,
    selected,
    onPress
  }: {
    key?: string;
    icon?: keyof typeof MaterialIcons.glyphMap;
    iconColor?: string;
    iconBackground?: string;
    leading?: React.ReactNode;
    title: string;
    description?: string;
    chipLabel?: string;
    chipVariant?: 'primary' | 'warning' | 'neutral';
    selected: boolean;
    onPress: () => void;
  }) => (
    <Pressable
      key={key}
      onPress={onPress}
      disabled={isSwitching}
      android_ripple={{ color: 'rgba(0,0,0,0.06)', borderless: false }}
      style={({ pressed }) => [
        styles.optionCard,
        {
          borderRadius: theme.radius.card,
          borderColor: selected ? theme.colors.primary : theme.colors.border,
          backgroundColor: selected
            ? theme.colors.primarySoft
            : pressed
              ? theme.colors.surfaceSunken
              : theme.colors.surface,
          opacity: isSwitching && !selected ? 0.55 : 1,
          transform: [{ scale: pressed && !isSwitching ? 0.99 : 1 }]
        }
      ]}
    >
      {leading ?? (
        <View style={[styles.optionIcon, { backgroundColor: iconBackground ?? theme.colors.primarySoft }]}>
          <MaterialIcons name={icon ?? 'person'} size={22} color={iconColor ?? theme.colors.primary} />
        </View>
      )}
      <View style={styles.optionText}>
        <View style={styles.optionTitleRow}>
          <Text style={[theme.typography.bodyMedium, { color: theme.colors.textPrimary, flexShrink: 1 }]} numberOfLines={1}>
            {title}
          </Text>
          {chipLabel ? <BadgeChip label={chipLabel} variant={chipVariant ?? 'neutral'} /> : null}
        </View>
        {description ? (
          <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]} numberOfLines={2}>
            {description}
          </Text>
        ) : null}
      </View>
      {selected ? (
        isSwitching ? (
          <ActivityIndicator size="small" color={theme.colors.primary} />
        ) : (
          <MaterialIcons name="check-circle" size={22} color={theme.colors.primary} />
        )
      ) : null}
    </Pressable>
  );

  const sheet = (
    <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={closeSheet}>
      <View style={[styles.sheetOverlay, { backgroundColor: theme.colors.overlay }]}>
        <Pressable style={styles.sheetDismissArea} onPress={closeSheet} accessibilityLabel="Close switch mode sheet" />
        <View
          style={[
            styles.sheet,
            theme.elevation.e3,
            {
              backgroundColor: theme.colors.surfaceElevated,
              borderTopLeftRadius: theme.radius.xl,
              borderTopRightRadius: theme.radius.xl,
              paddingBottom: Math.max(insets.bottom, 16)
            }
          ]}
        >
          <View style={[styles.dragHandle, { backgroundColor: theme.colors.borderStrong }]} />
          <View style={styles.sheetHeader}>
            <Text style={[theme.typography.h2, { color: theme.colors.textPrimary, flex: 1 }]}>Switch mode</Text>
            <Pressable
              onPress={closeSheet}
              hitSlop={12}
              accessibilityLabel="Close"
              style={({ pressed }) => [
                styles.closeButton,
                { backgroundColor: pressed ? theme.colors.surfaceSunken : 'transparent' }
              ]}
            >
              <MaterialIcons name="close" size={22} color={theme.colors.textSecondary} />
            </Pressable>
          </View>

          <ScrollView style={styles.sheetBody} contentContainerStyle={styles.sheetBodyContent} bounces={false}>
            {renderOptionCard({
              icon: 'school',
              title: 'Student',
              description: 'Discover events, join societies, and engage with content',
              selected: currentMode === 'Consumer',
              onPress: () => selectMode('Consumer')
            })}

            {canSwitchToAdmin ? (
              <>
                <Text style={[theme.typography.micro, styles.sheetSectionLabel, { color: theme.colors.textTertiary }]}>
                  Society admin
                </Text>
                {adminSocieties.map((society) =>
                  renderOptionCard({
                    key: society.societyId,
                    leading: <Avatar name={society.societyName} size={40} />,
                    title: society.societyName,
                    description: 'Manage events, posts, and members',
                    chipLabel: society.role,
                    chipVariant: 'primary',
                    selected: currentMode === 'Admin' && selectedAdminSocietyId === society.societyId,
                    onPress: () => selectAdminSociety(society.societyId)
                  })
                )}
              </>
            ) : null}

            {canSwitchToUnionAdmin ? (
              <>
                <Text style={[theme.typography.micro, styles.sheetSectionLabel, { color: theme.colors.textTertiary }]}>
                  Union admin
                </Text>
                {unionAdminRelationships.map((university) =>
                  renderOptionCard({
                    key: university.universityId,
                    icon: 'account-balance',
                    iconColor: theme.colors.warning,
                    iconBackground: theme.colors.warningSoft,
                    title: university.universityName,
                    description: 'Manage committee approvals and university settings',
                    chipLabel: university.role,
                    chipVariant: 'warning',
                    selected: currentMode === 'UnionAdmin' && selectedUniversityId === university.universityId,
                    onPress: () => selectUnionAdmin(university.universityId)
                  })
                )}
              </>
            ) : null}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  if (variant === 'banner') {
    const isUnion = currentMode === 'UnionAdmin';
    const bannerBackground = isUnion ? theme.colors.warningSoft : theme.colors.primarySoft;
    const bannerTint = isUnion ? theme.colors.warning : theme.colors.primary;
    const bannerLabel = isUnion
      ? `Union Admin — ${selectedUniversity?.universityName ?? 'University'}`
      : currentMode === 'Admin'
        ? `Managing: ${selectedSociety?.societyName ?? 'Society'}`
        : 'Student mode';

    return (
      <>
        <Pressable
          onPress={handleModeSwitch}
          accessibilityRole="button"
          accessibilityLabel={`${bannerLabel}. Switch mode`}
          style={({ pressed }) => [
            styles.banner,
            {
              paddingTop: insets.top,
              backgroundColor: bannerBackground,
              borderBottomColor: theme.colors.border,
              opacity: pressed ? 0.92 : 1
            }
          ]}
        >
          <View style={styles.bannerRow}>
            <MaterialIcons
              name={isUnion ? 'account-balance' : 'admin-panel-settings'}
              size={16}
              color={bannerTint}
            />
            <Text style={[theme.typography.captionMedium, styles.bannerLabel, { color: bannerTint }]} numberOfLines={1}>
              {bannerLabel}
            </Text>
            <View style={styles.bannerSwitch}>
              <Text style={[theme.typography.captionMedium, { color: bannerTint }]}>Switch</Text>
              <MaterialIcons name="unfold-more" size={14} color={bannerTint} />
            </View>
          </View>
        </Pressable>
        {sheet}
      </>
    );
  }

  return (
    <>
      <Pressable
        onPress={handleModeSwitch}
        accessibilityRole="button"
        accessibilityLabel="Switch mode"
        hitSlop={compact ? 6 : 0}
        style={({ pressed }) => [
          styles.switcher,
          compact && styles.switcherCompact,
          {
            borderRadius: theme.radius.pill,
            borderColor: pressed ? theme.colors.primary : theme.colors.border,
            backgroundColor: pressed ? theme.colors.primarySoft : theme.colors.surface
          }
        ]}
      >
        <View style={styles.switcherContent}>
          <MaterialIcons
            name={
              currentMode === 'Consumer' ? 'person' : currentMode === 'Admin' ? 'admin-panel-settings' : 'account-balance'
            }
            size={compact ? 16 : 20}
            color={currentMode === 'UnionAdmin' ? theme.colors.warning : theme.colors.primary}
          />
          {showModeText && (
            <View style={styles.modeInfo}>
              <Text style={[theme.typography.captionMedium, { color: theme.colors.textPrimary }]} numberOfLines={1}>
                {currentMode === 'Consumer' ? 'Student' : currentMode === 'Admin' ? 'Society Admin' : 'Union Admin'}
              </Text>
              {currentMode === 'Admin' && selectedSociety && (
                <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, fontSize: 11, lineHeight: 14 }]} numberOfLines={1}>
                  {selectedSociety.societyName}
                </Text>
              )}
              {currentMode === 'UnionAdmin' && selectedUniversity && (
                <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, fontSize: 11, lineHeight: 14 }]} numberOfLines={1}>
                  {selectedUniversity.universityName}
                </Text>
              )}
            </View>
          )}
          <MaterialIcons name="expand-more" size={16} color={theme.colors.textTertiary} />
        </View>
      </Pressable>
      {sheet}
    </>
  );
};

const styles = StyleSheet.create({
  switcher: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 44,
    justifyContent: 'center'
  },
  switcherCompact: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    minHeight: 36
  },
  switcherContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  modeInfo: {
    flexShrink: 1
  },
  banner: {
    borderBottomWidth: StyleSheet.hairlineWidth
  },
  bannerRow: {
    minHeight: 32,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16
  },
  bannerLabel: {
    flex: 1
  },
  bannerSwitch: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingLeft: 8
  },
  sheetOverlay: {
    flex: 1,
    justifyContent: 'flex-end'
  },
  sheetDismissArea: {
    flex: 1
  },
  sheet: {
    maxHeight: '80%',
    paddingTop: 8
  },
  dragHandle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    marginBottom: 8
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 4,
    gap: 12
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center'
  },
  sheetBody: {
    flexGrow: 0
  },
  sheetBodyContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 10
  },
  sheetSectionLabel: {
    marginTop: 10,
    marginBottom: 2
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 64
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center'
  },
  optionText: {
    flex: 1,
    gap: 2
  },
  optionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  }
});
