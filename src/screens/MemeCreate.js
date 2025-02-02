import {
  View,
  StyleSheet,
  SafeAreaView,
  Pressable,
  Dimensions,
} from 'react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { captureRef } from "react-native-view-shot";
import ZoomableImage from 'src/components/ZoomableImageComponent/ZoomableImage';
import { Platform } from 'react-native';
import { getRandomMeme } from 'src/hooks/useTemplates';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import LavaLampBackground from 'src/components/LavaLampBackgroundComponent/LavaLampBackground';
import randomColor from 'randomcolor';
import CaptureOption from 'src/components/CaptureOptionComponent/CaptureOption';
import domtoimage from 'dom-to-image';
import EditableText from 'src/components/EditableTextComponent/EditableText';
import DragableOption from 'src/components/DragableOptionComponent/DragableOption';
import DraggableContainer from 'src/components/DragableContainerComponent/DragableContainer';
import DragableTemplate from 'src/components/DragableTemplateComponent/DragableTemplate';
import { MessageSquare } from 'react-native-feather';
import Slider from '@react-native-community/slider';
import { ScrollView } from 'react-native-gesture-handler';
import React from 'react';

const MemeCreate = () => {

  const { width, height } = Dimensions.get('window');

  const [currentMeme, setCurrentMeme] = useState(null);

  const [texts, setTexts] = useState([]);

  const [selectedTextIndex, setSelectedTextIndex] = useState(-1);

  const memeContainerRef = useRef(null);

  const progress = useSharedValue(0);

  const initColor = useSharedValue("");

  const imageScale = useSharedValue(0.75);

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
            x: (x - 75) * imageScale.value,
            y: (y - 50) * imageScale.value,
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


  // animated style
  const imageAnimatedScaleStyle = useAnimatedStyle(() => ({
    transform: [
      { scaleX: imageScale.value },
      { scaleY: imageScale.value },
    ],
    //transformOrigin: '50% 50%',
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
  }));

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

      {/* Draggable Options */}

      {/* Draggable Text Option */}
      <DragableOption
        key={`dragable-text-option`}
        onArrangeEnd={(x, y) => onArrangeEnd("text", x, y)}
        initialPosition={{ x: width - width * 0.2, y: height * 0.2 }}>
        <MessageSquare stroke="black" fill="#fff" width={40} height={40} />
      </DragableOption>

      {/* Dragable Decoration display */}
      <DragableTemplate
        onArrangeEnd={(template, x, y) => onArrangeEnd(template, x, y)}
        initialPosition={{ x: width - width * 0.2, y: height * 0.4 }}
        parentDimensions={{ width: width - width * 0.2, height: height }} />

      {/* Capture/Share Button */}
      <CaptureOption onCapture={handleCapture} initialPosition={{ x: width - width * 0.2, y: height * 0.3 }} />

      <Pressable
        maxPointers={1}
        style={{ flex: 1, justifyContent: 'center', width: width, height: height }}
        onPress={() => {
          setSelectedTextIndex(-1);
        }}>
        <ScrollView
          scrollEnabled={selectedTextIndex === -1}>

          {/* Meme Image display */}
          {currentMeme && <Animated.View style={[imageAnimatedScaleStyle]}>

            <ZoomableImage source={currentMeme.blob}>
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
              </ZoomableImage>
          </Animated.View>}
        </ScrollView>
    </Pressable>
      {/* Slider for the meme size */ }
  <View style={[Platform.OS == "web" ? { left: width * 0.4, bottom: height * 0.05 } : { left: width * 0.2, bottom: height * 0.05 }, { position: 'absolute' }]}>
    <Slider
      style={[Platform.OS == "web" ? { width: width * 0.2, height: height * 0.05 } : { width: width * 0.6 }]}
      minimumValue={0.25}
      maximumValue={2}
      value={imageScale.value}
      onValueChange={(value) => imageScale.value = value}
      step={0.05}
      minimumTrackTintColor="#FFFFFF"
      maximumTrackTintColor="#000000"
    />
  </View>
    </SafeAreaView >
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    zIndex: 0,
    width: "fit-content",
    height: "fit-content",
  },
  imageContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: "fit-content",
    height: "fit-content",
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