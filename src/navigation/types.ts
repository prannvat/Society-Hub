import { NavigatorScreenParams } from '@react-navigation/native';
import { ConsumerTabParamList } from './ConsumerNavigator';
import { AdminTabParamList } from './AdminNavigator';

// MainTabs renders one of two tab navigators depending on the current app mode.
// The intersection makes every tab name across both navigators addressable
// via navigation.navigate('MainTabs', { screen: ... }).
export type MainTabsParamList = ConsumerTabParamList & AdminTabParamList;

export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  // `mode: 'add'` = adding another account while already signed in (Instagram-style).
  Login: { mode?: 'add' } | undefined;
  SignUp: { mode?: 'add' } | undefined;
  ProfileSetup: undefined;
  InterestSelection: undefined;
  MainTabs: NavigatorScreenParams<MainTabsParamList> | undefined;
  Notifications: undefined;
  AnnouncementsFeed: undefined;
  // A real person's public profile, reachable by id or @handle. This is what
  // students land on when they tap someone anywhere in the app.
  UserProfile: { userId?: string; username?: string } | undefined;
  // Committee-only member management (role changes within the active society).
  MemberProfile: { memberId?: string } | undefined;
  SocietyProfile: { societyId?: string } | undefined;
  EventDetail: { eventId?: string } | undefined;
  AnnouncementDetail: { announcementId?: string } | undefined;
  AdminDashboard: undefined;
  Settings: undefined;
  CreateEvent: { societyId?: string } | undefined;
  CreateSociety: undefined;
  EditSocietyProfile: undefined;
  EditProfile: undefined;
  ExploreSocieties: undefined;
  CommitteeRequest: { societyId: string; currentRole: string } | undefined;
  // Committee/creator surface — contextual, reached without a mode switch.
  SocietyManage: { societyId: string };
  CreateHub: { societyId?: string } | undefined;
  CreatePost: { societyId?: string } | undefined;
  CreatePoll: { societyId?: string } | undefined;
  MembersDirectory: { societyId?: string } | undefined;
  // Public "who has joined" list — readable by any signed-in user.
  SocietyMembers: { societyId: string };
  SocietyPolls: { societyId?: string } | undefined;
};
