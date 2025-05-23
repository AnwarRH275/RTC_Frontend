/**
=========================================================
* Simulateur TCF Canada React - v2.2.0
=========================================================
*/

// react-router components
import { Link } from "react-router-dom";

// prop-types is a library for typechecking of props
import PropTypes from "prop-types";

// @mui material components
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import Icon from "@mui/material/Icon";
import MuiLink from "@mui/material/Link";
import LockIcon from "@mui/icons-material/Lock";
import LockOpenIcon from "@mui/icons-material/LockOpen";

// Simulateur TCF Canada React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

function LockedExpressionCard({ title, description, pack, duration, action, shadow, bgColor }) {
  const cardActionStyles = {
    display: "flex",
    alignItems: "center",
    width: "100%",
  };

  const cardIconStyles = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginRight: "8px",
  };

  return (
    <Card
      sx={{
        boxShadow: ({ boxShadows: { md } }) => shadow ? md : "none",
        overflow: "visible",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
        "&:hover": {
          transform: "translateY(-5px)",
          boxShadow: ({ boxShadows: { xxl } }) => xxl,
        },
        p: 1.5,
        borderRadius: "15px",
        position: "relative",
      }}
    >
      {/* Overlay semi-transparent avec effet de brillance */}
      <MDBox
        position="absolute"
        top={110}
        left={10}
        width="95%"
        height="52%"
        sx={{
          backgroundColor: "rgba(0, 0, 0, 0.1)",
          backdropFilter: "blur(2px)",
          borderRadius: "15px",
          zIndex: 1,
          overflow: "hidden",
          "&::after": {
            content: '""',
            position: "absolute",
            top: "-50%",
            left: "-50%",
            width: "200%",
            height: "200%",
            background: "linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 100%)",
            transform: "rotate(30deg)",
            animation: "shine 3s infinite",
          },
          "@keyframes shine": {
            "0%": { transform: "translateX(-100%) rotate(30deg)" },
            "100%": { transform: "translateX(100%) rotate(30deg)" },
          },
        }}
      />

      {/* Icône de cadenas avec animation */}
      <MDBox
        position="absolute"
        top="50%"
        left="50%"
        sx={{
          transform: "translate(-50%, -50%)",
          zIndex: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "rgba(0, 128, 0, 0.9)", // Updated to a more professional green
          boxShadow: "0px 0px 30px rgba(0, 128, 0, 0.7)", // Enhanced shadow for a more appealing look
          animation: "pulse 1.5s infinite", // Faster pulse for dynamic effect
          borderRadius: "50%",
          width: "80px",
          height: "80px",
          boxShadow: "0 4px 20px rgba(220, 20, 60, 0.5)",
          transition: "all 0.3s ease",
          animation: "pulse 2s infinite",
          "@keyframes pulse": {
            "0%": { boxShadow: "0 0 0 0 rgba(220, 20, 60, 0.7)" },
            "70%": { boxShadow: "0 0 0 15px rgba(220, 20, 60, 0)" },
            "100%": { boxShadow: "0 0 0 0 rgba(220, 20, 60, 0)" },
          },
          "&:hover": {
            transform: "translate(-50%, -50%) scale(1.1)",
            backgroundColor: "rgba(220, 20, 60, 1)",
          },
        }}
      >
        <LockIcon sx={{ fontSize: 40, color: "white" }} />
      </MDBox>

      <MDBox
        position="relative"
        borderRadius="xl"
        mx={-1}
        mt={-3}
        height="120px"
        sx={{
          background: `linear-gradient(135deg, ${bgColor} 0%, ${bgColor === '#38b000' ? '#2d8e00' : '#004ba0'} 100%)`,
          boxShadow: ({ boxShadows: { lg } }) => lg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 1,
          overflow: 'hidden',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '-50%',
            right: '-50%',
            bottom: '-50%',
            left: '-50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
            transform: 'rotate(30deg)',
          }
        }}
      >
        <MDTypography 
          variant="h5" 
          fontWeight="bold" 
          color="white" 
          textTransform="uppercase"
          sx={{
            textShadow: '0px 2px 4px rgba(0,0,0,0.2)',
            letterSpacing: '1px'
          }}
        >
          {pack}
        </MDTypography>
      </MDBox>

      <MDBox p={2} display="flex" flexDirection="column" flexGrow={1} sx={{ opacity: 0.8, zIndex: 0 }}>
        <MDBox mb={1}>
          <MDTypography variant="h5" fontWeight="bold" textTransform="capitalize">
            {title}
          </MDTypography>
        </MDBox>
        <MDBox mb={2} lineHeight={1.2}>
          <MDTypography variant="body2" color="text" fontWeight="regular">
            {description}
          </MDTypography>
        </MDBox>
        <MDBox mt="auto" display="flex" alignItems="center">
          <MDBox display="flex" alignItems="center" color="text">
            <Icon sx={{ fontWeight: "bold" }}>schedule</Icon>
            <MDTypography variant="body2" fontWeight="regular" ml={0.5}>
              {duration} min
            </MDTypography>
          </MDBox>
          <MDBox ml="auto">
            <MDButton 
              variant="contained" 
              color="error" 
              size="small"
              sx={{
                background: "linear-gradient(45deg, #FF416C 0%, #FF4B2B 100%)",
                boxShadow: "0 4px 10px rgba(255, 65, 108, 0.4)",
                transition: "all 0.3s ease",
                position: "relative",
                overflow: "hidden",
                '&:hover': {
                  transform: "translateY(-2px)",
                  boxShadow: "0 7px 14px rgba(255, 65, 108, 0.6)",
                },
                '&::before': {
                  content: '""',
                  position: "absolute",
                  top: "-180%",
                  left: "0",
                  width: "100%",
                  height: "300%",
                  background: "linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 100%)",
                  transform: "rotate(35deg)",
                  transition: "all 0.6s cubic-bezier(0.19, 1, 0.22, 1)",
                  zIndex: 1,
                },
                '&:hover::before': {
                  left: "100%",
                },
              }}
              startIcon={<LockOpenIcon />}
            >
              Débloquer Maintenant
            </MDButton>
          </MDBox>
        </MDBox>
      </MDBox>
    </Card>
  );
}

// Typechecking props for the LockedExpressionCard
LockedExpressionCard.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  pack: PropTypes.string.isRequired,
  duration: PropTypes.number.isRequired,
  action: PropTypes.shape({
    type: PropTypes.oneOf(["external", "internal"]).isRequired,
    route: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
  }),
  shadow: PropTypes.bool,
  bgColor: PropTypes.string,
};

// Default props for the LockedExpressionCard
LockedExpressionCard.defaultProps = {
  shadow: true,
  bgColor: "#38b000",
  action: null,
};

export default LockedExpressionCard;