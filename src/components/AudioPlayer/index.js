import React, { useState, useRef, useEffect } from 'react';
import { Box, IconButton, Slider, Typography, Paper } from '@mui/material';
import {
  PlayArrow,
  Pause,
  VolumeUp,
  VolumeDown,
  VolumeOff,
  Replay10,
  Forward10
} from '@mui/icons-material';
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';

const AudioPlayer = React.forwardRef(({
  audioUrl,
  title = "Audio du coaching",
  autoPlay = false,
  onEnded = null,
  showTitle = true,
  compact = false
}, ref) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [canAutoplay, setCanAutoplay] = useState(false);
  const [hasTriedAutoplay, setHasTriedAutoplay] = useState(false);

  // Gestion des événements audio
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
      // console.log('Audio metadata loaded, duration:', audio.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      if (onEnded) {
        onEnded();
      }
    };

    const handleError = (e) => {
      console.error('Audio error:', e);
      setError('Erreur lors du chargement de l\'audio');
      setIsLoading(false);
    };

    const handleCanPlay = () => {
      setIsLoading(false);
      // console.log('Audio can play');
      
      // Tenter l'autoplay dès que l'audio est prêt
      if (autoPlay && !hasTriedAutoplay) {
        setHasTriedAutoplay(true);
        attemptAutoplay();
      }
    };

    const handlePlay = () => {
      setIsPlaying(true);
      setCanAutoplay(true);
      // console.log('Audio started playing');
    };

    const handlePause = () => {
      setIsPlaying(false);
      // console.log('Audio paused');
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, [audioUrl, onEnded, autoPlay, hasTriedAutoplay]);

  // Fonction pour tenter l'autoplay
  const attemptAutoplay = async () => {
    if (!audioRef.current || !autoPlay) return;

    try {
      // console.log('Attempting autoplay for:', audioUrl);
      
      // Configuration optimale pour l'autoplay
      audioRef.current.currentTime = 0;
      audioRef.current.volume = 1.0;
      audioRef.current.muted = false;
      
      // Tenter la lecture
      await audioRef.current.play();
      setCanAutoplay(true);
      // console.log('Autoplay successful');
      
    } catch (error) {
      console.warn('Autoplay blocked:', error.name);
      setCanAutoplay(false);
      
      // Essayer avec le son coupé si l'autoplay est bloqué
      if (error.name === 'NotAllowedError') {
        try {
          audioRef.current.muted = true;
          await audioRef.current.play();
          
          // Réactiver le son après un court délai
          setTimeout(() => {
            if (audioRef.current) {
              audioRef.current.muted = false;
              setCanAutoplay(true);
            }
          }, 100);
          
        } catch (mutedError) {
          console.warn('Even muted autoplay failed:', mutedError);
          setCanAutoplay(false);
        }
      }
    }
  };

  // Réinitialiser l'état quand l'URL change
  useEffect(() => {
    setHasTriedAutoplay(false);
    setCanAutoplay(false);
    setIsPlaying(false);
    setCurrentTime(0);
    setIsLoading(true);
    setError(null);
  }, [audioUrl]);

  const handlePlayPause = async () => {
    if (!audioRef.current) return;

    try {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.currentTime = currentTime;
        await audioRef.current.play();
      }
    } catch (error) {
      console.error('Error playing/pausing audio:', error);
      setError('Erreur lors de la lecture audio');
    }
  };

  const handleSeek = (event, newValue) => {
    if (audioRef.current) {
      audioRef.current.currentTime = newValue;
      setCurrentTime(newValue);
    }
  };

  const handleVolumeChange = (event, newValue) => {
    if (audioRef.current) {
      audioRef.current.volume = newValue;
      setVolume(newValue);
    }
  };

  const handleRewind = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 10);
    }
  };

  const handleForward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(duration, audioRef.current.currentTime + 10);
    }
  };

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getVolumeIcon = () => {
    if (volume === 0) return <VolumeOff />;
    if (volume < 0.5) return <VolumeDown />;
    return <VolumeUp />;
  };

  if (error) {
    return (
      <Paper
        elevation={2}
        sx={{
          p: 2,
          borderRadius: 2,
          bgcolor: 'error.light',
          color: 'error.contrastText'
        }}
      >
        <MDTypography variant="body2">{error}</MDTypography>
      </Paper>
    );
  }

  return (
    <Paper
      elevation={3}
      sx={{
        p: compact ? 2 : 3,
        borderRadius: 3,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Overlay pour l'activation manuelle si autoplay échoue */}
      {autoPlay && !canAutoplay && !isPlaying && !isLoading && (
        <MDBox
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          display="flex"
          alignItems="center"
          justifyContent="center"
          zIndex={10}
          sx={{
            backgroundColor: 'rgba(0,0,0,0.7)',
            borderRadius: 3,
            cursor: 'pointer'
          }}
          onClick={handlePlayPause}
        >
          <MDBox
            display="flex"
            flexDirection="column"
            alignItems="center"
            p={3}
            sx={{
              backgroundColor: 'rgba(255,255,255,0.15)',
              borderRadius: 2,
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)'
            }}
          >
            <PlayArrow sx={{ fontSize: 60, color: 'white', mb: 1 }} />
            <MDTypography color="white" variant="button" fontWeight="bold" textAlign="center">
              Cliquez pour écouter l'audio
            </MDTypography>
          </MDBox>
        </MDBox>
      )}

      <audio
        ref={audioRef}
        src={audioUrl}
        preload="auto"
        playsInline
        crossOrigin="anonymous"
      />

      {/* Effet de fond animé */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `linear-gradient(45deg,
            rgba(255,255,255,0.1) 0%,
            rgba(255,255,255,0.05) 50%,
            rgba(255,255,255,0.1) 100%)`,
          animation: isPlaying ? 'pulse 2s ease-in-out infinite' : 'none',
          '@keyframes pulse': {
            '0%': { opacity: 0.3 },
            '50%': { opacity: 0.6 },
            '100%': { opacity: 0.3 }
          }
        }}
      />

      <MDBox position="relative" zIndex={1}>
        {showTitle && (
          <MDTypography
            variant={compact ? "body1" : "h6"}
            fontWeight="bold"
            mb={compact ? 1 : 2}
            sx={{ color: 'white' }}
          >
            🎧 {title}
          </MDTypography>
        )}

        {/* Contrôles principaux */}
        <MDBox display="flex" alignItems="center" gap={1} mb={2}>
          <IconButton
            onClick={handleRewind}
            sx={{ color: 'white' }}
            disabled={isLoading}
          >
            <Replay10 />
          </IconButton>

          <IconButton
            onClick={handlePlayPause}
            sx={{
              color: 'white',
              bgcolor: 'rgba(255,255,255,0.2)',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
              mx: 1
            }}
            disabled={isLoading}
          >
            {isLoading ? (
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  '@keyframes spin': {
                    '0%': { transform: 'rotate(0deg)' },
                    '100%': { transform: 'rotate(360deg)' }
                  }
                }}
              />
            ) : isPlaying ? (
              <Pause />
            ) : (
              <PlayArrow />
            )}
          </IconButton>

          <IconButton
            onClick={handleForward}
            sx={{ color: 'white' }}
            disabled={isLoading}
          >
            <Forward10 />
          </IconButton>
        </MDBox>

        {/* Barre de progression */}
        <MDBox mb={compact ? 1 : 2}>
          <Slider
            value={currentTime}
            max={duration || 100}
            onChange={handleSeek}
            disabled={isLoading}
            sx={{
              color: 'white',
              '& .MuiSlider-thumb': {
                bgcolor: 'white',
                '&:hover': { boxShadow: '0 0 0 8px rgba(255,255,255,0.16)' }
              },
              '& .MuiSlider-track': { bgcolor: 'white' },
              '& .MuiSlider-rail': { bgcolor: 'rgba(255,255,255,0.3)' }
            }}
          />

          <MDBox display="flex" justifyContent="space-between" mt={0.5}>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
              {formatTime(currentTime)}
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
              {formatTime(duration)}
            </Typography>
          </MDBox>
        </MDBox>

        {/* Contrôle du volume */}
        {!compact && (
          <MDBox display="flex" alignItems="center" gap={1}>
            <IconButton size="small" sx={{ color: 'white' }}>
              {getVolumeIcon()}
            </IconButton>
            <Slider
              value={volume}
              min={0}
              max={1}
              step={0.1}
              onChange={handleVolumeChange}
              sx={{
                width: 80,
                color: 'white',
                '& .MuiSlider-thumb': {
                  bgcolor: 'white',
                  width: 16,
                  height: 16
                },
                '& .MuiSlider-track': { bgcolor: 'white' },
                '& .MuiSlider-rail': { bgcolor: 'rgba(255,255,255,0.3)' }
              }}
            />
          </MDBox>
        )}
      </MDBox>
    </Paper>
  );
});

AudioPlayer.displayName = 'AudioPlayer';

export default AudioPlayer;