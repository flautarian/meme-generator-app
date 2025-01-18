import React, { useRef } from 'react';
import { Animated, StyleSheet, View, PanResponder } from 'react-native';

const MobileCrosshair = ({ color = 'white' }) => {
  const crosshairX = useRef(new Animated.Value(0)).current;
  const crosshairY = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        // Update crosshair position as the user moves their finger
        Animated.timing(crosshairX, {
          toValue: gestureState.moveX,
          duration: 0,
          useNativeDriver: false,
        }).start();

        Animated.timing(crosshairY, {
          toValue: gestureState.moveY,
          duration: 0,
          useNativeDriver: false,
        }).start();
      },
    })
  ).current;

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      {/* Vertical Line */}
      <Animated.View
        style={[
          styles.verticalLine,
          {
            left: crosshairX,
            backgroundColor: color,
          },
        ]}
      />
      {/* Horizontal Line */}
      <Animated.View
        style={[
          styles.horizontalLine,
          {
            top: crosshairY,
            backgroundColor: color,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'absolute',
  },
  horizontalLine: {
    position: 'absolute',
    width: '100%',
    height: 1,
  },
  verticalLine: {
    position: 'absolute',
    height: '100%',
    width: 1,
  },
});

export default MobileCrosshair;
