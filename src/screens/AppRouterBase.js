import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import MemeCreate from './MemeCreate';
import MemeSelect from './MemeSelect';
import MemeOptions from './MemeOptions';
import { Platform } from 'expo-modules-core';
import { createDrawerNavigator } from '@react-navigation/drawer';
import * as NavigationBar from 'expo-navigation-bar';

const AppRouterBase = () => {
    const Drawer = createDrawerNavigator();
    const LeftDrawer = createDrawerNavigator();

    const [currentMeme, setCurrentMeme] = useState(null);
    const [onChangedTemplates, setOnChangedTemplates] = useState(false);
    const [onChangedDecorations, setOnChangedDecorations] = useState(false);

    //we fade out bottom nav bar in android
    if(Platform.OS === 'android') {
        NavigationBar.setVisibilityAsync('hidden');
    }

    const changeMemeTemplate = (item) => {
        console.log("changeMemetTemplate", item);
        setCurrentMeme(item);
    }

    const LeftDrawerScreen = () => (
        <LeftDrawer.Navigator
            drawerContent={(props) => <MemeOptions
                {...props}
                onChangedTemplates={setOnChangedTemplates}
                onChangedDecorations={setOnChangedDecorations} />}
            screenOptions={{
                drawerPosition: 'left',
                swipeEnabled: false,
            }}
        >
            <LeftDrawer.Screen name="Main" options={{ headerShown: false }}>
                {(props) => (
                    <Drawer.Navigator
                        drawerContent={(props) =>
                            <MemeSelect
                                {...props}
                                onSelectMeme={changeMemeTemplate}
                                onChangedTemplates={setOnChangedTemplates}
                                onChangedDecorations={setOnChangedDecorations} />
                        }
                        screenOptions={{
                            drawerPosition: 'right',
                            swipeEnabled: false,
                        }}
                    >
                        <Drawer.Screen name="MemeCreate" options={{ headerShown: false }}>
                            {(props) => <MemeCreate {...props} currentMeme={currentMeme} />}
                        </Drawer.Screen>
                    </Drawer.Navigator>
                )}
            </LeftDrawer.Screen>
        </LeftDrawer.Navigator>
    );

    return (
        <NavigationContainer>
            <LeftDrawerScreen />
        </NavigationContainer>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: 'relative', // Ensures children are positioned relative to this container
    },
});

export default AppRouterBase;
