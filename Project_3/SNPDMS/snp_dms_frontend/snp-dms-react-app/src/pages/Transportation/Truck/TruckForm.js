import React from "react";
import { Grid, makeStyles } from "@material-ui/core";
import LayoutContainer from "../../../components/reusableComponents/LayoutContainer";
import { useHistory } from "react-router-dom";
import { Image } from "semantic-ui-react";
import AddTruck from './AddTruck';

const useStyles = makeStyles((theme) => ({
  backImage: {
    height: 40,
    width: 40,
    marginBottom: 15,
    cursor: "pointer",
  },
}));

export default function TruckForm(props) {
  const classes = useStyles();
  const history = useHistory();

  const handleGoBack = () => {
    history.goBack();
  };

  return (
    <LayoutContainer footer={false}>
      <Grid container>
        <Grid item xs={12}>
          <Image
            src={require("../../../assets/images/back-arrow.png")}
            className={classes.backImage}
            onClick={handleGoBack}
          />
          <AddTruck />
        </Grid>
      </Grid>
    </LayoutContainer>
  );
}
