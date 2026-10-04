import React, { useEffect } from "react";

import { Grid, makeStyles } from "@material-ui/core";
import LayoutContainer from "../components/reusableComponents/LayoutContainer";
import DownloadSampleData from "./StockUpload/DownloadSampleData";
import ExtractStockData from "./StockUpload/ExtractStockData";
import { useHistory } from "react-router-dom";
import { Image } from "semantic-ui-react";
import { useSelector } from "react-redux";

const useStyles = makeStyles((theme) => ({
  backImage: {
    height: 40,
    width: 40,
    marginBottom: 15,
    cursor: "pointer",
  },
}));

export default function StockUploadForm(props) {
  const history = useHistory();
  const classes = useStyles();
  const { user } = useSelector((state) => state);

  const handleGoBack = () => {
    history.goBack();
  };

  useEffect(() => {
    if (user.location === "Ludhiana" && user.site === "PGL Depot") {
      history.goBack()
    }
  }, []);

  return (
    <LayoutContainer footer={false}>
      <Grid container>
        <Grid item xs={12}>
          <Image
            src={require("../assets/images/back-arrow.png")}
            className={classes.backImage}
            onClick={handleGoBack}
          />
          <DownloadSampleData />
          <ExtractStockData />
        </Grid>
      </Grid>
    </LayoutContainer>
  );
}
