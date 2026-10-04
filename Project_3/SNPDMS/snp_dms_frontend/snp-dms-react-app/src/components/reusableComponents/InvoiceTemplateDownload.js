import React from "react";
import { useRef } from "react";
import jsPDF from "jspdf";
// *********** Dummy Component ****************//
import InvoiceLrTemplate from "../../pages/Transportation/InvoiceLr/InvoiceTemplate/InvoiceTemplate.js";
import { Image } from "semantic-ui-react";
import { Grid, makeStyles } from "@material-ui/core";
import { useHistory } from "react-router-dom";

const useStyles = makeStyles((theme) => ({
  backImage: {
    height: 40,
    width: 40,
    marginTop: 20,
    marginLeft: 20,
    cursor: "pointer",
  },
}));
function InvoiceTemplateDownload() {
  const classes = useStyles();
  const history = useHistory();

  const handleGoBack = () => {
    history.goBack();
  };
  const styles = {
    downloadButton: {
      background: "#4537de",
      borderColor: "#4537de",
      color: "#FFFFFF",
      cursor: "pointer",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "1rem",
      fontVariationSettings: '"wght" 550',
      fontWeight: "400",
      padding: "0.75rem 1.5rem",
      textAlign: "center",
      margin: "10px 0px 10px 0px",
      boxSizing: "border-box",
      borderRadius: "8px",
    },
  };
  const reportTemplateRef = useRef(null);

  const handleGeneratePdf = () => {
    const doc = new jsPDF({
      format: "a0",
      unit: "px",
    });

    // Adding the fonts
    doc.setFont("Inter-Regular", "normal");

    doc.html(reportTemplateRef.current, {
      async callback(doc) {
        await doc.save('Download Invoice LR');
      },
    });
  };

  return (
    <div>
      <Grid container spacing={2} xs={12}>
        <Grid item xs={5}>
          <Image
            src={require("../../assets/images/back-arrow.png")}
            className={classes.backImage}
            onClick={handleGoBack}
          />
        </Grid>
        <Grid item xs={6}>
          {" "}
          <button style={styles.downloadButton} onClick={handleGeneratePdf}>
            Generate PDF
          </button>
        </Grid>
      </Grid>

      {/************************** Add your component here *************************************/}
      <div ref={reportTemplateRef}>
        <InvoiceLrTemplate />
      </div>
    </div>
  );
}

export default InvoiceTemplateDownload;
