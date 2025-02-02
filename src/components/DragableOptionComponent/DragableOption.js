import { useCallback, useRef } from 'react';
import { StyleSheet, PanResponder, Platform, View } from 'react-native';
import { MessageSquare } from 'react-native-feather';
import { Pressable } from 'react-native-gesture-handler';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    ReduceMotion,
} from 'react-native-reanimated';

const DragableOption = ({ onArrangeEnd, onDoubleTap, initialPosition, children, canMove = true }) => {

    const position = {
        x: useSharedValue(initialPosition.x),
        y: useSharedValue(initialPosition.y),
    };

    const scale = useSharedValue(1);

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
        return { x: moveX - (width * scale.value) / 2, y: moveY - (height * scale.value) / 2 };
    }, [dimensions]);

    // handle drag function
    const onDrag = useCallback((gestureState) => {
        if (scale.value == 1.0)
            scale.value = withSpring(1.5, scaleSpringConfig)

        const newPos = getNewPosition(gestureState);
        position.x.value = newPos.x;
        position.y.value = newPos.y;
    }, []);

    // end drag function
    const onDragRelease = useCallback((gestureState) => {
        // send signal to create new object in panel
        const newPos = getNewPosition(gestureState);
        if (!!onArrangeEnd)
            onArrangeEnd(newPos.x, newPos.y);

        // Reset position
        position.x.value = withSpring(initialPosition.x, returnSpringConfig);
        position.y.value = withSpring(initialPosition.y, returnSpringConfig);

        // Reset scale
        scale.value = withSpring(1, scaleSpringConfig);
    }, [position]);

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
        <Animated.View
            style={[styles.draggableBox, canMove && dragAnimatedStyle]}
            {...panResponder.panHandlers}
            onLayout={(event) => {
                const { width, height } = event.nativeEvent.layout;
                dimensions.current = { width, height };
            }}>
            {children}
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    draggableBox: {
        transformOrigin: '0% 0%',
        zIndex: 10,
        width: 60,
        height: 60,
        backgroundColor: 'blue',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 50,
    },
});

export default DragableOption;