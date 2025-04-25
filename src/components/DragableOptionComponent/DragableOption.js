import { useState } from 'react';
import { memo, useCallback, useEffect, useMemo, useRef } from 'react';
import { PanResponder } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    ReduceMotion,
} from 'react-native-reanimated';

const DragableOption = memo(({
    onArrangeEnd = null,
    onArrangeInit = null,
    initialPosition,
    children,
    canMove = true,
    blockDragX = false,
    blockDragY = false,
    animateButton = true,
    limitDistance = 0,
    style = {},
}) => {

    const [returnPosition, setReturnPosition] = useState({ x: initialPosition.x, y: initialPosition.y });

    const position = {
        x: useSharedValue(initialPosition.x),
        y: useSharedValue(initialPosition.y)
    };

    // Sync the internal position with the initial position prop
    useEffect(() => {
        setReturnPosition({ x: initialPosition.x, y: initialPosition.y });
        position.x.set(withSpring(initialPosition.x));
        position.y.set(withSpring(initialPosition.y));
    }, [initialPosition]);

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
            onPanResponderStart: (_, gestureState) => {
                if (!!onArrangeInit)
                    onArrangeInit();
            },
            onPanResponderMove: (_, gestureState) => {
                if (canMove)
                    onDrag(gestureState);
            },
            onPanResponderRelease: (_, gestureState) => {
                onDragRelease(gestureState);
            },
        })
    ).current;

    const getNewPosition = useCallback((gestureState) => {
        const { moveX, moveY, dx, dy } = gestureState;
        const { width, height } = dimensions.current;
        const result = { x: moveX - (width * scale.value) / 2, y: moveY - (height * scale.value) / 2 };
        /* if (limitDistance > 0 && (
            Math.abs(
                initialPosition.x - result.x
            ) > limitDistance ||
            Math.abs(
                initialPosition.y - result.y
            ) > limitDistance))
            return { x: position.x.get(), y: position.y.get() }; */
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
    }, [position]);

    // end drag function
    const onDragRelease = useCallback((gestureState) => {
        // send signal to create new object in panel
        const newPos = getNewPosition(gestureState);
        const absInitialPosition = { x: Math.abs(position.x.get()), y: Math.abs(position.y.get()) };
        const movedEnough = newPos.x != 0 && newPos.y != 0 &&
            (limitDistance > 0 ||
                (Math.abs(newPos.x - absInitialPosition.x) > limitDistance ||
                    Math.abs(newPos.y - absInitialPosition.y) > limitDistance));
        console.log("Moved enough", movedEnough, newPos.y, absInitialPosition.y, Math.abs(newPos.y - absInitialPosition.y));
        // if moved enough, call onArrangeEnd function
        if (!!onArrangeEnd && movedEnough)
            onArrangeEnd(newPos.x, newPos.y, "Label");

        // Reset position
        position.x.set(withSpring(returnPosition.x, returnSpringConfig));
        position.y.set(withSpring(returnPosition.y, returnSpringConfig));

        // Reset scale
        if (animateButton)
            scale.value = withSpring(1, scaleSpringConfig);
    }, [position]);

    // animated style
    const dragAnimatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: position?.x.get() },
            { translateY: position?.y.get() },
            { scaleX: scale.value },
            { scaleY: scale.value },
        ],
        position: 'absolute',
    }));

    return (
        <Animated.View
            style={[dragAnimatedStyle, style]}
            {...panResponder.panHandlers}
            onLayout={(event) => {
                const { width, height } = event.nativeEvent.layout;
                dimensions.current = { width, height };
            }}>
            {children}
        </Animated.View>
    );
});

export default DragableOption;