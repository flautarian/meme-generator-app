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
import { Platform } from 'react-native';
import { getRandomMeme } from 'src/hooks/useTemplates';
import { useSharedValue, withTiming } from 'react-native-reanimated';
import LavaLampBackground from 'src/components/LavaLampBackgroundComponent/LavaLampBackground';
import randomColor from 'randomcolor';
import CaptureOption from 'src/components/CaptureOptionComponent/CaptureOption';
import domtoimage from 'dom-to-image';
import EditableText from 'src/components/EditableTextComponent/EditableText';
import DragableOption from 'src/components/DragableOptionComponent/DragableOption';
import DraggableContainer from 'src/components/DragableContainerComponent/DragableContainer';

const MemeCreate = () => {

  const { width, height } = Dimensions.get('window');

  const [currentMeme, setCurrentMeme] = useState(null);

  const [texts, setTexts] = useState([]);

  const [selectedTextIndex, setSelectedTextIndex] = useState(-1);

  const memeContainerRef = useRef(null);

  const progress = useSharedValue(0);

  const initColor = useSharedValue("");

  // Deletes the text element
  const deleteText = useCallback((index) => {
    setTexts((prevTexts) => {
      const newTexts = [...prevTexts];
      newTexts.splice(index, 1); // Delete the specific element
      return newTexts;
    });
    setSelectedTextIndex(-1);
  }, [texts]);

  // Handles the capture of the img meme to share it
  const handleCapture = async () => {
    try {
      // Add a slight delay to ensure rendering is complete
      setTimeout(async () => {
        let uri = "";
        if (Platform.OS === "web") {
          uri = await domtoimage.toPng(memeContainerRef.current, {
            quality: 0.95
          });
        }
        else {
          uri = await captureRef(memeContainerRef, {
            format: "png",
            quality: 0.9,
            result: "tmpfile",
            useRenderInContext: (Platform.OS === "ios"),
            snapshotContentContainer: true,
            handleGLSurfaceViewOnAndroid: true,
          });
        }

        console.log("Saved meme:", uri);

        // Ensure the captured URI is valid before copying to clipboard
        //await Clipboard.setImageAsync(uri);
        alert("Meme copied to clipboard!");
      }, 100); // 100ms delay
    } catch (error) {
      console.error("Error capturing or copying image:", error);
    }
  };

  // Handles the arrangement of the text elements
  const onArrangeEnd = useCallback(
    (type, x, y) => {
      if (type === "text") {
        setTexts((prevTexts) => {
          let textLabel = "Label " + (prevTexts.length + 1);
          const newItem = {
            value: textLabel,
            type: "text",
            x: x - 75,
            y: y - 50,
            width: 150,
            height: 50,
            rotation: 0
          };
          setSelectedTextIndex(prevTexts.length);
          return [...prevTexts, newItem];
        });
      }
    },
    [texts],
  );

  // Trigger the gradient animation
  // Handles the random selection of the meme if case of no election from drawer
  useEffect(() => {
    progress.value = withTiming(1, { duration: 3000 });
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
        <View
          style={{ width: width * (Platform.OS === 'web' ? 0.5 : 0.9), height: height, zIndex: 1 }}
          collapsable={false}
          ref={memeContainerRef}>
          {/* Draggable Options */}
          <DragableOption
            key={`dragable-text-option`}
            onArrangeEnd={(x, y) => onArrangeEnd("text", x, y)}
            initialPosition={{ x: (width * (Platform.OS === 'web' ? 0.5 : 0.8)) * 0.9, y: height * 0.3 }} />

          {/* Capture/Share Button */}
          <CaptureOption onCapture={handleCapture} initialPosition={{ x: (width * (Platform.OS === 'web' ? 0.5 : 0.8)) * 0.9, y: height * 0.4 }} />


          <Pressable
            maxPointers={1}
            style={
              { marginTop: height * (Platform.OS === 'web' ? 0.05 : 0), height: height, textAlign: 'center' }}
            onPress={() => {
              setSelectedTextIndex(-1);
            }}>
            {/* Meme Image display */}
            {currentMeme && <ZoomableImage source={{ uri: currentMeme.img }} />}
            {/* Draggable Texts */}
            {texts.map((item, index) => (
              item.type === "text" &&
              <DraggableContainer
                key={`dragable-container-${index} - ${item.x} - ${item.y}`}
                item={item}
                index={index}
                selected={index === selectedTextIndex}
                onSelect={(i) => setSelectedTextIndex(i)}
                onDelete={() => deleteText(index)}
              >
                <EditableText />
              </DraggableContainer>
            ))
            }
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
    zIndex: 0,
  },
  viewcontainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  captureButton: {
    width: 60,
    height: 60,
    borderRadius: 40,
    backgroundColor: "red",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  }
});

export default MemeCreate;