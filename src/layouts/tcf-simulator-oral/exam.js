import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  keyframes
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

const TCFOralExam = () => {
  const { subjectId } = useParams();
  const navigate = useNavigate();
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

  // États du chat
  const [chatMessages, setChatMessages] = useState([]);
  const chatMessagesRef = useRef(chatMessages);
  chatMessagesRef.current = chatMessages;
  const [inputMethod, setInputMethod] = useState('voice');
  const [textInput, setTextInput] = useState('');
  const [waitingForResponse, setWaitingForResponse] = useState(false);
  
  // États pour le flux objectif -> confirmation -> trigger
  const [currentPhase, setCurrentPhase] = useState('objective'); // 'objective', 'waiting_confirmation', 'trigger', 'interview', 'preparation', 'conversation'
  const [userConfirmed, setUserConfirmed] = useState(false);
  const isRecordingRef = useRef(isRecording);
  const currentTaskIndexRef = useRef(currentTaskIndex);
  const currentPhaseRef = useRef(currentPhase);

  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

  useEffect(() => {
    currentTaskIndexRef.current = currentTaskIndex;
  }, [currentTaskIndex]);

  useEffect(() => {
    currentPhaseRef.current = currentPhase;
  }, [currentPhase]);
  
  // États spécifiques à la tâche 2
  const [preparationTime, setPreparationTime] = useState(0); // Timer de préparation (2 minutes)
  const [conversationTime, setConversationTime] = useState(0); // Timer de conversation (3m30)
  const [isPreparationPhase, setIsPreparationPhase] = useState(false);
  const [isConversationPhase, setIsConversationPhase] = useState(false);
  const preparationTimerRef = useRef(null);
  const conversationTimerRef = useRef(null);
  
  // États spécifiques à la tâche 3
  const [isExtraTimePhase, setIsExtraTimePhase] = useState(false); // Pour gérer le temps supplémentaire
  const [extraTimeUsed, setExtraTimeUsed] = useState(false); // Pour éviter les répétitions de scénarios

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
            // Pour la tâche 2 (index 1), ne pas inclure d'interactions
            interactions: index === 1 ? [] : (task.interactions || [{
              id: `${task.id}_interaction_1`,
              content: task.instruction || task.description,
              type: 'instruction'
            }])
          }))
        };

        setExamData(transformedData);

        // Générer les URLs audio pour l'objectif et le trigger de chaque tâche
        const urls = {};
        for (let i = 0; i < transformedData.tasks.length; i++) {
          const task = transformedData.tasks[i];
          
          // Générer audio pour l'objectif
          if (task.objective) {
            try {
              const objectiveAudioResult = await synthesisService.synthesizeText(task.objective);
              if (objectiveAudioResult && (objectiveAudioResult.audioUrl || objectiveAudioResult.filename)) {
                urls[`task_${task.id}_objective`] = objectiveAudioResult.audioUrl || synthesisService.getAudioUrl(objectiveAudioResult.filename);
              }
            } catch (audioError) {
              console.warn(`Erreur génération audio pour objectif tâche ${task.id}:`, audioError);
            }
          }
          
          // Pour la tâche 2 (index 1), ne générer que l'objectif
          if (i !== 1) {
            // Générer audio pour le trigger
            if (task.trigger) {
              try {
                const triggerAudioResult = await synthesisService.synthesizeText(task.trigger);
                if (triggerAudioResult && (triggerAudioResult.audioUrl || triggerAudioResult.filename)) {
                  urls[`task_${task.id}_trigger`] = triggerAudioResult.audioUrl || synthesisService.getAudioUrl(triggerAudioResult.filename);
                }
              } catch (audioError) {
                console.warn(`Erreur génération audio pour trigger tâche ${task.id}:`, audioError);
              }
            }
            
            // Générer audio pour les interactions existantes
            for (const interaction of task.interactions) {
              if (interaction.content) {
                try {
                  const audioResult = await synthesisService.synthesizeText(interaction.content);
                  if (audioResult && (audioResult.audioUrl || audioResult.filename)) {
                    urls[interaction.id] = audioResult.audioUrl || synthesisService.getAudioUrl(audioResult.filename);
                  }
                } catch (audioError) {
                  console.warn(`Erreur génération audio pour ${interaction.id}:`, audioError);
                }
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
            if (newTime >= 120) { // 2 minutes maximum
              handleStopRecording();
              return newTime;
            }
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
    "si_fin_avant_1min30": "Très bien, vous avez terminé un peu avant la fin du temps imparti. Nous allons passer à la tâche suivante.",
    "si_fin_avant_2min": "Merci, vous avez terminé juste avant la fin. C'est parfait, passons à la tâche suivante.",
    // Tâche 3
    "si_le_candidat_parle_plus_de_4m30": "Le temps est écoulé. Merci pour votre réponse.",
    "si_le_candidat_termine_entre_3m30_et_4m30": "Merci pour votre réponse, nous avons encore un peu de temps si vous souhaitez compléter votre point de vue.",
    "si_le_candidat_termine_avant_3m30": "Très bien. Souhaitez-vous ajouter quelque chose ? Il nous reste un peu de temps."
  };

  // Générer l'audio pour les scénarios de durée
  const [scenarioAudioUrls, setScenarioAudioUrls] = useState({});

  // Charger les audios des scénarios au démarrage
  useEffect(() => {
    const loadScenarioAudios = async () => {
      const urls = {};
      for (const [key, text] of Object.entries(audioDurationScenarios)) {
        try {
          const audioResult = await synthesisService.synthesizeText(text);
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
  const checkAudioDurationAndGetScenario = (audioDuration, taskIndex = currentTaskIndex) => {
    if (taskIndex === 0) { // Tâche 1
      if (audioDuration > 120) { // Plus de 2 minutes
        return {
          text: audioDurationScenarios.si_dépasse_2_minutes,
          audioUrl: scenarioAudioUrls.si_dépasse_2_minutes
        };
      } else if (audioDuration < 90) { // Moins de 1min30
        return {
          text: audioDurationScenarios.si_fin_avant_1min30,
          audioUrl: scenarioAudioUrls.si_fin_avant_1min30
        };
      } else if (audioDuration < 120) { // Entre 1min30 et 2min
        return {
          text: audioDurationScenarios.si_fin_avant_2min,
          audioUrl: scenarioAudioUrls.si_fin_avant_2min
        };
      }
    } else if (taskIndex === 2) { // Tâche 3
      if (audioDuration > 270) { // Plus de 4m30 (270 secondes)
        return {
          text: audioDurationScenarios.si_le_candidat_parle_plus_de_4m30,
          audioUrl: scenarioAudioUrls.si_le_candidat_parle_plus_de_4m30,
          shouldEndExam: true
        };
      } else if (audioDuration >= 210 && audioDuration <= 270) { // Entre 3m30 et 4m30
        return {
          text: audioDurationScenarios.si_le_candidat_termine_entre_3m30_et_4m30,
          audioUrl: scenarioAudioUrls.si_le_candidat_termine_entre_3m30_et_4m30,
          allowExtraTime: true
        };
      } else if (audioDuration < 210) { // Moins de 3m30
        return {
          text: audioDurationScenarios.si_le_candidat_termine_avant_3m30,
          audioUrl: scenarioAudioUrls.si_le_candidat_termine_avant_3m30,
          allowExtraTime: true
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
      const audioResult = await synthesisService.synthesizeText(transitionMessage);
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
      setTimeout(() => {
         simulateMicrophoneClick();
      }, 100); // Délai court pour s'assurer que l'audio est bien terminé
    } catch (error) {
      console.warn('Erreur génération audio transition:', error);
      await addChatMessage('examiner', transitionMessage);
      
      // Démarrer le chronomètre de conversation même en cas d'erreur
      setIsConversationPhase(true);
      setConversationTime(0);
      addChatMessage('system', 'Phase de conversation démarrée (3 minutes 30 secondes). À vous d\'initier la conversation.');
    }
  };

  // Gérer la fin de la phase de conversation (tâche 2)
  const handleConversationEnd = async () => {
    if (isRecording) {
      setTimeout(async() => {
         await handleStopRecording();
      }, 2000);
      await handleStopRecording();
    }
    setIsConversationPhase(false);
    
    // Message de fin de conversation
    const endMessage = "Le temps de conversation est écoulé. Merci pour cet échange.";
    
    try {
      const audioResult = await synthesisService.synthesizeText(endMessage);
      const audioUrl = audioResult && (audioResult.audioUrl || audioResult.filename) 
        ? audioResult.audioUrl || synthesisService.getAudioUrl(audioResult.filename)
        : null;
      
      // Attendre que l'audio de fin soit terminé
      await addChatMessage('examiner', endMessage, audioUrl, 'audio');
      
      // Passer à la tâche suivante ou terminer l'examen après l'audio
      if (currentTaskIndex < examData.tasks.length - 1) {
        handleNextTask();
      } else {
        handleExamEnd();
      }
    } catch (error) {
      console.warn('Erreur génération audio fin conversation:', error);
      await addChatMessage('examiner', endMessage);
      
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
  const AnimatedMicrophone = ({ isRecording, isExaminerSpeaking, onClick, disabled, feedbackMessage }) => {
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
          disabled={disabled}
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
              transform: disabled ? 'scale(1)' : 'scale(1.08)',
              boxShadow: isRecording 
                ? '0 16px 50px rgba(255,82,82,0.6)'
                : '0 16px 50px rgba(79,204,231,0.6)'
            },
            '&:disabled': {
              opacity: 0.6,
              transform: 'scale(0.95)'
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
          {(isRecording || isTranscribing) && (
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
          )}
          
          {/* Microphone central animé */}
          <AnimatedMicrophone 
            isRecording={isRecording}
            isExaminerSpeaking={audioPlaying}
            onClick={isRecording ? handleStopRecording : handleStartRecording}
            disabled={waitingForResponse || audioPlaying}
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
                '💡 Dites "oui", "prêt" ou "ready" pour confirmer' :
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

  // Fonction pour simuler le clic sur le microphone
  const simulateMicrophoneClick = () => {
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

  const initializeSpeechRecognition = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.warn('Reconnaissance vocale non supportée');
      return false;
    }

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'fr-FR';
      recognition.maxAlternatives = 1;

      let restartTimeout = null;
      let currentTranscript = '';
      let storedTranscript = '';
      let lastUpdateTime = 0;
      let transcriptCheckTimer = null;
      const COMPARISON_DELAY = 1000; // 1.5 secondes avant comparaison

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
            currentTaskIndexRef.current === 1 &&
            currentPhaseRef.current === 'conversation'
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
          } else {
            // DEBUG: Pourquoi la vérification n'est pas active
            console.log('⏸️ VÉRIFICATION INACTIVE:', {
              isRecording: isRecordingRef.current,
              currentTaskIndex: currentTaskIndexRef.current,
              currentPhase: currentPhaseRef.current,
              isTask2: currentTaskIndexRef.current === 1,
              isConversationPhase: currentPhaseRef.current === 'conversation'
            });
          }
        }, 250);
      };

      recognition.onerror = (event) => {
        console.error('Erreur reconnaissance vocale:', event.error);
        if (event.error === 'not-allowed') {
          setError('Permission microphone refusée');
        } else if (event.error === 'network') {
          console.warn('Erreur réseau de reconnaissance vocale, tentative de redémarrage...');
        }
      };

      recognition.onend = () => {
        console.log('Reconnaissance vocale terminée');
        setIsTranscribing(false);

        if (transcriptCheckTimer) {
          clearInterval(transcriptCheckTimer);
          transcriptCheckTimer = null;
        }

        if (isRecording && !restartTimeout) {
          restartTimeout = setTimeout(() => {
            try {
              if (recognition.state === 'inactive' || recognition.state === undefined) {
                console.log('Redémarrage automatique de la reconnaissance vocale');
                recognition.start();
              } else {
                console.warn('Reconnaissance vocale déjà active lors du redémarrage, état:', recognition.state);
              }
            } catch (error) {
              console.warn('Impossible de redémarrer la reconnaissance vocale:', error);
            }
            restartTimeout = null;
          }, 100);
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
      // Initialiser l'enregistrement et la reconnaissance vocale
      const recordingOk = await initializeRecording();
      if (!recordingOk) {
        // L'erreur est déjà définie dans initializeRecording/initializeStream
        return;
      }
      const recognitionOk = initializeSpeechRecognition();

      setExamStarted(true);
      setCurrentTaskIndex(0);
      setCurrentInteraction(0);
      setChatMessages([]);
      setCurrentPhase('objective');
      setUserConfirmed(false);

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
      }, 2000);
      
    } catch (error) {
      console.error('Erreur démarrage examen:', error);
      setError('Erreur lors du démarrage de l\'examen');
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
        const shouldTriggerScenario = (currentTaskIndex === 0 && finalRecordingTime >= 120) || 
                                     (currentTaskIndex === 2 && finalRecordingTime >= 270);
        
        if (shouldTriggerScenario) {
          // Ajouter la transcription disponible au chat (même si incomplète)
          if (transcript.trim()) {
            await addChatMessage('user', transcript.trim());
          } else {
            await addChatMessage('user', '[Enregistrement interrompu - temps dépassé]');
          }
          
          // Déclencher immédiatement le scénario de dépassement de temps
          const durationScenario = checkAudioDurationAndGetScenario(finalRecordingTime, currentTaskIndex);
          if (durationScenario && currentPhase === 'interview') {
            setTimeout(async () => {
              await addChatMessage('examiner', durationScenario.text, durationScenario.audioUrl, 'audio');
              setCanProceed(true);
              
              // Logique selon la tâche et le scénario
              if (currentTaskIndex === 0) {
                // Tâche 1: passer à la tâche suivante
                setTimeout(async () => {
                  await addChatMessage('system', 'Chargement de la tâche suivante...');
                  setWaitingForResponse(true);
                  
                  setTimeout(() => {
                    handleNextTask();
                    setWaitingForResponse(false);
                  }, 2000);
                }, 3000);
              } else if (currentTaskIndex === 2) {
                // Tâche 3: gérer les scénarios de fin
                if (durationScenario.shouldEndExam) {
                  setTimeout(() => {
                    handleExamEnd();
                  }, 3000);
                } else if (durationScenario.allowExtraTime && !extraTimeUsed) {
                  setIsExtraTimePhase(true);
                  setExtraTimeUsed(true);
                  setCanProceed(true);
                }
              }
            }, 1000);
          }
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
              const agentResponse = await task2AgentServiceRef.current.sendMessage(transcript.trim(), currentTask.objective);
              
              if (agentResponse && agentResponse.text) {
                // L'audio se déclenchera automatiquement si une URL audio est fournie
                await addChatMessage('examiner', agentResponse.text, agentResponse.audioUrl, 'audio');
              setTimeout(()=>{
                simulateMicrophoneClick();
              },100);
               
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
            
            // Après le trigger, démarrer automatiquement la phase de préparation
            setCurrentPhase('preparation');
            setIsPreparationPhase(true);
            setPreparationTime(0);
            addChatMessage('system', 'Phase de préparation démarrée (2 minutes). Préparez vos questions.');
          } else {
            // Logique pour les autres tâches
            setCurrentPhase('trigger');
            
            const triggerAudioUrl = audioUrls[`task_${currentTask.id}_trigger`];
            await addChatMessage('examiner', currentTask.trigger, triggerAudioUrl, 'audio');
            
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
          const agentResponse = await task2AgentServiceRef.current.sendMessage(userMessage, currentTask.objective);
          
          if (agentResponse && agentResponse.text) {
            // L'audio se déclenchera automatiquement si une URL audio est fournie
            await addChatMessage('examiner', agentResponse.text, agentResponse.audioUrl, 'audio');
             setCurrentPhase('conversation');
          }
        } else {
          // Pour les tâches 1 et 3, juste confirmer la réception
          await addChatMessage('system', 'Réponse enregistrée. Vous pouvez continuer ou passer à la tâche suivante.');
          
          // Appliquer les scénarios de durée même pour les messages texte
          // Estimer la durée basée sur la longueur du texte (approximativement 150 mots par minute)
          const wordCount = userMessage.split(' ').length;
          const estimatedDuration = (wordCount / 150) * 60; // en secondes
          
          const durationScenario = checkAudioDurationAndGetScenario(estimatedDuration, currentTaskIndex);
          if (durationScenario && currentPhase === 'interview') {
            setTimeout(async () => {
              await addChatMessage('examiner', durationScenario.text, durationScenario.audioUrl, 'audio');
              
              // Logique selon la tâche
              if (currentTaskIndex === 0) {
                // Tâche 1: passer à la tâche suivante
                setTimeout(async () => {
                  await addChatMessage('system', 'Chargement de la tâche suivante...');
                  setWaitingForResponse(true);
                  
                  setTimeout(() => {
                    handleNextTask();
                    setWaitingForResponse(false);
                  }, 4000);
                }, 4000);
              } else if (currentTaskIndex === 2) {
                // Tâche 3: gérer selon le scénario
                if (durationScenario.shouldEndExam) {
                  setTimeout(() => {
                    handleExamEnd();
                  }, 3000);
                } else if (durationScenario.allowExtraTime && !extraTimeUsed) {
                  // Marquer le temps supplémentaire comme utilisé et terminer l'examen après la réponse
                  setExtraTimeUsed(true);
                  setCanProceed(true);
                  setTimeout(() => {
                    addChatMessage('system', 'Merci pour votre réponse. L\'examen va se terminer.');
                    setTimeout(() => {
                      handleExamEnd();
                    }, 3000);
                  }, 3000);
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
        const agentResponse = await task2AgentServiceRef.current.sendMessage(userMessage, currentTask.objective);
        
        if (agentResponse && agentResponse.text) {
          // Utiliser l'audio fourni par l'agent ou générer un nouveau si nécessaire
          if (agentResponse.audioUrl) {
            await addChatMessage('examiner', agentResponse.text, agentResponse.audioUrl, 'audio');
          } else {
            // Générer l'audio si l'agent n'en fournit pas
            try {
              const audioResult = await synthesisService.synthesizeText(agentResponse.text);
              const audioUrl = audioResult && (audioResult.audioUrl || audioResult.filename) 
                ? audioResult.audioUrl || synthesisService.getAudioUrl(audioResult.filename)
                : null;
              
              await addChatMessage('examiner', agentResponse.text, audioUrl, 'audio');
            } catch (error) {
              console.warn('Erreur génération audio agent:', error);
              await addChatMessage('examiner', agentResponse.text);
            }
          }
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
      
      // Nettoyer les états
      const nextTaskIndex = currentTaskIndex + 1;
      setCurrentTaskIndex(nextTaskIndex);
      setCurrentInteraction(0);
      setCanProceed(false);
      setAudioEnded(false);
      setHasRecorded(false);
      setTranscript('');
      // Ne pas réinitialiser currentPhase ici pour éviter l'affichage temporaire d'"objective"
      setUserConfirmed(false);
      
      // Réinitialiser les états spécifiques à la tâche 2
      setPreparationTime(0);
      setConversationTime(0);
      setIsPreparationPhase(false);
      setIsConversationPhase(false);
      
      // Réinitialiser les états spécifiques à la tâche 3
      setIsExtraTimePhase(false);
      setExtraTimeUsed(false);
      
      // Nettoyer les timers
      if (preparationTimerRef.current) {
        clearInterval(preparationTimerRef.current);
      }
      if (conversationTimerRef.current) {
        clearInterval(conversationTimerRef.current);
      }
      setChatMessages([]);
      console.log(chatMessages);
      // Réinitialiser le chat pour la nouvelle tâche
      setChatMessages([]);
      
      // Réinitialiser l'agent pour la tâche 2
      if (currentTaskIndex === 0) {
        task2AgentServiceRef.current.resetSessionId();
      }
      
      // Jouer l'objectif de la nouvelle tâche immédiatement
      const nextTask = examData.tasks[nextTaskIndex];
      const objectiveAudioUrl = audioUrls[`task_${nextTask.id}_objective`];
      
      // Attendre que l'audio de l'objectif soit terminé
      await addChatMessage('examiner', `Objectif de la tâche ${nextTaskIndex + 1}: ${nextTask.objective}`, objectiveAudioUrl, 'audio');
      
      // Logique différente selon la tâche
      if (nextTaskIndex === 1) {
        // Pour la tâche 2, définir la phase objective puis passer à la préparation
       // setCurrentPhase('objective');
        setTimeout(() => {
          setCurrentPhase('preparation');
          setIsPreparationPhase(true);
          setPreparationTime(0);
          addChatMessage('system', 'Phase de préparation démarrée (2 minutes). Préparez vos questions.');
        }, 3000); // Attendre que l'audio de l'objectif se termine
      } else {
        // Pour les autres tâches, définir la phase objective puis passer en attente de confirmation
        setCurrentPhase('objective');
        setTimeout(() => {
          setCurrentPhase('waiting_confirmation');
          addChatMessage('system', 'Êtes-vous prêt(e) à commencer cette nouvelle tâche ? Répondez "oui" pour continuer.');
        }, 3000); // Attendre que l'audio de l'objectif se termine
      }
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
    navigate(`/tcf-simulator/oral/results/${subjectId}`);
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
        <DashboardNavbar />
        <MDBox p={3}>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
            <Box textAlign="center">
              <LinearProgress sx={{ width: 300, mb: 2 }} />
              <Typography>Chargement de l'examen...</Typography>
            </Box>
          </Box>
        </MDBox>
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
          <MDButton variant="contained" onClick={() => navigate('/tcf-simulator')}>
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
              >
                Commencer l'examen
              </MDButton>
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
                onClick={() => navigate('/tcf-simulator')}
              >
                Retour au simulateur
              </MDButton>
              <MDButton 
                variant="outlined" 
                color="secondary"
                onClick={() => navigate('/dashboard')}
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
              {/* Affichage de la phase actuelle */}
              {currentPhase && (
                <Chip 
                  label={currentPhase === 'objective' ? 'Présentation de l\'objectif' :
                         currentPhase === 'waiting_confirmation' ? 'En attente de confirmation' :
                         currentPhase === 'trigger' ? 'Déclenchement de la tâche' :
                         currentPhase === 'interview' ? 'Entretien en cours' :
                         currentPhase === 'preparation' ? 'Préparation (2 min)' :
                         currentPhase === 'conversation' ? 'Conversation (3m30)' :
                         'Phase inconnue'}
                  color={
                    currentPhase === 'objective' ? 'info' :
                    currentPhase === 'waiting_confirmation' ? 'warning' :
                    currentPhase === 'trigger' ? 'secondary' :
                    currentPhase === 'interview' ? 'success' :
                    currentPhase === 'preparation' ? 'warning' :
                    currentPhase === 'conversation' ? 'success' :
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
                  <strong>Êtes-vous prêt(e) à commencer cette tâche ?</strong><br/>
                  Appuie sur le micro en bas et réponds "oui", "je suis prêt" ou "je suis prête" pour confirmer et commencer l'entretien.
                </Typography>
              </Alert>
            )}

            {/* Image si présente */}
            {currentTask.imageUrl && (
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
                  color="primary"
                  onClick={handleNextInteraction}
                  startIcon={currentInteraction < currentTask.interactions.length - 1 ? 
                    <PlayArrow /> : 
                    currentTaskIndex < examData.tasks.length - 1 ? 
                      <PlayArrow /> : <CheckCircle />}
                >
                  {currentInteraction < currentTask.interactions.length - 1 ? 
                    "Continuer" : 
                    currentTaskIndex < examData.tasks.length - 1 ? 
                      "Tâche suivante" : "Terminer l'examen"}
                </Button>
              )}
              
              {/* Bouton d'urgence */}
              <Button
                variant="outlined"
                color="warning"
                startIcon={<Warning />}
                onClick={handleExamEnd}
              >
                Terminer l'examen
              </Button>
            </Box>
          </Paper>

          {/* Chat des échanges */}
          {renderChatInterface()}
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
      </MDBox>
    </DashboardLayout>
  );
};

export default TCFOralExam;