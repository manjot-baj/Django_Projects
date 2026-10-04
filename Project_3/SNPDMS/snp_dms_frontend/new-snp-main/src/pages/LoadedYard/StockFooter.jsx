import React from "react";
import { Paper, Button, styled } from "@mui/material";
import { useHistory } from "react-router-dom";

const FooterContainer = styled(Paper)(({ theme }) => ({
  width: "100%",
  padding: "0px 0px 10px 0px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  position: "fixed",
  bottom: 0,
  left: 0,
  backgroundColor: "#fff",
  zIndex: 99,
  transition: theme.transitions.create("margin", {
    easing: theme.transitions.easing.easeOut,
    duration: theme.transitions.duration.enteringScreen,
  }),
}));

const StyledButton = styled(Button)(({ theme }) => ({
  width: "20%",
  borderRadius: 6,

  color: "#fff",
  border: "none",
  cursor: "pointer",
  marginLeft: 10,
  marginRight: 10,

  [theme.breakpoints.down("sm")]: {
    width: "50%",
  },
}));

const StockFooter = (props) => {
  const { open } = props;
  const history = useHistory();
  const openStockUpload = () => {
    history.push("/loaded-yard/stock-upload");
  };

  return (
    <FooterContainer sx={{ marginLeft: open ? 0 : undefined }}>
      <StyledButton
        onClick={openStockUpload}
        variant="contained"
        color="primary"
      >
        Loaded Yard Stock Upload
      </StyledButton>
    </FooterContainer>
  );
};

export default StockFooter;
