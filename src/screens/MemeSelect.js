import { useEffect, useState } from 'react';
import { View, StyleSheet, Image, Dimensions, FlatList, TextInput, Text, SafeAreaView } from 'react-native';
import { fetchTemplates } from 'src/hooks/useTemplates';
import TemplateItem from 'src/components/TemplateItemComponent/TemplateItem';

const { width, height } = Dimensions.get('window');

const MemeSelect = ({ navigation }) => {
  const [templates, setTemplates] = useState([]);
  const [name, setName] = useState("");

  useEffect(() => {
    setTimeout(async () => {
      const templateResults = await fetchTemplates(name);
      setTemplates(templateResults);
    }, 1);
  }, [name]);

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.heading}>Create Meme from template</Text>
        <Text style={styles.paragraph}>Select the template you want to use:</Text>
      </View>
      <TextInput style={styles.paragraph} placeholder="Search templates..." onChangeText={setName} />
      <View>
        {templates.length > 0 &&
          <FlatList
            contentContainerStyle={{ alignItems: 'center' }}
            showsVerticalScrollIndicator={false}
            style={styles.memeListContainer}
            data={templates}
            keyExtractor={(item, index) => { return `${item.name}-${index}` }}
            numColumns={3}
            renderItem={({ item, index }) => (
              <TemplateItem
                template={item}
                key={index}
                onSelectMeme={(item) => navigation.navigate('MemeCreate', { template: item })} />
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
    width: width * 0.9,
    maxHeight: height * 0.7
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    color: "green"
  },
  paragraph: {
    fontSize: 14,
  },
});

export default MemeSelect;