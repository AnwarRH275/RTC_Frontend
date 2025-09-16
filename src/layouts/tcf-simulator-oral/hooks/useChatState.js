import { useState, useRef } from 'react';

export const useChatState = () => {
  const [chatMessages, setChatMessages] = useState([]);
  const chatMessagesRef = useRef(chatMessages);
  chatMessagesRef.current = chatMessages;
  const [inputMethod, setInputMethod] = useState('voice');
  const [textInput, setTextInput] = useState('');
  const [waitingForResponse, setWaitingForResponse] = useState(false);

  // Fonction pour réinitialiser les messages de chat
  const resetChatMessages = () => {
    setChatMessages([]);
  };

  // Fonction pour réinitialiser les états d'entrée
  const resetInputStates = () => {
    setInputMethod('voice');
    setTextInput('');
    setWaitingForResponse(false);
  };

  // Fonction pour réinitialiser tous les états de chat
  const resetAllChatStates = () => {
    resetChatMessages();
    resetInputStates();
  };

  return {
    chatMessages, setChatMessages,
    chatMessagesRef,
    inputMethod, setInputMethod,
    textInput, setTextInput,
    waitingForResponse, setWaitingForResponse,
    resetChatMessages,
    resetInputStates,
    resetAllChatStates,
  };
};