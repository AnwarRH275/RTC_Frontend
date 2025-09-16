import { useState } from 'react';

export const useExamState = () => {
  // États principaux
  const [examData, setExamData] = useState(null);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [currentInteraction, setCurrentInteraction] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // États de l'examen
  const [examStarted, setExamStarted] = useState(false);
  const [examCompleted, setExamCompleted] = useState(false);

  // États d'enregistrement
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasRecorded, setHasRecorded] = useState(false);
  const [recordingBlob, setRecordingBlob] = useState(null);

  // États de transcription vocale
  const [transcript, setTranscript] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [userReady, setUserReady] = useState(false);
  const [readinessChecked, setReadinessChecked] = useState(false);

  // États audio
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioEnded, setAudioEnded] = useState(false);
  const [canProceed, setCanProceed] = useState(false);
  const [audioUrls, setAudioUrls] = useState({});

  // États pour le flux objectif -> confirmation -> trigger
  const [currentPhase, setCurrentPhase] = useState('objective'); // 'objective', 'waiting_confirmation', 'trigger', 'interview', 'preparation', 'conversation'
  const [userConfirmed, setUserConfirmed] = useState(false);

  // Fonction pour réinitialiser seulement les états nécessaires pour une nouvelle tâche
  const resetForNewTask = () => {
    setCurrentInteraction(0);
    setCanProceed(false);
    setAudioEnded(false);
    setHasRecorded(false);
    setTranscript('');
    setCurrentPhase('objective');
    setUserConfirmed(false);
    setRecordingTime(0);
    setRecordingBlob(null);
  };

  // Fonction pour réinitialiser seulement les états d'enregistrement
  const resetRecordingStates = () => {
    setIsRecording(false);
    setRecordingTime(0);
    setHasRecorded(false);
    setRecordingBlob(null);
    setTranscript('');
    setIsTranscribing(false);
  };

  return {
    examData, setExamData,
    currentTaskIndex, setCurrentTaskIndex,
    currentInteraction, setCurrentInteraction,
    isLoading, setIsLoading,
    error, setError,
    examStarted, setExamStarted,
    examCompleted, setExamCompleted,
    isRecording, setIsRecording,
    recordingTime, setRecordingTime,
    hasRecorded, setHasRecorded,
    recordingBlob, setRecordingBlob,
    transcript, setTranscript,
    isTranscribing, setIsTranscribing,
    userReady, setUserReady,
    readinessChecked, setReadinessChecked,
    audioPlaying, setAudioPlaying,
    audioEnded, setAudioEnded,
    canProceed, setCanProceed,
    audioUrls, setAudioUrls,
    currentPhase, setCurrentPhase,
    userConfirmed, setUserConfirmed,
    resetForNewTask,
    resetRecordingStates,
  };
};