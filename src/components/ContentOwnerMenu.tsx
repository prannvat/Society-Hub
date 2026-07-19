import React from 'react';
import { Alert, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/useAppTheme';
import { haptics } from '@/utils/haptics';

type ContentOwnerMenuProps = {
  /** What the user is acting on, e.g. "post" — used in the copy. */
  noun: string;
  onEdit?: () => void;
  onDelete: () => void;
  /** Hidden entirely when the viewer can't manage this content. */
  visible: boolean;
};

/**
 * The "⋯" affordance on content a committee member can manage. Uses a native
 * action sheet rather than a custom popover so it feels right on both platforms
 * and inherits the OS's destructive-action styling.
 *
 * Deleting always requires a second confirmation — it cascades to likes,
 * comments, RSVPs or votes and cannot be undone.
 */
export const ContentOwnerMenu = ({ noun, onEdit, onDelete, visible }: ContentOwnerMenuProps) => {
  const theme = useAppTheme();

  if (!visible) {
    return null;
  }

  const confirmDelete = () => {
    Alert.alert(
      `Delete this ${noun}?`,
      'This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: onDelete },
      ],
    );
  };

  const openMenu = () => {
    haptics.tap();
    const options = [
      ...(onEdit ? [{ text: 'Edit', onPress: onEdit }] : []),
      { text: 'Delete', style: 'destructive' as const, onPress: confirmDelete },
      { text: 'Cancel', style: 'cancel' as const },
    ];
    Alert.alert(`Manage ${noun}`, undefined, options);
  };

  return (
    <Pressable
      onPress={openMenu}
      hitSlop={10}
      accessibilityRole="button"
      accessibilityLabel={`Manage this ${noun}`}
      style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1, paddingHorizontal: 4 })}
    >
      <MaterialIcons name="more-horiz" size={22} color={theme.colors.textSecondary} />
    </Pressable>
  );
};
