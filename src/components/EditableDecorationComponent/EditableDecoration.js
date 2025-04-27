import { Image, StyleSheet, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { useTranslation } from 'react-i18next';
import { useCallback, useMemo } from "react";
import { ArrowLeft, ArrowUp } from "react-native-feather";
import { Pressable } from "react-native";

const EditableDecoration = ({ item, index, rotation }) => {
    const { t } = useTranslation();

    const scale = {
        x: useSharedValue(1),
        y: useSharedValue(1)
    }

    const changeScale = useCallback((x, y) => {
        scale.x.value = withSpring(scale.x.value * x, { duration: 150 });
        scale.y.value = withSpring(scale.y.value * y, { duration: 150 });
    }, [scale]);

    // animated size style for the inner component shown
    const animationImageStyle = useAnimatedStyle(() => ({
        height: "100%",
        width: "100%",
        transform: [
            { scaleX: scale.x.value },
            { scaleY: scale.y.value },
        ],
        zIndex: 3,
    }));

    const styles = useMemo(() => {
        return StyleSheet.create({
            container: {
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
            },
            imgWithButtonContainer: {
                flex: 1,
                width: "100%",
                height: "100%",
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
            },
            button: {
                borderRadius: 20,
                backgroundColor: '#fff',
                justifyContent: 'center',
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: {
                    width: 0,
                    height: 2,
                },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                elevation: 5,
                zIndex: 20,
            },
            img: {
                width: "100%",
                height: "100%",
            },
        });
    }, [scale.x, scale.y]);

    return (
        <View
            style={styles.container}
            accessible={true}
            accessibilityLabel={t('editableDecoration.ariaLabel')}
            selectable={false} draggable={false}
        >
            <Pressable onPress={() => changeScale(1, -1)} style={[{ width: 30, height: 30 }, styles.button]}>
                <ArrowUp stroke="black" width={15} height={15} />
            </Pressable>
            <View style={[styles.imgWithButtonContainer]}>
                <Pressable onPress={() => changeScale(-1, 1)} style={[{ width: 30, height: 30 }, styles.button]}>
                    <ArrowLeft stroke="black" width={15} height={15} />
                </Pressable>
                <Animated.View
                    style={[animationImageStyle]}
                    accessible={false}
                    accessibilityLabel={t('editableDecoration.ariaLabel')}>
                    <Image
                        source={item.value}
                        style={styles.img}
                        resizeMode='contain'
                        accessible={true}
                        accessibilityLabel={t('editableDecoration.ariaLabel')}
                    />
                </Animated.View>
            </View>
        </View >
    );
};

export default EditableDecoration;
