import { useState } from 'react';

export const useTaskState = () => {
  // États spécifiques à la tâche 1
  const [totalRecordingTime, setTotalRecordingTime] = useState(0); // Temps cumulé d'enregistrement pour la tâche 1
  const [continuationCount, setContinuationCount] = useState(0); // Nombre de questions de relance posées
  const [isInContinuation, setIsInContinuation] = useState(false); // Indique si on est en phase de continuation

  // États spécifiques à la tâche 2
  const [preparationTime, setPreparationTime] = useState(0); // Timer de préparation (2 minutes)
  const [conversationTime, setConversationTime] = useState(0); // Timer de conversation (3m30)
  const [isPreparationPhase, setIsPreparationPhase] = useState(false);
  const [isConversationPhase, setIsConversationPhase] = useState(false);

  // États spécifiques à la tâche 3
  const [isExtraTimePhase, setIsExtraTimePhase] = useState(false); // Pour gérer le temps supplémentaire
  const [extraTimeUsed, setExtraTimeUsed] = useState(false); // Pour éviter les répétitions de scénarios
  const [task3ContinuationCount, setTask3ContinuationCount] = useState(0); // Nombre de questions de relance pour tâche 3
  const [isInTask3Continuation, setIsInTask3Continuation] = useState(false); // Indique si on est en phase de continuation pour tâche 3

  // Fonction pour réinitialiser les états de la tâche 1
  const resetTask1States = () => {
    setTotalRecordingTime(0);
    setContinuationCount(0);
    setIsInContinuation(false);
  };

  // Fonction pour réinitialiser les états de la tâche 2
  const resetTask2States = () => {
    setPreparationTime(0);
    setConversationTime(0);
    setIsPreparationPhase(false);
    setIsConversationPhase(false);
  };

  // Fonction pour réinitialiser les états de la tâche 3
  const resetTask3States = () => {
    setIsExtraTimePhase(false);
    setExtraTimeUsed(false);
    setTask3ContinuationCount(0);
    setIsInTask3Continuation(false);
  };

  // Fonction pour réinitialiser tous les états de tâche
  const resetAllTaskStates = () => {
    resetTask1States();
    resetTask2States();
    resetTask3States();
  };

  return {
    totalRecordingTime, setTotalRecordingTime,
    continuationCount, setContinuationCount,
    isInContinuation, setIsInContinuation,
    preparationTime, setPreparationTime,
    conversationTime, setConversationTime,
    isPreparationPhase, setIsPreparationPhase,
    isConversationPhase, setIsConversationPhase,
    isExtraTimePhase, setIsExtraTimePhase,
    extraTimeUsed, setExtraTimeUsed,
    task3ContinuationCount, setTask3ContinuationCount,
    isInTask3Continuation, setIsInTask3Continuation,
    resetTask1States,
    resetTask2States,
    resetTask3States,
    resetAllTaskStates,
  };
};