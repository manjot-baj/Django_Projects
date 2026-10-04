import {
  Box,
  Button,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
  makeStyles,
} from "@material-ui/core";
import { Stack } from "@mui/material";
import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { useDispatch, useSelector } from "react-redux";
import { ADVANCE_FINANCE_CONSTANT } from "../../reducers/AdvanceFinance/AdvanceFinanceReducer";
import { theme } from "../../App";
import {
  handleContainerNumberChangeUtils,
  handleContainerNumberOnBlurUtils,
} from "../../utils/Utils";
import { useSnackbar } from "notistack";
import DatePickerField from "@components/reusablecomponents/DatePickerField";
import { handleDateChangeUTILSDispatch } from "../../utils/WeekNumbre";
import PreGateOutList from "../../components/advanceFinance/PreGateOutList";
import {
  addPreGateOutDataAction,
  getPreGateOutPreFillAction,
  updatePreGateOutDataAction,
} from "../../actions/AdvanceFinance/AdvanceFinanceAction";
import GateInTextField from "@components/reusablecomponents/GateInTextField";

const useStyles = makeStyles((theme) => ({
  preGateOutSearch: {
    padding: theme.spacing(2),
    borderRadius: 8,
    elevation: "none",
    backgroundColor: theme.palette.background.paper,
    margin: "12px 12px 12px 0",
    width: "100%",
  },
  containerDetails: {
    padding: theme.spacing(2),
    borderRadius: 10,
    backgroundColor: theme.palette.background.paper,
    margin: "auto",
    marginTop: "8px",
  },
  textField: {
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        borderColor: "#243545",
      },
    },
  },
  choiceSelectContainer: {
    border: "1px solid #243545",
    marginTop: "0rem",
    display: "flex",
    borderRadius: 6,
  },
  input: {
    padding: 7,
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
      paddingBottom: 1,
    },
  },
  bulkUploadButton: {
    backgroundColor: "#2ac08f",
    color: "#fff",
    padding: "10px 20px",
    borderRadius: 5,
    fontWeight: 600,
    fontSize: "12px",
  },

  textField: {
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        borderColor: "#243545",
      },
    },
  },
  input: {
    padding: 7,
  },
  searchBox: {
    backgroundColor: "rgb(223,230,236)",
    borderRadius: 8,
    padding: 8,
    width: "100%",
  },
  searchContainerButton: {
    backgroundColor: "rgb(253,189,46)",
  },
  addPreGateOut: {
    width: "200px",
    margin: "auto",
    display: "block",
  },
}));

const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: "300px",
      marginTop: 50,
    },
  },
};

const PreGateOut = () => {
  const history = useHistory();
  const classes = useStyles();
  const dispatch = useDispatch();
  const notify = useSnackbar().enqueueSnackbar;
  const { gateIn } = useSelector((state) => state);
  const { preGateOutEdit ,preGateOutTable} = useSelector(
    (state) => state.AdvanceFinanceReducer
  );
  const [selectedContainer, setSelectedContainer] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    dispatch({
      type: ADVANCE_FINANCE_CONSTANT.PRE_GATE_OUT_EDIT,
      [name]: value,
    });
  };

  const handleSearchContainer = () => {
    if (selectedContainer) {
      dispatch(getPreGateOutPreFillAction(selectedContainer, notify));
    } else {
      notify("Please select a container", { variant: "error" });
    }
  };

  const handleAddPreGateOut = () => {
    if (preGateOutEdit.do_validity_out_date === "") {
      notify("Please Enter Valisity Date", { variant: "warning" });
    } else if (preGateOutEdit.container_no === "") {
      notify("Please Enter Container No", { variant: "warning" });
    } else if (preGateOutEdit.do_validity_out_time === "") {
      notify("Please Enter Validity Time", { variant: "warning" });
    } else if (preGateOutEdit.bk_no === "") {
      notify("Please Enter BK No", { variant: "warning" });
    } else if (preGateOutEdit.departed ===""){
      notify("Please Choose Departed Status ",{ variant: "warning" });
    } else {
      dispatch(addPreGateOutDataAction(notify));
    }
  };

 


  const handleUpdatePreGateOut = () => {
    if (preGateOutEdit.client === "") {
      notify("Please Fill Client", { variant: "warning" });
    } else if (preGateOutEdit.type === "") {
      notify("Please Fill Type", { variant: "warning" });
    } else if (preGateOutEdit.size === "") {
      notify("Please Fill Size", { variant: "warning" });
    } else if (preGateOutEdit.container_no === "") {
      notify("Please Fill Container No", { variant: "warning" });
    } else if (preGateOutEdit.shipping_line === "") {
      notify("Please Fill Shipping Line", { variant: "warning" });
    } else if (preGateOutEdit.bl_no === "") {
      notify("Please Fill BL No", { variant: "warning" });
    } else if (preGateOutEdit.do_validity_in_date === "") {
      notify("Please Fill  Validity In Date", { variant: "warning" });
    } else if (preGateOutEdit.do_validity_in_time === "") {
      notify("Please Fill  Validity In Time", { variant: "warning" });
    } else if (preGateOutEdit.departed ===""){
      notify("Please Choose Departed Status",{variant:"warning"})
    } else {
      dispatch(updatePreGateOutDataAction(notify));
    }
  };

  return (
    <Box>
      <Grid
        container
        spacing={4}
        component={Paper}
        className={classes.preGateOutSearch}
        elevation={0}
      >
        <Grid item sm={3}>
          <FormControl
            variant="standard"
            style={{ margin: "0 8px", marginTop: "-15px" }}
          >
            <InputLabel
              id="container_list_select_label"
              style={{
                color: "grey",
                zIndex: 10,
                fontSize: "15px",
                textAlign: "center",
                padding: "0 10px",
              }}
            >
              Available Containers
            </InputLabel>
            <Select
              // value={ServeyorReducer.data.client}
              id="=container_list_select"
              labelId="container_list_select_label"
              name="client"
              label="Available Containers"
              variant="standard"
              inputProps={{
                style: {
                  padding: "0px",
                  marginTop: "-10px",
                },
              }}
              style={{
                width: "250px",
                backgroundColor: "white",
                borderRadius: "5px",
              }}
            >
              {preGateOutTable?.preGateOutDropdown?.current_pregate_out_available_container_list.map(
                (val) => (
                  <MenuItem
                    key={val}
                    value={val}
                    onClick={() => setSelectedContainer(val)}
                    // onClick={() => dispatch(ContainerPreGateInGetAction(val,notify))}
                  >
                    {val}
                  </MenuItem>
                )
              )}
            </Select>
          </FormControl>
        </Grid>
        <Grid item sm={6}>
          <Box className={classes.searchBox} ml={2}>
            {selectedContainer === "" ? (
              <Typography
                variant="subtitle2"
                style={{ color: "rgba(0,0,0,0.5)" }}
              >
                Select from Available Container List{" "}
              </Typography>
            ) : (
              <Typography variant="subtitle2">{selectedContainer}</Typography>
            )}
          </Box>
        </Grid>
        <Grid item sm={3}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSearchContainer}
            fullWidth
            className={classes.searchContainerButton}
          >
            Search
          </Button>
        </Grid>
      </Grid>

      <Stack
        direction={"row"}
        alignItems={"center"}
        justifyContent={"space-between"}
        spacing={4}
      >
        <Typography variant="subtitle2">Add Pre Gate Out</Typography>

        <Button
          variant="contained"
          color="primary"
          onClick={() => history.go(0)}
          style={{ width: "150px" }}
          startIcon={<AddCircleOutlineIcon />}
        >
          New{" "}
        </Button>
        <Typography></Typography>
      </Stack>
      <Paper className={classes.containerDetails} elevation={0}>
        <Grid container spacing={3}>
          <Grid
            item
            xs={12}
            sm={6}
            lg={3}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Client Name <span style={{ color: "red" }}>*</span>
            </Typography>
            <GateInTextField readOnlyP={true} value={preGateOutEdit.client} />

            {/* <Select
              id="client-name"
              value={preGateOutEdit.client}
              fullWidth
              name="client"
              onChange={handleChange}
              inputProps={{
                style: {
                  padding: "0px",
                },
              }}
              MenuProps={MenuProps}
            >
              {gateIn.allDropDown &&
                gateIn.allDropDown.line_client_data &&
                gateIn.allDropDown.line_client_data.map((option) => (
                  <MenuItem
                    key={option.name}
                    value={option.name}
                    onClick={() => {
                      dispatch({
                        type: ADVANCE_FINANCE_CONSTANT.PRE_GATE_OUT_EDIT,
                        payload: {
                          shipping_line_data: option.shipping_line,
                          client: option.name,
                        },
                      });
                    }}
                  >
                    {option.name}
                  </MenuItem>
                ))}
            </Select> */}
          </Grid>
          <Grid
            item
            xs={12}
            sm={6}
            lg={3}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Container Number <span style={{ color: "red" }}>*</span>
            </Typography>
            <GateInTextField
              readOnlyP={true}
              value={preGateOutEdit.container_no}
            />
            {/* <TextField
              id="container-number"
              value={preGateOutEdit.container_no}
              variant="outlined"
              fullWidth
              name="container_no"
              className={classes.textField}
              inputProps={{ className: classes.input }}
              onChange={(e) =>
                handleContainerNumberChangeUtils(
                  e,
                  preGateOutEdit.container_no,
                  dispatch,
                  ADVANCE_FINANCE_CONSTANT.PRE_GATE_OUT_EDIT,
                  "container_no",
                  notify
                )
              }
              onBlur={(e) =>
                handleContainerNumberOnBlurUtils(
                  e,
                  notify,
                  dispatch,
                  ADVANCE_FINANCE_CONSTANT.PRE_GATE_OUT_EDIT,
                  "container_no"
                )
              }
              autoComplete="off"
            /> */}
          </Grid>
          <Grid
            item
            xs={12}
            sm={6}
            lg={3}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Size <span style={{ color: "red" }}>*</span>
            </Typography>
            <GateInTextField readOnlyP={true} value={preGateOutEdit.size} />

            {/* <TextField
              id="container-size"
              select
              value={preGateOutEdit.size}
              variant="outlined"
              fullWidth
              name="size"
              inputProps={{ className: classes.input }}
              onChange={handleChange}
            >
              {gateIn.allDropDown &&
                gateIn.allDropDown.size_data &&
                gateIn.allDropDown.size_data.map((option) => (
                  <MenuItem
                    key={option.name}
                    value={option.name}
                    onClick={() =>
                      dispatch({
                        type: ADVANCE_FINANCE_CONSTANT.PRE_GATE_OUT_EDIT,
                        payload: { size: option.name },
                      })
                    }
                  >
                    {option.name}
                  </MenuItem>
                ))}
            </TextField> */}
          </Grid>
          <Grid
            item
            xs={12}
            sm={6}
            lg={3}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Type <span style={{ color: "red" }}>*</span>
            </Typography>
            <GateInTextField readOnlyP={true} value={preGateOutEdit.type} />

            {/* <TextField
              id="container-type"
              select
              value={preGateOutEdit.type}
              variant="outlined"
              fullWidth
              inputProps={{ className: classes.input }}
              onChange={handleChange}
            >
              {gateIn.allDropDown &&
                gateIn.allDropDown.type_data &&
                gateIn.allDropDown.type_data.map((option) => (
                  <MenuItem
                    key={option.name}
                    value={option.name}
                    onClick={() =>
                      dispatch({
                        type: ADVANCE_FINANCE_CONSTANT.PRE_GATE_OUT_EDIT,
                        payload: { type: option.name },
                      })
                    }
                  >
                    {option.name}
                  </MenuItem>
                ))}
            </TextField> */}
          </Grid>
          <Grid
            item
            xs={12}
            sm={6}
            lg={3}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Shipping Line <span style={{ color: "red" }}>*</span>
            </Typography>
            <GateInTextField
              readOnlyP={true}
              value={preGateOutEdit.shipping_line}
            />

            {/* <TextField
              id="container-type"
              select
              value={preGateOutEdit.shipping_line}
              variant="outlined"
              fullWidth
              inputProps={{ className: classes.input }}
              onChange={handleChange}
            >
              {preGateOutEdit?.shipping_line_data &&
                preGateOutEdit?.shipping_line_data?.map((option) => (
                  <MenuItem
                    key={option?.name}
                    value={option?.name}
                    onClick={() =>
                      dispatch({
                        type: ADVANCE_FINANCE_CONSTANT.PRE_GATE_OUT_EDIT,
                        payload: { shipping_line: option?.name },
                      })
                    }
                  >
                    {option?.name}
                  </MenuItem>
                ))}
            </TextField> */}
          </Grid>
       
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Manufacturing Date <span style={{ color: "red" }}>*</span>
            </Typography>
            <GateInTextField
              readOnlyP={true}
              value={preGateOutEdit.manufacturing_date}
            />

          </Grid>
          <Grid
            item
            xs={12}
            sm={6}
            lg={3}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Booking no <span style={{ color: "red" }}>*</span>
            </Typography>
            <GateInTextField
              readOnlyP={true}
              value={preGateOutEdit.bk_no}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Departed <span style={{ color: "red" }}>*</span>
            </Typography>

            <TextField
              id="departed"
              name="departed"
              select
              value={preGateOutEdit.departed}
              variant="outlined"
              fullWidth
              inputProps={{ className: classes.input }}
              onChange={(e) => dispatch({
                type: ADVANCE_FINANCE_CONSTANT.PRE_GATE_OUT_EDIT,
                payload: { departed: e.target.value },
              })}
            >
              {gateIn.allDropDown &&
                gateIn.allDropDown.arrived &&
                gateIn.allDropDown.arrived.filter((val,index)=>val!=="Road/Rail" ).filter((val,index)=>val!=="Port/Vessel" ).map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Validity <span style={{ color: "red" }}>*</span>
            </Typography>

            <DatePickerField
              dateId="in-date"
              dateValue={preGateOutEdit.do_validity_out_date}
              dateChange={(date) =>
                handleDateChangeUTILSDispatch(
                  date,
                  dispatch,
                  ADVANCE_FINANCE_CONSTANT.PRE_GATE_OUT_EDIT,
                  "do_validity_out_date"
                )
              }
            />
          </Grid>

          <Grid item xs={12} sm={6} md={4} lg={3}>
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Validity Time <span style={{ color: "red" }}>*</span>
            </Typography>
            <TextField
              id="in-time"
              type="time"
              name="do_validity_out_time"
              onChange={(e) =>
                dispatch({
                  type: ADVANCE_FINANCE_CONSTANT.PRE_GATE_OUT_EDIT,
                  payload: { do_validity_out_time: e.target.value },
                })
              }
              value={preGateOutEdit.do_validity_out_time}
              variant="outlined"
              fullWidth
              className={classes.textField}
              inputProps={{ className: classes.input }}
              autoComplete="off"
            />
          </Grid>
          <Grid
            item
            xs={12}
            sm={6}
            lg={3}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Consignee 
            </Typography>
            <TextField
              id="consignee"
              value={preGateOutEdit.consignee}
              name="consignee"
              variant="outlined"
              fullWidth
              className={classes.textField}
              inputProps={{ className: classes.input }}
              onChange={(e) =>
                dispatch({
                  type: ADVANCE_FINANCE_CONSTANT.PRE_GATE_OUT_EDIT,
                  payload: { consignee: e.target.value },
                })
              }
              autoComplete="off"
            />
          </Grid>
          <Grid
            item
            xs={12}
            sm={6}
            lg={3}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Shipper 
            </Typography>
            <TextField
              id="shipper"
              name="shipper"
              value={preGateOutEdit.shipper}
              variant="outlined"
              fullWidth
              className={classes.textField}
              inputProps={{ className: classes.input }}
              onChange={(e) =>
                dispatch({
                  type: ADVANCE_FINANCE_CONSTANT.PRE_GATE_OUT_EDIT,
                  payload: { shipper: e.target.value },
                })
              }
              autoComplete="off"
            />
          </Grid>
         

         
          <Grid
            item
            xs={12}
            sm={6}
            lg={3}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Cargo 
            </Typography>
            <TextField
              id="cargo"
              value={preGateOutEdit.cargo}
              variant="outlined"
              fullWidth
              name="cargo"
              className={classes.textField}
              inputProps={{ className: classes.input }}
              onChange={(e) =>
                dispatch({
                  type: ADVANCE_FINANCE_CONSTANT.PRE_GATE_OUT_EDIT,
                  payload: { cargo: e.target.value },
                })
              }
              autoComplete="off"
            />
          </Grid>
          <Grid
            item
            xs={12}
            sm={6}
            lg={3}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Remarks
            </Typography>
            <TextField
              id="remarks"
              value={preGateOutEdit.remarks}
              variant="outlined"
              fullWidth
              name="remarks"
              className={classes.textField}
              inputProps={{ className: classes.input }}
              onChange={(e) =>
                dispatch({
                  type: ADVANCE_FINANCE_CONSTANT.PRE_GATE_OUT_EDIT,
                  payload: { remarks: e.target.value },
                })
              }
              autoComplete="off"
            />
          </Grid>
          <Grid item sm={12}>
           {preGateOutEdit.pk?<Button
              variant="contained"
              color="primary"
              className={classes.addPreGateOut}
              onClick={handleUpdatePreGateOut}
            >
              Update Pre Gate Out
            </Button> : <Button
              variant="contained"
              color="primary"
              className={classes.addPreGateOut}
              onClick={handleAddPreGateOut}
            >
              Add Pre Gate Out
            </Button>}
          </Grid>
        </Grid>
      </Paper>
      <PreGateOutList />
    </Box>
  );
};

export default PreGateOut;
