import * as ReactNative from 'react-native';

export function useColorScheme(): 'light' | 'dark' {
  if (typeof ReactNative.useColorScheme !== 'function') {
    return 'light';
  }

  try {
    const scheme = ReactNative.useColorScheme();
    return scheme === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}
