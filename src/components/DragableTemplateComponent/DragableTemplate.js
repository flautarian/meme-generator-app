
import { Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
} from 'react-native-reanimated';
import DragableOption from '../DragableOptionComponent/DragableOption';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useKeyboardVisible } from 'src/hooks/useKeyboardVisible';
import { getRandomDecoration } from 'src/hooks/useTemplates';
import { Edit } from 'react-native-feather';
import { useConfirmation } from 'src/contexts/ConfirmationContext';
import MemeDecorationsList from '../MemeDecorationsListComponent/MemeDecorationsList';

const DragableDecoration = ({
    onArrangeEnd,
    initialPosition,
    parentDimensions,
    onMenuOpenCallBack,
    style = {},
    offsetYAzis = useSharedValue(0),
    offsetXAzis = useSharedValue(0)
}) => {

    const selectedDecoration = useSharedValue("");

    const openTabTimer = useRef(0);

    const [opened, setOpened] = useState(false);

    const isKeyboardVisible = useKeyboardVisible();

    const scaleSpringConfig = {
        duration: 350,
        dampingRatio: 1,
        stiffness: 100,
    };

    const elementSize = {
        width: useSharedValue(0),
        height: useSharedValue(0),
        left: useSharedValue(0),
        bottom: useSharedValue(initialPosition.y),
        opacity: useSharedValue(0)
    };

    // button animated style
    const buttonAnimatedStyle = useAnimatedStyle(() => ({
        width: opened ? parentDimensions.width * 0.8 : 50,
        height: opened ? parentDimensions.height * 0.35 : 50,
    }));

    // menu opened animated style
    const menuOpenedAnimatedStyle = useAnimatedStyle(() => ({
        opacity: elementSize.opacity.value,
        width: elementSize.width.value,
        height: elementSize.height.value,
        left: elementSize.left.value,
        bottom: elementSize.bottom.value,
    }));

    const { handleOpenDrawer, handleCloseDrawer } = useConfirmation();

    const handleOnArrangeEnd = useCallback((x, y) => {
        if (!!selectedDecoration?.value && !!selectedDecoration?.value?.blob) {
            // android menu open system
            if (Platform.OS === "android") {
                const diffPos = { x: x - initialPosition.x, y: y - initialPosition.y };
                const diffPosAbs = Math.abs(diffPos.x) + Math.abs(diffPos.y);
                if (diffPosAbs < 50 && !opened) {
                    if (openTabTimer.current === 0) openTabTimer.current = new Date().getTime();
                    else {
                        const diffDates = new Date().getTime() - openTabTimer.current;
                        if (diffDates < 550 && diffDates > 0)
                            onMenuOpenCallBack();
                        openTabTimer.current = 0;
                    };
                }
                else onArrangeEnd(x, y, selectedDecoration?.value.blob);
            }
            else onArrangeEnd(x, y, selectedDecoration?.value.blob);
        }
    }, [selectedDecoration, onArrangeEnd]);

    useEffect(() => {
        elementSize.opacity.value = withSpring(opened ? 1 : 0);
        elementSize.width.value = withSpring(opened ? parentDimensions.width * 0.9 : 0, scaleSpringConfig);
        elementSize.height.value = withSpring(opened ? parentDimensions.height * 0.35 : 0, scaleSpringConfig);
        elementSize.left.value = withSpring(opened ? parentDimensions.width * 0.05 : initialPosition.x, scaleSpringConfig);
        elementSize.bottom.value = withSpring(opened && isKeyboardVisible ? parentDimensions.height * 0.4 : 50, scaleSpringConfig);
        if (selectedDecoration.value === 0) {
            const initSelectDecoration = async () => {
                const item = await getRandomDecoration();
                selectedDecoration.value = item;
            };
            initSelectDecoration().catch(console.error);
        }
    }, [opened, parentDimensions, isKeyboardVisible]);

    const tap = Gesture.Tap()
        .numberOfTaps(2)
        .onStart(() => {
            onMenuOpenCallBack();
        }).runOnJS(true);

    const memeDecoration = <MemeDecorationsList
        onSelectDecoration={(item) => {
            selectedDecoration.value = item;
            handleCloseDrawer();
        }}
        onCloseMenu={handleCloseDrawer} />;

    const handleOpenDecorationSelection = () => {
        handleOpenDrawer(memeDecoration);
    }

    return (
        <>
            <DragableOption
                key={`dragable-template-option`}
                onArrangeEnd={handleOnArrangeEnd}
                initialPosition={initialPosition}
                offsetYAzis={offsetYAzis}
                offsetXAzis={offsetXAzis}
                canMove={!opened}
                style={style}>
                <GestureDetector
                    gesture={tap}
                    style={[{ position: "absolute" }]}>
                    <Animated.View style={[buttonAnimatedStyle]}>
                        <Pressable maxPointers={1} style={styles.imageWrapper}>
                            <Image selectable={false} style={{ width: 50, height: 50 }} source={selectedDecoration.value?.blob} resizeMode='contain' />
                        </Pressable>
                    </Animated.View>
                </GestureDetector>
                <Pressable maxPointers={1} style={styles.imageEditWrapper} onPressOut={() => {
                    handleOpenDecorationSelection();
                }}>
                    <Edit stroke="black" width={20} height={20} />
                </Pressable>
            </DragableOption >
        </>
    );
}

const styles = StyleSheet.create({
    imageWrapper: {
        flex: 1,
        width: 50,
        height: 50,
    },
    imageEditWrapper: {
        position: 'absolute',
        borderRadius: 20,
        top: 0,
        right: -10,
        width: 30,
        height: 30,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default DragableDecoration;