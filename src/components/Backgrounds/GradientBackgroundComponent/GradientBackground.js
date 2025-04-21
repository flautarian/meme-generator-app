// GradientComponent.js
import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';

const GradientBackground = ({ startColor, endColor }) => {
    const animatedValue = new Animated.Value(0);


    const styles = useMemo(
        () =>
            StyleSheet.create({
                container: {
                    ...StyleSheet.absoluteFillObject,
                    justifyContent: 'center',
                    alignItems: 'center',
                }
            }),
        []
    );

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(animatedValue, {
                    toValue: 1,
                    duration: 1500,
                    useNativeDriver: true,
                })
                ,
                Animated.timing(animatedValue, {
                    toValue: 0,
                    duration: 1500,
                    useNativeDriver: true,
                })
            ])
            , {
                iterations: -1,
                easing: Easing.inOut(Easing.elastic),
            }
        ).start();
    }, [animatedValue]);

    const backgroundColor = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [startColor, endColor],
    });

    return (
        <Animated.View style={[styles.container, { backgroundColor }]} />
    );
};

export default GradientBackground;
