import { View, StyleSheet, ScrollView, Pressable, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useConfirmation } from 'src/contexts/ConfirmationContext';
import LanguageSelector from 'src/components/LanguageSelectorComponent/LanguageSelector';
import AppInfo from 'src/components/AppInfoComponent/AppInfo';
import { rebootTemplates } from 'src/hooks/useTemplates';
import { rebootDecorations } from 'src/hooks/useDecorations';

const MemeOptions = ({ navigation, onChangedTemplates, onChangedDecorations }) => {
  const { t } = useTranslation();
  const { showConfirmation } = useConfirmation();

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
        onChangedDecorations();
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
  },
  dangerButtonText: {
    color: '#FF5733',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default MemeOptions;