import React, { useEffect, useState } from "react";
import {
  makeStyles,
  Typography,
  Paper,
  Grid,
  Box,
  Button,
} from "@material-ui/core";

import { useDispatch, useSelector } from "react-redux";
import CustomTextfield from "../../../components/reusableComponents/GateInTextField";
import { dropDownDispatch } from "../../../actions/GateInActions";
import { getCarrierCodeListings } from "../../../actions/Master/CarrierCodeMasterActions";
import { useSnackbar } from "notistack";
import { theme } from "../../../App";

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
  selectedChoice: {
    borderRadius: 5,
    color: "#fff",
    backgroundColor: "#2F6FB7",
    width: "100%",
    padding: 1,
    "&:hover": {
      backgroundColor: "#2F6FB7",
    },
  },
  LabelTypography: {
    fontSize: 14,
    fontWeight: 600,
    color: "#243545",
    paddingBottom: 4,
    [theme.breakpoints.down("sm")]: {
      // padding: "1px 4px",
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
  button2: {
    fontSize: 12.5,
    borderRadius: 6,
    marginLeft: "auto",
    marginRight: "auto",
    marginTop: 20,
    width: "35%",
    border: "1.5px solid #2A5FA5",
    boxShadow: "0px 3px 6px #9199A14D",
    backgroundColor: "#fff",
    color: "#2A5FA5",
    "&:hover": {
      backgroundColor: "#fff",
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

export default function CarrierCodeSearch() {
  const classes = useStyles();
  const dispatch = useDispatch();
  const store = useSelector((state) => state);
  const [code, setCode] = useState("");
  const notify = useSnackbar().enqueueSnackbar;

  useEffect(() => {
    let reqArray = ["location_site_dashboard_list"];

    dispatch(dropDownDispatch(reqArray, notify));
  }, []);

  const handleSearch = () => {
    let data = {
      code: code,
      location: localStorage.getItem("location")
      ? localStorage.getItem("location")
      : null,
      site: localStorage.getItem("site") ? localStorage.getItem("site") : null,
      pg_no: 1,
      on_page_data:store.stocksAndAllotmentSearch.on_page_data,
    };
    dispatch(getCarrierCodeListings(data));
  };

  return (
    <div>
      <Typography variant="subtitle2">
        <Box fontWeight="fontWeightBold" m={1}>
          Carrier Code Search
        </Box>
      </Typography>
      <Paper className={classes.paperContainer} elevation={0}>
        <Grid container spacing={3}>
          <Grid
            item
            xs={12}
            sm={4}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Code
            </Typography>

            <CustomTextfield
              id="vessel-bkg-no"
              value={code}
              handleChange={(e) => setCode(e.target.value)}
              dispatchType={"SET_MASTER_CARRIER_CODE"}
            />
          </Grid>
        </Grid>

        <Grid
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginTop: 20,
          }}
        >
          <Button className={classes.button} onClick={handleSearch}>
            Search
          </Button>
          <Button className={classes.button2}  onClick={() => window.location.reload()}>
            Reset
          </Button>
        </Grid>
      </Paper>
    </div>
  );
}
