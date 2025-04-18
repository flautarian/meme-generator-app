import { View, StyleSheet, ScrollView, Pressable, Text, Switch } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useConfirmation } from 'src/contexts/ConfirmationContext';
import { rebootTemplates } from 'src/hooks/useTemplates';
import { rebootDecorations } from 'src/hooks/useDecorations';
import AppInfo from 'src/components/AppInfoComponent/AppInfo';
import LanguageSelector from 'src/components/LanguageSelectorComponent/LanguageSelector';
import { useConfig } from 'src/contexts/ConfigContext';

import { Dropdown } from 'react-native-element-dropdown';

const MemeOptions = ({ navigation, onChangedTemplates }) => {
  const { t } = useTranslation();
  const { showConfirmation, setOnChangedDecorations } = useConfirmation();
  const { staticBDrawer, setStaticBDrawer, backgroundType, setBackgroundType, initColor, initLightColor } = useConfig(); // Assuming useLanguage is imported from the correct path

  const backgroundOptions = [
    "lava",
    "gradient",
    "none",
  ]

  const closeDrawer = () => {
    navigation.closeDrawer();
  };

  const rebootDecorationsDb = () => {
    showConfirmation({
      title: t('memeOptions.rebootDecorationsDb'),
      message: t('memeOptions.rebootDecorationsDbMessage'),
      confirmText: t('memeOptions.rebootDecorationsDbConfirm'),
      onConfirm: async () => {
        await rebootDecorations();
        setOnChangedDecorations((prev) => !prev);
        closeDrawer();
      },
    });
  };

  const rebootTemplatesDb = () => {
    showConfirmation({
      title: t('memeOptions.rebootTemplatesDb'),
      message: t('memeOptions.rebootTemplatesDbMessage'),
      confirmText: t('memeOptions.rebootTemplatesDbConfirm'),
      onConfirm: async () => {
        await rebootTemplates();
        onChangedTemplates((prev) => !prev);
        closeDrawer();
      },
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Language Selector and how to use*/}
        <View style={[styles.section, { flex: 1, flexDirection: 'row', justifyContent: 'space-between', columnGap: 10 }]}>
          <LanguageSelector />
          <AppInfo />
        </View>

        {/* Reboot decorations db button */}
        <View style={styles.section}>
          <Pressable
            style={styles.dangerButton}
            onPress={rebootDecorationsDb}
            accessible={true}
            accessibilityLabel={t('memeOptions.rebootDecorationsDb')}
            accessibilityHint={t('memeOptions.rebootDecorationsDbHint')}
          >
            <Text style={styles.dangerButtonText}>{t('memeOptions.rebootDecorationsDb')}</Text>
          </Pressable>
        </View>

        {/* Reboot templates db button */}
        <View style={styles.section}>
          <Pressable
            style={styles.dangerButton}
            onPress={rebootTemplatesDb}
            accessible={true}
            accessibilityLabel={t('memeOptions.rebootTemplatesDb')}
            accessibilityHint={t('memeOptions.rebootTemplatesDbHint')}
          >
            <Text style={styles.dangerButtonText}>{t('memeOptions.rebootTemplatesDb')}</Text>
          </Pressable>
        </View>

        {/* Static bottom drawer checkbox */}
        <View style={styles.switchSection}>
          <Text style={styles.dangerButtonText}>{staticBDrawer ? t('memeOptions.staticBDrawerEnabled') : t('memeOptions.staticBDrawerDisabled')}</Text>
          <Switch
            trackColor={{ false: initColor, true: initLightColor }}
            thumbColor={initColor}
            onValueChange={() => {
              setStaticBDrawer(!staticBDrawer);
            }}
            value={staticBDrawer}
          />
        </View>


        {/* Background type*/}
        <View style={[styles.switchSection, { flexDirection: 'column', alignItems: 'flex-start' }]}>
          <Text style={styles.buttonText}>{t('memeOptions.staticBackgroundType')}</Text>
          <Dropdown
            style={[styles.selectInput]}
            data={backgroundOptions.map((item) => ({ label: item, value: item }))}
            labelField="label"
            valueField="value"
            value={backgroundType}
            onChange={item => {
              setBackgroundType(item.value);
            }}
          />
        </View>

        {/* App signature */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('memeOptions.appSignature')}</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  scrollContainer: {
    marginTop: 25,
    paddingBottom: 20,
  },
  section: {
    marginBottom: 30,
  },
  switchSection: {
    marginBottom: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectInput: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 10,
    alignSelf: 'center',
  },
  searchContainer: {
    padding: 10,
  },
  searchInput: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  resultCount: {
    paddingHorizontal: 10,
    paddingBottom: 5,
    color: '#666',
  },
  content: {
    flex: 1,
  },
  memeListContainer: {
    width: "90%",
    alignSelf: "center",
  },
  button: {
    width: '90%',
    height: '50px',
    padding: 15,
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: '5%',
  },
  dangerButton: {
    width: '90%',
    height: '50px',
    padding: 15,
    borderWidth: 1,
    borderColor: '#FF0000',
    borderRadius: 8,
    backgroundColor: '#FFB3A3',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: '5%',
  },
  buttonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
    width: '100%',
  },
  dangerButtonText: {
    color: '#FF5733',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default MemeOptions;