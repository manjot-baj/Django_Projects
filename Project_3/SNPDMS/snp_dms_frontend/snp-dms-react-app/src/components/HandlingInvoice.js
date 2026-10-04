import React, { useEffect } from "react";

import { Grid, Button, makeStyles } from "@material-ui/core";
import { useDispatch, useSelector } from "react-redux";
import LayoutContainer from "./reusableComponents/LayoutContainer";
import HandlingInvoiceData from "./HandlingInvoiceData";
import { getSingleClient } from "../actions/Master/ClientMasterActions";
import { deleteInvoiceNo } from "../actions/BillingActions";
import { useHistory } from "react-router-dom";
import { Image } from "semantic-ui-react";

const useStyles = makeStyles((theme) => ({
  button: {
    fontSize: 12.5,
    borderRadius: 6,
    width: "100%",
    border: "1.5px solid #2A5FA5",
    boxShadow: "0px 3px 6px #9199A14D",
    backgroundColor: "#2A5FA5",
    color: "#fff",
    "&:hover": {
      backgroundColor: "#2A5FA5",
    },
  },
  backImage: {
    height: 40,
    width: 40,
    marginBottom: 15,
    cursor: "pointer",
  },
}));

export default function HandlingInvoice(props) {
  const dispatch = useDispatch();
  const classes = useStyles();
  const store = useSelector((state) => state);
  const { billing } = store;
  const history = useHistory();

  useEffect(() => {
    if (billing.allCollectedInvoice.length === 0) {
      history.push("/billing");
    }
  });

  const handleClientCreation = () => {};

  const handleGoBack = () => {
    dispatch({
      type: "CLEAR_CHECKBOX",
    });
    history.goBack();
  };

  return (
    <LayoutContainer footer={false}>
      <Grid container>
        <Grid item xs={12}>
          <Image
            src={require("../assets/images/back-arrow.png")}
            className={classes.backImage}
            onClick={handleGoBack}
          />
          <HandlingInvoiceData />
          <Grid
            style={{
              marginLeft: "auto",
              marginRight: "auto",
              width: "30%",
              marginTop: 16,
              marginBottom: 16,
            }}
          >
            <Button className={classes.button} onClick={handleClientCreation}>
              Save
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </LayoutContainer>
  );
}
