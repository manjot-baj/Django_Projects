import React, { useState, useEffect } from "react";
import {
  Typography,
  Paper,
  Grid,
  Button,
  TextField,
  Autocomplete
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import CustomTextfield from "@components/reusablecomponents/GateInTextField";
import { masterAutomation } from "../../actions/AutomationActions";
import { useSnackbar } from "notistack";
import { customLabelTypography } from "../../utils/CustomClasses";




const AutomationMaster = (props) => {
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
      <Paper  elevation={0}>
        <Grid container xs={12} style={{marginTop:"20px", padding:"15px", position:'relative', top:'30px'}}>
          <Grid item size={{xs:12,lg:2}}  ></Grid>
          <Grid item size={{xs:12,md:3}}  >
            <Typography variant="subtitle1" sx={customLabelTypography}>
             Master Name <span style={{ color: "red" }}>*</span>
            </Typography>
            <Autocomplete
                value={mastername}
                onChange={(event, newValue) => {
                  setMasterName(newValue);
                }}
                style={{ padding: 0 }}
                sx={{
                  "& .MuiAutocomplete-inputRoot[class*='MuiOutlinedInput-root']": {
                    padding: 0,
                  },
                }}
                options={masterName.map((option) => option)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
               
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
          <Grid item size={{xs:12,md:2}} ></Grid>
          
          <Grid item size={{xs:12,md:3}} >
            <Typography variant="subtitle1" sx={customLabelTypography}>
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
              variant="contained"
            color="warning"
            sx={{ width: 240, borderRadius: 2 }}
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
