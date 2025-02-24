import { useState } from "react";
import { StyleSheet, TextInput } from "react-native";
import { TapGestureHandler } from "react-native-gesture-handler";
import Animated, { useAnimatedStyle } from "react-native-reanimated";

const EditableText = ({ item, index, height, width, rotation }) => {

    const [value, setValue] = useState(item.value);

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
        //fontSize: (height.value + width.value / 2) / 4 - value.split(" ").length * 5,
        zIndex: 3,
    }))

    // animated rotation style for the inner component shown
    const rotationAnimationStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: rotation.value + 'deg' }],
    }))

    return (
        <Animated.View style={[resizeAnimationStyle, rotationAnimationStyle]}>
            <TapGestureHandler
                onHandlerStateChange={({ nativeEvent }) => {
                    if (nativeEvent.state === 4) {
                        // handle double tap
                        setIsEditing(true);
                    }
                }}
                numberOfTaps={2}
            >
                {isEditing ? (
                    <TextInput
                        aria-label={`text-input-${index}`}
                        style={[{ ...styles.impact, textAlign: 'center' },
                            resizeAnimationStyle,
                        StyleSheet.absoluteFill]}
                        value={value}
                        onChangeText={updateValue}
                        onBlur={() => setIsEditing(false)}
                        autoFocus
                        adjustsFontSizeToFit={true}
                        numberOfLines={1}
                    />
                ) : (
                    <Animated.Text
                        style={[{ textAlign: 'center', verticalAlign: 'center', flex: 1, alignContent: 'center', borderBlockColor: 'yellow' }, StyleSheet.absoluteFill, resizeAnimationStyle, styles.impact]}
                        selectable={false}
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
