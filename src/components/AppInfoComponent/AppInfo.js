import React, { useState } from 'react';
import { View, Pressable, Text, StyleSheet, Modal, ScrollView, Platform } from 'react-native';
import { HelpCircle } from 'react-native-feather';
import { useTranslation } from 'react-i18next';

const Section = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.sectionContent}>
      {children}
    </View>
  </View>
);

const AppInfo = () => {
  const { t } = useTranslation();
  const [isModalVisible, setModalVisible] = useState(false);

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.iconButton}
        onPress={toggleModal}
        accessible={true}
        accessibilityLabel={t('appInfo.button')}
        accessibilityHint={t('appInfo.buttonHint')}
      >
        <HelpCircle stroke="#007AFF" width={24} height={24} />
        <Text style={styles.languageText}>{t('appInfo.button')}</Text>
      </Pressable>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={toggleModal}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.dismissArea} onPress={toggleModal} />
          <View style={styles.modalContent}>
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollViewContent}
              showsVerticalScrollIndicator={true}
            >
              <Text style={styles.title}>{t('appInfo.title')}</Text>

              <Section title={t('appInfo.features.title')}>
                <Text style={styles.text}>
                  {t('appInfo.features.text')}
                </Text>
              </Section>

              <Section title={t('appInfo.howToUse.title')}>
                <Text style={styles.text}>
                  {t('appInfo.howToUse.addText')}{'\n'}
                  {t('appInfo.howToUse.editText')}{'\n'}
                  {t('appInfo.howToUse.moveElements')}{'\n'}
                  {t('appInfo.howToUse.resize')}{'\n'}
                  {t('appInfo.howToUse.rotate')}
                </Text>
              </Section>

              <Section title={t('appInfo.sharing.title')}>
                <Text style={styles.text}>
                  {t('appInfo.sharing.description')}
                </Text>
              </Section>

              <Section title={t('appInfo.tips.title')}>
                <Text style={styles.text}>
                  {t('appInfo.tips.list')}
                </Text>
              </Section>

              <Pressable
                style={styles.closeButton}
                onPress={toggleModal}
                accessible={true}
                accessibilityLabel={t('common.close')}
              >
                <Text style={styles.closeButtonText}>{t('common.close')}</Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    zIndex: 10,
    width: '25%',
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  dismissArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: 'white',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  scrollView: {
    borderRadius: 20,
  },
  scrollViewContent: {
    padding: 20,
    paddingBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  sectionContent: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 15,
  },
  text: {
    fontSize: 16,
    color: '#444',
    lineHeight: 24,
  },
  closeButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    width: "95%",
    alignSelf: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AppInfo;
