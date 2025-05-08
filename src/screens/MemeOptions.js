import { View, StyleSheet, ScrollView, Pressable, Text, Switch, TextInput } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useConfirmation } from 'src/contexts/ConfirmationContext';
import { rebootTemplates } from 'src/hooks/useTemplates';
import { rebootDecorations } from 'src/hooks/useDecorations';
import AppInfo from 'src/components/AppInfoComponent/AppInfo';
import LanguageSelector from 'src/components/LanguageSelectorComponent/LanguageSelector';
import { useConfig } from 'src/contexts/ConfigContext';
import { useMemo, memo } from 'react';
import { Dropdown } from 'react-native-element-dropdown';
import { Utils } from 'src/utils/Utils';

const MemeOptions = memo(({ navigation, onChangedTemplates }) => {
  const { t } = useTranslation();
  const { showConfirmation, setOnChangedDecorations } = useConfirmation();
  const { config, setConfig, initColor, initLightColor } = useConfig(); // Assuming useLanguage is imported from the correct path

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


  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
      padding: 20,
    },
    scrollContainer: {
      marginTop: 25,
      paddingBottom: 20,
      paddingHorizontal: 10,
    },
    section: {
      marginBottom: 30,
    },
    switchSection: {
      marginBottom: 30,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
    },
    selectInput: {
      width: '100%',
      height: 40,
      borderWidth: 1,
      borderColor: '#ddd',
      borderRadius: 8,
      paddingHorizontal: 10,
      alignSelf: 'center',
    },
    selectTextInput: {
      width: '75%',
      height: 40,
      borderWidth: 1,
      borderColor: '#ddd',
      borderRadius: 8,
      alignSelf: 'center',
      textAlign: "center",
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
      width: 'auto',
    },
    dangerButtonText: {
      color: '#FF5733',
      fontSize: 16,
      fontWeight: '500',
    },
  }), []);

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
          <Text style={styles.buttonText}>{config.staticBDrawer ? t('memeOptions.staticBDrawerEnabled') : t('memeOptions.staticBDrawerDisabled')}</Text>
          <Switch
            trackColor={{ false: initColor, true: initLightColor }}
            thumbColor={initColor}
            onValueChange={() => {
              setConfig({
                ...config,
                staticBDrawer: !config.staticBDrawer,
              });
            }}
            value={config.staticBDrawer}
          />
        </View>


        {/* Background type*/}
        <View style={[styles.switchSection, { flexDirection: 'column', alignItems: 'flex-start' }]}>
          <Text style={styles.buttonText}>{t('memeOptions.staticBackgroundType')}</Text>
          <Dropdown
            style={[styles.selectInput]}
            data={Utils.getBackgroundTypesList().map((item) => ({ label: item, value: item }))}
            labelField="label"
            valueField="value"
            value={config?.backgroundType}
            onChange={item => {
              setConfig((prev) => ({
                ...prev,
                backgroundType: item.value,
              }));
            }}
          />
        </View>

        {/* Resize mode */}
        <View style={[styles.switchSection, { flexDirection: 'column', alignItems: 'flex-start' }]}>
          <Text style={styles.buttonText}>{t('memeOptions.staticResizeMode')}</Text>
          <Dropdown
            style={[styles.selectInput]}
            data={Utils.getResizeModesList().map((item) => ({ label: item, value: item }))}
            labelField="label"
            valueField="value"
            value={config?.dragableResizeMode}
            onChange={item => {
              setConfig((prev) => ({
                ...prev,
                dragableResizeMode: item.value,
              }));
            }}
          />
        </View>

        {/* Font type */}
        <View style={[styles.switchSection, { flexDirection: 'column', alignItems: 'flex-start' }]}>
          <Text style={styles.buttonText}>{t('memeOptions.fontType')}</Text>
          <Dropdown
            style={[styles.selectInput]}
            data={Utils.getFontTypesList().map((item) => ({ label: item, value: item }))}
            labelField="label"
            valueField="value"
            value={config?.fontType}
            onChange={item => {
              setConfig((prev) => ({
                ...prev,
                fontType: item.value,
              }));
            }}
          />
        </View>

        {/* Font size auto checkbox */}
        <View style={styles.switchSection}>
          <Text style={styles.buttonText}>{config?.fontAutoResize ? t('memeOptions.fontAutoResizeEnabled') : t('memeOptions.fontAutoResizeDisabled')}</Text>
          <Switch
            trackColor={{ false: initColor, true: initLightColor }}
            thumbColor={initColor}
            onValueChange={() => {
              setConfig((prev) => ({
                ...prev,
                fontAutoResize: !prev?.fontAutoResize,
              }));
            }}
            value={config?.fontAutoResize}
          />
        </View>

        <Text style={styles.buttonText}>{t('memeOptions.decorationDimensions')}</Text>

        {/* Min/Max width input */}
        <View style={[styles.switchSection, { alignItems: 'space-between' }]}>
          <View style={{ width: '50%' }}>
            <Text style={styles.buttonText}>{t('memeOptions.minWidth')}</Text>
            <TextInput
              style={[styles.selectTextInput]}
              keyboardType="numeric"
              value={config?.minWidth?.toString()}
              onChangeText={(text) => {
                const value = parseInt(text, 10);
                if (!isNaN(value)) {
                  setConfig((prev) => ({
                    ...prev,
                    minWidth: value,
                  }));
                }
              }}
            />
          </View>
          <View style={{ width: '50%' }}>
            <Text style={styles.buttonText}>{t('memeOptions.maxWidth')}</Text>
            <TextInput
              style={[styles.selectTextInput]}
              keyboardType="numeric"
              value={config?.maxWidth?.toString()}
              onChangeText={(text) => {
                const value = parseInt(text, 10);
                if (!isNaN(value)) {
                  setConfig((prev) => ({
                    ...prev,
                    maxWidth: value,
                  }));
                }
              }}
            />
          </View>
        </View>

        {/* Min/Max height input */}
        <View style={[styles.switchSection, { flexDirection: 'row', alignItems: 'space-between' }]}>
          <View style={{ width: '50%' }}>
            <Text style={styles.buttonText}>{t('memeOptions.minHeight')}</Text>
            <TextInput
              style={[styles.selectTextInput]}
              keyboardType="numeric"
              value={config?.minHeight?.toString()}
              onChangeText={(text) => {
                const value = parseInt(text, 10);
                if (!isNaN(value)) {
                  setConfig((prev) => ({
                    ...prev,
                    minHeight: value,
                  }));
                }
              }}
            />
          </View>
          <View style={{ width: '50%' }}>
            <Text style={styles.buttonText}>{t('memeOptions.maxHeight')}</Text>
            <TextInput
              style={[styles.selectTextInput]}
              keyboardType="numeric"
              value={config?.maxHeight?.toString()}
              onChangeText={(text) => {
                const value = parseInt(text, 10);
                if (!isNaN(value)) {
                  setConfig((prev) => ({
                    ...prev,
                    maxHeight: value,
                  }));
                }
              }}
            />
          </View>
        </View>

        {/* App signature */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('memeOptions.appSignature')}</Text>
        </View>
      </ScrollView>
    </View>
  );
});


export default MemeOptions;