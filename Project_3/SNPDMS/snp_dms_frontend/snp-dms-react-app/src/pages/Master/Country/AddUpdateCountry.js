import React, { useState, useEffect } from "react";
import {
  makeStyles,
  Typography,
  Paper,
  Grid,
  Box,
  Button,
  TextField,
} from "@material-ui/core";

import { useHistory } from "react-router-dom";
import LayoutContainer from "../../../components/reusableComponents/LayoutContainer";
import { useDispatch, useSelector } from "react-redux";
import { getSingleCountry } from "../../../actions/Master/CountryMasterActions";
import {
  addMasterCountry,
  updateMasterCountry,
} from "../../../actions/Master/CountryMasterActions";
import { useSnackbar } from "notistack";
import { theme } from "../../../App";
import { Image } from "semantic-ui-react";

const useStyles = makeStyles((theme) => ({
  paperContainer: {
    padding: theme.spacing(4, 3),
    "& div":{
      justifyContent:"center"
    }
  },
  LabelTypography: {
    fontSize: 14,
    fontWeight: 600,
    color: "#243545",
    paddingBottom: 4,
    [theme.breakpoints.down("sm")]: {
      paddingBottom: 1,
    },
  },
  button: {
    fontSize: 12.5,
    borderRadius: 6,
    marginLeft: "auto",
    marginRight: "auto",
    marginTop: 20,
    width: "35%",
    border: "1.5px solid #2A5FA5",
    boxShadow: "0px 3px 6px #9199A14D",
    backgroundColor: "#2A5FA5",
    color: "#fff",
    "&:hover": {
      backgroundColor: "#2A5FA5",
    },
  },
  input: {
    // padding: 6,
    padding: 8,
  },
  textField: {
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        borderColor: "#243545",
      },
    },
  },
  backImage: {
    height: 40,
    width: 40,
    marginBottom: 15,
    cursor: "pointer",
  },
}));

export default function AddUpdateCountry(props) {
  const classes = useStyles();
  const dispatch = useDispatch();
  const history = useHistory();
  const store = useSelector((state) => state);
  const { countryMaster } = store;
  const [countryName, setCountryName] = useState("");
  const [countryCurrency, setCountryCurrency] = useState("");
  const notify = useSnackbar().enqueueSnackbar;

  useEffect(() => {
    if (props.history.location.state) {
      dispatch(
        getSingleCountry(props.history.location.state.allDetails.pk, notify)
      );
    }

// eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (countryMaster.countryDetails.pk) {
      setCountryName(countryMaster.countryDetails.name);
      setCountryCurrency(countryMaster.countryDetails.currency);
    }
  }, [countryMaster.countryDetails]);

  const createCountry = () => {
    if (countryName === "")
      notify("Please Enter Country Name", { variant: "warning" });
    else if (countryCurrency === "")
      notify("Please Enter Country Currency", { variant: "warning" });
    else {
      let data = {
        name: countryName,
        currency: countryCurrency,
      };
      dispatch(addMasterCountry(data, history, notify));
    }
  };

  const updateCountry = () => {
    if (countryName === "")
      notify("Please Enter Country Name", { variant: "warning" });
    else if (countryCurrency === "")
      notify("Please Enter Country Currency", { variant: "warning" });
    else {
      let data = {
        pk: countryMaster.countryDetails.pk,
        name: countryName,
        currency: countryCurrency,
      };
      dispatch(
        updateMasterCountry(
          countryMaster.countryDetails.pk,
          data,
          history,
          notify
        )
      );
    }
  };

  const handleGoBack = () => {
    history.goBack();
  };

  return (
    <LayoutContainer footer={false}>
      <div>
        <Image
          src={require("../../../assets/images/back-arrow.png")}
          className={classes.backImage}
          onClick={handleGoBack}
        />
        <Typography variant="subtitle2">
          <Box fontWeight="fontWeightBold" m={1}>
            {countryMaster.countryDetails.pk ? "Update Country" : "Add Country"}
          </Box>
        </Typography>
        <Paper className={classes.paperContainer} elevation={0}>
          <Grid container xs={12}>
            <Grid
              item
              xs={12}
              sm={5}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Country Name <span style={{ color: "red" }}>*</span>
              </Typography>

              <TextField
                id="country-master-name"
                type={"text"}
                value={countryName}
                variant="outlined"
                fullWidth
                className={classes.textField}
                inputProps={{ className: classes.input }}
                onChange={(e) => setCountryName(e.target.value)}
              />
            </Grid>
            <Grid
              item
              xs={12}
              sm={5}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Country Currency <span style={{ color: "red" }}>*</span>
              </Typography>

              <TextField
                id="country-master-currency"
                type={"text"}
                value={countryCurrency}
                variant="outlined"
                fullWidth
                className={classes.textField}
                inputProps={{ className: classes.input }}
                onChange={(e) => setCountryCurrency(e.target.value)}
              />
            </Grid>

            {countryMaster.countryDetails.pk ? (
              <Button className={classes.button} onClick={updateCountry}>
                Update
              </Button>
            ) : (
              <Button className={classes.button} onClick={createCountry}>
                Save
              </Button>
            )}
          </Grid>
        </Paper>
      </div>
    </LayoutContainer>
  );
}
