
import { useRef } from "react";
import jsPDF from "jspdf";
// *********** Dummy Component ****************//
import InvoiceLrTemplate from "../../pages/Transportation/InvoiceLr/InvoiceTemplate/InvoiceTemplate";
import { Grid } from "@mui/material";
import { useHistory } from "react-router-dom";
import CustomBackButton from "@components/reusablecomponents/CustomBackButton";


function InvoiceTemplateDownload() {

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
      <Grid container spacing={2} size={{xs:12}} >
        <Grid item size={{xs:5}}>
          <CustomBackButton handleGoBack={handleGoBack}
          />
        </Grid>
        <Grid item size={{xs:6}}>
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
