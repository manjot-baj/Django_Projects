import React, { useState, useEffect } from "react";
import {
  Typography,
  Paper,
  Grid,
  Box,
  Button,
  TextField,
  MenuItem,
  FormControlLabel,
  Radio,
  Backdrop,
  CircularProgress,
} from "@mui/material";

import { useHistory } from "react-router-dom";
import LayoutContainer from "@components/reusablecomponents/LayoutContainer";
import { useDispatch, useSelector } from "react-redux";
import { dropDownDispatch } from "../../../actions/GateInActions";
import {
  getSingleSite,
  addMasterSite,
  updateMasterSite,
} from "../../../actions/master/SiteMasterActions";
import { useSnackbar } from "notistack";
import { theme } from "../../../App";
import { Image } from "semantic-ui-react";
import { getFormDependencyListing } from "../../../actions/transportation/MasterActions";
import {
  custombackDropStyle,
  customLabelTypography,
} from "../../../utils/CustomClasses";
import BACKIMAGE from "../../../assets/images/back-arrow.png";
import { TableFootercontainer } from "@/components/TableComponent/TableComponent";

export default function AddUpdateSite(props) {
  const dispatch = useDispatch();
  const history = useHistory();
  const store = useSelector((state) => state);
  const { siteMaster, gateIn, user } = store;
  const { isloading } = useSelector((state) => state.ui);
  const [siteCode, setSiteCode] = useState("");
  const [siteName, setSiteName] = useState("");
  const [siteLocation, setSiteLocation] = useState(
    localStorage.getItem("location") ? localStorage.getItem("location") : "",
  );
  const [siteAddress, setSiteAddress] = useState("");
  const [siteContact, setSiteContact] = useState("");
  const [siteType, setSiteType] = useState("");
  const [depotCode, setDepotCode] = useState("");
  const [depotName, setDepotName] = useState("");
  const [vendorCode, setVendorCode] = useState("");
  const [vendorName, setVendorName] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankBranch, setBankBranch] = useState("");
  const [size20Rate, setSize20Rate] = useState(0);
  const [nightCharge20Rate, setNightCharge20Rate] = useState(0);
  const [size40Rate, setSize40Rate] = useState(0);
  const [nightCharge40Rate, setNightCharge40Rate] = useState(0);
  const [accountNumber, setAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [mnrModule, setMnrModule] = useState("");
  const [stateData, setStateData] = useState("");
  const [stateCode, setStateCode] = useState("");
  const [transportationModule, setTransportationModule] = useState(null);
  const [loadedYardModule, setLoadedYardModule] = useState(null);
  const [newBillingModule, setNewBillingModule] = useState(null);
  const [automaticMNRStatChange, setAutomaticMNRStatChange] = useState(null);
  const [loloFinance, setLoloFinance] = useState(null);
  const [procurementModule, setProcurementModule] = useState(null);
  const [procurementAdmin, setProcurementAdmin] = useState(null);
  const notify = useSnackbar().enqueueSnackbar;
  const stateList = useSelector(
    (state) => state.masterReducer?.masterData?.state,
  );
  useEffect(() => {
    if (stateList) {
      setStateData(stateList);
    }
  }, [stateList]);

  useEffect(() => {
    let reqArray = ["indian_states", "location_site_dashboard_list"];
    let reqBody = {
      field_list: ["state"],
      location: localStorage.getItem("location")
        ? localStorage.getItem("location")
        : null,
      site: localStorage.getItem("site") ? localStorage.getItem("site") : null,
    };
    dispatch(dropDownDispatch(reqArray, notify));
    dispatch(getFormDependencyListing(reqBody));
  }, []);

  useEffect(() => {
    if (props.history.location.state) {
      dispatch(
        getSingleSite(props.history.location.state.allDetails.pk, notify),
      );
    }
  }, []);

  useEffect(()=>{
    return ()=>dispatch({type:"GET_SINGLE_SITE_DETAILS_INIT"})
  },[])

  useEffect(() => {
    if (siteMaster.siteDetails.pk) {
      setSiteName(siteMaster.siteDetails.name);
      setSiteCode(siteMaster.siteDetails.code);
      setSiteLocation(siteMaster.siteDetails.location);
      setSiteAddress(siteMaster.siteDetails.address);
      setStateData(siteMaster.siteDetails.state);
      setStateCode(siteMaster.siteDetails.state_code);
      setSiteContact(siteMaster.siteDetails.contact);
      setSiteType(siteMaster.siteDetails.type);
      setDepotCode(siteMaster.siteDetails.depot_code);
      setDepotName(siteMaster.siteDetails.depot_name);
      setVendorCode(siteMaster.siteDetails.vendor_code);
      setVendorName(siteMaster.siteDetails.vendor_name);
      setBankBranch(siteMaster.siteDetails.bank_branch);
      setBankName(siteMaster.siteDetails.bank_name);
      setAccountNumber(siteMaster.siteDetails.bank_account_no);
      setIfscCode(siteMaster.siteDetails.ifsc_code);
      setMnrModule(siteMaster.siteDetails.mnr_module);
      setLoloFinance(siteMaster.siteDetails.lolo_finance);
      setTransportationModule(siteMaster.siteDetails.transportation_module);
      setLoadedYardModule(siteMaster.siteDetails.loaded_yard_module);
      setNewBillingModule(siteMaster.siteDetails.new_billing_module);
      setAutomaticMNRStatChange(
        siteMaster.siteDetails.automatic_mnr_status_change,
      );
      setProcurementModule(siteMaster.siteDetails.procurement_module);
      setProcurementAdmin(siteMaster.siteDetails.procurement_admin);

      if (user.role === "Admin") {
        setSize20Rate(siteMaster.siteDetails.size_20_rate);
        setSize40Rate(siteMaster.siteDetails.size_40_rate);
        setNightCharge20Rate(siteMaster.siteDetails.night_charge_size_20_rate);
        setNightCharge40Rate(siteMaster.siteDetails.night_charge_size_40_rate);
      }
    }
  }, [siteMaster.siteDetails]);

  const createSite = () => {
    if (siteName === "")
      notify("Please Enter Site Name", { variant: "warning" });
    else if (siteCode === "")
      notify("Please Enter Site Code", { variant: "warning" });
    else if (stateData === "")
      notify("Please Enter State and Code", { variant: "warning" });
    else if (stateCode === "")
      notify("Please Enter State and Code", { variant: "warning" });
    else if (siteType === "")
      notify("Please Enter Site Type", { variant: "warning" });
    else if (depotCode === "")
      notify("Please Enter Depot Code", { variant: "warning" });
    else if (depotName === "")
      notify("Please Enter Depot Name", { variant: "warning" });
    else if (vendorCode === "")
      notify("Please Enter Vendor Code", { variant: "warning" });
    else if (vendorName === "")
      notify("Please Enter Vendor Name", { variant: "warning" });
    else if (bankName === "")
      notify("Please Enter Bank Name", { variant: "warning" });
    else if (bankBranch === "")
      notify("Please Enter Bank Branch", { variant: "warning" });
    else if (accountNumber === "")
      notify("Please Enter Account Number", { variant: "warning" });
    else if (ifscCode === "")
      notify("Please Enter IFSC Code", { variant: "warning" });
    // else if (mnrModule === null)
    //   notify("Please Enter MNR Module", { variant: "warning" });
    // else if (transportationModule === null)
    //   notify("Please Enter Transportation Module", { variant: "warning" });
    // else if (loadedYardModule === null)
    //   notify("Please Enter Loaded Yard Module", { variant: "warning" });
    // else if (procurementModule === null)
    //   notify("Please Enter Procurement Module", { variant: "warning" });
    // else if (newBillingModule === null)
    //   notify("Please Enter New Billing Module", { variant: "warning" });
    else {
      let data = {
        name: siteName,
        code: siteCode,
        address: siteAddress,
        location: siteLocation,
        state_code: stateCode,
        state: stateData,
        contact: siteContact,
        type: siteType,
        depot_code: depotCode,
        depot_name: depotName,
        vendor_code: vendorCode,
        vendor_name: vendorName,
        bank_name: bankName,
        bank_account_no: accountNumber,
        bank_branch: bankBranch,
        ifsc_code: ifscCode,
        mnr_module: mnrModule,
        lolo_finance: loloFinance,
        transportation_module: transportationModule,
        loaded_yard_module: loadedYardModule,
        new_billing_module: newBillingModule,
        automatic_mnr_status_change: automaticMNRStatChange,
        procurement_module: procurementModule,
        procurement_admin: procurementAdmin,
      };
      if (user.role === "Admin") {
        data["size_20_rate"] = Number(size20Rate);
        data["size_40_rate"] = Number(size40Rate);
        data["night_charge_size_20_rate"] = Number(nightCharge20Rate);
        data["night_charge_size_40_rate"] = Number(nightCharge40Rate);
      }
      dispatch(addMasterSite(data, history, notify));
    }
  };

  const updateSite = () => {
    if (siteName === "")
      notify("Please Enter Site Name", { variant: "warning" });
    else if (siteCode === "")
      notify("Please Enter Site Code", { variant: "warning" });
    else if (stateData === "")
      notify("Please Enter State and Code", { variant: "warning" });
    else if (stateCode === "")
      notify("Please Enter State and Code", { variant: "warning" });
    else if (siteType === "")
      notify("Please Enter Site Type", { variant: "warning" });
    else if (depotCode === "")
      notify("Please Enter Depot Code", { variant: "warning" });
    else if (depotName === "")
      notify("Please Enter Depot Name", { variant: "warning" });
    else if (vendorCode === "")
      notify("Please Enter Vendor Code", { variant: "warning" });
    else if (vendorName === "")
      notify("Please Enter Vendor Name", { variant: "warning" });
    else if (bankName === "")
      notify("Please Enter Bank Name", { variant: "warning" });
    else if (bankBranch === "")
      notify("Please Enter Bank Branch", { variant: "warning" });
    else if (accountNumber === "")
      notify("Please Enter Account Number", { variant: "warning" });
    else if (ifscCode === "")
      notify("Please Enter IFSC Code", { variant: "warning" });
    else if (mnrModule === null)
      notify("Please Enter MNR Module", { variant: "warning" });
    else if (transportationModule === null)
      notify("Please Enter Transportation Module", { variant: "warning" });
    else if (loadedYardModule === null)
      notify("Please Enter Loaded Yard Module", { variant: "warning" });
    else if (procurementModule === null)
      notify("Please Enter Procurement Module", { variant: "warning" });
    else if (newBillingModule === null)
      notify("Please Enter New Billing Module", { variant: "warning" });
    else {
      let data = {
        pk: siteMaster.siteDetails.pk,
        name: siteName,
        code: siteCode,
        address: siteAddress,
        location: siteLocation,
        state: stateData,
        state_code: stateCode,
        contact: siteContact,
        type: siteType,
        depot_code: depotCode,
        depot_name: depotName,
        vendor_code: vendorCode,
        vendor_name: vendorName,
        bank_name: bankName,
        bank_account_no: accountNumber,
        bank_branch: bankBranch,
        lolo_finance: loloFinance,
        ifsc_code: ifscCode,
        mnr_module: mnrModule,
        transportation_module: transportationModule,
        loaded_yard_module: loadedYardModule,
        new_billing_module: newBillingModule,
        automatic_mnr_status_change: automaticMNRStatChange,
        procurement_module: procurementModule,
        procurement_admin: procurementAdmin,
      };
      if (user.role === "Admin") {
        data.size_20_rate = Number(size20Rate);
        data.size_40_rate = Number(size40Rate);
        data["night_charge_size_20_rate"] = Number(nightCharge20Rate);
        data["night_charge_size_40_rate"] = Number(nightCharge40Rate);
      }

      dispatch(
        updateMasterSite(siteMaster.siteDetails.pk, data, history, notify),
      );
    }
  };

  const handleGoBack = () => {
    history.goBack();
  };

  const handleSiteNameChange = (e) => {
    const regex = /^[a-zA-Z .]*$/;
    if (e.target.value === "" || regex.test(e.target.value)) {
      setSiteName(e.target.value);
    }
  };

  const handleContactChange = (e) => {
    const regex = /^[0-9\b]+$/;
    if (e.target.value === "" || regex.test(e.target.value)) {
      setSiteContact(e.target.value);
    }
  };

  const handleDepotNameChange = (e) => {
    const regex = /^[a-zA-Z\s!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]+$/;
    if (e.target.value === "" || regex.test(e.target.value)) {
      setDepotName(e.target.value);
    }
  };

  const handleVendorNameChange = (e) => {
    const regex = /^[a-zA-Z\s!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]+$/;
    if (e.target.value === "" || regex.test(e.target.value)) {
      setVendorName(e.target.value);
    }
  };

  return (
    <LayoutContainer footer={false}>
      <div>
        <Image
          src={BACKIMAGE}
          style={{
            height: 40,
            width: 40,
            marginBottom: 15,
            cursor: "pointer",
          }}
          onClick={handleGoBack}
        />
        <Typography variant="subtitle2">
          <Box fontWeight="fontWeightBold" m={1}>
            {siteMaster.siteDetails.pk ? "Update Site" : "Add Site"}
          </Box>
        </Typography>
        <Paper
          sx={(theme) => ({
            padding: theme.spacing(2, 1),
          })}
          elevation={0}
        >
          <Grid container spacing={1}>
            <Grid
              item
              size={{ xs: 12, sm: 6, lg: 4 }}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography variant="subtitle1" sx={customLabelTypography}>
                Site Name <span style={{ color: "red" }}>*</span>
              </Typography>

              <TextField
                id="site-master-name"
                type={"text"}
                value={siteName}
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
                onChange={(e) => handleSiteNameChange(e)}
              />
            </Grid>
            <Grid
              item
              size={{ xs: 12, sm: 6, lg: 4 }}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography variant="subtitle1" sx={customLabelTypography}>
                Site Code <span style={{ color: "red" }}>*</span>
              </Typography>

              <TextField
                id="site-master-code"
                type={"text"}
                value={siteCode}
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
                onChange={(e) => setSiteCode(e.target.value)}
              />
            </Grid>

            <Grid
              item
              size={{ xs: 12, sm: 6, lg: 4 }}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography variant="subtitle1" sx={customLabelTypography}>
                Location
              </Typography>
              <TextField
                id="site-master-location"
                select
                value={siteLocation}
                variant="outlined"
                fullWidth
                size="small"
                onChange={(e) => {
                  setSiteLocation(e.target.value);
                }}
                disabled={
                  (user.role === "Location Admin" ||
                    user.role === "Site Admin") &&
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
              size={{ xs: 12, sm: 6, lg: 4 }}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography variant="subtitle1" sx={customLabelTypography}>
                State <span style={{ color: "red" }}>*</span>
              </Typography>

              <TextField
                id="site-master"
                select
                value={stateData}
                defaultValue={stateData}
                variant="outlined"
                fullWidth
                size="small"
                onChange={(e) => {
                  setStateData(e.target.value);
                }}
              >
                {stateList &&
                  Object.keys(stateList).map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
              </TextField>
            </Grid>
            <Grid
              item
              size={{ xs: 12, sm: 6, lg: 4 }}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography variant="subtitle1" sx={customLabelTypography}>
                Code <span style={{ color: "red" }}>*</span>
              </Typography>

              <TextField
                id="site-master"
                select
                value={stateCode}
                defaultValue={stateCode}
                variant="outlined"
                fullWidth
                size="small"
                onChange={(e) => {
                  setStateCode(e.target.value);
                }}
              >
                {stateList && (
                  <MenuItem
                    key={stateList[stateData]}
                    value={stateList[stateData]}
                  >
                    {stateList[stateData]}
                  </MenuItem>
                )}
              </TextField>
            </Grid>

            <Grid
              item
              size={{ xs: 12, sm: 6, lg: 4 }}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography variant="subtitle1" sx={customLabelTypography}>
                Address
              </Typography>

              <TextField
                id="site-master-address"
                type={"text"}
                value={siteAddress}
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
                onChange={(e) => setSiteAddress(e.target.value)}
              />
            </Grid>

            <Grid
              item
              size={{ xs: 12, sm: 6, lg: 4 }}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography variant="subtitle1" sx={customLabelTypography}>
                Contact
              </Typography>

              <TextField
                id="site-master-contact"
                type={"text"}
                value={siteContact}
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
                onChange={(e) => handleContactChange(e)}
              />
            </Grid>

            <Grid
              item
              size={{ xs: 12, sm: 6, lg: 4 }}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography variant="subtitle1" sx={customLabelTypography}>
                Site Type <span style={{ color: "red" }}>*</span>
              </Typography>

              <TextField
                id="site-type"
                select
                value={siteType}
                variant="outlined"
                fullWidth
                size="small"
                onChange={(e) => {
                  setSiteType(e.target.value);
                  if (e.target.value === "NON DEPOT") {
                    setMnrModule("True");
                    setAutomaticMNRStatChange("True");
                    setTransportationModule("True");
                  }
                }}
              >
                <MenuItem key="DEPOT" value="DEPOT">
                  DEPOT
                </MenuItem>
                <MenuItem key="NON DEPOT" value="NON DEPOT">
                  NON DEPOT
                </MenuItem>
              </TextField>
            </Grid>

            <Grid
              item
              size={{ xs: 12, sm: 6, lg: 4 }}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography variant="subtitle1" sx={customLabelTypography}>
                Depot Code <span style={{ color: "red" }}>*</span>
              </Typography>

              <TextField
                id="site-master-depot-code"
                type={"text"}
                value={depotCode}
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
                onChange={(e) => setDepotCode(e.target.value)}
              />
            </Grid>

            <Grid
              item
              size={{ xs: 12, sm: 6, lg: 4 }}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography variant="subtitle1" sx={customLabelTypography}>
                Depot Name <span style={{ color: "red" }}>*</span>
              </Typography>

              <TextField
                id="site-master-depot-name"
                type={"text"}
                value={depotName}
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
                onChange={(e) => handleDepotNameChange(e)}
              />
            </Grid>

            <Grid
              item
              size={{ xs: 12, sm: 6, lg: 4 }}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography variant="subtitle1" sx={customLabelTypography}>
                Vendor Code <span style={{ color: "red" }}>*</span>
              </Typography>

              <TextField
                id="site-master-vendor-code"
                type={"text"}
                value={vendorCode}
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
                onChange={(e) => setVendorCode(e.target.value)}
              />
            </Grid>

            <Grid
              item
              size={{ xs: 12, sm: 6, lg: 4 }}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography variant="subtitle1" sx={customLabelTypography}>
                Vendor Name <span style={{ color: "red" }}>*</span>
              </Typography>

              <TextField
                id="site-master-vendor-name"
                type={"text"}
                value={vendorName}
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
                onChange={(e) => handleVendorNameChange(e)}
              />
            </Grid>

            <Grid
              item
              size={{ xs: 12, sm: 6, lg: 4 }}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography variant="subtitle1" sx={customLabelTypography}>
                Bank Name <span style={{ color: "red" }}>*</span>
              </Typography>

              <TextField
                id="site-master-bank-name"
                type={"text"}
                value={bankName}
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
                onChange={(e) => setBankName(e.target.value)}
              />
            </Grid>
            <Grid
              item
              size={{ xs: 12, sm: 6, lg: 4 }}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography variant="subtitle1" sx={customLabelTypography}>
                Bank Branch <span style={{ color: "red" }}>*</span>
              </Typography>

              <TextField
                id="site-master-bank-branch"
                type={"text"}
                value={bankBranch}
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
                onChange={(e) => setBankBranch(e.target.value)}
              />
            </Grid>
            <Grid
              item
              size={{ xs: 12, sm: 6, lg: 4 }}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography variant="subtitle1" sx={customLabelTypography}>
                Account Number <span style={{ color: "red" }}>*</span>
              </Typography>

              <TextField
                id="site-master-account-number"
                type={"text"}
                value={accountNumber}
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
                onChange={(e) => setAccountNumber(e.target.value)}
              />
            </Grid>
            <Grid
              item
              size={{ xs: 12, sm: 6, lg: 4 }}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography variant="subtitle1" sx={customLabelTypography}>
                IFSC Code <span style={{ color: "red" }}>*</span>
              </Typography>

              <TextField
                id="site-master-ifsc-code"
                type={"text"}
                value={ifscCode}
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
                onChange={(e) => setIfscCode(e.target.value)}
              />
            </Grid>
            {user.role === "Admin" && (
              <Grid
                item
                size={{ xs: 12, sm: 6, lg: 4 }}
                style={theme.breakpoints.down("sm") && { padding: 7 }}
              >
                <Typography variant="subtitle1" sx={customLabelTypography}>
                  Size 20 Rate
                </Typography>

                <TextField
                  id="site-master-ifsc-code"
                  type={"number"}
                  value={size20Rate}
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
                  onChange={(e) => setSize20Rate(Number(e.target.value))}
                />
              </Grid>
            )}

            {user.role === "Admin" && (
              <Grid
                item
                size={{ xs: 12, sm: 6, lg: 4 }}
                style={theme.breakpoints.down("sm") && { padding: 7 }}
              >
                <Typography variant="subtitle1" sx={customLabelTypography}>
                  Size 40 Rate
                </Typography>

                <TextField
                  id="site-master-ifsc-code"
                  type={"number"}
                  value={size40Rate}
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
                  onChange={(e) => setSize40Rate(Number(e.target.value))}
                />
              </Grid>
            )}

            {user.role === "Admin" && (
              <Grid
                item
                size={{ xs: 12, sm: 6, lg: 4 }}
                style={theme.breakpoints.down("sm") && { padding: 7 }}
              >
                <Typography variant="subtitle1" sx={customLabelTypography}>
                  Night Charge Size 20 Rate
                </Typography>

                <TextField
                  id="site-master-ifsc-code"
                  type={"number"}
                  value={nightCharge20Rate}
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
                  onChange={(e) => setNightCharge20Rate(Number(e.target.value))}
                />
              </Grid>
            )}

            {user.role === "Admin" && (
              <Grid
                item
                size={{ xs: 12, sm: 6, lg: 4 }}
                style={theme.breakpoints.down("sm") && { padding: 7 }}
              >
                <Typography variant="subtitle1" sx={customLabelTypography}>
                  Night Charge Size 40 Rate
                </Typography>

                <TextField
                  id="site-master-ifsc-code"
                  type={"number"}
                  value={nightCharge40Rate}
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
                  onChange={(e) => setNightCharge40Rate(Number(e.target.value))}
                />
              </Grid>
            )}
            <Grid
              item
              size={{ xs: 12, sm: 6, lg: 4 }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-around",
              }}
            >
              <Typography variant="subtitle2">MNR Module?</Typography>
              <FormControlLabel
                value="yes"
                control={
                  <Radio
                    color="primary"
                    checked={mnrModule === "True"}
                    onClick={() => {
                      setMnrModule("True");
                      setAutomaticMNRStatChange("True");
                      // setTransportationModule("True");
                    }}
                    sx={{
                      color: "#000", // darker unchecked color
                      "&.Mui-checked": {
                        color: "primary.main", // keep primary when selected
                      },
                    }}
                    disabled={siteType === "NON DEPOT"}
                  />
                }
                label="Yes"
              />
              <FormControlLabel
                value="no"
                control={
                  <Radio
                    sx={{
                      color: "#000", // darker unchecked color
                      "&.Mui-checked": {
                        color: "primary.main", // keep primary when selected
                      },
                    }}
                    checked={mnrModule === "False"}
                    onClick={() => {
                      setMnrModule("False");
                      setAutomaticMNRStatChange("False");
                      // setTransportationModule("False");
                    }}
                    disabled={siteType === "NON DEPOT"}
                  />
                }
                label="No"
              />
            </Grid>
            <Grid
              item
              size={{ xs: 12, sm: 6, lg: 4 }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-around",
              }}
            >
              <Typography variant="subtitle2">
                Transportation Module?
              </Typography>
              <FormControlLabel
                value="yes"
                control={
                  <Radio
                    sx={{
                      color: "#000", // darker unchecked color
                      "&.Mui-checked": {
                        color: "primary.main", // keep primary when selected
                      },
                    }}
                    checked={transportationModule === "True"}
                    onClick={() => {
                      setTransportationModule("True");
                    }}
                    disabled={
                      siteType === "NON DEPOT" &&
                      siteType === "DEPOT" &&
                      mnrModule === "False"
                    }
                  />
                }
                label="Yes"
              />
              <FormControlLabel
                value="no"
                control={
                  <Radio
                    sx={{
                      color: "#000", // darker unchecked color
                      "&.Mui-checked": {
                        color: "primary.main", // keep primary when selected
                      },
                    }}
                    checked={transportationModule === "False"}
                    onClick={() => {
                      setTransportationModule("False");
                    }}
                    disabled={
                      siteType === "NON DEPOT" &&
                      siteType === "DEPOT" &&
                      mnrModule === "False"
                    }
                  />
                }
                label="No"
              />
            </Grid>
            <Grid
              item
              size={{ xs: 12, sm: 6, lg: 4 }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-around",
              }}
            >
              <Typography variant="subtitle2">Billing Module?</Typography>
              <FormControlLabel
                value="yes"
                control={
                  <Radio
                    sx={{
                      color: "#000", // darker unchecked color
                      "&.Mui-checked": {
                        color: "primary.main", // keep primary when selected
                      },
                    }}
                    checked={newBillingModule === "True"}
                    onClick={() => {
                      setNewBillingModule("True");
                    }}
                    disabled={
                      siteType === "NON DEPOT" &&
                      siteType === "DEPOT" &&
                      mnrModule === "False"
                    }
                  />
                }
                label="Yes"
              />
              <FormControlLabel
                value="no"
                control={
                  <Radio
                    sx={{
                      color: "#000", // darker unchecked color
                      "&.Mui-checked": {
                        color: "primary.main", // keep primary when selected
                      },
                    }}
                    checked={newBillingModule === "False"}
                    onClick={() => {
                      setNewBillingModule("False");
                    }}
                    disabled={
                      siteType === "NON DEPOT" &&
                      siteType === "DEPOT" &&
                      mnrModule === "False"
                    }
                  />
                }
                label="No"
              />
            </Grid>

            <Grid
              item
              size={{ xs: 12, sm: 6, lg: 4 }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-around",
              }}
            >
              <Typography variant="subtitle2">Loaded Yard Module?</Typography>
              <FormControlLabel
                value="yes"
                control={
                  <Radio
                    sx={{
                      color: "#000", // darker unchecked color
                      "&.Mui-checked": {
                        color: "primary.main", // keep primary when selected
                      },
                    }}
                    checked={loadedYardModule === "True"}
                    onClick={() => {
                      setLoadedYardModule("True");
                    }}
                    disabled={
                      siteType === "NON DEPOT" &&
                      siteType === "DEPOT" &&
                      mnrModule === "False"
                    }
                  />
                }
                label="Yes"
              />
              <FormControlLabel
                value="no"
                control={
                  <Radio
                    sx={{
                      color: "#000", // darker unchecked color
                      "&.Mui-checked": {
                        color: "primary.main", // keep primary when selected
                      },
                    }}
                    checked={loadedYardModule === "False"}
                    onClick={() => {
                      setLoadedYardModule("False");
                    }}
                    disabled={
                      siteType === "NON DEPOT" &&
                      siteType === "DEPOT" &&
                      mnrModule === "False"
                    }
                  />
                }
                label="No"
              />
            </Grid>
            <Grid
              item
              size={{ xs: 12, sm: 6, lg: 4 }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-around",
              }}
            >
              <Typography variant="subtitle2">Procurement Module?</Typography>
              <FormControlLabel
                value="yes"
                control={
                  <Radio
                    sx={{
                      color: "#000", // darker unchecked color
                      "&.Mui-checked": {
                        color: "primary.main", // keep primary when selected
                      },
                    }}
                    checked={procurementModule === "True"}
                    onClick={() => {
                      setProcurementModule("True");
                    }}
                    disabled={
                      siteType === "NON DEPOT" &&
                      siteType === "DEPOT" &&
                      mnrModule === "False"
                    }
                  />
                }
                label="Yes"
              />
              <FormControlLabel
                value="no"
                control={
                  <Radio
                    sx={{
                      color: "#000", // darker unchecked color
                      "&.Mui-checked": {
                        color: "primary.main", // keep primary when selected
                      },
                    }}
                    checked={procurementModule === "False"}
                    onClick={() => {
                      setProcurementModule("False");
                    }}
                    disabled={
                      siteType === "NON DEPOT" &&
                      siteType === "DEPOT" &&
                      mnrModule === "False"
                    }
                  />
                }
                label="No"
              />
            </Grid>

            <Grid
              item
              size={{ xs: 12, sm: 6, lg: 4 }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-around",
              }}
            >
              <Typography variant="subtitle2">Procurement Admin</Typography>
              <FormControlLabel
                value="yes"
                control={
                  <Radio
                    sx={{
                      color: "#000", // darker unchecked color
                      "&.Mui-checked": {
                        color: "primary.main", // keep primary when selected
                      },
                    }}
                    checked={procurementAdmin === "True"}
                    onClick={() => {
                      setProcurementAdmin("True");
                    }}
                    disabled={
                      siteType === "NON DEPOT" &&
                      siteType === "DEPOT" &&
                      mnrModule === "False"
                    }
                  />
                }
                label="Yes"
              />
              <FormControlLabel
                value="no"
                control={
                  <Radio
                    sx={{
                      color: "#000", // darker unchecked color
                      "&.Mui-checked": {
                        color: "primary.main", // keep primary when selected
                      },
                    }}
                    checked={procurementAdmin === "False"}
                    onClick={() => {
                      setProcurementAdmin("False");
                    }}
                    disabled={
                      siteType === "NON DEPOT" &&
                      siteType === "DEPOT" &&
                      mnrModule === "False"
                    }
                  />
                }
                label="No"
              />
            </Grid>
            <Grid
              item
              size={{ xs: 12, sm: 6, lg: 4 }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-around",
              }}
            >
              <Typography variant="subtitle2">
                Automatic MNR Status Change?
              </Typography>
              <FormControlLabel
                value="yes"
                control={
                  <Radio
                    sx={{
                      color: "#000", // darker unchecked color
                      "&.Mui-checked": {
                        color: "primary.main", // keep primary when selected
                      },
                    }}
                    checked={automaticMNRStatChange === "True"}
                    disabled={
                      siteType === "NON DEPOT" ||
                      (siteType === "DEPOT" && mnrModule === "False")
                    }
                    onClick={() => setAutomaticMNRStatChange("True")}
                  />
                }
                label="Yes"
              />
              <FormControlLabel
                value="no"
                control={
                  <Radio
                    sx={{
                      color: "#000", // darker unchecked color
                      "&.Mui-checked": {
                        color: "primary.main", // keep primary when selected
                      },
                    }}
                    checked={automaticMNRStatChange === "False"}
                    disabled={
                      siteType === "NON DEPOT" ||
                      (siteType === "DEPOT" && mnrModule === "False")
                    }
                    onClick={() => setAutomaticMNRStatChange("False")}
                  />
                }
                label="No"
              />
            </Grid>
            <Grid
              item
              size={{ xs: 12, sm: 6, lg: 4 }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-around",
              }}
            >
              <Typography variant="subtitle2">LOLO Finance</Typography>
              <FormControlLabel
                value="yes"
                control={
                  <Radio
                    sx={{
                      color: "#000", // darker unchecked color
                      "&.Mui-checked": {
                        color: "primary.main", // keep primary when selected
                      },
                    }}
                    checked={loloFinance === "True"}
                    onClick={() => setLoloFinance("True")}
                  />
                }
                label="Yes"
              />
              <FormControlLabel
                value="no"
                control={
                  <Radio
                    sx={{
                      color: "#000", // darker unchecked color
                      "&.Mui-checked": {
                        color: "primary.main", // keep primary when selected
                      },
                    }}
                    checked={loloFinance === "False"}
                    onClick={() => setLoloFinance("False")}
                  />
                }
                label="No"
              />
            </Grid>
          </Grid>
        </Paper>
      </div>
      <Box mt={16} />
      <TableFootercontainer>
        {siteMaster.siteDetails.pk ? (
          <Button
            sx={{ width: 240 }}
            variant="contained"
            color="primary"
            onClick={updateSite}
          >
            Update
          </Button>
        ) : (
          <Button
            sx={{ width: 240 }}
            variant="contained"
            color="primary"
            onClick={createSite}
          >
            Save
          </Button>
        )}
      </TableFootercontainer>
      <Backdrop sx={custombackDropStyle} open={isloading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </LayoutContainer>
  );
}
