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
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { Camera, Edit, MessageSquare, Tool, ChevronUp } from 'react-native-feather';
import { DraggableContainer } from 'react-native-draggable-container';
import * as Sharing from 'expo-sharing';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import EditableDecoration from 'src/components/EditableDecorationComponent/EditableDecoration';
import { Utils } from 'src/utils/Utils';
import memeSelectImages from 'src/utils/memeSelectImages';
import EditableText from 'src/components/EditableTextComponent/EditableText';
import LavaLampBackground from 'src/components/Backgrounds/LavaLampBackgroundComponent/LavaLampBackground';
import { useConfirmation } from 'src/contexts/ConfirmationContext';
import { useConfig } from 'src/contexts/ConfigContext';
import GradientBackground from 'src/components/Backgrounds/GradientBackgroundComponent/GradientBackground';
import MemeDecorationsList from 'src/components/MemeDecorationsListComponent/MemeDecorationsList';
import { Gesture } from 'react-native-gesture-handler';
import { getRandomDecoration } from 'src/hooks/useDecorations';
import { DraggableButton } from 'react-native-draggable-button';

const MemeCreate = ({ navigation, currentMeme }) => {

  const { t, i18n } = useTranslation();
  const EMPTY_MEME = memeSelectImages.find(ms => ms.language === i18n.language)?.blob || "";
  const { width, height } = Dimensions.get('window');
  const BOTTOM_BTN_HEIGHT = height * (Platform.OS === 'web' ? 0.15 : 0.12);
  const BOTTOM_BUTTONS_Y_OFFSET = height * (Platform.OS === 'web' ? 0.17 : 0.14);

  const [decorations, setDecorations] = useState([]);
  const memeContainerRef = useRef(null);


  // bottom drawer
  const [isBotDrawerOpened, setIsBotDrawerOpened] = useState(false);
  const selectedDecoration = useRef("");
  const botBtnAnimation = useSharedValue(0);
  const botButtonsYOffset = useSharedValue(0);

  const [capturePosition, setCapturePosition] = useState({ x: width - width * 0.25 - 25, y: height + 50 + botButtonsYOffset.get() });
  const [dragableTextPosition, setDragableTextPosition] = useState({ x: width - width * 0.5 - 25, y: height + 50 + botButtonsYOffset.get() });
  const [dragableDecorationPosition, setDragableDecorationPosition] = useState({ x: width - width * 0.75 - 25, y: height + 50 + botButtonsYOffset.get() });


  // decorations drawer / toasts
  const { handleOpenBottomDrawer, handleCloseBottomDrawer, addToast } = useConfirmation();

  // Options config
  const { config, initColor, initLightColor, initDarkColor, selectedTextIndex, setSelectedTextIndex } = useConfig();

  const botBtnAnimatedStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    top: height * (Platform.OS === 'web' ? 0.85 : 0.9),
    alignSelf: 'center',
    left: '50%',
    right: 0,
    zIndex: 5,
    width: 'min-content',
    height: 'min-content',
    transform: [
      { translateY: botBtnAnimation.value },
      { translateX: '-50%' }
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

  useEffect(() => {
    if (selectedDecoration.current === "") {
      selectedDecoration.current = "calculating";
      const initSelectDecoration = async () => {
        const item = await getRandomDecoration();
        selectedDecoration.current = item;
      };
      initSelectDecoration().catch(console.error);
    }
  }, [selectedDecoration]);

  const memeDecorationComponent = useCallback(() => {
    return (
      <MemeDecorationsList
        onSelectDecoration={(item) => {
          selectedDecoration.current = item;
          handleCloseBottomDrawer();
        }}
        onCloseMenu={handleCloseBottomDrawer} />
    )
  }, [t, handleCloseBottomDrawer]);


  const tapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onStart(() => {
      handleOpenBottomDrawer(memeDecorationComponent);
    }).runOnJS(true);

  const deleteDecoration = useCallback((index) => {
    setDecorations((prevTexts) => {
      const newTexts = [...prevTexts];
      newTexts.splice(index, 1);
      return newTexts;
    });
    setSelectedTextIndex(-1);
    addToast(t('memeCreate.elementDeleted'), 3000);
  }, [decorations]);

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
            // ask for browser permission
            const navAgent = Utils.getBrowserName();
            const permissionGranted = await Utils.requestClipboardPermission();
            if (permissionGranted || navAgent === "Mozilla Firefox" || navAgent.indexOf("Edge")) {
              let uriFileFormat = await Utils.convertBase64ToImage(uri);
              await navigator.clipboard.write([uriFileFormat]);
              addToast(t('memeCreate.imageCopied'), 3000);
            }
            else addToast(t('memeCreate.permissionClipboardDenied'), 3000);
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
    (type, x, y) => {
      setIsBotDrawerOpened(false);
      setDecorations((prevTexts) => {
        const newItem = {
          value: type === 'text' ? t('memeCreate.newTextLabel') : selectedDecoration?.current?.blob,
          type,
          x: x - (x > width - 150 ? 150 : 75) + (x < 0 ? Math.abs(x) : 0),
          y: y - (y > height - 150 ? 150 : 50) + (y < 0 ? Math.abs(y) : 0),
          width: 150,
          height: type === 'text' ? 100 : 150,
          fontSize: 20, // fontSize for label
          scale: { x: 1, y: 1 }, // scale for decoration
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
    [decorations, t, isBotDrawerOpened, selectedDecoration, selectedTextIndex],
  );

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        {/* Gradient Background */}
        {config?.backgroundType === "lava" && <LavaLampBackground count={10} hue={initColor} />}
        {config?.backgroundType === "gradient" && <GradientBackground startColor={initLightColor} endColor={initDarkColor} duration={3000} />}

        {/* Meme image container */}
        <ViewShot ref={memeContainerRef} style={styles.memeWrapper} draggable={false} options={{ format: "jpg", quality: 0.9 }}>
          {/* Draggable Texts / decorations */}
          {decorations.map((item, index) => {
            return <DraggableContainer
              key={`dragable-container-${index}-${index.type}-${item.x}-${item.y}`}
              x={item.x}
              y={item.y}
              width={item.width}
              minWidth={config?.minWidth || 100}
              maxWidth={config?.maxWidth || 300}
              height={item.height}
              minHeight={config?.minHeight || 100}
              maxHeight={config?.maxHeight || 300}
              rotation={item.rotation}
              index={index}
              selected={index === selectedTextIndex}
              onSelect={(i) => setSelectedTextIndex(i)}
              onDelete={(i) => deleteDecoration(i)}
              resizeMode={config?.dragableResizeMode}
            >
              {item.type === "text" && <EditableText item={item} index={index} />}
              {item.type !== "text" && <EditableDecoration item={item} index={index} />}
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
        <DraggableButton
          key={`open-meme-drawer-option`}
          onArrangeEnd={() => navigation.openDrawer()}
          initialPosition={{ x: width - 75, y: height * 0.75 }}
          blockDragY={true}
          maxDistance={40}
          style={[styles.draggableRightBox, { backgroundColor: initColor }]}
          animateButton={false}>
          <Edit stroke="black" fill="#fff" width={40} height={40} />
        </DraggableButton>

        {/* Open drawer options Button */}
        <DraggableButton
          key={`open-options-drawer-option`}
          onArrangeEnd={() => navigation.getParent().openDrawer()}
          initialPosition={{ x: -45, y: height * 0.75 }}
          blockDragY={true}
          maxDistance={40}
          style={[styles.draggableLeftBox, { backgroundColor: initColor }]}
          animateButton={false}>
          <Tool stroke="black" fill="#fff" width={40} height={40} />
        </DraggableButton>

        {/* Bottom drawer */}
        <Animated.View style={[botBtnAnimatedStyle, { flex: 1, justifyContent: 'center', alignItems: 'center', display: config?.staticBDrawer ? "none" : "flex" }]} key={`bot-drawer-btn`}>
          <Pressable onPress={() => setIsBotDrawerOpened(!isBotDrawerOpened)} >
            <View style={{ width: 100, height: 50, borderRadius: 20, backgroundColor: initColor, borderWidth: 1, borderColor: initLightColor, justifyContent: 'center', alignItems: 'center' }}>
              {<ChevronUp style={{ transform: [{ rotate: isBotDrawerOpened ? '180deg' : '0deg' }], animationDuration: 300 }} stroke="black" width={20} height={20} />}
            </View>
          </Pressable>
        </Animated.View>

        <DraggableButton
          key={`dragable-decoration-option`}
          gesture={tapGesture}
          onArrangeEnd={(x, y) => onArrangeEnd("decoration", x, y)}
          initialPosition={dragableDecorationPosition}
          parentDimensions={{ width: width, height: height }}
          animateButton={true}
          style={[styles.draggableBox, { backgroundColor: initColor }]}
          minDistance={125}>
          <View>
            <Animated.View>
              <Pressable maxPointers={1}>
                <Image selectable={false} style={{ width: 50, height: 50 }} source={selectedDecoration.current?.blob} resizeMode='contain' />
              </Pressable>
            </Animated.View>
            <Pressable maxPointers={1} style={styles.imageEditWrapper} onPressOut={() => {
              handleOpenBottomDrawer(memeDecorationComponent);
            }}>
              <Edit stroke="black" width={20} height={20} />
            </Pressable>
          </View>
        </DraggableButton>
        <DraggableButton
          key={`dragable-text-option`}
          onArrangeEnd={(x, y) => onArrangeEnd("text", x, y)}
          initialPosition={dragableTextPosition}
          animateButton={true}
          style={[styles.draggableBox, { backgroundColor: initColor }]}
          minDistance={125}>
          <MessageSquare stroke="black" fill="#fff" width={40} height={40} />
        </DraggableButton>
        <DraggableButton
          key={`capture-share-button`}
          onArrangeEnd={handleCapture}
          initialPosition={capturePosition}
          style={[styles.draggableBox, { backgroundColor: initColor }]}
          blockDragY={true}
          blockDragX={true}
          animateButton={true}>
          <Camera stroke="black" fill="#fff" width={40} height={40} />
        </DraggableButton>
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
    cursor: 'default',
  },
  imageEditWrapper: {
    position: 'absolute',
    borderRadius: 20,
    top: 0,
    right: -10,
    width: 30,
    height: 30,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
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
    cursor: 'pointer',
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
    cursor: 'pointer',
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
    cursor: 'pointer',
  }
});

export default MemeCreate;