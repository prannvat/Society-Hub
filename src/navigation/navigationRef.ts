import { createNavigationContainerRef } from '@react-navigation/native';
import { RootStackParamList } from './types';

/** App-wide navigation ref so overlays (e.g. the account switcher) can navigate imperatively. */
export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export function navigate<Name extends keyof RootStackParamList>(
  name: Name,
  params?: RootStackParamList[Name],
) {
  if (navigationRef.isReady()) {
    // @ts-expect-error — params are correctly typed at call sites; the generic relay is safe.
    navigationRef.navigate(name, params);
  }
}
