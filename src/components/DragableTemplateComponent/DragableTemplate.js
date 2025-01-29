
import { Image, Pressable, StyleSheet, Text } from 'react-native';
import { GestureHandlerRootView, TapGestureHandler } from 'react-native-gesture-handler';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
} from 'react-native-reanimated';
import DragableOption from '../DragableOptionComponent/DragableOption';
import { useCallback, useState } from 'react';
import MemeDecorationsList from '../MemeDecorationsListComponent/MemeDecorationsList';

const DragableTemplate = ({ onArrangeEnd, initialPosition, parentDimensions }) => {

    const selectedTemplate = useSharedValue("");

    const [opened, setOpened] = useState(false);

    // button animated style
    const buttonAnimatedStyle = useAnimatedStyle(() => ({
        width: opened ? parentDimensions.width * 0.8 : 50,
        height: opened ? parentDimensions.height * 0.35 : 50,
    }));

    const onSelectDecoration = useCallback((item) => {
        console.log("Selected decoration:", item);
        selectedTemplate.value = item;
    }, []);

    // menu opened animated style
    const menuOpenedAnimatedStyle = useAnimatedStyle(() => ({
        width: opened ? parentDimensions.width * 0.95 : 50,
        height: opened ? parentDimensions.height * 0.35 : 50,
        left: opened ? parentDimensions.width * 0.025 : initialPosition.x,
        top: initialPosition.y,
    }));

    return (
        <>
            {!opened && <DragableOption
                key={`dragable-template-option`}
                onArrangeEnd={(x, y) => onArrangeEnd(selectedTemplate.value, x, y)}
                initialPosition={initialPosition}
                canMove={!opened}>
                <GestureHandlerRootView
                    style={[{ position: "absolute", backgroundColor: 'red' }]}>
                    <TapGestureHandler
                        onHandlerStateChange={({ nativeEvent }) => {
                            if (nativeEvent.state === 4) {
                                // handle double tap
                                setOpened(!opened);
                            }
                        }}
                        numberOfTaps={2}
                    >
                        <Animated.View style={[buttonAnimatedStyle]}>
                            <Pressable maxPointers={1}>
                                <Image  stroke="black" fill="#fff" width={40} height={40} selectable={false} />
                            </Pressable>
                        </Animated.View>
                    </TapGestureHandler>
                </GestureHandlerRootView>
            </DragableOption >
            }
            {opened && <Animated.View style={[menuOpenedAnimatedStyle, { position: "absolute", zIndex: 15, backgroundColor: 'red', selectable: false }]}>
                <MemeDecorationsList onSelectDecoration={(item) => onSelectDecoration(item)} />
            </Animated.View>}
        </>
    );
}

const styles = StyleSheet.create({
});

export default DragableTemplate;