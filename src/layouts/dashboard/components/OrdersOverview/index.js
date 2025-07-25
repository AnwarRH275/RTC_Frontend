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
      <MDBox pt={3} px={3}>
        <MDTypography variant="h6" fontWeight="bold">
          Orders Overview
        </MDTypography>
        <MDBox mt={0.5} mb={2}>
          <MDTypography variant="button" color="text" fontWeight="regular" sx={{ opacity: 0.8 }}>
            <MDTypography display="inline" variant="body2" verticalAlign="middle">
              <Icon sx={{ color: ({ palette: { success } }) => success.main }}>arrow_upward</Icon>
            </MDTypography>
            &nbsp;
            <MDTypography variant="button" color="text" fontWeight="medium">
              24%
            </MDTypography>{" "}
            this month
          </MDTypography>
        </MDBox>
      </MDBox>
      <MDBox p={2}>
        <TimelineItem
          color="success"
          icon="notifications"
          title="$2400, Design changes"
          dateTime="22 DEC 7:20 PM"
          sx={{ 
            "& .MuiTimelineItem-root": { 
              transition: "transform 0.2s",
              "&:hover": { transform: "translateX(5px)" } 
            } 
          }}
        />
        <TimelineItem
          color="error"
          icon="inventory_2"
          title="New order #1832412"
          dateTime="21 DEC 11 PM"
          sx={{ 
            "& .MuiTimelineItem-root": { 
              transition: "transform 0.2s",
              "&:hover": { transform: "translateX(5px)" } 
            } 
          }}
        />
        <TimelineItem
          color="info"
          icon="shopping_cart"
          title="Server payments for April"
          dateTime="21 DEC 9:34 PM"
          sx={{ 
            "& .MuiTimelineItem-root": { 
              transition: "transform 0.2s",
              "&:hover": { transform: "translateX(5px)" } 
            } 
          }}
        />
        <TimelineItem
          color="warning"
          icon="payment"
          title="New card added for order #4395133"
          dateTime="20 DEC 2:20 AM"
          sx={{ 
            "& .MuiTimelineItem-root": { 
              transition: "transform 0.2s",
              "&:hover": { transform: "translateX(5px)" } 
            } 
          }}
        />
        <TimelineItem
          color="primary"
          icon="vpn_key"
          title="New card added for order #4395133"
          dateTime="18 DEC 4:54 AM"
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
