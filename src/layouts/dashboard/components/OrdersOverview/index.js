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

// @mui material components
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";

// Simulateur TCF Canada React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Simulateur TCF Canada React example components
import TimelineItem from "examples/Timeline/TimelineItem";

function OrdersOverview() {
  return (
    <Card sx={{ 
      height: "100%", 
      borderRadius: "12px", 
      boxShadow: "0 8px 16px 0 rgba(0, 0, 0, 0.05)",
      overflow: "hidden",
      transition: "transform 0.3s, box-shadow 0.3s",
      "&:hover": {
        transform: "translateY(-5px)",
        boxShadow: "0 12px 20px 0 rgba(0, 0, 0, 0.1)"
      }
    }}>
      <MDBox sx={{ pt: { xs: 2, sm: 3 }, px: { xs: 2, sm: 3 } }}>
        <MDTypography variant="h6" fontWeight="bold" sx={{ fontSize: { xs: '1rem', sm: '1.1rem' } }}>
          Activité récente
        </MDTypography>
        <MDBox mt={0.5} mb={2}>
          <MDTypography variant="button" color="text" fontWeight="regular" sx={{ opacity: 0.85, fontSize: { xs: '0.85rem', sm: '0.9rem' } }}>
            <MDTypography display="inline" variant="body2" verticalAlign="middle">
              <Icon sx={{ color: ({ palette: { success } }) => success.main, fontSize: { xs: '1rem', sm: '1.25rem' } }}>arrow_upward</Icon>
            </MDTypography>
            &nbsp;
            <MDTypography variant="button" color="text" fontWeight="medium" sx={{ fontSize: { xs: '0.85rem', sm: '0.9rem' } }}>
              24%
            </MDTypography>{" "}
            ce mois-ci
          </MDTypography>
        </MDBox>
      </MDBox>
      <MDBox sx={{ p: { xs: 1.5, sm: 2 } }}>
        <TimelineItem
          color="success"
          icon="rate_review"
          title="Correction reçue — Écrit"
          dateTime="22 DEC 19:20"
          sx={{ 
            "& .MuiTimelineItem-root": { 
              transition: "transform 0.2s",
              "&:hover": { transform: "translateX(5px)" } 
            } 
          }}
        />
        <TimelineItem
          color="info"
          icon="edit_note"
          title="Nouvelle tentative — Écrit (Sujet: lettre formelle)"
          dateTime="21 DEC 23:00"
          sx={{ 
            "& .MuiTimelineItem-root": { 
              transition: "transform 0.2s",
              "&:hover": { transform: "translateX(5px)" } 
            } 
          }}
        />
        <TimelineItem
          color="primary"
          icon="record_voice_over"
          title="Simulateur — Expression orale lancé"
          dateTime="21 DEC 21:34"
          sx={{ 
            "& .MuiTimelineItem-root": { 
              transition: "transform 0.2s",
              "&:hover": { transform: "translateX(5px)" } 
            } 
          }}
        />
        <TimelineItem
          color="warning"
          icon="event"
          title="Session de coaching programmée"
          dateTime="20 DEC 02:20"
          sx={{ 
            "& .MuiTimelineItem-root": { 
              transition: "transform 0.2s",
              "&:hover": { transform: "translateX(5px)" } 
            } 
          }}
        />
        <TimelineItem
          color="secondary"
          icon="verified_user"
          title="Profil candidat mis à jour"
          dateTime="18 DEC 04:54"
          lastItem
          sx={{ 
            "& .MuiTimelineItem-root": { 
              transition: "transform 0.2s",
              "&:hover": { transform: "translateX(5px)" } 
            } 
          }}
        />
      </MDBox>
    </Card>
  );
}

export default OrdersOverview;
