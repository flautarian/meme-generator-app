import { Image, StyleSheet, View } from "react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";

const EditableDecoration = ({ item, index, height, width, rotation }) => {

    // animated size style for the inner component shown
    const resizeAnimationStyle = useAnimatedStyle(() => ({
        height: height.value,
        width: width.value,
        zIndex: 3,
    }))

    // animated rotation style for the inner component shown
    const rotationAnimationStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: rotation.value + 'deg' }],
    }))

    return (
        <Animated.View style={[resizeAnimationStyle, rotationAnimationStyle]}>
            <View style={styles.container}>
                <Image source={item.value} style={{ height: height.value, width: width.value }} resizeMode='contain' />
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    }
});

export default EditableDecoration;
