import 'react-native-gesture-handler';
import React from 'react';
import AppRouterBase from "./screens/AppRouterBase";
import { ConfigProvider } from './contexts/ConfigContext';
import { ConfirmationProvider } from './contexts/ConfirmationContext';
import './i18n/i18n';

const App = () => {
  return (
    <ConfigProvider>
      <ConfirmationProvider>
        <AppRouterBase />
      </ConfirmationProvider>
    </ConfigProvider>
  );
};

export default App;