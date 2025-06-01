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

// Simulateur TCF Canada React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

function CompletedExpressionCard({ title, description, pack, duration, action, shadow, bgColor, onTaskClick, onResultClick, onRetakeClick }) {
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
        p: 1.5,
        borderRadius: "15px",
        // filter: "grayscale(0.8)", // Effet grisé
        opacity: 0.85,
        position: "relative",
      }}
    >

      <MDBox
        position="relative"
        borderRadius="xl"
        mx={-1}
        mt={-3}
        height="120px"
        sx={{
          filter: "grayscale(0.8)", // Effet grisé
          background: `linear-gradient(135deg, ${bgColor} 0%, ${bgColor === '#007bff' ? '#0056b3' : bgColor === '#ff416c' ? '#ff4b2b' : bgColor === '#28a745' ? '#218838' : '#004ba0'} 100%)`,
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

      <MDBox p={2} display="flex" flexDirection="column" flexGrow={1}>
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
          <MDBox ml="auto" display="flex" flexDirection="column" alignItems="flex-end">
            <MDButton 
              variant="outlined" 
              color="dark" 
              size="small"
              disabled
              sx={{
                opacity: 0.6,
                '&:hover': {
                  cursor: 'not-allowed'
                },
                mb: 1 // Margin bottom for spacing
              }}
            >
              Déjà complété
            </MDButton>
           
          </MDBox>
          
        </MDBox>
        <MDBox display="flex" justifyContent="space-between" width="100%">
              <MDButton variant="gradient" color="info" size="small" sx={{ mr: 0.5 }} onClick={onTaskClick}>
                <Icon sx={{ mr: 0.5, fontSize: '1.2rem' }}>assignment</Icon>
                Tâche
              </MDButton>
              <MDButton variant="gradient" color="success" size="small" sx={{ mr: 0.5 }} onClick={onResultClick}>
                <Icon sx={{ mr: 0.5, fontSize: '1.5rem' }}>assessment</Icon>
                Résultat
              </MDButton>
              <MDButton variant="gradient" color="error" size="small" onClick={onRetakeClick}>
                <Icon sx={{ mr: 0.5, fontSize: '1.5rem' }}>replay</Icon>
                Repasser
              </MDButton>
            </MDBox>
      </MDBox>
    </Card>
  );
}

// Typechecking props for the CompletedExpressionCard
CompletedExpressionCard.propTypes = {
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
  onTaskClick: PropTypes.func,
  onResultClick: PropTypes.func,
  onRetakeClick: PropTypes.func,
};

// Default props for the CompletedExpressionCard
CompletedExpressionCard.defaultProps = {
  shadow: true,
  bgColor: "#3a86ff",
  action: null,
  onTaskClick: () => {},
  onResultClick: () => {},
  onRetakeClick: () => {},
};

export default CompletedExpressionCard;