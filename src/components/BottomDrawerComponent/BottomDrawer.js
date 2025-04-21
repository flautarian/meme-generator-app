import React, { useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';

const BottomDrawer = ({ children, reference, snapPoints, callback = null }) => {

  // callbacks
  const handleSheetChanges = useCallback((index) => {
    if(!!callback)
      callback(index);
  }, []);


  // renders
  return (
    <BottomSheet
      ref={reference}
      onChange={handleSheetChanges}
      index={-1}
      snapPoints={!!snapPoints ? snapPoints : ['75%']}
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
