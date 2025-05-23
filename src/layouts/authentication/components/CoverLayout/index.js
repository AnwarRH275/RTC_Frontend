/**
=========================================================
* Réussir TCF Canada - v1.0.0
=========================================================
*/

// prop-types is a library for typechecking of props
import PropTypes from "prop-types";

// @mui material components
import Grid from "@mui/material/Grid";

// Simulateur TCF Canada React components
import MDBox from "components/MDBox";

// Simulateur TCF Canada React example components
import DefaultNavbar from "examples/Navbars/DefaultNavbar";
import PageLayout from "examples/LayoutContainers/PageLayout";

// Authentication layout components
import Footer from "layouts/authentication/components/Footer";

function CoverLayout({ coverHeight, image, children }) {
  return (
    <PageLayout>
      <DefaultNavbar
        action={{
          type: "external",
          route: "#",
          label: "Réussir TCF Canada",
        }}
        transparent
        light
      />
      <MDBox
        width="100%"
        minHeight={coverHeight}
        sx={{
          backgroundImage: ({ functions: { linearGradient, rgba }, palette: { gradients } }) =>
            image &&
            `${linearGradient(
              rgba(gradients.dark.main, 0.6),
              rgba(gradients.dark.state, 0.6)
            )}, url(${image})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: -1,
          height: "100vh",
        }}
      />
      <MDBox px={1} width="100%" height="100vh" mx="auto" position="relative" zIndex={1}>
        <Grid container spacing={1} justifyContent="center">
          <Grid item xs={11} sm={10} md={8} lg={7} xl={6}>
            {children}
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </PageLayout>
  );
}

// Setting default props for the CoverLayout
CoverLayout.defaultProps = {
  coverHeight: "100vh",
};

// Typechecking props for the CoverLayout
CoverLayout.propTypes = {
  coverHeight: PropTypes.string,
  image: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

export default CoverLayout;
