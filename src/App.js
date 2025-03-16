import React from 'react';
import AppRouterBase from "./screens/AppRouterBase";
import { LanguageProvider } from './contexts/LanguageContext';
import { ConfirmationProvider } from './contexts/ConfirmationContext';
import './i18n/i18n';

const App = () => {
  return (
    <LanguageProvider>
      <ConfirmationProvider>
        <AppRouterBase />
      </ConfirmationProvider>
    </LanguageProvider>
  );
};

export default App;