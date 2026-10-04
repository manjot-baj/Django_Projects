import React from "react";
import {

  Typography,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,

} from "@mui/material";

import NewBookingNumber from "./NewBookingNumber";
import ExisitngBookingNumber from "./ExisitngBookingNumber";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const BookingTabSection = (props) => {

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
        
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon  />}
              aria-controls="panel1a-content"
              id="panel1a-header"
            >
              <Typography >New Booking Number</Typography>
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
          
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon/>}
              aria-controls="panel1a-content"
              id="panel1a-header"
            >
              <Typography >Existing Booking Number</Typography>
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
