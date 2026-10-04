import React, { useState, useEffect } from "react";
import {
  makeStyles,
  Typography,
  Paper,
  Grid,
  Box,
  Button,
  TextField,
  MenuItem,
} from "@material-ui/core";

import { useHistory } from "react-router-dom";
import LayoutContainer from "../../../components/reusableComponents/LayoutContainer";
import { useDispatch, useSelector } from "react-redux";
import { addMasterTariff } from "../../../actions/Master/TariffTypeMasterAction";
import { dropDownDispatch } from "../../../actions/GateInActions";

import { useSnackbar } from "notistack";

import { Image } from "semantic-ui-react";
import { theme } from "../../../App";
import Autocomplete from "@material-ui/lab/Autocomplete";

const useStyles = makeStyles((theme) => ({
  paperContainer: {
    padding: theme.spacing(4, 3),
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
    width: "30%",
    border: "1.5px solid #2A5FA5",
    boxShadow: "0px 3px 6px #9199A14D",
    backgroundColor: "#2A5FA5",
    color: "#fff",
    "&:hover": {
      backgroundColor: "#2A5FA5",
    },
  },
  input: {
    padding: 8,
  },
  textField: {
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        borderColor: "#243545",
      },
    },
  },
  uploadButton: {
    fontSize: 12.5,
    borderRadius: 6,
    border: "1.5px solid #2A5FA5",
    boxShadow: "0px 3px 6px #9199A14D",
    backgroundColor: "#2A5FA5",
    color: "#fff",
    width: "165px",
    "&:hover": {
      backgroundColor: "#2A5FA5",
    },
  },
  downloadButton: {
    fontSize: 12.5,
    borderRadius: 6,
    border: "1.5px solid #2A5FA5",
    boxShadow: "0px 3px 6px #9199A14D",
    backgroundColor: "#FFF",
    color: "#2A5FA5",
    "&:hover": {
      backgroundColor: "#FFF",
    },
    marginLeft: 15,
  },
  backImage: {
    height: 40,
    width: 40,
    marginBottom: 15,
    cursor: "pointer",
  },
  autocomplete: {
    "& .MuiAutocomplete-inputRoot[class*='MuiOutlinedInput-root']": {
      padding: 0,
    },
  },

    "& .MuiPaper-root.MuiMenu-paper.MuiPopover-paper.MuiPaper-elevation8.MuiPaper-rounded":
      {
        marginTop: "250px !important",
      },
  
}));

export default function AddTriffDoc(props) {
  const classes = useStyles();
  const dispatch = useDispatch();
  const history = useHistory();
  const store = useSelector((state) => state);
  const { gateIn, user } = store;
  const notify = useSnackbar().enqueueSnackbar;
  const [client, setclient] = useState("");
  const [location, setlocation] = useState("");
  const [icon, setIcon] = useState("");
  const [site, setSite] = useState("");

  const formData = new FormData();

  useEffect(() => {
    let reqArray = ["client_ref_codes", "location_site_dashboard_list"];
    dispatch(dropDownDispatch(reqArray, notify));
  }, []);

  const handleDocCreation = () => {
    if (location === "") {
      notify("Please Enter Location", { variant: "warning" });
    } else if (site === "") {
      notify("Please Enter Site", { variant: "warning" });
    }
    if (client === "") {
      notify("Please Enter Client Name", { variant: "warning" });
    } else if (icon === "") {
      notify("Please Upload Document XLSX/Excel", { variant: "warning" });
    } else {
      formData.append(
        "location",
        localStorage.getItem("location")
          ? localStorage.getItem("location")
          : null
      );
      formData.append(
        "site",
        localStorage.getItem("site") ? localStorage.getItem("site") : null
      );
      formData.append("client", client);
      formData.append("file", icon);
      dispatch(addMasterTariff(formData, history, notify));
    }
  };

  const handleGoBack = () => {
    dispatch({ type: "CLEAN_TARIFF_MASTER" });
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
          <div>
            <Typography
              variant="subtitle2"
              style={{
                paddingTop: 14,
                paddingBottom: 14,
                backgroundColor: "#243545",
                color: "#FFF",
                marginTop: 20,
                borderTopLeftRadius: 5,
                borderTopRightRadius: 5,
              }}
            >
              <Box fontWeight="fontWeightBold" m={1}>
                Upload Tariff Doc
              </Box>
            </Typography>
            <Paper className={classes.paperContainer} elevation={0}>
              <Grid container spacing={6}>
                <Grid
                  item
                  xs={12}
                  sm={6}
                  lg={3}
                  style={theme.breakpoints.down("sm") && { padding: 7}}
                  className={classes.searchMenuItemPaper}
                >
                  <Typography
                    variant="subtitle1"
                    className={classes.LabelTypography}
                  >
                    Location <span style={{ color: "red" }}>*</span>
                  </Typography>

                  <TextField
                    id="tariff-master-location"
                    select
                    value={location}
                    variant="outlined"
                    fullWidth
                    inputProps={{ className: classes.input }}
                    onChange={(e) => {
                      setlocation(e.target.value);
                    }}
                    className={classes.searchMenuItemPaper}
                    disabled={
                      (user.role === "location Admin" ||
                        user.role === "site Admin" ||
                        user.role === "Depot User") &&
                      true
                    }
                  >
                    {gateIn.allDropDown &&
                      gateIn.allDropDown.location_site_dashboard_list &&
                      Object.keys(
                        gateIn.allDropDown.location_site_dashboard_list
                      ).map((option) => (
                        <MenuItem key={option} value={option} className="Items">
                          {option}
                        </MenuItem>
                      ))}
                  </TextField>
                </Grid>
                <Grid
                  item
                  xs={12}
                  sm={6}
                  lg={3}
                  style={theme.breakpoints.down("sm") && { padding: 7 }}
                >
                  <Typography
                    variant="subtitle1"
                    className={classes.LabelTypography}
                  >
                    Site <span style={{ color: "red" }}>*</span>
                  </Typography>

                  <TextField
                    id="tariff-master-code"
                    select
                    value={site}
                    variant="outlined"
                    fullWidth
                    inputProps={{ className: classes.input }}
                    onChange={(e) => {
                      setSite(e.target.value);
                    }}
                    disabled={
                      (user.role === "site Admin" ||
                        user.role === "Depot User") &&
                      true
                    }
                  >
                    {location !== "" &&
                      gateIn.allDropDown &&
                      gateIn.allDropDown.location_site_dashboard_list &&
                      gateIn.allDropDown.location_site_dashboard_list[
                        location
                      ].map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                  </TextField>
                </Grid>

                {gateIn.allDropDown && gateIn.allDropDown.client_ref_codes && (
                  <Grid
                    item
                    xs={12}
                    sm={6}
                    lg={3}
                    style={theme.breakpoints.down("sm") && { padding: 7 }}
                  >
                    <Typography
                      variant="subtitle1"
                      className={classes.LabelTypography}
                    >
                      Client Ref Code <span style={{ color: "red" }}>*</span>
                    </Typography>
                    <Autocomplete
                      value={client}
                      onChange={(event, newValue) => {
                        setclient(newValue);
                      }}
                      style={{ padding: 0 }}
                      className={classes.autocomplete}
                      options={gateIn.allDropDown.client_ref_codes.map(
                        (option) => option
                      )}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          variant="outlined"
                          className={classes.textField}
                          onBlur={(e) => {
                            setclient(e.target.value);
                            dispatch({
                              type: gateIn.allDropDown.client_ref_codes.map(
                                (option) => (
                                  <MenuItem key={option} value={option}>
                                    {option}
                                  </MenuItem>
                                )
                              ),
                            });
                          }}
                        />
                      )}
                    />
                  </Grid>
                )}

                <Grid
                  item
                  xs={12}
                  sm={3}
                  style={theme.breakpoints.down("sm") && { padding: 7 }}
                >
                  <Typography
                    variant="subtitle1"
                    className={classes.LabelTypography}
                  >
                    Upload Document <span style={{ color: "red" }}>*</span>
                  </Typography>
                  <Button
                    className={classes.uploadButton}
                    id="tariff-master-upload"
                    component="label"
                  >
                    Choose File
                    <input
                      type="file"
                      style={{ display: "none" }}
                      id="tariff-master-upload"
                      onChange={(e) => {
                        var file = e.target.files[0];
                        if (
                          file.type ===
                          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                        )
                          setIcon(file);
                        else {
                          notify("Only XLSX/Excel can be uploaded", {
                            variant: "warning",
                          });
                        }
                      }}
                    />
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </div>
          <Grid
            style={{
              marginLeft: "auto",
              marginRight: "auto",
              width: "30%",
              marginTop: 16,
              marginBottom: 16,
            }}
          >
            <Button className={classes.button} onClick={handleDocCreation}>
              Save
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </LayoutContainer>
  );
}
