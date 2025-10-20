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
import CreateIcon from "@mui/icons-material/Create";
import MicIcon from "@mui/icons-material/Mic";

// Pages
import Dashboard from "layouts/dashboard";
import Tables from "layouts/tables";
import Billing from "layouts/billing";
import RTL from "layouts/rtl";
import Notifications from "layouts/notifications";
import Profile from "layouts/profile";
import SignIn from "layouts/authentication/sign-in";
import SignUp from "layouts/authentication/sign-up";
import ResetPassword from "layouts/authentication/reset-password/cover";
import PaymentSuccess from "layouts/authentication/payment-success";
import SubscriptionPlansPage from "layouts/subscription-plans";
import TCFSimulator from "layouts/tcf-simulator";
import TCFSimulatorWritten from "layouts/tcf-simulator-written";
import TCFExamInterface from "layouts/tcf-simulator-written/exam";
import TCFResultsInterface from "layouts/tcf-simulator-written/results";
import TCFSimulatorOral from "layouts/tcf-simulator-oral";
import TCFOralExamInterface from "layouts/tcf-simulator-oral/exam";
import TCFOralResultsInterface from "layouts/tcf-simulator-oral/results";
import TCFAdminSimulator from "layouts/tcf-admin";
import UserManagement from "layouts/user-management";
import PackManagement from "layouts/pack-management";

const routes = [
  {
    type: "collapse",
    name: "Tableau de bord",
    key: "dashboard",
    icon: <Icon fontSize="small">dashboard</Icon>,
    route: "/mon-espace-tcf",
    component: <Dashboard />,
    roles: ["Administrator", "Moderator", "Client"],
  },
  {
    type: "collapse",
    name: "Coach TCF Admin",
    key: "tcf-admin",
    icon: <QuizIcon fontSize="small" />,
    route: "/tcf-admin",
    component: <TCFAdminSimulator />,
    roles: ["Administrator"],
  },
  {
    type: "collapse",
    name: "Coach Expression Écrite",
    key: "tcf-simulator-written",
    icon: <CreateIcon fontSize="small" />,
    route: "/simulateur-tcf-expression-ecrite",
    component: <TCFSimulatorWritten />,
    roles: ["Administrator", "Client"],
  },
  {
    type: "route",
    name: "Examen TCF Écrite",
    key: "tcf-exam-written",
    route: "/simulateur-tcf-expression-ecrite/:subjectId/exam",
    component: <TCFExamInterface />,
    roles: ["Administrator", "Client"],
  },
  {
    type: "route",
    name: "Résultats TCF Écrite",
    key: "tcf-results-written",
    route: "/simulateur-tcf-expression-ecrite/results/:subjectId",
    component: <TCFResultsInterface />,
    roles: ["Administrator", "Client"],
  },
  {
    type: "collapse",
    name: "Coach Expression Oral",
    key: "tcf-simulator-oral",
    icon: <MicIcon fontSize="small" />,
    route: "/simulateur-tcf-expression-orale",
    component: <TCFSimulatorOral />,
    roles: ["Administrator", "Client"],
  },
  {
    type: "route",
    name: "Examen TCF Oral",
    key: "tcf-exam-oral",
    route: "/simulateur-tcf-expression-orale/:subjectId/exam",
    component: <TCFOralExamInterface />,
    roles: ["Administrator", "Client"],
  },
  {
    type: "route",
    name: "Résultats TCF Oral",
    key: "tcf-results-oral",
    route: "/simulateur-tcf-expression-orale/results/:subjectId",
    component: <TCFOralResultsInterface />,
    roles: ["Administrator", "Client"],
  },
  {
    type: "collapse",
    name: "Packs Nabil",
    key: "packs-nabil",
    icon: <SchoolIcon fontSize="small" />,
    href: "https://examens.preptcfcanada.com/iump-subscription-plan/",
    roles: ["Administrator", "Client"],
  },
  {
    type: "collapse",
    name: "Facturation",
    key: "billing",
    icon: <Icon fontSize="small">receipt_long</Icon>,
    route: "/facturation-tcf",
    component: <Billing />,
    roles: ["Administrator"],
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
    roles: ["Administrator"],
  },
  {
    type: "collapse",
    name: "Profil",
    key: "profile",
    icon: <Icon fontSize="small">person</Icon>,
    route: "/profil-utilisateur-tcf",
    component: <Profile />,
    roles: ["Administrator", "Moderator", "Client"],
  },
  {
    type: "route",
    name: "Sign In",
    key: "sign-in",
    icon: <Icon fontSize="small">login</Icon>,
    route: "/connexion-tcf",
    component: <SignIn />,
    roles: ["Administrator", "Moderator", "Client",""],
  },
  {
    type: "route",
    name: "Sign Up",
    key: "sign-up",
    icon: <Icon fontSize="small">assignment</Icon>,
    route: "/inscription-tcf",
    component: <SignUp />,
    roles: ["Administrator", "Moderator", "Client",""],
  },
  {
    type: "route",
    name: "Reset Password",
    key: "reset-password",
    icon: <Icon fontSize="small">lock_reset</Icon>,
    route: "/authentication/reset-password/cover",
    component: <ResetPassword />,
    roles: ["Administrator", "Moderator", "Client",""],
  },

  {
    type: "route",
    name: "Payment Success",
    key: "payment-success",
    icon: <Icon fontSize="small">payment</Icon>,
    route: "/paiement-tcf",
    component: <PaymentSuccess />,
    roles: ["Administrator", "Client"],
  },
  {
    type: "route",
    name: "Subscription Plans",
    key: "subscription-plans",
    icon: <Icon fontSize="small">card_membership</Icon>,
    route: "/packs-tcf-canada",
    component: <SubscriptionPlansPage />,
    roles: ["Administrator", "Client"],
  },
];

// Fonction pour filtrer les routes selon le rôle de l'utilisateur
export const getFilteredRoutes = (userRole) => {
  if (!userRole) return [];
  
  // Mapper les rôles de la base de données vers les rôles utilisés dans les routes
  const roleMapping = {
    'admin': 'Administrator',
    'administrator': 'Administrator',
    'moderator': 'Moderator',
    'client': 'Client'
  };
  
  // Normaliser le rôle utilisateur et le mapper
  const normalizedDbRole = userRole.toLowerCase();
  const mappedRole = roleMapping[normalizedDbRole] || userRole;

  // Retourner toutes les routes si l'utilisateur est admin ou administrator
  if (normalizedDbRole === 'admin' || normalizedDbRole === 'administrator') {
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
