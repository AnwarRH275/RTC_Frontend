import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import {
  Box,
  Typography,
  Button,
  LinearProgress,
  Alert,
  Chip,
  IconButton,
  Tooltip,
  Fade,
  Zoom,
  Grow,
  Paper,
  Divider,
  keyframes,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  Stop,
  Mic,
  MicOff,
  VolumeUp,
  AccessTime,
  CheckCircle,
  Warning,
  Person,
  Computer,
  SmartToy
} from '@mui/icons-material';
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import MDButton from 'components/MDButton';
import DashboardLayout from 'examples/LayoutContainers/DashboardLayout';
import DashboardNavbar from 'examples/Navbars/DashboardNavbar';
import synthesisService from 'services/synthesisService';
import TCFOralService from 'services/tcfOralService';
import { validateReadiness } from 'services/agentValidationService';
import task2AgentService from 'services/task2AgentService';
import task1AgentService from 'services/task1AgentService';
import authService from 'services/authService';
import { useInfoUser } from 'context/InfoUserContext';
import { useExamState } from './hooks/useExamState';
import { useTaskState } from './hooks/useTaskState';
import { useChatState } from './hooks/useChatState';
import { generateAudio } from './utils/audioUtils';
import tcfCanadaLogo from 'assets/logo-tfc-canada.png';

// Animations pour le logo de chargement
const breatheAnimation = keyframes`
  0%, 100% {
    transform: scale(1);
    opacity: 0.9;
  }
  50% {
    transform: scale(1.08);
    opacity: 1;
  }
`;

const shimmerAnimation = keyframes`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
`;

const rotateRing = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

// Container moderne pour le logo de chargement
const LogoLoader = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  padding: '40px',
  
  '& .logo-container': {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  
  '& .logo-ring': {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: '50%',
    border: '4px solid transparent',
    borderTopColor: 'rgba(66, 153, 225, 0.9)',
    borderRightColor: 'rgba(49, 130, 206, 0.5)',
    animation: `${rotateRing} 2s linear infinite`,
  },
  
  '& .logo-ring-2': {
    position: 'absolute',
    width: 230,
    height: 230,
    borderRadius: '50%',
    border: '3px solid transparent',
    borderBottomColor: 'rgba(99, 179, 237, 0.7)',
    borderLeftColor: 'rgba(66, 153, 225, 0.4)',
    animation: `${rotateRing} 3s linear infinite reverse`,
  },
  
  '& .logo-image': {
    width: 150,
    height: 'auto',
    animation: `${breatheAnimation} 2.5s ease-in-out infinite`,
    filter: 'drop-shadow(0 12px 32px rgba(66, 153, 225, 0.35))',
    zIndex: 2,
  },
  
  '& .loading-text': {
    marginTop: 50,
    fontSize: '1.6rem',
    fontWeight: 700,
    color: '#1A365D',
    letterSpacing: '1px',
    textAlign: 'center',
  },
  
  '& .loading-subtext': {
    marginTop: 16,
    fontSize: '1.1rem',
    fontWeight: 500,
    color: '#4A5568',
    background: 'linear-gradient(90deg, #4A5568 0%, #4299E1 50%, #4A5568 100%)',
    backgroundSize: '200% 100%',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    animation: `${shimmerAnimation} 2s linear infinite`,
  },
  
  '& .dots': {
    display: 'inline-flex',
    gap: '6px',
    marginLeft: '8px',
    
    '& span': {
      width: 10,
      height: 10,
      borderRadius: '50%',
      backgroundColor: '#4299E1',
      animation: `${breatheAnimation} 1.4s ease-in-out infinite`,
      
      '&:nth-of-type(1)': { animationDelay: '0s' },
      '&:nth-of-type(2)': { animationDelay: '0.2s' },
      '&:nth-of-type(3)': { animationDelay: '0.4s' },
    }
  }
}));

const TCFOralExam = () => {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const { userInfo, loadUserInfo } = useInfoUser();
  const audioPlayerRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const chatContainerRef = useRef(null);
  const recognitionRef = useRef(null);
  const task2AgentServiceRef = useRef(task2AgentService);
  const recordingTimerRef = useRef(null);
  const examTimerRef = useRef(null);
  const accumulatedTranscriptRef = useRef('');
  const streamRef = useRef(null);

  const {
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
  } = useExamState();

  const {
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
  } = useTaskState();

  const {
    chatMessages, setChatMessages,
    inputMethod, setInputMethod,
    textInput, setTextInput,
    waitingForResponse, setWaitingForResponse,
    resetChatMessages,
    resetInputStates,
    resetAllChatStates,
  } = useChatState();

  const chatMessagesRef = useRef(chatMessages);
  chatMessagesRef.current = chatMessages;
  const isRecordingRef = useRef(isRecording);
  const currentTaskIndexRef = useRef(currentTaskIndex);
  const currentPhaseRef = useRef(currentPhase);
  const confirmationTimeoutRef = useRef(null);
  const isConversationActiveRef = useRef(false);
  const preparationTimerRef = useRef(null);
  const conversationTimerRef = useRef(null);
  const noSpeechCountRef = useRef(0);

  // États pour la popup de test du microphone
  const [showMicTestDialog, setShowMicTestDialog] = useState(false);
  const [micTestStatus, setMicTestStatus] = useState('idle'); // 'idle', 'testing', 'success', 'error'
  const [micTestTranscript, setMicTestTranscript] = useState('');
  const [micTestRecording, setMicTestRecording] = useState(false);
  const micTestRecognitionRef = useRef(null);
  // Confirmation de sortie avant redirection (débit du solde)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  // Empêcher la réouverture automatique du dialog micro lors d'une reprise volontaire
  const [suppressMicAutoDialog, setSuppressMicAutoDialog] = useState(false);
  
  // Détection du navigateur et support de la reconnaissance vocale
  const [browserInfo, setBrowserInfo] = useState({ name: '', supported: true });
  const [showBrowserWarning, setShowBrowserWarning] = useState(false);
  
  // Détection du navigateur au montage du composant
  useEffect(() => {
    const detectBrowser = () => {
      const ua = navigator.userAgent;
      let browserName = 'unknown';

      // Seul Google Chrome est autorisé pour l'examen (exclut Edge/Opera/Brave/Safari)
      const isChrome = /Chrome/.test(ua) && !(/Edg|OPR|Brave|Chromium|SamsungBrowser|CriOS|FxiOS/.test(ua));

      if (isChrome) {
        browserName = 'Chrome';
      } else if (/Firefox/.test(ua)) {
        browserName = 'Firefox';
      } else if (/Edg/.test(ua)) {
        browserName = 'Edge';
      } else if (/Safari/.test(ua) && !/Chrome/.test(ua)) {
        browserName = 'Safari';
      } else if (/OPR|Opera/.test(ua)) {
        browserName = 'Opera';
      }

      const hasWebSpeechAPI = ('webkitSpeechRecognition' in window) || ('SpeechRecognition' in window);

      // Autorisé seulement si c'est Chrome ET que l'API Web Speech est disponible
      const isSupported = isChrome && hasWebSpeechAPI;

      setBrowserInfo({ name: browserName, supported: isSupported });

      // Afficher la popup d'avertissement pour les navigateurs non supportés
      if (!isSupported) {
        console.warn(`🌐 Navigateur ${browserName} détecté - Seul Google Chrome est autorisé pour l'examen oral.`);
        setShowBrowserWarning(true);
      } else {
        console.log(`🌐 Navigateur Chrome détecté - Reconnaissance vocale disponible`);
      }
    };

    detectBrowser();
  }, []);

  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

  useEffect(() => {
    currentTaskIndexRef.current = currentTaskIndex;
  }, [currentTaskIndex]);

  useEffect(() => {
    currentPhaseRef.current = currentPhase;

    // Désactiver le microphone si on passe à la phase 'objective' et qu'il est actif
    if (currentPhase === 'objective' && isRecording) {
      console.log('🔇 Désactivation automatique du microphone lors du passage à la phase objective');
      setTimeout(() => handleStopRecording(), 100);
    }
  }, [currentPhase, isRecording]);

  // Gestion du timeout automatique pour la confirmation (3 secondes)
  useEffect(() => {
    // Ne déclencher le timeout que si l'examen a démarré
    if (currentPhase === 'waiting_confirmation' && examStarted) {
      // Nettoyer tout timeout existant
      if (confirmationTimeoutRef.current) {
        clearTimeout(confirmationTimeoutRef.current);
      }

      // Démarrer un nouveau timeout de 3 secondes
      confirmationTimeoutRef.current = setTimeout(() => {
        console.log('⏰ Timeout de confirmation atteint - continuation automatique');
        // Simuler une réponse "oui" automatique
        simulateMicrophoneClick();
        handleUserResponse('oui');
      }, 4000);
    } else {
      // Nettoyer le timeout si on quitte la phase de confirmation
      if (confirmationTimeoutRef.current) {
        clearTimeout(confirmationTimeoutRef.current);
        confirmationTimeoutRef.current = null;
      }
    }

    return () => {
      // Nettoyer le timeout au démontage du composant
      if (confirmationTimeoutRef.current) {
        clearTimeout(confirmationTimeoutRef.current);
      }
    };
  }, [currentPhase, examStarted]);

  // Chargement des données d'examen
  useEffect(() => {
    const loadExamData = async () => {
      try {
        setIsLoading(true);
        const data = await TCFOralService.getSubjectById(subjectId);

        if (!data || !data.tasks || data.tasks.length === 0) {
          throw new Error('Données d\'examen invalides');
        }

        // Transformer les données pour inclure les interactions
        const transformedData = {
          ...data,
          tasks: data.tasks.map((task, index) => ({
            ...task,
            // Préserver le trigger de la tâche
            trigger: task.trigger,
            // Inclure les interactions pour toutes les tâches
            interactions: task.interactions || [{
              id: `${task.id}_interaction_1`,
              content: task.instruction || task.description,
              type: 'instruction'
            }]
          }))
        };

        setExamData(transformedData);

        // Debug: Afficher la structure des interactions pour la tâche 2
        if (transformedData.tasks[1]) {
          console.log('🔍 Structure de la tâche 2:', transformedData.tasks[1]);
          console.log('🔍 Interactions de la tâche 2:', transformedData.tasks[1].interactions);
        }

        // Générer les URLs audio pour l'objectif et le trigger de chaque tâche
        const urls = {};
        for (let i = 0; i < transformedData.tasks.length; i++) {
          const task = transformedData.tasks[i];

          // Générer audio pour l'objectif
          if (task.objective) {
            try {
              const objectiveAudioUrl = await generateAudio(task.objective, subjectId);
              if (objectiveAudioUrl) {
                urls[`task_${task.id}_objective`] = objectiveAudioUrl;
              }
            } catch (audioError) {
              console.warn(`Erreur génération audio pour objectif tâche ${task.id}:`, audioError);
            }
          }

          // Générer audio pour le trigger (toutes les tâches)
          if (task.trigger) {
            try {
              const triggerAudioUrl = await generateAudio(task.trigger, subjectId);
              if (triggerAudioUrl) {
                urls[`task_${task.id}_trigger`] = triggerAudioUrl;
              }
            } catch (audioError) {
              console.warn(`Erreur génération audio pour trigger tâche ${task.id}:`, audioError);
            }
          }

          // Générer audio pour les interactions existantes (toutes les tâches)
          for (const interaction of task.interactions) {
            if (interaction.content) {
              try {
                const audioUrl = await generateAudio(interaction.content, subjectId);
                if (audioUrl) {
                  urls[interaction.id] = audioUrl;
                }
              } catch (audioError) {
                console.warn(`Erreur génération audio pour ${interaction.id}:`, audioError);
              }
            }
          }
        }
        setAudioUrls(urls);

      } catch (error) {
        console.error('Erreur lors du chargement de l\'examen:', error);
        setError('Impossible de charger l\'examen. Veuillez réessayer.');
      } finally {
        setIsLoading(false);
      }
    };

    if (subjectId) {
      loadExamData();
    }
  }, [subjectId]);



  // Timer d'enregistrement
  useEffect(() => {
    if (isRecording) {
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 1;

          // Règles spécifiques par tâche
          if (currentTaskIndex === 0) { // Tâche 1
            // Pour la tâche 1, on laisse la détection de silence gérer l'arrêt
            // Pas d'arrêt automatique après 2 minutes, seulement après 1,5s de silence
          } else if (currentTaskIndex === 1) { // Tâche 2
            if (newTime >= 90) { // 1.5 minutes maximum
              handleStopRecording();
              return newTime;
            }
          } else if (currentTaskIndex === 2) { // Tâche 3
            if (newTime >= 270) { // 4m30 maximum
              handleStopRecording();
              return newTime;
            }
          }

          return newTime;
        });
      }, 1000);
    } else {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    }

    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, [isRecording, currentTaskIndex]);

  // Timer de préparation pour la tâche 2 (2 minutes)
  useEffect(() => {
    if (isPreparationPhase) {
      preparationTimerRef.current = setInterval(() => {
        setPreparationTime(prev => {
          const newTime = prev + 1;

          // Arrêter après 2 minutes (120 secondes)
          if (newTime >= 120) {
            handlePreparationEnd();
            return 120;
          }

          return newTime;
        });
      }, 1000);
    } else {
      if (preparationTimerRef.current) {
        clearInterval(preparationTimerRef.current);
      }
    }

    return () => {
      if (preparationTimerRef.current) {
        clearInterval(preparationTimerRef.current);
      }
    };
  }, [isPreparationPhase]);

  // Timer de conversation pour la tâche 2 (3m30)
  useEffect(() => {
    if (isConversationPhase) {
      conversationTimerRef.current = setInterval(() => {
        setConversationTime(prev => {
          const newTime = prev + 1;

          // Arrêter après 3m30 (210 secondes)
          if (newTime >= 210) {
            handleConversationEnd();
            return 210;
          }

          return newTime;
        });
      }, 1000);
    } else {
      if (conversationTimerRef.current) {
        clearInterval(conversationTimerRef.current);
      }
    }

    return () => {
      if (conversationTimerRef.current) {
        clearInterval(conversationTimerRef.current);
      }
    };
  }, [isConversationPhase]);

  // Scénarios de durée audio
  const audioDurationScenarios = {
    // Tâche 1
    "si_dépasse_2_minutes": "Excusez-moi, vous avez dépassé le temps imparti. Nous allons maintenant passer à la tâche suivante.",
    // Questions de relance pour la tâche 1 seront récupérées dynamiquement

    // Tâche 3
    "si_le_candidat_parle_plus_de_4m30": "Le temps est écoulé. Merci pour votre réponse.",
    "si_le_candidat_termine_entre_3m30_et_4m30": "Peux-tu me donner un exemple concret pour illustrer ton point de vue ?",
    "si_le_candidat_termine_avant_3m30": "Peux-tu me donner un exemple concret pour illustrer ton point de vue ?"
  };

  // État pour stocker les questions de relance dynamiques de la tâche 1
  const [task1FollowUpQuestions, setTask1FollowUpQuestions] = useState({});
  const [task1QuestionAudioUrls, setTask1QuestionAudioUrls] = useState({});

  // Fonction pour récupérer une question de relance dynamique pour la tâche 1
  const getTask1FollowUpQuestion = async (scenario, userResponse = '') => {
    try {
      console.log('[Task1] Récupération question de relance pour:', scenario);

      // Construire le message pour l'agent IA
      let promptMessage = '';
      if (scenario === 'si_fin_avant_1min30') {
        promptMessage = `L'utilisateur a parlé moins de 1min30. Voici sa réponse: "${userResponse}". Pose-lui une question de relance pour l'encourager à développer davantage sa présentation personnelle.`;
      } else if (scenario === 'si_fin_avant_2min') {
        promptMessage = `L'utilisateur a parlé entre 1min30 et 2min. Voici sa réponse: "${userResponse}". Pose-lui une question de relance pour compléter sa présentation personnelle.`;
      }

      const response = await task1AgentService.sendMessage(promptMessage, 'Générer une question de relance pour la tâche 1');

      if (response && response.text) {
        // Stocker la question et son audio
        setTask1FollowUpQuestions(prev => ({
          ...prev,
          [scenario]: response.text
        }));

        if (response.audioUrl) {
          setTask1QuestionAudioUrls(prev => ({
            ...prev,
            [scenario]: response.audioUrl
          }));
        }

        return {
          text: response.text,
          audioUrl: response.audioUrl
        };
      }
    } catch (error) {
      console.error('[Task1] Erreur récupération question de relance:', error);
      // Fallback vers une question par défaut
      const fallbackQuestion = "Pouvez-vous nous en dire plus sur votre parcours ?";
      return {
        text: fallbackQuestion,
        audioUrl: null
      };
    }
  };

  // Générer l'audio pour les scénarios de durée
  const [scenarioAudioUrls, setScenarioAudioUrls] = useState({});

  // Charger les audios des scénarios au démarrage
  useEffect(() => {
    const loadScenarioAudios = async () => {
      const urls = {};
      for (const [key, text] of Object.entries(audioDurationScenarios)) {
        try {
          const audioResult = await synthesisService.synthesizeText(text, subjectId);
          if (audioResult && (audioResult.audioUrl || audioResult.filename)) {
            urls[key] = audioResult.audioUrl || synthesisService.getAudioUrl(audioResult.filename);
          }
        } catch (error) {
          console.warn(`Erreur génération audio pour scénario ${key}:`, error);
        }
      }
      setScenarioAudioUrls(urls);
    };

    if (examStarted) {
      loadScenarioAudios();
    }
  }, [examStarted]);

  // Fonction pour vérifier la durée audio et retourner le bon scénario
  const checkAudioDurationAndGetScenario = async (audioDuration, taskIndex = currentTaskIndex, userResponse = '') => {
    if (taskIndex === 0) { // Tâche 1
      console.log("=============" + audioDuration)
      console.log("Temps total cumulé:", totalRecordingTime + audioDuration)

      const cumulativeTime = totalRecordingTime + audioDuration;

      if (cumulativeTime >= 120) { // 2 minutes cumulées atteintes ou dépassées
        return {
          text: audioDurationScenarios.si_dépasse_2_minutes,
          audioUrl: scenarioAudioUrls.si_dépasse_2_minutes,
          shouldEndTask: true
        };
      } else if (audioDuration < 90 && !isInContinuation) { // Moins de 1min30 sur cette intervention
        // Récupérer une question dynamique
        const dynamicQuestion = await getTask1FollowUpQuestion('si_fin_avant_1min30', userResponse);
        return {
          text: dynamicQuestion.text,
          audioUrl: dynamicQuestion.audioUrl,
          allowContinuation: true
        };
      } else if (audioDuration >= 90 && audioDuration < 120 && !isInContinuation) { // Entre 1min30 et 2min sur cette intervention
        // Récupérer une question dynamique
        const dynamicQuestion = await getTask1FollowUpQuestion('si_fin_avant_2min', userResponse);
        return {
          text: dynamicQuestion.text,
          audioUrl: dynamicQuestion.audioUrl,
          allowContinuation: true
        };
      } else if (isInContinuation && cumulativeTime < 120 && continuationCount < 3) { // En continuation et pas encore 2min cumulées, max 3 questions
        // Utiliser une question de relance dynamique
        const dynamicQuestion = await getTask1FollowUpQuestion('si_fin_avant_1min30', userResponse);
        return {
          text: dynamicQuestion.text,
          audioUrl: dynamicQuestion.audioUrl,
          allowContinuation: true
        };
      } else if (isInContinuation && continuationCount >= 3) { // Maximum 3 questions atteint
        return {
          text: audioDurationScenarios.si_dépasse_2_minutes,
          audioUrl: scenarioAudioUrls.si_dépasse_2_minutes,
          shouldEndTask: true
        };
      } else if (isInContinuation && cumulativeTime >= 120) { // 2 minutes écoulées même en continuation
        return {
          text: audioDurationScenarios.si_dépasse_2_minutes,
          audioUrl: scenarioAudioUrls.si_dépasse_2_minutes,
          shouldEndTask: true
        };
      }
    } else if (taskIndex === 2) { // Tâche 3
      const cumulativeTimeTask3 = conversationTime + audioDuration;

      if (audioDuration > 270) { // Plus de 4m30 (270 secondes)
        return {
          text: audioDurationScenarios.si_le_candidat_parle_plus_de_4m30,
          audioUrl: scenarioAudioUrls.si_le_candidat_parle_plus_de_4m30,
          shouldEndExam: true
        };
      } else if (audioDuration >= 210 && audioDuration <= 270 && !isInTask3Continuation) { // Entre 3m30 et 4m30
        return {
          text: audioDurationScenarios.si_le_candidat_termine_entre_3m30_et_4m30,
          audioUrl: scenarioAudioUrls.si_le_candidat_termine_entre_3m30_et_4m30,
          allowExtraTime: true
        };
      } else if (audioDuration < 210 && !isInTask3Continuation) { // Moins de 3m30
        // text: audioDurationScenarios.si_le_candidat_termine_avant_3m30,
        // audioUrl: scenarioAudioUrls.si_le_candidat_termine_avant_3m30,
        return {
          text: "Vous avez encore du temps, continuez à développer votre argumentation.",
          audioUrl: null, // Sera généré dynamiquement
          allowExtraTime: true
        };
      } else if (isInTask3Continuation && cumulativeTimeTask3 < 270 && task3ContinuationCount < 2) { // En continuation et pas encore 4m30 cumulées, max 2 questions
        return {
          text: "Prenez le temps d’approfondir vos idées, votre argumentation mérite d’être encore plus convaincante.",
          audioUrl: null, // Sera généré dynamiquement
          allowExtraTime: true
        };
      } else if (isInTask3Continuation && task3ContinuationCount >= 2) { // Maximum 2 questions atteint
        return {
          text: audioDurationScenarios.si_le_candidat_parle_plus_de_4m30,
          audioUrl: scenarioAudioUrls.si_le_candidat_parle_plus_de_4m30,
          shouldEndExam: true
        };
      } else if (isInTask3Continuation && cumulativeTimeTask3 >= 270) { // 4m30 écoulées même en continuation
        return {
          text: audioDurationScenarios.si_le_candidat_parle_plus_de_4m30,
          audioUrl: scenarioAudioUrls.si_le_candidat_parle_plus_de_4m30,
          shouldEndExam: true
        };
      }
    }
    return null;
  };

  // Gérer la fin de la phase de préparation (tâche 2)
  const handlePreparationEnd = async () => {
    setIsPreparationPhase(false);
    setCurrentPhase('conversation');

    // Message de transition
    const transitionMessage = "C'est bon, les 2 minutes sont écoulées. Nous pouvons commencer. À vous d'initier la conversation.";

    // Générer l'audio pour le message de transition
    try {
      const audioResult = await synthesisService.synthesizeText(transitionMessage, subjectId);
      const audioUrl = audioResult && (audioResult.audioUrl || audioResult.filename)
        ? audioResult.audioUrl || synthesisService.getAudioUrl(audioResult.filename)
        : null;

      // Attendre que l'audio de transition soit terminé
      await addChatMessage('examiner', transitionMessage, audioUrl, 'audio');

      // Démarrer le chronomètre de conversation (3m30) après l'audio
      setIsConversationPhase(true);
      setConversationTime(0);
      addChatMessage('system', 'Phase de conversation démarrée (3 minutes 30 secondes). À vous d\'initier la conversation.');

      // Activer automatiquement le microphone après la phrase de transition
      // Ajout d'une vérification pour ne pas activer le micro automatiquement à la fin de la préparation de la tâche 2
      if (currentPhaseRef.current !== 'preparation') {
        setTimeout(() => {
          simulateMicrophoneClick();
        }, 100); // Délai court pour s'assurer que l'audio est bien terminé
      }
    } catch (error) {
      console.warn('Erreur génération audio transition:', error);
      await addChatMessage('examiner', transitionMessage);
      // Le microphone ne s'active pas automatiquement - le candidat doit l'activer manuellement

      // Démarrer le chronomètre de conversation même en cas d'erreur
      setIsConversationPhase(true);
      setConversationTime(0);
      addChatMessage('system', 'Phase de conversation démarrée (3 minutes 30 secondes). À vous d\'initier la conversation.');
    }
  };

  // Gérer la fin de la phase de conversation (tâche 2)
  const handleConversationEnd = async () => {
    if (isRecording) {
      await handleStopRecording();
    }
    setIsConversationPhase(false);
    isConversationActiveRef.current = false;
    setCurrentPhase('transition');

    // Message de fin de conversation
    const endMessage = "Le temps de conversation est écoulé. Merci pour cet échange.";

    try {
      const audioResult = await synthesisService.synthesizeText(endMessage, subjectId);
      const audioUrl = audioResult && (audioResult.audioUrl || audioResult.filename)
        ? audioResult.audioUrl || synthesisService.getAudioUrl(audioResult.filename)
        : null;

      // Attendre que l'audio de fin soit terminé
      await addChatMessage('examiner', endMessage, audioUrl, 'audio');
      // Activer automatiquement le microphone après le message de fin
      if (isRecording) {
        setTimeout(() => {
          simulateMicrophoneClick();
        }, 100);
      }
      // Passer à la tâche suivante ou terminer l'examen après l'audio
      if (currentTaskIndex < examData.tasks.length - 1) {
        handleNextTask();
      } else {
        handleExamEnd();
      }
    } catch (error) {
      console.warn('Erreur génération audio fin conversation:', error);
      await addChatMessage('examiner', endMessage);
      // Activer automatiquement le microphone même sans audio
      setTimeout(() => {
        simulateMicrophoneClick();
      }, 500);

      // Passer à la tâche suivante même en cas d'erreur
      if (currentTaskIndex < examData.tasks.length - 1) {
        handleNextTask();
      } else {
        handleExamEnd();
      }
    }
  };

  // Fonction pour formater et sauvegarder la conversation
  const formatAndSaveConversation = useCallback((messages, taskIndex) => {
    // Filtrer uniquement les messages de l'examinateur et de l'utilisateur
    const formattedConversation = messages
      .filter(msg => msg.sender === 'examiner' || msg.sender === 'user')
      .map(msg => `${msg.sender === 'user' ? 'Candidat' : 'Examinateur'}:${msg.content}`)
      .join(' ');

    // Préfixer avec le numéro de tâche
    const taskFormattedConversation = `tache${taskIndex + 1}:${formattedConversation}`;

    // Sauvegarder la conversation formatée dans localStorage
    localStorage.setItem(`formatted_conversation_task_${taskIndex + 1}`, taskFormattedConversation);
    console.log(`Conversation formatée sauvegardée pour la tâche ${taskIndex + 1}:`, taskFormattedConversation);

    return taskFormattedConversation;
  }, []);



  // Fonction pour ajouter un message au chat
  const addChatMessage = useCallback(async (sender, content, audioUrl = null, type = 'text') => {
    const newMessage = {
      id: Date.now() + Math.random(),
      sender,
      content,
      audioUrl,
      type,
      timestamp: new Date()
    };

    setChatMessages(prevMessages => [...prevMessages, newMessage]);
    console.log()

    // Jouer l'audio automatiquement pour les messages de l'examinateur ou si c'est un objectif de tâche
    if (audioUrl &&
      (sender === 'examiner' ||
        (content && content.includes('Objectif de la tâche')))) {

      // Retourner une promesse qui se résout quand l'audio est terminé
      return new Promise((resolve) => {
        // Attendre un court délai pour s'assurer que l'élément audio est monté
        setTimeout(async () => {
          if (audioPlayerRef.current) {
            try {
              console.log('Tentative de lecture audio automatique:', audioUrl);
              audioPlayerRef.current.src = audioUrl;
              audioPlayerRef.current.load();

              const handleAudioPlay = () => {
                console.log('Audio a commencé à jouer.');
                setAudioPlaying(true);
                if (audioPlayerRef.current) {
                  audioPlayerRef.current.removeEventListener('playing', handleAudioPlay);
                }
              };

              const handleAudioEnd = () => {
                console.log('Audio terminé');
                setAudioPlaying(false);
                if (audioPlayerRef.current) {
                  audioPlayerRef.current.removeEventListener('ended', handleAudioEnd);
                }
                resolve(newMessage);
              };

              audioPlayerRef.current.addEventListener('playing', handleAudioPlay);
              audioPlayerRef.current.addEventListener('ended', handleAudioEnd);

              const playPromise = audioPlayerRef.current.play();
              if (playPromise !== undefined) {
                await playPromise;
                console.log('La promesse de lecture audio est résolue.');
              }
            } catch (error) {
              console.error('Erreur lecture audio:', error);
              setAudioPlaying(false);
              resolve(newMessage);
            }
          } else {
            console.warn('AudioPlayerRef non disponible');
            resolve(newMessage);
          }
        }, 100);
      });
    }

    // Faire défiler vers le bas
    setTimeout(() => {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      }
    }, 100);

    return Promise.resolve(newMessage);
  }, []);

  // Interface de chat
  // Animations keyframes
  const pulseAnimation = keyframes`
    0% { transform: scale(1); opacity: 0.7; }
    50% { transform: scale(1.1); opacity: 0.4; }
    100% { transform: scale(1); opacity: 0.7; }
  `;

  const waveAnimation = keyframes`
    0%, 100% { transform: scaleY(1); }
    50% { transform: scaleY(1.5); }
  `;

  const glowAnimation = keyframes`
    0%, 100% { box-shadow: 0 0 20px rgba(79,204,231,0.3); }
    50% { box-shadow: 0 0 40px rgba(79,204,231,0.6); }
  `;

  // Composant de visualisation des fréquences vocales
  const VoiceVisualization = ({ isActive, isExaminer = false, intensity = 0.5 }) => {
    const [bars, setBars] = useState(Array(20).fill(0));

    useEffect(() => {
      if (isActive) {
        const interval = setInterval(() => {
          setBars(prev => prev.map((_, index) => {
            const baseHeight = Math.sin((Date.now() + index * 100) / 200) * 0.3 + 0.7;
            const randomVariation = Math.random() * 0.4;
            return (baseHeight + randomVariation) * intensity * (isExaminer ? 0.8 : 1);
          }));
        }, 80);
        return () => clearInterval(interval);
      } else {
        setBars(Array(20).fill(0.1));
      }
    }, [isActive, intensity, isExaminer]);

    return (
      <Box sx={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        gap: 0.8,
        height: 80,
        mb: 3
      }}>
        {bars.map((height, index) => (
          <Box
            key={index}
            sx={{
              width: 6,
              height: `${Math.max(height * 60, 3)}px`,
              background: isExaminer
                ? 'linear-gradient(to top, rgba(255,255,255,0.9), rgba(255,255,255,0.6))'
                : 'linear-gradient(to top, #4fccE7, #0083b0)',
              borderRadius: 3,
              transition: 'height 0.08s ease-in-out',
              opacity: isActive ? 1 : 0.3,
              animation: isActive ? `${waveAnimation} ${0.5 + index * 0.1}s ease-in-out infinite` : 'none'
            }}
          />
        ))}
      </Box>
    );
  };

  // Composant microphone central animé
  const AnimatedMicrophone = ({ isRecording, isExaminerSpeaking, onClick, feedbackMessage }) => {
    return (
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        mb: 4
      }}>
        {/* Halos lumineux multiples */}
        {[1, 2, 3].map((ring) => (
          <Box key={ring} sx={{
            position: 'absolute',
            width: isRecording ? 200 + (ring * 40) : isExaminerSpeaking ? 180 + (ring * 30) : 120 + (ring * 20),
            height: isRecording ? 200 + (ring * 40) : isExaminerSpeaking ? 180 + (ring * 30) : 120 + (ring * 20),
            borderRadius: '50%',
            background: isRecording
              ? `radial-gradient(circle, rgba(255,82,82,${0.4 - ring * 0.1}) 0%, rgba(255,82,82,${0.2 - ring * 0.05}) 50%, transparent 70%)`
              : isExaminerSpeaking
                ? `radial-gradient(circle, rgba(79,204,231,${0.5 - ring * 0.1}) 0%, rgba(79,204,231,${0.3 - ring * 0.05}) 50%, transparent 70%)`
                : `radial-gradient(circle, rgba(79,204,231,${0.3 - ring * 0.05}) 0%, rgba(79,204,231,${0.15 - ring * 0.03}) 50%, transparent 70%)`,
            transition: 'all 0.4s ease-in-out',
            animation: (isRecording || isExaminerSpeaking) ? `${pulseAnimation} ${2 + ring * 0.5}s infinite` : 'none',
            zIndex: -ring
          }} />
        ))}

        {/* Bouton microphone principal */}
        <IconButton
          onClick={onClick}
          className="animated-microphone"
          sx={{
            width: 100,
            height: 100,
            background: isRecording
              ? 'linear-gradient(135deg, #ff5252 0%, #d32f2f 100%)'
              : 'linear-gradient(135deg, rgba(79, 204, 231, 1) 0%, #0083b0 100%)',
            color: 'white',
            boxShadow: isRecording
              ? '0 12px 40px rgba(255,82,82,0.5)'
              : '0 12px 40px rgba(79,204,231,0.5)',
            transition: 'all 0.3s ease-in-out',
            transform: isRecording ? 'scale(1.15)' : 'scale(1)',
            animation: isRecording ? `${glowAnimation} 2s infinite` : 'none',
            '&:hover': {
              transform: 'scale(1.08)',
              boxShadow: isRecording
                ? '0 16px 50px rgba(255,82,82,0.6)'
                : '0 16px 50px rgba(79,204,231,0.6)'
            }
          }}
        >
          {isRecording ? <MicOff sx={{ fontSize: 40 }} /> : <Mic sx={{ fontSize: 40 }} />}
        </IconButton>
        <Typography sx={{ color: 'white', mt: 2, height: '20px' }}>
          {feedbackMessage}
        </Typography>
      </Box>
    );
  };

  // Barre de progression circulaire
  const CircularProgress = ({ progress, label }) => {
    const circumference = 2 * Math.PI * 45;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
      <Box sx={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width={100} height={100}>
          <circle
            cx={50}
            cy={50}
            r={45}
            stroke="rgba(255,255,255,0.2)"
            strokeWidth={4}
            fill="transparent"
          />
          <circle
            cx={50}
            cy={50}
            r={45}
            stroke="rgba(255,255,255,0.9)"
            strokeWidth={4}
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform="rotate(-90 50 50)"
            style={{
              transition: 'stroke-dashoffset 0.3s ease-in-out'
            }}
          />
        </svg>
        <Box sx={{
          position: 'absolute',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>

          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.6rem' }}>
            {label}
          </Typography>
        </Box>
      </Box>
    );
  };

  // Log des messages pour analyse (comme demandé)
  useEffect(() => {
    if (chatMessages.length > 0) {
      const lastMessage = chatMessages[chatMessages.length - 1];
      console.log('💬 Message échangé:', {
        sender: lastMessage.sender,
        content: lastMessage.content,
        timestamp: lastMessage.timestamp,
        audioUrl: lastMessage.audioUrl
      });
    }
  }, [chatMessages]);

  // Interface vocale ultra-moderne
  // Composant de chat pour afficher les échanges
  const renderChatInterface = () => {
    return (
      <Paper elevation={2} sx={{ overflow: 'hidden' }}>
        <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
          <MDTypography variant="h6" fontWeight="bold">
            💬 Conversation avec l'examinateur
          </MDTypography>
        </Box>
        <Box
          ref={chatContainerRef}
          sx={{
            maxHeight: '30vh',
            overflowY: 'auto',
            p: 2,
            backgroundColor: '#f8f9fa'
          }}
        >
          {chatMessages.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              La conversation apparaîtra ici...
            </Typography>
          ) : (
            chatMessages
              .filter(msg => msg.sender === 'examiner' || msg.sender === 'user')
              .map((message, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Box sx={{
                    display: 'flex',
                    justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                    mb: 1
                  }}>
                    <Paper
                      elevation={1}
                      sx={{
                        p: 2,
                        maxWidth: '80%',
                        backgroundColor: message.sender === 'user' ? '#e3f2fd' : '#fff3e0',
                        borderRadius: 2,
                        border: message.sender === 'user' ? '1px solid #2196f3' : '1px solid #ff9800'
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Chip
                          label={message.sender === 'user' ? 'Candidat' : 'Examinateur'}
                          size="small"
                          color={message.sender === 'user' ? 'primary' : 'warning'}
                          sx={{ mr: 1 }}
                        />
                        {message.timestamp && (
                          <Typography variant="caption" color="text.secondary">
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </Typography>
                        )}
                      </Box>
                      <Typography variant="body2" dangerouslySetInnerHTML={{ __html: message.content }}>
                      </Typography>
                    </Paper>
                  </Box>
                </Box>
              ))
          )}
        </Box>
      </Paper>
    );
  };

  const renderVoiceInterface = () => {

    return (
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        background: 'linear-gradient(135deg, rgba(79, 204, 231, 1) 0%, #0083b0 100%)',
        p: 4,
        borderRadius: 2,
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Overlay transparent pour bloquer les interactions utilisateur sauf si une modal est ouverte */}
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'transparent',
          // Ne pas bloquer les clics si le test micro ou la confirmation sont ouverts
          zIndex: (showMicTestDialog || showCancelConfirm) ? 0 : 9999,
          pointerEvents: (showMicTestDialog || showCancelConfirm) ? 'none' : 'all'

        }} />
        {/* Effet de particules en arrière-plan */}
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 20% 20%, rgba(255,255,255,0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 0%, transparent 50%),
            radial-gradient(circle at 40% 60%, rgba(255,255,255,0.05) 0%, transparent 50%)
          `,
          zIndex: 0
        }} />

        {/* Contenu principal */}
        <Box sx={{ position: 'relative', zIndex: 1, textAlign: 'center', width: '100%' }}>
          {/* Titre de la phase actuelle */}
          <Fade in={true}>
            <Typography variant="h4" sx={{
              color: 'white',
              fontWeight: 'bold',
              mb: 2,
              textShadow: '0 2px 10px rgba(0,0,0,0.3)'
            }}>
              {currentPhase === 'objective' ? '🎯 Présentation de l\'objectif' :
                currentPhase === 'waiting_confirmation' ? '⏳ Confirmation requise' :
                  currentPhase === 'trigger' ? '🚀 Démarrage de la tâche' :
                    currentPhase === 'interview' ? '🎤 Entretien en cours' :
                      currentPhase === 'preparation' ? '📝 Phase de préparation' :
                        currentPhase === 'conversation' ? '💬 Conversation libre' :
                          currentPhase === 'transition' ? '🔄 Transition en cours' :
                            '🎙️ Examen oral TCF'}
            </Typography>
          </Fade>

          {/* Indicateur d'état */}
          <Fade in={audioPlaying || waitingForResponse}>
            <Typography variant="h6" sx={{
              color: 'rgba(255,255,255,0.9)',
              mb: 3,
              minHeight: '2rem'
            }}>
              {audioPlaying ? '🔊 L\'examinateur parle...' :
                waitingForResponse ? '🤔 L\'examinateur réfléchit...' :
                  isRecording ? '🎙️ Vous parlez...' :
                    '👂 À votre écoute'}
            </Typography>
          </Fade>

          {/* Visualisation des fréquences vocales */}
          <VoiceVisualization
            isActive={isRecording || audioPlaying}
            isExaminer={audioPlaying}
            intensity={isRecording ? 0.9 : 0.7}
          />

          {/* Affichage en temps réel de la transcription pour diagnostic */}
          {/* {(isRecording || isTranscribing) && (
            <Fade in={true}>
              <Paper 
                elevation={3}
                sx={{
                  p: 2,
                  mt: 3,
                  backgroundColor: 'rgba(255,255,255,0.95)',
                  borderRadius: 2,
                  maxWidth: '80%',
                  mx: 'auto'
                }}
              >
                <Typography variant="h6" sx={{ mb: 1, color: '#1976d2', fontWeight: 'bold' }}>
                  🎤 Transcription en temps réel (DEBUG)
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{
                    fontFamily: 'monospace',
                    backgroundColor: '#f5f5f5',
                    p: 1.5,
                    borderRadius: 1,
                    border: '1px solid #ddd',
                    minHeight: '60px',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word'
                  }}
                >
                  {transcript || 'En attente de votre voix...'}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  📊 Longueur: {transcript.length} caractères | ⏱️ Temps: {recordingTime}s | 🔄 Transcription: {isTranscribing ? 'ACTIVE' : 'INACTIVE'}
                </Typography>
              </Paper>
            </Fade>
          )} */}

          {/* Microphone central animé */}
          <AnimatedMicrophone
            isRecording={isRecording}
            isExaminerSpeaking={audioPlaying}
            onClick={isRecording ? handleStopRecording : handleStartRecording}

            feedbackMessage={audioPlaying ? "Attendez que l'examinateur ait fini de parler" : ''}
          />

          {/* Informations de temps */}
          <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 4,
            mt: 3
          }}>
            {/* Timer d'enregistrement */}
            {isRecording && (
              <Zoom in={isRecording}>
                <Chip
                  icon={<Mic />}
                  label={`REC ${formatTime(recordingTime)}`}
                  sx={{
                    background: 'rgba(255,82,82,0.9)',
                    color: 'white',
                    fontWeight: 'bold',
                    animation: `${pulseAnimation} 1s infinite`
                  }}
                />
              </Zoom>
            )}

            {/* Timer de préparation */}
            {isPreparationPhase && (
              <CircularProgress
                progress={(preparationTime / 120) * 100}
                label="Préparation"
              />
            )}

            {/* Timer de conversation */}
            {isConversationPhase && (
              <CircularProgress
                progress={(conversationTime / 210) * 100}
                label="Conversation"
              />
            )}
          </Box>

          {/* Instructions contextuelles */}
          <Fade in={true}>
            <Typography variant="body1" sx={{
              color: 'rgba(255,255,255,0.8)',
              mt: 4,
              maxWidth: '600px',
              mx: 'auto',
              lineHeight: 1.6
            }}>
              {currentPhase === 'waiting_confirmation' ?
                '💡 Dites "oui", "prêt" pour confirmer. L\'examen continuera automatiquement dans 3 secondes.' :
                isRecording ?
                  '🎯 Exprimez-vous clairement et naturellement' :
                  audioPlaying ?
                    '👂 Écoutez attentivement les instructions' :
                    waitingForResponse ?
                      '⏳ L\'examinateur prépare sa réponse...' :
                      '🎙️ Cliquez sur le microphone pour commencer à parler'
              }
            </Typography>
          </Fade>
        </Box>
      </Box>
    );
  };

  // Fonction pour simuler le clic sur le microphone avec debounce
  const lastMicClickRef = useRef(0);
  const simulateMicrophoneClick = () => {
    const now = Date.now();
    if (now - lastMicClickRef.current < 400) {
      console.warn('Ignoré: clic microphone trop proche');
      return;
    }
    lastMicClickRef.current = now;

    const microphoneBtn = document.querySelector('.animated-microphone');
    if (microphoneBtn) {
      microphoneBtn.click();
    } else {
      console.warn('Bouton microphone non trouvé');
    }
  };

  // Initialisation du stream audio
  const initializeStream = async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100
        }
      });
      streamRef.current = stream;
      return true;
    } catch (error) {
      console.error('Erreur initialisation stream:', error);
      if (error.name === 'NotAllowedError') {
        setError('Accès au microphone refusé. Veuillez autoriser l\'accès dans les paramètres de votre navigateur.');
      } else if (error.name === 'NotFoundError') {
        setError('Aucun microphone détecté. Veuillez vérifier que votre microphone est bien branché et activé.');
      } else {
        setError('Impossible d\'accéder au microphone. Vérifiez les permissions et votre matériel.');
      }
      return false;
    }
  };

  // Configuration du MediaRecorder avec le stream existant
  const setupMediaRecorder = async () => {
    try {
      if (!streamRef.current || streamRef.current.getTracks().length === 0) {
        console.log("Stream non disponible, tentative d'initialisation...");
        const streamInitialized = await initializeStream();
        if (!streamInitialized) return false;
      }

      // Vérifier la compatibilité MediaRecorder
      if (!window.MediaRecorder) {
        throw new Error('MediaRecorder non supporté par ce navigateur');
      }

      // Nettoyer l'ancien MediaRecorder
      if (mediaRecorderRef.current) {
        if (mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop();
        }
        mediaRecorderRef.current = null;
      }

      // Tester différents formats MIME
      let mimeType = 'audio/webm';
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus';
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4';
      } else if (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) {
        mimeType = 'audio/ogg;codecs=opus';
      }

      console.log('Utilisation du format MIME:', mimeType);

      const mediaRecorder = new MediaRecorder(streamRef.current, {
        mimeType,
        audioBitsPerSecond: 128000
      });

      mediaRecorderRef.current = mediaRecorder;
      recordedChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: mimeType });
        setRecordingBlob(blob);
        setHasRecorded(true);
      };

      mediaRecorder.onerror = (event) => {
        console.error('Erreur MediaRecorder:', event.error);
        setError('Erreur lors de l\'enregistrement audio');
      };

      return true;
    } catch (error) {
      console.error('Erreur configuration MediaRecorder:', error);
      setError('Impossible de configurer l\'enregistreur audio.');
      return false;
    }
  };

  // Initialisation de l'enregistrement
  const initializeRecording = async () => {
    try {
      const streamInitialized = await initializeStream();
      if (!streamInitialized) return false;

      const success = await setupMediaRecorder();
      return success;

    } catch (error) {
      console.error('Erreur initialisation enregistrement:', error);
      setError('Impossible d\'initialiser l\'enregistrement.');
      return false;
    }
  };

  // Initialisation de la reconnaissance vocale
  // Fonction pour réinitialiser complètement la reconnaissance vocale
  const resetSpeechRecognition = () => {
    if (recognitionRef.current) {
      try {
        if (recognitionRef.current.state !== 'inactive') {
          recognitionRef.current.stop();
        }
      } catch (error) {
        console.warn('Erreur lors de l\'arrêt de l\'ancienne reconnaissance:', error);
      }
      recognitionRef.current = null;
    }
    setIsTranscribing(false);
    return initializeSpeechRecognition();
  };

  // Copier le lien de connexion dans le presse-papiers avec fallback
  const copyLoginLink = async () => {
    const loginPath = '/connexion-tcf';
    const loginUrl = `${window.location.origin}${loginPath}`;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(loginUrl);
        alert('Lien de connexion copié dans le presse-papiers !');
      } else {
        // Fallback ancien navigateur : ouvrir une boîte de prompt pour permettre la copie manuelle
        window.prompt('Copiez ce lien de connexion:', loginUrl);
      }
    } catch (e) {
      console.warn('Échec copie lien de connexion:', e);
      try {
        window.prompt('Copiez ce lien de connexion:', loginUrl);
      } catch (e2) {
        alert(`Veuillez copier manuellement ce lien: ${loginUrl}`);
      }
    }
  }; 

  const initializeSpeechRecognition = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.warn('Reconnaissance vocale non supportée');
      setShowBrowserWarning(true);
      return false;
    }

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      // Détecter Safari pour une configuration optimisée
      const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
      
      // Configuration adaptée au navigateur
      // Safari a des limitations avec continuous=true, on utilise une approche différente
      recognition.continuous = !isSafari; // Safari: false pour éviter les bugs
      recognition.interimResults = true;
      recognition.lang = 'fr-FR';
      recognition.maxAlternatives = 1;
      
      // Pour Safari, on doit redémarrer manuellement la reconnaissance
      const isSafariRef = isSafari;

      let restartTimeout = null;
      let currentTranscript = '';
      let storedTranscript = '';
      let lastUpdateTime = 0;
      let transcriptCheckTimer = null;
      // Délai dynamique selon la tâche
      const getComparisonDelay = (taskIndex) => {
        switch (taskIndex) {
          case 0: return 2000; // Tâche 1: 2 secondes
          case 1: return 1200; // Tâche 2: 1.2 secondes
          case 2: return 2500; // Tâche 3: 2.5 secondes
          default: return 1500; // Valeur par défaut
        }
      };
      const COMPARISON_DELAY = getComparisonDelay(currentTaskIndex);

      recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        if (finalTranscript) {
          accumulatedTranscriptRef.current += finalTranscript;
          // Réinitialiser le compteur d'erreurs no-speech car on a reçu une transcription
          noSpeechCountRef.current = 0;
        }

        const fullTranscript = accumulatedTranscriptRef.current + interimTranscript;
        setTranscript(fullTranscript);

        // Mettre à jour la transcription actuelle et l'horodatage
        currentTranscript = fullTranscript;
        lastUpdateTime = Date.now();

        // DEBUG: Affichage en temps réel pour diagnostic
        console.log('🎤 TRANSCRIPTION TEMPS RÉEL:', {
          finalTranscript,
          interimTranscript,
          fullTranscript,
          currentTranscript,
          storedTranscript,
          lastUpdateTime: new Date(lastUpdateTime).toLocaleTimeString(),
          timeSinceLastUpdate: Date.now() - lastUpdateTime
        });
      };

      recognition.onstart = () => {
        console.log('Reconnaissance vocale démarrée');
        setIsTranscribing(true);
        if (restartTimeout) {
          clearTimeout(restartTimeout);
          restartTimeout = null;
        }

        // Réinitialiser les variables
        currentTranscript = '';
        storedTranscript = '';
        lastUpdateTime = Date.now();

        if (transcriptCheckTimer) {
          clearInterval(transcriptCheckTimer);
        }

        // Vérification périodique pour la Tâche 2
        transcriptCheckTimer = setInterval(() => {
          if (
            isRecordingRef.current &&
            (currentPhaseRef.current === 'conversation' || currentPhaseRef.current === 'interview' || currentPhaseRef.current === 'waiting_confirmation')
          ) {
            const now = Date.now();
            const timeSinceUpdate = now - lastUpdateTime;

            // DEBUG: Affichage détaillé de l'état de la vérification
            console.log('🔍 VÉRIFICATION TRANSCRIPTION:', {
              isRecording,
              currentTaskIndex,
              currentPhase,
              timeSinceUpdate,
              COMPARISON_DELAY,
              shouldCompare: timeSinceUpdate >= COMPARISON_DELAY,
              currentTranscript: `"${currentTranscript}"`,
              storedTranscript: `"${storedTranscript}"`,
              areIdentical: currentTranscript === storedTranscript,
              isNotEmpty: currentTranscript.trim() !== ''
            });

            // Si 1.5 seconde s'est écoulée depuis la dernière mise à jour
            if (timeSinceUpdate >= COMPARISON_DELAY) {
              // Comparer la transcription actuelle avec celle stockée
              if (currentTranscript === storedTranscript && currentTranscript.trim() !== '') {
                console.log('✅ ARRÊT AUTOMATIQUE: Transcriptions identiques détectées après 1.5s');
                simulateMicrophoneClick();
              } else {
                // Stocker la transcription actuelle pour la prochaine comparaison
                console.log('📝 MISE À JOUR: Stockage nouvelle transcription pour comparaison');
                storedTranscript = currentTranscript;
                lastUpdateTime = now;
              }
            }
          }
        }, 250);
      };

      recognition.onerror = (event) => {
        console.error('Erreur reconnaissance vocale:', event.error);
        if (event.error === 'not-allowed') {
          setError('Permission microphone refusée');
        } else if (event.error === 'network') {
          console.warn('Erreur réseau de reconnaissance vocale, tentative de redémarrage...');
        } else if (event.error === 'no-speech') {
          // Afficher immédiatement la popup de test du microphone
          console.log('🎤 Erreur no-speech détectée - Affichage de la popup de test du microphone');

          // Arrêter l'enregistrement en cours
          if (isRecordingRef.current) {
            handleStopRecording();
          }

          // Afficher la popup de test
          setShowMicTestDialog(true);
          setMicTestStatus('idle');
          setMicTestTranscript('');
        }
      };

      recognition.onend = () => {
        console.log('Reconnaissance vocale terminée');
        setIsTranscribing(false);

        if (transcriptCheckTimer) {
          clearInterval(transcriptCheckTimer);
          transcriptCheckTimer = null;
        }

        // Vérifier si l'utilisateur n'a pas parlé (aucune transcription accumulée)
        if (isRecordingRef.current && accumulatedTranscriptRef.current.trim() === '') {
          console.log('🎤 Aucune parole détectée - gestion auto-dialogue microphone');
          // Arrêter l'enregistrement
          handleStopRecording();

          // Si la popup a été ouverte volontairement via "Reprendre", ne pas la rouvrir automatiquement
          if (!suppressMicAutoDialog) {
            // Afficher la popup de test du microphone pour aider l'utilisateur
            setShowMicTestDialog(true);
            setMicTestStatus('idle');
            setMicTestTranscript('');
          } else {
            // Réinitialiser le drapeau de suppression après l'action volontaire
            setSuppressMicAutoDialog(false);
          }

          return; // Ne pas redémarrer la reconnaissance
        }

        // Redémarrage automatique si l'enregistrement est toujours actif
        // Pour Safari (continuous=false), on doit redémarrer après chaque fin
        if (isRecordingRef.current && !restartTimeout) {
          const restartDelay = isSafariRef ? 50 : 100; // Plus rapide pour Safari
          restartTimeout = setTimeout(() => {
            try {
              if (recognition.state === 'inactive' || recognition.state === undefined) {
                console.log(`Redémarrage automatique de la reconnaissance vocale (Safari: ${isSafariRef})`);
                recognition.start();
              } else {
                console.warn('Reconnaissance vocale déjà active lors du redémarrage, état:', recognition.state);
              }
            } catch (error) {
              console.warn('Impossible de redémarrer la reconnaissance vocale:', error);
              // Pour Safari, réessayer après un délai plus long en cas d'erreur
              if (isSafariRef && isRecordingRef.current) {
                setTimeout(() => {
                  try {
                    recognition.start();
                  } catch (e) {
                    console.warn('Échec du redémarrage Safari:', e);
                  }
                }, 300);
              }
            }
            restartTimeout = null;
          }, restartDelay);
        }
      };

      recognitionRef.current = recognition;
      return true;
    } catch (error) {
      console.error('Erreur initialisation reconnaissance vocale:', error);
      return false;
    }
  };

  // Démarrer l'examen
  const handleStartExam = async () => {
    try {
      // Vérifier le navigateur : seul Google Chrome est autorisé
      if (!browserInfo.supported) {
        setShowBrowserWarning(true);
        playNotificationSound('error');
        return;
      }

      // Utiliser les informations utilisateur du contexte
      if (userInfo) {
        const currentSold = userInfo.sold;

        // Vérifier si l'utilisateur a suffisamment de crédits
        if (currentSold > 0) {

          // Décrémenter le solde de 1
          const newSold = currentSold - 1;
          console.log(newSold);
          // Mettre à jour le solde dans le backend via API
          await authService.updateSold(userInfo.username, newSold);

          // Recharger les informations utilisateur pour synchroniser
          await loadUserInfo(true);

          // Initialiser l'enregistrement et la reconnaissance vocale
          const recordingOk = await initializeRecording();
          if (!recordingOk) {
            // L'erreur est déjà définie dans initializeRecording/initializeStream
            return;
          }
          const recognitionOk = initializeSpeechRecognition();

          // Réinitialiser seulement les états nécessaires pour le démarrage
          setExamStarted(true);
          setCurrentTaskIndex(0);
          setCurrentPhase('objective');

          // Utiliser les fonctions de réinitialisation sélective
          resetForNewTask();
          resetAllChatStates();
          resetAllTaskStates();

          // Réinitialiser les sessions des agents IA pour un nouvel examen propre
          task1AgentService.resetSessionId();
          task2AgentServiceRef.current.resetSessionId();
          console.log('[Exam] Sessions IA réinitialisées pour le nouvel examen');

          // Sauvegarder les données du sujet dès le début de l'examen
          localStorage.setItem(`exam_subject_${subjectId}`, JSON.stringify(examData));
          // localStorage.setItem('examStarted', 'true');

          // Jouer l'objectif de la première tâche
          const firstTask = examData.tasks[0];
          const objectiveAudioUrl = audioUrls[`task_${firstTask.id}_objective`];

          // Ajouter le message et l'audio se déclenchera automatiquement
          await addChatMessage('examiner', `Objectif de la tâche: ${firstTask.objective}`, objectiveAudioUrl, 'audio');

          // Après l'audio, passer en phase d'attente de confirmation
          setTimeout(() => {
            setCurrentPhase('waiting_confirmation');
            addChatMessage('system', 'Êtes-vous prêt(e) à commencer cette tâche ? Répondez "oui" pour continuer.');
            // Activer automatiquement le microphone après le message de confirmation
            setTimeout(() => {
              simulateMicrophoneClick();
            }, 500);
          }, 2000);

        } else {
          // Afficher un message d'erreur si pas assez de crédits
          alert('Vous n\'avez pas suffisamment de crédits pour commencer cet examen.');
        }
      } else {
        alert('Erreur: Informations utilisateur non trouvées.');
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du solde:', error);
      alert('Erreur lors du démarrage de l\'examen. Veuillez réessayer.');
    }
  };

  // Gestion de l'audio
  const handleAudioEnded = () => {
    setAudioPlaying(false);
    setAudioEnded(true);
    setCanProceed(true);

    // Activer automatiquement le microphone après la fin de l'audio de l'agent IA dans la tâche 2
    if (currentTaskIndex === 1 && currentPhase === 'conversation' && !isRecording) {
      // Petit délai pour laisser le temps à l'interface de se mettre à jour
      setTimeout(() => {
        handleStartRecording();
        setCurrentPhase('conversation');
      }, 100);
    }
  };

  // Effets sonores pour les notifications
  const playNotificationSound = (type = 'start') => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      if (type === 'start') {
        // Son de début d'enregistrement (note montante)
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(880, audioContext.currentTime + 0.2);
      } else {
        // Son de fin d'enregistrement (note descendante)
        oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(440, audioContext.currentTime + 0.2);
      }

      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch (error) {
      console.log('Impossible de jouer le son de notification:', error);
    }
  };

  // ===== FONCTIONS DE TEST DU MICROPHONE =====

  // Démarrer le test du microphone
  const handleStartMicTest = async () => {
    try {
      setMicTestStatus('testing');
      setMicTestTranscript('');
      setMicTestRecording(true);

      // Vérifier d'abord si la reconnaissance vocale est supportée
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setMicTestStatus('error');
        const browserName = browserInfo.name || 'Votre navigateur';
        setMicTestTranscript(`La reconnaissance vocale n'est pas supportée par ${browserName}. Veuillez utiliser Google Chrome, Microsoft Edge ou Safari (macOS/iOS).`);
        setMicTestRecording(false);
        setShowBrowserWarning(true);
        return;
      }

      // Vérifier l'accès au microphone
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      // Détecter Safari pour configuration spécifique
      const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

      const testRecognition = new SpeechRecognition();
      testRecognition.continuous = false;
      testRecognition.interimResults = true;
      testRecognition.lang = 'fr-FR';
      
      // Safari nécessite parfois un délai avant de démarrer
      if (isSafari) {
        testRecognition.maxAlternatives = 1;
      }

      testRecognition.onresult = (event) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setMicTestTranscript(transcript);

        // Si on a un résultat final, le test est réussi
        if (event.results[0]?.isFinal && transcript.trim() !== '') {
          setMicTestStatus('success');
          setMicTestRecording(false);
        }
      };

      testRecognition.onerror = (event) => {
        console.error('Erreur test micro:', event.error);
        if (event.error === 'no-speech') {
          setMicTestTranscript('Aucune voix détectée. Parlez plus fort ou rapprochez-vous du microphone.');
        } else if (event.error === 'not-allowed') {
          setMicTestTranscript('Accès au microphone refusé. Vérifiez les permissions dans votre navigateur.');
        } else {
          setMicTestTranscript(`Erreur: ${event.error}. Vérifiez votre microphone.`);
        }
        setMicTestStatus('error');
        setMicTestRecording(false);
      };

      testRecognition.onend = () => {
        setMicTestRecording(false);
        stream.getTracks().forEach(track => track.stop());

        // Si aucun résultat n'a été obtenu
        if (micTestStatus === 'testing') {
          setMicTestStatus('error');
          if (!micTestTranscript) {
            setMicTestTranscript('Le test n\'a pas pu capturer votre voix. Essayez à nouveau.');
          }
        }
      };

      micTestRecognitionRef.current = testRecognition;
      testRecognition.start();

      // Arrêter automatiquement après 5 secondes
      setTimeout(() => {
        if (micTestRecognitionRef.current) {
          try {
            micTestRecognitionRef.current.stop();
          } catch (e) {
            console.warn('Erreur arrêt test micro:', e);
          }
          stream.getTracks().forEach(track => track.stop());
        }
      }, 5000);

    } catch (error) {
      console.error('Erreur accès microphone:', error);
      setMicTestStatus('error');
      if (error.name === 'NotAllowedError') {
        setMicTestTranscript('Accès au microphone refusé. Cliquez sur l\'icône du cadenas dans la barre d\'adresse pour autoriser l\'accès.');
      } else if (error.name === 'NotFoundError') {
        setMicTestTranscript('Aucun microphone détecté. Branchez un microphone et réessayez.');
      } else {
        setMicTestTranscript(`Erreur: ${error.message}`);
      }
      setMicTestRecording(false);
    }
  };

  // Arrêter le test du microphone
  const handleStopMicTest = () => {
    if (micTestRecognitionRef.current) {
      try {
        micTestRecognitionRef.current.stop();
      } catch (e) {
        console.warn('Erreur arrêt test micro:', e);
      }
    }
    setMicTestRecording(false);
  };

  // Fermer la popup et redémarrer l'examen
  const handleCloseMicTestAndRestart = async () => {
    setShowMicTestDialog(false);
    setMicTestStatus('idle');
    setMicTestTranscript('');

    // Réinitialiser le compteur d'erreurs
    noSpeechCountRef.current = 0;

    // Réinitialiser la reconnaissance vocale
    resetSpeechRecognition();

    // Réactiver le microphone après un court délai
    setTimeout(() => {
      simulateMicrophoneClick();
    }, 500);
  };

  // Fermer la popup sans redémarrer
  const handleCloseMicTestDialog = () => {
    setShowMicTestDialog(false);
    setMicTestStatus('idle');
    setMicTestTranscript('');
    noSpeechCountRef.current = 0;
  };

  // ===== FIN FONCTIONS DE TEST DU MICROPHONE =====

  // Démarrer l'enregistrement
  const handleStartRecording = async () => {
    console.log('🚀 DÉMARRAGE ENREGISTREMENT - État initial:', {
      audioPlaying,
      isRecording,
      isTranscribing,
      currentTaskIndex,
      currentPhase,
      mediaRecorderState: mediaRecorderRef.current?.state,
      recognitionState: recognitionRef.current?.state
    });

    if (currentPhase === 'objective') {
      console.warn("⚠️ BLOCAGE: Impossible de démarrer l'enregistrement pendant la présentation de l'objectif.");
      return;
    }

    // Empêcher l'enregistrement si l'examinateur parle
    if (audioPlaying) {
      console.warn("⚠️ BLOCAGE: Examinateur en train de parler");
      return;
    }

    try {
      // Vérifier si un enregistrement est déjà en cours
      if (isRecording) {
        console.warn('⚠️ BLOCAGE: Enregistrement déjà en cours');
        return;
      }

      if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') {
        const success = await setupMediaRecorder();
        if (!success) {
          setError('Impossible de configurer l\'enregistreur');
          return;
        }
      }

      // Vérifier l'état du MediaRecorder
      if (mediaRecorderRef.current.state !== 'inactive') {
        console.warn('MediaRecorder dans un état invalide:', mediaRecorderRef.current.state);
        await setupMediaRecorder();
      }

      setTranscript('');
      accumulatedTranscriptRef.current = '';
      setRecordingTime(0);
      setIsRecording(true);

      // Jouer le son de début d'enregistrement
      playNotificationSound('start');

      // Démarrer la reconnaissance vocale
      if (recognitionRef.current && !isTranscribing) {
        try {
          // Vérifier l'état de la reconnaissance vocale avant de la démarrer
          if (recognitionRef.current.state === 'inactive' || recognitionRef.current.state === undefined) {
            recognitionRef.current.start();
            console.log('Reconnaissance vocale démarrée');
          } else {
            console.warn('Reconnaissance vocale déjà active, état:', recognitionRef.current.state);
          }
        } catch (error) {
          console.warn('Erreur lors du démarrage de la reconnaissance:', error);
          // Tenter de réinitialiser la reconnaissance vocale
          if (error.message && error.message.includes('already started')) {
            console.log('Tentative de réinitialisation de la reconnaissance vocale...');
            resetSpeechRecognition();
          }
          setIsRecording(false);
          return;
        }
      }

      // Laisser un court instant à la reconnaissance pour démarrer avant l'enregistrement
      setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'inactive') {
          try {
            mediaRecorderRef.current.start(1000);
            console.log('Enregistrement démarré avec succès');
          } catch (startError) {
            console.error('Erreur lors du start():', startError);
            setIsRecording(false);
            if (recognitionRef.current && isTranscribing) {
              recognitionRef.current.stop();
            }
          }
        }
      }, 100); // Délai de 100ms

    } catch (error) {
      console.error('Erreur démarrage enregistrement:', error);
      setIsRecording(false);
      setError(`Impossible de démarrer l'enregistrement: ${error.message}`);
    }
  };

  // Arrêter l'enregistrement
  const handleStopRecording = async () => {
    try {
      console.log('🛑 ARRÊT ENREGISTREMENT - État initial:', {
        isRecording: isRecordingRef.current, // Utiliser la ref pour l'état le plus à jour
        isTranscribing,
        recordingTime,
        transcript: `"${transcript}"`,
        transcriptLength: transcript.length,
        currentTaskIndex: currentTaskIndexRef.current,
        currentPhase: currentPhaseRef.current,
        mediaRecorderState: mediaRecorderRef.current?.state,
        recognitionState: recognitionRef.current?.state
      });

      // Bloquer si aucun enregistrement n'est en cours (vérification avec la ref)
      if (!isRecordingRef.current) {
        console.warn('⚠️ BLOCAGE: Aucun enregistrement en cours (vérifié par ref)');
        return;
      }

      const finalRecordingTime = recordingTime;
      console.log('📊 STATISTIQUES FINALES:', {
        finalRecordingTime,
        finalTranscript: `"${transcript}"`,
        finalTranscriptLength: transcript.length
      });
      setIsRecording(false);

      // Jouer le son de fin d'enregistrement
      playNotificationSound('stop');

      // Arrêter le MediaRecorder
      if (mediaRecorderRef.current) {
        const state = mediaRecorderRef.current.state;
        console.log('État MediaRecorder:', state);

        if (state === 'recording') {
          mediaRecorderRef.current.stop();
          console.log('MediaRecorder arrêté');
        } else if (state === 'paused') {
          mediaRecorderRef.current.resume();
          mediaRecorderRef.current.stop();
        }
      }

      // Arrêter la reconnaissance vocale
      if (recognitionRef.current) {
        try {
          // Vérifier l'état avant d'arrêter
          const currentState = recognitionRef.current.state;
          console.log('État actuel de la reconnaissance vocale:', currentState);

          if (currentState !== 'inactive') {
            recognitionRef.current.stop();
            console.log('Reconnaissance vocale arrêtée');
          } else {
            console.log('Reconnaissance vocale déjà inactive');
          }
          setIsTranscribing(false);
        } catch (recognitionError) {
          console.warn('Erreur arrêt reconnaissance vocale:', recognitionError);
          setIsTranscribing(false);
        }
      }

      // Traiter la transcription immédiatement
      (async () => {
        // Vérifier les scénarios de durée selon la tâche
        const shouldTriggerScenario = (currentTaskIndex === 0 && (totalRecordingTime + finalRecordingTime) >= 120) ||
          (currentTaskIndex === 2 && finalRecordingTime >= 270);

        if (shouldTriggerScenario) {
          // Ajouter la transcription disponible au chat (même si incomplète)
          if (transcript.trim()) {
            await addChatMessage('user', transcript.trim());
          } else {
            await addChatMessage('user', '[Enregistrement interrompu - temps dépassé]');
          }

          // Déclencher immédiatement le scénario de dépassement de temps
          const durationScenario = await checkAudioDurationAndGetScenario(finalRecordingTime, currentTaskIndex, transcript.trim());
          if (durationScenario && currentPhase === 'interview') {
            setTimeout(async () => {
              // Générer l'audio dynamiquement si nécessaire (pour les messages de relance tâche 3)
              let audioUrl = durationScenario.audioUrl;
              if (!audioUrl && currentTaskIndex === 2 && durationScenario.allowExtraTime) {
                try {
                  audioUrl = await generateAudio(durationScenario.text);
                } catch (error) {
                  console.error('Erreur génération audio tâche 3:', error);
                }
              }

              await addChatMessage('examiner', durationScenario.text, audioUrl, 'audio');
              setCanProceed(true);

              // Logique selon la tâche et le scénario
              if (currentTaskIndex === 0) {
                // Tâche 1: gérer la continuation ou passer à la tâche suivante
                if (durationScenario.shouldEndTask) {
                  // Temps dépassé, passer à la tâche suivante
                  setTimeout(async () => {
                    await addChatMessage('system', 'Chargement de la tâche suivante...');
                    setWaitingForResponse(true);

                    setTimeout(() => {
                      handleNextTask();
                      setWaitingForResponse(false);
                    }, 2000);
                  }, 3000);
                } else if (durationScenario.allowContinuation) {
                  // Permettre la continuation
                  setTotalRecordingTime(prev => prev + finalRecordingTime);
                  setContinuationCount(prev => prev + 1);
                  setIsInContinuation(true);

                  // Activer le microphone pour la continuation
                  setTimeout(() => {
                    simulateMicrophoneClick();
                  }, 500);
                } else {
                  // Cas par défaut, passer à la tâche suivante
                  setTimeout(async () => {
                    await addChatMessage('system', 'Chargement de la tâche suivante...');
                    setWaitingForResponse(true);

                    setTimeout(() => {
                      handleNextTask();
                      setWaitingForResponse(false);
                    }, 2000);
                  }, 3000);
                }
              } else if (currentTaskIndex === 2) {
                // Tâche 3: gérer les scénarios de fin et les continuations
                if (durationScenario.shouldEndExam) {
                  // Pas d'activation du microphone car fin d'examen
                  setTimeout(() => {
                    handleExamEnd();
                  }, 3000);
                } else if (durationScenario.allowExtraTime && !isInTask3Continuation) {
                  // Premier temps supplémentaire ou continuation
                  setTimeout(() => {
                    simulateMicrophoneClick();
                  }, 500);
                  setIsInTask3Continuation(true);
                  setTask3ContinuationCount(prev => prev + 1);
                  setCanProceed(true);
                } else if (durationScenario.allowExtraTime && isInTask3Continuation && task3ContinuationCount < 2) {
                  // Continuation avec questions de relance limitées à 2
                  setTimeout(() => {
                    simulateMicrophoneClick();
                  }, 500);
                  setTask3ContinuationCount(prev => prev + 1);
                  setCanProceed(true);
                }
              }
            }, 1000);
          }

          // IMPORTANT: Ne pas appeler handleUserResponse pour éviter le double traitement
          return;
        } else {
          // Traitement normal pour les enregistrements qui n'ont pas dépassé le temps
          if (transcript.trim()) {
            await addChatMessage('user', transcript.trim());

            // Traitement spécial pour la tâche 2 en phase conversation (arrêt automatique)
            if (currentTaskIndexRef.current === 1 && currentPhaseRef.current === 'conversation') {
              console.log('🤖 TRAITEMENT AUTOMATIQUE TÂCHE 2: Envoi de la transcription à l\'agent');

              // Sauvegarder la réponse utilisateur dans localStorage (comme pour l'arrêt manuel)
              const examSession = JSON.parse(localStorage.getItem(`exam_session_${subjectId}_task_${currentTaskIndexRef.current}`) || '{}');
              examSession.userResponses = examSession.userResponses || [];
              examSession.userResponses.push({
                message: transcript.trim(),
                timestamp: new Date().toISOString(),
                conversationTime: conversationTime
              });
              localStorage.setItem(`exam_session_${subjectId}_task_${currentTaskIndexRef.current}`, JSON.stringify(examSession));

              const currentTask = examData.tasks[currentTaskIndexRef.current];

              // Concaténer l'objectif avec le trigger pour former le prompt complet
              const combinedObjective = currentTask.trigger ? `${currentTask.objective} ${currentTask.trigger}` : currentTask.objective;
              console.log('🎯 Objectif combiné (auto):', combinedObjective);
              console.log('🔗 Trigger utilisé (auto):', currentTask.trigger);

              const agentResponse = await task2AgentServiceRef.current.sendMessage(transcript.trim(), combinedObjective);

              if (agentResponse && agentResponse.text) {
                // L'audio se déclenchera automatiquement si une URL audio est fournie
                await addChatMessage('examiner', agentResponse.text, agentResponse.audioUrl, 'audio');
                setTimeout(() => {
                  simulateMicrophoneClick();
                }, 100);

              }
            } else {
              // Pour les autres tâches, utiliser le traitement standard
              await handleUserResponse(transcript.trim());
            }
          } else {
            await addChatMessage('system', 'Aucun texte détecté dans l\'enregistrement.');
          }
        }
      })(); // Exécution immédiate sans délai
      // Removed redundant duration check and transition logic here, as it's handled in handleUserResponse

    } catch (error) {
      console.error('Erreur arrêt enregistrement:', error);
      setIsRecording(false);
      setIsTranscribing(false);
    }
  };

  // Envoyer un message texte
  const handleSendTextMessage = () => {
    if (!textInput.trim()) return;

    const message = textInput.trim();
    setTextInput('');

    addChatMessage('user', message);
    handleUserResponse(message);
  };

  // Traiter la réponse utilisateur
  const handleUserResponse = async (userMessage) => {
    setWaitingForResponse(true);

    try {
      // Gérer la confirmation pour démarrer la tâche
      if (currentPhase === 'waiting_confirmation') {
        const confirmation = userMessage.toLowerCase().trim();
        if (confirmation.includes('oui') || confirmation.includes('yes') || confirmation.includes('prêt')) {
          setUserConfirmed(true);

          const currentTask = examData.tasks[currentTaskIndex];

          // Logique spécifique pour la tâche 2
          if (currentTaskIndex === 1) {
            setCurrentPhase('trigger');

            // Jouer le trigger de la tâche 2 et attendre qu'il se termine
            const triggerAudioUrl = audioUrls[`task_${currentTask.id}_trigger`];
            await addChatMessage('examiner', currentTask.trigger, triggerAudioUrl, 'audio');

            // Jouer l'audio d'interaction après le trigger
            if (currentTask.interactions && currentTask.interactions.length > 0) {
              const interaction = currentTask.interactions[0];
              const interactionAudioUrl = audioUrls[interaction.id];
              await addChatMessage('examiner', interaction.content, interactionAudioUrl, 'audio');
            }

            // Après les interactions, démarrer automatiquement la phase de préparation
            setCurrentPhase('preparation');
            setIsPreparationPhase(true);
            setPreparationTime(0);
            addChatMessage('system', 'Phase de préparation démarrée (2 minutes). Préparez vos questions.');
          } else {
            // Logique pour les autres tâches
            setCurrentPhase('trigger');

            const triggerAudioUrl = audioUrls[`task_${currentTask.id}_trigger`];
            await addChatMessage('examiner', currentTask.trigger, triggerAudioUrl, 'audio');
            // Activer automatiquement le microphone après le trigger
            setTimeout(() => {
              simulateMicrophoneClick();
            }, 500);

            // Après le trigger, passer en mode entretien
            setCurrentPhase('interview');
            addChatMessage('system', 'Vous pouvez maintenant commencer à répondre. L\'entretien a commencé.');
          }

          // Sauvegarder la discussion dans localStorage
          const examSession = {
            examId: subjectId,
            taskIndex: currentTaskIndex,
            phase: 'trigger',
            timestamp: new Date().toISOString(),
            messages: chatMessages
          };
          localStorage.setItem(`exam_session_${subjectId}_task_${currentTaskIndex}`, JSON.stringify(examSession));

        } else {
          await addChatMessage('system', 'Veuillez confirmer que vous êtes prêt(e) en répondant "oui".');
        }
        return;
      }

      // Gérer les réponses pendant l'entretien
      if (currentPhase === 'interview') {
        // Sauvegarder chaque réponse dans localStorage
        const examSession = JSON.parse(localStorage.getItem(`exam_session_${subjectId}_task_${currentTaskIndex}`) || '{}');
        examSession.userResponses = examSession.userResponses || [];
        examSession.userResponses.push({
          message: userMessage,
          timestamp: new Date().toISOString()
        });
        localStorage.setItem(`exam_session_${subjectId}_task_${currentTaskIndex}`, JSON.stringify(examSession));

        if (currentTaskIndex === 1) { // Tâche 2 - Interaction avec l'agent IA
          const currentTask = examData.tasks[currentTaskIndex];
          console.log('currentTask')
          console.log(currentTask)
          setCurrentPhase('conversation');

          // Concaténer l'objectif avec le trigger
          console.log('🔍 Debug currentTask:', currentTask);
          console.log('🔍 Debug currentTask.trigger:', currentTask.trigger);

          let combinedObjective = currentTask.objective;
          if (currentTask.trigger) {
            combinedObjective = currentTask.objective + "   " + currentTask.trigger;
            console.log('🔗 Objectif concaténé avec trigger:', combinedObjective);
          } else {
            console.log('⚠️ Aucun trigger trouvé, envoi de l\'objectif seul:', combinedObjective);
          }

          const agentResponse = await task2AgentServiceRef.current.sendMessage(userMessage, combinedObjective);

          if (agentResponse && agentResponse.text) {
            // L'audio se déclenchera automatiquement si une URL audio est fournie
            await addChatMessage('examiner', agentResponse.text, agentResponse.audioUrl, 'audio');
            // Activer automatiquement le microphone après la réponse de l'agent
            setTimeout(() => {
              simulateMicrophoneClick();
            }, 500);
            setCurrentPhase('conversation');
          }
        } else {
          // Pour les tâches 1 et 3, juste confirmer la réception
          await addChatMessage('system', 'Réponse enregistrée. Vous pouvez continuer ou passer à la tâche suivante.');

          // Appliquer les scénarios de durée même pour les messages texte
          // Utiliser la durée réelle de l'enregistrement au lieu d'une estimation
          const actualDuration = recordingTime;

          const durationScenario = await checkAudioDurationAndGetScenario(actualDuration, currentTaskIndex, userMessage);
          if (durationScenario && currentPhase === 'interview') {
            setTimeout(async () => {
              // Générer l'audio dynamiquement si nécessaire (pour les messages de relance tâche 3)
              let audioUrl = durationScenario.audioUrl;
              if (!audioUrl && currentTaskIndex === 2 && durationScenario.allowExtraTime) {
                try {
                  audioUrl = await generateAudio(durationScenario.text);
                } catch (error) {
                  console.error('Erreur génération audio tâche 3:', error);
                }
              }

              await addChatMessage('examiner', durationScenario.text, audioUrl, 'audio');

              // Logique selon la tâche
              if (currentTaskIndex === 0) {
                // Tâche 1: gérer la continuation ou passer à la tâche suivante
                if (durationScenario.shouldEndTask) {
                  // Temps dépassé, passer à la tâche suivante
                  setTimeout(async () => {
                    await addChatMessage('system', 'Chargement de la tâche suivante...');
                    setWaitingForResponse(true);

                    setTimeout(() => {
                      handleNextTask();
                      setWaitingForResponse(false);
                    }, 4000);
                  }, 4000);
                } else if (durationScenario.allowContinuation) {
                  // Permettre la continuation
                  setTotalRecordingTime(prev => prev + actualDuration);
                  setContinuationCount(prev => prev + 1);
                  setIsInContinuation(true);

                  // Activer le microphone pour la continuation
                  setTimeout(() => {
                    simulateMicrophoneClick();
                  }, 500);
                } else {
                  // Cas par défaut, passer à la tâche suivante
                  setTimeout(async () => {
                    await addChatMessage('system', 'Chargement de la tâche suivante...');
                    setWaitingForResponse(true);

                    setTimeout(() => {
                      handleNextTask();
                      setWaitingForResponse(false);
                    }, 4000);
                  }, 4000);
                }
              } else if (currentTaskIndex === 2) {
                // Tâche 3: gérer selon le scénario
                if (durationScenario.shouldEndExam) {
                  // Pas d'activation du microphone car fin d'examen
                  setTimeout(() => {
                    handleExamEnd();
                  }, 3000);
                } else if (durationScenario.allowExtraTime && !isInTask3Continuation) {
                  // Premier temps supplémentaire ou continuation
                  setTimeout(() => {
                    simulateMicrophoneClick();
                  }, 500);
                  setIsInTask3Continuation(true);
                  setTask3ContinuationCount(prev => prev + 1);
                  setCanProceed(true);
                } else if (durationScenario.allowExtraTime && isInTask3Continuation && task3ContinuationCount < 2) {
                  // Continuation avec questions de relance limitées à 2
                  setTimeout(() => {
                    simulateMicrophoneClick();
                  }, 500);
                  setTask3ContinuationCount(prev => prev + 1);
                  setCanProceed(true);
                }
              }
            }, 1000);
          }

          setCanProceed(true);
        }
      }

      // La logique de gestion des réponses supplémentaires a été supprimée
      // pour éviter de redemander la même question après le scénario de temps extra

      // Gérer les réponses pendant la phase de conversation (tâche 2)
      if (currentPhase === 'conversation') {
        // Sauvegarder chaque réponse dans localStorage
        const examSession = JSON.parse(localStorage.getItem(`exam_session_${subjectId}_task_${currentTaskIndex}`) || '{}');
        examSession.userResponses = examSession.userResponses || [];
        examSession.userResponses.push({
          message: userMessage,
          timestamp: new Date().toISOString(),
          conversationTime: conversationTime
        });
        localStorage.setItem(`exam_session_${subjectId}_task_${currentTaskIndex}`, JSON.stringify(examSession));

        // Interaction avec l'agent IA pour la tâche 2
        const currentTask = examData.tasks[currentTaskIndex];

        // Concaténer l'objectif avec le trigger
        let combinedObjective = currentTask.objective;
        if (currentTask.trigger) {
          combinedObjective = currentTask.objective + "\n\n" + currentTask.trigger;
          console.log('🔗 Objectif concaténé avec trigger (conversation):', combinedObjective);
        } else {
          console.log('⚠️ Aucun trigger trouvé (conversation), envoi de l\'objectif seul:', combinedObjective);
        }

        const agentResponse = await task2AgentServiceRef.current.sendMessage(userMessage, combinedObjective);

        // Vérifier si la conversation est toujours active avant de jouer la réponse
        // Cela empêche les réponses tardives de s'activer si l'utilisateur est déjà passé à la tâche 3
        if (agentResponse && agentResponse.text && currentTaskIndex === 1 && currentPhase === 'conversation' && isConversationPhase) {
          // Utiliser l'audio fourni par l'agent ou générer un nouveau si nécessaire
          if (agentResponse.audioUrl) {
            await addChatMessage('examiner', agentResponse.text, agentResponse.audioUrl, 'audio');
            // Activer automatiquement le microphone après la réponse de l'agent
            setTimeout(() => {
              simulateMicrophoneClick();
            }, 500);
          } else {
            // Générer l'audio si l'agent n'en fournit pas
            try {
              const audioResult = await synthesisService.synthesizeText(agentResponse.text, subjectId);
              const audioUrl = audioResult && (audioResult.audioUrl || audioResult.filename)
                ? audioResult.audioUrl || synthesisService.getAudioUrl(audioResult.filename)
                : null;

              await addChatMessage('examiner', agentResponse.text, audioUrl, 'audio');
              // Activer automatiquement le microphone après la réponse de l'agent
              setTimeout(() => {
                simulateMicrophoneClick();
              }, 500);
            } catch (error) {
              console.warn('Erreur génération audio agent:', error);
              await addChatMessage('examiner', agentResponse.text);
              // Activer automatiquement le microphone même sans audio
              setTimeout(() => {
                simulateMicrophoneClick();
              }, 500);
            }
          }
        } else if (agentResponse && agentResponse.text) {
          // Si la conversation n'est plus active, enregistrer la réponse sans jouer l'audio
          console.log('Réponse tardive ignorée car la conversation est terminée:', agentResponse.text);
        }
      }
    } catch (error) {
      console.error('Erreur traitement réponse:', error);
      await addChatMessage('system', 'Erreur lors du traitement de votre réponse.');
    } finally {
      setWaitingForResponse(false);

    }
  };

  // Passer à l'interaction suivante
  const handleNextInteraction = () => {
    const currentTask = examData.tasks[currentTaskIndex];

    if (currentInteraction < currentTask.interactions.length - 1) {
      // Interaction suivante dans la même tâche
      const nextInteractionIndex = currentInteraction + 1;
      setCurrentInteraction(nextInteractionIndex);

      const nextInteraction = currentTask.interactions[nextInteractionIndex];
      const audioUrl = audioUrls[nextInteraction.id];

      // L'audio se déclenchera automatiquement grâce à la fonction addChatMessage
      addChatMessage('examiner', nextInteraction.content, audioUrl, 'audio');
      setCanProceed(false);
      setAudioEnded(false);
    } else {
      // Passer à la tâche suivante
      handleNextTask();
    }
  };

  // Passer à la tâche suivante
  const handleNextTask = async () => {
    if (currentTaskIndex < examData.tasks.length - 1) {
      // Utiliser la fonction formatAndSaveConversation pour sauvegarder la conversation
      formatAndSaveConversation(chatMessagesRef.current, currentTaskIndex);
      console.log(`Conversation formatée sauvegardée pour la tâche ${currentTaskIndex + 1} dans handleNextTask`);

      // Sauvegarder la session complète de la tâche actuelle
      const completeSession = {
        examId: subjectId,
        taskIndex: currentTaskIndex,
        phase: 'completed',
        timestamp: new Date().toISOString(),
        messages: chatMessagesRef.current,
        completed: true
      };
      localStorage.setItem(`exam_session_${subjectId}_task_${currentTaskIndex}_complete`, JSON.stringify(completeSession));

      // Nettoyer les états avec les nouvelles fonctions de réinitialisation
      const nextTaskIndex = currentTaskIndex + 1;
      setCurrentTaskIndex(nextTaskIndex);
      setCurrentPhase('objective');

      // Utiliser les fonctions de réinitialisation sélective
      resetForNewTask();
      resetAllTaskStates();
      resetChatMessages();

      // Nettoyer les timers
      if (preparationTimerRef.current) {
        clearInterval(preparationTimerRef.current);
      }
      if (conversationTimerRef.current) {
        clearInterval(conversationTimerRef.current);
      }
      console.log(chatMessages);
      if (isRecording) {
        setTimeout(() => {
          simulateMicrophoneClick();
        }, 100);
      }
      // Réinitialiser l'agent pour la tâche 2
      if (currentTaskIndex === 0) {
        task2AgentServiceRef.current.resetSessionId();
      }

      // Jouer l'objectif de la nouvelle tâche immédiatement
      const nextTask = examData.tasks[nextTaskIndex];
      const objectiveAudioUrl = audioUrls[`task_${nextTask.id}_objective`];

      // Attendre que l'audio de l'objectif soit terminé
      await addChatMessage('examiner', `Objectif de la tâche ${nextTaskIndex + 1}: ${nextTask.objective}`, objectiveAudioUrl, 'audio');
      // Activer automatiquement le microphone après l'objectif
      if (nextTaskIndex !== 1) {
        setTimeout(() => {
          simulateMicrophoneClick();
        }, 500);
      }

      // Pour toutes les tâches, définir la phase objective puis passer en attente de confirmation
      setCurrentPhase('objective');
      setTimeout(() => {
        setCurrentPhase('waiting_confirmation');
        addChatMessage('system', 'Êtes-vous prêt(e) à commencer cette nouvelle tâche ? Répondez "oui" pour continuer.');
        // Activer automatiquement le microphone après le message de confirmation
        setTimeout(() => {
          simulateMicrophoneClick();
        }, 500);
      }, 3000); // Attendre que l'audio de l'objectif se termine
    } else {
      handleExamEnd();
    }
  };

  // Fin de l'examen
  const handleExamEnd = () => {
    // Utiliser la fonction formatAndSaveConversation pour sauvegarder la conversation
    formatAndSaveConversation(chatMessagesRef.current, currentTaskIndex);
    console.log(`Conversation formatée sauvegardée pour la tâche ${currentTaskIndex + 1} dans handleExamEnd`);

    // Vérifier que toutes les conversations formatées sont bien sauvegardées
    for (let i = 0; i < examData.tasks.length; i++) {
      const key = `formatted_conversation_task_${i + 1}`;
      const saved = localStorage.getItem(key);
      console.log(`Vérification de la conversation formatée pour la tâche ${i + 1}:`, saved || 'Non trouvée');
    }

    // Sauvegarder la session complète de la dernière tâche
    const completeSession = {
      examId: subjectId,
      taskIndex: currentTaskIndex,
      phase: 'completed',
      timestamp: new Date().toISOString(),
      messages: chatMessagesRef.current,
      completed: true
    };
    localStorage.setItem(`exam_session_${subjectId}_task_${currentTaskIndex}_complete`, JSON.stringify(completeSession));

    // Formater et sauvegarder les conversations pour l'API
    const formattedResponses = {};

    // Pour chaque tâche, récupérer et formater la conversation
    for (let taskIndex = 0; taskIndex < examData.tasks.length; taskIndex++) {
      const sessionKey = `exam_session_${subjectId}_task_${taskIndex}_complete`;
      const sessionData = localStorage.getItem(sessionKey);

      let formattedConversation = '';

      if (sessionData) {
        try {
          const session = JSON.parse(sessionData);
          if (session.messages && Array.isArray(session.messages)) {
            // Filtrer et formater les messages selon le format demandé
            const conversationParts = [];

            session.messages.forEach(message => {
              if (message.sender === 'user') {
                conversationParts.push(`User:${message.content}`);
              } else if (message.sender === 'examiner') {
                conversationParts.push(`Agent:${message.content}`);
              }
            });

            formattedConversation = conversationParts.join(',');
          }
        } catch (e) {
          console.error('Erreur lors du parsing de la session:', e);
        }
      }

      // Si c'est la tâche actuelle, utiliser les messages actuels
      if (taskIndex === currentTaskIndex) {
        const conversationParts = [];

        chatMessages.forEach(message => {
          if (message.sender === 'user') {
            conversationParts.push(`User:${message.content}`);
          } else if (message.sender === 'examiner') {
            conversationParts.push(`Agent:${message.content}`);
          }
          // Filtrer explicitement les messages système
        });

        formattedConversation = conversationParts.join(',');
      }

      formattedResponses[taskIndex] = formattedConversation;
    }

    // Sauvegarder les réponses formatées dans le format attendu par l'API
    localStorage.setItem(`tcf-oral-responses-${subjectId}`, JSON.stringify(formattedResponses));

    // Sauvegarder les données du sujet pour results.js
    localStorage.setItem(`exam_subject_${subjectId}`, JSON.stringify(examData));

    // Nettoyer les entrées localStorage inutiles
    for (let taskIndex = 0; taskIndex < examData.tasks.length; taskIndex++) {
      localStorage.removeItem(`exam_session_${subjectId}_task_${taskIndex}_complete`);
    }
    localStorage.removeItem(`exam_complete_${subjectId}`);
    localStorage.removeItem('exam_completion_timestamp');
    localStorage.removeItem('exam_chat_history');
    // localStorage.removeItem('examStarted');

    // Nettoyer les ressources
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    // Sauvegarder les résultats (legacy)
    localStorage.setItem('exam_completion_timestamp', new Date().toISOString());
    localStorage.setItem('exam_chat_history', JSON.stringify(chatMessages));

    // Rediriger vers la page des résultats
    navigate(`/simulateur-tcf-expression-orale/results/${subjectId}`);
  };

  // Formatage du temps pour l'enregistrement
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calcul du progrès
  const getProgress = () => {
    if (!examData) return 0;
    return ((currentTaskIndex + 1) / examData.tasks.length) * 100;
  };

  // Rendu conditionnel pour le chargement
  if (isLoading) {
    return (
      <DashboardLayout>
        <Box p={3}>
          <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="70vh">
            <LogoLoader>
              <Box className="logo-container">
                <Box className="logo-ring-2" />
                <Box className="logo-ring" />
                <Box 
                  component="img" 
                  src={tcfCanadaLogo} 
                  alt="TCF Canada" 
                  className="logo-image"
                />
              </Box>
              <Typography className="loading-text">
                Chargement de l'examen
              </Typography>
              <Box display="flex" alignItems="center">
                <Typography className="loading-subtext">
                  Initialisation en cours
                </Typography>
                <Box className="dots">
                  <span />
                  <span />
                  <span />
                </Box>
              </Box>
            </LogoLoader>
          </Box>
        </Box>
      </DashboardLayout>
    );
  }

  // Rendu conditionnel pour les erreurs
  if (error) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox p={3}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
          <MDButton variant="contained" onClick={() => navigate('/simulateur-tcf-expression-orale')}>
            Retour au simulateur
          </MDButton>
        </MDBox>
      </DashboardLayout>
    );
  }

  // Rendu conditionnel pour l'écran de démarrage
  if (!examStarted) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox p={3}>
          <Paper elevation={3} sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
            <MDBox textAlign="center" mb={4}>
              <MDTypography variant="h3" fontWeight="bold" color="primary" mb={2}>
                <div dangerouslySetInnerHTML={{ __html: examData.title }} />
              </MDTypography>
              <MDTypography variant="body1" color="text" mb={3}>
                <div dangerouslySetInnerHTML={{ __html: examData.description }} />
              </MDTypography>

              <Box display="flex" justifyContent="center" gap={2} mb={4}>

                <Chip
                  icon={<Mic />}
                  label={`${examData.tasks.length} tâches`}
                  color="secondary"
                  variant="outlined"
                />
              </Box>
            </MDBox>

            <Divider sx={{ my: 3 }} />

            {/* Alerte navigateur non compatible - affichée AVANT le démarrage */}
            {!browserInfo.supported && (
              <Box sx={{ mb: 4 }}>
                <Box sx={{
                  border: '2px solid #f44336',
                  borderRadius: 2,
                  p: 3,
                  bgcolor: '#fff5f5'
                }}>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                    <Box sx={{ color: '#b71c1c', fontSize: '1.6rem' }}>⚠️</Box>
                    <Box>
                      <Typography variant="h6" fontWeight="bold" color="error" gutterBottom>
                        Navigateur non compatible : {browserInfo.name || 'Non reconnu'}
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 2 }}>
                        Votre navigateur n'est pas autorisé pour l'examen oral. Seul <strong>Google Chrome</strong> est accepté.
                      </Typography>

                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 2 }}>
                        <Chip label="✅ Google Chrome" sx={{ backgroundColor: '#e8f5e9', color: '#2e7d32', fontWeight: 'bold' }} />
                        <Chip label="❌ Autres navigateurs" sx={{ backgroundColor: '#ffebee', color: '#c62828', fontWeight: 'bold' }} />
                      </Box>

                      <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                        💡 Astuce : Téléchargez et ouvrez cette page dans Google Chrome pour utiliser la reconnaissance vocale et voir les images de la tâche.
                      </Typography>

                      <Box sx={{ mt: 2 }}>
                        <Button
                          variant="outlined"
                          size="small"
                          sx={{ mr: 1 }}
                          onClick={() => {
                            copyLoginLink();
                          }}
                          style={{color: '#1976d2', borderColor: '#1976d2'}}
                        >
                          📋 Copier le lien de connexion
                        </Button>

                       
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Box>
            )}

            <MDBox mb={4}>
              <MDTypography variant="h5" fontWeight="bold" mb={2}>
                Instructions importantes :
              </MDTypography>
              <Box component="ul" sx={{ pl: 2 }}>
                <Typography component="li" sx={{ mb: 1 }}>
                  Assurez-vous d'être dans un environnement calme
                </Typography>
                <Typography component="li" sx={{ mb: 1 }}>
                  Vérifiez que votre microphone fonctionne correctement
                </Typography>
                <Typography component="li" sx={{ mb: 1 }}>
                  Écoutez attentivement les consignes audio
                </Typography>
                <Typography component="li" sx={{ mb: 1 }}>
                  Vous pouvez utiliser le mode vocal ou texte pour répondre
                </Typography>
              </Box>
            </MDBox>

            <Alert severity="info" sx={{ mb: 4 }}>
              <Typography>
                <strong>Note :</strong> L'examen commencera dès que vous cliquerez sur "Commencer l'examen".
                Assurez-vous d'être prêt(e) avant de continuer.
              </Typography>
            </Alert>

            <MDBox textAlign="center">
              <MDButton
                variant="contained"
                color="primary"
                size="large"
                onClick={handleStartExam}
                startIcon={<PlayArrow />}
                disabled={!browserInfo.supported}
              >
                Commencer l'examen
              </MDButton>
              {!browserInfo.supported && (
                <Typography variant="caption" display="block" color="error" sx={{ mt: 1 }}>
                  Veuillez utiliser un navigateur compatible pour commencer l'examen
                </Typography>
              )}
            </MDBox>
          </Paper>
        </MDBox>
      </DashboardLayout>
    );
  }

  // Rendu conditionnel pour l'écran de fin
  if (examCompleted) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox p={3}>
          <Paper elevation={3} sx={{ p: 4, maxWidth: 600, mx: 'auto', textAlign: 'center' }}>
            <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
            <MDTypography variant="h3" fontWeight="bold" color="success" mb={2}>
              Examen terminé !
            </MDTypography>
            <MDTypography variant="body1" mb={4}>
              Félicitations ! Vous avez terminé l'examen d'expression orale TCF Canada.
              Vos réponses ont été enregistrées avec succès.
            </MDTypography>

            <Box display="flex" justifyContent="center" gap={2}>
              <MDButton
                variant="contained"
                color="primary"
                onClick={() => navigate('/simulateur-tcf-expression-orale')}
              >
                Retour au simulateur
              </MDButton>
              <MDButton
                variant="outlined"
                color="secondary"
                onClick={() => navigate('/mon-espace-tcf')}
              >
                Tableau de bord
              </MDButton>
            </Box>
          </Paper>
        </MDBox>
      </DashboardLayout>
    );
  }

  const currentTask = examData.tasks[currentTaskIndex];

  // Rendu principal de l'examen
  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox p={3}>
        {/* En-tête avec progrès et timer */}
        <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <MDTypography variant="h5" fontWeight="bold">
              <div dangerouslySetInnerHTML={{ __html: currentTask.title }} />
            </MDTypography>
            <Box display="flex" alignItems="center" gap={2}>
              {/* Affichage du temps cumulé pour la tâche 1 */}
              {currentTaskIndex === 0 && (
                <Chip
                  icon={<AccessTime />}
                  label={`Temps cumulé: ${formatTime(totalRecordingTime)} / 2:00`}
                  color={totalRecordingTime >= 120 ? "error" : totalRecordingTime >= 90 ? "warning" : "primary"}
                  variant="filled"
                  size="small"
                />
              )}

              {/* Affichage de la phase actuelle */}
              {currentPhase && (
                <Chip
                  label={currentPhase === 'objective' ? 'Présentation de l\'objectif' :
                    currentPhase === 'waiting_confirmation' ? 'En attente de confirmation' :
                      currentPhase === 'trigger' ? 'Déclenchement de la tâche' :
                        currentPhase === 'interview' ? 'Entretien en cours' :
                          currentPhase === 'preparation' ? 'Préparation (2 min)' :
                            currentPhase === 'conversation' ? 'Conversation (3m30)' :
                              currentPhase === 'transition' ? 'Transition en cours' :
                                'Phase inconnue'}
                  color={
                    currentPhase === 'objective' ? 'info' :
                      currentPhase === 'waiting_confirmation' ? 'warning' :
                        currentPhase === 'trigger' ? 'secondary' :
                          currentPhase === 'interview' ? 'success' :
                            currentPhase === 'preparation' ? 'warning' :
                              currentPhase === 'conversation' ? 'success' :
                                currentPhase === 'transition' ? 'secondary' :
                                  'default'
                  }
                  variant="filled"
                  size="small"
                />
              )}

              {/* Timer de préparation pour la tâche 2 */}
              {isPreparationPhase && (
                <Chip
                  icon={<AccessTime />}
                  label={`Préparation: ${formatTime(preparationTime)} / 2:00`}
                  color={preparationTime > 100 ? "warning" : "info"}
                  variant="filled"
                  size="small"
                />
              )}

              {/* Timer de conversation pour la tâche 2 */}
              {isConversationPhase && (
                <Chip
                  icon={<AccessTime />}
                  label={`Conversation: ${formatTime(conversationTime)} / 3:30`}
                  color={conversationTime > 180 ? "warning" : "success"}
                  variant="filled"
                  size="small"
                />
              )}

              {isRecording && (
                <Chip
                  icon={<Mic />}
                  label={`REC ${formatTime(recordingTime)}`}
                  color="error"
                  variant="filled"
                  sx={{ animation: 'pulse 1s infinite' }}
                />
              )}
            </Box>
          </Box>


          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Tâche {currentTaskIndex + 1} sur {examData.tasks.length}
          </Typography>
        </Paper>

        <Box display="flex" flexDirection="column" gap={3}>
          {/* Panneau principal */}
          <Paper elevation={3} sx={{ flex: 1, p: 3 }}>
            <MDTypography variant="h6" fontWeight="bold" mb={2}>
              Consigne :
            </MDTypography>

            {/* Message d'instruction pour la phase d'attente */}
            {currentPhase === 'waiting_confirmation' && (
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography>
                  <strong>Êtes-vous prêt(e) à commencer cette tâche ?</strong><br />
                  Réponds simplement par “oui”, “je suis prêt” ou “je suis prête” pour confirmer et commencer l’entretien.
                </Typography>
              </Alert>
            )}

            {/* Image si présente - affichée uniquement pour Google Chrome */}
            {browserInfo.name === 'Chrome' && currentTask.imageUrl && (
              <Box sx={{ mb: 3, textAlign: 'center' }}>
                <img
                  src={currentTask.imageUrl}
                  alt="Image à décrire"
                  style={{
                    maxWidth: '100%',
                    maxHeight: 300,
                    borderRadius: 8,
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                  }}
                />
              </Box>
            )}

            <Divider sx={{ my: 3 }} />

            {/* Interface vocale */}
            {renderVoiceInterface()}

            {/* Boutons de navigation */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mt={3}>
              <Box>

              </Box>

              {canProceed && (
                <Button
                  variant="contained"
                  onClick={handleNextInteraction}
                  startIcon={currentInteraction < currentTask.interactions.length - 1 ?
                    <PlayArrow /> :
                    currentTaskIndex < examData.tasks.length - 1 ?
                      <PlayArrow /> : <CheckCircle />}
                  sx={{
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #0083b0 0%, #00b4db 100%)',
                    boxShadow: '0 4px 15px rgba(0, 131, 176, 0.3)',
                    color: 'white',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #006d94 0%, #0099bf 100%)',
                    }

                  }}
                   style={{color:'white'}}
                >
                  {currentInteraction < currentTask.interactions.length - 1 ?
                    "Continuer" :
                    currentTaskIndex < examData.tasks.length - 1 ?
                      "Tâche suivante" : "Terminer l'examen"}
                </Button>
              )} 

              {/* Bouton d'urgence */}
              {/* <Button
                variant="outlined"
                color="warning"
                startIcon={<Warning />}
                onClick={handleExamEnd}
              >
                Terminer l'examen
              </Button> */}
            </Box>
          </Paper>

          {/* Chat des échanges */}
          {/* {renderChatInterface()} */}
        </Box>

        {/* Lecteur audio caché */}
        <audio
          ref={audioPlayerRef}
          onEnded={handleAudioEnded}
          onError={(e) => {
            console.error('Erreur audio:', e);
            setAudioPlaying(false);
          }}
          style={{ display: 'none' }}
        />

        {/* Popup de test du microphone */}
        <Dialog
          open={showMicTestDialog}
          onClose={() => {
            setShowMicTestDialog(false);
            setMicTestStatus('idle');
            setMicTestTranscript('');
          }}
          maxWidth="sm"
          fullWidth
          sx={{
            zIndex: 9999,
            pointerEvents: 'auto',
          }}
          BackdropProps={{
            sx: {
              zIndex: 9998,
              pointerEvents: 'auto',
            }
          }}
          PaperProps={{
            sx: {
              borderRadius: '16px',
              background: '#ffffff',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              zIndex: 9999,
              pointerEvents: 'auto',
            }
          }}
        >
          <DialogTitle sx={{
            background: 'linear-gradient(135deg, #0083b0 0%, #00b4db 100%)',
            color: 'white',
            textAlign: 'center',
            py: 2.5
          }}
          style={{color:'white'}}
          >
            <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
              <Mic sx={{ fontSize: 28 }} />
              <Typography variant="h6" fontWeight="bold" style={{color:'white'}}>
                Test du microphone
              </Typography>
            </Box>
          </DialogTitle>

          <DialogContent sx={{ p: 3, mt: 1 }}>
            <Alert severity="info" sx={{ mb: 3, borderRadius: '8px' }}>
              Nous n'avons pas pu détecter votre voix. Testez votre microphone pour continuer l'examen.
            </Alert>

            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Typography variant="body1" mb={2} color="text.secondary">
                Cliquez sur le bouton ci-dessous et dites quelque chose :
              </Typography>

              {/* Bouton de test */}
              <Button
                variant="contained"
                onClick={() => {
                  if (micTestRecording) {
                    handleStopMicTest();
                  } else {
                    handleStartMicTest();
                  }
                }}
                disabled={micTestStatus === 'success'}
                startIcon={micTestRecording ? <CircularProgress size={20} color="inherit" /> : <Mic />}
                sx={{
                  py: 1.5,
                  px: 4,
                  borderRadius: '25px',
                  fontSize: '1rem',
                  textTransform: 'none',
                  background: micTestStatus === 'success'
                    ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
                    : micTestStatus === 'error'
                      ? 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)'
                      : 'linear-gradient(135deg, #0083b0 0%, #00b4db 100%)',
                  boxShadow: '0 4px 15px rgba(0, 131, 176, 0.3)',
                  '&:hover': {
                    background: micTestStatus === 'success'
                      ? 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)'
                      : micTestStatus === 'error'
                        ? 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)'
                        : 'linear-gradient(135deg, #006d94 0%, #0099bf 100%)',
                  },
                  '&:disabled': {
                    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                    color: 'white',
                  }
                }}
               style={{color:'white'}}
              >
                {micTestRecording ? 'Parlez maintenant...' :
                  micTestStatus === 'success' ? '✓ Test réussi !' :
                    micTestStatus === 'error' ? 'Réessayer le test microphone' :
                      'Testez votre microphone'}
              </Button>
            </Box>

            {/* Zone de transcription */}
            <Box sx={{
              p: 2,
              bgcolor: micTestStatus === 'success' ? '#ecfdf5' :
                micTestStatus === 'error' ? '#fff7ed' :
                  '#f8fafc',
              borderRadius: '12px',
              minHeight: '80px',
              border: micTestStatus === 'success' ? '2px solid #22c55e' :
                micTestStatus === 'error' ? '2px solid #f97316' :
                  '2px solid #e2e8f0'
            }}>
              <Typography variant="subtitle2" color="text.secondary" mb={1}>
                Transcription :
              </Typography>
              <Typography
                variant="body1"
                fontWeight={micTestTranscript ? 'medium' : 'regular'}
                color={micTestStatus === 'success' ? '#15803d' : micTestStatus === 'error' ? '#c2410c' : 'text.primary'}
              >
                {micTestTranscript || (micTestRecording ? '🎤 En attente de votre voix...' : 'Aucune transcription pour le moment')}
              </Typography>
            </Box>

            {/* Instructions supplémentaires */}
            {micTestStatus === 'error' && (
              <Box sx={{ mt: 2, p: 2, bgcolor: '#fffbeb', borderRadius: '8px', border: '1px solid #fde68a' }}>
                <Typography variant="subtitle2" color="#92400e" gutterBottom fontWeight="bold">
                  💡 Conseils :
                </Typography>
                <Typography variant="body2" component="ul" sx={{ pl: 2, color: '#92400e', m: 0 }}>
                  <li>Vérifiez que votre microphone est bien branché</li>
                  <li>Autorisez l'accès au microphone dans votre navigateur</li>
                  <li>Parlez clairement près du microphone</li>
                </Typography>
              </Box>
            )}
          </DialogContent>

          <DialogActions sx={{ p: 2, gap: 1, borderTop: '1px solid #e2e8f0' }}>
            <Button
              onClick={() => {
                // Fermer le test microphone puis afficher la confirmation avant redirection
                setShowMicTestDialog(false);
                setMicTestStatus('idle');
                setMicTestTranscript('');
                setShowCancelConfirm(true);
              }}
              variant="outlined"
              sx={{
                borderRadius: '8px',
                borderColor: '#cbd5e1',
                color: '#64748b',
                '&:hover': {
                  borderColor: '#94a3b8',
                  bgcolor: '#f8fafc'
                }
              }}
            >
              Annuler
            </Button>
            <Button
              onClick={() => {
                setShowMicTestDialog(false);
                setMicTestStatus('idle');
                setMicTestTranscript('');
                // Réinitialiser la reconnaissance vocale
                resetSpeechRecognition();
                // Réactiver le microphone après un court délai
                setTimeout(() => {
                  simulateMicrophoneClick();
                }, 500);
              }}
              variant="contained"
              disabled={micTestRecording}
              sx={{
                borderRadius: '8px',
                background: micTestStatus === 'success'
                  ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
                  : 'linear-gradient(135deg, #0083b0 0%, #00b4db 100%)',
                boxShadow: micTestStatus === 'success'
                  ? '0 4px 15px rgba(34, 197, 94, 0.3)'
                  : '0 4px 15px rgba(0, 131, 176, 0.3)',
                '&:hover': {
                  background: micTestStatus === 'success'
                    ? 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)'
                    : 'linear-gradient(135deg, #006d94 0%, #0099bf 100%)',
                },
                '&:disabled': {
                  opacity: 0.6
                }
              }}
               style={{color:'white'}}
            >
              {micTestStatus === 'success' ? '✓ Continuer l\'examen' : 'Reprendre l\'examen'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog confirmation sortie - avertissement débit */}
        <Dialog
          open={showCancelConfirm}
          onClose={() => setShowCancelConfirm(false)}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle sx={{ textAlign: 'center' }}>Confirmation</DialogTitle>
          <DialogContent>
            <MDTypography variant="body1" color="text" sx={{ mb: 2 }}>
             Attention : Si vous quittez l'examen maintenant, votre solde sera débité. 
             Voulez-vous continuer ?
            </MDTypography>
          </DialogContent>
          <DialogActions sx={{ p: 2, gap: 1 }}>
            <Button
              variant="outlined"
              onClick={() => {
                // Reprendre l'examen: rouvrir le test micro et démarrer le test micro en sécurité
                setShowCancelConfirm(false);
                setShowMicTestDialog(true);
                // Empêcher que la logique de fin d'enregistrement ré-ouvre la popup automatiquement
                setSuppressMicAutoDialog(true);
                // Démarrer le test du microphone (utilise son propre SpeechRecognition)
                try {
                  handleStartMicTest();
                } catch (e) {
                  console.warn('Erreur démarrage test micro automatique:', e);
                  // Au minimum, réinitialiser la reconnaissance principale
                  resetSpeechRecognition();
                }
                // Nettoyer le drapeau après un timeout (sécurité)
                setTimeout(() => setSuppressMicAutoDialog(false), 6000);
              }}
              style={{color:"#000"}}
            >
              Reprendre
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                setShowCancelConfirm(false);
                // Rediriger vers la page principale (simulateur)
                navigate('/simulateur-tcf-expression-orale');
              }}
              sx={{ background: 'linear-gradient(135deg, #0083b0 0%, #00b4db 100%)', color: 'white' }}
              style={{color:'white'}}
            >
              Confirmer
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog d'avertissement pour navigateurs non supportés (Firefox, etc.) */}
        <Dialog
          open={showBrowserWarning}
          onClose={() => setShowBrowserWarning(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: '16px',
              background: '#ffffff',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            }
          }}
        >
          <DialogTitle sx={{
            background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
            color: 'white',
            textAlign: 'center',
            py: 2.5
          }}
          style={{color:'white'}}
          >
            <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
              <Warning sx={{ fontSize: 28 }} />
              <Typography variant="h6" fontWeight="bold" style={{color:'white'}}>
                Navigateur non compatible
              </Typography>
            </Box>
          </DialogTitle>

          <DialogContent sx={{ p: 3, mt: 1 }}>
            <Box sx={{ border: '2px solid #f44336', borderRadius: 2, p: 3, bgcolor: '#fff5f5', mb: 2 }}>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                <Warning sx={{ fontSize: 28, color: '#b71c1c' }} />
                <Box>
                  <Typography variant="body1" fontWeight="medium">
                    Votre navigateur ({browserInfo.name || 'actuel'}) n'est pas autorisé pour l'examen oral.
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Pour passer l'examen et voir les images de la tâche, utilisez uniquement <strong>Google Chrome</strong>.
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                    <Chip label="✅ Google Chrome" sx={{ backgroundColor: '#e8f5e9', color: '#2e7d32', fontWeight: 'bold' }} />
                    <Chip label="❌ Autres navigateurs" sx={{ backgroundColor: '#ffebee', color: '#c62828', fontWeight: 'bold' }} />
                  </Box>
                </Box>
              </Box>
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              💡 <strong>Astuce :</strong> Ouvrez cette page dans Google Chrome pour activer la reconnaissance vocale et voir toutes les images des tâches.
            </Typography>
          </DialogContent>

          <DialogActions sx={{ p: 2, gap: 1, borderTop: '1px solid #e2e8f0' }}>
            <Button
              onClick={() => setShowBrowserWarning(false)}
              variant="outlined"
              sx={{
                borderRadius: '8px',
                borderColor: '#cbd5e1',
                color: '#64748b',
                '&:hover': {
                  borderColor: '#94a3b8',
                  bgcolor: '#f8fafc'
                }
              }}
            >
              Fermer
            </Button>
            <Button
              onClick={() => {
                copyLoginLink();
              }}
              variant="contained"
              sx={{
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #0083b0 0%, #00b4db 100%)',
                boxShadow: '0 4px 15px rgba(0, 131, 176, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #006d94 0%, #0099bf 100%)',
                }
              }}
              style={{color:'white'}}
            >
              📋 Copier le lien de connexion
            </Button>
          </DialogActions>
        </Dialog>
      </MDBox>
    </DashboardLayout>
  );
};

export default TCFOralExam;