import React, { useEffect, useState } from "react";
import {
  makeStyles,
  Typography,
  Paper,
  Grid,
  Box,
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
    fontSize: 10,
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

export default function Vouchers(props) {
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

  const notify = useSnackbar().enqueueSnackbar;

  useEffect(() => {
    let reqArray = ["client_ref_codes", "location_site_dashboard_list"];
    dispatch(dropDownDispatch(reqArray, notify));
  }, []);

  return (
    <Paper className={classes.generalDetailsWrapper}>
      <Typography variant="subtitle2">
        <Box fontWeight="fontWeightBold" m={1}>
          Vouchers Details
        </Box>
      </Typography>
      <Paper className={classes.paperContainer} elevation={0}>
        <Grid container xs={12} spacing={0}>
         
          <Grid
            item
            xs={1}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              G.Adve No 
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
            xs={1}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              G.HandE No 
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
            xs={1}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Weight No 
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
            xs={1}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              KB.E No 
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
            xs={1}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              R.Adve No 
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
            xs={1}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Line No 
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
            xs={1}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Washing No 
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
            xs={1}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Rep.E No 
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
            xs={1}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              DieselE No 
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
            xs={1}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Hand.J No 
            </Typography>
            <CustomTextfield
              id="number"
              value={number}
              handleChange={(e) => setNumber(e.target.value)}
              dispatchType={getAllBookingEntries.bookingNumber}
              type="number"
            />
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
