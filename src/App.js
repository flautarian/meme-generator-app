import 'react-native-gesture-handler';
import React from 'react';
import AppRouterBase from "./screens/AppRouterBase";
import { LanguageProvider } from './contexts/LanguageContext';
import { ConfirmationProvider } from './contexts/ConfirmationContext';
import './i18n/i18n';
import { Platform } from 'react-native';

const App = () => {

  /* if (Platform.OS === 'web') {
    global._WORKLET = false
    // @ts-expect-error
    global._log = console.log
    // @ts-expect-error
    global._getAnimationTimestamp = () => performance.now()
  } */

  return (
    <LanguageProvider>
      <ConfirmationProvider>
        <AppRouterBase />
      </ConfirmationProvider>
    </LanguageProvider>
  );
};

export default App;