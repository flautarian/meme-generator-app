import {
  View,
  StyleSheet,
  TextInput,
  Button,
  TouchableOpacity,
  SafeAreaView,
  TouchableWithoutFeedback,
} from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { getRandomMeme } from 'src/hooks/useTemplates';
import { captureRef } from "react-native-view-shot";
import ZoomableImage from 'src/components/ZoomableImageComponent/ZoomableImage';
import DraggableText from 'src/components/DragableTextComponent/DragableText';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import DragableOption from 'src/components/DragableOptionComponent/DragableOption';

const MemeCreate = () => {

  const [currentMeme, setCurrentMeme] = useState(null);

  const [texts, setTexts] = useState([]);

  const [selectedTextIndex, setSelectedTextIndex] = useState(-1);

  const [currentText, setCurrentText] = useState("");

  const containerOffset = useRef({ offsetX: 0, offsetY: 0 });

  const containerBounds = useRef({ x: 0, y: 0, width: 0, height: 0 });

  const viewRef = useRef(null);

  const addText = (text, x, y) => {
    setTexts([...texts, { text, x, y }]);
    setCurrentText("");
  };

  const handleCapture = async () => {
    const uri = await captureRef(viewRef, { format: "png", quality: 0.8 });
    console.log("Saved meme:", uri);
  };

  const handleArrange = (type, x, y) => {
    console.log("Arrange", type, x, y);
    addText("Text", x, y);
  };

  useEffect(() => {
    setTimeout(async () => {
      const meme = await getRandomMeme();
      setCurrentMeme(meme);
    }, 1);
    // Measure the offset of the meme container
    viewRef.current?.measure((x, y, width, height, pageX, pageY) => {
      containerOffset.current = { offsetX: pageX, offsetY: pageY };
    });
  }, []);

  return (
    <SafeAreaView ref={viewRef} style={styles.container}
      onLayout={(event) => {
        const { x, y, width, height } = event.nativeEvent.layout;
        containerBounds.current = { x, y, width, height };
      }}
    >
      <TouchableWithoutFeedback onPress={() => setSelectedTextIndex(-1)}>
        <GestureHandlerRootView style={styles.container}>
          {currentMeme && <ZoomableImage source={{ uri: currentMeme.img }} />}
          {texts.map((item, index) => (
            <DraggableText
              key={index}
              text={item.text}
              index={index}
              selected={index === selectedTextIndex}
              onSelect={(i) => setSelectedTextIndex(i)}
              containerOffset={containerOffset}
            />
          ))
          }
        </GestureHandlerRootView>
      </TouchableWithoutFeedback>
      <DragableOption onArrange={(x, y) => handleArrange("text", x, y)} />
      <TextInput
        style={styles.input}
        value={currentText}
        onChangeText={setCurrentText}
        placeholder="Enter text"
      />
      <Button title="Add Text" onPress={() => addText(currentText, 50, 50)} />
      <Button title="Export Meme" onPress={handleCapture} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginVertical: 10,
    paddingHorizontal: 10,
  },
});

export default MemeCreate;