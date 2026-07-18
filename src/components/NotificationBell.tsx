import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import { NotificationBadge } from '@/components/NotificationBadge';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useNotifications } from '@/hooks/useNotifications';
import { RootStackParamList } from '@/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

type NotificationBellProps = {
  /** Icon tint. Defaults to the primary text colour. */
  color?: string;
  size?: number;
};

/** Header bell that opens the inbox and overlays the live unread badge. */
export const NotificationBell = ({ color, size = 24 }: NotificationBellProps) => {
  const theme = useAppTheme();
  const navigation = useNavigation<Nav>();
  const { unreadCount } = useNotifications();

  return (
    <Pressable
      onPress={() => navigation.navigate('Notifications')}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={
        unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'
      }
      style={({ pressed }) => [styles.button, { opacity: pressed ? 0.5 : 1 }]}
    >
      <MaterialIcons name="notifications-none" size={size} color={color ?? theme.colors.textPrimary} />
      {unreadCount > 0 ? (
        <View style={styles.badge}>
          <NotificationBadge count={unreadCount} />
        </View>
      ) : null}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
  },
});
