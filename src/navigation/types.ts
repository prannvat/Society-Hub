import { NavigatorScreenParams } from '@react-navigation/native';
import { ConsumerTabParamList } from './ConsumerNavigator';
import { AdminTabParamList } from './AdminNavigator';
import { UnionAdminTabParamList } from './UnionAdminNavigator';

// MainTabs renders one of three tab navigators depending on the current app mode.
// The intersection makes every tab name across the three navigators addressable
// via navigation.navigate('MainTabs', { screen: ... }).
export type MainTabsParamList = ConsumerTabParamList & AdminTabParamList & UnionAdminTabParamList;

export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Login: undefined;
  SignUp: undefined;
  ProfileSetup: undefined;
  InterestSelection: undefined;
  MainTabs: NavigatorScreenParams<MainTabsParamList> | undefined;
  AnnouncementsFeed: undefined;
  MemberProfile: { memberId?: string } | undefined;
  SocietyProfile: { societyId?: string } | undefined;
  EventDetail: { eventId?: string } | undefined;
  AnnouncementDetail: { announcementId?: string } | undefined;
  AdminDashboard: undefined;
  Settings: undefined;
  CreateEvent: undefined;
  CreateSociety: undefined;
  EditSocietyProfile: undefined;
  EditProfile: undefined;
  ExploreSocieties: undefined;
  CommitteeRequest: { societyId: string; currentRole: string } | undefined;
};
