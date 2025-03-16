import React from 'react';
import { Image, Platform, Pressable, StyleSheet, Text } from 'react-native';
import Animated, {
    interpolateColor, useAnimatedStyle, useSharedValue,
} from 'react-native-reanimated';
import { Crosshair, XCircle } from 'react-native-feather';
import { Utils } from 'src/utils/Utils';

const TemplateItem = ({ template, onSelect, imgSize, onDelete }) => {

    const { blob, name } = template;

    const isFromUser = Utils.checkIfImgLoadedFromUser(blob);

    const isMobile = Platform.OS === "web" ? false : true;

    const progress = useSharedValue(0);

    const boxAnimatedStyle = useAnimatedStyle(() => ({
        backgroundColor: interpolateColor(
            progress.get(),
            [0, 1],
            ['#b58df1', '#fa7f7c']
        ),
        width: imgSize,
        height: imgSize,
    }));

    return (
        <Pressable onPress={() => onSelect(template)} style={[styles.container]}>
            {name !== "/Upload a file" &&
                <Pressable onPress={() => onDelete(template)} style={{ position: "absolute", zIndex: 10, top: 0.5, right: 0.5, width: "auto", height: "auto" }}>
                    <XCircle stroke="red" fill="white" />
                </Pressable>}
            <Animated.View style={[styles.box, boxAnimatedStyle]}>
                <Image source={isFromUser && isMobile ? { uri: blob } : blob} name={name} style={{ width: imgSize * .9, height: imgSize * .9, alignSelf: "center" }} resizeMode='contain' />
            </Animated.View>
            <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold', position: 'absolute', bottom: 10, left: 10 }}>{name}</Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        position: "relative",
        width: "min-content"
    },
    box: {
        flex: 1,
        borderRadius: 20,
        cursor: 'pointer',
    },
});

export default TemplateItem;