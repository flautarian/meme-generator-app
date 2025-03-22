
import { Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
} from 'react-native-reanimated';
import DragableOption from '../DragableOptionComponent/DragableOption';
import { useCallback, useEffect, useRef, useState } from 'react';
import MemeDecorationsList from '../MemeDecorationsListComponent/MemeDecorationsList';
import { useKeyboardVisible } from 'src/hooks/useKeyboardVisible';
import { getRandomDecoration } from 'src/hooks/useTemplates';


const DragableDecoration = ({
    onArrangeEnd,
    onChangedDecorations,
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

    const onSelectDecoration = useCallback(async (item) => {
        selectedDecoration.set(item);
        toggleMenuState();
    }, [opened, selectedDecoration]);

    // menu opened animated style
    const menuOpenedAnimatedStyle = useAnimatedStyle(() => ({
        opacity: elementSize.opacity.get(),
        width: elementSize.width.get(),
        height: elementSize.height.get(),
        left: elementSize.left.get(),
        bottom: elementSize.bottom.get(),
    }));

    const handleOnArrangeEnd = useCallback((x, y) => {
        // android menu open system
        if (Platform.OS === "android") {
            const diffPos = { x: x - initialPosition.x, y: y - initialPosition.y };
            const diffPosAbs = Math.abs(diffPos.x) + Math.abs(diffPos.y);
            if (diffPosAbs < 50 && !opened) {
                if (openTabTimer.current === 0) openTabTimer.current = new Date().getTime();
                else {
                    const diffDates = new Date().getTime() - openTabTimer.current;
                    if (diffDates < 550 && diffDates > 0)
                        toggleMenuState();
                    openTabTimer.current = 0;
                };
            }
            else onArrangeEnd(x, y, selectedDecoration?.get().blob);
        }
        else onArrangeEnd(x, y, selectedDecoration?.get().blob);
    }, [selectedDecoration, onArrangeEnd]);

    const toggleMenuState = useCallback(() => {
        console.log("toggleMenuState");
        setOpened((prevState) => {
            if (!prevState)
                onMenuOpenCallBack();
            return !prevState;
        });
    }, [opened]);

    useEffect(() => {
        elementSize.opacity.set(withSpring(opened ? 1 : 0));
        elementSize.width.set(withSpring(opened ? parentDimensions.width * 0.9 : 0, scaleSpringConfig));
        elementSize.height.set(withSpring(opened ? parentDimensions.height * 0.35 : 0, scaleSpringConfig));
        elementSize.left.set(withSpring(opened ? parentDimensions.width * 0.05 : initialPosition.x, scaleSpringConfig));
        elementSize.bottom.set(withSpring(opened && isKeyboardVisible ? parentDimensions.height * 0.4 : 50, scaleSpringConfig));
        if (selectedDecoration.get() === 0) {
            const initSelectDecoration = async () => {
                const item = await getRandomDecoration();
                selectedDecoration.set(item);
            };
            initSelectDecoration().catch(console.error);
        }
    }, [opened, parentDimensions, isKeyboardVisible]);

    const tap = Gesture.Tap()
        .numberOfTaps(2)
        .onStart(() => {
            if (!opened) {
                toggleMenuState();
                onMenuOpenCallBack();
            }
        }).runOnJS(true);

    return (
        <>
            {!opened &&
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
                                <Image selectable={false} style={{ width: 50, height: 50 }} source={selectedDecoration.get()?.blob} resizeMode='contain' />
                            </Pressable>
                        </Animated.View>
                    </GestureDetector>
                </DragableOption >
            }

            <Animated.View style={[menuOpenedAnimatedStyle, { position: "absolute", zIndex: 15, backgroundColor: 'red', selectable: false, borderRadius: 10 }]}>
                {opened && <MemeDecorationsList
                    onSelectDecoration={(item) => onSelectDecoration(item)}
                    onChangedDecorations={onChangedDecorations}
                    onCloseMenu={toggleMenuState} />}
            </Animated.View>
        </>
    );
}

const styles = StyleSheet.create({
    imageWrapper: {
        flex: 1,
        width: 50,
        height: 50,
    },
});

export default DragableDecoration;