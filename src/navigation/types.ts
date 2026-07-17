import { NavigatorScreenParams } from '@react-navigation/native';
import { ConsumerTabParamList } from './ConsumerNavigator';
import { AdminTabParamList } from './AdminNavigator';
import { UnionAdminTabParamList } from './UnionAdminNavigator';

export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Login: undefined;
  SignUp: undefined;
  ProfileSetup: undefined;
  InterestSelection: undefined;
  MainTabs: NavigatorScreenParams<ConsumerTabParamList | AdminTabParamList | UnionAdminTabParamList> | undefined;
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

// Legacy - keeping for backward compatibility
export type MainTabParamList = {
  Home: undefined;
  Explore: undefined;
  Members: undefined;
  Polls: undefined;
  Profile: undefined;
};
