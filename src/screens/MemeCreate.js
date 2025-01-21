import {
  View,
  StyleSheet,
  SafeAreaView,
  Pressable,
  Text,
  Dimensions,
} from 'react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { captureRef } from "react-native-view-shot";
import ZoomableImage from 'src/components/ZoomableImageComponent/ZoomableImage';
import DraggableText from 'src/components/DragableTextComponent/DragableText';
import DragableOption from 'src/components/DragableOptionComponent/DragableOption';
import { Platform } from 'react-native';
import { getRandomMeme } from 'src/hooks/useTemplates';
import { interpolateColor, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import LavaLampBackground from 'src/components/LavaLampBackgroundComponent/LavaLampBackground';
import randomColor from 'randomcolor';

const MemeCreate = () => {

  const { width, height } = Dimensions.get('window');

  const [currentMeme, setCurrentMeme] = useState(null);

  const [texts, setTexts] = useState([]);

  const [selectedTextIndex, setSelectedTextIndex] = useState(-1);

  const memeContainerRef = useRef(null);

  const progress = useSharedValue(0);

  const initColor = useSharedValue("");

  // Trigger the gradient animation
  useEffect(() => {
    progress.value = withTiming(1, { duration: 3000 }); // Animate from 0 to 1 in 3 seconds
  }, []);

  // Handles the capture of the img meme to share it
  const handleCapture = async () => {
    const uri = await captureRef(memeContainerRef, { format: "png", quality: 0.8 });
    console.log("Saved meme:", uri);
  };

  // Handles the arrangement of the text elements
  const handleArrange = useCallback(
    (type, x, y) => {
      setTexts((prevTexts) => {
        let textLabel = "Label " + (prevTexts.length + 1);
        const newText = { text: textLabel, x, y };
        setSelectedTextIndex(prevTexts.length);
        return [...prevTexts, newText];
      });
    },
    [texts],
  );

  // Handles the random selection of the meme if case of no election from drawer
  useEffect(() => {
    if (!currentMeme) {
      setTimeout(async () => {
        const meme = await getRandomMeme();
        setCurrentMeme(meme);
      }, 1);
    }
    // random color background generation
    initColor.value = randomColor({ count: 1, luminosity: 'dark' })[0];
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Gradient Background */}
      <LavaLampBackground count={10} hue={initColor.value} />
      {/* Meme Container */}
      <View style={styles.viewcontainer}>
        {/* Margin 1 */}
        {Platform.OS === 'web' && <Text style={{ width: width * 0.25, height: height, textAlign: 'center' }}> TEST </Text>}
        {/* Meme Image */}
        <View style={{ width: width * (Platform.OS === 'web' ? 0.5 : 0.9), height: height, textAlign: 'center' }} ref={memeContainerRef}>
          <Pressable style={{ height: height, textAlign: 'center' }} onPress={() => setSelectedTextIndex(-1)}>
            {currentMeme && <ZoomableImage source={{ uri: currentMeme.img }} />}
          </Pressable>
          {/* Draggable Texts */}
          {texts.map((item, index) => (
            <DraggableText
              key={`dragable-text-${index}`}
              text={item.text}
              initPosition={{ x: item.x, y: item.y }}
              index={index}
              selected={index === selectedTextIndex}
              onSelect={(i) => setSelectedTextIndex(i)}
            />
          ))
          }
          {/* Draggable Options */}
          <DragableOption
            key={`dragable-text-option`}
            onArrangeEnd={(x, y) => handleArrange("text", x, y)}
            initialPosition={{ x: 0, y: 50 }} />
          <Pressable style={styles.button} onPress={() => handleCapture}>
            <Text>📷</Text>
          </Pressable>
        </View>
        {/* Margin 2 */}
        {Platform.OS === 'web' && <Text style={{ width: width * 0.25, height: height, textAlign: 'center' }}> TEST </Text>}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  gradientBackground: {
    ...StyleSheet.absoluteFillObject, // Makes the gradient cover the entire screen
    zIndex: -1, // Places the gradient below the navigation content
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginVertical: 10,
    paddingHorizontal: 10,
  },
  viewcontainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
});

export default MemeCreate;