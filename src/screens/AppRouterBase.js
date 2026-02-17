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
    const RightDrawer = createDrawerNavigator();
    const LeftDrawer = createDrawerNavigator();

    const [currentMeme, setCurrentMeme] = useState(null);
    const [onChangedTemplates, setOnChangedTemplates] = useState(false);

    //we fade out bottom nav bar in android
    if (Platform.OS === 'android') {
        NavigationBar.setVisibilityAsync('hidden');
    }

    const changeMemeTemplate = (item) =>
        setCurrentMeme(item);

    return (
        <NavigationContainer>
            <LeftDrawer.Navigator
                drawerContent={(props) => <MemeOptions
                    {...props}
                    onChangedTemplates={setOnChangedTemplates} />}
                screenOptions={{
                    drawerPosition: 'left',
                    swipeEnabled: false,
                }}
            >
                <LeftDrawer.Screen name="Main" options={{ headerShown: false }}>
                    {(props) => (
                        <RightDrawer.Navigator
                            drawerContent={(props) =>
                                <MemeSelect
                                    {...props}
                                    onSelectMeme={changeMemeTemplate}
                                    onChangedTemplates={setOnChangedTemplates} />
                            }
                            screenOptions={{
                                drawerPosition: 'right',
                                swipeEnabled: false,
                            }}
                        >
                            <RightDrawer.Screen name="MemeCreate" options={{ headerShown: false }}>
                                {(props) => <MemeCreate {...props} currentMeme={currentMeme} />}
                            </RightDrawer.Screen>
                        </RightDrawer.Navigator>
                    )}
                </LeftDrawer.Screen>
            </LeftDrawer.Navigator>
        </NavigationContainer>
    );
};

export default AppRouterBase;
