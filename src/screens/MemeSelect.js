import { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions, FlatList, TextInput, Text, Platform } from 'react-native';
import { addNewTemplate, deleteTemplate, fetchTemplates } from 'src/hooks/useTemplates';
import TemplateItem from 'src/components/TemplateItemComponent/TemplateItem';
import * as ImagePicker from 'expo-image-picker';
import documentUploadOption from 'src/utils/documentUploadOption';

const { width, height } = Dimensions.get('window');

const MemeSelect = ({ navigation, onSelectMeme }) => {

  const [templates, setTemplates] = useState([]);
  const [templateResults, setTemplatesFiltered] = useState([]);
  const [nameFilter, setNameFilter] = useState("");

  useEffect(() => {
    refreshTemplates();
  }, []);

  const refreshTemplates = useCallback(async () => {
    const results = await fetchTemplates(nameFilter);
    setTemplates(results);
    setTemplatesFiltered(results);
  }, [nameFilter]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      setTemplatesFiltered(
        [...templates.filter((item) =>
          item.name.toLowerCase().includes(nameFilter.toLowerCase())
        ), documentUploadOption]
      );
    }, 300);
    return () => clearTimeout(debounce);
  }, [nameFilter, templates]);

  const onDeleteTemplate = useCallback(async (template) => {
    await deleteTemplate(template);
    await refreshTemplates();
    setNameFilter("");
  }, [templates]);

  const closeDrawer = () => {
    navigation.closeDrawer();
  };

  const selectMeme = async (item) => {
    if (item.name === "/Upload a file") {
      console.log("Selecting file");
      try {
        let result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          base64: true,
          quality: 1,
          //aspect: [4, 3],
        });

        if (!result.canceled) {
          const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
          // Now you can save `base64Image` to your database
          const newTemplate = {
            name: result.assets[0].fileName || result.assets[0].uri.split("/").pop(),
            blob: base64Image,
          };
          await addNewTemplate(newTemplate);
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
  }

  return (
    <View style={{ flex: 1, paddingTop: height * 0.05 }}>
      <TextInput
        style={styles.input}
        placeholder="Search templates..."
        onChangeText={setNameFilter}
        value={nameFilter} />
      <Text>
        Templates found: {templateResults.length - 1}
      </Text>
      <View>
        {templateResults.length > 0 &&
          <FlatList
            contentContainerStyle={{ alignItems: 'center' }}
            showsVerticalScrollIndicator={false}
            style={styles.memeListContainer}
            data={templateResults}
            keyExtractor={(item, index) => { return `${item.name}-${index}` }}
            numColumns={2}
            renderItem={({ item, index }) => (
              <TemplateItem
                template={item}
                key={index}
                index
                imgSize={Platform.OS === "web" ? 150 : 75}
                onSelect={(item) => selectMeme(item)}
                onDelete={() => onDeleteTemplate(item)} />
            )}
          />
        }
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleContainer: {
    flex: 1,
    justifyContent: 'flex-top',
    alignItems: 'center',
    height: height * 0.1,
  },
  memeListContainer: {
    width: "100%",
    alignContent: "center",
    maxHeight: height * 0.85
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    color: "green"
  },
  input: {
    fontSize: 14,
    height: 40,
    width: "90%",
    alignSelf: "center",
  },
});

export default MemeSelect;