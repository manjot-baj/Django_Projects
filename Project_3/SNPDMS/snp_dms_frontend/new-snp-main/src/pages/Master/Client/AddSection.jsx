import React, { useEffect, useState } from "react";
import {
  Typography,
  Paper,
  TextField,
  MenuItem,
  Grid,
  Box,
  FormControlLabel,
  Radio,
  Autocomplete,
  Tooltip,
} from "@mui/material";

import { useDispatch, useSelector } from "react-redux";
import CustomTextfield from "@components/reusablecomponents/GateInTextField";
import { dropDownDispatch } from "../../../actions/GateInActions";
import { useSnackbar } from "notistack";
import { theme } from "../../../App";
import { number } from "yup";
import { Stack } from "@mui/material";
import { customLabelTypography } from "../../../utils/CustomClasses";

export default function AddSection() {
  const dispatch = useDispatch();
  const notify = useSnackbar().enqueueSnackbar;
  const store = useSelector((state) => state);
  const { clientMaster, gateIn, user } = store;
  const [clientName, setClientName] = useState("");
  const [aliasName1, setAliasName1] = useState("");
  const [aliasName2, setAliasName2] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [type, setType] = useState("");
  const [shippingLine, setShippingLine] = useState("");
  const [officeAddress, setOfficeAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [isSez, setIsSez] = useState("");
  const [officePhone, setOfficePhone] = useState("");
  const [mobile, setMobile] = useState("");
  const [corporateEmail, setCorporateEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [fax, setFax] = useState("");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [Location, setLocation] = useState(
    localStorage.getItem("location") ? localStorage.getItem("location") : "",
  );
  const [site, setSite] = useState(
    localStorage.getItem("site") ? localStorage.getItem("site") : "",
  );
  const [refCode, setRefCode] = useState(
    clientMaster.clientDetails.client_data.pk
      ? clientMaster.clientDetails.client_data.ref_code
      : "",
  );
  // EDI SERVICE
  const [operatorCode, setOperatorCode] = useState("");
  const [currentLocationCode, setCurrentLocationCode] = useState("");
  const [locationCode, setLocationCode] = useState("");
  const [ediCode, setEdiCode] = useState("");

  const [ediFromEmailId, setEdiFromEmailId] = useState("");
  const [ediCcEmailId, setEdiCcEmailId] = useState("");
  const [reportedByFrom, setReportedByFrom] = useState("");
  const [reportedByTo, setReportedByTo] = useState("");

  useEffect(() => {
    if (clientMaster.clientDetails.client_data.pk) {
      setClientName(clientMaster.clientDetails.client_data.name);
      setAliasName1(clientMaster.clientDetails.client_data.alias_name_one);
      setAliasName2(clientMaster.clientDetails.client_data.alias_name_two);
      setIsSez(clientMaster.clientDetails.client_data.is_sez);
      setContactPerson(clientMaster.clientDetails.client_data.contact_person);
      setType(clientMaster.clientDetails.client_data.type);
      setShippingLine(clientMaster.clientDetails.client_data.shipping_line);
      setOfficeAddress(clientMaster.clientDetails.client_data.office_address);
      setCity(clientMaster.clientDetails.client_data.city);
      setState(clientMaster.clientDetails.client_data.state);
      setZip(clientMaster.clientDetails.client_data.zip);
      setOfficePhone(clientMaster.clientDetails.client_data.office_phone_no);
      setMobile(clientMaster.clientDetails.client_data.mobile_no);
      setCorporateEmail(clientMaster.clientDetails.client_data.email_id);
      setWebsite(clientMaster.clientDetails.client_data.website);
      setFax(clientMaster.clientDetails.client_data.fax);
      setDescription(
        clientMaster.clientDetails.client_data.business_description,
      );
      setNotes(clientMaster.clientDetails.client_data.notes);
      setLocation(clientMaster.clientDetails.client_data.location);
      setSite(clientMaster.clientDetails.client_data.site);
      setRefCode(clientMaster.clientDetails.client_data.ref_code);
      setOperatorCode(clientMaster.clientDetails.client_data.operator_code);
      setCurrentLocationCode(
        clientMaster.clientDetails.client_data.current_location_code,
      );
      setLocationCode(clientMaster.clientDetails.client_data.location_code);
      setEdiCode(clientMaster.clientDetails.client_data.edi_code);
      setEdiFromEmailId(clientMaster.clientDetails.client_data.edi_to_email_id);
      setEdiCcEmailId(clientMaster.clientDetails.client_data.edi_cc_email_id);
      setReportedByFrom(
        clientMaster.clientDetails.client_data.reported_by_from,
      );
      setReportedByTo(clientMaster.clientDetails.client_data.reported_by_to);
    }
  }, [clientMaster.clientDetails]);

  useEffect(() => {
    let reqArray = [
      "indian_states",
      "client_ref_codes",
      "location_site_dashboard_list",
    ];

    dispatch(dropDownDispatch(reqArray, notify));
  }, []);

  useEffect(() => {
    if (user.location)
      dispatch({
        type: "SET_MASTER_CLIENT_LOCATION",
        payload: user.location,
      });
    if (user.site)
      dispatch({
        type: "SET_MASTER_CLIENT_SITE",
        payload: user.site,
      });
  }, []);

  const handleClientNameChange = (e) => {
    const regex = /^[a-zA-Z .!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]+$/;
    if (e.target.value === "" || regex.test(e.target.value)) {
      setClientName(e.target.value);
      dispatch({ type: "SET_MASTER_CLIENT_NAME", payload: e.target.value });
    }
  };
  const handleContactPersonChange = (e) => {
    const regex = /^[a-zA-Z .]*$/;
    if (e.target.value === "" || regex.test(e.target.value)) {
      setContactPerson(e.target.value);
      dispatch({
        type: "SET_MASTER_CLIENT_CONTACT_PERSON",
        payload: e.target.value,
      });
    }
  };

  return (
    <div>
      <Typography
        variant="subtitle2"
        sx={(theme) => ({
          paddingTop: 2,
          paddingBottom: 2,
          backgroundColor: theme.palette.secondary.main,
          color: "#FFF",
          marginTop: 4,
          borderTopLeftRadius: 5,
          borderTopRightRadius: 5,
        })}
      >
        <Box fontWeight="fontWeightBold" m={1}>
          Add Client
        </Box>
      </Typography>
      <Paper
        sx={(theme) => ({
          padding: theme.spacing(2, 2),
        })}
        elevation={0}
      >
        <Grid container spacing={1}>
          <Grid
            item
            size={{ xs: 12, sm: 6, lg: 3 }}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" sx={customLabelTypography}>
              Client Name <span style={{ color: "red" }}>*</span>
            </Typography>

            <TextField
              id="client-master-name"
              type={"text"}
              value={clientName}
              variant="outlined"
              fullWidth
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: "#243545",
                  },
                },
              }}
              size="small"
              onChange={(e) => handleClientNameChange(e)}
            />
          </Grid>
          <Grid
            item
            size={{ xs: 12, sm: 6, lg: 3 }}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" sx={customLabelTypography}>
              Alias Name 1
            </Typography>

            <CustomTextfield
              id="client-master-alias-name-1"
              value={aliasName1}
              handleChange={(e) => setAliasName1(e.target.value)}
              dispatchType={"SET_MASTER_CLIENT_ALIAS_NAME_ONE"}
            />
          </Grid>
          <Grid
            item
            size={{ xs: 12, sm: 6, lg: 3 }}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" sx={customLabelTypography}>
              Alias Name 2
            </Typography>

            <CustomTextfield
              id="alias-name-2"
              value={aliasName2}
              handleChange={(e) => setAliasName2(e.target.value)}
              dispatchType={"SET_MASTER_CLIENT_ALIAS_NAME_TWO"}
            />
          </Grid>
          <Grid
            item
            size={{ xs: 12, sm: 6, lg: 3 }}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" sx={customLabelTypography}>
              Contact Person
            </Typography>
            <TextField
              id="client-master-contact-person"
              type={"text"}
              value={contactPerson}
              variant="outlined"
              fullWidth
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: "#243545",
                  },
                },
              }}
              size="small"
              onChange={(e) => handleContactPersonChange(e)}
            />
          </Grid>
          <Grid
            item
            size={{ xs: 12, sm: 6, lg: 3 }}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" sx={customLabelTypography}>
              Type <span style={{ color: "red" }}>*</span>
            </Typography>

            <TextField
              id="client-master-code"
              select
              value={type}
              variant="outlined"
              fullWidth
              size="small"
              onChange={(e) => {
                setType(e.target.value);
                dispatch({
                  type: "SET_MASTER_CLIENT_TYPE",
                  payload: e.target.value,
                });
                if (e.target.value === "Line") {
                  dispatch({
                    type: "TOGGLE_CLIENT_MASTER_IS_SEZ_CUSTOMER",
                    payload: false,
                  });
                }
              }}
            >
              <MenuItem key="Line" value="Line">
                Line
              </MenuItem>
              <MenuItem key="Party" value="Party">
                Party
              </MenuItem>
            </TextField>
          </Grid>
          {type === "Line" ? (
            <Grid
              item
              size={{ xs: 12, sm: 6, lg: 3 }}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography variant="subtitle1" sx={customLabelTypography}>
                Shipping Line
                <span style={{ color: "red" }}>*</span>
              </Typography>

              <CustomTextfield
                id="client-master-shipping-line"
                handleChange={(e) => setShippingLine(e.target.value)}
                value={shippingLine}
                dispatchType={"SET_MASTER_SHIPPING_LINE"}
              />
            </Grid>
          ) : (
            <Grid
              item
              size={{ xs: 12, sm: 6, lg: 3 }}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography variant="subtitle1" sx={customLabelTypography}>
                Shipping Line
              </Typography>

              <CustomTextfield
                id="client-master-shipping-line"
                handleChange={(e) => setShippingLine(e.target.value)}
                value={shippingLine}
                dispatchType={"SET_MASTER_SHIPPING_LINE"}
              />
            </Grid>
          )}

          <Grid
            item
            size={{ xs: 12, sm: 6, lg: 3 }}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" sx={customLabelTypography}>
              Office Address <span style={{ color: "red" }}>*</span>
            </Typography>

            <CustomTextfield
              id="client-master-office-address"
              value={officeAddress}
              handleChange={(e) => setOfficeAddress(e.target.value)}
              dispatchType={"SET_MASTER_CLIENT_OFFICE_ADDRESS"}
            />
          </Grid>
          <Grid
            item
            size={{ xs: 12, sm: 6, lg: 3 }}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" sx={customLabelTypography}>
              City
            </Typography>

            <CustomTextfield
              id="client-master-city"
              value={city}
              handleChange={(e) => setCity(e.target.value)}
              dispatchType={"SET_MASTER_CLIENT_CITY"}
            />
          </Grid>
          {gateIn.allDropDown && gateIn.allDropDown.indian_states && (
            <Grid
              item
              size={{ xs: 12, sm: 6, lg: 3 }}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography variant="subtitle1" sx={customLabelTypography}>
                State
              </Typography>
              <Autocomplete
                value={state}
                onChange={(event, newValue) => {
                  setState(newValue);
                }}
                style={{ padding: 0 }}
                sx={{
                  "& .MuiAutocomplete-inputRoot[class*='MuiOutlinedInput-root']":
                    {
                      padding: 0,
                    },
                }}
                options={gateIn.allDropDown.indian_states.map(
                  (option) => option,
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
                      setState(e.target.value);
                      dispatch({
                        type: "SET_MASTER_CLIENT_STATE",
                        payload: e.target.value,
                      });
                    }}
                    fullWidth
                  />
                )}
              />
            </Grid>
          )}

          <Grid
            item
            size={{ xs: 12, sm: 6, lg: 3 }}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" sx={customLabelTypography}>
              Zip
            </Typography>

            <CustomTextfield
              id="client-master-zip"
              value={zip}
              handleChange={(e) => setZip(e.target.value)}
              dispatchType={"SET_MASTER_CLIENT_ZIP"}
            />
          </Grid>
          <Grid
            item
            size={{ xs: 12, sm: 6, lg: 3 }}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" sx={customLabelTypography}>
              Office Phone
            </Typography>

            <CustomTextfield
              type={number}
              id="client-master-office-phone"
              value={officePhone}
              handleChange={(e) => setOfficePhone(e.target.value)}
              dispatchType={"SET_MASTER_CLIENT_OFFICE_PHONE_NO"}
            />
          </Grid>
          <Grid
            item
            size={{ xs: 12, sm: 6, lg: 3 }}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" sx={customLabelTypography}>
              Mobile
            </Typography>

            <CustomTextfield
              id="client-master-mobile"
              value={mobile}
              type="number"
              handleChange={(e) => setMobile(e.target.value)}
              dispatchType={"SET_MASTER_CLIENT_MOBILE_NO"}
            />
          </Grid>
          <Grid
            item
            size={{ xs: 12, sm: 6, lg: 3 }}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" sx={customLabelTypography}>
              Corporate email
            </Typography>

            <CustomTextfield
              id="client-master-corporate-email"
              type="email"
              value={corporateEmail}
              handleChange={(e) => setCorporateEmail(e.target.value)}
              dispatchType={"SET_MASTER_CLIENT_EMAIL"}
            />
          </Grid>
          <Grid
            item
            size={{ xs: 12, sm: 6, lg: 3 }}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" sx={customLabelTypography}>
              Website
            </Typography>

            <CustomTextfield
              id="client-master-website"
              value={website}
              handleChange={(e) => setWebsite(e.target.value)}
              dispatchType={"SET_MASTER_CLIENT_WEBSITE"}
            />
          </Grid>
          <Grid
            item
            size={{ xs: 12, sm: 6, lg: 3 }}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" sx={customLabelTypography}>
              Fax
            </Typography>

            <CustomTextfield
              id="client-master-fax"
              value={fax}
              handleChange={(e) => setFax(e.target.value)}
              dispatchType={"SET_MASTER_CLIENT_FAX"}
            />
          </Grid>
          <Grid
            item
            size={{ xs: 12, sm: 6, lg: 3 }}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" sx={customLabelTypography}>
              Description of client business
            </Typography>

            <CustomTextfield
              id="client-master-description"
              value={description}
              handleChange={(e) => setDescription(e.target.value)}
              dispatchType={"SET_MASTER_CLIENT_BUSINESS_DESC"}
            />
          </Grid>
          <Grid
            item
            size={{ xs: 12, sm: 6, lg: 3 }}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" sx={customLabelTypography}>
              Notes
            </Typography>

            <CustomTextfield
              id="client-master-notes"
              value={notes}
              handleChange={(e) => setNotes(e.target.value)}
              dispatchType={"SET_MASTER_CLIENT_NOTES"}
            />
          </Grid>
          <Grid
            item
            size={{ xs: 12, sm: 6, lg: 3 }}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" sx={customLabelTypography}>
              Location <span style={{ color: "red" }}>*</span>
            </Typography>

            <TextField
              id="client-master-location"
              select
              value={Location}
              variant="outlined"
              fullWidth
              size="small"
              onChange={(e) => {
                setLocation(e.target.value);
                dispatch({
                  type: "SET_MASTER_CLIENT_LOCATION",
                  payload: e.target.value,
                });
              }}
              disabled={
                (user.role === "Location Admin" ||
                  user.role === "Site Admin" ||
                  user.role === "Depot User") &&
                true
              }
            >
              {gateIn.allDropDown &&
                gateIn.allDropDown.location_site_dashboard_list &&
                Object.keys(
                  gateIn.allDropDown.location_site_dashboard_list,
                ).map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
            </TextField>
          </Grid>
          <Grid
            item
            size={{ xs: 12, sm: 6, lg: 3 }}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" sx={customLabelTypography}>
              Site <span style={{ color: "red" }}>*</span>
            </Typography>

            <TextField
              id="client-master-site"
              select
              value={site}
              variant="outlined"
              fullWidth
              size="small"
              onChange={(e) => {
                setSite(e.target.value);
                dispatch({
                  type: "SET_MASTER_CLIENT_SITE",
                  payload: e.target.value,
                });
              }}
              disabled={
                (user.role === "Site Admin" || user.role === "Depot User") &&
                true
              }
            >
              {Location !== "" &&
                gateIn.allDropDown &&
                gateIn.allDropDown.location_site_dashboard_list &&
                gateIn.allDropDown.location_site_dashboard_list[Location].map(
                  (option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ),
                )}
            </TextField>
          </Grid>

          <Grid
            item
            size={{ xs: 12, sm: 6, lg: 3 }}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" sx={customLabelTypography}>
              Line Reference Code
            </Typography>

            <TextField
              id="client-master-edi-ref"
              select
              value={refCode}
              variant="outlined"
              fullWidth
              size="small"
              onChange={(e) => {
                setRefCode(e.target.value);
                dispatch({
                  type: "SET_MASTER_CLIENT_REF_CODE",
                  payload: e.target.value,
                });
              }}
            >
              {gateIn.allDropDown &&
                gateIn.allDropDown.client_ref_codes &&
                gateIn.allDropDown.client_ref_codes.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
            </TextField>
          </Grid>
          <Grid
            item
            size={{ xs: 12 }}
            style={{
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",

              justifyContent: "space-between",
              padding: "2px 2px 8px 18px",
            }}
          >
            <Stack
              direction={"row"}
              alignItems={"center"}
              justifyContent={"space-between"}
              flexDirection={"row"}
            >
              <Typography variant="subtitle2">Edi Service ?</Typography>
              <FormControlLabel
                value="yes"
                style={{ marginLeft: 10 }}
                control={
                  <Radio
                    checked={clientMaster.clientDetails.client_data.edi_service}
                    onClick={() =>
                      dispatch({
                        type: "TOGGLE_CLIENT_MASTER_EDI_SERVICE",
                        payload: true,
                      })
                    }
                  />
                }
                label="Yes"
              />
              <FormControlLabel
                value="no"
                control={
                  <Radio
                    checked={
                      !clientMaster.clientDetails.client_data.edi_service
                    }
                    onClick={() =>
                      dispatch({
                        type: "TOGGLE_CLIENT_MASTER_EDI_SERVICE",
                        payload: false,
                      })
                    }
                  />
                }
                label="No"
              />
            </Stack>
            <Stack
              direction={"row"}
              alignItems={"center"}
              justifyContent={"space-between"}
              flexDirection={"row"}
            >
              <Typography variant="subtitle2" style={{ marginLeft: 5 }}>
                Sales Term ?
              </Typography>
              <FormControlLabel
                value="yes"
                style={{ marginLeft: 10 }}
                control={
                  <Radio
                    checked={clientMaster.clientDetails.client_data.sales_term}
                    onClick={() =>
                      dispatch({
                        type: "TOGGLE_CLIENT_MASTER_SALES_TERM",
                        payload: true,
                      })
                    }
                  />
                }
                label="Yes"
              />
              <FormControlLabel
                value="no"
                control={
                  <Radio
                    checked={!clientMaster.clientDetails.client_data.sales_term}
                    onClick={() =>
                      dispatch({
                        type: "TOGGLE_CLIENT_MASTER_SALES_TERM",
                        payload: false,
                      })
                    }
                  />
                }
                label="No"
              />
            </Stack>
            <Tooltip
              title={
                "Select the applicable customer type: SEZ or Non-SEZ. This option is applicable only when the customer Type is set to Party."
              }
              arrow
              slotProps={{
                tooltip: {
                  sx: {
                    bgcolor: "#1F2937", // Dark gray
                    color: "#FFFFFF",
                    fontSize: "0.8rem",
                    fontWeight: 400,
                    px: 1.5,
                    py: 1,
                    borderRadius: 1.5,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
                  },
                },
                arrow: {
                  sx: {
                    color: "#1F2937",
                  },
                },
              }}
            >
              <Stack
                direction={"row"}
                alignItems={"center"}
                justifyContent={"space-between"}
                flexDirection={"row"}
              >
                <Typography variant="subtitle2" style={{ marginLeft: 5 }}>
                  SEZ
                </Typography>
                <FormControlLabel
                  value="yes"
                  style={{ marginLeft: 10 }}
                  disabled={type === "" || type === "Line"}
                  control={
                    <Radio
                      checked={clientMaster.clientDetails.client_data.is_sez}
                      onClick={() =>
                        dispatch({
                          type: "TOGGLE_CLIENT_MASTER_IS_SEZ_CUSTOMER",
                          payload: true,
                        })
                      }
                    />
                  }
                  label="Yes"
                />
                <FormControlLabel
                  value="no"
                  disabled={type === "" || type === "Line"}
                  control={
                    <Radio
                      checked={!clientMaster.clientDetails.client_data.is_sez}
                      onClick={() =>
                        dispatch({
                          type: "TOGGLE_CLIENT_MASTER_IS_SEZ_CUSTOMER",
                          payload: false,
                        })
                      }
                    />
                  }
                  label="No"
                />
              </Stack>
            </Tooltip>
          </Grid>
          {clientMaster.clientDetails.client_data.edi_service && (
            <>
              <Grid
                item
                size={{ xs: 12, sm: 6, lg: 3 }}
                style={theme.breakpoints.down("sm") && { padding: 7 }}
              >
                <Typography variant="subtitle1" sx={customLabelTypography}>
                  Operator code
                </Typography>

                <CustomTextfield
                  id="client-master-operator-code"
                  value={operatorCode}
                  handleChange={(e) => setOperatorCode(e.target.value)}
                  dispatchType={"SET_MASTER_CLIENT_OPERATOR_CODE"}
                />
              </Grid>
              <Grid
                item
                size={{ xs: 12, sm: 6, lg: 3 }}
                style={theme.breakpoints.down("sm") && { padding: 7 }}
              >
                <Typography variant="subtitle1" sx={customLabelTypography}>
                  Current Location Code
                </Typography>

                <CustomTextfield
                  id="client-master-current-location-code"
                  value={currentLocationCode}
                  handleChange={(e) => setCurrentLocationCode(e.target.value)}
                  dispatchType={"SET_MASTER_CLIENT_CURRENT_LOCATION_CODE"}
                />
              </Grid>
              <Grid
                item
                xs={12}
                sm={6}
                lg={3}
                style={theme.breakpoints.down("sm") && { padding: 7 }}
              >
                <Typography variant="subtitle1" sx={customLabelTypography}>
                  Location code
                </Typography>

                <CustomTextfield
                  id="client-master-location-code"
                  value={locationCode}
                  handleChange={(e) => setLocationCode(e.target.value)}
                  dispatchType={"SET_MASTER_CLIENT_LOCATION_CODE"}
                />
              </Grid>
              <Grid
                item
                size={{ xs: 12, sm: 6, lg: 3 }}
                style={theme.breakpoints.down("sm") && { padding: 7 }}
              >
                <Typography variant="subtitle1" sx={customLabelTypography}>
                  EDI code
                </Typography>

                <CustomTextfield
                  id="client-master-edi-code"
                  value={ediCode}
                  handleChange={(e) => setEdiCode(e.target.value)}
                  dispatchType={"SET_MASTER_CLIENT_EDI_CODE"}
                />
              </Grid>
              <Grid
                item
                size={{ xs: 12, sm: 6, lg: 3 }}
                style={theme.breakpoints.down("sm") && { padding: 7 }}
              >
                <Typography variant="subtitle1" sx={customLabelTypography}>
                  Edi to email id (Comma Separated)
                </Typography>

                <CustomTextfield
                  id="client-master-from-email-id"
                  value={ediFromEmailId}
                  handleChange={(e) => setEdiFromEmailId(e.target.value)}
                  dispatchType={"SET_MASTER_CLIENT_EDI_FROM_EMAIL_ID"}
                />
              </Grid>
              <Grid
                item
                size={{ xs: 12, sm: 6, lg: 3 }}
                style={theme.breakpoints.down("sm") && { padding: 7 }}
              >
                <Typography variant="subtitle1" sx={customLabelTypography}>
                  Edi cc email id (Comma Separated)
                </Typography>

                <CustomTextfield
                  id="client-master-edi-cc-email-id"
                  value={ediCcEmailId}
                  handleChange={(e) => setEdiCcEmailId(e.target.value)}
                  dispatchType={"SET_MASTER_CLIENT_EDI_CC_EMAIL_ID"}
                />
              </Grid>
              <Grid
                item
                size={{ xs: 12, sm: 6, lg: 3 }}
                style={theme.breakpoints.down("sm") && { padding: 7 }}
              >
                <Typography variant="subtitle1" sx={customLabelTypography}>
                  ReportedBy From
                </Typography>

                <CustomTextfield
                  id="client-master-edi-reported-by-from"
                  value={reportedByFrom}
                  handleChange={(e) => setReportedByFrom(e.target.value)}
                  dispatchType={"SET_MASTER_CLIENT_EDI_REPORTED_BY_FROM"}
                />
              </Grid>
              <Grid
                item
                size={{ xs: 12, sm: 6, lg: 3 }}
                style={theme.breakpoints.down("sm") && { padding: 7 }}
              >
                <Typography variant="subtitle1" sx={customLabelTypography}>
                  ReportedBy To
                </Typography>

                <CustomTextfield
                  id="client-master-edi-reported-by-to"
                  value={reportedByTo}
                  handleChange={(e) => setReportedByTo(e.target.value)}
                  dispatchType={"SET_MASTER_CLIENT_EDI_REPORTED_BY_TO"}
                />
              </Grid>
            </>
          )}
        </Grid>
      </Paper>
    </div>
  );
}
