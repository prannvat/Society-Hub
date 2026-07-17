import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AnnouncementCard } from '@/components/AnnouncementCard';
import { BadgeChip } from '@/components/BadgeChip';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { FilterChips } from '@/components/FilterChips';
import { InputField } from '@/components/InputField';
import { PrimaryButton } from '@/components/PrimaryButton';
import { SearchBar } from '@/components/SearchBar';
import { TopNavBar } from '@/components/TopNavBar';
import { useToast } from '@/components/Toast';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalAppState } from '@/hooks/useLocalAppState';
import { RootStackParamList } from '@/navigation/types';
import { AnnouncementCategory } from '@/types';
import { ScreenLayout } from './ScreenLayout';

export const AnnouncementsFeedScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const theme = useAppTheme();
  const toast = useToast();
  const { announcements: localAnnouncements, addAnnouncement, isAdminMode } = useLocalAppState();
  const [activeCategory, setActiveCategory] = React.useState('All');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const [isComposerOpen, setIsComposerOpen] = React.useState(false);
  const [draftTitle, setDraftTitle] = React.useState('');
  const [draftPreview, setDraftPreview] = React.useState('');
  const [draftCategory, setDraftCategory] = React.useState<AnnouncementCategory>('General');
  const [isPublishing, setIsPublishing] = React.useState(false);

  const pinned = localAnnouncements.find((entry) => entry.pinned);

  const filtered = localAnnouncements.filter((entry) => {
    if (entry.pinned) {
      return false;
    }

    if (activeCategory === 'All') {
      return (
        entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.preview.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return (
      entry.category === activeCategory &&
      (entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.preview.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  const publishAnnouncement = async () => {
    if (!draftTitle.trim() || !draftPreview.trim()) {
      return;
    }

    setIsPublishing(true);
    try {
      await addAnnouncement({
        title: draftTitle.trim(),
        preview: draftPreview.trim(),
        category: draftCategory
      });
      setDraftTitle('');
      setDraftPreview('');
      setDraftCategory('General');
      setIsComposerOpen(false);
      toast.show('Announcement published', 'success');
    } catch {
      toast.show('Unable to publish right now. Please try again.', 'error');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <ScreenLayout>
      <View style={styles.page}>
        <TopNavBar
          gutter={false}
          title="Announcements"
          actionLabel={isSearchOpen ? 'Close' : 'Search'}
          onPressAction={() => {
            setIsSearchOpen((prev) => !prev);
            if (isSearchOpen) {
              setSearchQuery('');
            }
          }}
        />

        {isSearchOpen ? (
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search announcements..."
          />
        ) : null}

        {/* Composer entry — admins share updates from the top of the feed */}
        {isAdminMode && !isComposerOpen ? (
          <Card onPress={() => setIsComposerOpen(true)}>
            <View style={styles.composerEntry}>
              <View style={[styles.composerIcon, { backgroundColor: theme.colors.primarySoft }]}>
                <MaterialIcons name="edit" size={18} color={theme.colors.primary} />
              </View>
              <Text style={[theme.typography.body, { color: theme.colors.textTertiary, flex: 1 }]}>
                Share an update…
              </Text>
            </View>
          </Card>
        ) : null}

        {isAdminMode && isComposerOpen ? (
          <Card>
            <View style={styles.composerForm}>
              <Text style={[theme.typography.h3, { color: theme.colors.textPrimary }]}>New announcement</Text>
              <InputField
                label="Title"
                placeholder="Title"
                value={draftTitle}
                onChangeText={setDraftTitle}
              />
              <InputField
                label="Message"
                placeholder="What is this announcement about?"
                value={draftPreview}
                onChangeText={setDraftPreview}
                multiline
              />
              <View style={styles.categoryRow}>
                {(['General', 'Events', 'Important', 'Committee'] as AnnouncementCategory[]).map((category) => (
                  <Pressable key={category} onPress={() => setDraftCategory(category)} hitSlop={6}>
                    <BadgeChip label={category} variant={draftCategory === category ? 'filled' : 'outlined'} />
                  </Pressable>
                ))}
              </View>
              <View style={styles.composerActions}>
                <PrimaryButton
                  label="Cancel"
                  variant="ghost"
                  size="md"
                  disabled={isPublishing}
                  onPress={() => setIsComposerOpen(false)}
                />
                <View style={styles.composerPublish}>
                  <PrimaryButton
                    label="Publish"
                    size="md"
                    loading={isPublishing}
                    disabled={!draftTitle.trim() || !draftPreview.trim()}
                    onPress={publishAnnouncement}
                  />
                </View>
              </View>
            </View>
          </Card>
        ) : null}

        <FilterChips items={['All', 'General', 'Events', 'Important', 'Committee']} onChange={setActiveCategory} />

        {pinned ? (
          <Card
            style={{ borderColor: theme.colors.primary }}
            onPress={() => navigation.navigate('AnnouncementDetail', { announcementId: pinned.id })}
          >
            <View style={styles.pinnedHeader}>
              <BadgeChip label="Pinned" variant="primary" />
              <MaterialIcons name="push-pin" size={16} color={theme.colors.primary} />
            </View>
            <Text style={[theme.typography.h3, styles.pinnedTitle, { color: theme.colors.textPrimary }]}>
              {pinned.title}
            </Text>
            <Text style={[theme.typography.body, styles.pinnedPreview, { color: theme.colors.textSecondary }]} numberOfLines={3}>
              {pinned.preview}
            </Text>
            <View style={styles.pinnedFooter}>
              <Text style={[theme.typography.caption, { color: theme.colors.textTertiary }]} numberOfLines={1}>
                {pinned.authorName} • {pinned.timestamp}
              </Text>
              <Text style={[theme.typography.captionMedium, { color: theme.colors.primary }]}>Read</Text>
            </View>
          </Card>
        ) : null}

        {filtered.length > 0 ? (
          filtered.slice(0, 6).map((item) => (
            <AnnouncementCard
              key={item.id}
              item={item}
              onPress={(selectedAnnouncement) =>
                navigation.navigate('AnnouncementDetail', { announcementId: selectedAnnouncement.id })
              }
            />
          ))
        ) : (
          <EmptyState
            icon="notifications-none"
            title="No announcements yet"
            subtitle={
              isAdminMode
                ? 'Share your first update so members know what is happening.'
                : 'Check back later for updates from your societies.'
            }
            actionLabel={isAdminMode ? 'Share an update' : undefined}
            onAction={isAdminMode ? () => setIsComposerOpen(true) : undefined}
          />
        )}
      </View>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  page: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 40,
    gap: 16
  },
  composerEntry: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 32
  },
  composerIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center'
  },
  composerForm: {
    gap: 12
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  composerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10
  },
  composerPublish: {
    minWidth: 130
  },
  pinnedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  pinnedTitle: {
    marginTop: 10
  },
  pinnedPreview: {
    marginTop: 4
  },
  pinnedFooter: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12
  }
});
