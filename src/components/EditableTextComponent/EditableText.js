import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Pressable, StyleSheet, TextInput } from "react-native";
import { TapGestureHandler } from "react-native-gesture-handler";
import Animated, { useAnimatedStyle, useSharedValue } from "react-native-reanimated";
import { useTranslation } from 'react-i18next';
import 'assets/fonts/impact.ttf';
import { Minus, Plus } from "react-native-feather";
import { useConfig } from "src/contexts/ConfigContext";

const EditableText = ({ item, index }) => {

    const { t } = useTranslation();

    const [value, setValue] = useState(item.value);

    const { selectedTextIndex } = useConfig();

    const [isEditing, setIsEditing] = useState(false);

    const fontSizeRef = useRef(item.fontSize);

    const fontSize = useSharedValue(fontSizeRef.current);

    const { config } = useConfig();

    const dimensions = { width: useSharedValue(0), height: useSharedValue(0) };

    // animated size style for the inner component shown
    const resizeAnimationStyle = useAnimatedStyle(() => ({
        height: "100%",
        width: "100%",
        flexShrink: 1,
        backgroundColor: 'transparent',
        fontSize: config?.fontAutoResize ? Math.max((dimensions.height.get() + dimensions.width.get() / 2) / 4 - value.split(" ").length * 5, 10) : fontSize.value,
        zIndex: 15,
    }));

    const updateValue = useCallback((text) => {
        setValue(text);
        item.value = text;
    }, [item]);

    const alterFontSize = useCallback((point) => {
        const newFontSize = fontSize.value + point;
        if (newFontSize < 10 || newFontSize > 100) return;
        fontSize.value = newFontSize;
        item.fontSize = newFontSize;
    }, [fontSize]);


    const onComponentLayout = useCallback((event) => {
        const { width, height } = event.nativeEvent.layout;
        dimensions.width.value = width;
        dimensions.height.value = height;
    }, [dimensions]);

    const getFontFamily = useCallback(() => {
        switch (config?.fontType) {
            case 'Impact':
                return { fontFamily: 'Impact' };
            case 'Arial':
                return { fontFamily: 'Arial' };
            case 'Courier':
                return { fontFamily: 'Courier' };
            case 'Comic Sans MS':
                return { fontFamily: 'Comic Sans MS' };
            default:
                return { fontFamily: 'Impact' };
        }
    }, [config?.fontType]);


    const styles = useMemo(() => StyleSheet.create({
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

            cursor: 'pointer',
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
        font: {
            textTransform: "uppercase",
            fontColor: 'white',
            color: 'white',
            WebkitTextStroke: '2px black',
            textShadowColor: 'black',
            textShadowRadius: 4,
            textShadowOffset: { width: 2, height: 2 },
            overflow: 'hidden',
        }
    }), []);

    return (
        <Animated.View style={[resizeAnimationStyle]} selectable={false} draggable={false} key={`editable-text-${index}`} onLayout={onComponentLayout}>
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
                        style={[{ ...styles.font, ...getFontFamily(), textAlign: 'center', fontSize: config?.fontAutoResize ? Math.max((dimensions.height.get() + dimensions.width.get() / 2) / 4 - value.split(" ").length * 5, 10) : fontSize.value, color: 'white', backgroundColor: 'transparent' },

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
                        style={[styles.text, StyleSheet.absoluteFill, styles.font, getFontFamily(), resizeAnimationStyle]}
                        selectable={false}
                        draggable={false}>
                        {value}
                    </Animated.Text>
                )}
            </TapGestureHandler>

            {!config?.fontAutoResize && index === selectedTextIndex && <Pressable onPress={() => alterFontSize(10)} style={[{ width: 30, height: 30, position: 'absolute', bottom: "10%", left: "65%" }, styles.button]}>
                <Plus stroke="black" width={15} height={15} />
            </Pressable>}

            {!config?.fontAutoResize && index === selectedTextIndex && <Pressable onPress={() => alterFontSize(-10)} style={[{ width: 30, height: 30, position: 'absolute', bottom: "10%", left: "25%" }, styles.button]}>
                <Minus stroke="black" width={15} height={15} />
            </Pressable>}
        </Animated.View>
    );
};

export default EditableText;
