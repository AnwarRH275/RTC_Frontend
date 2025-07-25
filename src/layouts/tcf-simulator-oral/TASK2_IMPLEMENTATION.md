# Implémentation de la Tâche 2 - TCF Oral Simulator

## Vue d'ensemble

La Tâche 2 du simulateur TCF Oral a été implémentée avec une structure en phases pour respecter le format officiel de l'examen :

1. **Phase d'objectif** : Présentation de la situation
2. **Phase de confirmation** : Attente de la confirmation de l'utilisateur
3. **Phase de trigger** : Lecture de la consigne détaillée
4. **Phase de préparation** : 2 minutes pour préparer les questions
5. **Phase de conversation** : 3 minutes 30 secondes d'échange oral

## Fonctionnalités implémentées

### 1. Timer de préparation (2 minutes)
- Décompte automatique de 120 secondes
- Affichage visuel du temps écoulé
- Transition automatique vers la phase de conversation

### 2. Timer de conversation (3m30)
- Décompte automatique de 210 secondes
- Affichage visuel du temps écoulé
- Fin automatique de la tâche à l'expiration

### 3. Interface utilisateur
- Chips colorés pour indiquer la phase actuelle
- Timers visuels pour les phases de préparation et conversation
- Messages système pour guider l'utilisateur

### 4. Intégration avec l'agent IA
- Utilisation du service `task2AgentService.js`
- Gestion des réponses texte et audio de l'agent
- Sauvegarde des interactions dans localStorage

## Structure du code

### États ajoutés
```javascript
// États spécifiques à la tâche 2
const [preparationTime, setPreparationTime] = useState(0);
const [conversationTime, setConversationTime] = useState(0);
const [isPreparationPhase, setIsPreparationPhase] = useState(false);
const [isConversationPhase, setIsConversationPhase] = useState(false);
const preparationTimerRef = useRef(null);
const conversationTimerRef = useRef(null);
```

### Fonctions principales

#### `handlePreparationEnd()`
- Arrête le timer de préparation
- Joue le message de transition
- Démarre la phase de conversation

#### `handleConversationEnd()`
- Arrête le timer de conversation
- Joue le message de fin
- Passe à la tâche suivante ou termine l'examen

### Timers useEffect
- Timer de préparation : Incrémente chaque seconde jusqu'à 120s
- Timer de conversation : Incrémente chaque seconde jusqu'à 210s
- Nettoyage automatique des intervalles

## Flux de la Tâche 2

1. **Objectif** → L'utilisateur entend la présentation de la tâche
2. **Confirmation** → L'utilisateur confirme qu'il est prêt
3. **Trigger** → Lecture de la consigne détaillée avec la situation
4. **Préparation** → 2 minutes pour préparer les questions (timer visible)
5. **Transition** → Message automatique "C'est bon, les 2 minutes sont écoulées..."
6. **Conversation** → 3m30 d'échange avec l'agent IA (timer visible)
7. **Fin** → Transition automatique vers la tâche suivante

## Messages système

- **Début préparation** : "Phase de préparation démarrée (2 minutes). Préparez vos questions."
- **Transition** : "C'est bon, les 2 minutes sont écoulées. Nous pouvons commencer. À vous d'initier la conversation."
- **Début conversation** : "Phase de conversation démarrée (3 minutes 30 secondes). À vous d'initier la conversation."
- **Fin conversation** : "Le temps de conversation est écoulé. Merci pour cet échange."

## Intégration avec task2AgentService

Le service `task2AgentService.js` gère :
- La communication avec l'agent IA backend
- La gestion des sessions utilisateur
- Le retour des réponses texte et audio
- La gestion des erreurs de communication

## Sauvegarde des données

Toutes les interactions sont sauvegardées dans localStorage avec :
- Messages utilisateur avec timestamp
- Temps de conversation pour chaque message
- Session ID pour traçabilité
- Phase de l'examen

## Nettoyage et réinitialisation

À la fin de la tâche 2 :
- Tous les timers sont nettoyés
- Les états sont réinitialisés
- La session de l'agent est réinitialisée
- Transition vers la tâche suivante ou fin d'examen