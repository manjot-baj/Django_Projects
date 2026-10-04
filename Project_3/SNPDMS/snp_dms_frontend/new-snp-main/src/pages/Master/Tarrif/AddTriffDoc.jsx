import React, { useState, useEffect } from "react";
import {

  Typography,
  Paper,
  Grid,
  Box,
  Button,
  TextField,
  MenuItem,
  Autocomplete,
  Backdrop,
  CircularProgress
} from "@mui/material";

import { useHistory } from "react-router-dom";
import LayoutContainer from "@components/reusablecomponents/LayoutContainer";
import { useDispatch, useSelector } from "react-redux";
import { addMasterTariff } from "../../../actions/master/TariffTypeMasterAction";
import { dropDownDispatch } from "../../../actions/GateInActions";

import { useSnackbar } from "notistack";

import { theme } from "../../../App";
import CustomBackButton from "@components/reusablecomponents/CustomBackButton";
import { custombackDropStyle, customLabelTypography } from "../../../utils/CustomClasses";




export default function AddTriffDoc(props) {

  const dispatch = useDispatch();
  const history = useHistory();
  const store = useSelector((state) => state);
  const { gateIn, user } = store;
    const { isloading } = useSelector((state) => state.ui);
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
        <Grid item size={{xs:12}}>
        <CustomBackButton handleGoBack={handleGoBack}
        />
          <div>
            <Typography
              variant="subtitle2"
              sx={(theme)=>({
                paddingTop: 1,
                paddingBottom: 1,
                backgroundColor: theme.palette.secondary.main,
                color: "#FFF",
                marginTop: 1,
                borderTopLeftRadius: 5,
                borderTopRightRadius: 5,
              })}
            >
              <Box fontWeight="fontWeightBold" m={1}>
                Upload Tariff Doc
              </Box>
            </Typography>
            <Paper sx={(theme)=>({
          padding: theme.spacing(2, 2),
        })} elevation={0}>
              <Grid container spacing={1}>
                <Grid
                  item
                  size={{xs:12,sm:6,lg:3}}
                  style={theme.breakpoints.down("sm") && { padding: 7}}
               
                >
                  <Typography
                    variant="subtitle1"
                     sx={customLabelTypography}
                  >
                    Location <span style={{ color: "red" }}>*</span>
                  </Typography>

                  <TextField
                    id="tariff-master-location"
                    select
                    value={location}
                    variant="outlined"
                    fullWidth
                    size="small"
                    onChange={(e) => {
                      setlocation(e.target.value);
                    }}
                  
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
                  size={{xs:12,sm:6,lg:3}}
                  style={theme.breakpoints.down("sm") && { padding: 7 }}
                >
                  <Typography
                    variant="subtitle1"
                     sx={customLabelTypography}
                  >
                    Site <span style={{ color: "red" }}>*</span>
                  </Typography>

                  <TextField
                    id="tariff-master-code"
                    select
                    value={site}
                    variant="outlined"
                    fullWidth
                    size="small"
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
                    size={{xs:12,sm:6,lg:3}}
                    style={theme.breakpoints.down("sm") && { padding: 7 }}
                  >
                    <Typography
                      variant="subtitle1"
                       sx={customLabelTypography}
                    >
                      Client Ref Code <span style={{ color: "red" }}>*</span>
                    </Typography>
                    <Autocomplete
                      value={client}
                      onChange={(event, newValue) => {
                        setclient(newValue);
                      }}
                      style={{ padding: 0 }}
                      sx={{
                        "& .MuiAutocomplete-inputRoot[class*='MuiOutlinedInput-root']": {
                          padding: 0,
                          height: "35px",
                        },
                      }}
                      options={gateIn.allDropDown.client_ref_codes.map(
                        (option) => option
                      )}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          variant="outlined"
                           sx={{
                        "& .MuiOutlinedInput-root": {
                          "& fieldset": {
                            borderColor: "#243545",
                          },
                        },
                      }}
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
                  size={{xs:12,sm:3}}
              
                  style={theme.breakpoints.down("sm") && { padding: 7 }}
                >
                  <Typography
                    variant="subtitle1"
                     sx={customLabelTypography}
                  >
                    Upload Document <span style={{ color: "red" }}>*</span>
                  </Typography>
                  <Button
                    variant="contained"
              color="primary"
                    sx={{
                      fontSize: 12.5,
                      borderRadius: 2,
                    
                    }}
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

            <Button   variant="contained"
              color="primary" sx={{
                 fontSize: 12.5,
                 borderRadius: 2,
                 display:"block",
                 marginLeft: "auto",
                 marginRight: "auto",
                 marginTop: 4,
                 width: 240,
              
            }} onClick={handleDocCreation}>
              Save
            </Button>
         
        </Grid>
      </Grid>
         <Backdrop sx={custombackDropStyle} open={isloading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </LayoutContainer>
  );
}
