/**
=========================================================
* Simulateur TCF Canada React - v2.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

// @mui material components
import Grid from "@mui/material/Grid";

// Simulateur TCF Canada React components
import MDBox from "components/MDBox";

// React hooks
import { useState, useEffect, useCallback } from "react";

// Simulateur TCF Canada React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import ReportsBarChart from "examples/Charts/BarCharts/ReportsBarChart";
import ReportsLineChart from "examples/Charts/LineCharts/ReportsLineChart";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";

// Data
import reportsBarChartData from "layouts/dashboard/data/reportsBarChartData";
import reportsLineChartData from "layouts/dashboard/data/reportsLineChartData";

// Dashboard components
import Projects from "layouts/dashboard/components/Projects";
import OrdersOverview from "layouts/dashboard/components/OrdersOverview";

// Services
import { 
  getDashboardStats, 
  getUserExams, 
  getUserAttempts, 
  getUserInfo, 
  getAllUsers, 
  calculateDashboardData 
} from "services/dashboardService";

function Dashboard() {
  const { sales, tasks } = reportsLineChartData;
  const [dashboardData, setDashboardData] = useState({
    loading: true,
    userInfo: null,
    stats: {},
    recentActivity: []
  });

  // Charger les données du dashboard
  const loadDashboardData = useCallback(async () => {
    try {
      setDashboardData(prev => ({ ...prev, loading: true }));
      
      // Récupérer les informations utilisateur
      const userInfo = await getUserInfo();
      const role = userInfo?.role;
      
      let stats = {};
      let recentActivity = [];
      
      if (role === 'Client') {
        // Pour les clients, récupérer leurs examens et tentatives
        const [exams, attempts] = await Promise.all([
          getUserExams(),
          getUserAttempts()
        ]);
        
        const calculatedData = calculateDashboardData(userInfo, exams, attempts);
        stats = calculatedData;
        recentActivity = calculatedData.recentActivity || [];
        
      } else if (role === 'Administrator' || role === 'Moderator') {
        // Pour les admins/modérateurs, récupérer toutes les données
        const [exams, attempts, allUsers] = await Promise.all([
          getUserExams(),
          getUserAttempts(),
          getAllUsers()
        ]);
        
        const calculatedData = calculateDashboardData(userInfo, exams, attempts, allUsers);
        stats = calculatedData;
        recentActivity = calculatedData.recentActivity || [];
      }
      
      setDashboardData({
        loading: false,
        userInfo,
        stats,
        recentActivity
      });
      
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      setDashboardData(prev => ({ ...prev, loading: false }));
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Fonction pour obtenir les données des widgets selon le rôle
  const getWidgetData = () => {
    const { userInfo, stats } = dashboardData;
    const role = userInfo?.role;
    
    if (role === 'Client') {
      return {
        widget1: {
          color: "primary",
          icon: "quiz",
          title: "Examens Passés",
          count: stats.totalExams || 0,
          percentage: {
            color: "success",
            amount: `+${stats.weeklyExams || 0}`,
            label: "cette semaine",
          }
        },
        widget2: {
          color: "info",
          icon: "trending_up",
          title: "Score Moyen",
          count: `${stats.averageScore || 0}/20`,
          percentage: {
            color: "success",
            amount: `Meilleur: ${stats.bestScore || 0}`,
            label: "score obtenu",
          }
        },
        widget3: {
          color: "success",
          icon: "calendar_today",
          title: "Progression Mensuelle",
          count: stats.monthlyProgress || 0,
          percentage: {
            color: "success",
            amount: `${stats.studyStreak || 0} jours`,
            label: "série d'étude",
          }
        },
        widget4: {
          color: "warning",
          icon: "account_balance_wallet",
          title: "Crédits Restants",
          count: userInfo?.sold || 0,
          percentage: {
            color: "info",
            amount: `${userInfo?.total_sold || 0}`,
            label: "crédits totaux",
          }
        }
      };
    } else {
      return {
        widget1: {
          color: "dark",
          icon: "people",
          title: "Utilisateurs Totaux",
          count: stats.totalUsers || 0,
          percentage: {
            color: "success",
            amount: `${stats.activeUsers || 0}`,
            label: "utilisateurs actifs",
          }
        },
        widget2: {
          color: "info",
          icon: "assignment",
          title: "Examens Passés",
          count: stats.totalExams || 0,
          percentage: {
            color: "success",
            amount: `${stats.totalAttempts || 0}`,
            label: "tentatives totales",
          }
        },
        widget3: {
          color: "success",
          icon: "monetization_on",
          title: "Revenus",
          count: `${stats.revenue || '0'}€`,
          percentage: {
            color: "success",
            amount: "+12%",
            label: "ce mois-ci",
          }
        },
        widget4: {
          color: "primary",
          icon: "trending_up",
          title: "Croissance",
          count: "+15%",
          percentage: {
            color: "success",
            amount: "Stable",
            label: "tendance",
          }
        }
      };
    }
  };

  const widgetData = getWidgetData();

  // Fonction pour générer les données du graphique des examens
  const getExamChartData = () => {
    const { stats, userInfo } = dashboardData;
    
    if (dashboardData.loading || !stats) {
      return {
        labels: ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun"],
        datasets: {
          label: "Examens",
          data: [0, 0, 0, 0, 0, 0]
        }
      };
    }
    
    // Données simulées basées sur les statistiques réelles
    const role = userInfo?.role;
    if (role === 'Client') {
      const baseValue = stats.totalExams || 0;
      return {
        labels: ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun"],
        datasets: {
          label: "Mes Examens",
          data: [
            Math.max(0, baseValue - 5),
            Math.max(0, baseValue - 3),
            Math.max(0, baseValue - 2),
            Math.max(0, baseValue - 1),
            baseValue,
            baseValue + (stats.weeklyExams || 0)
          ]
        }
      };
    } else {
      const baseValue = stats.totalExams || 0;
      return {
        labels: ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun"],
        datasets: {
          label: "Examens Totaux",
          data: [
            Math.max(0, Math.floor(baseValue * 0.6)),
            Math.max(0, Math.floor(baseValue * 0.7)),
            Math.max(0, Math.floor(baseValue * 0.8)),
            Math.max(0, Math.floor(baseValue * 0.9)),
            baseValue,
            baseValue + Math.floor(baseValue * 0.1)
          ]
        }
      };
    }
  };

  // Fonction pour générer les données du graphique des scores
  const getScoreChartData = () => {
    const { stats, userInfo } = dashboardData;
    
    if (dashboardData.loading || !stats) {
      return {
        labels: ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun"],
        datasets: {
          label: "Scores",
          data: [0, 0, 0, 0, 0, 0]
        }
      };
    }
    
    const role = userInfo?.role;
    if (role === 'Client') {
      const avgScore = parseFloat(stats.averageScore) || 0;
      const bestScore = parseFloat(stats.bestScore) || 0;
      
      return {
        labels: ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun"],
        datasets: {
          label: "Score Moyen",
          data: [
            Math.max(0, avgScore - 3),
            Math.max(0, avgScore - 2),
            Math.max(0, avgScore - 1),
            avgScore,
            Math.min(20, avgScore + 1),
            Math.min(20, (avgScore + bestScore) / 2)
          ]
        }
      };
    } else {
      // Pour les admins, afficher une progression générale
      return {
        labels: ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun"],
        datasets: {
          label: "Performance Générale",
          data: [65, 68, 70, 72, 75, 78]
        }
      };
    }
  };

  // Fonction pour générer les données de la timeline
  const getTimelineData = () => {
    if (dashboardData.loading || !dashboardData.recentActivity) {
      return [
        {
          color: "info",
          icon: "notifications",
          title: "Chargement...",
          dateTime: "",
        }
      ];
    }

    if (dashboardData.recentActivity.length === 0) {
      return [
        {
          color: "secondary",
          icon: "info",
          title: "Aucune activité récente",
          dateTime: "Commencez votre premier examen",
        }
      ];
    }

    return dashboardData.recentActivity.map((activity, index) => {
      const date = new Date(activity.date);
      const timeAgo = getTimeAgo(date);
      
      return {
        color: index === 0 ? "success" : "info",
        icon: activity.type === 'exam' ? "quiz" : "assignment",
        title: activity.title,
        dateTime: timeAgo,
        description: activity.description
      };
    });
  };

  // Fonction utilitaire pour calculer le temps écoulé
  const getTimeAgo = (date) => {
    const now = new Date();
    const diffInMs = now - date;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 60) {
      return `il y a ${diffInMinutes} min`;
    } else if (diffInHours < 24) {
      return `il y a ${diffInHours}h`;
    } else {
      return `il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`;
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color={widgetData.widget1.color}
                icon={widgetData.widget1.icon}
                title={widgetData.widget1.title}
                count={dashboardData.loading ? "..." : widgetData.widget1.count}
                percentage={widgetData.widget1.percentage}
              />
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color={widgetData.widget2.color}
                icon={widgetData.widget2.icon}
                title={widgetData.widget2.title}
                count={dashboardData.loading ? "..." : widgetData.widget2.count}
                percentage={widgetData.widget2.percentage}
              />
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color={widgetData.widget3.color}
                icon={widgetData.widget3.icon}
                title={widgetData.widget3.title}
                count={dashboardData.loading ? "..." : widgetData.widget3.count}
                percentage={widgetData.widget3.percentage}
              />
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color={widgetData.widget4.color}
                icon={widgetData.widget4.icon}
                title={widgetData.widget4.title}
                count={dashboardData.loading ? "..." : widgetData.widget4.count}
                percentage={widgetData.widget4.percentage}
              />
            </MDBox>
          </Grid>
        </Grid>
        <MDBox mt={4.5}>
          <Grid container spacing={3}>
          <Grid item xs={12} md={6} lg={4}>
            <MDBox mb={3}>
              <ReportsBarChart
                color="info"
                title="Examens par Mois"
                description="Performance des derniers mois"
                date={dashboardData.loading ? "Chargement..." : "mis à jour récemment"}
                chart={getExamChartData()}
              />
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <MDBox mb={3}>
              <ReportsLineChart
                color="success"
                title="Progression des Scores"
                description={(
                  <>
                    {dashboardData.userInfo?.role === 'Client' ? (
                      <>Évolution de vos <strong>performances</strong></>
                    ) : (
                      <>Croissance <strong>+15%</strong> ce mois</>
                    )}
                  </>
                )}
                date={dashboardData.loading ? "Chargement..." : "mis à jour il y a 4 min"}
                chart={getScoreChartData()}
              />
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <MDBox mb={3}>
              <ReportsLineChart
                color="warning"
                title="Expression Orale"
                description="Données statiques - Performance type"
                date="données d'exemple"
                chart={{
                  labels: ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"],
                  datasets: {
                    label: "Score Expression Orale",
                    data: [12, 14, 13, 15, 16, 14, 17, 15, 16, 18, 17, 19]
                  }
                }}
              />
            </MDBox>
          </Grid>
        </Grid>
        </MDBox>
        <MDBox>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6} lg={8}>
            <Projects />
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <OrdersOverview 
              title="Activité Récente"
              description={dashboardData.loading ? "Chargement..." : `${dashboardData.recentActivity.length} activités récentes`}
              date={dashboardData.loading ? "" : "aujourd'hui"}
              timeline={getTimelineData()}
            />
          </Grid>
          </Grid>
        </MDBox>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Dashboard;
