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

  const [initColor, setInitColor] = useState('');

  const [initLightColor, setInitLightColor] = useState('');

  const [initDarkColor, setInitDarkColor] = useState('');

  const [selectedTextIndex, setSelectedTextIndex] = useState(-1);

  const [config, setConfig] = useState({
    staticBDrawer: false,
    backgroundType: "lava",
    dragableResizeMode: "1-square",
    fontAutoResize: true,
    fontType: 'Impact',
    limitWidth: false,
    minWidth: 100,
    maxWidth: 300,
    limitHeight: false,
    minHeight: 100,
    maxHeight: 300,
  });

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
      valuesStored: JSON.stringify(config),
    };
    await updateSettings(updatedStrSettings);
  }, [config]);

  useEffect(() => {
    fetchSettings().then((result) => {
      if (!!result && Object.keys(result).length > 0) {
        const allSettings = JSON.parse(result.valuesStored);
        setConfig(allSettings);
      }
    });

    // random color background generation
    setInitColor(randomColor({ count: 1, luminosity: 'light', hue: 'purple' })[0]);
    setInitLightColor(randomColor({ count: 1, luminosity: 'light', hue: 'purple' })[0]);
    setInitDarkColor(randomColor({ count: 1, luminosity: 'dark', hue: 'purple' })[0]);
  }, []);

  useEffect(() => {
    // Call the function to update settings
    // console.log("Config updated", config);
    handleSettingsUpdate();
  }, [config]);

  return (
    <ConfigContext.Provider value={{
      currentLanguage,
      changeLanguage,
      languages: LANGUAGES,
      config,
      setConfig,
      initColor,
      initLightColor,
      initDarkColor,
      selectedTextIndex,
      setSelectedTextIndex,
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
