import React from 'react';
import {
    Gesture,
    GestureDetector,
    GestureHandlerRootView,
} from 'react-native-gesture-handler';
import { Dimensions, Image, Pressable, StyleSheet, Text } from 'react-native';
import Animated, {
    Easing,
    interpolateColor,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

const EASING = Easing.bezier(1, -1, 0.3, 1.43);

const TemplateItem = ({ template, onSelectMeme }) => {
    const { img, name } = template;

    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);

    const progress = useSharedValue(0);

    const startX = useSharedValue(0);
    const startY = useSharedValue(0);

    const hover = Gesture.Hover()
        .onStart((event) => {
            startX.value = event.x;
            startY.value = event.y;
        })
        .onUpdate((event) => {
            translateX.value = (event.x - startX.value) * 0.1;
            translateY.value = (event.y - startY.value) * 0.1;

            const distance = Math.sqrt(Math.pow(translateX.value, 2) + Math.pow(translateY.value, 2));

            progress.value = distance / 35;
        })
        .onEnd(() => {
            translateX.value = withTiming(0, {
                duration: 400,
                easing: EASING,
            });
            translateY.value = withTiming(0, {
                duration: 400,
                easing: EASING,
            });
            progress.value = withTiming(0, {
                duration: 400,
                easing: EASING,
            });
        });

    const boxAnimatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: translateX.value },
            { translateY: translateY.value },
        ],
        backgroundColor: interpolateColor(
            progress.value,
            [0, 1],
            ['#b58df1', '#fa7f7c']
        )
    }));

    return (
        <GestureHandlerRootView style={styles.container}>
            <GestureDetector gesture={hover}>
                <Pressable onPress={() => onSelectMeme(template)}>
                    <Animated.View style={[styles.box, boxAnimatedStyle]}>
                        <Image src={img} source={img} name={name} style={styles.imageItem} resizeMode='stretch' />
                    </Animated.View>
                </Pressable>
            </GestureDetector>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    box: {
        width: (width * 30) / 100,
        borderRadius: 20,
        cursor: 'pointer',
    },
    imageItem: {
        width: (width * 30) / 100,
        aspectRatio: 3 / 2,
        borderRadius: 10,
    },
});

export default TemplateItem;