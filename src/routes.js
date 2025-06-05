/**
=========================================================
* Réussir TCF Canada - v1.0.0
=========================================================
*/

// @mui icons
import Icon from "@mui/material/Icon";
import SchoolIcon from "@mui/icons-material/School";
import QuizIcon from "@mui/icons-material/Quiz";
import DescriptionIcon from "@mui/icons-material/Description";
import RecordVoiceOverIcon from "@mui/icons-material/RecordVoiceOver";

// Pages
import Dashboard from "layouts/dashboard";
import Tables from "layouts/tables";
import Billing from "layouts/billing";
import RTL from "layouts/rtl";
import Notifications from "layouts/notifications";
import Profile from "layouts/profile";
import SignIn from "layouts/authentication/sign-in";
import SignUp from "layouts/authentication/sign-up";
import PaymentSuccess from "layouts/authentication/payment-success";
import SubscriptionPlansPage from "layouts/subscription-plans";
import TCFSimulator from "layouts/tcf-simulator";
import TCFSimulatorWritten from "layouts/tcf-simulator-written";
import TCFExamInterface from "layouts/tcf-simulator-written/exam";
import TCFResultsInterface from "layouts/tcf-simulator-written/results";
import TCFAdminSimulator from "layouts/tcf-admin";
import UserManagement from "layouts/user-management";
import PackManagement from "layouts/pack-management";

const routes = [
  {
    type: "collapse",
    name: "Tableau de bord",
    key: "dashboard",
    icon: <Icon fontSize="small">dashboard</Icon>,
    route: "/dashboard",
    component: <Dashboard />,
    roles: ["Administrator", "Moderator", "Client"],
  },
  {
    type: "collapse",
    name: "Simulateur TCF Admin",
    key: "tcf-admin",
    icon: <QuizIcon fontSize="small" />,
    route: "/tcf-admin",
    component: <TCFAdminSimulator />,
    roles: ["Administrator", "Moderator"],
  },
  {
    type: "collapse",
    name: "Simulateur Expression Écrite",
    key: "tcf-simulator-written",
    icon: <DescriptionIcon fontSize="small" />,
    route: "/simulateur-tcf-canada/expression-ecrits",
    component: <TCFSimulatorWritten />,
    roles: ["Administrator", "Moderator", "Client"],
  },
  {
    type: "route",
    name: "Examen TCF Écrite",
    key: "tcf-exam-written",
    route: "/simulateur-tcf-canada/expression-ecrits/:subjectId/exam",
    component: <TCFExamInterface />,
    roles: ["Administrator", "Moderator", "Client"],
  },
  {
    type: "route",
    name: "Résultats TCF Écrite",
    key: "tcf-results-written",
    route: "/simulateur-tcf-canada/expression-ecrits/results/:subjectId",
    component: <TCFResultsInterface />,
    roles: ["Administrator", "Moderator", "Client"],
  },
  {
    type: "collapse",
    name: "Simulateur Expression Oral",
    key: "tcf-simulator-oral",
    icon: <RecordVoiceOverIcon fontSize="small" />,
    route: "/tcf-simulator/oral",
    component: <TCFSimulator />,
    roles: ["Administrator", "Moderator", "Client"],
  },
  {
    type: "collapse",
    name: "Packs Nabil",
    key: "packs-nabil",
    icon: <SchoolIcon fontSize="small" />,
    href: "https://examens.preptcfcanada.com/iump-subscription-plan/",
    roles: ["Administrator", "Moderator", "Client"],
  },
  {
    type: "collapse",
    name: "Facturation",
    key: "billing",
    icon: <Icon fontSize="small">receipt_long</Icon>,
    route: "/billing",
    component: <Billing />,
    roles: ["Administrator", "Moderator"],
  },

  {
    type: "collapse",
    name: "Gestion Utilisateurs",
    key: "user-management",
    icon: <Icon fontSize="small">people</Icon>,
    route: "/user-management",
    component: <UserManagement />,
    roles: ["Administrator", "Moderator"],
  },
  {
    type: "collapse",
    name: "Gestion de pack",
    key: "pack-management",
    icon: <Icon fontSize="small">card_membership</Icon>,
    route: "/pack-management",
    component: <PackManagement />,
    roles: ["Administrator", "Moderator"],
  },
  {
    type: "collapse",
    name: "Profil",
    key: "profile",
    icon: <Icon fontSize="small">person</Icon>,
    route: "/profile",
    component: <Profile />,
    roles: ["Administrator", "Moderator", "Client"],
  },
  {
    type: "route",
    name: "Sign In",
    key: "sign-in",
    icon: <Icon fontSize="small">login</Icon>,
    route: "/authentication/sign-in",
    component: <SignIn />,
    roles: ["Administrator", "Moderator", "Client",""],
  },
  {
    type: "route",
    name: "Sign Up",
    key: "sign-up",
    icon: <Icon fontSize="small">assignment</Icon>,
    route: "/authentication/sign-up",
    component: <SignUp />,
    roles: ["Administrator", "Moderator", "Client",""],
  },

  {
    type: "route",
    name: "Payment Success",
    key: "payment-success",
    icon: <Icon fontSize="small">payment</Icon>,
    route: "/authentication/payment-success",
    component: <PaymentSuccess />,
    roles: ["Administrator", "Moderator", "Client"],
  },
  {
    type: "route",
    name: "Subscription Plans",
    key: "subscription-plans",
    icon: <Icon fontSize="small">card_membership</Icon>,
    route: "/subscription-plans",
    component: <SubscriptionPlansPage />,
    roles: ["Administrator", "Moderator", "Client"],
  },
];

// Fonction pour filtrer les routes selon le rôle de l'utilisateur
export const getFilteredRoutes = (userRole) => {
  if (!userRole) return [];
  
  // Mapper les rôles de la base de données vers les rôles utilisés dans les routes
  const roleMapping = {
    'admin': 'Administrator',
    'moderator': 'Moderator',
    'client': 'Client'
  };
  
  // Normaliser le rôle utilisateur et le mapper
  const normalizedDbRole = userRole.toLowerCase();
  const mappedRole = roleMapping[normalizedDbRole] || userRole;
  
  // Retourner toutes les routes si l'utilisateur est admin
  if (normalizedDbRole === 'admin') {
    return routes;
  }
  
  return routes.filter(route => {
    // Si la route n'a pas de propriété roles, elle est accessible à tous
    if (!route.roles) return true;
    
    // Vérifier si le rôle mappé de l'utilisateur est dans la liste des rôles autorisés
    return route.roles.includes(mappedRole);
  });
};

export default routes;
