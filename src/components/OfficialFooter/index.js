/**
=========================================================
* Official Footer Component - TCF Canada
=========================================================
*/

import { Box, Typography, Link } from "@mui/material";

function OfficialFooter() {
  return (
    <Box
      sx={{
        position: { xs: "static", md: "fixed" },
        bottom: 0,
        left: 0,
        right: 0,
        width: "100%",
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(10px)",
        borderTop: "1px solid rgba(0, 0, 0, 0.1)",
        py: 1,
        px: 2,
        zIndex: 1000,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 2
      }}
    >
      {/* Left side - Copyright */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
        <Typography variant="body2" sx={{ color: "#00ccff", fontSize: "0.875rem", fontWeight: "500" }}>
          Réussir TCF Canada LTD. © 2026  | Tous les droits sont réservés
        </Typography>
      </Box>

      {/* Center - Links */}
      <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
        <Link
          href="#"
          sx={{
            color: "#00ccff",
            textDecoration: "none",
            fontSize: "0.875rem",
            fontWeight: "500",
            "&:hover": {
              color: "#000000",
              textDecoration: "underline"
            }
          }}
        >
          Politique de confidentialité
        </Link>
        <Typography sx={{ color: "#666" }}>|</Typography>
        <Link
          href="#"
          sx={{
            color: "#00ccff",
            textDecoration: "none",
            fontSize: "0.875rem",
            fontWeight: "500",
            "&:hover": {
              color: "#000000",
              textDecoration: "underline"
            }
          }}
        >
          Politique De Retour
        </Link>
      </Box>

      {/* Right side - Payment icons */}
      <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
        <Box
          component="img"
          src="/pay1.svg"
          alt="Payment Methods"
          sx={{ height: "24px" }}
        />
      </Box>
    </Box>
  );
}

export default OfficialFooter;