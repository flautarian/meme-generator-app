import React from "react";
import { View, Image, StyleSheet } from "react-native";
import { PinchGestureHandler, GestureHandlerRootView } from "react-native-gesture-handler";

export default function ZoomableImage({ source }) {
    const scale = React.useRef(1);

    return (
        <GestureHandlerRootView>
            <PinchGestureHandler
                onGestureEvent={(e) => {
                    scale.current = e.nativeEvent.scale;
                }}
            >
                <View style={styles.container}>
                    <Image source={source} style={[styles.image, { transform: [{ scale: scale.current }] }]} />
                </View>
            </PinchGestureHandler>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: "center", alignItems: "center" },
    image: { width: 300, height: 300, resizeMode: "contain" },
});
