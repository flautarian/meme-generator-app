import { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions, FlatList, Text, TextInput } from 'react-native';
import { fetchDecorations } from 'src/hooks/useDecorations';
import TemplateItem from 'src/components/TemplateItemComponent/TemplateItem';

const { width, height } = Dimensions.get('window');

const MemeDecorationsList = ({ onSelectDecoration }) => {
    const [decorations, setDecorations] = useState([]);
    const [name, setName] = useState("");

    useEffect(() => {
        setTimeout(async () => {
            const decorationResults = await fetchDecorations(name);
            setDecorations(decorationResults);
        }, 1);
    }, [name]);

    return (
        <View>
            <TextInput style={styles.paragraph} placeholder="Search templates..." onChangeText={setName} />
            {decorations.length > 0 &&
                <FlatList
                    contentContainerStyle={{ alignItems: 'center' }}
                    showsVerticalScrollIndicator={false}
                    style={styles.memeListContainer}
                    data={decorations}
                    keyExtractor={(item, index) => { return `${item.name}-${index}` }}
                    numColumns={3}
                    renderItem={({ item, index }) => (
                        <TemplateItem
                            imgSize={150}
                            template={item}
                            key={`decoration-item-${index}-${item.name}`}
                            onSelect={(item) => onSelectDecoration(item)} />
                    )}
                />
            }
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

export default MemeDecorationsList;