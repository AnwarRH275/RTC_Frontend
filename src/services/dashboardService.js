import axios from 'axios';
import authService from './authService';
import { API_BASE_URL } from './config';

const API_URL = API_BASE_URL;

// Service pour récupérer les statistiques du dashboard
export const getDashboardStats = async () => {
  try {
    const response = await axios.get(`${API_URL}/dashboard/stats`, authService.getAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    throw error;
  }
};

// Service pour récupérer les données complètes du dashboard avec calculs
export const getCompleteDashboardData = async () => {
  try {
    const [userInfo, stats, recentActivity, monthlyData, userExams] = await Promise.all([
      getUserInfo(),
      getDashboardStats(),
      getRecentActivity(),
      getMonthlyChartData(),
      getUserExams()
    ]);
    
    // Calculer les statistiques supplémentaires basées sur les examens réels
    const enhancedStats = {
      ...stats,
      // Ajouter les calculs basés sur les examens réels
      totalExams: userExams?.length || stats.total_exams || 0,
      averageScore: calculateAverageScore(userExams),
      bestScore: calculateBestScore(userExams),
      weeklyExams: calculateWeeklyExams(userExams),
      monthlyProgress: calculateMonthlyProgress(userExams),
      studyStreak: calculateStudyStreak(userExams),
      remainingCredits: userInfo?.sold || 0,
      totalCredits: userInfo?.total_sold || 0
    };
    
    return {
      userInfo,
      stats: enhancedStats,
      recentActivity,
      monthlyData,
      userExams
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des données complètes:', error);
    throw error;
  }
};

// Service pour récupérer les données du graphique mensuel
export const getMonthlyChartData = async () => {
  try {
    const response = await axios.get(`${API_URL}/dashboard/chart/monthly`, authService.getAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des données du graphique:', error);
    throw error;
  }
};

// Service pour récupérer l'activité récente
export const getRecentActivity = async () => {
  try {
    const response = await axios.get(`${API_URL}/dashboard/activity/recent`, authService.getAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'activité récente:', error);
    throw error;
  }
};

// Service pour récupérer les examens de l'utilisateur
export const getUserExams = async () => {
  try {
    const response = await axios.get(`${API_URL}/exam/exams/user`, authService.getAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des examens:', error);
    throw error;
  }
};

// Service pour récupérer les tentatives de l'utilisateur
export const getUserAttempts = async () => {
  try {
    const response = await axios.get(`${API_URL}/attempt/attempts`, authService.getAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des tentatives:', error);
    throw error;
  }
};

// Service pour récupérer les informations utilisateur
export const getUserInfo = async () => {
  try {
    const response = await axios.get(`${API_URL}/auth/me`, authService.getAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des informations utilisateur:', error);
    throw error;
  }
};

// Service pour récupérer tous les utilisateurs (pour admin)
export const getAllUsers = async () => {
  try {
    const response = await axios.get(`${API_URL}/auth/users`, authService.getAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    throw error;
  }
};

// Service pour calculer les statistiques basées sur les données récupérées
export const calculateDashboardData = (userInfo, exams, attempts, allUsers = []) => {
  const role = userInfo?.role;
  
  if (role === 'Client') {
    // Statistiques pour les clients
    const totalExams = exams?.length || 0;
    const scores = exams?.map(exam => parseFloat(exam.score)).filter(score => !isNaN(score)) || [];
    const averageScore = scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : '0';
    const bestScore = scores.length > 0 ? Math.max(...scores).toFixed(1) : '0';
    
    // Examens de la semaine (derniers 7 jours)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const weeklyExams = exams?.filter(exam => 
      new Date(exam.date_passage) >= oneWeekAgo
    ).length || 0;
    
    // Progression mensuelle (derniers 30 jours)
    const oneMonthAgo = new Date();
    oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);
    const monthlyExams = exams?.filter(exam => 
      new Date(exam.date_passage) >= oneMonthAgo
    ).length || 0;
    
    return {
      totalExams,
      averageScore,
      bestScore,
      weeklyExams,
      monthlyProgress: monthlyExams,
      studyStreak: calculateStudyStreak(exams),
      recentActivity: getRecentActivity(exams)
    };
  } else if (role === 'Administrator' || role === 'Moderator') {
    // Statistiques pour les administrateurs et modérateurs
    const totalUsers = allUsers?.length || 0;
    const activeUsers = allUsers?.filter(user => user.payment_status === 'active').length || 0;
    const totalExams = exams?.length || 0;
    const totalAttempts = attempts?.length || 0;
    
    // Revenus (basé sur les plans d'abonnement)
    const revenue = calculateRevenue(allUsers);
    
    return {
      totalUsers,
      activeUsers,
      totalExams,
      totalAttempts,
      revenue,
      recentActivity: getRecentActivity(exams)
    };
  }
  
  return {};
};

// Fonction pour calculer la série d'étude
const calculateStudyStreak = (exams) => {
  if (!exams || exams.length === 0) return 0;
  
  const sortedExams = exams
    .map(exam => new Date(exam.date_passage))
    .sort((a, b) => b - a); // Tri décroissant
  
  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  
  for (let examDate of sortedExams) {
    examDate.setHours(0, 0, 0, 0);
    const diffDays = Math.floor((currentDate - examDate) / (1000 * 60 * 60 * 24));
    
    if (diffDays === streak) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else if (diffDays > streak) {
      break;
    }
  }
  
  return streak;
};



// Fonction pour calculer les revenus
const calculateRevenue = (users) => {
  if (!users || users.length === 0) return '0';
  
  const planPrices = {
    'basic': 29.99,
    'premium': 49.99,
    'pro': 79.99
  };
  
  const totalRevenue = users.reduce((total, user) => {
    const planPrice = planPrices[user.subscription_plan] || 0;
    return total + (user.payment_status === 'active' ? planPrice : 0);
  }, 0);
  
  return (totalRevenue / 1000).toFixed(1) + 'k';
};

// Fonctions pour calculer les statistiques basées sur les examens réels
const calculateAverageScore = (exams) => {
  if (!exams || exams.length === 0) return 'Aucun';
  
  // Convertir les niveaux CECR en valeurs numériques pour le calcul
  const scores = exams
    .map(exam => convertCECRToNumeric(exam.score))
    .filter(score => score > 0);
  
  if (scores.length === 0) return 'Aucun';
  
  const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  return convertNumericToCECR(average);
};

const calculateBestScore = (exams) => {
  if (!exams || exams.length === 0) return 'Aucun';
  
  // Convertir les niveaux CECR en valeurs numériques pour trouver le meilleur
  const scores = exams
    .map(exam => convertCECRToNumeric(exam.score))
    .filter(score => score > 0);
  
  if (scores.length === 0) return 'Aucun';
  
  const bestScore = Math.max(...scores);
  return convertNumericToCECR(bestScore);
};

// Fonction pour convertir les niveaux CECR en valeurs numériques
const convertCECRToNumeric = (score) => {
  if (!score) return 0;
  
  const scoreUpper = score.toString().toUpperCase();
  
  // Gestion des niveaux CECR
  if (scoreUpper.includes('C2')) return 95;
  if (scoreUpper.includes('C1')) return 85;
  if (scoreUpper.includes('B2')) return 75;
  if (scoreUpper.includes('B1')) return 65;
  if (scoreUpper.includes('A2')) return 55;
  if (scoreUpper.includes('A1')) return 45;
  
  // Gestion des niveaux numériques (1-6)
  if (scoreUpper.includes('6')) return 95;
  if (scoreUpper.includes('5')) return 85;
  if (scoreUpper.includes('4')) return 75;
  if (scoreUpper.includes('3')) return 65;
  if (scoreUpper.includes('2')) return 55;
  if (scoreUpper.includes('1')) return 45;
  
  // Gestion des niveaux mixtes
  if (scoreUpper.includes('B1+') || scoreUpper.includes('B1/B2')) return 70;
  if (scoreUpper.includes('A2-B1') || scoreUpper.includes('A1-A2')) return 50;
  
  return 50; // Score par défaut
};

// Fonction pour convertir une valeur numérique en niveau CECR
const convertNumericToCECR = (numericScore) => {
  if (numericScore >= 90) return 'C2';
  if (numericScore >= 80) return 'C1';
  if (numericScore >= 70) return 'B2';
  if (numericScore >= 60) return 'B1';
  if (numericScore >= 50) return 'A2';
  return 'A1';
};

const calculateWeeklyExams = (exams) => {
  if (!exams || exams.length === 0) return 0;
  
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  return exams.filter(exam => {
    const examDate = new Date(exam.date_passage || exam.created_at);
    return examDate >= oneWeekAgo;
  }).length;
};

const calculateMonthlyProgress = (exams) => {
  if (!exams || exams.length === 0) return 0;
  
  const oneMonthAgo = new Date();
  oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);
  
  return exams.filter(exam => {
    const examDate = new Date(exam.date_passage || exam.created_at);
    return examDate >= oneMonthAgo;
  }).length;
};