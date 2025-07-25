# AvatarVideoPlayer Component

Composant React pour afficher une vidéo d'avatar en boucle synchronisée avec un fichier audio récupéré depuis un backend.

## Fonctionnalités

- ✅ **Synchronisation audio-vidéo** : La vidéo se met en boucle pendant la lecture de l'audio
- ✅ **Chargement depuis backend** : Récupération automatique de l'audio depuis le serveur
- ✅ **Gestion d'erreurs** : Capture et gestion des erreurs de chargement/lecture
- ✅ **Détection de fin** : Événement déclenché à la fin de la lecture audio
- ✅ **Interface moderne** : Design avec gradients et animations
- ✅ **Contrôles intuitifs** : Boutons de lecture/pause et contrôle du volume
- ✅ **État de chargement** : Indicateurs visuels pour le chargement
- ✅ **Responsive** : S'adapte aux différentes tailles d'écran

## Installation

```bash
# Le composant utilise les dépendances suivantes :
npm install @mui/material @mui/icons-material styled-components
```

## Utilisation de base

```jsx
import AvatarVideoPlayer from 'components/AvatarVideoPlayer';

function MyComponent() {
  const handleAudioEnd = () => {
    console.log('Audio terminé!');
  };

  const handleError = (error) => {
    console.error('Erreur:', error);
  };

  return (
    <AvatarVideoPlayer
      onAudioEnd={handleAudioEnd}
      onError={handleError}
      autoPlay={false}
    />
  );
}
```

## Props

| Prop | Type | Défaut | Description |
|------|------|--------|-------------|
| `videoUrl` | string | URL par défaut | URL de la vidéo avatar |
| `onAudioEnd` | function | `() => {}` | Callback appelé à la fin de l'audio |
| `onError` | function | `() => {}` | Callback appelé en cas d'erreur |
| `autoPlay` | boolean | `false` | Démarrage automatique de la lecture |

## États du composant

- **Prêt à jouer** : Audio et vidéo chargés avec succès
- **Chargement de l'audio** : Récupération en cours depuis le backend
- **Lecture en cours** : Audio et vidéo en cours de lecture
- **En pause** : Lecture mise en pause
- **Lecture terminée** : Audio terminé, vidéo arrêtée
- **Erreur** : Problème de chargement ou de lecture

## Simulation du backend

Le composant inclut une fonction de simulation du backend pour les tests :

```javascript
const simulateBackendAudioFetch = async () => {
  // Simulation d'un délai de chargement
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    success: true,
    audioUrl: 'URL_AUDIO',
    duration: 10000
  };
};
```

## Intégration avec un vrai backend

Pour utiliser un vrai backend, modifiez la fonction `simulateBackendAudioFetch` :

```javascript
const fetchAudioFromBackend = async () => {
  try {
    const response = await fetch('/api/audio/current');
    const data = await response.json();
    
    return {
      success: true,
      audioUrl: data.audioUrl,
      duration: data.duration
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};
```

## Événements gérés

### Vidéo
- `onLoadedData` : Vidéo chargée et prête
- `onError` : Erreur de chargement vidéo

### Audio
- `onLoadedData` : Audio chargé et prêt
- `onEnded` : Fin de lecture audio
- `onError` : Erreur de chargement audio

## Personnalisation du style

Le composant utilise `styled-components` pour le styling. Vous pouvez personnaliser :

- Couleurs des gradients
- Tailles et espacements
- Effets d'animation
- Bordures et ombres

## Exemple complet

Voir `AvatarVideoPlayerExample.js` pour un exemple d'intégration complète avec gestion des événements et interface utilisateur.

## Compatibilité

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 11+
- ✅ Edge 79+

## Notes techniques

- La vidéo est en mode `muted` pour éviter les conflits avec l'audio
- L'audio et la vidéo sont synchronisés via `Promise.all()`
- Le composant gère automatiquement les états de chargement
- Les erreurs sont capturées et remontées via les callbacks

## Dépannage

### La vidéo ne se charge pas
- Vérifiez que l'URL de la vidéo est accessible
- Assurez-vous que le format vidéo est supporté (MP4 recommandé)

### L'audio ne se charge pas
- Vérifiez la fonction de récupération backend
- Assurez-vous que l'URL audio est valide
- Vérifiez les CORS si l'audio vient d'un autre domaine

### Problèmes de synchronisation
- Les navigateurs peuvent avoir des politiques d'autoplay strictes
- L'utilisateur doit interagir avec la page avant la lecture automatique