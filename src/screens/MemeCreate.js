import {
  StyleSheet,
  SafeAreaView,
  Pressable,
  Dimensions,
  Image,
} from 'react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { captureRef } from "react-native-view-shot";
import { Platform } from 'react-native';
import { useSharedValue, withTiming } from 'react-native-reanimated';
import LavaLampBackground from 'src/components/LavaLampBackgroundComponent/LavaLampBackground';
import randomColor from 'randomcolor';
import domtoimage from 'dom-to-image';
import EditableText from 'src/components/EditableTextComponent/EditableText';
import DragableOption from 'src/components/DragableOptionComponent/DragableOption';
import DraggableContainer from 'src/components/DragableContainerComponent/DragableContainer';
import DragableTemplate from 'src/components/DragableTemplateComponent/DragableTemplate';
import { Camera, Edit, MessageSquare } from 'react-native-feather';
import React from 'react';
import EditableDecoration from 'src/components/EditableDecorationComponent/EditableDecoration';
import StaticOption from 'src/components/StaticOptionComponent/StaticOption';

const MemeCreate = ({ navigation, currentMeme }) => {

  const { width, height } = Dimensions.get('window');

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
    (type, x, y, value) => {
      if (!value)
        return;
      setTexts((prevTexts) => {
        const newItem = {
          value,
          type,
          x: x - (x > width - 150 ? 150 : 75) + (x < 0 ? Math.abs(x) : 0),
          y: y - (y > height - 150 ? 150 : 50) + (y < 0 ? Math.abs(y) : 0),
          width: 150,
          height: 50,
          rotation: 0
        };
        setSelectedTextIndex(prevTexts.length);
        return [...prevTexts, newItem];
      });
    },
    [texts],
  );

  // Trigger the gradient animation
  useEffect(() => {
    progress.value = withTiming(1, { duration: 3000 });
    // random color background generation
    initColor.value = randomColor({ count: 1, luminosity: 'dark' })[0];
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Gradient Background */}
      <LavaLampBackground count={10} hue={initColor.value} />

      {/* Capture/Share Button */}
      <StaticOption onPress={() => navigation.openDrawer()} initialPosition={{ x: width - 75, y: height * 0.25 }}>
        <Edit stroke="black" fill="#fff" width={40} height={40} />
      </StaticOption>

      {/* Draggable Options */}
      {/* Dragable Decoration display */}
      <DragableTemplate
        onMenuOpenCallBack={() => setSelectedTextIndex(-1)}
        onArrangeEnd={(x, y, value) => onArrangeEnd("decoration", x, y, value)}
        initialPosition={{ x: width - width * 0.75 - 25, y: height * 0.85 }}
        parentDimensions={{ width: width, height: height }} />

      {/* Draggable Text Option */}
      <DragableOption
        key={`dragable-text-option`}
        onArrangeEnd={(x, y, value) => onArrangeEnd("text", x, y, value)}
        initialPosition={{ x: width - width * 0.5 - 25, y: height * 0.85 }}>
        <MessageSquare stroke="black" fill="#fff" width={40} height={40} />
      </DragableOption>

      {/* Capture/Share Button */}
      <StaticOption onPress={handleCapture} initialPosition={{ x: width - width * 0.25 - 25, y: height * 0.85 }}>
        <Camera stroke="black" fill="#fff" width={40} height={40} />
      </StaticOption>


      {/* Draggable Texts */}
      {texts.map((item, index) => {
        const child = item.type === "text" ? <EditableText /> : <EditableDecoration />;
        return <DraggableContainer
          key={`dragable-container-${index} - ${item.x} - ${item.y}`}
          item={item}
          index={index}
          selected={index === selectedTextIndex}
          onSelect={(i) => setSelectedTextIndex(i)}
          onDelete={() => deleteText(index)}
        >
          {child}
        </DraggableContainer>
      })
      }

      <Pressable
        maxPointers={1}
        style={styles.imageWrapper}
        onPress={() => {
          setSelectedTextIndex(-1);
        }}>
        {/* Meme Image */}
        {currentMeme && (
          <Image source={currentMeme.blob} name={currentMeme.name} resizeMode="contain" style={styles.memeImage} />
        )}
      </Pressable>
    </SafeAreaView >
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    zIndex: 0
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
  },
  imageWrapper: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  memeImageWrapper: {
    position: "absolute",
    width: "100%",
    height: "100%",
    zIndex: 10,
    right: Dimensions.get('window').width * 0.05,
    top: Dimensions.get('window').height * 0.05
  },
  memeImage: {
    width: '100%',
    height: '100%',
    maxWidth: Dimensions.get('window').width,
    maxHeight: Dimensions.get('window').height,
  },
});

export default MemeCreate;