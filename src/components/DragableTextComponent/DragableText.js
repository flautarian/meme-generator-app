import { useEffect } from "react";
import { useCallback } from "react";
import { useRef, useState } from "react";
import { PanResponder, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { ArrowDown, ArrowRight, Crop, Move, RotateCcw } from "react-native-feather";
import { TapGestureHandler, GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, { useAnimatedStyle, useSharedValue } from "react-native-reanimated";

const DraggableText = ({ text, initPosition, index, selected, onSelect }) => {
    const [value, setValue] = useState(text);

    const position = {
        x: useSharedValue(-1000),
        y: useSharedValue(-1000),
    };

    const originOffset = useRef({ oX: 0, oY: 0 });

    const [isEditing, setIsEditing] = useState(false);

    const [isPanning, setIsPanning] = useState(false);
    const [fontSize, setFontSize] = useState(18);
    const contentView = { height: useSharedValue(50), width: useSharedValue(150), rotation: useSharedValue(0) };

    const initHeight = useSharedValue(contentView.height.value);
    
    const initWidth = useSharedValue(contentView.width.value);

    const initRotation = useSharedValue(contentView.rotation.value);

    const dimensions = useRef({ width: 0, height: 0 });

    const getNewPosition = useCallback((gestureState) => {
        const { moveX, moveY } = gestureState;
        const { width, height } = dimensions.current;
        const { oX, oY } = originOffset.current;
        if (Platform.OS === 'web')
            return { x: moveX - oX, y: moveY - oY + height / 2 - 10 };
        return { x: moveX - width / 2, y: moveY - 50 };
    }, []);

    // init position set
    useEffect(() => {
        if (position.x.value < 0) {
            position.x.value = initPosition.x;
            position.y.value = initPosition.y;
        }
    }, []);

    // handle drag function
    const handleDrag = useCallback((gestureState) => {
        const { x, y } = getNewPosition(gestureState);
        position.x.value = x;
        position.y.value = y;
    }, [position]);

    const dragViewpanResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderMove: (_, gestureState) =>
                handleDrag(gestureState),
        })
    ).current;


    // handle resize function
    const handleResizeY = useCallback((gestureState) => {
        let newValue = gestureState.moveY - gestureState.y0;
        const newHeight = Math.max(newValue + initHeight.value, 25);
        contentView.height.value = newHeight;
    }, [contentView, selected]);

    const resizeYViewpanResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => {
                return true;
            },
            onMoveShouldSetPanResponder: () => true,
            onPanResponderMove: (_, gestureState) =>
                handleResizeY(gestureState),
            onPanResponderRelease: (_, gestureState) => {
                initHeight.value = contentView.height.value;
            },
        })
    ).current;

    

    // handle resize function
    const handleResizeX = useCallback((gestureState) => {
        let newValue = gestureState.moveX - gestureState.x0;
        const newWidth = Math.max(newValue + initWidth.value, 25);
        contentView.width.value = newWidth;
    }, [contentView, selected]);

    const resizeXViewpanResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => {
                return true;
            },
            onMoveShouldSetPanResponder: () => true,
            onPanResponderMove: (_, gestureState) =>
                handleResizeX(gestureState),
            onPanResponderRelease: (_, gestureState) => {
                initWidth.value = contentView.width.value;
            },
        })
    ).current;

    // handle rotate function
    const handleRotate = useCallback((gestureState) => {
        let newValue = gestureState.x0 - gestureState.moveX;
        const newRotation = newValue + initRotation.value;
        contentView.rotation.value = newRotation;
    }, [contentView]);

    const rotateViewpanResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => {
                return true;
            },
            onMoveShouldSetPanResponder: () => true,
            onPanResponderMove: (_, gestureState) =>
                handleRotate(gestureState),
            onPanResponderRelease: (_, gestureState) => {
                initRotation.value = contentView.rotation.value;
            },
        })
    ).current;

    // animated style
    const dragAnimationStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: position.x.value },
            { translateY: position.y.value },
        ],
        position: 'absolute',
    }));

    const resizeAnimationStyle = useAnimatedStyle(() => ({
        height: contentView.height.value,
        width: contentView.width.value,
        fontSize: (contentView.height.value + contentView.width.value) / 2 * 0.5
    }))

    const rotationAnimationStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: contentView.rotation.value + 'deg' }],
    }))

    return (
        <Animated.View
            style={[dragAnimationStyle]}
            onLayout={(event) => {
                const { width, height, x, y, top, left } = event.nativeEvent.layout;
                originOffset.current = { oX: x + (left | 0) + width / 2, oY: y + (top | 0) + height / 2 };
                dimensions.current = { width, height };
            }}>
            <GestureHandlerRootView>

                <Pressable
                    key={`pressable-image-${index}`}
                    onPress={() => onSelect(index)}
                >
                    <Animated.View
                        style={{ flex: 1, flexDirection: "column", alignContent: "center", justifyContent: "center" }}>
                        <View
                            {...dragViewpanResponder.panHandlers}
                            style={{ ...styles.moveIconContainerCircle, visibility: selected ? 'visible' : 'hidden', opacity: selected ? 1 : 0 }}>
                            <Text style={styles.positionIconView} selectable={false}>
                                <Move stroke="black" fill="#fff" width={32} height={32} />
                            </Text>
                        </View>

                        <Animated.View style={ { flex: 1, flexDirection: "row", alignContent: "center", justifyContent: "center" }}>
                            <TapGestureHandler
                                onHandlerStateChange={({ nativeEvent }) => {
                                    if (nativeEvent.state === 4) {
                                        // handle double tap
                                        setIsEditing(true);
                                    }
                                }}
                                numberOfTaps={2}
                            >
                                <Animated.View style={[selected ? { backgroundColor: 'yellow' } : {}, resizeAnimationStyle, rotationAnimationStyle]}>
                                    {isEditing ? (
                                        <TextInput
                                            aria-label={`text-input-${index}`}
                                            style={[{ textAlign: 'center' }, resizeAnimationStyle, styles.impact]}
                                            value={value}
                                            onChangeText={setValue}
                                            onBlur={() => setIsEditing(false)}
                                            autoFocus
                                        />
                                    ) : (
                                        <Animated.Text style={[{ textAlign: 'center' }, resizeAnimationStyle, styles.impact]} selectable={false}>
                                            {value}
                                        </Animated.Text>
                                    )}
                                </Animated.View>
                            </TapGestureHandler>

                            <Animated.View {...resizeXViewpanResponder.panHandlers} style={[{ visibility: selected ? 'visible' : 'hidden', opacity: selected ? 1 : 0 }, { ...styles.moveIconContainer }]}>
                                <Text style={styles.positionIconView} selectable={false}><ArrowRight stroke="black" width={32} height={32} /></Text>
                            </Animated.View>
                        </Animated.View>

                        <View style={[{ visibility: selected ? 'visible' : 'hidden', opacity: selected ? 1 : 0 }]}>
                            <Animated.View {...resizeYViewpanResponder.panHandlers} style={{ ...styles.moveIconContainer }}>
                                <Text style={styles.positionIconView} selectable={false}><ArrowDown stroke="black" width={32} height={32} /></Text>
                            </Animated.View>
                        </View>

                        <View style={[{ visibility: selected ? 'visible' : 'hidden', opacity: selected ? 1 : 0 }]}>
                            <Animated.View {...rotateViewpanResponder.panHandlers} style={{ ...styles.moveIconContainerCircle }}>
                                <Text style={styles.positionIconView} selectable={false}><RotateCcw stroke="black" width={32} height={32} /></Text>
                            </Animated.View>
                        </View>

                    </Animated.View>
                </Pressable>
            </GestureHandlerRootView >
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
    moveIconContainerCircle: {
        backgroundColor: "red",
        borderRadius: 50,
        flex: 1,
        justifySelf: "center",
        alignSelf: "center",
        textAlign: "center",
        zIndex: 10,
    },
    moveIconContainer: {
        backgroundColor: "red",
        borderRadius: 50,
        zIndex: 10,
    },
    impact: {
        fontFamily: 'Impact',
        fontColor: 'white',
        color: 'white',
        webkitTextStroke: '2px black',
        textShadowColor: 'black',
        textShadowRadius: 4,
        textShadowOffset: { width: 2, height: 2 },
    }
});

export default DraggableText;
