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
import TCFSimulator from "layouts/tcf-simulator";
import TCFSimulatorWritten from "layouts/tcf-simulator-written";
import TCFExamInterface from "layouts/tcf-simulator-written/exam";
import TCFAdminSimulator from "layouts/tcf-admin";

const routes = [
  {
    type: "collapse",
    name: "Tableau de bord",
    key: "dashboard",
    icon: <Icon fontSize="small">dashboard</Icon>,
    route: "/dashboard",
    component: <Dashboard />,
  },
  {
    type: "collapse",
    name: "Simulateur TCF Admin",
    key: "tcf-admin",
    icon: <QuizIcon fontSize="small" />,
    route: "/tcf-admin",
    component: <TCFAdminSimulator />,
  },
  {
    type: "collapse",
    name: "Simulateur IA TCF Écrite",
    key: "tcf-simulator-written",
    icon: <DescriptionIcon fontSize="small" />,
    route: "/tcf-simulator/written",
    component: <TCFSimulatorWritten />,
  },
  {
    type: "route",
    name: "Examen TCF Écrite",
    key: "tcf-exam-written",
    route: "/tcf-simulator/written/:subjectId/exam",
    component: <TCFExamInterface />,
  },
  {
    type: "collapse",
    name: "Simulateur IA TCF Orale",
    key: "tcf-simulator-oral",
    icon: <RecordVoiceOverIcon fontSize="small" />,
    route: "/tcf-simulator/oral",
    component: <TCFSimulator />,
  },
  {
    type: "collapse",
    name: "Cours",
    key: "courses",
    icon: <SchoolIcon fontSize="small" />,
    route: "/tables",
    component: <Tables />,
  },
  {
    type: "collapse",
    name: "Facturation",
    key: "billing",
    icon: <Icon fontSize="small">receipt_long</Icon>,
    route: "/billing",
    component: <Billing />,
  },
  {
    type: "collapse",
    name: "Notifications",
    key: "notifications",
    icon: <Icon fontSize="small">notifications</Icon>,
    route: "/notifications",
    component: <Notifications />,
  },
  {
    type: "collapse",
    name: "Profil",
    key: "profile",
    icon: <Icon fontSize="small">person</Icon>,
    route: "/profile",
    component: <Profile />,
  },
  {
    type: "route",
    name: "Sign In",
    key: "sign-in",
    icon: <Icon fontSize="small">login</Icon>,
    route: "/authentication/sign-in",
    component: <SignIn />,
  },
  {
    type: "route",
    name: "Sign Up",
    key: "sign-up",
    icon: <Icon fontSize="small">assignment</Icon>,
    route: "/authentication/sign-up",
    component: <SignUp />,
  },

  {
    type: "collapse",
    name: "Payment Success",
    key: "payment-success",
    icon: <Icon fontSize="small">payment</Icon>,
    route: "/authentication/payment-success",
    component: <PaymentSuccess />,
  },
];

export default routes;
