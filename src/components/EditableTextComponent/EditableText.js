import { useState } from "react";
import { StyleSheet, TextInput } from "react-native";
import { TapGestureHandler } from "react-native-gesture-handler";
import Animated, { useAnimatedStyle } from "react-native-reanimated";

const EditableText = ({ item, index, height, width, rotation }) => {

    const [ value, setValue ] = useState(item.value);

    // Flag to check if the component is being edited
    const [isEditing, setIsEditing] = useState(false);

    const updateValue = (text) => {
        setValue(text);
        item.value = text;
    }

    // animated size style for the inner component shown
    const resizeAnimationStyle = useAnimatedStyle(() => ({
        height: height.value,
        width: width.value,
        fontSize: (height.value + width.value / 2) / 2 * 0.5
    }))

    // animated rotation style for the inner component shown
    const rotationAnimationStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: rotation.value + 'deg' }],
    }))

    return (
        <TapGestureHandler
            onHandlerStateChange={({ nativeEvent }) => {
                if (nativeEvent.state === 4) {
                    // handle double tap
                    setIsEditing(true);
                }
            }}
            numberOfTaps={2}
        >
            {/* Label/Input View */}
            <Animated.View style={[resizeAnimationStyle, rotationAnimationStyle]}>
                {isEditing ? (
                    <TextInput
                        aria-label={`text-input-${index}`}
                        style={[{ ...styles.impact, textAlign: 'center', fontSize: (height.value + width.value / 4) * 0.5 },
                            resizeAnimationStyle,
                        StyleSheet.absoluteFill]}
                        value={value}
                        onChangeText={updateValue}
                        onBlur={() => setIsEditing(false)}
                        autoFocus
                    />
                ) : (
                    <Animated.Text
                        style={[{ textAlign: 'center', verticalAlign: 'center', flex: 1, alignContent: 'center' }, StyleSheet.absoluteFill, resizeAnimationStyle, styles.impact]}
                        selectable={false}>
                        {value}
                    </Animated.Text>
                )}
            </Animated.View>
        </TapGestureHandler>
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
    },
    positionIconView: {
        userSelect: "none",
    },
    impact: {
        textTransform: "uppercase",
        fontFamily: 'Impact',
        fontColor: 'white',
        color: 'white',
        webkitTextStroke: '2px black',
        textShadowColor: 'black',
        textShadowRadius: 4,
        textShadowOffset: { width: 2, height: 2 },
    }
});

export default EditableText;
