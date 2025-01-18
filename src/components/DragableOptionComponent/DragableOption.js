import { useCallback, useRef } from 'react';
import { useEffect, useState } from 'react';
import { Text, StyleSheet, PanResponder, Platform } from 'react-native';
import {
    GestureHandlerRootView,
    TouchableWithoutFeedback,
} from 'react-native-gesture-handler';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    ReduceMotion,
} from 'react-native-reanimated';

const DragableOption = ({ onArrangeEnd, onStartArrange, containerOffset, blockX = false, blockY = false, initialPosition }) => {

    const [activated, setActivated] = useState(true);

    const [initialPos, setInitialPos] = useState(initialPosition);

    const position = {
        x: useSharedValue(0),
        y: useSharedValue(0),
    };

    const originOffset = useRef({ oX: 0, oY: 0 });

    const dimensions = useRef({ width: 0, height: 0 });

    const returnSpringConfig = {
        duration: 1000,
        dampingRatio: 0.7,
        stiffness: 100,
        overshootClamping: false,
        restDisplacementThreshold: 0.01,
        restSpeedThreshold: 2,
        reduceMotion: ReduceMotion.System,
    };


    /* Pan responder and drag handlers */
    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderStart: (_) => {
                onStartArrange();
                setActivated(true);
            },
            onPanResponderMove: (_, gestureState) =>
                handleDrag(gestureState),
            onPanResponderRelease: (_, gestureState) => {
                endPan(gestureState);
            },
        })
    ).current;

    const getNewPosition = useCallback((gestureState) => {
        const { moveX, moveY } = gestureState;
        const { width, height } = dimensions.current;
        const { oX, oY } = originOffset.current;
        if (Platform.OS === 'web')
            return { x: moveX - oX + initialPos.x - width / 2, y: moveY - oY + initialPos.y - height / 2 };
        return { x: moveX - initialPos.x - width / 2, y: moveY - initialPos.y - height / 2 };
    }, [dimensions, containerOffset, initialPos]);

    // handle drag function
    const handleDrag = useCallback((gestureState) => {
        if (activated) {
            const newPos = getNewPosition(gestureState);
            position.x.value = newPos.x;
            position.y.value = newPos.y;
        }
    }, [activated]);

    // end drag function
    const endPan = useCallback((gestureState) => {
        // send signal to create new object in panel
        const newPos = getNewPosition(gestureState);
        onArrangeEnd(newPos.x + initialPos.x, newPos.y + initialPos.y);

        // Reset position
        position.x.value = withSpring(0, returnSpringConfig);
        position.y.value = withSpring(0, returnSpringConfig);

        // create timeout to reset activated state
        setActivated(false);
        setTimeout(() => setActivated(true), 500);
    }, [position, initialPos]);

    // animated style
    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: position.x.value },
            { translateY: position.y.value },
        ],
    }));

    return (
        <GestureHandlerRootView
            onLayout={(event) => {
                const { width, height, x, y, top, left } = event.nativeEvent.layout;
                originOffset.current = { oX: x + (left | 0) + width / 2, oY: y + (top | 0) + height / 2 };
            }}
            style={[styles.container, { top: initialPos.y, left: initialPos.x }]}>
            <TouchableWithoutFeedback
                onGestureEvent={handleDrag}
                onEnded={endPan}
                maxPointers={1}>
                <Animated.View
                    style={[styles.draggableBox, animatedStyle]}
                    {...panResponder.panHandlers}
                    onLayout={(event) => {
                        const { width, height } = event.nativeEvent.layout;
                        dimensions.current = { width, height };
                    }}>
                    <Text style={styles.draggableText}>💬</Text>
                </Animated.View>
            </TouchableWithoutFeedback>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#f5f5f5',
        position: 'absolute',
    },
    draggableBox: {
        width: 75,
        height: 75,
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