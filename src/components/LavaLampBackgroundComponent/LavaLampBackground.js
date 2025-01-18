import { StyleSheet, useWindowDimensions } from 'react-native';
import { useEffect, useMemo } from 'react';
import Animated, { interpolate, interpolateColor, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import randomColor from 'randomcolor';
import { Circle } from './Circle';
import { BlurView } from 'expo-blur';

const LavaLampBackground = ({ count = 10, hue = 'green'}) => {

    const progress = useSharedValue(0);

    const { width, height } = useWindowDimensions();

    const getRandomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

    // Trigger the gradient animation
    useEffect(() => {
        progress.value = withTiming(1, { duration: 3000 }); // Animate from 0 to 1 in 3 seconds
    }, []);

    const circles = useMemo(() => {
        const colors = randomColor({ count: count, luminosity: 'light', hue: hue });
        return colors.map((color, index) => {
            let rand = getRandomNumber(5, 12) / 10;
            let radius = (width * rand) / 2;

            return {
                key: index,
                index,
                color,
                alpha: 0.5,
                initX: Math.random() * (width - radius * 2),
                initY: Math.random() * (height - radius * 2),
                radius: radius,
            }
        });
    }, [count]);

    return (

        <Animated.View style={[StyleSheet.absoluteFillObject, {backgroundColor: hue}]}>
            {circles.map((circle, index) => (
                <Circle key={`circle-color-${circle.color}-index-${index}`} circle={circle} />
            ))}
            <BlurView style={StyleSheet.absoluteFillObject} intensity={100} blurType="light" experimentalBlurMethod='overlay' />
        </Animated.View>
    );
};

export default LavaLampBackground;