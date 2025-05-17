import React, { useCallback } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';

const BottomDrawer = ({ children, reference, snapPoints, callback = null }) => {

  // callbacks
  const handleSheetChanges = useCallback((index) => {
    if (!!callback)
      callback(index);
  }, []);


  // renders
  return (
    <BottomSheet
      ref={reference}
      onChange={handleSheetChanges}
      index={-1}
      enablePanDownToClose={true}
      enableContentPanningGesture={false}
      enableHandlePanningGesture={Platform.OS !== "android"}
      enableOverDrag={false}
      enableDynamicSizing={true}
      snapPoints={!!snapPoints ? snapPoints : ['50%']}
    >
      <BottomSheetView style={styles.contentContainer}>
        {children}
      </BottomSheetView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'grey',
  },
  contentContainer: {
    flex: 1,
    padding: 36,
    alignItems: 'center',
  },
});

export default BottomDrawer;
