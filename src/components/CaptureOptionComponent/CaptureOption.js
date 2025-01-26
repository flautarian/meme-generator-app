import { StyleSheet, View } from 'react-native';
import { Camera } from 'react-native-feather';
import { Pressable } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';

const CaptureOption = ({ onCapture, initialPosition }) => {
    return (
        <View style={[styles.container, { top: initialPosition.y, left: initialPosition.x }]}>
            <Animated.View
                style={[styles.captureBox]}>
                <Pressable maxPointers={1} onPressOut={() => onCapture()}>
                    <Camera stroke="black" fill="#fff" width={40} height={40} />
                </Pressable>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        zIndex: 9,
    },
    captureBox: {
        position: "absolute",
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'violet',
        width: 60,
        height: 60,
        borderRadius: 50,
        zIndex: 10,
    },
});

export default CaptureOption;