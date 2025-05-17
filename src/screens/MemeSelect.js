import { useCallback, useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, TextInput, Text, Platform } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { addNewTemplate, deleteTemplate, fetchTemplates } from 'src/hooks/useTemplates';
import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from 'react-i18next';
import { useConfirmation } from 'src/contexts/ConfirmationContext';
import documentUploadOption from 'src/utils/documentUploadOption';
import TemplateItem from 'src/components/TemplateItemComponent/TemplateItem';

const MemeSelect = ({ navigation, onSelectMeme, onChangedTemplates }) => {

  const { t } = useTranslation();

  const { showConfirmation } = useConfirmation();

  const [templates, setTemplates] = useState([]);

  const [templateResults, setTemplatesFiltered] = useState([]);

  const [nameFilter, setNameFilter] = useState("");

  const refreshTemplates = useCallback(async () => {
    const templateResults = await fetchTemplates(nameFilter);
    setTemplates(templateResults);
    setTemplatesFiltered([...templateResults, documentUploadOption]);
  }, [nameFilter]);

  useEffect(() => {
    refreshTemplates();
  }, [onChangedTemplates]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      setTemplatesFiltered(
        [...templates.filter((item) =>
          item.name?.toLowerCase().includes(nameFilter.toLowerCase())
        ), documentUploadOption]
      );
    }, 300);
    return () => clearTimeout(debounce);
  }, [nameFilter, templates]);

  const handleDeleteTemplate = useCallback(async (template) => {
    showConfirmation({
      title: t('confirmation.deleteTemplate.title'),
      message: t('confirmation.deleteTemplate.message'),
      onConfirm: async () => {
        await deleteTemplate(template);
        await refreshTemplates();
        setNameFilter("");
      },
      type: 'template',
      itemId: template.id
    });
  }, [t, refreshTemplates]);

  const closeDrawer = () => {
    navigation.closeDrawer();
  };

  const selectMeme = useCallback(async (item) => {
    if (item.name === "/Upload a file") {
      try {
        let result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          base64: true,
          quality: 1,
        });

        if (!result.canceled) {
          const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
          const template = {
            name: result.assets[0].fileName || result.assets[0].uri.split("/").pop(),
            blob: base64Image,
          };
          await addNewTemplate(template);
          await refreshTemplates();
        }
      }
      catch (error) {
        console.log("Error selecting file:", error);
      }
    }
    else {
      onSelectMeme(item);
      closeDrawer();
    }
  }, [refreshTemplates]);


  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
    },
    searchContainer: {
      padding: 10,
    },
    searchInput: {
      fontSize: 14,
      width: '100%',
      height: 40,
      textAlign: 'center',
      border: "2px solid #000",
      borderRadius: 20,
      borderWidth: 2,
    },
    resultCount: {
      paddingHorizontal: 10,
      paddingBottom: 5,
      textAlign: 'center',
      color: '#666',
    },
    content: {
      flex: 1,
      width: '100%'
    },
    memeListContainer: {
      width: "100%",
    },
  }), []);

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder={t('templates.searchPlaceholder')}
          onChangeText={setNameFilter}
          value={nameFilter}
        />
      </View>
      <Text style={styles.resultCount}>
        {t('templates.foundCount', { count: templateResults.length - 1 })}
      </Text>
      <View style={styles.content}>
        {templateResults.length > 0 &&
          <FlatList
            contentContainerStyle={{ alignItems: 'center', justifyContent: 'space-between', width: "100%" }}
            showsVerticalScrollIndicator={true}
            data={templateResults}
            keyExtractor={(item, index) => `${item.name}-${index}`}
            numColumns={1}
            ItemSeparatorComponent={() => <View style={{height: "5dvh"}} />}
            renderItem={({ item, index }) => (
              <TemplateItem
                template={item}
                key={index}
                index={index}
                imgSize={Platform.OS === "web" ? 250 : 250}
                onSelect={(item) => selectMeme(item)}
                onDelete={() => handleDeleteTemplate(item)}
              />
            )}
          />
        }
      </View>
    </View>
  );
};

export default MemeSelect;