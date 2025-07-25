import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { CircularProgress, IconButton } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';

// Styled Components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  max-width: 500px;
  margin: 0 auto;
`;

const VideoContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 400px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  margin-bottom: 20px;
`;

const Video = styled.video`
  width: 100%;
  height: auto;
  display: block;
  border-radius: 12px;
`;

const Controls = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 15px 25px;
  border-radius: 50px;
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const PlayButton = styled(IconButton)`
  && {
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    color: white;
    width: 60px;
    height: 60px;
    box-shadow: 0 4px 15px rgba(79, 172, 254, 0.4);
    transition: all 0.3s ease;
    
    &:hover {
      transform: scale(1.05);
      box-shadow: 0 6px 20px rgba(79, 172, 254, 0.6);
    }
    
    &:disabled {
      background: rgba(255, 255, 255, 0.3);
      color: rgba(255, 255, 255, 0.5);
    }
  }
`;

const StatusText = styled.div`
  color: white;
  font-size: 14px;
  font-weight: 500;
  text-align: center;
  margin: 0 10px;
  min-width: 100px;
`;

const LoadingSpinner = styled(CircularProgress)`
  && {
    color: white;
  }
`;

const VolumeButton = styled(IconButton)`
  && {
    color: white;
    transition: all 0.3s ease;
    
    &:hover {
      transform: scale(1.1);
      color: #4facfe;
    }
  }
`;

// URLs publiques pour les tests
const DEFAULT_VIDEO_URL = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
const DEFAULT_AUDIO_URL = 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav';

// Simulation du backend
const simulateBackendAudioFetch = async () => {
  // Simulation d'un délai de chargement
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Simulation d'une réponse du backend
  return {
    success: true,
    audioUrl: DEFAULT_AUDIO_URL,
    duration: 10000 // 10 secondes
  };
};

const AvatarVideoPlayer = ({ 
  videoUrl = DEFAULT_VIDEO_URL,
  onAudioEnd = () => {},
  onError = () => {},
  autoPlay = false 
}) => {
  // États du composant
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [audioLoaded, setAudioLoaded] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [status, setStatus] = useState('Prêt à jouer');
  
  // Références pour les éléments média
  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const audioUrlRef = useRef(null);

  // Chargement de l'audio depuis le backend
  const loadAudioFromBackend = async () => {
    try {
      setIsLoading(true);
      setStatus('Chargement de l\'audio...');
      setError(null);
      
      const response = await simulateBackendAudioFetch();
      
      if (response.success) {
        audioUrlRef.current = response.audioUrl;
        
        // Créer l'élément audio
        if (audioRef.current) {
          audioRef.current.src = response.audioUrl;
          audioRef.current.load();
        }
        
        setStatus('Audio chargé avec succès');
      } else {
        throw new Error('Échec du chargement audio');
      }
    } catch (err) {
      setError('Erreur lors du chargement de l\'audio');
      setStatus('Erreur de chargement');
      onError(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Gestion de la lecture synchronisée
  const handlePlay = async () => {
    if (!audioUrlRef.current) {
      await loadAudioFromBackend();
    }
    
    if (audioRef.current && videoRef.current && audioLoaded && videoLoaded) {
      try {
        setIsPlaying(true);
        setStatus('Lecture en cours...');
        
        // Synchroniser le démarrage
        await Promise.all([
          videoRef.current.play(),
          audioRef.current.play()
        ]);
        
      } catch (err) {
        setError('Erreur lors de la lecture');
        setIsPlaying(false);
        setStatus('Erreur de lecture');
        onError(err);
      }
    }
  };

  const handlePause = () => {
    if (audioRef.current && videoRef.current) {
      audioRef.current.pause();
      videoRef.current.pause();
      setIsPlaying(false);
      setStatus('En pause');
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // Gestionnaires d'événements pour la vidéo
  const handleVideoLoaded = () => {
    setVideoLoaded(true);
    if (audioLoaded) {
      setStatus('Prêt à jouer');
    }
  };

  const handleVideoError = (e) => {
    setError('Erreur lors du chargement de la vidéo');
    setStatus('Erreur vidéo');
    onError(e);
  };

  // Gestionnaires d'événements pour l'audio
  const handleAudioLoaded = () => {
    setAudioLoaded(true);
    if (videoLoaded) {
      setStatus('Prêt à jouer');
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setStatus('Lecture terminée');
    
    // Arrêter la vidéo quand l'audio se termine
    if (videoRef.current) {
      videoRef.current.pause();
    }
    
    onAudioEnd();
  };

  const handleAudioError = (e) => {
    setError('Erreur lors du chargement de l\'audio');
    setStatus('Erreur audio');
    setAudioLoaded(false);
    onError(e);
  };

  // Effet pour l'auto-play
  useEffect(() => {
    if (autoPlay && audioLoaded && videoLoaded && !isPlaying) {
      handlePlay();
    }
  }, [autoPlay, audioLoaded, videoLoaded]);

  // Effet pour charger l'audio au montage
  useEffect(() => {
    loadAudioFromBackend();
  }, []);

  return (
    <Container>
      {/* Vidéo de l'avatar */}
      <VideoContainer>
        <Video
          ref={videoRef}
          src={videoUrl}
          loop
          muted
          playsInline
          onLoadedData={handleVideoLoaded}
          onError={handleVideoError}
          poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='100%25' height='100%25' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' font-size='18' text-anchor='middle' dy='.3em' fill='%23999'%3EAvatar Video%3C/text%3E%3C/svg%3E"
        />
      </VideoContainer>

      {/* Élément audio caché */}
      <audio
        ref={audioRef}
        onLoadedData={handleAudioLoaded}
        onEnded={handleAudioEnded}
        onError={handleAudioError}
        muted={isMuted}
        style={{ display: 'none' }}
      />

      {/* Contrôles */}
      <Controls>
        <PlayButton
          onClick={isPlaying ? handlePause : handlePlay}
          disabled={isLoading || !audioLoaded || !videoLoaded || error}
        >
          {isLoading ? (
            <LoadingSpinner size={24} />
          ) : isPlaying ? (
            <PauseIcon />
          ) : (
            <PlayArrowIcon />
          )}
        </PlayButton>
        
        <StatusText>
          {error || status}
        </StatusText>
        
        <VolumeButton onClick={toggleMute} disabled={!audioLoaded}>
          {isMuted ? <VolumeOffIcon /> : <VolumeUpIcon />}
        </VolumeButton>
      </Controls>
    </Container>
  );
};

export default AvatarVideoPlayer;