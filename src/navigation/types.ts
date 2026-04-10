import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Login: undefined;
  SignUp: undefined;
  ProfileSetup: undefined;
  InterestSelection: undefined;
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;
  AnnouncementsFeed: undefined;
  MemberProfile: { memberId?: string } | undefined;
  SocietyProfile: { societyId?: string } | undefined;
  EventDetail: { eventId?: string } | undefined;
  AnnouncementDetail: { announcementId?: string } | undefined;
  AdminDashboard: undefined;
  Settings: undefined;
  CreateEvent: undefined;
  CreateSociety: undefined;
  ExploreSocieties: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Events: undefined;
  Members: undefined;
  Polls: undefined;
  Profile: undefined;
};
