import React, { useEffect, useState } from "react";
import {
  Typography,
  Paper,
  TextField,
  MenuItem,
  Grid,
  Box,
  Button,
} from "@mui/material";

import { useDispatch, useSelector } from "react-redux";
import { dropDownDispatch } from "../../../actions/GateInActions";
import { useSnackbar } from "notistack";
import { getStaffMasterListing } from "../../../actions/master/StaffMasterAction";
import { theme } from "../../../App";
import { customLabelTypography } from "../../../utils/CustomClasses";

export default function StaffMasterSearch() {
  const dispatch = useDispatch();
  const [role, setRole] = useState("");

  const store = useSelector((state) => state);
  const { user } = store;
  // eslint-disable-next-line no-unused-vars
  const [Location, setLocation] = useState(user.location ? user.location : "");
  // eslint-disable-next-line no-unused-vars
  const [site, setSite] = useState(user.site ? user.site : "");
  const notify = useSnackbar().enqueueSnackbar;

  useEffect(() => {
    let reqArray = ["location_site_dashboard_list"];
    dispatch(dropDownDispatch(reqArray, notify));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = () => {
    let data = {
      role: role,
      location: Location,
      site: site,
    };
    dispatch(getStaffMasterListing(data));
  };

  return (
    <div>
      <Typography variant="subtitle2">
        <Box fontWeight="fontWeightBold" m={1}>
          Staff Master Search
        </Box>
      </Typography>
      <Paper
        sx={(theme) => ({
          padding: theme.spacing(2, 2),
        })}
        elevation={0}
      >
        <Grid container spacing={2}>
          <Grid item size={{ xs: 4 }}>
            <Typography variant="subtitle1" sx={customLabelTypography}>
              Role
            </Typography>

            <TextField
              id="staff-master-role"
              select
              value={role}
              variant="outlined"
              fullWidth
              size="small"
              onChange={(e) => {
                setRole(e.target.value);
              }}
              disabled={
                (user.role === "Location Admin" ||
                  user.role === "Site Admin" ||
                  user.role === "Depot User") &&
                true
              }
            >
              <MenuItem key="Surveyor" value="Surveyor">
                Surveyor
              </MenuItem>
              <MenuItem key="Edp" value="Edp">
                Edp
              </MenuItem>
              <MenuItem key="Worker" value="Worker">
                Worker
              </MenuItem>
            </TextField>
          </Grid>
          <Grid
            item
            size={{ xs: 4 }}
            sx={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "flex-start",
              gap: 2,
            }}
          >
            <Button
              variant="contained"
              color="warning"

              onClick={handleSearch}
            >
              Search
            </Button>
            <Button
              variant="outlined"
              color="primary"

              onClick={() => window.location.reload()}
            >
              Reset
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </div>
  );
}
