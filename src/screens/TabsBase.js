import * as React from 'react';
import { useWindowDimensions } from 'react-native';
import { TabView, SceneMap } from 'react-native-tab-view';
import MemeSelect from './MemeSelect';
import MemeCreate from './MemeCreate';
import routes from 'src/routes/tabRoutes';

const renderScene = SceneMap({
    memeCreate: MemeCreate,
    memeSelect: MemeSelect,
});

const TabsBase = () => {
    const layout = useWindowDimensions();
    const [index, setIndex] = React.useState(0);

    return (
        <TabView
            navigationState={{ index, routes }}
            renderScene={renderScene}
            onIndexChange={setIndex}
            initialLayout={{ width: layout.width }}
        />
    );
}

export default TabsBase;