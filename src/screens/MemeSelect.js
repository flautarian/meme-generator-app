import { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { View, StyleSheet, TextInput, Text, Platform } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { addNewTemplate, deleteTemplate, fetchTemplates } from 'src/hooks/useTemplates';
import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from 'react-i18next';
import { useConfirmation } from 'src/contexts/ConfirmationContext';
import { useDrawerStatus } from '@react-navigation/drawer';
import documentUploadOption from 'src/utils/documentUploadOption';
import TemplateItem from 'src/components/TemplateItemComponent/TemplateItem';

const MemeSelect = ({ navigation, onSelectMeme, onChangedTemplates }) => {

  const { t } = useTranslation();

  const { showConfirmation } = useConfirmation();

  const isDrawerOpen = useDrawerStatus() === 'open';

  const [templates, setTemplates] = useState([]);

  const [templateResults, setTemplatesFiltered] = useState([]);

  const [nameFilter, setNameFilter] = useState("");

  const [isDragging, setIsDragging] = useState(false);

  const dragCounter = useRef(0);

  const refreshTemplates = useCallback(async () => {
    const templateResults = await fetchTemplates(nameFilter);
    setTemplates(templateResults);
    if (Platform.OS !== 'web')
      templateResults.unshift(documentUploadOption);
    setTemplatesFiltered(templateResults);
  }, [nameFilter]);

  useEffect(() => {
    refreshTemplates();
  }, [onChangedTemplates]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      const filteredTemplates = [...templates.filter((item) =>
        item.name?.toLowerCase().includes(nameFilter.toLowerCase())
      )]
      if (Platform.OS !== 'web')
        filteredTemplates.unshift(documentUploadOption);
      setTemplatesFiltered(filteredTemplates);
    }, 300);
    return () => clearTimeout(debounce);
  }, [nameFilter, templates]);

  // Process image file and add as template
  const processImageFile = useCallback(async (file) => {
    try {
      if (!file.type.startsWith('image/')) {
        console.log('File is not an image');
        return;
      }

      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Image = e.target.result;
        const template = {
          name: file.name,
          blob: base64Image,
        };
        await addNewTemplate(template);
        await refreshTemplates();
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.log("Error processing file:", error);
    }
  }, [refreshTemplates]);

  // Drag and drop handlers for web
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const handleDragEnter = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!isDrawerOpen) return;
      dragCounter.current++;
      if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
        setIsDragging(true);
      }
    };

    const handleDragLeave = (e) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current--;
      if (dragCounter.current === 0) {
        setIsDragging(false);
      }
    };

    const handleDragOver = (e) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDrop = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      dragCounter.current = 0;

      if (!isDrawerOpen) return;

      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        processImageFile(files[0]);
      }
    };

    const handlePaste = (e) => {
      if (!isDrawerOpen) return;
      const items = e.clipboardData?.items;
      if (items) {
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.indexOf('image') !== -1) {
            const blob = items[i].getAsFile();
            if (blob) {
              processImageFile(blob);
            }
          }
        }
      }
    };

    document.addEventListener('dragenter', handleDragEnter);
    document.addEventListener('dragleave', handleDragLeave);
    document.addEventListener('dragover', handleDragOver);
    document.addEventListener('drop', handleDrop);
    document.addEventListener('paste', handlePaste);

    return () => {
      document.removeEventListener('dragenter', handleDragEnter);
      document.removeEventListener('dragleave', handleDragLeave);
      document.removeEventListener('dragover', handleDragOver);
      document.removeEventListener('drop', handleDrop);
      document.removeEventListener('paste', handlePaste);
    };
  }, [processImageFile, isDrawerOpen]);

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
  }, [t, refreshTemplates, showConfirmation]);

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
  }, [refreshTemplates, onSelectMeme, navigation]);


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
    dragOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    },
    dragText: {
      color: 'white',
      fontSize: 24,
      fontWeight: 'bold',
    },
    hintText: {
      fontSize: 12,
      color: '#666',
      textAlign: 'center',
      fontStyle: 'italic',
      paddingHorizontal: 10,
    },
  }), []);

  return (
    <View style={styles.container}>
      {isDragging && Platform.OS === 'web' && (
        <View style={styles.dragOverlay}>
          <Text style={styles.dragText}>{t('templates.dropHere') || 'Drop image here'}</Text>
        </View>
      )}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder={t('templates.searchPlaceholder')}
          onChangeText={setNameFilter}
          value={nameFilter}
        />
      </View>
      <Text style={styles.resultCount}>
        {t('templates.foundCount', { count: templateResults.length })}
      </Text>
      {Platform.OS === 'web' && (
        <Text style={styles.hintText}>
          {t('templates.dragDropHint') || 'Drag & drop images or paste from clipboard'}
        </Text>
      )}
      <View style={styles.content}>
        {templateResults.length > 0 &&
          <FlatList
            contentContainerStyle={{ alignItems: 'center', justifyContent: 'space-between', width: "100%" }}
            showsVerticalScrollIndicator={true}
            data={templateResults}
            keyExtractor={(item, index) => `${item.name}-${index}`}
            numColumns={1}
            ItemSeparatorComponent={() => <View style={{ height: "5dvh" }} />}
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