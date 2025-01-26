import React from "react";
import { View, Image, StyleSheet } from "react-native";

export default function ZoomableImage({ source }) {

    return (
        <View style={styles.container} collapsable={false}>
            <Image source={source} style={[StyleSheet.absoluteFillObject, styles.image]} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: "center", alignItems: "center", zIndex: 1 },
    image: { resizeMode: "contain"},
});
