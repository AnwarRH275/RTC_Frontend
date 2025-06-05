import axios from 'axios';
import authService from './authService';

const API_URL = 'http://localhost:5001';

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

// Fonction pour obtenir l'activité récente
const getRecentActivity = (exams) => {
  if (!exams || exams.length === 0) return [];
  
  return exams
    .sort((a, b) => new Date(b.date_passage) - new Date(a.date_passage))
    .slice(0, 5)
    .map(exam => ({
      id: exam.id,
      title: `Examen ${exam.id_subject}`,
      description: `Score: ${exam.score}`,
      date: exam.date_passage,
      type: 'exam'
    }));
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