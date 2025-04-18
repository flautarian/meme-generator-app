import { useState, useRef, useEffect, useCallback } from "react";
import { Pressable, StyleSheet, TextInput } from "react-native";
import { TapGestureHandler } from "react-native-gesture-handler";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { useTranslation } from 'react-i18next';
import 'assets/fonts/impact.ttf';
import { Minus, Plus } from "react-native-feather";

const EditableText = ({ item, index }) => {

    console.log("EditableText", item, index);
    const { t } = useTranslation();

    const [value, setValue] = useState(item.value);

    const [isEditing, setIsEditing] = useState(false);

    const [fontSize, setFontSize] = useState(20);

    // animated size style for the inner component shown
    const resizeAnimationStyle = useAnimatedStyle(() => ({
        height: "100%",
        width: "100%",
        flexShrink: 1,
        backgroundColor: 'transparent',
        zIndex: 15,
    }));

    const updateValue = useCallback((text) => {
        setValue(text);
        item.value = text;
    }, [item]);

    const alterFontSize = useCallback((point) => {
        setFontSize(prevFontSize => {
            const newFontSize = prevFontSize + point;
            if (newFontSize < 10) return prevFontSize; // prevent font size from going below 10
            if (newFontSize > 100) return prevFontSize; // prevent font size from going above 100
            return newFontSize;
        });
    }, [fontSize]);

    return (
        <Animated.View style={[resizeAnimationStyle]} selectable={false} draggable={false} key={`editable-text-${index}`}>
            <TapGestureHandler
                onHandlerStateChange={({ nativeEvent }) => {
                    if (nativeEvent.state === 4) {
                        // handle double tap
                        setIsEditing(true);
                    }
                }}
                numberOfTaps={2}
                draggable={false}
                selectable={false}
            >
                {isEditing ? (
                    <TextInput
                        aria-label={t('editableText.ariaLabel')}
                        style={[{ ...styles.impact, textAlign: 'center', fontSize: fontSize },
                        StyleSheet.absoluteFill]}
                        value={value}
                        onChangeText={updateValue}
                        onBlur={() => setIsEditing(false)}
                        autoFocus
                        numberOfLines={1}
                        tooltip={t('editableText.placeholder')}
                        selectable={false}
                        draggable={false}
                        pointerEvents="box-only"
                    />
                ) : (
                    <Animated.Text
                        style={[styles.text, StyleSheet.absoluteFill, styles.impact, { fontSize: fontSize }]}
                        selectable={false}
                        draggable={false}>
                        {value}
                    </Animated.Text>
                )}
            </TapGestureHandler>

            <Pressable onPress={() => alterFontSize(10)} style={[{ width: 30, height: 30 }, styles.button]}>
                <Plus stroke="black" width={15} height={15} />
            </Pressable>

            <Pressable onPress={() => alterFontSize(-10)} style={[{ width: 30, height: 30 }, styles.button]}>
                <Minus stroke="black" width={15} height={15} />
            </Pressable>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    text: {
        color: "white",
        fontWeight: "bold",
        textShadowColor: "black",
        textShadowRadius: 2,
        textShadowOffset: { width: 1, height: 1 },
        width: "100%",
        WebkitTextWrap: 'balance',
        WebkitHyphens: 'auto',
        textWrap: 'balance',
        textAlign: 'center',
        verticalAlign: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        maxWidth: "100%",
        maxHeight: "100%",
    },
    button: {
        borderRadius: 20,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        zIndex: 20,
    },
    positionIconView: {
        userSelect: "none",
    },
    impact: {
        textTransform: "uppercase",
        fontFamily: 'Impact',
        fontColor: 'white',
        color: 'white',
        WebkitTextStroke: '2px black',
        textShadowColor: 'black',
        textShadowRadius: 4,
        textShadowOffset: { width: 2, height: 2 },
        overflow: 'hidden',
    }
});

export default EditableText;
