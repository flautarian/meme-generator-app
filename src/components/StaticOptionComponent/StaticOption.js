import React, { useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { Pressable } from 'react-native-gesture-handler';
import Animated, {
    useSharedValue,
    withSpring,
    useAnimatedStyle,
} from 'react-native-reanimated';

const StaticOption = ({ onPress, initialPosition, children, offsetYAzis = useSharedValue(0), style }) => {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { scale: scale.value },
                { translateY: initialPosition.y + offsetYAzis.value },
                { translateX: initialPosition.x },
            ],
        };
    });

    const handlePressIn = () => {
        scale.value = withSpring(0.7); // Scale down on press
    };

    const handlePressOut = () => {
        scale.value = withSpring(1); // Scale back to original size
        onPress();
    };

    return (
        <Animated.View style={[style, styles.captureBox, animatedStyle]}>
            <View style={styles.container}>
                <Pressable
                    maxPointers={1}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                >
                    {children}
                </Pressable>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        zIndex: 9,
    },
    captureBox: {
        position: 'absolute',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: 60,
        height: 60,
        borderRadius: 50,
        zIndex: 10,
    },
});

export default StaticOption;
