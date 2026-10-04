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
import CustomTextfield from "@components/reusablecomponents/GateInTextField";
import { dropDownDispatch } from "../../../actions/GateInActions";

import { getLocationCodeDetailListings } from "../../../actions/master/LocationCodeDetailMasterActions";
import { useSnackbar } from "notistack";
import { theme } from "../../../App";
import { customLabelTypography } from "../../../utils/CustomClasses";

export default function VesselBkgNoSearch() {
  const dispatch = useDispatch();
  const store = useSelector((state) => state);
  const { gateIn } = store;
  const [nameCode, setNameCode] = useState("");
  const [type, setType] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");

  const notify = useSnackbar().enqueueSnackbar;

  useEffect(() => {
    let reqArray = ["arrived", "location_site_dashboard_list"];
    dispatch(dropDownDispatch(reqArray, notify));
  }, []);

  const handleSearch = () => {
    let data = {
      name_code: nameCode,
      name: name,
      code: code,
      type: type,
      pg_no: 1,
      on_page_data: store.stocksAndAllotmentSearch.on_page_data,
    };
    dispatch(getLocationCodeDetailListings(data));
  };

  return (
    <div>
      <Typography variant="subtitle2">
        <Box fontWeight="fontWeightBold" m={1}>
          Location Code Detail Search
        </Box>
      </Typography>
      <Paper
        sx={(theme) => ({
          padding: theme.spacing(2, 2),
        })}
        elevation={0}
      >
        <Grid container spacing={2}>
          <Grid item size={{ xs: 12, sm: 2 }}>
            <Typography variant="subtitle1" sx={customLabelTypography}>
              Type
            </Typography>

            <TextField
              id="location-code-detail-master-type"
              select
              value={type}
              variant="outlined"
              fullWidth
              size="small"
              onChange={(e) => {
                setType(e.target.value);
              }}
            >
              {gateIn.allDropDown &&
                gateIn.allDropDown.arrived &&
                gateIn.allDropDown.arrived.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
            </TextField>
          </Grid>
          <Grid item size={{ xs: 12, sm: 2 }}>
            <Typography variant="subtitle1" sx={customLabelTypography}>
              Name
            </Typography>

            <CustomTextfield
              id="location-code-detail-master-name"
              value={name}
              handleChange={(e) => setName(e.target.value)}
              dispatchType={"SET_MASTER_LOCATION_CODE_NAME"}
            />
          </Grid>
          <Grid item size={{ xs: 12, sm: 2 }}>
            <Typography variant="subtitle1" sx={customLabelTypography}>
              Code
            </Typography>

            <CustomTextfield
              id="location-code-detail-master-code"
              value={code}
              handleChange={(e) => setCode(e.target.value)}
              dispatchType={"SET_MASTER_LOCATION_CODE_DETAIL_CODE"}
            />
          </Grid>
          <Grid item size={{ xs: 12, sm: 2 }}>
            <Typography variant="subtitle1" sx={customLabelTypography}>
              Name Code
            </Typography>

            <CustomTextfield
              id="location-code-detail-master-name-code"
              value={nameCode}
              handleChange={(e) => setNameCode(e.target.value)}
              dispatchType={"SET_MASTER_LOCATION_CODE_DETAIL_NAME_CODE"}
            />
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
