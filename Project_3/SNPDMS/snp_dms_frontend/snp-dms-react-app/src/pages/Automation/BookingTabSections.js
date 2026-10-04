import React from "react";
import {
  makeStyles,
  Typography,
  Grid,
} from "@material-ui/core";

import NewBookingNumber from "./NewBookingNumber";
import ExisitngBookingNumber from "./ExisitngBookingNumber";
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";

const BookingTabSection = (props) => {
  const useStyles = makeStyles((theme) => ({
    dropdownPaper: {
      marginLeft: 10,
      width: "100%",
      padding: theme.spacing(0.75, 1),
      borderRadius: 6,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: "#fff",
    },
  }));
  const classes = useStyles();
  const [expanded, setExpanded] = React.useState("");

  const handleChangeEvent = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };
  return (
    <>
      <Grid item xs={12}>
        <div style={{marginTop:"40px"}}>
          <Accordion
            expanded={expanded === "NewBookingNumber"}
            onChange={handleChangeEvent("NewBookingNumber")}
            style={{
              marginBottom: 20,
              borderRadius: 5,
              boxShadow: 3,
            }}
            className={classes.accordion}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon className={classes.iconbtn} />}
              aria-controls="panel1a-content"
              id="panel1a-header"
            >
              <Typography className={classes.heading}>New Booking Number</Typography>
            </AccordionSummary>
            <AccordionDetails style={{padding:"0px 50px"}}>
              <NewBookingNumber />
            </AccordionDetails>
          </Accordion>

          <Accordion
            expanded={expanded === "ExisitngBookingNumber"}
            onChange={handleChangeEvent("ExisitngBookingNumber")}
            style={{
              marginBottom: 20,
              borderRadius: 5,
              boxShadow: 3,
            }}
            className={classes.accordion}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon className={classes.iconbtn} />}
              aria-controls="panel1a-content"
              id="panel1a-header"
            >
              <Typography className={classes.heading}>Existing Booking Number</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <ExisitngBookingNumber />
            </AccordionDetails>
          </Accordion>
        </div>
      </Grid>
    </>
  );
};

export default BookingTabSection;
