import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';

// Styled Components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  max-width: 600px;
  margin: 20px auto;
`;

const VideoContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 400px;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
  margin-bottom: 20px;
`;

const Video = styled.video`
  width: 100%;
  height: auto;
  display: block;
  border-radius: 15px;
`;

const Controls = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  width: 100%;
`;

const PlayButton = styled.button`
  background: linear-gradient(45deg, #ff6b6b, #ee5a24);
  border: none;
  border-radius: 50px;
  padding: 15px 30px;
  color: white;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(255, 107, 107, 0.4);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const StatusText = styled.p`
  color: white;
  font-size: 14px;
  margin: 0;
  text-align: center;
  opacity: 0.9;
`;

const LoadingSpinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid #ffffff;
  border-top: 2px solid transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const PlayIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z"/>
  </svg>
);

const PauseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
  </svg>
);

// URLs publiques pour les médias de démonstration
const DEFAULT_VIDEO_URL = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
const DEFAULT_AUDIO_URL = 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav';

const AvatarVideoPlayer = ({ 
  videoUrl = DEFAULT_VIDEO_URL, 
  audioUrl = DEFAULT_AUDIO_URL,
  onAudioEnd = () => {},
  onError = () => {}
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [audioLoaded, setAudioLoaded] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  
  const videoRef = useRef(null);
  const audioRef = useRef(null);

  // Gestion du chargement de l'audio
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleAudioLoad = () => {
      setAudioLoaded(true);
      setIsLoading(false);
    };

    const handleAudioError = (e) => {
      setError('Erreur lors du chargement de l\'audio');
      setIsLoading(false);
      onError(e);
    };

    const handleAudioEnd = () => {
      setIsPlaying(false);
      if (videoRef.current) {
        videoRef.current.pause();
      }
      onAudioEnd();
    };

    audio.addEventListener('canplaythrough', handleAudioLoad);
    audio.addEventListener('error', handleAudioError);
    audio.addEventListener('ended', handleAudioEnd);

    return () => {
      audio.removeEventListener('canplaythrough', handleAudioLoad);
      audio.removeEventListener('error', handleAudioError);
      audio.removeEventListener('ended', handleAudioEnd);
    };
  }, [audioUrl, onAudioEnd, onError]);

  // Gestion du chargement de la vidéo
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleVideoLoad = () => {
      setVideoLoaded(true);
    };

    const handleVideoError = (e) => {
      setError('Erreur lors du chargement de la vidéo');
      onError(e);
    };

    video.addEventListener('canplaythrough', handleVideoLoad);
    video.addEventListener('error', handleVideoError);

    return () => {
      video.removeEventListener('canplaythrough', handleVideoLoad);
      video.removeEventListener('error', handleVideoError);
    };
  }, [videoUrl, onError]);

  // Fonction pour démarrer/arrêter la lecture
  const togglePlayback = async () => {
    if (!audioLoaded || !videoLoaded) {
      setError('Les médias ne sont pas encore chargés');
      return;
    }

    try {
      if (isPlaying) {
        // Arrêter la lecture
        audioRef.current?.pause();
        videoRef.current?.pause();
        setIsPlaying(false);
      } else {
        // Démarrer la lecture
        setIsLoading(true);
        setError(null);
        
        // Synchroniser le démarrage
        const videoPromise = videoRef.current?.play();
        const audioPromise = audioRef.current?.play();
        
        await Promise.all([videoPromise, audioPromise]);
        
        setIsPlaying(true);
        setIsLoading(false);
      }
    } catch (err) {
      setError('Erreur lors de la lecture');
      setIsLoading(false);
      onError(err);
    }
  };

  // Fonction pour simuler la récupération depuis le backend
  const fetchMediaFromBackend = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulation d'un appel API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Ici vous pourriez faire un vrai appel API:
      // const response = await fetch('/api/avatar-media');
      // const data = await response.json();
      
      setIsLoading(false);
    } catch (err) {
      setError('Erreur lors de la récupération des médias');
      setIsLoading(false);
      onError(err);
    }
  };

  const getStatusText = () => {
    if (error) return error;
    if (isLoading) return 'Chargement en cours...';
    if (!audioLoaded || !videoLoaded) return 'Chargement des médias...';
    if (isPlaying) return 'Lecture en cours';
    return 'Prêt à jouer';
  };

  const getButtonText = () => {
    if (isLoading) return 'Chargement...';
    return isPlaying ? 'Pause' : 'Jouer';
  };

  return (
    <Container>
      <VideoContainer>
        <Video
          ref={videoRef}
          src={videoUrl}
          loop
          muted
          playsInline
          preload="auto"
        />
      </VideoContainer>
      
      <Controls>
        <PlayButton 
          onClick={togglePlayback}
          disabled={isLoading || (!audioLoaded || !videoLoaded)}
        >
          {isLoading ? (
            <LoadingSpinner />
          ) : isPlaying ? (
            <PauseIcon />
          ) : (
            <PlayIcon />
          )}
          {getButtonText()}
        </PlayButton>
        
        <StatusText>{getStatusText()}</StatusText>
        
        <PlayButton onClick={fetchMediaFromBackend}>
          Charger nouveaux médias
        </PlayButton>
      </Controls>
      
      {/* Audio caché */}
      <audio
        ref={audioRef}
        src={audioUrl}
        preload="auto"
        style={{ display: 'none' }}
      />
    </Container>
  );
};

export default AvatarVideoPlayer;

// Exemple d'utilisation:
// <AvatarVideoPlayer 
//   videoUrl="https://example.com/avatar.mp4"
//   audioUrl="https://example.com/speech.mp3"
//   onAudioEnd={() => console.log('Audio terminé')}
//   onError={(error) => console.error('Erreur:', error)}
// />