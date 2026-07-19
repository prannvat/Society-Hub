import React, { useMemo, useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp, useRoute } from '@react-navigation/native';
import { Text, View, Pressable, ScrollView, Linking, Image, StyleSheet } from 'react-native';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { BadgeChip } from '@/components/BadgeChip';
import { PrimaryButton } from '@/components/PrimaryButton';
import { OutlineButton } from '@/components/OutlineButton';
import { Skeleton } from '@/components/Skeleton';
import { ProfileStatsRow } from '@/components/ProfileStatsRow';
import { SectionHeader } from '@/components/SectionHeader';
import { useToast } from '@/components/Toast';
import { useLocalAppState } from '@/hooks/useLocalAppState';
import { useUserRoles } from '@/hooks/useUserRoles';
import { RootStackParamList } from '@/navigation/types';
import { ScreenLayout } from './ScreenLayout';
import { useAppTheme } from '@/hooks/useAppTheme';
import { haptics } from '@/utils/haptics';
import { EventCard } from '@/components/EventCard';
import { PerksList } from '@/components/PerksList';
import { EventItem, SocietyPerk } from '@/types';
import { fetchEvents } from '@/services/api/events';
import { MemberAvatarStack } from '@/components/MemberAvatarStack';
import { fetchSocietyMembers, fetchSocietyProfile } from '@/services/api/societies';
import { PublicSocietyMember } from '@/services/api/types';
import { fetchSocietyPerks } from '@/services/api/perks';
import { joinErrorMessage } from '@/services/api/memberships';
import { mapApiEvent } from '@/utils/mapApiEvent';

export const SocietyProfileScreen = () => {
  const theme = useAppTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'SocietyProfile'>>();
  const toast = useToast();
  const { allSocieties, favouritedSocietyIds, toggleFavouriteSociety, mySocietyIds, pendingMembershipSocietyIds, joinSociety, polls } = useLocalAppState();
  const { adminSocieties, switchToSociety } = useUserRoles();

  const [localSociety, setLocalSociety] = useState<any>(null);
  const [societyEvents, setSocietyEvents] = useState<EventItem[]>([]);
  const [perks, setPerks] = useState<SocietyPerk[]>([]);
  // Social proof for the avatar stack — degrades to nothing if the call fails.
  const [memberPreview, setMemberPreview] = useState<PublicSocietyMember[]>([]);
  const [memberTotal, setMemberTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);

  // Fall back to the in-memory copy while the fetch is in flight, but never to
  // an arbitrary society — a wrong id must resolve to the not-found state.
  const memoizedSociety = allSocieties.find((entry) => entry.id === route.params?.societyId);
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
        haptics.warning();
        toast.show(`Request sent — ${society.name} requires approval`, 'info');
      } else {
        haptics.success();
        toast.show(`Welcome to ${society.name}!`, 'success');
        // Reflect the new membership in the social-proof stack straight away.
        const refreshed = await fetchSocietyMembers(society.id, 1, 5).catch(() => null);
        if (refreshed) {
          setMemberPreview(refreshed.items);
          setMemberTotal(refreshed.total);
        }
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
        const [prof, evts, societyPerks, memberPage] = await Promise.all([
          fetchSocietyProfile(route.params!.societyId!).catch(() => null),
          fetchEvents(route.params!.societyId!).catch(() => []),
          // Rewards layer — degrade to no perks section if the endpoint isn't up yet.
          fetchSocietyPerks(route.params!.societyId!).catch(() => [] as SocietyPerk[]),
          fetchSocietyMembers(route.params!.societyId!, 1, 5).catch(() => null)
        ]);
        if (prof) setLocalSociety(prof);
        if (evts) setSocietyEvents(evts.map(mapApiEvent));
        setPerks(societyPerks);
        setMemberPreview(memberPage?.items ?? []);
        setMemberTotal(memberPage?.total ?? 0);
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
        {isLoading ? (
          // Skeleton that mirrors the hero → logo → stats → text layout, so the
          // marquee screen fades in gracefully instead of popping a spinner.
          <View>
            <Skeleton width="100%" height={132} radius={0} />
            <View style={styles.skeletonBody}>
              <Skeleton width={80} height={80} circle />
              <Skeleton width="55%" height={22} />
              <Skeleton width="35%" height={14} />
              <Skeleton width="100%" height={44} />
              <Skeleton width="100%" height={64} />
            </View>
          </View>
        ) : (
          <View style={styles.notFoundWrap}>
            <Text style={[theme.typography.h3, { color: theme.colors.textPrimary }]}>Society not found</Text>
            <OutlineButton label="Back" onPress={() => navigation.goBack()} />
          </View>
        )}
      </ScreenLayout>
    );
  }

  const societyPolls = polls.filter((poll) => poll.societyId === society.id);
  // The live member list is authoritative; the cached profile count is the fallback.
  const memberCount = memberTotal > 0 ? memberTotal : society._count?.memberships ?? null;

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
        {/* Neutral hero band — a soft grey surface, no brand gradient. */}
        <View>
          <View style={[styles.gradientBand, { backgroundColor: theme.colors.surfaceSunken }]} />
          <View style={styles.bandActions}>
            <Pressable onPress={() => navigation.goBack()} hitSlop={6} style={overlayButtonStyle}>
              <MaterialIcons name="arrow-back" size={22} color={theme.colors.textPrimary} />
            </Pressable>
            <Pressable onPress={() => { haptics.tap(); toggleFavouriteSociety(society.id); }} hitSlop={6} style={overlayButtonStyle}>
              <MaterialIcons
                name={isFavourited ? 'favorite' : 'favorite-border'}
                size={22}
                color={isFavourited ? theme.colors.danger : theme.colors.textPrimary}
              />
            </Pressable>
          </View>

          {/* Overlapping logo + IG stats row */}
          <View style={styles.identityWrap}>
            <View style={styles.identityRow}>
              <View style={[styles.logoRing, { backgroundColor: theme.colors.background }]}>
                {society.logoUrl ? (
                  <Image
                    source={{ uri: society.logoUrl }}
                    style={[styles.logo, { backgroundColor: theme.colors.surfaceSunken }]}
                  />
                ) : (
                  <View style={[styles.logo, { backgroundColor: theme.colors.surfaceSunken, alignItems: 'center', justifyContent: 'center' }]}>
                    <Text style={[theme.typography.h3, { color: theme.colors.textSecondary }]} numberOfLines={1}>
                      {society.shortName}
                    </Text>
                  </View>
                )}
              </View>
              <View style={styles.identityStats}>
                <ProfileStatsRow
                  stats={[
                    {
                      label: 'Members',
                      value: memberCount ?? '—',
                      onPress: () => navigation.navigate('SocietyMembers', { societyId: society.id })
                    },
                    { label: 'Events', value: societyEvents.length },
                    { label: 'Polls', value: societyPolls.length }
                  ]}
                />
              </View>
            </View>

            <Text style={[theme.typography.h2, { color: theme.colors.textPrimary, marginTop: 12 }]} numberOfLines={2}>
              {society.name}
            </Text>
            <Text style={[theme.typography.caption, { color: theme.colors.textTertiary, marginTop: 2 }]} numberOfLines={1}>
              @{society.shortName}
              {society.university ? ` • ${society.university}` : ''}
            </Text>
            {society.description ? (
              <Text style={[theme.typography.body, { color: theme.colors.textPrimary, marginTop: 8 }]}>
                {society.description}
              </Text>
            ) : null}
          </View>
        </View>

        <View style={styles.body}>
          {/* Social proof — the people already in, tapping through to the full list. */}
          <MemberAvatarStack
            members={memberPreview}
            total={memberCount ?? memberPreview.length}
            onPress={() => navigation.navigate('SocietyMembers', { societyId: society.id })}
          />

          {/* Membership action — the primary thing to do on this screen. */}
          {isPendingMembership ? (
            <View style={styles.membershipRow}>
              <BadgeChip label="Membership pending approval" variant="warning" />
            </View>
          ) : isMember ? (
            <View style={styles.membershipRow}>
              <BadgeChip label="You're a member" variant="success" />
            </View>
          ) : (
            <View style={styles.joinBlock}>
              <PrimaryButton
                label={`Join ${society.shortName}`}
                icon="person-add"
                loading={isJoining}
                onPress={handleJoin}
              />
              {society.joinPolicy === 'APPROVAL_REQUIRED' ? (
                <Text style={[theme.typography.caption, styles.joinHint, { color: theme.colors.textTertiary }]}>
                  The committee reviews requests before you become a member.
                </Text>
              ) : null}
            </View>
          )}

          {/* A plain member's route into helping run the society. Previously the
              only entry points lived inside committee-only screens, so the very
              people this flow exists for could never reach it. */}
          {isMember && !canManage ? (
            <PrimaryButton
              label="Request a committee role"
              variant="secondary"
              icon="trending-up"
              onPress={() =>
                navigation.navigate('CommitteeRequest', {
                  societyId: society.id,
                  currentRole: 'Member',
                })
              }
            />
          ) : null}

          {/* Committee affordance — act AS the society (IG account takeover) */}
          {canManage ? (
            <PrimaryButton
              label="Switch to this account"
              variant="secondary"
              icon="swap-horiz"
              onPress={() => switchToSociety(society.id)}
            />
          ) : null}

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

          {/* Highlights — IG-style content grid of the society's past events */}
          {pastEvents.length > 0 && (
            <View style={styles.section}>
              <SectionHeader title="Highlights" />
              <View style={styles.grid}>
                {pastEvents.slice(0, 9).map((event) => (
                  <Pressable
                    key={event.id}
                    onPress={() => navigation.navigate('EventDetail', { eventId: event.id })}
                    style={({ pressed }) => [
                      styles.tile,
                      { borderRadius: theme.radius.sm, opacity: pressed ? 0.85 : 1 }
                    ]}
                  >
                    <View style={[styles.tileFill, { backgroundColor: theme.colors.surfaceSunken }]}>
                      <Text
                        style={[theme.typography.captionMedium, styles.tileText, { color: theme.colors.textPrimary }]}
                        numberOfLines={4}
                      >
                        {event.title}
                      </Text>
                      <Text
                        style={[theme.typography.micro, styles.tileDate, { color: theme.colors.textTertiary }]}
                        numberOfLines={1}
                      >
                        {event.date}
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  skeletonBody: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 14
  },
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
  identityRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 16
  },
  identityStats: {
    flex: 1,
    paddingBottom: 4
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
  membershipRow: {
    alignItems: 'center'
  },
  joinBlock: {
    gap: 8
  },
  joinHint: {
    textAlign: 'center'
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  tile: {
    width: '31.5%',
    aspectRatio: 1,
    overflow: 'hidden'
  },
  tileFill: {
    flex: 1,
    padding: 10,
    justifyContent: 'space-between'
  },
  tileText: {},
  tileDate: {}
});
