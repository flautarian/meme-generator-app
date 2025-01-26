import { useCallback, useRef } from 'react';
import { Text, StyleSheet, PanResponder, Platform, View } from 'react-native';
import { MessageSquare } from 'react-native-feather';
import {
    GestureHandlerRootView,
    Pressable,
} from 'react-native-gesture-handler';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    ReduceMotion,
} from 'react-native-reanimated';

const DragableOption = ({ onArrangeEnd, initialPosition }) => {

    const activated = useSharedValue(true);

    const position = {
        x: useSharedValue(0),
        y: useSharedValue(0),
    };

    const scale = useSharedValue(1);

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

    const scaleSpringConfig = {
        duration: 150,
        dampingRatio: 0.7,
        stiffness: 100,
    };

    /* Pan responder and drag handlers */
    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderStart: (_, gestureState) => {
                onDragStart(gestureState);
                activated.value = true;
            },
            onPanResponderMove: (_, gestureState) =>
                onDrag(gestureState),
            onPanResponderRelease: (_, gestureState) => {
                onDragRelease(gestureState);
            },
        })
    ).current;

    const getNewPosition = useCallback((gestureState) => {
        const { moveX, moveY } = gestureState;
        const { width, height } = dimensions.current;
        const { oX, oY } = originOffset.current;

        if (Platform.OS === 'web')
            return { x: moveX - oX + initialPosition.x - width / 2, y: moveY - oY + initialPosition.y - height / 2 };
        return { x: moveX - initialPosition.x - width / 2, y: moveY - initialPosition.y - height / 2 };
    }, [dimensions, initialPosition]);

    // handle drag function
    const onDrag = useCallback((gestureState) => {
        if (activated.value) {
            const newPos = getNewPosition(gestureState);
            position.x.value = newPos.x;
            position.y.value = newPos.y;
        }
    }, [activated]);

    // start drag function
    const onDragStart = useCallback((gestureState) => {
        // Scale the component
        scale.value = withSpring(1.5, scaleSpringConfig);
    }, [scale]);


    // end drag function
    const onDragRelease = useCallback((gestureState) => {
        // send signal to create new object in panel
        const newPos = getNewPosition(gestureState);
        onArrangeEnd(newPos.x + initialPosition.x, newPos.y + initialPosition.y);

        // Reset position
        position.x.value = withSpring(0, returnSpringConfig);
        position.y.value = withSpring(0, returnSpringConfig);

        // Reset scale
        scale.value = withSpring(1, scaleSpringConfig);

        // create timeout to reset activated state
        activated.value = false;
        setTimeout(() => activated.value = true, 500);
    }, [position, initialPosition, activated]);

    // animated style
    const dragAnimatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: position.x.value },
            { translateY: position.y.value },
            { scaleX: scale.value },
            { scaleY: scale.value },
        ],
        position: 'absolute',
    }));

    return (
        <View
            onLayout={(event) => {
                const { width, height, x, y, top, left } = event.nativeEvent.layout;
                originOffset.current = { oX: x + (left | 0) + width / 2, oY: y + (top | 0) + height / 2 };
            }}
            style={[styles.container, { top: initialPosition.y, left: initialPosition.x }]}>
            <Animated.View
                style={[styles.draggableBox, dragAnimatedStyle]}
                {...panResponder.panHandlers}
                onLayout={(event) => {
                    const { width, height } = event.nativeEvent.layout;
                    dimensions.current = { width, height };
                }}>
                <Pressable maxPointers={1}>
                    <MessageSquare stroke="black" fill="#fff" width={40} height={40} />
                </Pressable>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        zIndex: 10,
    },
    draggableBox: {
        width: 60,
        height: 60,
        backgroundColor: 'blue',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 50,
        zIndex: 10,
    },
});

export default DragableOption;