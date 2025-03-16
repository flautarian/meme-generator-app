import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Modal, Pressable } from 'react-native';
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
      <TouchableOpacity
        style={styles.iconButton}
        onPress={toggleDropdown}
        accessible={true}
        accessibilityLabel={t('languageSelector.button')}
        accessibilityHint={t('languageSelector.buttonHint')}
      >
        <Globe stroke="#007AFF" width={24} height={24} />
      </TouchableOpacity>

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
              <TouchableOpacity
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
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 1000,
  },
  iconButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
  },
  dropdownContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 10,
    marginTop: 70,
    marginRight: 20,
    marginLeft: 'auto',
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
