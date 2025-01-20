import { useEffect } from "react";
import { useCallback } from "react";
import { useRef, useState } from "react";
import { PanResponder, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Crop, Move } from "react-native-feather";
import { TapGestureHandler, GestureHandlerRootView, PanGestureHandler } from "react-native-gesture-handler";
import Animated, { runOnJS, useAnimatedGestureHandler, useAnimatedStyle, useSharedValue } from "react-native-reanimated";

const DraggableText = ({ text, initPosition, index, selected, onSelect, startDrag }) => {
    const [value, setValue] = useState(text);

    const position = {
        x: useSharedValue(-1000),
        y: useSharedValue(-1000),
    };

    const originOffset = useRef({ oX: 0, oY: 0 });

    const [isEditing, setIsEditing] = useState(false);

    const [isPanning, setIsPanning] = useState(false);
    const [fontSize, setFontSize] = useState(18);
    const contentView = { height: useSharedValue(50) };
    const initHeight = useSharedValue(contentView.height.value);

    const dimensions = useRef({ width: 0, height: 0 });

    const getNewPosition = useCallback((gestureState) => {
        const { moveX, moveY } = gestureState;
        const { width, height } = dimensions.current;
        const { oX, oY } = originOffset.current;
        if (Platform.OS === 'web')
            return { x: moveX - oX, y: moveY - oY + height / 2 - 10 };
        return { x: moveX - width / 2, y: moveY - 50 };
    }, [dimensions, originOffset]);

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
    const handleResize = useCallback((gestureState) => {
        let newValue = gestureState.moveY - gestureState.y0;
        const newHeight = Math.max(newValue + initHeight.value, 25);
        contentView.height.value = newHeight;
    }, [contentView]);

    const resizeViewpanResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => {
                return true;
            },
            onMoveShouldSetPanResponder: () => true,
            onPanResponderMove: (_, gestureState) =>
                handleResize(gestureState),
            onPanResponderRelease: (_, gestureState) => {
                console.log(contentView.height.value);
                initHeight.value = contentView.height.value;
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
        width: contentView.height.value * 2,
        fontSize: contentView.height.value * 0.5
    }))

    return (
        <Animated.View
            style={[dragAnimationStyle]}
            onLayout={(event) => {
                const { width, height, x, y, top, left } = event.nativeEvent.layout;
                originOffset.current = { oX: x + (left | 0) + width / 2, oY: y + (top | 0) + height / 2 };
                if (position.x.value < 0) {
                    position.x.value = initPosition.x;
                    position.y.value = initPosition.y;
                }
                dimensions.current = { width, height };
            }}>
            <GestureHandlerRootView
                style={[
                    {
                        fontSize: fontSize,
                        borderWidth: selected ? 2 : 0
                    }
                ]}
            >

                <Pressable
                    key={index}
                    onPress={() => onSelect(index)}
                >
                    <Animated.View
                        style={{ flex: 1, flexDirection: "column", alignContent: "center", justifyContent: "center" }}>
                        <View
                            {...dragViewpanResponder.panHandlers}
                            style={{ ...styles.moveIconContainer, visibility: selected ? 'visible' : 'hidden', opacity: selected ? 1 : 0 }}>
                            <Text style={styles.positionIconView} selectable={false}>
                                <Move stroke="black" fill="#fff" width={32} height={32} />
                            </Text>
                        </View>

                        <TapGestureHandler
                            onHandlerStateChange={({ nativeEvent }) => {
                                if (nativeEvent.state === 4) {
                                    // handle double tap
                                    setIsEditing(true);
                                }
                            }}
                            numberOfTaps={2}
                        >
                            <Animated.View style={[selected ? { backgroundColor: 'yellow' } : {}, resizeAnimationStyle]}>
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

                        <Animated.View {...resizeViewpanResponder.panHandlers} style={{ ...styles.moveIconContainer, visibility: selected ? 'visible' : 'hidden', opacity: selected ? 1 : 0 }}>
                            <Text style={styles.positionIconView} selectable={false}><Crop stroke="black" width={32} height={32} /></Text>
                        </Animated.View>
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
    moveIconContainer: {
        backgroundColor: "red",
        borderRadius: 50,
        flex: 1,
        justifySelf: "center",
        alignSelf: "center",
        textAlign: "center",
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
