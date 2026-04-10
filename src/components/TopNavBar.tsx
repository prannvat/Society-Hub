import React from 'react';
import { Pressable, StyleSheet, Text, View, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalAppState } from '@/hooks/useLocalAppState';

type TopNavBarProps = {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onPressAction?: () => void;
  onBack?: () => void;
};

export const TopNavBar = ({ title, subtitle, actionLabel, onPressAction, onBack }: TopNavBarProps) => {
  const theme = useAppTheme();
  const { isAdminMode } = useLocalAppState();

  return (
    <View style={[styles.row, { borderBottomColor: theme.colors.border }]}> 
      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: 12 }}>
        {onBack && (
          <Pressable onPress={onBack} style={{ marginRight: 12 }}>
            <MaterialIcons name="arrow-back-ios" size={24} color={theme.colors.textPrimary} />
          </Pressable>
        )}
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={[styles.title, { color: theme.colors.textPrimary, flexShrink: 1 }]} numberOfLines={1}>{title}</Text>
            {isAdminMode && (
              <View style={{ backgroundColor: theme.colors.primary, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                <Text style={{ color: theme.colors.background, fontSize: 10, fontWeight: '800', textTransform: 'uppercase' }}>Admin</Text>
              </View>
            )}
          </View>
          {subtitle ? <Text style={{ color: theme.colors.textSecondary, marginTop: 2 }}>{subtitle}</Text> : null}
        </View>
      </View>
      {actionLabel ? (
        <Pressable
          onPress={onPressAction}
          android_ripple={{ color: 'rgba(0,0,0,0.08)', borderless: false }}
          style={({ pressed }) => [
            styles.actionPill,
            {
              borderColor: theme.colors.border,
              backgroundColor: theme.colors.surface,
              opacity: pressed && Platform.OS === 'ios' ? 0.85 : 1
            }
          ]}
        > 
          <Text style={{ color: theme.colors.primary, fontWeight: '700', fontSize: 13 }} numberOfLines={1}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingTop: 4,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth
  },
  title: {
    fontSize: 22,
    fontWeight: '800'
  },
  actionPill: {
    maxWidth: '45%',
    minHeight: 40,
    borderWidth: 1,
    borderRadius: 100,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center'
  }
});
