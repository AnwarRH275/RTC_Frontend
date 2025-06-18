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
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

// @mui material components
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Icon from "@mui/material/Icon";

// Simulateur TCF Canada React components
import MDBox from "components/MDBox";

// Simulateur TCF Canada React example components
import Sidenav from "examples/Sidenav";
import Configurator from "examples/Configurator";

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
import routes, { getFilteredRoutes } from "routes";

// Simulateur TCF Canada React contexts
import { useMaterialUIController, setMiniSidenav, setOpenConfigurator, InfoUserProvider, useInfoUser } from "context";

// Images
import brandWhite from "assets/images/logo-ct.png";
import brandDark from "assets/images/logo-ct-dark.png";
import tcfCanadaLogo from "assets/logo-tfc-canada.png";

// Composant interne qui utilise le contexte utilisateur
function AppContent() {
  const [controller, dispatch] = useMaterialUIController();
  const {
    miniSidenav,
    direction,
    layout,
    openConfigurator,
    sidenavColor,
    transparentSidenav,
    whiteSidenav,
    darkMode,
  } = controller;
  const [onMouseEnter, setOnMouseEnter] = useState(false);
  const [rtlCache, setRtlCache] = useState(null);
  const { pathname } = useLocation();
  const [isExamStarted, setIsExamStarted] = useState(false);
  
  // Utiliser le contexte utilisateur au lieu de localStorage directement
  const { userInfo } = useInfoUser();
  
  // Filtrer les routes selon le rôle de l'utilisateur
  const filteredRoutes = userInfo && userInfo.role ? getFilteredRoutes(userInfo.role) : routes;

  // Cache for the rtl
  useMemo(() => {
    const cacheRtl = createCache({
      key: "rtl",
      stylisPlugins: [rtlPlugin],
    });

    setRtlCache(cacheRtl);
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

  // Change the openConfigurator state
  const handleConfiguratorOpen = () => setOpenConfigurator(dispatch, !openConfigurator);

  // Setting the dir attribute for the body element
  useEffect(() => {
    document.body.setAttribute("dir", direction);
  }, [direction]);

  // Setting page scroll to 0 when changing the route
  useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
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

  const configsButton = (
    <MDBox
      display="flex"
      justifyContent="center"
      alignItems="center"
      width="3.25rem"
      height="3.25rem"
      bgColor="white"
      shadow="sm"
      borderRadius="50%"
      position="fixed"
      right="2rem"
      bottom="2rem"
      zIndex={99}
      color="dark"
      sx={{ cursor: "pointer" }}
      onClick={handleConfiguratorOpen}
    >
      <Icon fontSize="small" color="inherit">
        settings
      </Icon>
    </MDBox>
  );

  return (
    <>
      {direction === "rtl" ? (
        <CacheProvider value={rtlCache}>
          <ThemeProvider theme={darkMode ? themeDarkRTL : themeRTL}>
            <CssBaseline />
            {layout === "dashboard" && !pathname.includes('/results') && !isExamStarted && (
              <>
                <Sidenav
              color={sidenavColor}
              brand={tcfCanadaLogo}
              brandName=""
              routes={filteredRoutes}
              onMouseEnter={handleOnMouseEnter}
              onMouseLeave={handleOnMouseLeave}
            />
              
                <Configurator />
                {configsButton}
              </>
            )}
            {layout === "vr" && <Configurator />}
            <Routes>
              {getRoutes(filteredRoutes)}
              <Route path="*" element={<Navigate to="/authentication/sign-up" />} />
            </Routes>
          </ThemeProvider>
        </CacheProvider>
      ) : (
        <ThemeProvider theme={darkMode ? themeDark : theme}>
          <CssBaseline />
          {layout === "dashboard" && !pathname.includes('/results') && !isExamStarted && (
            <>
              <Sidenav
                color={sidenavColor}
                brand={tcfCanadaLogo}
                brandName=""
                routes={filteredRoutes}
                onMouseEnter={handleOnMouseEnter}
                onMouseLeave={handleOnMouseLeave}
              />
              {configsButton}
              <Configurator />
            </>
          )}
          {layout === "vr" && <Configurator />}
          <Routes>
            {getRoutes(filteredRoutes)}
            <Route path="*" element={<Navigate to="/authentication/sign-up" />} />
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
