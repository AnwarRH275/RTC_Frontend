import React from 'react';
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import { Chip, Tooltip, IconButton } from "@mui/material";
import { Visibility, Cancel, Undo } from "@mui/icons-material";

function formatAmount(amount, currency) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: currency || "EUR",
  }).format(amount);
}

function getStatusLabel(status) {
  const labels = {
    paid: "Payé",
    cancelled: "Annulé",
    failed: "Échoué",
    pending: "En attente",
    refunded: "Remboursé",
  };
  return labels[status] || status;
}

function getStatusColor(status) {
  const colors = {
    paid: "success",
    cancelled: "error",
    failed: "warning",
    pending: "info",
    refunded: "default",
  };
  return colors[status] || "default";
}

function formatDate(dateString) {
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return new Date(dateString).toLocaleDateString("fr-FR", options);
}

function ordersTableData(orders, { show, cancel, refund }) {
  const columns = [
    { Header: "N° Commande", accessor: "orderNumber", width: "15%", align: "left" },
    { Header: "Client", accessor: "customer", width: "25%", align: "left" },
    { Header: "Pack", accessor: "subscriptionPlan", width: "15%", align: "center" },
    { Header: "Montant", accessor: "amount", width: "10%", align: "center" },
    { Header: "Statut", accessor: "status", width: "10%", align: "center" },
    { Header: "Date", accessor: "createdAt", width: "15%", align: "center" },
    { Header: "Actions", accessor: "actions", width: "10%", align: "center" },
  ];

  const rows = orders.map((order) => ({
    id: order.id,
    orderNumber: (
      <MDTypography variant="body2" fontWeight="bold">
        {order.orderNumber}
      </MDTypography>
    ),
    customer: (
      <MDBox>
        <MDTypography variant="body2" fontWeight="medium">
          {order.customerName}
        </MDTypography>
        <MDTypography variant="caption" color="text">
          {order.customerEmail}
        </MDTypography>
      </MDBox>
    ),
    subscriptionPlan: order.subscriptionPlan,
    amount: (
      <MDTypography variant="body2" fontWeight="medium">
        {formatAmount(order.amount, order.currency)}
      </MDTypography>
    ),
    status: (
      <Chip
        label={getStatusLabel(order.status)}
        color={getStatusColor(order.status)}
        size="small"
      />
    ),
    createdAt: (
      <MDTypography variant="caption">
        {formatDate(order.createdAt)}
      </MDTypography>
    ),
    actions: (
      <MDBox display="flex" justifyContent="center" alignItems="center" gap={1}>
        <IconButton
          style={{ color: "white" }}
          size="small"
          color="info"
          onClick={() => show(order)}
          sx={{
            background: "linear-gradient(135deg, rgba(79, 204, 231, 1), #0083b0)",
            color: "white",
            "&:hover": {
              background: "linear-gradient(135deg, #0083b0, rgba(79, 204, 231, 1))",
            },
          }}
        >
          <Visibility fontSize="small" />
        </IconButton>
        {order.status === "paid" && (
          <>
            <IconButton
              style={{ color: "white" }}
              size="small"
              color="error"
              onClick={() => cancel(order)}
              sx={{
                background: "linear-gradient(135deg, #FF512F, #DD2476)",
                color: "white",
                "&:hover": {
                  background: "linear-gradient(135deg, #DF412F, #BD1456)",
                },
              }}
            >
              <Cancel fontSize="small" />
            </IconButton>
            <IconButton
              style={{ color: "white" }}
              size="small"
              color="success"
              onClick={() => refund(order)}
              sx={{
                background: "linear-gradient(135deg, #2ECC71, #27AE60)",
                color: "white",
                "&:hover": {
                  background: "linear-gradient(135deg, #27AE60, #229954)",
                },
              }}
            >
              <Undo fontSize="small" />
            </IconButton>
          </>
        )}
      </MDBox>
    ),
  }));

  return {
    columns,
    rows,
  };
}

export default ordersTableData;