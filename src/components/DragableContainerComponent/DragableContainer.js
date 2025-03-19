import React, { useCallback, useEffect, useRef, useState, Children, cloneElement } from 'react';
import { View, PanResponder, Pressable, Dimensions, StyleSheet, Text } from 'react-native';
import { Move, RotateCcw, Square, Trash2 } from "react-native-feather";
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';

const DragableContainer = ({ item, index, selected, onSelect, onDelete, children }) => {
    // Position of the component
    const position = {
        x: useSharedValue(-1000),
        y: useSharedValue(-1000),
    };

    // Used to keep track of the origin offset of the component
    const originOffset = useRef({ oX: 0, oY: 0 });

    // Content view dimensions and rotation
    const contentView = {
        height: useSharedValue(item.height),
        width: useSharedValue(item.width),
        rotation: useSharedValue(item.rotation)
    };

    // Init height of the component
    const initHeight = useSharedValue(0);

    // Init width of the component
    const initWidth = useSharedValue(0);

    // Init rotation of the component
    const initRotation = useSharedValue(0);

    // Size of the buttons
    const buttonsSize = 30;

    // Used to force re-render of the component because IOS doesn't make a re render when size of the component changes
    const [layoutKey, setLayoutKey] = useState(0);

    // Dimensions of the component
    const dimensions = { width: useSharedValue(0), height: useSharedValue(0) };

    // Window dimensions
    const windowDimensions = useRef(Dimensions.get('window'));

    // State to track if buttons should be above
    const [buttonsAbove, setButtonsAbove] = useState(false);

    // Check if container is too close to bottom
    const checkButtonsPosition = useCallback(() => {
        const containerBottom = position.y.get() + contentView.height.get();
        const windowHeight = windowDimensions.current.height;
        const threshold = windowHeight - 100; // Adjusted threshold
        setButtonsAbove(containerBottom > threshold);
    }, []);

    // Get new position of the component
    const getNewPosition = useCallback((gestureState) => {
        let { moveX, moveY } = gestureState;
        let { height } = dimensions;
        let { oX, oY } = originOffset.current;
        return { x: moveX - oX, y: moveY - oY - height.get() / 2 + buttonsSize / 2 };
    }, [dimensions]);

    const handleDrag = useCallback((gestureState) => {
        const { x, y } = getNewPosition(gestureState);
        position.x.set(x);
        position.y.set(y + ((contentView.height.get() / 2) * (buttonsAbove ? 1 : -1)));
        if (!!item) {
            item.x = x;
            item.y = y + ((contentView.height.get() / 2) * (buttonsAbove ? 1 : -1));
        }
        checkButtonsPosition();
    }, [position, checkButtonsPosition, buttonsAbove]);

    // Pan responder for the drag
    const dragViewpanResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderMove: (_, gestureState) =>
                handleDrag(gestureState),
        })
    ).current;

    // handle resize function
    const handleResizeY = useCallback((gestureState, y0) => {
        let newValue = y0 ? gestureState.y0 - gestureState.moveY : gestureState.moveY - gestureState.y0;
        const newHeight = Math.max(newValue + initHeight.get(), 25);
        contentView.height.set(newHeight);
        if (newHeight > 25 && y0)
            position.y.set(gestureState.moveY - (y0 ? -1 * buttonsSize / 2 : buttonsSize / 2));
        if (!!item)
            item.height = newHeight;
        checkButtonsPosition();
    }, [contentView, dimensions, checkButtonsPosition]);

    // Pan responder for the resize Y
    const resizeYViewpanResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderMove: (_, gestureState) =>
                handleResizeY(gestureState, false),
            onPanResponderRelease: (_, gestureState) => {
                initHeight.set(contentView.height.get());
                setLayoutKey((prevKey) => prevKey + 1);
            },
        })
    ).current;

    // Pan responder for the resize Y (final Y)
    const resizeYFinalViewpanResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderMove: (_, gestureState) =>
                handleResizeY(gestureState, true),
            onPanResponderRelease: (_, gestureState) => {
                initHeight.set(contentView.height.get());
                setLayoutKey((prevKey) => prevKey + 1);
            },
        })
    ).current;

    // handle resize function
    const handleResizeX = useCallback((gestureState, x0) => {
        let newValue = x0 ? gestureState.x0 - gestureState.moveX : gestureState.moveX - gestureState.x0;
        const newWidth = Math.max(newValue + initWidth.get(), 25);
        contentView.width.set(newWidth);
        if (newWidth > 25 && x0)
            position.x.set(gestureState.moveX - (x0 ? -1 * buttonsSize / 2 : buttonsSize / 2));
        if (!!item)
            item.width = newWidth;
        checkButtonsPosition();
    }, [contentView, checkButtonsPosition]);

    // Pan responder for the resize X
    const resizeXViewpanResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderMove: (_, gestureState) =>
                handleResizeX(gestureState, false),
            onPanResponderRelease: (_, gestureState) => {
                initWidth.set(contentView.width.get());
                setLayoutKey((prevKey) => prevKey + 1);
            },
        })
    ).current;

    // Pan responder for the resize X (final X)
    const resizeXFinalViewpanResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderMove: (_, gestureState) =>
                handleResizeX(gestureState, true),
            onPanResponderRelease: (_, gestureState) => {
                initWidth.set(contentView.width.get());
                setLayoutKey((prevKey) => prevKey + 1);
            },
        })
    ).current;

    // handle rotate function
    const onRotate = useCallback((gestureState) => {
        let newValue = gestureState.x0 - gestureState.moveX;
        contentView.rotation.set(newValue + initRotation.get());
        if (!!item)
            item.rotation = contentView.rotation.get();
    }, [contentView]);

    // Pan responder for the rotate
    const rotateViewpanResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderMove: (_, gestureState) =>
                onRotate(gestureState),
            onPanResponderRelease: (_, gestureState) => {
                initRotation.set(contentView.rotation.get());
            },
        })
    ).current;

    // animated translation style for main Animated.View
    const dragAnimationStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: position.x.get() },
            { translateY: position.y.get() },
        ],
        position: 'absolute',
    }));

    // Init position of the component
    useEffect(() => {
        position.x.set(item.x);
        position.y.set(item.y);

        initHeight.set(contentView.height.get());
        initWidth.set(contentView.width.get());
        initRotation.set(contentView.rotation.get());
        checkButtonsPosition();
    }, []);

    // Get the layout of the component
    const onComponentLayout = useCallback((event) => {
        const { width, height, x, y, top, left } = event.nativeEvent.layout;
        originOffset.current = { oX: x + (left | 0) + width / 2, oY: y + (top | 0) + height / 2 };
        dimensions.width.set(width);
        dimensions.height.set(height);
        checkButtonsPosition();
    }, [dimensions, checkButtonsPosition]);

    const childrenWithProps = useRef(Children.map(children, (child) =>
        cloneElement(child, { item: item, index: index, height: contentView.height, width: contentView.width, rotation: contentView.rotation })
    ));

    return (
        <Animated.View
            selectable={false}
            style={[dragAnimationStyle, { zIndex: selected ? 15 : 3 }]}
            key={`dragable-text-${index}-layoutKey-${layoutKey}`}
            onLayout={onComponentLayout}>
            <Pressable
                onPress={() => onSelect(index)}
                style={[styles.container, { borderColor: selected ? '#fa7f7c' : 'transparent' }]}>
                {childrenWithProps.current}
                <View style={[{visibility: selected ? 'visible' : 'hidden', opacity: selected ? 1 : 0}, styles.buttonsContainer, buttonsAbove && styles.buttonsAbove]}>
                    <View {...rotateViewpanResponder.panHandlers} style={[{ width: buttonsSize, height: buttonsSize }, styles.button, styles.rotateButton]}>
                        <RotateCcw stroke="black" width={buttonsSize / 2} height={buttonsSize / 2} />
                    </View>
                    <View {...dragViewpanResponder.panHandlers} style={[{ width: buttonsSize, height: buttonsSize }, styles.button, styles.moveButton]}>
                        <Move stroke="black" width={buttonsSize / 2} height={buttonsSize / 2} />
                    </View>
                    <Pressable onPress={onDelete} style={[{ width: buttonsSize, height: buttonsSize }, styles.button, styles.deleteButton]}>
                        <Trash2 stroke="black" width={buttonsSize / 2} height={buttonsSize / 2} />
                    </Pressable>
                </View>
                <View style={[{visibility: selected ? 'visible' : 'hidden', opacity: selected ? 1 : 0}, styles.resizeHandles]} selectable={false} draggable={false}>
                    <View {...resizeXFinalViewpanResponder.panHandlers} style={[{ width: buttonsSize, height: buttonsSize }, styles.resizeHandle, styles.leftHandle]} />
                    <View {...resizeYViewpanResponder.panHandlers} style={[{ width: buttonsSize, height: buttonsSize }, styles.resizeHandle, styles.bottomHandle]} />
                    <View {...resizeXViewpanResponder.panHandlers} style={[{ width: buttonsSize, height: buttonsSize }, styles.resizeHandle, styles.rightHandle]} />
                    <View {...resizeYFinalViewpanResponder.panHandlers} style={[{ width: buttonsSize, height: buttonsSize }, styles.resizeHandle, styles.topHandle]} />
                </View>
            </Pressable>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderWidth: 1,
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonsContainer: {
        position: 'absolute',
        bottom: -60,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingHorizontal: 10,
        zIndex: 16,
    },
    buttonsAbove: {
        bottom: 'auto',
        top: -60,
    },
    button: {
        borderRadius: 20,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    resizeHandles: {
        position: 'absolute',
        width: '100%',
        height: '100%',
    },
    resizeHandle: {
        position: 'absolute',
        width: 30,
        height: 30,
        backgroundColor: '#fa7f7c',
        borderRadius: 20,
        zIndex: 16,
    },
    leftHandle: {
        left: -30,
        top: '50%',
        transform: [{ translateY: -10 }],
    },
    rightHandle: {
        right: -30,
        top: '50%',
        transform: [{ translateY: -10 }],
    },
    topHandle: {
        top: -30,
        left: '50%',
        transform: [{ translateX: -10 }],
    },
    bottomHandle: {
        bottom: -30,
        left: '50%',
        transform: [{ translateX: -10 }],
    },
});

export default DragableContainer;
