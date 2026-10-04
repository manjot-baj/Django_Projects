import React, { useState, useEffect } from "react";
import {
  makeStyles,
  Typography,
  Paper,
  Grid,
  Button,
  TextField,
} from "@material-ui/core";
import { useDispatch, useSelector } from "react-redux";
import CustomTextfield from "../../components/reusableComponents/GateInTextField";
import { masterAutomation } from "../../actions/AutomationActions";
import { useSnackbar } from "notistack";
import Autocomplete from "@material-ui/lab/Autocomplete";

const useStyles = makeStyles((theme) => ({
  LabelTypography: {
    fontSize: 14,
    fontWeight: 600,
    color: "#243545",
    paddingBottom: 4,
  },
  searchButton: {
    backgroundColor: "#FDBD2E",
    color: "#fff",
    borderRadius: "0.5rem",
    padding: "1px 4px",
    height: 40,
    width: "100%",

    "&:hover": {
      backgroundColor: "#FDBD2E",
      color: "#fff",
    },
  },
  autocomplete: {
    "& .MuiAutocomplete-inputRoot[class*='MuiOutlinedInput-root']": {
      padding: 0,
    },
  },
}));

const AutomationMaster = (props) => {
  const classes = useStyles();
  const store = useSelector((state) => state);
  const dispatch = useDispatch();
  const [mastername, setMasterName] = useState();
  const [name, setName] = useState("");
  const notify = useSnackbar().enqueueSnackbar;


  useEffect(() => {
    setMasterName(store?.AutomationAllotment?.master_name);
    setName(store?.AutomationAllotment?.name);
   
// eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store?.AutomationAllotment]);

  const masterName = [
    "Location","Site","Client","Country","ExportCargoType","RefCode","ContainerSize","ContainerType","Transporter","VesselBookingNumber","MNRStaff"]

  return (
    <div>
      <Paper className={classes.blueBGContainer} elevation={0}>
        <Grid container xs={12} style={{marginTop:"20px", padding:"15px", position:'relative', top:'30px'}}>
          <Grid item sm={12} md={2} ></Grid>
          <Grid item xs={12} md={3} >
            <Typography variant="subtitle1" className={classes.LabelTypography}>
             Master Name <span style={{ color: "red" }}>*</span>
            </Typography>
            <Autocomplete
                value={mastername}
                onChange={(event, newValue) => {
                  setMasterName(newValue);
                }}
                style={{ padding: 0 }}
                className={classes.autocomplete}
                options={masterName.map((option) => option)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    className={classes.textField}
                    onBlur={(e) => {
                      setMasterName(e.target.value);
                      dispatch({
                        type: "SET_AUTOMATION_MASTER_NAME",
                        payload: e.target.value,
                      });
                    }}
                    fullWidth
                  />
                )}
              />
          </Grid>
          <Grid item sm={12} md={2}></Grid>
          
          <Grid item xs={12} md={3}>
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Name <span style={{ color: "red" }}>*</span>
            </Typography>
            <CustomTextfield
              id="allotment-name"
              value={name}
              handleChange={(e) => setName(e.target.value)}
              dispatchType={"SET_AUTOMATION_NAME"}
            />
          </Grid>
        </Grid>

        <div
          style={{
            margin: "24px auto",
            width: "350px",
            display: "flex",
            justifyContent: "space-between",
            padding: "3%",
          }}
        >
          <Button
            className={classes.searchButton}
            style={{ marginRight: 16 }}
            onClick={() => {
              if (mastername === "") {
                notify("Please Enter Master Name", {
                  variant: "warning",
                });
                setMasterName(store?.AutomationAllotment?.container);
              } else if (name === "") {
                notify("Please Enter Name", {
                  variant: "warning",
                });
              } else {
                let data = {
                  master_name: mastername,
                  name: name,
                  location: localStorage.getItem("location")
                    ? localStorage.getItem("location")
                    : null,
                  site: localStorage.getItem("site")
                    ? localStorage.getItem("site")
                    : null,
                };
                dispatch(masterAutomation(data, notify));
              }
            }}
          >
            Search
          </Button>
        </div>
      </Paper>
    </div>
  );
};

export default AutomationMaster;
