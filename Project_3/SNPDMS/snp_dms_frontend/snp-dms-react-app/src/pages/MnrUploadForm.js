import React from "react";

import { Grid, makeStyles } from "@material-ui/core";
import LayoutContainer from "../components/reusableComponents/LayoutContainer";
import DownloadMnrSampleData from "./MnrUpload/DownloadMnrSampleData";
import ExtractMnrData from "./MnrUpload/ExtractMnrData";
import { useHistory } from "react-router-dom";
import { Image } from "semantic-ui-react";

const useStyles = makeStyles((theme) => ({
  backImage: {
    height: 40,
    width: 40,
    marginBottom: 15,
    cursor: "pointer",
  },
}));

export default function MnrUploadForm(props) {
  const history = useHistory();
  const classes = useStyles();

  const handleGoBack = () => {
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
          <DownloadMnrSampleData />
          <ExtractMnrData />
        </Grid>
      </Grid>
    </LayoutContainer>
  );
}
