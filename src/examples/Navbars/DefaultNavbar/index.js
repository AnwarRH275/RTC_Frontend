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
import { Link } from "react-router-dom";

// prop-types is a library for typechecking of props.
import PropTypes from "prop-types";

// @mui material components
import Container from "@mui/material/Container";
import Icon from "@mui/material/Icon";

// Simulateur TCF Canada React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Simulateur TCF Canada React example components
import DefaultNavbarLink from "examples/Navbars/DefaultNavbar/DefaultNavbarLink";
import DefaultNavbarMobile from "examples/Navbars/DefaultNavbar/DefaultNavbarMobile";

// Simulateur TCF Canada React base styles
import breakpoints from "assets/theme/base/breakpoints";

// Simulateur TCF Canada React context
import { useMaterialUIController } from "context";

function DefaultNavbar({ transparent, light, action }) {
  const [controller] = useMaterialUIController();
  const { darkMode } = controller;

  const [mobileNavbar, setMobileNavbar] = useState(false);
  const [mobileView, setMobileView] = useState(false);

  const openMobileNavbar = ({ currentTarget }) => setMobileNavbar(currentTarget.parentNode);
  const closeMobileNavbar = () => setMobileNavbar(false);

  useEffect(() => {
    // A function that sets the display state for the DefaultNavbarMobile.
    function displayMobileNavbar() {
      if (window.innerWidth < breakpoints.values.lg) {
        setMobileView(true);
        setMobileNavbar(false);
      } else {
        setMobileView(false);
        setMobileNavbar(false);
      }
    }

    /** 
     The event listener that's calling the displayMobileNavbar function when 
     resizing the window.
    */
    window.addEventListener("resize", displayMobileNavbar);

    // Call the displayMobileNavbar function to set the state with the initial value.
    displayMobileNavbar();

    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", displayMobileNavbar);
  }, []);

  return (
    <Container>
      <MDBox
        p={1.5}
        my={2}
        mx={0}
        width="100%"
        shadow={transparent ? "none" : "md"}
        color={light ? "white" : "dark"}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        position="absolute"
        left={0}
        zIndex={3}
        sx={{
          background: "linear-gradient(135deg, rgba(79, 204, 231, 1), #0083b0)",
          boxShadow:
            "0 12px 20px -10px rgba(0, 123, 255, 0.28), 0 4px 20px 0px rgba(0, 0, 0, 0.12), 0 7px 8px -5px rgba(0, 123, 255, 0.2)",
          borderRadius: 3,
        }}
      >
        <MDBox
          component={Link}
          to="/"
          py={transparent ? 1.5 : 0.75}
          lineHeight={1}
          pl={0}
        >
          <MDTypography
            variant="button"
            fontWeight="bold"
            color="white"
            sx={{ letterSpacing: 0.3, textShadow: "none" }}
          >
            Simulateur TCF Canada
          </MDTypography>
        </MDBox>

        {action &&
          (action.type === "internal" ? (
            <MDBox display={{ xs: "none", lg: "inline-block" }}>
              <MDTypography
                component={Link}
                to={action.route}
                variant="button"
                color="white"
                fontWeight="medium"
                sx={{
                  textShadow: 'none',
                  px: 2,
                  py: 0.5,
                  borderRadius: 999,
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  border: '1px solid rgba(255,255,255,0.35)',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.25)',
                  }
                }}
              >
                {action.label}
              </MDTypography>
            </MDBox>
          ) : (
            <MDBox display={{ xs: "none", lg: "inline-block" }}>
              <MDTypography
                component="a"
                href={action.route}
                target="_blank"
                rel="noreferrer"
                variant="button"
                color="white"
                fontWeight="medium"
                sx={{
                  mt: -0.3,
                  textShadow: 'none',
                  px: 2,
                  py: 0.5,
                  borderRadius: 999,
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  border: '1px solid rgba(255,255,255,0.35)',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.25)',
                  }
                }}
              >
                {action.label}
              </MDTypography>
            </MDBox>
          ))}
        <MDBox
          display={{ xs: "inline-block", lg: "none" }}
          lineHeight={0}
          py={1.5}
          pl={1.5}
          color="inherit"
          sx={{ cursor: "pointer" }}
          onClick={openMobileNavbar}
        >
          <Icon fontSize="default">{mobileNavbar ? "close" : "menu"}</Icon>
        </MDBox>
      </MDBox>
      {mobileView && <DefaultNavbarMobile open={mobileNavbar} close={closeMobileNavbar} />}
    </Container>
  );
}

// Setting default values for the props of DefaultNavbar
DefaultNavbar.defaultProps = {
  transparent: false,
  light: false,
  action: false,
};

// Typechecking props for the DefaultNavbar
DefaultNavbar.propTypes = {
  transparent: PropTypes.bool,
  light: PropTypes.bool,
  action: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.shape({
      type: PropTypes.oneOf(["external", "internal"]).isRequired,
      route: PropTypes.string.isRequired,
      color: PropTypes.oneOf([
        "primary",
        "secondary",
        "info",
        "success",
        "warning",
        "error",
        "dark",
        "light",
      ]),
      label: PropTypes.string.isRequired,
    }),
  ]),
};

export default DefaultNavbar;
