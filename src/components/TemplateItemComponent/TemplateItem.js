import React from 'react';
import { Image, Platform, Pressable, StyleSheet, Text } from 'react-native';
import Animated, {
    useAnimatedStyle, useSharedValue, withSpring, withTiming
} from 'react-native-reanimated';
import { XCircle } from 'react-native-feather';
import { Utils } from 'src/utils/Utils';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

const TemplateItem = ({ template, onSelect, imgSize, onDelete }) => {
    const { blob, name } = template;
    const isFromUser = Utils.checkIfImgLoadedFromUser(blob);
    const isMobile = Platform.OS === "web" ? false : true;
    const progress = useSharedValue(1);

    const hover = Gesture.Hover()
        .onBegin((event) => {
            progress.value = withTiming(1.15, { duration: 75 });
        })
        .onFinalize((event) => {
            progress.value = withTiming(1, { duration: 75 });
        });

    const boxAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: progress.value }],
        width: imgSize,
        height: imgSize,
    }));

    {/* <GestureDetector gesture={hover} style={{width: "100%"}}> </GestureDetector> */}
    return (
        <Pressable onPress={() => onSelect(template)} style={[styles.container]}>
                {/* delete button */}
                {name !== "/Upload a file" && (
                    <Pressable
                        onPress={() => onDelete(template)}
                        style={{ position: "absolute", zIndex: 10, top: 0.5, right: 0.5, width: "auto", height: "auto" }}
                    >
                        <XCircle stroke="red" fill="white" />
                    </Pressable>
                )}
                {/* icon */}
                <Animated.View style={[styles.box, boxAnimatedStyle]}>
                    <Image
                        source={isFromUser && isMobile ? { uri: blob } : blob}
                        name={name}
                        style={{ width: "90%", height: "100%", alignSelf: "center" }}
                        resizeMode='contain'
                    />
                </Animated.View>
                <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold', position: 'absolute', bottom: 10, left: 10 }}>
                    {name}
                </Text>
            </Pressable>
    );
};

const styles = StyleSheet.create({
    container: {
        position: "relative",
        width: "min-content"
    },
    box: {
        borderRadius: 20,
        width: "100%",
        height: "100%",
        cursor: 'pointer',
        columnGap: "10px",
        boxShadow: "5px 10px 8px #888888",
    },
});

export default TemplateItem;
