import { useEffect, useState } from 'react';
import { Text, StyleSheet } from 'react-native';
import {
    GestureHandlerRootView,
    PanGestureHandler,
} from 'react-native-gesture-handler';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
} from 'react-native-reanimated';

const DRAG_LIMIT = 150;

const DragableOption = ({ onArrange }) => {

    const [activated, setActivated] = useState(true);

    useEffect(() => {
        if(!activated)
            setTimeout(() => setActivated(true), 500);
    }, [activated]);

    const position = {
        x: useSharedValue(0),
        y: useSharedValue(0),
    };

    const handlePan = (event) => {
        let nativeEvent = event.nativeEvent;
        const distance = Math.sqrt(
            nativeEvent.translationX ** 2 + nativeEvent.translationY ** 2
        );

        if (distance <= DRAG_LIMIT) {
            position.x.value = nativeEvent.translationX;
            position.y.value = nativeEvent.translationY;
        }
        else {
            setActivated(false);
            onArrange(nativeEvent.absoluteX, nativeEvent.absoluteY);
            position.x.value = withSpring(0); // Reset position
            position.y.value = withSpring(0);
            return;
        }
    };

    const endPan = (event) => {
        const finalX = event.translationX;
        const finalY = event.translationY;

        // Check if within the limit and execute external function
        const distance = Math.sqrt(finalX ** 2 + finalY ** 2);
        if (distance <= DRAG_LIMIT && typeof onArrange === 'function') {
            onArrange({ x: finalX, y: finalY });
        }

        // Reset position
        position.x.value = withSpring(0);
        position.y.value = withSpring(0);
    };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: position.x.value },
            { translateY: position.y.value },
        ],
    }));

    return (
        <GestureHandlerRootView style={styles.container}>
            <PanGestureHandler onGestureEvent={handlePan} onEnded={endPan} enabled={activated} maxPointers={1}>
                <Animated.View style={[styles.draggableBox, animatedStyle]}>
                    <Text style={styles.draggableText}>💬</Text>
                </Animated.View>
            </PanGestureHandler>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#f5f5f5',
        flex: 1,
    },
    draggableBox: {
        width: 100,
        height: 100,
        backgroundColor: 'blue',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 3,
        position: 'absolute',
    },
    draggableText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});

export default DragableOption;