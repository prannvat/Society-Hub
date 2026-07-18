import React, { useMemo, useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp, useRoute } from '@react-navigation/native';
import { ActivityIndicator, Text, View, Pressable, ScrollView, Linking, Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { BadgeChip } from '@/components/BadgeChip';
import { Card } from '@/components/Card';
import { PrimaryButton } from '@/components/PrimaryButton';
import { OutlineButton } from '@/components/OutlineButton';
import { SectionHeader } from '@/components/SectionHeader';
import { useToast } from '@/components/Toast';
import { useLocalAppState } from '@/hooks/useLocalAppState';
import { useUserRoles } from '@/hooks/useUserRoles';
import { RootStackParamList } from '@/navigation/types';
import { ScreenLayout } from './ScreenLayout';
import { useAppTheme } from '@/hooks/useAppTheme';
import { EventCard } from '@/components/EventCard';
import { PerksList } from '@/components/PerksList';
import { EventItem, SocietyPerk } from '@/types';
import { fetchEvents } from '@/services/api/events';
import { fetchSocietyProfile } from '@/services/api/societies';
import { fetchSocietyPerks } from '@/services/api/perks';
import { joinErrorMessage } from '@/services/api/memberships';
import { mapApiEvent } from '@/utils/mapApiEvent';

export const SocietyProfileScreen = () => {
  const theme = useAppTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'SocietyProfile'>>();
  const toast = useToast();
  const { allSocieties, favouritedSocietyIds, toggleFavouriteSociety, mySocietyIds, pendingMembershipSocietyIds, joinSociety, polls } = useLocalAppState();
  const { adminSocieties } = useUserRoles();

  const [localSociety, setLocalSociety] = useState<any>(null);
  const [societyEvents, setSocietyEvents] = useState<EventItem[]>([]);
  const [perks, setPerks] = useState<SocietyPerk[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);

  // Fallback to memory if offline/loading
  const memoizedSociety = allSocieties.find((entry) => entry.id === route.params?.societyId) ?? allSocieties[0];
  const society = localSociety || memoizedSociety;

  const isFavourited = society ? favouritedSocietyIds.includes(society.id) : false;
  const isMember = society ? mySocietyIds.includes(society.id) : false;
  const isPendingMembership = society ? pendingMembershipSocietyIds.includes(society.id) : false;
  const canManage = society ? adminSocieties.some((entry) => entry.societyId === society.id) : false;

  const handleJoin = async () => {
    if (!society || isJoining) {
      return;
    }
    setIsJoining(true);
    try {
      const result = await joinSociety(society.id);
      if (result === 'PENDING') {
        toast.show(`Request sent — ${society.name} requires approval`, 'info');
      } else {
        toast.show(`Welcome to ${society.name}!`, 'success');
      }
    } catch (error) {
      toast.show(joinErrorMessage(error), 'error');
    } finally {
      setIsJoining(false);
    }
  };

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        setIsLoading(true);
        const [prof, evts, societyPerks] = await Promise.all([
          fetchSocietyProfile(route.params!.societyId!).catch(() => null),
          fetchEvents(route.params!.societyId!).catch(() => []),
          // Rewards layer — degrade to no perks section if the endpoint isn't up yet.
          fetchSocietyPerks(route.params!.societyId!).catch(() => [] as SocietyPerk[])
        ]);
        if (prof) setLocalSociety(prof);
        if (evts) setSocietyEvents(evts.map(mapApiEvent));
        setPerks(societyPerks);
      } catch (err) {
        console.error('Failed to load detail profile', err);
      } finally {
        setIsLoading(false);
      }
    };
    if (route.params?.societyId) {
      loadProfileData();
    }
  }, [route.params?.societyId]);

  const now = new Date();
  const { upcomingEvents, pastEvents } = useMemo(() => {
    return societyEvents.reduce((acc, ev) => {
      const eventDate = ev.startAtIso ? new Date(ev.startAtIso) : new Date(ev.date + ' ' + ev.time);
      if (eventDate >= now) acc.upcomingEvents.push(ev);
      else acc.pastEvents.push(ev);
      return acc;
    }, { upcomingEvents: [] as EventItem[], pastEvents: [] as EventItem[] });
  }, [societyEvents]);

  if (!society) {
    return (
      <ScreenLayout>
        <View style={styles.notFoundWrap}>
          {isLoading ? (
            <ActivityIndicator color={theme.colors.primary} />
          ) : (
            <>
              <Text style={[theme.typography.h3, { color: theme.colors.textPrimary }]}>Society not found</Text>
              <OutlineButton label="Back" onPress={() => navigation.goBack()} />
            </>
          )}
        </View>
      </ScreenLayout>
    );
  }

  const brandPrimary = society.primaryColor || theme.colors.primary;
  const brandSecondary = society.secondaryColor || brandPrimary;
  const societyPolls = polls.filter((poll) => poll.societyId === society.id);

  const handleOpenLink = async (url?: string | null) => {
    if (url && (await Linking.canOpenURL(url))) {
      Linking.openURL(url);
    }
  };

  const overlayButtonStyle = ({ pressed }: { pressed: boolean }) => [
    styles.overlayButton,
    theme.elevation.e1,
    {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
      opacity: pressed ? 0.7 : 1
    }
  ];

  return (
    <ScreenLayout scroll={false}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Branded gradient band */}
        <View>
          <LinearGradient
            colors={[brandPrimary, brandSecondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientBand}
          />
          <View style={styles.bandActions}>
            <Pressable onPress={() => navigation.goBack()} hitSlop={6} style={overlayButtonStyle}>
              <MaterialIcons name="arrow-back" size={22} color={theme.colors.textPrimary} />
            </Pressable>
            <Pressable onPress={() => toggleFavouriteSociety(society.id)} hitSlop={6} style={overlayButtonStyle}>
              <MaterialIcons
                name={isFavourited ? 'favorite' : 'favorite-border'}
                size={22}
                color={isFavourited ? theme.colors.danger : theme.colors.textPrimary}
              />
            </Pressable>
          </View>

          {/* Overlapping logo */}
          <View style={styles.identityWrap}>
            <View style={[styles.logoRing, { backgroundColor: theme.colors.background }]}>
              {society.logoUrl ? (
                <Image
                  source={{ uri: society.logoUrl }}
                  style={[styles.logo, { backgroundColor: theme.colors.surfaceSunken }]}
                />
              ) : (
                <View style={[styles.logo, { backgroundColor: `${brandPrimary}22`, alignItems: 'center', justifyContent: 'center' }]}>
                  <Text style={[theme.typography.h3, { color: brandPrimary }]} numberOfLines={1}>
                    {society.shortName}
                  </Text>
                </View>
              )}
            </View>
            <Text style={[theme.typography.h1, { color: theme.colors.textPrimary, marginTop: 10 }]} numberOfLines={2}>
              {society.name}
            </Text>
            {society.university ? (
              <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginTop: 2 }]} numberOfLines={1}>
                {society.university}
              </Text>
            ) : null}
          </View>
        </View>

        <View style={styles.body}>
          {/* Stat row */}
          <Card padding={14}>
            <View style={styles.statRow}>
              <View style={styles.statCell}>
                <Text style={[theme.typography.h2, { color: theme.colors.textPrimary }]}>
                  {society._count?.memberships ?? '—'}
                </Text>
                <Text style={[theme.typography.micro, { color: theme.colors.textTertiary }]}>Members</Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: theme.colors.border }]} />
              <View style={styles.statCell}>
                <Text style={[theme.typography.h2, { color: theme.colors.textPrimary }]}>{societyEvents.length}</Text>
                <Text style={[theme.typography.micro, { color: theme.colors.textTertiary }]}>Events</Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: theme.colors.border }]} />
              <View style={styles.statCell}>
                <Text style={[theme.typography.h2, { color: theme.colors.textPrimary }]}>{societyPolls.length}</Text>
                <Text style={[theme.typography.micro, { color: theme.colors.textTertiary }]}>Polls</Text>
              </View>
            </View>
          </Card>

          {/* Membership action */}
          {isPendingMembership ? (
            <View style={styles.membershipRow}>
              <BadgeChip label="Membership pending approval" variant="warning" />
            </View>
          ) : isMember ? (
            <View style={styles.membershipRow}>
              <BadgeChip label="You're a member" variant="success" />
            </View>
          ) : (
            <PrimaryButton
              label="Join Society"
              icon="person-add"
              loading={isJoining}
              onPress={handleJoin}
            />
          )}

          {/* Committee-only management seam — additive, only for admins of this society. */}
          {canManage ? (
            <PrimaryButton
              label="Manage society"
              variant="secondary"
              icon="tune"
              onPress={() => navigation.navigate('SocietyManage', { societyId: society.id })}
            />
          ) : null}

          <View style={styles.actionRow}>
            <View style={{ flex: 1 }}>
              <PrimaryButton
                label="All Events"
                variant="secondary"
                size="md"
                icon="event"
                onPress={() => navigation.navigate('MainTabs', { screen: 'Events' })}
              />
            </View>
            <View style={{ flex: 1 }}>
              <PrimaryButton
                label="Open Polls"
                variant="secondary"
                size="md"
                icon="poll"
                onPress={() => navigation.navigate('SocietyPolls', undefined)}
              />
            </View>
          </View>

          {/* Policy chips */}
          <View style={styles.chipRow}>
            {society.affiliatedUniversities && society.affiliatedUniversities.length > 1 && (
              <BadgeChip label="Joint Society" variant="primary" />
            )}
            {society.joinPolicy === 'VERIFIED_STUDENTS_ONLY' && (
              <BadgeChip label="Verified Students Only" variant="warning" />
            )}
            {society.joinPolicy === 'OPEN' && (
              <BadgeChip label="Open to All" variant="success" />
            )}
            {society.joinPolicy === 'APPROVAL_REQUIRED' && (
              <BadgeChip label="Approval Required" variant="warning" />
            )}
          </View>

          {/* About */}
          <View style={styles.section}>
            <SectionHeader title="About" />
            <Text style={[theme.typography.body, { color: theme.colors.textSecondary }]}>
              {society.description || 'A student-run community focused on belonging, events, and peer support.'}
            </Text>
          </View>

          {/* Links */}
          {(society.instagramLink || society.whatsappLink) ? (
            <View style={styles.section}>
              <SectionHeader title="Links" />
              <View style={styles.linkRow}>
                {society.instagramLink ? (
                  <Pressable
                    onPress={() => handleOpenLink(society.instagramLink)}
                    style={({ pressed }) => [
                      styles.linkChip,
                      {
                        borderRadius: theme.radius.pill,
                        backgroundColor: theme.colors.surfaceSunken,
                        opacity: pressed ? 0.7 : 1
                      }
                    ]}
                  >
                    <FontAwesome name="instagram" size={18} color={theme.colors.textPrimary} />
                    <Text style={[theme.typography.captionMedium, { color: theme.colors.textPrimary }]}>Instagram</Text>
                  </Pressable>
                ) : null}
                {society.whatsappLink ? (
                  <Pressable
                    onPress={() => handleOpenLink(society.whatsappLink)}
                    style={({ pressed }) => [
                      styles.linkChip,
                      {
                        borderRadius: theme.radius.pill,
                        backgroundColor: theme.colors.surfaceSunken,
                        opacity: pressed ? 0.7 : 1
                      }
                    ]}
                  >
                    <FontAwesome name="whatsapp" size={18} color={theme.colors.textPrimary} />
                    <Text style={[theme.typography.captionMedium, { color: theme.colors.textPrimary }]}>WhatsApp</Text>
                  </Pressable>
                ) : null}
              </View>
            </View>
          ) : null}

          {/* Member perks — rewards incentive. Hidden entirely when there are none. */}
          {perks.length > 0 ? (
            <View style={styles.section}>
              <SectionHeader title="Member perks" />
              <PerksList perks={perks} isMember={isMember} />
            </View>
          ) : null}

          {/* Upcoming events */}
          {upcomingEvents.length > 0 && (
            <View style={styles.section}>
              <SectionHeader title="Upcoming Events" />
              <View style={{ gap: theme.spacing.lg }}>
                {upcomingEvents.map(event => (
                  <EventCard key={event.id} event={event} onPressRSVP={() => navigation.navigate('EventDetail', { eventId: event.id })} />
                ))}
              </View>
            </View>
          )}

          {/* Past events */}
          {pastEvents.length > 0 && (
            <View style={styles.section}>
              <SectionHeader title="Past Events" />
              <Card padding={0}>
                {pastEvents.map((event, index) => (
                  <View key={event.id}>
                    {index > 0 ? <View style={[styles.rowDivider, { backgroundColor: theme.colors.border }]} /> : null}
                    <View style={styles.pastEventRow}>
                      <MaterialIcons name="history" size={18} color={theme.colors.textTertiary} />
                      <View style={{ flex: 1, gap: 2 }}>
                        <Text style={[theme.typography.bodyMedium, { color: theme.colors.textSecondary }]} numberOfLines={1}>
                          {event.title}
                        </Text>
                        <Text style={[theme.typography.caption, { color: theme.colors.textTertiary }]}>{event.date}</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </Card>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  notFoundWrap: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 40,
    gap: 16
  },
  scrollContent: {
    paddingBottom: 100
  },
  gradientBand: {
    height: 132,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24
  },
  bandActions: {
    position: 'absolute',
    top: 12,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  overlayButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  identityWrap: {
    paddingHorizontal: 20,
    marginTop: -36
  },
  logoRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center'
  },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 36,
    overflow: 'hidden'
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 18
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  statCell: {
    flex: 1,
    alignItems: 'center',
    gap: 2
  },
  statDivider: {
    width: StyleSheet.hairlineWidth,
    alignSelf: 'stretch'
  },
  membershipRow: {
    alignItems: 'center'
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  section: {
    gap: 10
  },
  linkRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10
  },
  linkChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 44,
    paddingHorizontal: 16
  },
  rowDivider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 46
  },
  pastEventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 56
  }
});
