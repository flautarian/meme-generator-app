import React from "react";
import { View, Image, StyleSheet } from "react-native";

export default function ZoomableImage({ source }) {
    const scale = React.useRef(1);

    return (
        <View style={styles.container}>
            <Image source={source} style={[StyleSheet.absoluteFillObject, styles.image, { transform: [{ scale: scale.current }] }]} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: "center", alignItems: "center", zIndex: 1 },
    image: { resizeMode: "contain", zIndex: 1 },
});
