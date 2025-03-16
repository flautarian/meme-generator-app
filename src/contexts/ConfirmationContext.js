import React, { createContext, useContext, useState, useCallback } from 'react';
import ConfirmationModal from '../components/ConfirmationModalComponent/ConfirmationModal';

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
    onConfirm: () => {},
    onCancel: () => {},
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
      onConfirm: () => {},
      onCancel: () => {}
    }));
  }, []);

  return (
    <ConfirmationContext.Provider value={{ showConfirmation, hideConfirmation }}>
      {children}
      <ConfirmationModal
        visible={confirmationState.isOpen}
        title={confirmationState.title}
        message={confirmationState.message}
        onConfirm={confirmationState.onConfirm}
        onCancel={confirmationState.onCancel}
      />
    </ConfirmationContext.Provider>
  );
};
