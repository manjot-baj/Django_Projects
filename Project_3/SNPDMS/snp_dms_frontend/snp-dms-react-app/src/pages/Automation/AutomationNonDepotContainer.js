import React, { useState, useEffect } from "react";
import {
  makeStyles,
  Typography,
  Paper,
  Grid,
  Button
} from "@material-ui/core";
import { useDispatch, useSelector } from "react-redux";
import { automationNonDepotContainerDetails } from "../../actions/AutomationActions";
import { useSnackbar } from "notistack";
import CustomTextfield from "../../components/reusableComponents/GateInTextField";

const useStyles = makeStyles((theme) => ({
  LabelTypography: {
    fontSize: 14,
    fontWeight: 600,
    color: "#243545",
    paddingBottom: 4,
  },
  searchButton: {
    backgroundColor: "#2A5FA5",
    color: "#fff",
    borderRadius: "0.5rem",
    padding: "1px 4px",
    height: 40,
    width: "100%",

    "&:hover": {
      backgroundColor: "#2A5FA5",
      color: "#fff",
    },
  },
  input: {
    padding: 7,
  },
}));

const AutomationNonDepotContainer = (props) => {
  const classes = useStyles();
  const store = useSelector((state) => state);
  const dispatch = useDispatch();
  const [containers, setContainers] = useState("");
  const notify = useSnackbar().enqueueSnackbar;

  useEffect(() => {
    setContainers(store?.AutomationAllotment?.container_no);
// eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store?.AutomationAllotment]);

  return (
    <div>
      <Paper className={classes.blueBGContainer} elevation={0}>
        <Grid container spacing={6} style={{ marginTop: '30px', padding:"30px 30px" }}>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Container Number <span style={{ color: "red" }}>*</span>
            </Typography>
            <CustomTextfield
              id="allotment-container-number"
              value={containers}
              variant="outlined"
              handleChange={(e) => {
                setContainers(e.target.value);
              }}
              dispatchType={"SET_AUTOMATION_CONTAINER"}
            />
          </Grid>
        </Grid>

        <div
          style={{
            margin: "24px auto",
            width: "350px",
            display: "flex",
            justifyContent: "space-between",
            padding: "5%",
          }}
        >
          <Button
            className={classes.searchButton}
            style={{ marginRight: 16 }}
            onClick={() => {
              if(containers === ""){
                notify("Please Enter Container Number", {
                  variant: "warning",
                });
                setContainers(store?.AutomationAllotment?.containers)
              }
              else {
                let data = {
                  container_no: containers,
                  location: localStorage.getItem("location")
                    ? localStorage.getItem("location")
                    : null,
                  site: localStorage.getItem("site")
                    ? localStorage.getItem("site")
                    : null,
                };
                dispatch(automationNonDepotContainerDetails(data, notify));
              }
            }}
          >
            Delete
          </Button>
        </div>
      </Paper>
    </div>
  );
};

export default AutomationNonDepotContainer;
