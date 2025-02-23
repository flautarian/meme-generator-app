import React, { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated from 'react-native-reanimated';
import { NavigationContainer } from '@react-navigation/native';
import MemeCreate from './MemeCreate';
import MemeSelect from './MemeSelect';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { useEffect } from 'react';
import { getRandomMeme } from 'src/hooks/useTemplates';

const AppRouterBase = () => {
    const Drawer = createDrawerNavigator();

    const [currentMeme, setCurrentMeme] = useState(null);

    useEffect(() => {
        if (!currentMeme) {
            setTimeout(async () => {
                const meme = await getRandomMeme();
                setCurrentMeme(meme);
            }, 1);
        }
    }, []);

    const changeMemeTemplate = (item) => {
        console.log("changeMemetTemplate", item);
        setCurrentMeme(item);
    }

    return (
        <NavigationContainer>
            <Drawer.Navigator
                drawerContent={(props) =>
                    <MemeSelect {...props} onSelectMeme={changeMemeTemplate} />
                }
                screenOptions={
                    {
                        drawerPosition: 'right',
                    }
                }
            >
                <Drawer.Screen name="MemeCreate" options={{ headerShown: false }}>
                    {(props) => <MemeCreate {...props} currentMeme={currentMeme} />}
                </Drawer.Screen>
            </Drawer.Navigator>
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
