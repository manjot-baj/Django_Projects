import React from "react";
import { Grid, makeStyles, Typography, Paper, Box } from "@material-ui/core";
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import GeneralDetails from "./GeneralDetails";
import Charges from "./Charges";
import TranspotationDetails from "./TranspotationDetails";
import Billing from "./Billing";
import Vouchers from "./Vouchers";

const useStyles = makeStyles((theme) => ({
  accordion: {
    boxShadow: "0px 0px 5px 0.1px rgba(0, 0, 0, 0.5)",
    "&::before": {
      top: 0,
      height: 1,
      content: "",
      opacity: 1,
      position: "absolute",
      right: "initial",
    },
  },
  iconbtn: {
    fontSize: 35,
    fontWeight: 900,
    color: "#000000",
  },
  heading: {
    fontSize: 17,
    fontWeight: 900,
    color: "#000000",
  },
  paperContainer: {
    padding: theme.spacing(4, 3),
    marginBottom: 20,
  },
}));

export default function AddBooking() {
  const [expanded, setExpanded] = React.useState("General Details");
  const classes = useStyles();
  const handleChangeEvent = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <div>
      <Typography
        variant="subtitle2"
        style={{
          paddingTop: 14,
          paddingBottom: 14,
          backgroundColor: "#243545",
          color: "#FFF",
          marginTop: 10,
          borderTopLeftRadius: 5,
          borderTopRightRadius: 5,
        }}
      >
        <Box fontWeight="fontWeightBold" m={1}>
          Add Booking Details
        </Box>
      </Typography>

      <Paper className={classes.paperContainer} elevation={0}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <div>
              <Accordion
                expanded={expanded === "General Details"}
                onChange={handleChangeEvent("General Details")}
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
                  <Typography className={classes.heading}>
                    General Details
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <GeneralDetails />
                </AccordionDetails>
              </Accordion>

              <Accordion
                expanded={expanded === "Transpotation Details"}
                onChange={handleChangeEvent("Transpotation Details")}
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
                  <Typography className={classes.heading}>
                    Transpotation Details
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <TranspotationDetails />
                </AccordionDetails>
              </Accordion>

              <Accordion
                expanded={expanded === "Charges"}
                onChange={handleChangeEvent("Charges")}
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
                  <Typography className={classes.heading}>Charges</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Charges />
                </AccordionDetails>
              </Accordion>

              <Accordion
                expanded={expanded === "Billing"}
                onChange={handleChangeEvent("Billing")}
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
                  <Typography className={classes.heading}>Billing</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Billing />
                </AccordionDetails>
              </Accordion>
              <Accordion
                expanded={expanded === "Vouchers"}
                onChange={handleChangeEvent("Vouchers")}
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
                  <Typography className={classes.heading}>Vouchers</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Vouchers />
                </AccordionDetails>
              </Accordion>
            </div>
          </Grid>
        </Grid>
      </Paper>
    </div>
  );
}
