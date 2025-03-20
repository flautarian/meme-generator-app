import React, { useState } from 'react';
import { View, Pressable, Text, StyleSheet, Modal } from 'react-native';
import { useLanguage } from '../../contexts/LanguageContext';
import { Globe } from 'react-native-feather';
import { useTranslation } from 'react-i18next';

const LanguageSelector = () => {
  const { currentLanguage, changeLanguage, languages } = useLanguage();
  const { t } = useTranslation();
  const [isDropdownVisible, setDropdownVisible] = useState(false);

  const toggleDropdown = () => {
    setDropdownVisible(!isDropdownVisible);
  };

  const handleLanguageSelect = (code) => {
    changeLanguage(code);
    setDropdownVisible(false);
  };

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.iconButton}
        onPress={toggleDropdown}
        accessible={true}
        accessibilityLabel={t('languageSelector.button')}
        accessibilityHint={t('languageSelector.buttonHint')}
      >
        <Globe stroke="#007AFF" width={24} height={24} />
        <Text style={styles.languageText}>{languages[currentLanguage].name}</Text>
      </Pressable>

      <Modal
        animationType="fade"
        transparent={true}
        visible={isDropdownVisible}
        onRequestClose={() => setDropdownVisible(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setDropdownVisible(false)}
        >
          <View style={styles.dropdownContainer}>
            {Object.entries(languages).map(([code, { name }]) => (
              <Pressable
                key={code}
                style={[
                  styles.languageButton,
                  currentLanguage === code && styles.activeLanguage,
                ]}
                onPress={() => handleLanguageSelect(code)}
                accessible={true}
                accessibilityLabel={t('languageSelector.selectLanguage', { language: name })}
                accessibilityState={{ selected: currentLanguage === code }}
              >
                <Text style={[
                  styles.languageText,
                  currentLanguage === code && styles.activeText
                ]}>
                  {name}
                </Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    zIndex: 10,
    width: '90%',
    height: '50px',
    alignSelf: 'center',
  },
  iconButton: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
  },
  dropdownContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    marginTop: 70,
    marginLeft: 50,
    marginRight: 'auto',
    width: 150,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  languageButton: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginVertical: 2,
    borderRadius: 10,
    backgroundColor: 'transparent',
  },
  activeLanguage: {
    backgroundColor: '#007AFF',
  },
  languageText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
    textAlign: 'center',
  },
  activeText: {
    color: '#FFFFFF',
  },
});

export default LanguageSelector;
