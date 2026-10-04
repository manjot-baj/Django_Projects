import React, { useState, useEffect } from "react";
import { Typography, Paper, Grid, Button, Box } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { automationNonDepotContainerDetails } from "../../actions/AutomationActions";
import { useSnackbar } from "notistack";
import CustomTextfield from "@components/reusablecomponents/GateInTextField";
import { customLabelTypography } from "../../utils/CustomClasses";

const AutomationNonDepotContainer = (props) => {
  const store = useSelector((state) => state);
  const dispatch = useDispatch();
  const [containers, setContainers] = useState("");
  const notify = useSnackbar().enqueueSnackbar;

  useEffect(() => {
    setContainers(store?.AutomationAllotment?.container_no);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store?.AutomationAllotment]);

  return (
    <Box
      sx={{
        paddingX: 1,
      }}
    >
      <Paper elevation={0}>
        <Grid
          container
          spacing={1}
          style={{ marginTop: "30px", padding: "30px 30px" }}
        >
          <Grid item size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography variant="subtitle1" sx={customLabelTypography}>
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

        <Box
          sx={(theme) => ({
            margin: "24px auto",
            width: "350px",
            display: "flex",
            justifyContent: "space-between",
            padding: "5%",
            [theme.breakpoints.down("sm")]: {
              padding: 2,
              margin: "2px auto",
            },
          })}
        >
          <Button
               variant="contained"
            color="error"
            sx={{ width: 240, borderRadius: 2 }}
            style={{ marginRight: 16 }}
            onClick={() => {
              if (containers === "") {
                notify("Please Enter Container Number", {
                  variant: "warning",
                });
                setContainers(store?.AutomationAllotment?.containers);
              } else {
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
        </Box>
      </Paper>
    </Box>
  );
};

export default AutomationNonDepotContainer;
