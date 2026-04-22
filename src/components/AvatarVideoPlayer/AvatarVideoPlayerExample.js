import React, { useState } from 'react';
import AvatarVideoPlayer from './AvatarVideoPlayer';
import { Card, CardContent, Typography, Box, Alert } from '@mui/material';
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';

/**
 * Exemple d'utilisation du composant AvatarVideoPlayer
 * Ce composant démontre comment intégrer le lecteur avatar dans une interface
 */
const AvatarVideoPlayerExample = () => {
  const [lastEvent, setLastEvent] = useState('');
  const [eventHistory, setEventHistory] = useState([]);

  // Gestionnaire pour la fin de l'audio
  const handleAudioEnd = () => {
    const event = `Audio terminé à ${new Date().toLocaleTimeString()}`;
    setLastEvent(event);
    setEventHistory(prev => [...prev, event]);
    // console.log('Audio playback ended');
  };

  // Gestionnaire d'erreurs
  const handleError = (error) => {
    const event = `Erreur: ${error.message || 'Erreur inconnue'} à ${new Date().toLocaleTimeString()}`;
    setLastEvent(event);
    setEventHistory(prev => [...prev, event]);
    console.error('AvatarVideoPlayer error:', error);
  };

  return (
    <MDBox p={3}>
      <MDTypography variant="h4" mb={3} textAlign="center">
        Démonstration du Lecteur Avatar
      </MDTypography>
      
      {/* Composant AvatarVideoPlayer */}
      <Box mb={4}>
        <AvatarVideoPlayer
          onAudioEnd={handleAudioEnd}
          onError={handleError}
          autoPlay={false}
        />
      </Box>

      {/* Informations sur les événements */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Dernier événement
          </Typography>
          <Alert severity={lastEvent.includes('Erreur') ? 'error' : 'info'}>
            {lastEvent || 'Aucun événement encore'}
          </Alert>
        </CardContent>
      </Card>

      {/* Historique des événements */}
      {eventHistory.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Historique des événements
            </Typography>
            <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
              {eventHistory.map((event, index) => (
                <Typography 
                  key={index} 
                  variant="body2" 
                  sx={{ 
                    mb: 1, 
                    p: 1, 
                    backgroundColor: index % 2 === 0 ? '#f5f5f5' : 'transparent',
                    borderRadius: 1
                  }}
                >
                  {index + 1}. {event}
                </Typography>
              ))}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Instructions d'utilisation */}
      <Card sx={{ mt: 3, backgroundColor: '#f8f9fa' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom color="primary">
            Instructions d'utilisation
          </Typography>
          <Typography variant="body2" paragraph>
            • Cliquez sur le bouton de lecture pour démarrer la synchronisation audio-vidéo
          </Typography>
          <Typography variant="body2" paragraph>
            • La vidéo de l'avatar se met en boucle pendant la lecture de l'audio
          </Typography>
          <Typography variant="body2" paragraph>
            • L'audio est chargé automatiquement depuis le backend simulé
          </Typography>
          <Typography variant="body2" paragraph>
            • Utilisez le bouton de volume pour activer/désactiver le son
          </Typography>
          <Typography variant="body2">
            • Les événements de fin de lecture et d'erreur sont capturés et affichés
          </Typography>
        </CardContent>
      </Card>
    </MDBox>
  );
};

export default AvatarVideoPlayerExample;