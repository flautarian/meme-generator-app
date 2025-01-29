import { Children, cloneElement, useEffect } from "react";
import { useCallback } from "react";
import { useRef, useState } from "react";
import { PanResponder, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { Move, RotateCcw, Square, Trash2 } from "react-native-feather";
import Animated, { useAnimatedStyle, useSharedValue } from "react-native-reanimated";

const DraggableContainer = ({ item, index, selected, onSelect, onDelete, children }) => {

    // Position of the component (position absoulte)
    const position = {
        x: useSharedValue(-1000),
        y: useSharedValue(-1000),
    };

    const selectedContainer = useSharedValue(selected);

    // Used to keep track of the origin offset of the component
    const originOffset = useRef({ oX: 0, oY: 0 });

    // Used to keep track of the inner component changes
    const contentView = { height: useSharedValue(item.height), width: useSharedValue(item.width), rotation: useSharedValue(item.rotation) };

    // Init height of the component
    const initHeight = useSharedValue(contentView.height.value);

    // Init width of the component
    const initWidth = useSharedValue(contentView.width.value);

    // Rotation of the component
    const initRotation = useSharedValue(contentView.rotation.value);

    // Size of the buttons
    const buttonsSize = 50;

    // Used to force re-render of the component because IOS doesn't make a re render when size of the component changes
    const [layoutKey, setLayoutKey] = useState(0);

    const childrenWithProps = useRef(Children.map(children, (child) =>
        cloneElement(child, { item: item, index: index, height: contentView.height, width: contentView.width, rotation: contentView.rotation })
    ));

    // Dimensions of the component
    const dimensions = { width: useSharedValue(0), height: useSharedValue(0) };

    // Get new position of the component
    const getNewPosition = useCallback((gestureState) => {
        const { moveX, moveY } = gestureState;
        const { width, height } = dimensions;
        const { oX, oY } = originOffset.current;
        if (Platform.OS === 'web')
            return { x: moveX - oX, y: moveY - oY - height.value / 2 };
        return { x: moveX - oX, y: moveY - oY - height.value / 2 };
    }, [dimensions, originOffset]);

    // handle drag function
    const handleDrag = useCallback((gestureState) => {
        if (!selectedContainer.value) return;
        const { x, y } = getNewPosition(gestureState);
        position.x.value = x;
        position.y.value = y;
        if(!!item){
            item.x = x;
            item.y = y;
        }
    }, [position, selectedContainer]);

    // Pan responder for the drag
    const dragViewpanResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderMove: (_, gestureState) =>
                handleDrag(gestureState),
        })
    ).current;

    // handle resize function
    const handleResizeY = useCallback((gestureState, y0) => {
        if (!selectedContainer.value) return;
        let newValue = y0 ? gestureState.y0 - gestureState.moveY : gestureState.moveY - gestureState.y0;
        const newHeight = Math.max(newValue + initHeight.value, 25);
        contentView.height.value = newHeight;
        if (newHeight > 25 && y0)
            position.y.value = gestureState.moveY - buttonsSize;
        // update object height
        if(!!item)
            item.height = newHeight;
    }, [contentView, selectedContainer, dimensions]);

    // Pan responder for the resize Y (final Y)
    const resizeYViewpanResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderMove: (_, gestureState) =>
                handleResizeY(gestureState, false),
            onPanResponderRelease: (_, gestureState) => {
                initHeight.value = contentView.height.value;
                setLayoutKey((prevKey) => prevKey + 1);
            },
        })
    ).current;

    // Pan responder for the resize Y0 (initial Y)
    const resizeY0ViewpanResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderMove: (_, gestureState) =>
                handleResizeY(gestureState, true),
            onPanResponderRelease: (_, gestureState) => {
                initHeight.value = contentView.height.value;
                setLayoutKey((prevKey) => prevKey + 1);
            },
        })
    ).current;

    // handle resize function
    const handleResizeX = useCallback((gestureState, x0) => {
        if (!selectedContainer.value) return;
        let newValue = x0 ? gestureState.x0 - gestureState.moveX : gestureState.moveX - gestureState.x0;
        const newWidth = Math.max(newValue + initWidth.value, 25);
        contentView.width.value = newWidth;
        if (newWidth > 25 && x0)
            position.x.value = gestureState.moveX - buttonsSize;
        // update object width
        if(!!item)
            item.width = newWidth;
    }, [contentView, selectedContainer]);

    // Pan responder for the resize X (final X)
    const resizeXViewpanResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderMove: (_, gestureState) =>
                handleResizeX(gestureState, false),
            onPanResponderRelease: (_, gestureState) => {
                initWidth.value = contentView.width.value;
                setLayoutKey((prevKey) => prevKey + 1);
            },
        })
    ).current;

    // Pan responder for the resize X0 (initial X)
    const resizeX0ViewpanResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderMove: (_, gestureState) =>
                handleResizeX(gestureState, true),
            onPanResponderRelease: (_, gestureState) => {
                initWidth.value = contentView.width.value;
                setLayoutKey((prevKey) => prevKey + 1);
            },
        })
    ).current;

    // handle rotate function
    const onRotate = useCallback((gestureState) => {
        if (!selectedContainer.value) return;
        let newValue = gestureState.x0 - gestureState.moveX;
        const newRotation = newValue + initRotation.value;
        contentView.rotation.value = newRotation;
        // update object rotation
        if(!!item)
            item.rotation = newRotation;
    }, [contentView, selectedContainer]);

    // Pan responder for the rotate
    const rotateViewpanResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => {
                return true;
            },
            onMoveShouldSetPanResponder: () => true,
            onPanResponderMove: (_, gestureState) =>
                onRotate(gestureState),
            onPanResponderRelease: (_, gestureState) => {
                initRotation.value = contentView.rotation.value;
            },
        })
    ).current;

    // animated translation style for main Animated.View
    const dragAnimationStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: position.x.value },
            { translateY: position.y.value },
        ],
        position: 'absolute',
    }));

    // Init position of the component
    useEffect(() => {
        // init position set
        if (position.x.value < 0) {
            position.x.value = item.x;
            position.y.value = item.y;
        }
    }, []);
    
    // refresh selected of the component
    useEffect(() => {
        // init position set
        selectedContainer.value = selected;
    }, [selected]);

    // Get the layout of the component
    const onComponentLayout = useCallback((event) => {
        const { width, height, x, y, top, left } = event.nativeEvent.layout;
        originOffset.current = { oX: x + (left | 0) + width / 2, oY: y + (top | 0) + height / 2 };
        dimensions.width.value = width;
        dimensions.height.value = height;
    }, [dimensions, originOffset]);

    return (
        <Animated.View
            style={[dragAnimationStyle, {zIndex: selected ? 15 : 3}]} // high zIdex to priorize this selected component
            key={`dragable-text-${index}-${layoutKey}`}
            onLayout={onComponentLayout}>
            <Pressable
                onPress={() => onSelect(index)}
            >
                <Animated.View
                    style={{ flex: 1, flexDirection: "column", alignItems: "center", justifyContent: "center" }}>

                    {/* Resize Icon Y0*/}
                    <View style={[{ visibility: selected ? 'visible' : 'hidden', opacity: selected ? 1 : 0, zIndex: 5 }]}>
                        <Animated.View {...resizeY0ViewpanResponder.panHandlers}>
                            <Text style={styles.positionIconView} selectable={false}>
                                <Square fill={"#fff"} stroke="black" width={32} height={32} />
                            </Text>
                        </Animated.View>
                    </View>

                    {/* Main View */}
                    <Animated.View style={{ flex: 1, flexDirection: "row", alignContent: "center", justifyContent: "center" }}>

                        {/* Resize Icon X0 */}
                        <View {...resizeX0ViewpanResponder.panHandlers}
                            style={[{
                                visibility: selected ? 'visible' : 'hidden',
                                opacity: selected ? 1 : 0,
                                justifyContent: "center",
                                alignItems: "center",
                                zIndex: 5
                            }]}>
                            <Text style={styles.positionIconView} selectable={false}>
                                <Square fill={"#fff"} stroke="black" width={32} height={32} />
                            </Text>
                        </View>

                        {/* Children element to render in editable object */}
                        {!!childrenWithProps.current && childrenWithProps.current}

                        {/* Resize Icon X max */}
                        <View {...resizeXViewpanResponder.panHandlers}
                            style={[{
                                visibility: selected ? 'visible' : 'hidden',
                                opacity: selected ? 1 : 0,
                                justifyContent: "center",
                                alignItems: "center",
                                zIndex: 5
                            }]}>
                            <Text style={styles.positionIconView} selectable={false}>
                                <Square fill={"#fff"} stroke="black" width={32} height={32} />
                            </Text>
                        </View>
                    </Animated.View>

                    {/* Resize Icon Y max */}
                    <Animated.View {...resizeYViewpanResponder.panHandlers}
                        style={{
                            visibility: selected ? 'visible' : 'hidden',
                            opacity: selected ? 1 : 0,
                            zIndex: 5
                        }}>
                        <Text style={styles.positionIconView} selectable={false}>
                            <Square fill={"#fff"} width={32} height={32} />
                        </Text>
                    </Animated.View>
                </Animated.View>
                <View style={[{ flex: 1, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }]}>
                    {/* Rotate Icon*/}
                    <View
                        {...rotateViewpanResponder.panHandlers}
                        style={{
                            visibility: selected ? 'visible' : 'hidden', opacity: selected ? 1 : 0,
                            maxWidth: buttonsSize, maxHeight: buttonsSize
                        }}>
                        <Text style={styles.positionIconView} selectable={false}>
                            <RotateCcw stroke="black" width={32} height={32} />
                        </Text>
                    </View>

                    {/* Drag Icon*/}
                    <View
                        {...dragViewpanResponder.panHandlers}
                        style={{
                            visibility: selected ? 'visible' : 'hidden',
                            opacity: selected ? 1 : 0,
                            maxWidth: buttonsSize, maxHeight: buttonsSize
                        }}>
                        <Text style={styles.positionIconView} selectable={false}>
                            <Move stroke="black" width={32} height={32} />
                        </Text>
                    </View>

                    {/* Erase Icon */}
                    <View
                        style={{
                            visibility: selected ? 'visible' : 'hidden',
                            opacity: selected ? 1 : 0,
                        }}>
                        <Pressable
                            onPress={() => onDelete()}
                            style={styles.positionIconView} selectable={false}>
                            <Trash2 stroke="black" fill={"#fff"} width={32} height={32} />
                        </Pressable>
                    </View>
                </View>
            </Pressable>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    text: {
        color: "white",
        fontWeight: "bold",
        textShadowColor: "black",
        textShadowRadius: 2,
        textShadowOffset: { width: 1, height: 1 },
        width: "100%",
    },
    positionIconView: {
        userSelect: "none",
    },
    impact: {
        textTransform: "uppercase",
        fontFamily: 'Impact',
        fontColor: 'white',
        color: 'white',
        webkitTextStroke: '2px black',
        textShadowColor: 'black',
        textShadowRadius: 4,
        textShadowOffset: { width: 2, height: 2 },
    }
});

export default DraggableContainer;
