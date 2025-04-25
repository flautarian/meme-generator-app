
import { Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
} from 'react-native-reanimated';
import DragableOption from '../DragableOptionComponent/DragableOption';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useKeyboardVisible } from 'src/hooks/useKeyboardVisible';
import { getRandomDecoration } from 'src/hooks/useDecorations';
import { Edit } from 'react-native-feather';
import { useConfirmation } from 'src/contexts/ConfirmationContext';
import MemeDecorationsList from '../MemeDecorationsListComponent/MemeDecorationsList';

const DragableDecoration = ({
    initialPosition,
    onArrangeEnd,
    parentDimensions,
    limitDistance = 0,
    style = {},
}) => {

    const selectedDecoration = useSharedValue("");

    const openTabTimer = useRef(0);

    const [opened, setOpened] = useState(false);

    const isKeyboardVisible = useKeyboardVisible();

    // button animated style
    const buttonAnimatedStyle = useAnimatedStyle(() => ({
        width: opened ? parentDimensions.width * 0.8 : 50,
        height: opened ? parentDimensions.height * 0.35 : 50,
    }));

    const { handleOpenBottomDrawer, handleCloseBottomDrawer } = useConfirmation();

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
                            handleOpenBottomDrawer(memeDecoration);
                        openTabTimer.current = 0;
                    };
                }
                else onArrangeEnd(x, y, selectedDecoration?.value.blob);
            }
            else onArrangeEnd(x, y, selectedDecoration?.value.blob);
        }
    }, [selectedDecoration, onArrangeEnd]);

    useEffect(() => {
        if (selectedDecoration.value === "") {
            selectedDecoration.value = "calculating";
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
            handleOpenBottomDrawer(memeDecoration);
        }).runOnJS(true);

    const memeDecoration = <MemeDecorationsList
        onSelectDecoration={(item) => {
            selectedDecoration.value = item;
            handleCloseBottomDrawer();
        }}
        onCloseMenu={handleCloseBottomDrawer} />;

    const handleOpenDecorationSelection = () => {
        handleOpenBottomDrawer(memeDecoration);
    }

    return (
        <>
            <DragableOption
                key={`dragable-template-option`}
                onArrangeEnd={handleOnArrangeEnd}
                limitDistance={limitDistance}
                initialPosition={initialPosition}
                canMove={!opened}
                style={style}>
                <GestureHandlerRootView>
                    <GestureDetector
                        gesture={tap}
                        style={[{ position: "absolute" }]}>
                        <Animated.View style={[buttonAnimatedStyle]}>
                            <Pressable maxPointers={1} style={styles.imageWrapper}>
                                <Image selectable={false} style={{ width: 50, height: 50 }} source={selectedDecoration.value?.blob} resizeMode='contain' />
                            </Pressable>
                        </Animated.View>
                    </GestureDetector>
                </GestureHandlerRootView>
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