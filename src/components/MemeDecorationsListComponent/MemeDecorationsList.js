import { useCallback, useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Dimensions, FlatList, Text, TextInput, Pressable, Platform } from 'react-native';
import { fetchDecorations } from 'src/hooks/useDecorations';
import TemplateItem from 'src/components/TemplateItemComponent/TemplateItem';
import { SafeAreaView } from 'react-native';
import documentUploadOption from 'src/utils/documentUploadOption';
import { deleteDecoration, addNewDecoration } from 'src/hooks/useDecorations';
import { useConfirmation } from 'src/contexts/ConfirmationContext';
import { useTranslation } from 'react-i18next';
import * as ImagePicker from 'expo-image-picker';

const { width, height } = Dimensions.get('window');

const MemeDecorationsList = ({ onSelectDecoration, onCloseMenu }) => {
    const [decorations, setDecorations] = useState([]);
    const [decorationsFiltered, setDecorationsFiltered] = useState([]);
    const [nameFilter, setNameFilter] = useState("");
    const [isDragging, setIsDragging] = useState(false);
    const { showConfirmation, onChangedDecorations } = useConfirmation();
    const { t } = useTranslation();
    const dragCounter = useRef(0);

    useEffect(() => {
        refreshDecorations();
    }, [onChangedDecorations]);

    const refreshDecorations = useCallback(async () => {
        const decorationResults = await fetchDecorations(nameFilter);
        setDecorations(decorationResults);
        if (Platform.OS !== 'web')
            decorationResults.unshift(documentUploadOption);
        setDecorationsFiltered([...decorationResults]);
    }, [nameFilter]);

    useEffect(() => {
        const debounce = setTimeout(() => {
            const dFiltered = [...decorations.filter((item) =>
                item.name?.toLowerCase().includes(nameFilter.toLowerCase())
            )]
            if (Platform.OS !== 'web')
                dFiltered.unshift(documentUploadOption);
            setDecorationsFiltered(dFiltered);
        }, 300);
        return () => clearTimeout(debounce);
    }, [nameFilter, decorations]);

    // Process image file and add as decoration
    const processImageFile = useCallback(async (file) => {
        try {
            if (!file.type.startsWith('image/')) {
                console.log('File is not an image');
                return;
            }

            const reader = new FileReader();
            reader.onload = async (e) => {
                const base64Image = e.target.result;
                const decoration = {
                    name: file.name,
                    blob: base64Image,
                };
                await addNewDecoration(decoration);
                await refreshDecorations();
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.log("Error processing file:", error);
        }
    }, [refreshDecorations]);

    // Drag and drop handlers for web
    useEffect(() => {
        if (Platform.OS !== 'web') return;

        const handleDragEnter = (e) => {
            e.preventDefault();
            e.stopPropagation();
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

            const files = e.dataTransfer.files;
            if (files && files.length > 0) {
                processImageFile(files[0]);
            }
        };

        const handlePaste = (e) => {
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
    }, [processImageFile]);

    const selectDecoration = useCallback(async (item) => {
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
    }, [refreshDecorations, onSelectDecoration]);

    const onHandleDeleteDecoration = useCallback(async (decoration) => {
        showConfirmation({
            title: t('confirmation.deleteDecoration.title'),
            message: t('confirmation.deleteDecoration.message'),
            onConfirm: async () => {
                await deleteDecoration(decoration);
                await refreshDecorations();
                setNameFilter("");
            },
            type: 'decoration',
            itemId: decoration.id
        });
    }, [t, decorations, refreshDecorations, showConfirmation]);

    return (
        <SafeAreaView style={styles.container}>
            {isDragging && Platform.OS === 'web' && (
                <View style={styles.dragOverlay}>
                    <Text style={styles.dragText}>{t('decorations.dropHere') || 'Drop image here'}</Text>
                </View>
            )}
            <View style={styles.heading}>
                <TextInput
                    style={[styles.textInput]}
                    placeholder={t('decorations.searchPlaceholder')}
                    onChangeText={setNameFilter}
                    value={nameFilter}
                />
            </View>
            <Text>
                {t('decorations.foundCount', { count: decorationsFiltered.length })}
            </Text>
            {Platform.OS === 'web' && (
                <Text style={styles.hintText}>
                    {t('decorations.dragDropHint') || 'Drag & drop images or paste from clipboard'}
                </Text>
            )}
            {decorations.length > 0 && (
                <View style={{ flex: 1, width: '100%', height: "100%" }}>
                    <FlatList
                        style={styles.memeListContainer}
                        contentContainerStyle={{ flexGrow: 1, alignItems: 'center', justifyContent: 'space-between' }}
                        showsHorizontalScrollIndicator={true}
                        data={decorationsFiltered}
                        keyExtractor={(item, index) => `${item.name}-decoration-${index}`}
                        horizontal={true}
                        renderItem={({ item, index }) => (
                            <TemplateItem
                                template={item}
                                onSelect={(item) => selectDecoration(item)}
                                imgSize={Platform.OS === "web" ? 150 : 100}
                                onDelete={() => onHandleDeleteDecoration(item)}
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
        width: '70%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
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
        width: '100%',
        height: 40,
        textAlign: 'center',
        border: "2px solid #000",
        borderRadius: 20,
        borderWidth: 2,
    },
    closeBtn: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '10%'
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
        marginTop: 5,
        fontStyle: 'italic',
    },
});

export default MemeDecorationsList;
