import { useEffect } from "react";
import { useCallback } from "react";
import { useRef, useState } from "react";
import { PanResponder, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Crop, Move } from "react-native-feather";
import { TapGestureHandler, GestureHandlerRootView, PanGestureHandler } from "react-native-gesture-handler";
import Animated, { runOnJS, useAnimatedGestureHandler, useAnimatedStyle, useSharedValue } from "react-native-reanimated";

const DraggableText = ({ text, initPosition, index, selected, containerOffset, onSelect, startDrag }) => {
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
    const targetContentView = { height: useSharedValue(50) };

    const dimensions = useRef({ width: 0, height: 0 });

    useEffect(() => {
        if (targetContentView.height.value !== contentView.height.value) {
            if (contentView.height.value < targetContentView.height.value)
                contentView.height.value += 1;
            else if (contentView.height.value > targetContentView.height.value)
                contentView.height.value -= 1;
            if (Math.abs(contentView.height.value - targetContentView.height.value) < 1)
                contentView.height.value = targetContentView.height.value;
        }
    }, [targetContentView.height]);

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

    const resizePanGestureHandler = useAnimatedGestureHandler({
        onStart: () => {
            runOnJS(setIsPanning)(true)
        },
        onActive: (event) => {
            const newHeight = Math.min(Math.max(event.y, 25), 100);
            targetContentView.height.value = newHeight;
            //setContentViewTextInputHeight(Math.min(Math.max(event.y, 25), 100));
            /* const newFontSize = Math.max(Math.max(viewHeight, 18), 18);
            runOnJS(setFontSize)(newFontSize); */
        },
        onEnd: () => {
            runOnJS(setIsPanning)(false);
        },
    })

    // animated style
    const dragAnimationStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: position.x.value },
            { translateY: position.y.value },
        ],
        position: 'absolute',
    }));

    const resizeAnimationStyle = useAnimatedStyle(() => {
        return {
            height: contentView.height.value,
            width: contentView.height.value * 1.5,
        }
    })

    return (
        <Animated.View
            style={[dragAnimationStyle, { position: "absolute" }]}
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
                        borderWidth: selected ? 2 : 0,
                        borderColor: "red"
                    }
                ]}
            >

                <Pressable
                    key={index}
                    onPress={() => onSelect(index)}
                >
                    <Animated.View
                        style={{ flex: 1, flexDirection: "column" }}>
                        <View
                            {...dragViewpanResponder.panHandlers}
                            style={{ ...styles.moveIconContainer, visibility: selected ? 'visible' : 'hidden', opacity: selected ? 1 : 0 }}>
                            <Text style={styles.positionIconView} selectable={false}><Move stroke="black" fill="#fff" width={32} height={32}  /></Text> 
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
                            <Animated.View style={[{ backgroundColor: 'yellow' }, resizeAnimationStyle]}>
                                {isEditing ? (
                                    <TextInput
                                        aria-label={`text-input-${index}`}
                                        style={[{ textAlign: 'center' }, resizeAnimationStyle]}
                                        value={value}
                                        onChangeText={setValue}
                                        onBlur={() => setIsEditing(false)}
                                        autoFocus
                                    />
                                ) : (
                                    <Animated.Text style={[{ textAlign: 'center' }]} selectable={false}>
                                        {value}
                                    </Animated.Text>
                                )}
                            </Animated.View>
                        </TapGestureHandler>

                        <PanGestureHandler onGestureEvent={resizePanGestureHandler} style={{ ...styles.moveIconContainer }}>
                            <Animated.View style={{ ...styles.moveIconContainer, visibility: selected ? 'visible' : 'hidden', opacity: selected ? 1 : 0 }}>
                                <Text style={styles.positionIconView} selectable={false}><Crop stroke="black" width={32} height={32}  /></Text> 
                            </Animated.View>
                        </PanGestureHandler>
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
        fontSize: 15,
        userSelect: "none",
    },
    moveIconContainer: {
        height: 50,
        backgroundColor: "red",
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    }
});

export default DraggableText;
