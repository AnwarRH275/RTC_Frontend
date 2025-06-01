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

import { useState, useEffect } from "react";

// react-router components
import { useLocation, Link, useNavigate } from "react-router-dom";

// prop-types is a library for typechecking of props
import PropTypes from "prop-types";

// @material-ui core components
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Avatar from "@mui/material/Avatar";
import Badge from "@mui/material/Badge";
import Divider from "@mui/material/Divider";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Icon from "@mui/material/Icon";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDInput from "components/MDInput";
import MDBadge from "components/MDBadge";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 React example components
import Breadcrumbs from "examples/Breadcrumbs";
import NotificationItem from "examples/Items/NotificationItem";

// Custom styles for DashboardNavbar
import { navbar, navbarContainer, navbarRow, navbarIconButton, navbarMobileMenu } from "examples/Navbars/DashboardNavbar/styles";

// Material Dashboard 2 React context
import { useMaterialUIController, setTransparentNavbar, setMiniSidenav, setOpenConfigurator } from "context";

// Custom imports for user info and logout
// import { useInfoUser } from "../../../context"; // Removed
import authService from "../../../services/authService";
import MDButton from "components/MDButton";

function DashboardNavbar({ absolute, light, isMini }) {
  const [navbarType, setNavbarType] = useState();
  const [controller, dispatch] = useMaterialUIController();
  const { miniSidenav, transparentNavbar, fixedNavbar, openConfigurator, darkMode } = controller;
  const [openNotificationMenu, setOpenNotificationMenu] = useState(false);
  const [openUserMenu, setOpenUserMenu] = useState(false);
  const route = useLocation().pathname.slice(1).split('/');
  const navigate = useNavigate();

  // Initialize infoUser state by reading from localStorage directly
  const [infoUser, setInfoUser] = useState(() => {
    const storedUserInfo = localStorage.getItem('user_info');
    return storedUserInfo ? JSON.parse(storedUserInfo) : null;
  });

  useEffect(() => {
    // Setting the navbar type
    if (fixedNavbar) {
      setNavbarType("sticky");
    } else {
      setNavbarType("static");
    }

    // A function that sets the transparent state of the navbar based on the scroll position.
    function handleTransparentNavbar() {
      setTransparentNavbar(dispatch, (fixedNavbar && window.scrollY === 0) || !fixedNavbar);
    }

    /**
     The event listener that's calling the handleTransparentNavbar function when scrolling.
     */
    window.addEventListener("scroll", handleTransparentNavbar);

    // Call the handleTransparentNavbar function to set the state with the initial value.
    handleTransparentNavbar();

    // Remove event listener on cleanup
    return () => window.removeEventListener("scroll", handleTransparentNavbar);
  }, [dispatch, fixedNavbar]);

  console.log('infoUser dans DashboardNavbar:', infoUser);

  const handleMiniSidenav = () => setMiniSidenav(dispatch, !miniSidenav);
  const handleOpenNotificationMenu = (event) => setOpenNotificationMenu(event.currentTarget);
  const handleCloseNotificationMenu = () => setOpenNotificationMenu(false);
  const handleOpenUserMenu = (event) => setOpenUserMenu(event.currentTarget);
  const handleCloseUserMenu = () => setOpenUserMenu(false);

  const handleLogout = () => {
    authService.logout();
    navigate("/authentication/sign-in");
  };

  // Render the notifications menu
  const renderNotificationMenu = () => (
    <Menu
      anchorEl={openNotificationMenu}
      anchorReference={null}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      open={Boolean(openNotificationMenu)}
      onClose={handleCloseNotificationMenu}
      sx={{ 
        mt: 1.5,
        '& .MuiPaper-root': {
          borderRadius: 2,
          minWidth: 280,
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        }
      }}
    >
      <MDBox px={2} py={1}>
        <MDTypography variant="h6" fontWeight="medium">
          Notifications
        </MDTypography>
      </MDBox>
      <Divider />
      <NotificationItem icon={<Icon>email</Icon>} title="Nouveau message reçu" />
      <NotificationItem icon={<Icon>assignment</Icon>} title="Examen terminé avec succès" />
      <NotificationItem icon={<Icon>payment</Icon>} title="Paiement confirmé" />
      <Divider />
      <MenuItem sx={{ justifyContent: 'center', py: 1 }}>
        <MDTypography variant="button" color="primary" fontWeight="medium">
          Voir toutes les notifications
        </MDTypography>
      </MenuItem>
    </Menu>
  );

  // Render the user menu
  const renderUserMenu = () => (
    <Menu
      anchorEl={openUserMenu}
      anchorReference={null}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      open={Boolean(openUserMenu)}
      onClose={handleCloseUserMenu}
      sx={{ 
        mt: 1.5,
        '& .MuiPaper-root': {
          borderRadius: 2,
          minWidth: 220,
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        }
      }}
    >
      <MDBox px={2} py={2}>
        <MDBox display="flex" alignItems="center" mb={1}>
          <Avatar
            sx={{ 
              width: 40, 
              height: 40, 
              mr: 1.5,
              background: 'linear-gradient(45deg, #1A73E8, #4285F4)',
              fontSize: '1rem',
              fontWeight: 'bold'
            }}
          >
            {infoUser?.prenom ? infoUser.prenom.charAt(0).toUpperCase() : 'U'}
          </Avatar>
          <MDBox>
            <MDTypography variant="button" fontWeight="medium" color="text">
              {infoUser?.prenom || 'Prénom'} {infoUser?.nom || 'Nom'}
            </MDTypography>
            <MDTypography variant="caption" color="text" display="block">
              {infoUser?.email || 'email@example.com'}
            </MDTypography>
          </MDBox>
        </MDBox>
      </MDBox>
      <Divider />
      <MenuItem onClick={() => { handleCloseUserMenu(); navigate('/profile'); }}>
        <ListItemIcon>
          <Icon fontSize="small">person</Icon>
        </ListItemIcon>
        <ListItemText>
          <MDTypography variant="button">Mon Profil</MDTypography>
        </ListItemText>
      </MenuItem>
      <MenuItem onClick={() => { handleCloseUserMenu(); navigate('/billing'); }}>
        <ListItemIcon>
          <Icon fontSize="small">settings</Icon>
        </ListItemIcon>
        <ListItemText>
          <MDTypography variant="button">Paramètres</MDTypography>
        </ListItemText>
      </MenuItem>
      <Divider />
      <MenuItem onClick={() => { handleCloseUserMenu(); handleLogout(); }}>
        <ListItemIcon>
          <Icon fontSize="small" sx={{ color: 'error.main' }}>logout</Icon>
        </ListItemIcon>
        <ListItemText>
          <MDTypography variant="button" color="error">Déconnexion</MDTypography>
        </ListItemText>
      </MenuItem>
    </Menu>
  );

  const iconsStyle = ({ palette: { dark, white, text }, functions: { rgba } }) => ({
    color: () => {
      let colorValue = light || darkMode ? white.main : dark.main;

      if (transparentNavbar && !light) {
        colorValue = rgba(text.main, 0.6);
      }

      return colorValue;
    },
  });

  return (
    <AppBar
      position={absolute ? "absolute" : navbarType}
      color="inherit"
      sx={(theme) => navbar(theme, { transparentNavbar, absolute, light, darkMode })}
    >
      <Toolbar sx={(theme) => navbarContainer(theme)}>
        <MDBox color="inherit" mb={{ xs: 1, md: 0 }} sx={(theme) => navbarRow(theme, { isMini })}>
          <Breadcrumbs icon="home" title={route[route.length - 1]} route={route} light={light} />
        </MDBox>
        {isMini ? null : (
          <MDBox sx={(theme) => navbarRow(theme, { isMini })}>
            <MDBox display="flex" alignItems="center" gap={2}>
              {/* Menu toggle button */}
              <IconButton
                size="small"
                disableRipple
                color="inherit"
                sx={{
                  ...navbarMobileMenu,
                  '&:hover': {
                    backgroundColor: 'rgba(0,0,0,0.04)',
                    borderRadius: 2
                  }
                }}
                onClick={handleMiniSidenav}
              >
                <Icon sx={iconsStyle}>{miniSidenav ? "menu_open" : "menu"}</Icon>
              </IconButton>

              {/* Notifications */}
              <IconButton
                size="medium"
                disableRipple
                color="inherit"
                sx={{
                  ...navbarIconButton,
                  '&:hover': {
                    backgroundColor: 'rgba(0,0,0,0.04)',
                    borderRadius: 2
                  }
                }}
                onClick={handleOpenNotificationMenu}
              >
                <Badge 
                  badgeContent={3} 
                  color="error"
                  sx={{
                    '& .MuiBadge-badge': {
                      fontSize: '0.75rem',
                      height: 18,
                      minWidth: 18
                    }
                  }}
                >
                  <Icon sx={iconsStyle}>notifications</Icon>
                </Badge>
              </IconButton>

              {/* User Avatar */}
              <IconButton
                size="medium"
                disableRipple
                color="inherit"
                sx={{
                  p: 0.5,
                  '&:hover': {
                    backgroundColor: 'rgba(0,0,0,0.04)',
                    borderRadius: 2
                  }
                }}
                onClick={handleOpenUserMenu}
              >
                <Avatar
                  sx={{ 
                    width: 36, 
                    height: 36,
                    background: 'linear-gradient(45deg, #1A73E8, #4285F4)',
                    fontSize: '0.9rem',
                    fontWeight: 'bold',
                    border: '2px solid rgba(255,255,255,0.2)',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      boxShadow: '0 4px 12px rgba(26, 115, 232, 0.3)'
                    }
                  }}
                >
                  {infoUser?.prenom ? infoUser.prenom.charAt(0).toUpperCase() : 'U'}
                </Avatar>
              </IconButton>

              {/* Render menus */}
              {renderNotificationMenu()}
              {renderUserMenu()}
            </MDBox>
          </MDBox>
        )}
      </Toolbar>
    </AppBar>
  );
}

// Setting default values for the props of DashboardNavbar
DashboardNavbar.defaultProps = {
  absolute: false,
  light: false,
  isMini: false,
};

// Typechecking props for the DashboardNavbar
DashboardNavbar.propTypes = {
  absolute: PropTypes.bool,
  light: PropTypes.bool,
  isMini: PropTypes.bool,
};

export default DashboardNavbar;
