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

const DragableOption = ({ onArrangeEnd, initialPosition, children, canMove = true, blockDragX = false, blockDragY = false, animateButton = true, limitDistance = 0, style = {} }) => {

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
        const { moveX, moveY, dx, dy } = gestureState;
        const { width, height } = dimensions.current;
        const result = { x: moveX - (width * scale.value) / 2, y: moveY - (height * scale.value) / 2 };
        if (limitDistance > 0 && (Math.abs(initialPosition.x - result.x) > limitDistance || Math.abs(initialPosition.y - result.y) > limitDistance))
            return { x: position.x.value, y: position.y.value };
        return result;
    }, [dimensions]);

    // handle drag function
    const onDrag = useCallback((gestureState) => {
        if (scale.value == 1.0 && animateButton)
            scale.value = withSpring(1.5, scaleSpringConfig)

        const newPos = getNewPosition(gestureState);
        if (!blockDragX)
            position.x.value = newPos.x;
        if (!blockDragY)
            position.y.value = newPos.y;
    }, []);

    // end drag function
    const onDragRelease = useCallback((gestureState) => {
        // send signal to create new object in panel
        const newPos = getNewPosition(gestureState);
        const movedEnough = newPos.x > 0 && newPos.y > 0 &&
            (limitDistance > 0 ||
                (Math.abs(newPos.x - initialPosition.x) > 100 ||
                    Math.abs(newPos.y - initialPosition.y) > 100));
        if (!!onArrangeEnd && movedEnough)
            onArrangeEnd(newPos.x, newPos.y, "Label");

        // Reset position
        position.x.value = withSpring(initialPosition.x, returnSpringConfig);
        position.y.value = withSpring(initialPosition.y, returnSpringConfig);

        // Reset scale
        if (animateButton)
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
            style={[canMove && dragAnimatedStyle, style]}
            {...panResponder.panHandlers}
            onLayout={(event) => {
                const { width, height } = event.nativeEvent.layout;
                dimensions.current = { width, height };
            }}>
            {children}
        </Animated.View>
    );
}

export default DragableOption;