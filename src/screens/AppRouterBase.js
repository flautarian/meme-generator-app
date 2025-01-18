import React from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated from 'react-native-reanimated';
import { NavigationContainer } from '@react-navigation/native';
import MemeCreate from './MemeCreate';
import MemeSelect from './MemeSelect';
import { createDrawerNavigator } from '@react-navigation/drawer';

const AppRouterBase = () => {
    const Drawer = createDrawerNavigator();

    return (
        <Animated.View style={styles.container}>
            {/* Gradient Background */}
            
                        {/* <MemeSelect /> */}
            <NavigationContainer>
                <Drawer.Navigator
                    drawerContent={() => (
                        <Text>TEST</Text>
                    )}
                >
                    <Drawer.Screen name="MemeCreate" component={MemeCreate} />
                </Drawer.Navigator>
            </NavigationContainer>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: 'relative', // Ensures children are positioned relative to this container
    },
});

export default AppRouterBase;
