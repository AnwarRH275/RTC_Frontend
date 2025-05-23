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

function CompletedExpressionCard({ title, description, pack, duration, action, shadow, bgColor }) {
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
        filter: "grayscale(0.8)", // Effet grisé
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
          <MDBox ml="auto">
            <MDButton 
              variant="outlined" 
              color="dark" 
              size="small"
              disabled
              sx={{
                opacity: 0.6,
                '&:hover': {
                  cursor: 'not-allowed'
                }
              }}
            >
              Déjà complété
            </MDButton>
          </MDBox>
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
};

// Default props for the CompletedExpressionCard
CompletedExpressionCard.defaultProps = {
  shadow: true,
  bgColor: "#3a86ff",
  action: null,
};

export default CompletedExpressionCard;