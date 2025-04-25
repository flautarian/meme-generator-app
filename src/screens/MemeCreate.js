import React from 'react';
import {
  StyleSheet,
  SafeAreaView,
  Pressable,
  Dimensions,
  Image,
  View,
} from 'react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ViewShot from "react-native-view-shot";
import { Platform } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';
import { Camera, Edit, MessageSquare, Tool, ChevronUp } from 'react-native-feather';
import * as Sharing from 'expo-sharing';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import DraggableContainer from 'src/components/DragableContainerComponent/DragableContainer';
import DragableDecoration from 'src/components/DragableDecorationComponent/DragableDecoration';
import EditableDecoration from 'src/components/EditableDecorationComponent/EditableDecoration';
import StaticOption from 'src/components/StaticOptionComponent/StaticOption';
import { Utils } from 'src/utils/Utils';
import memeSelectImages from 'src/utils/memeSelectImages';
import DragableOption from 'src/components/DragableOptionComponent/DragableOption';
import EditableText from 'src/components/EditableTextComponent/EditableText';
import LavaLampBackground from 'src/components/Backgrounds/LavaLampBackgroundComponent/LavaLampBackground';
import { useConfirmation } from 'src/contexts/ConfirmationContext';
import { useConfig } from 'src/contexts/ConfigContext';
import GradientBackground from 'src/components/Backgrounds/GradientBackgroundComponent/GradientBackground';

const MemeCreate = ({ navigation, currentMeme }) => {

  const { t, i18n } = useTranslation();
  const EMPTY_MEME = memeSelectImages.find(ms => ms.language === i18n.language)?.blob || "";
  const { width, height } = Dimensions.get('window');
  const BOTTOM_BTN_HEIGHT = height * (Platform.OS === 'web' ? 0.15 : 0.12);
  const BOTTOM_BUTTONS_Y_OFFSET = height * (Platform.OS === 'web' ? 0.17 : 0.14);

  const [texts, setTexts] = useState([]);
  const [selectedTextIndex, setSelectedTextIndex] = useState(-1);
  const memeContainerRef = useRef(null);


  // bottom drawer
  const [isBotDrawerOpened, setIsBotDrawerOpened] = useState(false);
  const [selectedDecoration, setSelectedDecoration] = useState("");
  const botBtnAnimation = useSharedValue(0);
  const botButtonsYOffset = useSharedValue(0);

  const [capturePosition, setCapturePosition] = useState({ x: width - width * 0.25 - 25, y: height + 50 + botButtonsYOffset.get() });
  const [dragableTextPosition, setDragableTextPosition] = useState({ x: width - width * 0.5 - 25, y: height + 50 + botButtonsYOffset.get() });
  const [dragableDecorationPosition, setDragableDecorationPosition] = useState({ x: width - width * 0.75 - 25, y: height + 50 + botButtonsYOffset.get() });


  // decorations drawer / toasts
  const { handleCloseBottomDrawer, addToast } = useConfirmation();

  // Options config
  const { config, initColor, initLightColor, initDarkColor } = useConfig();

  const botBtnAnimatedStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    top: height * (Platform.OS === 'web' ? 0.85 : 0.9),
    left: 0,
    right: 0,
    zIndex: 5,
    width: '100%',
    height: Platform.OS === 'web' ? '15dvh' : height * 0.15,
    transform: [
      { translateY: botBtnAnimation.value }
    ],
  }));

  const bottomDrawerSpringConfig = {
    duration: 250,
    dampingRatio: 2,
    stiffness: 100,
  };

  useEffect(() => {
    // if true, we show the bottom drawer
    botBtnAnimation.set(withSpring(isBotDrawerOpened || config?.staticBDrawer ? -BOTTOM_BTN_HEIGHT : 0, bottomDrawerSpringConfig));
    botButtonsYOffset.set(isBotDrawerOpened || config?.staticBDrawer ? -BOTTOM_BUTTONS_Y_OFFSET : 0, bottomDrawerSpringConfig);

    setCapturePosition((prev) => ({ ...prev, y: height + 50 + botButtonsYOffset.get() }));
    setDragableTextPosition((prev) => ({ ...prev, y: height + 50 + botButtonsYOffset.get() }));
    setDragableDecorationPosition((prev) => ({ ...prev, y: height + 50 + botButtonsYOffset.get() }));
    
  }, [isBotDrawerOpened, config?.staticBDrawer]);

  const deleteText = useCallback((index) => {
    setTexts((prevTexts) => {
      const newTexts = [...prevTexts];
      newTexts.splice(index, 1);
      return newTexts;
    });
    setSelectedTextIndex(-1);
    addToast(t('memeCreate.elementDeleted'), 3000);
  }, [texts]);

  // Handles the capture of the img meme to share it
  const handleCapture = async () => {
    try {
      // disable selection of any item
      setSelectedTextIndex(-1);
      // hide bottom drawer
      handleCloseBottomDrawer();
      // Add a slight delay to ensure rendering is complete
      setTimeout(async () => {
        memeContainerRef.current.capture().then(async (uri) => {
          if (Platform.OS === "web") {
            let uriFileFormat = await Utils.convertBase64ToImage(uri);
            navigator.clipboard.write([uriFileFormat]);
            addToast(t('memeCreate.imageCopied'), 3000);
          }
          else {
            const isAvailableSharing = await Sharing.isAvailableAsync();
            if (isAvailableSharing) {
              Sharing.shareAsync(uri);
            }
          }
        });
      }, 100);
    } catch (error) {
      console.error("Error capturing or copying image:", error);
      addToast(t('memeCreate.shareError'), 3000);
    }
  };

  // Handles the arrangement of the text elements
  const onArrangeEnd = useCallback(
    (type, x, y, value) => {
      if (!value)
        return;
      setIsBotDrawerOpened(false);
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
      addToast(
        type === 'text'
          ? t('memeCreate.newTextAdded')
          : t('memeCreate.newDecorationAdded'),
        3000
      );
      return true;
    },
    [texts, t, isBotDrawerOpened],
  );

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        {/* Gradient Background */}
        {config?.backgroundType === "lava" && <LavaLampBackground count={10} hue={initColor} />}
        {config?.backgroundType === "gradient" && <GradientBackground startColor={initLightColor} endColor={initDarkColor} duration={3000} />}

        {/* Meme image container */}
        <ViewShot ref={memeContainerRef} style={styles.memeWrapper} draggable={false}>
          {/* Draggable Texts / decorations */}
          {texts.map((item, index) => {
            const child = item.type === "text" ? <EditableText item={{ value: item.value }} index={index} /> : <EditableDecoration item={item} index={index} />;
            return <DraggableContainer
              key={`dragable-container-${index} - ${item.x} - ${item.y}`}
              x={item.x}
              y={item.y}
              width={item.width}
              height={item.height}
              rotation={item.rotation}
              index={index}
              selected={index === selectedTextIndex}
              onSelect={(i) => setSelectedTextIndex(i)}
              onDelete={() => deleteText(index)}
              draggable={false}
              resizeMode={config?.dragableResizeMode}
            >
              {child}
            </DraggableContainer>
          })}

          {/* Meme Image */}
          <Pressable
            maxPointers={1}
            style={styles.imageWrapper}
            onPress={() => {
              // disable selection of any item
              setSelectedTextIndex(-1);
              // hide options drawer
              setIsBotDrawerOpened(false);
              // hide bottom drawer
              handleCloseBottomDrawer();
            }}>
            {/* Meme Image */}
            {currentMeme && (
              <Image source={currentMeme.blob} name={currentMeme.name} resizeMode="contain" style={styles.memeImage} />
            )}
            {!currentMeme && EMPTY_MEME && (
              <Image source={EMPTY_MEME} name={EMPTY_MEME} resizeMode="contain" style={styles.memeImage} />
            )}
          </Pressable>
        </ViewShot>


        {/* Open drawer Button */}
        <DragableOption
          key={`open-meme-drawer-option`}
          onArrangeEnd={() => navigation.openDrawer()}
          initialPosition={{ x: width - 75, y: height * 0.75 }}
          blockDragY={true}
          limitDistance={40}
          style={[styles.draggableRightBox, { backgroundColor: initColor }]}
          animateButton={false}>
          <Edit stroke="black" fill="#fff" width={40} height={40} />
        </DragableOption>

        {/* Open drawer options Button */}
        <DragableOption
          key={`open-options-drawer-option`}
          onArrangeEnd={() => navigation.getParent().openDrawer()}
          initialPosition={{ x: -45, y: height * 0.75 }}
          blockDragY={true}
          limitDistance={40}
          style={[styles.draggableLeftBox, { backgroundColor: initColor }]}
          animateButton={false}>
          <Tool stroke="black" fill="#fff" width={40} height={40} />
        </DragableOption>

        {/* Bottom drawer */}
        <Animated.View style={[botBtnAnimatedStyle, { flex: 1, justifyContent: 'center', alignItems: 'center', display: config?.staticBDrawer ? "none" : "flex" }]} key={`bot-drawer-btn`}>
          <Pressable onPress={() => setIsBotDrawerOpened(!isBotDrawerOpened)} >
            <View style={{ width: 100, height: 50, borderRadius: 20, backgroundColor: initColor, borderWidth: 1, borderColor: initLightColor, justifyContent: 'center', alignItems: 'center' }}>
              {<ChevronUp style={{ transform: [{ rotate: isBotDrawerOpened ? '180deg' : '0deg' }], animationDuration: 300 }} stroke="black" width={20} height={20} />}
            </View>
          </Pressable>
        </Animated.View>

        <DragableDecoration
          key={`dragable-decoration-option`}
          onArrangeEnd={(x, y, value) => onArrangeEnd("decoration", x, y, value)}
          selectedDecoration={selectedDecoration}
          initialPosition={dragableDecorationPosition}
          parentDimensions={{ width: width, height: height }}
          limitDistance={100}
          style={[styles.draggableBox, { backgroundColor: initColor }]} />
        <DragableOption
          key={`dragable-text-option`}
          onArrangeEnd={(x, y, value) => onArrangeEnd("text", x, y, value)}
          initialPosition={dragableTextPosition}
          limitDistance={100}
          style={[styles.draggableBox, { backgroundColor: initColor }]}>
          <MessageSquare stroke="black" fill="#fff" width={40} height={40} />
        </DragableOption>
        <DragableOption
          key={`capture-share-button`}
          onArrangeEnd={handleCapture}
          initialPosition={capturePosition}
          style={[styles.draggableBox, { backgroundColor: initColor }]}
          blockDragY={true}
          blockDragX={true}>
          <Camera stroke="black" fill="#fff" width={40} height={40} />
        </DragableOption>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    zIndex: 0
  },
  topBar: {
    position: 'absolute',
    top: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    zIndex: 1000,
  },
  memeWrapper: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  imageWrapper: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  memeImage: {
    width: '100%',
    height: '100%',
    maxWidth: Dimensions.get('window').width,
    maxHeight: Dimensions.get('window').height,
  },
  draggableBox: {
    transformOrigin: '0% 0%',
    zIndex: 10,
    width: 60,
    height: 60,
    backgroundColor: '#ffffff',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 50,
  },
  draggableRightBox: {
    transformOrigin: '-50% 0%',
    zIndex: 10,
    width: 120,
    height: 60,
    backgroundColor: '#ffffff',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 50,
    borderBottomLeftRadius: 50,
  },
  draggableLeftBox: {
    transformOrigin: '-50% 0%',
    zIndex: 10,
    width: 120,
    height: 60,
    backgroundColor: '#ffffff',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopRightRadius: 50,
    borderBottomRightRadius: 50,
  }
});

export default MemeCreate;