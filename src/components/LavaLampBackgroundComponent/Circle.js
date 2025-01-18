import { useEffect } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useDerivedValue, useSharedValue, withRepeat, withSequence, withTiming } from "react-native-reanimated";

export const Circle = ({ circle }) => {

    const { key, index, color, radius, initX, initY, alpha } = circle;

    const { width, height } = useWindowDimensions();

    const rotation = useSharedValue(0);

    useEffect(() => {
        const randRotation = Math.random() * 360;

        rotation.value = withRepeat(
            withSequence(
                withTiming(randRotation, { duration: 0, easing: Easing.linear }),
                withTiming(randRotation + 360, { duration: 50000, easing: Easing.linear })
            ),
            -1, // infinity
            false // no reverse
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { rotate: rotation.value + 'deg' },
        ],
    }));

    return (
        <Animated.View
            style={[
                { ...StyleSheet.absoluteFillObject },
                { width, height },
                { transformOrigin: ["50%", initY, 0] },
                animatedStyle]}>
            <View
                style={[
                    {
                        backgroundColor: color,
                        width: radius * 2,
                        height: radius * 2,
                        borderRadius: radius,
                        opacity: alpha,
                        top: initY - radius,
                        left: initX - radius,
                        position: 'absolute',
                    }
                ]}
            />
        </Animated.View>
    );
};