import React from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AnnouncementCard } from '@/components/AnnouncementCard';
import { BadgeChip } from '@/components/BadgeChip';
import { FilterChips } from '@/components/FilterChips';
import { OutlineButton } from '@/components/OutlineButton';
import { PrimaryButton } from '@/components/PrimaryButton';
import { SearchBar } from '@/components/SearchBar';
import { TopNavBar } from '@/components/TopNavBar';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalAppState } from '@/hooks/useLocalAppState';
import { RootStackParamList } from '@/navigation/types';
import { AnnouncementCategory } from '@/types';
import { ScreenLayout } from './ScreenLayout';

export const AnnouncementsFeedScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const theme = useAppTheme();
  const { announcements: localAnnouncements, addAnnouncement, isAdminMode } = useLocalAppState();
  const [activeCategory, setActiveCategory] = React.useState('All');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const [isComposerOpen, setIsComposerOpen] = React.useState(false);
  const [draftTitle, setDraftTitle] = React.useState('');
  const [draftPreview, setDraftPreview] = React.useState('');
  const [draftCategory, setDraftCategory] = React.useState<AnnouncementCategory>('General');

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

  const publishAnnouncement = () => {
    if (!draftTitle.trim() || !draftPreview.trim()) {
      return;
    }

    addAnnouncement({
      title: draftTitle.trim(),
      preview: draftPreview.trim(),
      category: draftCategory
    });
    setDraftTitle('');
    setDraftPreview('');
    setDraftCategory('General');
    setIsComposerOpen(false);
  };

  return (
    <ScreenLayout>
      <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 40, gap: 16 }}>
      <TopNavBar
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

      <FilterChips items={['All', 'General', 'Events', 'Important', 'Committee']} onChange={setActiveCategory} />

      {isComposerOpen ? (
        <View style={{ borderWidth: 1, borderColor: theme.colors.border, borderRadius: 16, padding: 14, gap: 10, backgroundColor: theme.colors.surface }}>
          <Text style={{ color: theme.colors.textPrimary, fontWeight: '700', fontSize: 16 }}>New Announcement</Text>
          <TextInput
            value={draftTitle}
            onChangeText={setDraftTitle}
            placeholder="Title"
            placeholderTextColor={theme.colors.textSecondary}
            style={{ borderWidth: 1, borderColor: theme.colors.border, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, color: theme.colors.textPrimary }}
          />
          <TextInput
            value={draftPreview}
            onChangeText={setDraftPreview}
            placeholder="What is this announcement about?"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            placeholderTextColor={theme.colors.textSecondary}
            style={{ borderWidth: 1, borderColor: theme.colors.border, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, color: theme.colors.textPrimary, minHeight: 90 }}
          />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {(['General', 'Events', 'Important', 'Committee'] as AnnouncementCategory[]).map((category) => (
              <Pressable key={category} onPress={() => setDraftCategory(category)}>
                <BadgeChip label={category} variant={draftCategory === category ? 'filled' : 'outlined'} />
              </Pressable>
            ))}
          </View>
          <View style={{ gap: 8 }}>
            <PrimaryButton label="Publish" onPress={publishAnnouncement} />
            <OutlineButton label="Cancel" onPress={() => setIsComposerOpen(false)} />
          </View>
        </View>
      ) : null}

      {pinned ? (
        <View style={{ borderWidth: 1, borderColor: theme.colors.border, borderRadius: 12, padding: 14, backgroundColor: theme.colors.surface }}>
          <BadgeChip label="Pinned" />
          <Text style={{ color: theme.colors.textPrimary, fontWeight: '800', fontSize: 18, marginTop: 10 }}>{pinned.title}</Text>
          <Text style={{ color: theme.colors.textSecondary, marginTop: 6 }}>{pinned.preview}</Text>
          <View style={{ marginTop: 10, flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>{pinned.authorName} • {pinned.timestamp}</Text>
            <Text style={{ color: theme.colors.primary, fontWeight: '700' }} onPress={() => navigation.navigate('AnnouncementDetail', { announcementId: pinned.id })}>Read</Text>
          </View>
        </View>
      ) : null}

      {filtered.length > 0 ? (
        filtered.slice(0, 6).map((item) => (
          <AnnouncementCard key={item.id} item={item} onPress={(selectedAnnouncement) => navigation.navigate('AnnouncementDetail', { announcementId: selectedAnnouncement.id })} />
        ))
      ) : (
        <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 60 }}>
          <Ionicons name="notifications-off-outline" size={48} color={theme.colors.border} />
          <Text style={{ color: theme.colors.textPrimary, fontSize: 16, fontWeight: '600', marginTop: 16 }}>
            No announcements yet
          </Text>
          <Text style={{ color: theme.colors.textSecondary, fontSize: 14, marginTop: 8, textAlign: 'center' }}>
            Check back later for updates from your societies
          </Text>
        </View>
      )}

      {isAdminMode && (
        <OutlineButton label={isComposerOpen ? 'Close Composer' : '+ New Announcement'} onPress={() => setIsComposerOpen((prev) => !prev)} />
      )}
      </View>
    </ScreenLayout>
  );
};
