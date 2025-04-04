import { useState } from "react";
import { StyleSheet, TextInput } from "react-native";
import { TapGestureHandler } from "react-native-gesture-handler";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { useTranslation } from 'react-i18next';
import { useCallback } from "react";

const EditableText = ({ item, index, height, width, rotation }) => {

    const { t } = useTranslation();

    const [value, setValue] = useState(item.value);

    const [isEditing, setIsEditing] = useState(false);

    // animated size style for the inner component shown
    const resizeAnimationStyle = useAnimatedStyle(() => ({
        maxHeight: height.value,
        height: height.value * 0.9,
        flexShrink: 1,
        maxWidth: width.value,
        width: width.value * 0.9,
        fontSize: (height.value + width.value / 2) / 4 - value.split(" ").length * 5,
        zIndex: 15,
    }));

    const updateValue = useCallback((text) => {
        setValue(text);
        item.value = text;
    }, [item]);

    // animated rotation style for the inner component shown
    const rotationAnimationStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: rotation.value + 'deg' }],
    }));

    return (
        <Animated.View style={[resizeAnimationStyle, rotationAnimationStyle]} selectable={false} draggable={false} key={`editable-text-${index}`}>
            <TapGestureHandler
                onHandlerStateChange={({ nativeEvent }) => {
                    if (nativeEvent.state === 4) {
                        // handle double tap
                        setIsEditing(true);
                    }
                }}
                numberOfTaps={2}
                draggable={false}
            >
                {isEditing ? (
                    <TextInput
                        aria-label={t('editableText.ariaLabel')}
                        style={[{ ...styles.impact, textAlign: 'center' },
                        resizeAnimationStyle.initial.value,
                        StyleSheet.absoluteFill]}
                        value={value}
                        onChangeText={updateValue}
                        onBlur={() => setIsEditing(false)}
                        autoFocus
                        adjustsFontSizeToFit={true}
                        numberOfLines={1}
                        tooltip={t('editableText.placeholder')}
                        draggable={false}
                    />
                ) : (
                    <Animated.Text
                        style={[styles.text, StyleSheet.absoluteFill, resizeAnimationStyle, styles.impact]}
                        selectable={false} draggable={false}
                        adjustsFontSizeToFit={true}>
                        {value}
                    </Animated.Text>
                )}
            </TapGestureHandler>
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
    }
});

export default EditableText;
