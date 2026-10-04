import React, { useEffect, useState } from "react";
import {
  makeStyles,
  Typography,
  Paper,
  TextField,
  MenuItem,
  Grid,
  Box,
  FormControlLabel,
  Radio,
} from "@material-ui/core";

import { useDispatch, useSelector } from "react-redux";
import CustomTextfield from "../../../components/reusableComponents/GateInTextField";
import { dropDownDispatch } from "../../../actions/GateInActions";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { useSnackbar } from "notistack";
import { theme } from "../../../App";
import { number } from "yup";
import { Stack } from "@mui/material";

const useStyles = makeStyles((theme) => ({
  paperContainer: {
    padding: theme.spacing(4, 3),
  },
  input: {
    padding: 7,
  },
  choiceSelectContainer: {
    border: "1px solid #243545",
    marginTop: "0rem",
    display: "flex",
    borderRadius: 6,
  },
  choice: {
    backgroundColor: "#fff",
    width: "100%",
    padding: 1,
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
  autocomplete: {
    "& .MuiAutocomplete-inputRoot[class*='MuiOutlinedInput-root']": {
      padding: 0,
    },
  },
  textField: {
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        borderColor: "#243545",
      },
    },
  },
}));

export default function AddSection() {
  const classes = useStyles();
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
  const [officePhone, setOfficePhone] = useState("");
  const [mobile, setMobile] = useState("");
  const [corporateEmail, setCorporateEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [fax, setFax] = useState("");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [Location, setLocation] = useState(
    localStorage.getItem("location") ? localStorage.getItem("location") : ""
  );
  const [site, setSite] = useState(
    localStorage.getItem("site") ? localStorage.getItem("site") : ""
  );
  const [refCode, setRefCode] = useState(
    clientMaster.clientDetails.client_data.pk
      ? clientMaster.clientDetails.client_data.ref_code
      : ""
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
        clientMaster.clientDetails.client_data.business_description
      );
      setNotes(clientMaster.clientDetails.client_data.notes);
      setLocation(clientMaster.clientDetails.client_data.location);
      setSite(clientMaster.clientDetails.client_data.site);
      setRefCode(clientMaster.clientDetails.client_data.ref_code);
      setOperatorCode(clientMaster.clientDetails.client_data.operator_code);
      setCurrentLocationCode(
        clientMaster.clientDetails.client_data.current_location_code
      );
      setLocationCode(clientMaster.clientDetails.client_data.location_code);
      setEdiCode(clientMaster.clientDetails.client_data.edi_code);
      setEdiFromEmailId(clientMaster.clientDetails.client_data.edi_to_email_id);
      setEdiCcEmailId(clientMaster.clientDetails.client_data.edi_cc_email_id);
      setReportedByFrom(
        clientMaster.clientDetails.client_data.reported_by_from
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
        style={{
          paddingTop: 14,
          paddingBottom: 14,
          backgroundColor: "#243545",
          color: "#FFF",
          marginTop: 10,
          borderTopLeftRadius: 5,
          borderTopRightRadius: 5,
        }}
      >
        <Box fontWeight="fontWeightBold" m={1}>
          Add Client
        </Box>
      </Typography>
      <Paper className={classes.paperContainer} elevation={0}>
        <Grid container spacing={3}>
          <Grid
            item
            xs={12}
            sm={6}
            lg={3}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Client Name <span style={{ color: "red" }}>*</span>
            </Typography>

            <TextField
              id="client-master-name"
              type={"text"}
              value={clientName}
              variant="outlined"
              fullWidth
              className={classes.textField}
              inputProps={{ className: classes.input }}
              onChange={(e) => handleClientNameChange(e)}
            />
          </Grid>
          <Grid
            item
            xs={12}
            sm={6}
            lg={3}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" className={classes.LabelTypography}>
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
            xs={12}
            sm={6}
            lg={3}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" className={classes.LabelTypography}>
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
            xs={12}
            sm={6}
            lg={3}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Contact Person
            </Typography>
            <TextField
              id="client-master-contact-person"
              type={"text"}
              value={contactPerson}
              variant="outlined"
              fullWidth
              className={classes.textField}
              inputProps={{ className: classes.input }}
              onChange={(e) => handleContactPersonChange(e)}
            />
          </Grid>
          <Grid
            item
            xs={12}
            sm={6}
            lg={3}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Type <span style={{ color: "red" }}>*</span>
            </Typography>

            <TextField
              id="client-master-code"
              select
              value={type}
              variant="outlined"
              fullWidth
              inputProps={{ className: classes.input }}
              onChange={(e) => {
                setType(e.target.value);
                dispatch({
                  type: "SET_MASTER_CLIENT_TYPE",
                  payload: e.target.value,
                });
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
              xs={12}
              sm={6}
              lg={3}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
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
              xs={12}
              sm={6}
              lg={3}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
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
            xs={12}
            sm={6}
            lg={3}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" className={classes.LabelTypography}>
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
            xs={12}
            sm={6}
            lg={3}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" className={classes.LabelTypography}>
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
              xs={12}
              sm={6}
              lg={3}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                State
              </Typography>
              <Autocomplete
                value={state}
                onChange={(event, newValue) => {
                  setState(newValue);
                }}
                style={{ padding: 0 }}
                className={classes.autocomplete}
                options={gateIn.allDropDown.indian_states.map(
                  (option) => option
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    className={classes.textField}
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
            xs={12}
            sm={6}
            lg={3}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" className={classes.LabelTypography}>
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
            xs={12}
            sm={6}
            lg={3}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" className={classes.LabelTypography}>
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
            xs={12}
            sm={6}
            lg={3}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" className={classes.LabelTypography}>
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
            xs={12}
            sm={6}
            lg={3}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" className={classes.LabelTypography}>
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
            xs={12}
            sm={6}
            lg={3}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" className={classes.LabelTypography}>
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
            xs={12}
            sm={6}
            lg={3}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" className={classes.LabelTypography}>
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
            xs={12}
            sm={6}
            lg={3}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" className={classes.LabelTypography}>
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
            xs={12}
            sm={6}
            lg={3}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" className={classes.LabelTypography}>
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
            xs={12}
            sm={6}
            lg={3}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Location <span style={{ color: "red" }}>*</span>
            </Typography>

            <TextField
              id="client-master-location"
              select
              value={Location}
              variant="outlined"
              fullWidth
              inputProps={{ className: classes.input }}
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
                  gateIn.allDropDown.location_site_dashboard_list
                ).map((option) => (
                  <MenuItem key={option} value={option}>
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
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Site <span style={{ color: "red" }}>*</span>
            </Typography>

            <TextField
              id="client-master-site"
              select
              value={site}
              variant="outlined"
              fullWidth
              inputProps={{ className: classes.input }}
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
                  )
                )}
            </TextField>
          </Grid>

          <Grid
            item
            xs={12}
            sm={6}
            lg={3}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Line Reference Code
            </Typography>

            <TextField
              id="client-master-edi-ref"
              select
              value={refCode}
              variant="outlined"
              fullWidth
              inputProps={{ className: classes.input }}
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
            xs={12}
            style={{
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
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
                    style={{ color: "#2F6FB7" }}
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
                    style={{ color: "#2F6FB7" }}
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
            <Stack  direction={"row"}
              alignItems={"center"}
              justifyContent={"space-between"}
              flexDirection={"row"}>
              <Typography variant="subtitle2" style={{ marginLeft: 5 }}>
                Sales Term ?
              </Typography>
              <FormControlLabel
                value="yes"
                style={{ marginLeft: 10 }}
                control={
                  <Radio
                    style={{ color: "#2F6FB7" }}
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
                    style={{ color: "#2F6FB7" }}
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
          </Grid>
          {clientMaster.clientDetails.client_data.edi_service && (
            <>
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
                xs={12}
                sm={6}
                lg={3}
                style={theme.breakpoints.down("sm") && { padding: 7 }}
              >
                <Typography
                  variant="subtitle1"
                  className={classes.LabelTypography}
                >
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
                <Typography
                  variant="subtitle1"
                  className={classes.LabelTypography}
                >
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
                xs={12}
                sm={6}
                lg={3}
                style={theme.breakpoints.down("sm") && { padding: 7 }}
              >
                <Typography
                  variant="subtitle1"
                  className={classes.LabelTypography}
                >
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
                xs={12}
                sm={6}
                lg={3}
                style={theme.breakpoints.down("sm") && { padding: 7 }}
              >
                <Typography
                  variant="subtitle1"
                  className={classes.LabelTypography}
                >
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
                xs={12}
                sm={6}
                lg={3}
                style={theme.breakpoints.down("sm") && { padding: 7 }}
              >
                <Typography
                  variant="subtitle1"
                  className={classes.LabelTypography}
                >
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
                xs={12}
                sm={6}
                lg={3}
                style={theme.breakpoints.down("sm") && { padding: 7 }}
              >
                <Typography
                  variant="subtitle1"
                  className={classes.LabelTypography}
                >
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
                xs={12}
                sm={6}
                lg={3}
                style={theme.breakpoints.down("sm") && { padding: 7 }}
              >
                <Typography
                  variant="subtitle1"
                  className={classes.LabelTypography}
                >
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
