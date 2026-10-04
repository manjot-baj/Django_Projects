import React, { useState, useEffect } from "react";
import {
  Typography,
  Paper,
  Grid,
  Box,
  Button,
  TextField,
  Backdrop,
  CircularProgress,
} from "@mui/material";

import { useHistory } from "react-router-dom";
import LayoutContainer from "@components/reusablecomponents/LayoutContainer";
import { useDispatch, useSelector } from "react-redux";
import { getSingleCountry } from "../../../actions/master/CountryMasterActions";
import {
  addMasterCountry,
  updateMasterCountry,
} from "../../../actions/master/CountryMasterActions";
import { useSnackbar } from "notistack";
import { theme } from "../../../App";
import { Image } from "semantic-ui-react";
import BACKIMAGE from "../../../assets/images/back-arrow.png";
import { custombackDropStyle } from "@/utils/CustomClasses";

export default function AddUpdateCountry(props) {
  const dispatch = useDispatch();
  const history = useHistory();
  const store = useSelector((state) => state);
  const { countryMaster } = store;
  const [countryName, setCountryName] = useState("");
  const [countryCurrency, setCountryCurrency] = useState("");
  const notify = useSnackbar().enqueueSnackbar;
  const { isloading } = useSelector((state) => state.ui);

  useEffect(() => {
    if (props.history.location.state) {
      dispatch(
        getSingleCountry(props.history.location.state.allDetails.pk, notify),
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
          notify,
        ),
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
          src={BACKIMAGE}
          style={{
            height: 40,
            width: 40,
            cursor: "pointer",
          }}
          onClick={handleGoBack}
        />
        <Typography variant="subtitle2">
          <Box fontWeight="fontWeightBold" m={1}>
            {countryMaster.countryDetails.pk ? "Update Country" : "Add Country"}
          </Box>
        </Typography>
        <Paper
          sx={(theme) => ({
            padding: theme.spacing(2, 1),
            "& div": {
              justifyContent: "center",
            },
          })}
          elevation={0}
        >
          <Grid container size={{ xs: 12 }}>
            <Grid
              item
              size={{ xs: 12, sm: 5 }}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography
                variant="subtitle1"
                sx={(theme) => ({
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#243545",
                  paddingBottom: 4,
                  [theme.breakpoints.down("sm")]: {
                    paddingBottom: 1,
                  },
                })}
              >
                Country Name <span style={{ color: "red" }}>*</span>
              </Typography>

              <TextField
                id="country-master-name"
                type={"text"}
                value={countryName}
                variant="outlined"
                fullWidth
                size="small"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: "#243545",
                    },
                  },
                }}
                onChange={(e) => setCountryName(e.target.value)}
              />
            </Grid>
            <Grid
              item
              size={{ xs: 12, sm: 5 }}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography
                variant="subtitle1"
                sx={(theme) => ({
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#243545",
                  paddingBottom: 4,
                  [theme.breakpoints.down("sm")]: {
                    paddingBottom: 1,
                  },
                })}
              >
                Country Currency <span style={{ color: "red" }}>*</span>
              </Typography>

              <TextField
                id="country-master-currency"
                type={"text"}
                value={countryCurrency}
                variant="outlined"
                fullWidth
                size="small"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: "#243545",
                    },
                  },
                }}
                onChange={(e) => setCountryCurrency(e.target.value)}
              />
            </Grid>

            {countryMaster.countryDetails.pk ? (
              <Button
                sx={(theme) => ({
                  width: "35%",
                  marginTop: 12,
                })}
                variant="contained"
                color="primary"
                onClick={updateCountry}
              >
                Update
              </Button>
            ) : (
              <Button
                sx={(theme) => ({
                  width: "35%",
                  marginTop: 8,
                })}
                variant="contained"
                color="primary"
                onClick={createCountry}
              >
                Save
              </Button>
            )}
          </Grid>
        </Paper>
      </div>
      <Backdrop sx={custombackDropStyle} open={isloading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </LayoutContainer>
  );
}
