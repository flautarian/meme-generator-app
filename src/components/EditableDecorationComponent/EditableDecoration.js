import { Image, StyleSheet, View } from "react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { useTranslation } from 'react-i18next';

const EditableDecoration = ({ item, index, height, width, rotation }) => {
    const { t } = useTranslation();

    // animated size style for the inner component shown
    const resizeAnimationStyle = useAnimatedStyle(() => ({
        height: height.get(),
        width: width.get(),
        zIndex: 3,
    }));

    // animated rotation style for the inner component shown
    const rotationAnimationStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: rotation.get() + 'deg' }],
    }));

    return (
        <Animated.View 
            key={`editable-decoration-${index}`} 
            style={[resizeAnimationStyle, rotationAnimationStyle]}
            accessible={true}
            accessibilityLabel={t('editableDecoration.ariaLabel')}
            accessibilityRole="image"
            accessibilityHint={t('editableDecoration.description')}
            selectable={false} draggable={false}
        >
            <View 
                style={styles.container} 
                accessible={true}
                accessibilityLabel={t('editableDecoration.ariaLabel')}
                selectable={false} draggable={false}
            >
                <Image 
                    source={item.value} 
                    style={{ height: "100%", width: "100%" }} 
                    resizeMode='contain'
                    accessible={true}
                    accessibilityLabel={t('editableDecoration.ariaLabel')}
                />
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
