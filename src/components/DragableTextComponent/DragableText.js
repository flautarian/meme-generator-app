import { useRef, useState } from "react";
import { PanResponder, StyleSheet, Text, TextInput, TouchableWithoutFeedback, View } from "react-native";
import { TapGestureHandler, GestureHandlerRootView } from "react-native-gesture-handler";

const DraggableText = ({ text, index, selected, containerOffset, onSelect }) => {
    const [value, setValue] = useState(text);
    const [fontSize, setFontSize] = useState(20);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isEditing, setIsEditing] = useState(false);

    const dimensions = useRef({ width: 0, height: 0 });

    const handleDrag = (gestureState) => {
        const { offsetX, offsetY } = containerOffset.current;
        const { moveX, moveY } = gestureState;
        const { width, height } = dimensions.current;
        setPosition({
            x: moveX - width / 2 - offsetX,
            y: moveY - height / 2 - offsetY,
        });
    };

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderMove: (_, gestureState) =>
                handleDrag(gestureState, dimensions.current),
        })
    ).current;

    const handleDoubleTap = () => {
        setIsEditing(true);
    };

    const handleTextSubmit = () => {
        setIsEditing(false);
    };

    return (
        <GestureHandlerRootView
            style={[
                {
                    fontSize: fontSize,
                    position: "absolute",
                    top: position.y,
                    left: position.x,
                    borderWidth: selected ? 2 : 0,
                    borderColor: "red",
                },
            ]}>
            <TouchableWithoutFeedback
                key={index}
                onPress={() => onSelect(index)}
            >
                <View
                    style={{ flex: 1, flexDirection: "column" }}>
                    {selected && <View
                        onLayout={(event) => {
                            const { width, height } = event.nativeEvent.layout;
                            dimensions.current = { width, height };
                        }}
                        {...panResponder.panHandlers}
                        style={{ ...styles.moveIconContainer }}>
                        <Text style={styles.positionIconView}>🔴</Text>
                    </View>}

                    <TapGestureHandler
                        onHandlerStateChange={({ nativeEvent }) => {
                            if (nativeEvent.state === 4) {
                                handleDoubleTap();
                            }
                        }}
                        numberOfTaps={2}
                    >
                        <View>
                            {isEditing ? (
                                <TextInput
                                    style={[styles.text, { fontSize: fontSize }]}
                                    value={value}
                                    onChangeText={setValue}
                                    onBlur={handleTextSubmit}
                                    autoFocus
                                />
                            ) : (
                                <Text style={styles.text} selectable={false}>
                                    {value}
                                </Text>
                            )}
                        </View>
                    </TapGestureHandler>
                </View>
            </TouchableWithoutFeedback>
        </GestureHandlerRootView>
    );
};

const styles = StyleSheet.create({
    text: {
        color: "white",
        fontWeight: "bold",
        textShadowColor: "black",
        textShadowRadius: 2,
        textShadowOffset: { width: 1, height: 1 },
    },
    positionIconView: {
        fontSize: 15,
    },
    moveIconContainer: {
        width: 50,
        height: 50,
        backgroundColor: "red",
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    }
});

export default DraggableText;
