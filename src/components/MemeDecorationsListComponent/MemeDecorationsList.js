import { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions, FlatList, Text, TextInput, Pressable, Platform } from 'react-native';
import { fetchDecorations } from 'src/hooks/useDecorations';
import TemplateItem from 'src/components/TemplateItemComponent/TemplateItem';
import { XCircle } from 'react-native-feather';
import { SafeAreaView } from 'react-native';
import documentUploadOption from 'src/utils/documentUploadOption';
import { deleteDecoration, addNewDecoration } from 'src/hooks/useTemplates';
import * as ImagePicker from 'expo-image-picker';

const { width, height } = Dimensions.get('window');

const MemeDecorationsList = ({ onSelectDecoration, onCloseMenu }) => {
    const [decorations, setDecorations] = useState([]);
    const [decorationsFiltered, setDecorationsFiltered] = useState([]);
    const [nameFilter, setNameFilter] = useState("");

    useEffect(() => {
        refreshDecorations();
    }, []);

    const refreshDecorations = useCallback(async () => {
        const decorationResults = await fetchDecorations(nameFilter);
        setDecorations(decorationResults);
        setDecorationsFiltered(decorationResults);
    }, [nameFilter]);

    useEffect(() => {
        const debounce = setTimeout(() => {
            setDecorationsFiltered(
                [...decorations.filter((item) =>
                    item.name.toLowerCase().includes(nameFilter.toLowerCase())
                ), documentUploadOption]
            );
        }, 300);
        return () => clearTimeout(debounce);
    }, [nameFilter, decorations]);

    const selectDecoration = useCallback(async (item) => {
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
                    const decoration = {
                        name: result.assets[0].fileName || result.assets[0].uri.split("/").pop(),
                        blob: base64Image,
                    };
                    await addNewDecoration(decoration);
                    await refreshDecorations();
                }
            }
            catch (error) {
                console.log("Error selecting file:", error);
            }
        }
        else {
            const itemToSelect = {
                name: item.name,
                blob: typeof item.blob === "string" ? (!item.blob.startsWith("data:image") || Platform.OS === "web" ? item.blob : { uri: item.blob }) : item.blob
            }
            onSelectDecoration(itemToSelect);
        }
    }, []);

    const onDeleteDecoration = useCallback(async (decoration) => {
        await deleteDecoration(decoration);
        await refreshDecorations();
        setNameFilter("");
    }, [decorations]);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.heading}>
                <TextInput
                    style={[styles.textInput]}
                    placeholder="Search templates..."
                    onChangeText={setNameFilter}
                    value={nameFilter}
                />
                <Pressable style={[styles.closeBtn]} onPress={onCloseMenu}>
                    <XCircle stroke="black" fill="#fff" width={40} height={40} />
                </Pressable>
            </View>
            <Text>
                decorations found: {decorationsFiltered.length - 1}
            </Text>
            {decorations.length > 0 && (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', height: '100%', padding: 10 }}>
                    <FlatList
                        showsVerticalScrollIndicator={true}
                        style={styles.memeListContainer}
                        data={decorationsFiltered}
                        keyExtractor={(item, index) => `${item.name}-${index}`}
                        numColumns={4}
                        renderItem={({ item, index }) => (
                            <TemplateItem
                                template={item}
                                onSelect={(item) => selectDecoration(item)}
                                imgSize={Platform.OS === "web" ? 150 : 75}
                                onDelete={() => onDeleteDecoration(item)}
                            />
                        )}
                    />
                </View>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
    },
    heading: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        maxHeight: 50,
        padding: 5
    },
    titleContainer: {
        flex: 1,
        justifyContent: 'flex-top',
        alignItems: 'center',
        height: height * 0.1,
    },
    memeListContainer: {
        width: width * 0.9,
        height: '65%'
    },
    textInput: {
        fontSize: 14,
        width: '85%',
        height: 40,
    },
    closeBtn: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '10%'
    },
});

export default MemeDecorationsList;
