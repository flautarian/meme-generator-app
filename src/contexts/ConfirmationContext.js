import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import ConfirmationModal from '../components/ConfirmationModalComponent/ConfirmationModal';
import BottomDrawer from 'src/components/BottomDrawerComponent/BottomDrawer';
import { Text } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import ToastModal from 'src/components/ToastModalComponent/ToastModal';

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

  // TOASTS


  const [toasts, setToasts] = useState([]);


  const addToast = useCallback((message, duration = 5000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, duration }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, duration);
  }, []);

  // BOTTOM DRAWER

  const bottomSheetRef = useRef(null);
  const [bottomDrawerChildren, setBottomDrawerChildren] = useState(<Text></Text>);

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
    <ConfirmationContext.Provider value={{ showConfirmation, hideConfirmation, handleCloseDrawer, handleOpenDrawer, addToast }}>
      <GestureHandlerRootView>
        {/* Confirmation Modal */}
        <ConfirmationModal
          visible={confirmationState.isOpen}
          title={confirmationState.title}
          message={confirmationState.message}
          onConfirm={confirmationState.onConfirm}
          onCancel={confirmationState.onCancel}
        />

        {/* Toasts */}
        {toasts.map((toast) => (
          <ToastModal
            key={toast.id}
            message={toast.message}
            duration={toast.duration}
          />
        ))}
        {children}
        <BottomDrawer reference={bottomSheetRef} children={bottomDrawerChildren} />
      </GestureHandlerRootView>
    </ConfirmationContext.Provider>
  );
};
