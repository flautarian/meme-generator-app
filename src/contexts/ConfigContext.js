import React, { createContext, useContext, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { LANGUAGES } from '../i18n/i18n';
import { fetchSettings, updateSettings } from 'src/hooks/useSettings';
import { useEffect } from 'react';
import randomColor from 'randomcolor';

const ConfigContext = createContext();

export const ConfigProvider = ({ children }) => {
  const { i18n } = useTranslation();

  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);

  // OPTIONS 

  const [staticBDrawer, setStaticBDrawer] = useState(false);

  const [backgroundType, setBackgroundType] = useState("none");

  const [initColor, setInitColor] = useState('');

  const [initLightColor, setInitLightColor] = useState('');

  const [initDarkColor, setInitDarkColor] = useState('');

  const changeLanguage = useCallback(async (language) => {
    try {
      await i18n.changeLanguage(language);
      setCurrentLanguage(language);
    } catch (error) {
      console.error('Error changing language:', error);
    }
  }, [i18n]);

  const handleSettingsUpdate = useCallback(async () => {
    const updatedStrSettings = {
      valuesStored: JSON.stringify(
        {
          staticBDrawerEnabled: staticBDrawer,
          backgroundType: backgroundType
        }),
    };
    await updateSettings(updatedStrSettings);

  }, [staticBDrawer, backgroundType]);

  useEffect(() => {
    fetchSettings().then((result) => {
      if (result) {
        const allSettings = JSON.parse(result.valuesStored);
        setStaticBDrawer(allSettings.staticBDrawerEnabled);
        setBackgroundType(allSettings.backgroundType);
      }
    });


    // random color background generation
    setInitColor(randomColor({ count: 1, luminosity: 'light', hue: 'purple' })[0]);
    setInitLightColor(randomColor({ count: 1, luminosity: 'light', hue: 'purple' })[0]);
    setInitDarkColor(randomColor({ count: 1, luminosity: 'dark', hue: 'purple' })[0]);
  }, []);

  useEffect(() => {
    console.log('updating settings', staticBDrawer);
    // Call the function to update settings whenever staticBDrawer changes
    handleSettingsUpdate();
  }, [staticBDrawer, backgroundType]);

  return (
    <ConfigContext.Provider value={{
      currentLanguage,
      changeLanguage,
      languages: LANGUAGES,
      staticBDrawer,
      setStaticBDrawer,
      backgroundType,
      setBackgroundType,
      initColor,
      initLightColor,
      initDarkColor,
    }}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
