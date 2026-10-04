import React, { useEffect, useState } from "react";
import {
  makeStyles,
  Typography,
  Paper,
  MenuItem,
  Grid,
  Box,
  Select,
} from "@material-ui/core";
import { useDispatch } from "react-redux";
import { getAllBookingEntries } from "../../../actions/BookingAction";
import { useSnackbar } from "notistack";
import { theme } from "../../../App";
import CustomTextfield from "../../../components/reusableComponents/GateInTextField";
import { dropDownDispatch } from "../../../actions/GateInActions";
import IconButton from "@material-ui/core/IconButton";
import AddBoxIcon from "@material-ui/icons/AddBox";
import DeleteForeverIcon from "@material-ui/icons/DeleteForever";

const useStyles = makeStyles((theme) => ({
  paperContainer: {
    padding: theme.spacing(4, 3),
  },
  input: {
    padding: 7,
  },
  choice: {
    backgroundColor: "#fff",
    width: "100%",
    padding: 1,
  },
  LabelTypography: {
    fontSize: 12,
    fontWeight: 600,
    color: "#243545",
    paddingBottom: 4,
    [theme.breakpoints.down("sm")]: {
      paddingBottom: 1,
    },
  },
  autocomplete: {
    "& .MuiAutocomplete-inputRoot[class*='MuiOutlinedInput-root']": {
      padding: "0px",
      height: "30px",
    },
  },
  generalDetailsWrapper: {
    width: "100%",
    padding: "30px 20px",
    backgroundColor: "#243545",
    color: "#FFF",
  },
  actionWrapper:{
    display:'flex',
    justifyContent:"space-evenly",
  }
}));

export default function Billing(props) {
  const classes = useStyles();
  const dispatch = useDispatch();
  const [billParty, setBillParty] = useState("");
  const [companyAcc, setCompanyAcc] = useState("");
  const [category, setCategory] = useState("");
  const [number, setNumber] = useState("");
  const [typeCharges, setTypeCharges] = useState("");
  const [billAmt, setBillAmt] = useState("");
  const [advance, setAdvance] = useState("");
  const [amount, setAmount] = useState("");
  const [rcm, setRcm] = useState("");
  // const [addRow, setAddRow] = useState("");
  // const [deleteRow, setDeleteRow] = useState("");
  const notify = useSnackbar().enqueueSnackbar;

  useEffect(() => {
    let reqArray = ["client_ref_codes", "location_site_dashboard_list"];
    dispatch(dropDownDispatch(reqArray, notify));
  }, []);

  return (
    <Paper className={classes.generalDetailsWrapper}>
      <Typography variant="subtitle2">
        <Box fontWeight="fontWeightBold" m={1}>
          Billing Details
        </Box>
      </Typography>

      <Paper className={classes.paperContainer} elevation={0}>
        <Grid container xs={12} spacing={3}>
          <Grid
            item
            xs={6}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Bill/Customer Party <span style={{ color: "red" }}>*</span>
            </Typography>

            <Select
              id="billParty"
              value={billParty}
              fullWidth
              onChange={(e) => {
                setBillParty(e.target.value);
              }}
              inputProps={{
                style: {
                  padding: "0px",
                },
              }}
            >
              <MenuItem
                onClick={() => {
                  setBillParty("");
                }}
              >
                1
              </MenuItem>
            </Select>
          </Grid>
          <Grid
            item
            xs={6}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Company Account <span style={{ color: "red" }}>*</span>
            </Typography>

            <Select
              id="companyAcc"
              value={companyAcc}
              fullWidth
              onChange={(e) => {
                setCompanyAcc(e.target.value);
              }}
              inputProps={{
                style: {
                  padding: "0px",
                },
              }}
            >
              <MenuItem
                onClick={() => {
                  setCompanyAcc("");
                }}
              >
                1
              </MenuItem>
            </Select>
          </Grid>
        </Grid>
      </Paper>
      <br />
      <hr />

      <Paper className={classes.paperContainer} elevation={0}>
        <Grid container xs={12}>
          <Grid
            item
            xs={2}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Category
            </Typography>

            <Select
              id="category"
              value={category}
              fullWidth
              onChange={(e) => {
                setCategory(e.target.value);
              }}
              inputProps={{
                style: {
                  padding: "0px",
                },
              }}
            >
              <MenuItem
                onClick={() => {
                  setCategory("");
                }}
              >
                1
              </MenuItem>
            </Select>
          </Grid>
          <Grid
            item
            xs={1}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Number
            </Typography>
            <CustomTextfield
              id="number"
              value={number}
              handleChange={(e) => setNumber(e.target.value)}
              dispatchType={getAllBookingEntries.bookingNumber}
              type="number"
            />
          </Grid>
          <Grid
            item
            xs={2}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Type of charges
            </Typography>

            <Select
              id="typeCharges"
              value={typeCharges}
              fullWidth
              onChange={(e) => {
                setTypeCharges(e.target.value);
              }}
              inputProps={{
                style: {
                  padding: "0px",
                },
              }}
            >
              <MenuItem
                onClick={() => {
                  setTypeCharges("");
                }}
              >
                1
              </MenuItem>
            </Select>
          </Grid>

          <Grid
            item
            xs={1}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Bill Amt
            </Typography>
            <CustomTextfield
              id="billAmt"
              value={billAmt}
              handleChange={(e) => setBillAmt(e.target.value)}
              dispatchType={getAllBookingEntries.bookingNumber}
              type="number"
            />
          </Grid>
          <Grid
            item
            xs={1}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Advance 
            </Typography>
            <CustomTextfield
              id="advance"
              value={advance}
              handleChange={(e) => setAdvance(e.target.value)}
              dispatchType={getAllBookingEntries.bookingNumber}
              type="number"
            />
          </Grid>
          <Grid
            item
            xs={1}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Amount
            </Typography>
            <CustomTextfield
              id="amount"
              value={amount}
              handleChange={(e) => setAmount(e.target.value)}
              dispatchType={getAllBookingEntries.bookingNumber}
              type="number"
            />
          </Grid>
          <Grid
            item
            xs={2}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              RCM
            </Typography>

            <Select
              id="rcm"
              value={rcm}
              fullWidth
              onChange={(e) => {
                setRcm(e.target.value);
              }}
              inputProps={{
                style: {
                  padding: "0px",
                },
              }}
            >
              <MenuItem
                onClick={() => {
                  setRcm("");
                }}
              >
                yes
              </MenuItem>
              <MenuItem
                onClick={() => {
                  setRcm("");
                }}
              >
                No
              </MenuItem>
            </Select>
          </Grid>
          <Grid item xs={2} style={{ alignSelf: "flex-start" }}>
            <Typography variant="subtitle1" className={classes.LabelTypography} style={{textAlign:"center"}}>
              Action
            </Typography>
            <div className={classes.actionWrapper}>
              <IconButton>
                <AddBoxIcon style={{ color: "green" }} />
              </IconButton>

              <IconButton>
                <DeleteForeverIcon style={{ color: "red" }} />
              </IconButton>
            </div>
          </Grid>
        </Grid>
      </Paper>
    </Paper>
  );
}
