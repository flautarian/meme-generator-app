import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import ConfirmationModal from '../components/ConfirmationModalComponent/ConfirmationModal';
import BottomDrawer from 'src/components/BottomDrawerComponent/BottomDrawer';
import { Text } from 'react-native';

const ConfirmationContext = createContext();

export const useConfirmation = () => {
  const context = useContext(ConfirmationContext);
  if (!context) {
    throw new Error('useConfirmation must be used within a ConfirmationProvider');
  }
  return context;
};

export const ConfirmationProvider = ({ children }) => {
  const [confirmationState, setConfirmationState] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => { },
    onCancel: () => { },
    type: null,
    itemId: null
  });

  const showConfirmation = useCallback(({ title, message, onConfirm, type, itemId }) => {
    setConfirmationState({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        hideConfirmation();
      },
      onCancel: hideConfirmation,
      type,
      itemId
    });
  }, []);

  const hideConfirmation = useCallback(() => {
    setConfirmationState(prev => ({
      ...prev,
      isOpen: false,
      onConfirm: () => { },
      onCancel: () => { }
    }));
  }, []);

  
  const [onChangedDecorations, setOnChangedDecorations] = useState(false);
  const bottomSheetRef = useRef(null);
  const[bottomDrawerChildren, setBottomDrawerChildren] = useState(<Text>TEST</Text>);

  const handleCloseDrawer = () => {
    if (!!bottomSheetRef) {
      setBottomDrawerChildren(null);
      bottomSheetRef.current.close();
    }
  }

  const handleOpenDrawer = (child) => {
    if (!!bottomSheetRef) {
      setBottomDrawerChildren(child);
      bottomSheetRef.current.expand();
    }
  }

  return (
    <ConfirmationContext.Provider value={{ showConfirmation, hideConfirmation, handleCloseDrawer, handleOpenDrawer }}>
      <ConfirmationModal
        visible={confirmationState.isOpen}
        title={confirmationState.title}
        message={confirmationState.message}
        onConfirm={confirmationState.onConfirm}
        onCancel={confirmationState.onCancel}
      />
      {children}
      <BottomDrawer reference={bottomSheetRef} children={bottomDrawerChildren} />
    </ConfirmationContext.Provider>
  );
};
