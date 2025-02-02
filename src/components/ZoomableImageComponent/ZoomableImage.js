import React from "react";
import { Dimensions, Image, StyleSheet, View } from "react-native";

export default function ZoomableImage({ source, children }) {

    const { width, height } = Dimensions.get('window');

    return (
        <View style={[{ flexGrow : 1, width: width, height: height, alignItems: 'center' }, StyleSheet.absoluteFill]}>
            <Image source={source} style={{ flexGrow : 1}} resizeMode="center" />
            {children}
        </View>
    );
};
