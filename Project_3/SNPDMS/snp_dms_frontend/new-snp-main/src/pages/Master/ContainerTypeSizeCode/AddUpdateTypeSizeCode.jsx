import React, { useState, useEffect } from "react";
import {
  Typography,
  Paper,
  Grid,
  Box,
  Button,
  TextField,
  MenuItem,
  Autocomplete,
  Backdrop,
  CircularProgress,
} from "@mui/material";

import { useHistory } from "react-router-dom";
import LayoutContainer from "@components/reusablecomponents/LayoutContainer";
import { useDispatch, useSelector } from "react-redux";
import { dropDownDispatch } from "../../../actions/GateInActions";
import {
  addMasterContainerTypeSizeCode,
  getSingleContainerTypeSizeCode,
  updateMasterContainerTypeSizeCode,
} from "../../../actions/master/ContainerTypeSizeMasterActions";
import { useSnackbar } from "notistack";
import { theme } from "../../../App";
import { custombackDropStyle, customLabelTypography } from "../../../utils/CustomClasses";
import CustomBackButton from "@components/reusablecomponents/CustomBackButton";

export default function AddUpdateContainerTypeSizeCode(props) {
  const dispatch = useDispatch();
  const history = useHistory();
  const store = useSelector((state) => state);
  const { isloading } = useSelector((state) => state.ui);
  const { containerTypeSizeCodeMaster, gateIn } = store;
  const [containerCode, setContainerCode] = useState("");
  const [containerType, setContainerType] = useState("");
  const [containerSize, setContainerSize] = useState("");
  const notify = useSnackbar().enqueueSnackbar;

  useEffect(() => {
    if (props.history.location.state) {
      dispatch(
        getSingleContainerTypeSizeCode(
          props.history.location.state.allDetails.pk,
          notify,
        ),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (containerTypeSizeCodeMaster.containerTypeSizeCodeDetails.pk) {
      setContainerCode(
        containerTypeSizeCodeMaster.containerTypeSizeCodeDetails.code,
      );
      setContainerType(
        containerTypeSizeCodeMaster.containerTypeSizeCodeDetails.type,
      );
      setContainerSize(
        containerTypeSizeCodeMaster.containerTypeSizeCodeDetails.size,
      );
    }
  }, [containerTypeSizeCodeMaster.containerTypeSizeCodeDetails]);

  useEffect(() => {
    let reqArray = ["type_data", "size_data"];

    dispatch(dropDownDispatch(reqArray, notify));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createContainerType = () => {
    if (containerCode === "")
      notify("Please Enter Container Code", { variant: "warning" });
    // else if (isNaN(containerCode)) alert("Container Code should be Numeric");
    else if (containerSize === "")
      notify("Please Enter Container Size", { variant: "warning" });
    else if (containerType === "")
      notify("Please Enter Container Type", { variant: "warning" });
    else {
      let data = {
        code: containerCode,
        type: containerType,
        size: containerSize,
      };
      dispatch(addMasterContainerTypeSizeCode(data, history, notify));
    }
  };

  const updateContainerType = () => {
    if (containerCode === "")
      notify("Please Enter Container Code", { variant: "warning" });
    // else if (isNaN(containerCode)) alert("Container Code should be Numeric");
    else if (containerSize === "")
      notify("Please Enter Container Size", { variant: "warning" });
    else if (containerType === "")
      notify("Please Enter Container Type", { variant: "warning" });
    else {
      let data = {
        pk: containerTypeSizeCodeMaster.containerTypeSizeCodeDetails.pk,
        code: containerCode,
        type: containerType,
        size: containerSize,
      };
      dispatch(
        updateMasterContainerTypeSizeCode(
          containerTypeSizeCodeMaster.containerTypeSizeCodeDetails.pk,
          data,
          history,
          notify,
        ),
      );
    }
  };

  const handleGoBack = () => {
    history.goBack();
  };

  return (
    <LayoutContainer footer={false}>
      <div>
        <CustomBackButton handleGoBack={handleGoBack} />
        <Typography variant="subtitle2">
          <Box fontWeight="fontWeightBold" m={1}>
            {containerTypeSizeCodeMaster.containerTypeSizeCodeDetails.pk
              ? "Update Container Type Size Code"
              : "Add Container Type Size Code"}
          </Box>
        </Typography>
        <Paper
          sx={(theme) => ({
            padding: theme.spacing(2, 2),
          })}
          elevation={0}
        >
          <Grid container spacing={1} alignItems="center" justify="center">
            <Grid
              item
              size={{ xs: 12, sm: 4 }}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography variant="subtitle1" sx={customLabelTypography}>
                Container Code <span style={{ color: "red" }}>*</span>
              </Typography>

              <TextField
                id="container-type-size-code-master-code"
                type={"text"}
                value={containerCode}
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
                onChange={(e) => setContainerCode(e.target.value)}
              />
            </Grid>

            {gateIn.allDropDown && gateIn.allDropDown.type_data && (
              <Grid
                item
                size={{ xs: 12, sm: 4 }}
                style={theme.breakpoints.down("sm") && { padding: 7 }}
              >
                <Typography variant="subtitle1" sx={customLabelTypography}>
                  Container Type <span style={{ color: "red" }}>*</span>
                </Typography>
                <Autocomplete
                  value={containerType}
                  onChange={(event, newValue) => {
                    setContainerType(newValue);
                  }}
                  style={{ padding: 0 }}
                  sx={{
                    "& .MuiAutocomplete-inputRoot[class*='MuiOutlinedInput-root']":
                      {
                        padding: 0,
                      },
                  }}
                  options={gateIn.allDropDown.type_data.map(
                    (option) => option.name,
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          "& fieldset": {
                            borderColor: "#243545",
                          },
                        },
                      }}
                      onBlur={(e) => {
                        setContainerType(e.target.value);
                        dispatch({
                          type: gateIn.allDropDown.type_data.map((option) => (
                            <MenuItem key={option} value={option}>
                              {option}
                            </MenuItem>
                          )),
                        });
                      }}
                      fullWidth
                    />
                  )}
                />
              </Grid>
            )}

            <Grid
              item
              size={{ xs: 12, sm: 4 }}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography variant="subtitle1" sx={customLabelTypography}>
                Container Size <span style={{ color: "red" }}>*</span>
              </Typography>

              <TextField
                id="container-type-size-code-master-size"
                select
                value={containerSize}
                variant="outlined"
                fullWidth
                size="small"
                onChange={(e) => {
                  setContainerSize(e.target.value);
                }}
              >
                {gateIn.allDropDown &&
                  gateIn.allDropDown.size_data &&
                  gateIn.allDropDown.size_data.map((option) => (
                    <MenuItem key={option.name} value={option.name}>
                      {option.name}
                    </MenuItem>
                  ))}
              </TextField>
            </Grid>
          </Grid>

          <Grid
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginTop: 4,
            }}
          >
            {containerTypeSizeCodeMaster.containerTypeSizeCodeDetails.pk ? (
              <Button
                variant="contained"
                color="primary"
                sx={{
                  fontSize: 12.5,
                  borderRadius: 2,
                  marginLeft: "auto",
                  marginRight: "auto",
                  marginTop: 4,
                  width: "30%",
                }}
                onClick={updateContainerType}
              >
                Update
              </Button>
            ) : (
              <Button
                variant="contained"
                color="primary"
                sx={{
                  fontSize: 12.5,
                  borderRadius: 2,
                  marginLeft: "auto",
                  marginRight: "auto",
                  marginTop: 4,
                  width: "30%",
                }}
                onClick={createContainerType}
              >
                Save
              </Button>
            )}
          </Grid>
        </Paper>
      </div>
            <Backdrop sx={custombackDropStyle} open={isloading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </LayoutContainer>
  );
}
