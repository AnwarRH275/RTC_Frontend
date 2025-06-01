/**
=========================================================
* Réussir TCF Canada - v1.0.0
=========================================================
*/

import { useEffect, useState } from "react";

// react-router-dom components
import { useLocation, NavLink } from "react-router-dom";

// prop-types is a library for typechecking of props.
import PropTypes from "prop-types";

// @mui material components
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import Link from "@mui/material/Link";
import Icon from "@mui/material/Icon";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Tooltip from "@mui/material/Tooltip";

// Simulateur TCF Canada React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Simulateur TCF Canada React example components
import SidenavCollapse from "examples/Sidenav/SidenavCollapse";

// Custom styles for the Sidenav
import SidenavRoot from "examples/Sidenav/SidenavRoot";
import sidenavLogoLabel from "examples/Sidenav/styles/sidenav";

// Simulateur TCF Canada React context
import {
  useMaterialUIController,
  setMiniSidenav,
  setTransparentSidenav,
  setWhiteSidenav,
} from "context";
import { Margin, Padding } from "@mui/icons-material";

function Sidenav({ color, brand, brandName, routes, ...rest }) {
  const [controller, dispatch] = useMaterialUIController();
  const { miniSidenav, transparentSidenav, whiteSidenav, darkMode, sidenavColor } = controller;
  const location = useLocation();
  const collapseName = location.pathname.replace("/", "");
  
  // État pour stocker les informations de l'utilisateur
  const [userInfo, setUserInfo] = useState(() => {
    const storedUserInfo = localStorage.getItem('user_info');
    return storedUserInfo ? JSON.parse(storedUserInfo) : null;
  });

  let textColor = "white";

  if (transparentSidenav || (whiteSidenav && !darkMode)) {
    textColor = "dark";
  } else if (whiteSidenav && darkMode) {
    textColor = "inherit";
  }

  const closeSidenav = () => setMiniSidenav(dispatch, true);

  useEffect(() => {
    // A function that sets the mini state of the sidenav.
    function handleMiniSidenav() {
      setMiniSidenav(dispatch, window.innerWidth < 1200);
      setTransparentSidenav(dispatch, window.innerWidth < 1200 ? false : transparentSidenav);
      setWhiteSidenav(dispatch, window.innerWidth < 1200 ? false : whiteSidenav);
    }

    /** 
     The event listener that's calling the handleMiniSidenav function when resizing the window.
    */
    window.addEventListener("resize", handleMiniSidenav);

    // Call the handleMiniSidenav function to set the state with the initial value.
    handleMiniSidenav();

    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", handleMiniSidenav);
  }, [dispatch, location]);

  // Render all the routes from the routes.js (All the visible items on the Sidenav)
  const renderRoutes = routes.map(({ type, name, icon, title, noCollapse, key, href, route }) => {
    let returnValue;

    if (type === "collapse") {
      returnValue = href ? (
        <Link
          href={href}
          key={key}
          target="_blank"
          rel="noreferrer"
          sx={{ textDecoration: "none" }}
        >
          <SidenavCollapse
            name={name}
            icon={icon}
            active={key === collapseName}
            noCollapse={noCollapse}
          />
        </Link>
      ) : (
        <NavLink key={key} to={route}>
          <SidenavCollapse name={name} icon={icon} active={location.pathname.includes(route)} />
        </NavLink>
      );
    } else if (type === "title") {
      returnValue = (
        <MDTypography
          key={key}
          color={textColor}
          display="block"
          variant="caption"
          fontWeight="bold"
          textTransform="uppercase"
          pl={3}
          mt={2}
          mb={1}
          ml={1}
        >
          {title}
        </MDTypography>
      );
    } else if (type === "divider") {
      returnValue = (
        <Divider
          key={key}
          light={
            (!darkMode && !whiteSidenav && !transparentSidenav) ||
            (darkMode && !transparentSidenav && whiteSidenav)
          }
        />
      );
    }

    return returnValue;
  });

  return (
    <SidenavRoot
      {...rest}
      variant="permanent"
      ownerState={{ transparentSidenav, whiteSidenav, miniSidenav, darkMode }}
    >
      <MDBox pt={2} pb={1} px={6} textAlign="center">
        <MDBox
          display={{ xs: "block", xl: "none" }}
          position="absolute"
          top={-5}
          right={0}
          p={1.625}
          onClick={closeSidenav}
          sx={{ cursor: "pointer" }}
        >
          <MDTypography variant="h6" color="secondary">
            <Icon sx={{ fontWeight: "bold" }}>close</Icon>
          </MDTypography>
        </MDBox>
        <MDBox 
          component={NavLink} 
          to="/" 
          display="flex" 
          alignItems="center" 
          justifyContent={miniSidenav ? "center" : "flex-start"} 
          sx={{
            backgroundColor: "#fff", 
            padding: miniSidenav ? 1 : 2, 
            borderRadius: "5%", 
            boxShadow: "0px 4px 8px rgba(236, 228, 228, 0.1)",
            maxWidth: "100%",
            overflow: "hidden",
            transition: "all 0.3s ease"
          }}
        >
          {brand && (
            <MDBox 
              component="img" 
              src={brand} 
              alt="Brand" 
              width={miniSidenav ? "2.5rem" : "8rem"} 
              sx={{
                maxWidth: "100%",
                height: "auto",
                transition: "all 0.3s ease",
                marginLeft: miniSidenav ? 0 : 1
              }} 
            />
          )}
          {!miniSidenav && (
            <MDBox
              width={!brandName && "100%"}
              sx={(theme) => sidenavLogoLabel(theme, { miniSidenav })}
            >
              <MDTypography component="h6" variant="button" fontWeight="medium" color={textColor}>
                {brandName}
              </MDTypography>
            </MDBox>
          )}
        </MDBox>
      </MDBox>
      <Divider
        light={
          (!darkMode && !whiteSidenav && !transparentSidenav) ||
          (darkMode && !transparentSidenav && whiteSidenav)
        }
      />
      <List>{renderRoutes}</List>
      <MDBox p={miniSidenav ? 1 : 2} mt="auto">
        <MDBox sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          transition: 'all 0.3s ease'
        }}>
          {/* Plan Information Section */}
          {userInfo && (
            <MDBox sx={{
              width: '100%',
              mb: 2,
              p: miniSidenav ? 1 : 1.5,
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(74, 144, 226, 0.1) 0%, rgba(53, 122, 189, 0.1) 100%)',
              border: '1px solid rgba(74, 144, 226, 0.2)',
              transition: 'all 0.3s ease'
            }}>
              {!miniSidenav && (
                <MDTypography
                  variant="caption"
                  color={textColor}
                  fontWeight="medium"
                  textTransform="uppercase"
                  sx={{ opacity: 0.8, mb: 0.8, fontSize: '0.95rem' ,justifyContent:'center',alignItems:'center',display:'flex' }}
                >
                  Plan actuel
                </MDTypography>
              )}
              <MDBox sx={{ 
                 display: 'flex', 
                 flexDirection: 'column',
                 gap: 1.5,
                 padding: '12px',
                 backgroundColor: 'rgba(255, 255, 255, 0.05)',
                 borderRadius: '12px',
                 border: '1px solid rgba(255, 255, 255, 0.1)'
               }}>
                 {/* En-tête du tableau */}
                 <MDBox sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <MDTypography variant="caption" sx={{ color: '#fff', fontSize: '11px', fontWeight: 'bold', opacity: 0.8 }}>
                     PLAN 
                   </MDTypography>
                   <MDTypography variant="caption" sx={{ color: '#fff', fontSize: '11px', fontWeight: 'bold', opacity: 0.8 }}>
                     USAGE
                   </MDTypography>
                 </MDBox>
                 
                 {/* Contenu principal */}
                 <MDBox sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <MDBox sx={{ flex: 1 }}>
                     <MDTypography variant="caption" sx={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}>
                       {userInfo.subscription_plan || 'Free'}
                     </MDTypography>
                     <MDTypography variant="caption" sx={{ color: '#fff', fontSize: '10px', display: 'block', opacity: 0.7 }}>
                    
                     </MDTypography>
                   </MDBox>
                   
                   <Tooltip title={`${Math.round((userInfo.sold / userInfo.total_sold) * 100) || 0}% - ${userInfo.sold || 0}/${userInfo.total_sold || 0} usages`} placement="top" arrow>
                     <Box sx={{
                       width: miniSidenav ? '45px' : '55px',
                       height: miniSidenav ? '45px' : '55px',
                       borderRadius: '50%',
                       background: 'linear-gradient(135deg, #4A90E2 0%, #357ABD 100%)',
                       display: 'flex',
                       flexDirection: 'column',
                       alignItems: 'center',
                       justifyContent: 'center',
                       boxShadow: '0 4px 12px rgba(74, 144, 226, 0.4)',
                       border: '3px solid #fff',
                       transition: 'all 0.3s ease',
                       cursor: 'pointer',
                       '&:hover': {
                         transform: 'scale(1.1)',
                         boxShadow: '0 6px 16px rgba(74, 144, 226, 0.5)'
                       }
                     }}>
                       <MDTypography
                         variant="caption"
                         sx={{
                           color: '#fff',
                           fontWeight: 'bold',
                           fontSize: miniSidenav ? '14px' : '16px',
                           lineHeight: 1
                         }}
                       >
                         {Math.round((userInfo.sold / userInfo.total_sold) * 100) || 0}%
                       </MDTypography>
                       <MDTypography
                         variant="caption"
                         sx={{
                           color: '#fff',
                           fontSize: miniSidenav ? '10px' : '11px',
                           lineHeight: 1,
                           opacity: 0.9,
                           marginTop: '2px',
                           fontWeight: '500'
                         }}
                       >
                         {userInfo.sold || 0}/{userInfo.total_sold || 0}
                       </MDTypography>
                     </Box>
                   </Tooltip>
                 </MDBox>
               </MDBox>
            </MDBox>
          )}
          
          {/* Upgrade Button */}
          <MDBox sx={{ 
            position: 'relative', 
            width: '100%',
            transition: 'all 0.3s ease'
          }}>
            <MDButton
              component="a"
              href=""
              target="_blank"
              rel="noreferrer"
              variant="gradient"
              color={sidenavColor}
              fullWidth
              sx={{
                fontSize: miniSidenav ? '0.65rem' : '0.75rem',
                padding: miniSidenav ? '0.5rem 0.5rem' : '0.75rem 1.25rem',
                whiteSpace: 'nowrap',
                minWidth: 0,
                overflow: 'hidden',
                transition: 'all 0.3s ease'
              }}
            >
              {miniSidenav ? 'PRO' : 'upgrade to pro'}
            </MDButton>
          </MDBox>
        </MDBox>
      </MDBox>
    </SidenavRoot>
  );
}

// Setting default values for the props of Sidenav
Sidenav.defaultProps = {
  color: "info",
  brand: "",
};

// Typechecking props for the Sidenav
Sidenav.propTypes = {
  color: PropTypes.oneOf(["primary", "secondary", "info", "success", "warning", "error", "dark"]),
  brand: PropTypes.string,
  brandName: PropTypes.string.isRequired,
  routes: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default Sidenav;
