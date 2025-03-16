import { useEffect } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useDerivedValue, useSharedValue, withRepeat, withSequence, withTiming } from "react-native-reanimated";

export const Circle = ({ circle }) => {

    const { key, index, color, radius, initX, initY, alpha } = circle;

    const { width, height } = useWindowDimensions();

    const rotation = useSharedValue(0);

    useEffect(() => {
        const randRotation = Math.random() * 360;

        rotation.set(withRepeat(
            withSequence(
                withTiming(randRotation, { duration: 0, easing: Easing.linear }),
                withTiming(randRotation + 360, { duration: 7500, easing: Easing.linear })
            ),
            -1, // infinity
            false // no reverse
        ));
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { rotate: rotation.get() + 'deg' },
        ],
        zIndex: -2,
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