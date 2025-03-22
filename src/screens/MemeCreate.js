import React from 'react';
import {
  StyleSheet,
  SafeAreaView,
  Pressable,
  Dimensions,
  Image,
  View,
  Text,
} from 'react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ViewShot from "react-native-view-shot";
import { Platform } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';
import LavaLampBackground from 'src/components/LavaLampBackgroundComponent/LavaLampBackground';
import randomColor from 'randomcolor';
import EditableText from 'src/components/EditableTextComponent/EditableText';
import DragableOption from 'src/components/DragableOptionComponent/DragableOption';
import DraggableContainer from 'src/components/DragableContainerComponent/DragableContainer';
import DragableDecoration from 'src/components/DragableTemplateComponent/DragableTemplate';
import { Camera, Edit, MessageSquare, Tool, ChevronUp } from 'react-native-feather';
import EditableDecoration from 'src/components/EditableDecorationComponent/EditableDecoration';
import StaticOption from 'src/components/StaticOptionComponent/StaticOption';
import ToastModal from 'src/components/ToastModalComponent/ToastModal';
import * as Sharing from 'expo-sharing';
import { Utils } from 'src/utils/Utils';

const MemeCreate = ({ navigation, currentMeme, onChangedDecorations }) => {

  const BOTTOM_DRAWER_HEIGHT = 100;

  const { t } = useTranslation();
  const { width, height } = Dimensions.get('window');

  const [texts, setTexts] = useState([]);
  const [selectedTextIndex, setSelectedTextIndex] = useState(-1);
  const [toasts, setToasts] = useState([]);
  const memeContainerRef = useRef(null);

  const progress = useSharedValue(0);
  const initColor = useSharedValue("");
  const [isBotDrawerOpened, setIsBotDrawerOpened] = useState(false);
  const botDrawerAnimation = useSharedValue(0);

  const botContainerAnimatedStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    bottom: -BOTTOM_DRAWER_HEIGHT,
    left: 0,
    right: 0,
    zIndex: 5,
    width: '100%',
    height: Platform.OS === 'web' ? '15dvh' : height * 0.15,
    transform: [
      { translateY: botDrawerAnimation.get() }
    ],
  }));

  const bottomDrawerSpringConfig = {
    duration: 250,
    dampingRatio: 2,
    stiffness: 100,
  };

  useEffect(() => {
    const newTranslateValue = isBotDrawerOpened ? -BOTTOM_DRAWER_HEIGHT : 0;
    botDrawerAnimation.set(withSpring(newTranslateValue, bottomDrawerSpringConfig));
  }, [isBotDrawerOpened]);

  const addToast = useCallback((message, duration = 5000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, duration }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, duration);
  }, []);

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
      setIsBotDrawerOpened((prev) => !prev);
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
    [texts, addToast, t, isBotDrawerOpened],
  );

  // Trigger the gradient animation
  useEffect(() => {
    progress.set(withTiming(1, { duration: 3000 }));
    // random color background generation
    initColor.set(randomColor({ count: 1, luminosity: 'dark' })[0]);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Gradient Background */}
      <LavaLampBackground count={10} hue={initColor.get()} />

      {/* Open drawer Button */}
      <DragableOption
        key={`open-meme-drawer-option`}
        onArrangeEnd={() => navigation.openDrawer()}
        initialPosition={{ x: width - 75, y: height * 0.75 }}
        blockDragY={true}
        limitDistance={40}
        style={styles.draggableRightBox}
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
        style={styles.draggableLeftBox}
        animateButton={false}>
        <Tool stroke="black" fill="#fff" width={40} height={40} />
      </DragableOption>

      <Animated.View style={[botContainerAnimatedStyle, { flex: 1, justifyContent: 'center', alignItems: 'center' }]} key={`bot-drawer`}>
        <Pressable onPress={() => setIsBotDrawerOpened(!isBotDrawerOpened)} >
          <View style={{ width: 80, height: 40, borderRadius: 20, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' }}>
            {<ChevronUp style={{ transform: [{ rotate: isBotDrawerOpened ? '180deg' : '0deg' }], animationDuration: 300 }} stroke="black" width={20} height={20} />}
          </View>
        </Pressable>
        <View style={{ width: '100%', height: '100%', backgroundColor: 'violet', opacity: isBotDrawerOpened ? 1 : 0, marginTop: 10 }}>
          <Text>TEXT</Text>
        </View>
      </Animated.View>

      <DragableDecoration
        key={`dragable-decoration-option`}
        onMenuOpenCallBack={() => setSelectedTextIndex(-1)}
        onArrangeEnd={(x, y, value) => onArrangeEnd("decoration", x, y, value)}
        onChangedDecorations={onChangedDecorations}
        initialPosition={{ x: width - width * 0.75 - 25, y: height + 50 }}
        showFromDrawer={isBotDrawerOpened}
        parentDimensions={{ width: width, height: height }}
        offsetYAzis={botDrawerAnimation}
        style={styles.draggableBox} />
      <DragableOption
        key={`dragable-text-option`}
        onArrangeEnd={(x, y, value) => onArrangeEnd("text", x, y, value)}
        initialPosition={{ x: width - width * 0.5 - 25, y: height + 50 }}
        offsetYAzis={botDrawerAnimation}
        style={styles.draggableBox}>
        <MessageSquare stroke="black" fill="#fff" width={40} height={40} />
      </DragableOption>
      <StaticOption
        key={`capture-share-button`}
        onPress={handleCapture}
        initialPosition={{ x: width - width * 0.25 - 25, y: height + 50 }}
        offsetYAzis={botDrawerAnimation}>
        <Camera stroke="black" fill="#fff" width={40} height={40} />
      </StaticOption>


      <ViewShot ref={memeContainerRef} style={styles.memeWrapper} draggable={false}>
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
            draggable={false}
          >
            {child}
          </DraggableContainer>
        })}

        {/* Meme Image */}
        <Pressable
          maxPointers={1}
          style={styles.imageWrapper}
          onPress={() => {
            setSelectedTextIndex(-1);
            setIsBotDrawerOpened(false);
          }}>
          {/* Meme Image */}
          {currentMeme && (
            <Image source={currentMeme.blob} name={currentMeme.name} resizeMode="contain" style={styles.memeImage} />
          )}
        </Pressable>
      </ViewShot>

      {toasts.map((toast) => (
        <ToastModal
          key={toast.id}
          message={toast.message}
          duration={toast.duration}
        />
      ))}
    </SafeAreaView>
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
    backgroundColor: 'blue',
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
    backgroundColor: 'blue',
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
    backgroundColor: 'blue',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopRightRadius: 50,
    borderBottomRightRadius: 50,
  }
});

export default MemeCreate;