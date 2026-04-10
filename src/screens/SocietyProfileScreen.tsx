import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp, useRoute } from '@react-navigation/native';
import { Text, View } from 'react-native';
import { BadgeChip } from '@/components/BadgeChip';
import { OutlineButton } from '@/components/OutlineButton';
import { PrimaryButton } from '@/components/PrimaryButton';
import { societies } from '@/data/societies';
import { RootStackParamList } from '@/navigation/types';
import { ScreenLayout } from './ScreenLayout';
import { useAppTheme } from '@/hooks/useAppTheme';

export const SocietyProfileScreen = () => {
  const theme = useAppTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'SocietyProfile'>>();
  const society = societies.find((entry) => entry.id === route.params?.societyId) ?? societies[0];

  return (
    <ScreenLayout>
      <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 60, paddingBottom: 40, gap: 16 }}>
      <View style={{ borderRadius: 14, padding: 16, backgroundColor: society.primaryColor }}>
        <Text style={{ color: '#FFFFFF', fontSize: 22, fontWeight: '800' }}>{society.name}</Text>
        <Text style={{ color: '#FFFFFF', marginTop: 4 }}>{society.university}</Text>
      </View>
      <Text style={{ color: theme.colors.textSecondary }}>
        A student-run community focused on belonging, events, and peer support.
      </Text>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <View style={{ flex: 1 }}>
          <PrimaryButton label="View Events" onPress={() => navigation.navigate('MainTabs', { screen: 'Events' })} />
        </View>
        <View style={{ flex: 1 }}>
          <OutlineButton label="Open Polls" onPress={() => navigation.navigate('MainTabs', { screen: 'Polls' })} />
        </View>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        <BadgeChip label="Events" />
        <BadgeChip label="Announcements" variant="outlined" />
        <BadgeChip label="Member Directory" variant="outlined" />
        <BadgeChip label="Committee Polls" variant="outlined" />
      </View>
      </View>
    </ScreenLayout>
  );
};
