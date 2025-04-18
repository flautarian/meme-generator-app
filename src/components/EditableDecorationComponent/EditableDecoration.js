import { Image, StyleSheet, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue } from "react-native-reanimated";
import { useTranslation } from 'react-i18next';

const EditableDecoration = ({ item, index, rotation }) => {
    const { t } = useTranslation();

    const scale = {
        x: useSharedValue(1),
        y: useSharedValue(1)
    }

    // animated size style for the inner component shown
    const resizeAnimationStyle = useAnimatedStyle(() => ({
        height: "100%",
        width: "100%",
        scaleX: 1,
        scaleY: 1,
        zIndex: 3,
    }));

    return (
        <Animated.View 
            key={`editable-decoration-${index}`} 
            style={[resizeAnimationStyle]}
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
