import React from "react";
import { Link, useLocation } from "react-router-dom";
import { AppBar, Toolbar, Box, Button } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faGraduationCap, faPeopleArrows, faUserEdit, faHeadset, faBars } from "@fortawesome/free-solid-svg-icons";
import MDTypography from "components/MDTypography";
import logoTCF from "assets/logo-tfc-canada.png";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

function OfficialHeader() {
  const location = useLocation();
  const currentPath = location.pathname;
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // Déterminer le bouton à afficher selon la page
  const getAuthButton = () => {
    if (currentPath.includes('/inscription-tcf')) {
      return { label: "SE CONNECTER", href: "/connexion-tcf", highlight: true };
    } else if (currentPath.includes('/connexion-tcf')) {
      return { label: "S'INSCRIRE", href: "/inscription-tcf", highlight: true };
    } else {
      return { label: "TARIFS", href: "https://reussir-tcfcanada.com/index.php/page-formation/#prc", highlight: true, external: true };
    }
  };

  const authButton = getAuthButton();

  const navigationItems = [
    { label: "ACCUEIL", href: "https://reussir-tcfcanada.com/", icon: faHome, external: true },
    { label: "FORMATIONS", href: "https://reussir-tcfcanada.com/page-formation/", icon: faGraduationCap, external: true },
    { label: "EXPRESSION ÉCRITE", href: "https://reussir-tcfcanada.com/expression-ecrite/", icon: faPeopleArrows, external: true },
    { label: "EXPRESSION ORALE", href: "https://reussir-tcfcanada.com/expression-ecrite/", icon: faUserEdit, external: true },
    authButton,
    { label: "CONSULTATION", href: "https://reussir-tcfcanada.com/consultation-tcf-canada/", icon: faHeadset, external: true }
  ];

  return (
    <AppBar 
      position="static" 
      elevation={0}
      sx={{
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid rgba(0, 0, 0, 0.1)",
        py: 1
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between", px: { xs: 2, md: 4 } }}>
        {/* Logo */}
        <Box component={Link} to="/" sx={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
          <img 
            src={logoTCF} 
            alt="TCF Canada" 
            style={{ 
              height: "50px",
              marginRight: "8px"
            }} 
          />
        </Box>

        {/* Navigation Menu */}
        <Box sx={{ 
          display: { xs: "none", md: "flex" }, 
          alignItems: "center", 
          gap: 2 
        }}>
          {navigationItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <Button
                key={index}
                component={item.external ? "a" : Link}
                to={item.external ? undefined : item.href}
                href={item.external ? item.href : undefined}
                target={item.external ? "_blank" : undefined}
                rel={item.external ? "noopener noreferrer" : undefined}
                startIcon={IconComponent && <FontAwesomeIcon icon={IconComponent} style={{ fontSize: "18px" }} />}
                sx={{
                  color: item.highlight ? "#000000" : "#333",
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  textTransform: "none",
                  padding: item.highlight ? "8px 18px" : "6px 12px",
                  borderRadius: item.highlight ? "999px" : "8px",
                  background: item.highlight 
  ? "#4fccE7" 
  : "transparent",
  boxShadow: item.highlight ? "0 4px 12px rgba(79, 204, 231, 0.35)" : "none",
  border: item.highlight ? "1px solid rgba(255,255,255,0.7)" : "none",
  "&:hover": {
    background: item.highlight 
      ? "#3C3C3C" 
      : "rgba(79, 204, 231, 0.12)",
    color: item.highlight 
      ? "#ffffff" 
      : "#4fccE7",
                    boxShadow: item.highlight ? "0 8px 24px rgba(60, 60, 60, 0.45)" : "none"
                  }
                }}
              >
                {item.label}
              </Button>
            );
          })}
        </Box>

        {/* Mobile Menu Button */}
        <Box sx={{ display: { xs: "block", md: "none" } }}>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={handleMenu}
            sx={{
              color: "#333",
              minWidth: "auto",
              padding: "8px"
            }}
          >
            <FontAwesomeIcon icon={faBars} />
          </IconButton>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={open}
            onClose={handleClose}
          >
            {navigationItems.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <MenuItem 
                  key={index} 
                  onClick={handleClose}
                  component={item.external ? "a" : Link}
                  to={item.external ? undefined : item.href}
                  href={item.external ? item.href : undefined}
                  target={item.external ? "_blank" : undefined}
                  rel={item.external ? "noopener noreferrer" : undefined}
                  sx={{ color: "#333" }} // Ajout de la couleur pour le texte du MenuItem
                >
                  {IconComponent && <FontAwesomeIcon icon={IconComponent} style={{ marginRight: "8px" }} />}
                  {item.label}
                </MenuItem>
              );
            })}
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default OfficialHeader;