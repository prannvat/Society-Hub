import React from 'react';
import { Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FilterChips } from '@/components/FilterChips';
import { Card } from '@/components/Card';
import { ListItem } from '@/components/ListItem';
import { MemberCard } from '@/components/MemberCard';
import { SearchBar } from '@/components/SearchBar';
import { TopNavBar } from '@/components/TopNavBar';
import { useLocalAppState } from '@/hooks/useLocalAppState';
import { RootStackParamList } from '@/navigation/types';
import { ScreenLayout } from './ScreenLayout';
import { useAppTheme } from '@/hooks/useAppTheme';

export const MembersDirectoryScreen = () => {
  const theme = useAppTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { activeSocietyMembers, activeSocietyRole } = useLocalAppState();
  const [query, setQuery] = React.useState('');
  const [activeFilter, setActiveFilter] = React.useState('All');
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');

  const filteredMembers = activeSocietyMembers
    .filter((member) => member.name.toLowerCase().includes(query.toLowerCase()))
    .filter((member) => {
      if (activeFilter === 'All') {
        return true;
      }

      if (activeFilter === 'Committee') {
        return member.role !== 'Member';
      }

      if (activeFilter === 'New Members') {
        return member.year.includes('1st');
      }

      if (activeFilter === 'My Year') {
        return member.year.includes('2nd');
      }

      return true;
    });

  return (
    <ScreenLayout>
      <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 96, gap: 16 }}>
      <TopNavBar
        title="Members"
        actionLabel={viewMode === 'grid' ? 'List View' : 'Grid View'}
        onPressAction={() => setViewMode((prev) => (prev === 'grid' ? 'list' : 'grid'))}
      />
      <Card>
        <View style={{ gap: 6 }}>
          <Text style={{ color: theme.colors.textPrimary, fontSize: 16, fontWeight: '800' }}>Access and people</Text>
          <Text style={{ color: theme.colors.textSecondary, lineHeight: 20 }}>
            Current access: {activeSocietyRole}. Presidents can change member roles from each profile.
          </Text>
        </View>
      </Card>
      <SearchBar value={query} onChangeText={setQuery} placeholder="Search members..." />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={{ color: theme.colors.textSecondary }}>{filteredMembers.length} members found</Text>
        <Text style={{ color: theme.colors.primary, fontWeight: '700' }} onPress={() => setQuery('')}>Clear</Text>
      </View>
      <FilterChips items={['All', 'Committee', 'New Members', 'My Year']} onChange={setActiveFilter} />
      {filteredMembers.length === 0 ? (
        <Card>
          <View style={{ alignItems: 'center', gap: 8, paddingVertical: 12 }}>
            <Text style={{ color: theme.colors.textPrimary, fontSize: 16, fontWeight: '700' }}>No members match this filter</Text>
            <Text style={{ color: theme.colors.textSecondary, textAlign: 'center' }}>
              Try a different filter or clear your search to see everyone in this society.
            </Text>
          </View>
        </Card>
      ) : viewMode === 'grid' ? (
        <View style={{ gap: 12 }}>
          {filteredMembers.slice(0, 12).map((member) => (
            <MemberCard
              key={member.id}
              member={member}
              onPressProfile={(selectedMember) => navigation.navigate('MemberProfile', { memberId: selectedMember.id })}
            />
          ))}
        </View>
      ) : (
        <View style={{ borderWidth: 1, borderColor: theme.colors.border, borderRadius: 12, overflow: 'hidden' }}>
          {filteredMembers.map((member) => (
            <ListItem
              key={member.id}
              label={member.name}
              right={<Text style={{ color: theme.colors.textSecondary }}>{member.role}</Text>}
              onPress={() => navigation.navigate('MemberProfile', { memberId: member.id })}
            />
          ))}
        </View>
      )}
      </View>
    </ScreenLayout>
  );
};
