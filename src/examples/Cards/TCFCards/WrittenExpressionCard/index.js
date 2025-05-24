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

function WrittenExpressionCard({ title, description, pack, duration, action, shadow, bgColor }) {
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

      <MDBox pt={2} px={1.5} pb={0} flex={1} display="flex" flexDirection="column">
        <MDBox mb={1.5}>
          <MDTypography 
            variant="h6" 
            fontWeight="bold" 
            textTransform="capitalize"
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              lineHeight: 1.3,
              minHeight: '2.6em'
            }}
          >
            {title}
          </MDTypography>
        </MDBox>
        <MDBox 
          mb={2} 
          lineHeight={1.4} 
          flexGrow={1}
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            maxHeight: '4.2em'
          }}
        >
          <MDTypography 
            variant="body2" 
            fontWeight="light" 
            color="text"
            sx={{
              fontSize: '0.875rem',
              opacity: 0.8
            }}
          >
            {description}
          </MDTypography>
        </MDBox>
        <MDBox 
          display="flex" 
          justifyContent="space-between" 
          alignItems="center" 
          mb={2} 
          mt="auto"
          sx={{
            borderTop: '1px solid',
            borderColor: 'rgba(0,0,0,0.08)',
            pt: 1.5
          }}
        >
          <MDBox display="flex" alignItems="center">
            <MDBox 
              display="flex" 
              alignItems="center" 
              lineHeight={0}
              sx={{
                backgroundColor: 'rgba(0,0,0,0.04)',
                borderRadius: '8px',
                padding: '4px 8px'
              }}
            >
              <Icon fontSize="small" sx={{ color: "info.main" }}>
                schedule
              </Icon>
              <MDTypography variant="button" fontWeight="regular" color="text" ml={0.5}>
                <MDTypography component="span" variant="button" fontWeight="bold" color="text">{duration}</MDTypography> min
              </MDTypography>
            </MDBox>
          </MDBox>
        </MDBox>
        {action.type === "external" ? (
          <MuiLink href={action.route} target="_blank" rel="noreferrer" sx={cardActionStyles}>
            <MDButton
              color={action.color ? action.color : "info"}
              variant="gradient"
              fullWidth
              sx={{
                borderRadius: "12px",
                py: 1.2,
                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.3s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 15px rgba(0, 0, 0, 0.15)',
                },
                fontWeight: 'bold',
                letterSpacing: '0.5px',
              }}
            >
              <MDBox sx={{
                ...cardIconStyles,
                mr: 1,
                '& .MuiIcon-root': {
                  fontSize: '1.25rem',
                }
              }}>
                <Icon>{action.icon || "launch"}</Icon>
              </MDBox>
              {action.label}
            </MDButton>
          </MuiLink>
        ) : action.type === "function" ? (
          <MDButton
            onClick={action.onClick}
            color={action.color ? action.color : "info"}
            variant="gradient"
            fullWidth
            sx={{
              borderRadius: "12px",
              py: 1.2,
              boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.3s',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 15px rgba(0, 0, 0, 0.15)',
              },
              fontWeight: 'bold',
              letterSpacing: '0.5px',
            }}
          >
            <MDBox sx={{
              ...cardIconStyles,
              mr: 1,
              '& .MuiIcon-root': {
                fontSize: '1.25rem',
              }
            }}>
              <Icon>{action.icon || "play_arrow"}</Icon>
            </MDBox>
            {action.label}
          </MDButton>
        ) : (
          <Link to={action.route} style={cardActionStyles}>
            <MDButton
              color={action.color ? action.color : "info"}
              variant="gradient"
              fullWidth
              sx={{
                borderRadius: "12px",
                py: 1.2,
                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.3s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 15px rgba(0, 0, 0, 0.15)',
                },
                fontWeight: 'bold',
                letterSpacing: '0.5px',
              }}
            >
              <MDBox sx={{
                ...cardIconStyles,
                mr: 1,
                '& .MuiIcon-root': {
                  fontSize: '1.25rem',
                }
              }}>
                <Icon>{action.icon || "arrow_forward"}</Icon>
              </MDBox>
              {action.label}
            </MDButton>
          </Link>
        )}
      </MDBox>
    </Card>
  );
}

// Setting default values for the props of WrittenExpressionCard
WrittenExpressionCard.defaultProps = {
  shadow: true,
  bgColor: "#007bff", // Couleur par défaut si non spécifiée
};

// Typechecking props for the WrittenExpressionCard
WrittenExpressionCard.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  pack: PropTypes.string.isRequired, // Nouveau prop pour le pack
  duration: PropTypes.number.isRequired,
  shadow: PropTypes.bool,
  bgColor: PropTypes.string, // Nouveau prop pour la couleur de fond
  action: PropTypes.shape({
    type: PropTypes.oneOf(["external", "internal", "function"]).isRequired,
    route: PropTypes.string,
    onClick: PropTypes.func,
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
    icon: PropTypes.string,
  }).isRequired,
};

export default WrittenExpressionCard;