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

import { useState, useEffect, useMemo } from "react";

// react-router components
import { Routes, Route, Navigate, useLocation, useSearchParams } from "react-router-dom";

// @mui material components
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import axios from "axios";

// Simulateur TCF Canada React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Simulateur TCF Canada React example components
import Sidenav from "examples/Sidenav";

// Simulateur TCF Canada React themes
import theme from "assets/theme";
import themeRTL from "assets/theme/theme-rtl";

// Simulateur TCF Canada React Dark Mode themes
import themeDark from "assets/theme-dark";
import themeDarkRTL from "assets/theme-dark/theme-rtl";

// RTL plugins
import rtlPlugin from "stylis-plugin-rtl";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";

// Simulateur TCF Canada React routes
import { getFilteredRoutes, getPublicRoutes } from "routes";

// Simulateur TCF Canada React contexts
import { useMaterialUIController, setMiniSidenav, InfoUserProvider, useInfoUser } from "context";

// Images
import tcfCanadaLogo from "assets/logo-tfc-canada.png";

// Composant de redirection conditionnelle
function ConditionalRedirect() {
  const { userInfo, loading, isAuthenticated } = useInfoUser();
  
  // Attendre que le chargement soit terminé
  if (loading) {
    return null; // ou un spinner de chargement
  }
  
  // Si l'utilisateur est authentifié, rediriger vers le dashboard
  if (isAuthenticated && userInfo) {
    return <Navigate to="/mon-espace-tcf" replace />;
  }
  
  // Sinon, rediriger vers la page d'inscription
  return <Navigate to="/inscription-tcf" replace />;
}

// Composant pour rediriger /reset-password vers /authentication/reset-password/cover
function ResetPasswordRedirect() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  // Construire l'URL de destination avec le token
  const destinationUrl = token 
    ? `/authentication/reset-password/cover?token=${token}`
    : '/authentication/reset-password/cover';
  
  return <Navigate to={destinationUrl} replace />;
}

function NotFound() {
  return (
    <MDBox
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        textAlign: "center",
        px: 2,
      }}
    >
      <MDTypography variant="h3" fontWeight="bold" color="text">
        404
      </MDTypography>
      <MDTypography variant="h6" color="text" sx={{ mt: 1 }}>
        Page introuvable ou accès non autorisé
      </MDTypography>
    </MDBox>
  );
}

// Composant interne qui utilise le contexte utilisateur
function AppContent() {
  const [controller, dispatch] = useMaterialUIController();
  const {
    miniSidenav,
    direction,
    layout,
    sidenavColor,
    darkMode,
  } = controller;
  const [onMouseEnter, setOnMouseEnter] = useState(false);
  const [rtlCache, setRtlCache] = useState(null);
  const { pathname } = useLocation();
  const [isExamStarted, setIsExamStarted] = useState(false);
  
  // Utiliser le contexte utilisateur au lieu de localStorage directement
  const { userInfo, isAuthenticated } = useInfoUser();
  
  // Filtrer les routes selon le rôle de l'utilisateur
  const filteredRoutes = isAuthenticated && userInfo && userInfo.role
    ? getFilteredRoutes(userInfo.role)
    : getPublicRoutes();

  // Cache for the rtl
  useMemo(() => {
    const cacheRtl = createCache({
      key: "rtl",
      stylisPlugins: [rtlPlugin],
    });

    setRtlCache(cacheRtl);
  }, []);

  // Initialiser un token CSRF côté front et le mettre en header par défaut (axios)
  useEffect(() => {
    try {
      const key = "csrf_token";
      let token = localStorage.getItem(key);
      if (!token) {
        const array = new Uint8Array(16);
        window.crypto.getRandomValues(array);
        token = Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
        localStorage.setItem(key, token);
      }
      axios.defaults.headers.common["X-CSRF-Token"] = token;
    } catch (e) {
      // noop
    }
  }, []);

  // Vérifier l'état de l'examen depuis localStorage
  useEffect(() => {
    const checkExamStatus = () => {
      const examStarted = localStorage.getItem('examStarted');
      setIsExamStarted(examStarted === 'true');
    };

    checkExamStatus();
    
    // Écouter les changements dans localStorage
    const handleStorageChange = (e) => {
      if (e.key === 'examStarted') {
        setIsExamStarted(e.newValue === 'true');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Vérifier périodiquement l'état (pour les changements dans le même onglet)
    const interval = setInterval(checkExamStatus, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // Open sidenav when mouse enter on mini sidenav
  const handleOnMouseEnter = () => {
    if (miniSidenav && !onMouseEnter) {
      setMiniSidenav(dispatch, false);
      setOnMouseEnter(true);
    }
  };

  // Close sidenav when mouse leave mini sidenav
  const handleOnMouseLeave = () => {
    if (onMouseEnter) {
      setMiniSidenav(dispatch, true);
      setOnMouseEnter(false);
    }
  };

  // Setting the dir attribute for the body element
  useEffect(() => {
    document.body.setAttribute("dir", direction);
  }, [direction]);

  // Responsive zoom pour les petits écrans
  useEffect(() => {
    const updateZoom = () => {
      const width = window.innerWidth;
      let zoomLevel = 1;
      
      if (width <= 1280) {
        zoomLevel = 0.8; // 80% pour écrans <= 1280px
      } else if (width <= 1440) {
        zoomLevel = 0.85; // 85% pour écrans entre 1280 et 1440px
      } else if (width <= 1680) {
        zoomLevel = 0.9; // 90% pour écrans entre 1440 et 1680px
      } else {
        zoomLevel = 1; // 100% pour grands écrans
      }
      
      document.body.style.zoom = `${zoomLevel * 90}%`;
      document.body.style.overflowX = 'hidden';
      document.documentElement.style.overflowX = 'hidden';
    };
    
    updateZoom();
    window.addEventListener('resize', updateZoom);
    
    return () => window.removeEventListener('resize', updateZoom);
  }, []);

  // Setting page scroll to 0 when changing the route
  useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
    
    // Nettoyer 'examStarted' si on n'est pas sur une page d'examen
    const isExamRoute = pathname.includes('/exam') && 
                       (pathname.includes('/simulateur-tcf-expression-ecrite/') || 
                        pathname.includes('/simulateur-tcf-expression-orale/'));
    
    if (!isExamRoute) {
      localStorage.removeItem('examStarted');
      setIsExamStarted(false);
    }
  }, [pathname]);

  const getRoutes = (allRoutes) =>
    allRoutes.map((route) => {
      if (route.collapse) {
        return getRoutes(route.collapse);
      }

      if (route.route) {
        return <Route exact path={route.route} element={route.component} key={route.key} />;
      }

      return null;
    });

  return (
    <>
      <h1
        style={{
          position: "absolute",
          width: 1,
          height: 1,
          padding: 0,
          margin: -1,
          overflow: "hidden",
          clip: "rect(0, 0, 0, 0)",
          whiteSpace: "nowrap",
          border: 0,
        }}
      >
        Expression TCF - Plateforme d'entraînement
      </h1>
      {direction === "rtl" ? (
        <CacheProvider value={rtlCache}>
          <ThemeProvider theme={darkMode ? themeDarkRTL : themeRTL}>
            <CssBaseline />
            {layout === "dashboard" && !pathname.includes('/results') && !pathname.includes('/connexion-tcf') && !pathname.includes('/inscription-tcf') && !isExamStarted && userInfo && (
              <>
                <Sidenav
              color={sidenavColor}
              brand={tcfCanadaLogo}
              brandName=""
              routes={filteredRoutes}
              onMouseEnter={handleOnMouseEnter}
              onMouseLeave={handleOnMouseLeave}
            />
              
                
              </>
            )}
            {layout === "vr" && null}
            <Routes>
              {getRoutes(filteredRoutes)}
              <Route path="/" element={<ConditionalRedirect />} />
              <Route path="/reset-password" element={<ResetPasswordRedirect />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </ThemeProvider>
        </CacheProvider>
      ) : (
        <ThemeProvider theme={darkMode ? themeDark : theme}>
          <CssBaseline />
          {layout === "dashboard" && !pathname.includes('/results') && !pathname.includes('/connexion-tcf') && !pathname.includes('/inscription-tcf') && !isExamStarted && userInfo && (
            <>
              <Sidenav
                color={sidenavColor}
                brand={tcfCanadaLogo}
                brandName=""
                routes={filteredRoutes}
                onMouseEnter={handleOnMouseEnter}
                onMouseLeave={handleOnMouseLeave}
              />
              
            </>
          )}
          {layout === "vr" && null}
          <Routes>
              {getRoutes(filteredRoutes)}
              <Route path="/" element={<ConditionalRedirect />} />
              <Route path="/reset-password" element={<ResetPasswordRedirect />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
        </ThemeProvider>
      )}
    </>
   );
}

// Composant principal App avec le provider
export default function App() {
  return (
    <InfoUserProvider>
      <AppContent />
    </InfoUserProvider>
  );
}
