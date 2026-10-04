import {
  Box,
  Grid,
  makeStyles,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
  Button,
  Link,
  Divider,
} from "@material-ui/core";
import React, { useEffect } from "react";
import { theme } from "../../App";
import DatePickerField from "../../components/reusableComponents/DatePickerField";
import { useDispatch, useSelector } from "react-redux";
import { ADVANCE_FINANCE_CONSTANT } from "../../reducers/AdvanceFinance/AdvanceFinanceReducer";
import { dropDownDispatch } from "../../actions/GateInActions";
import { useSnackbar } from "notistack";
import {
  handleContainerNumberChangeUtils,
  handleContainerNumberOnBlurUtils,
} from "../../utils/Utils";
import { handleDateChangeUTILSDispatch } from "../../utils/WeekNumbre";
import { Stack } from "@mui/material";
import {
  addPreGateInDataAction,
  updatePreGateInDataAction,
} from "../../actions/AdvanceFinance/AdvanceFinanceAction";
import { useHistory } from "react-router-dom";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";

import PreGateInList from "../../components/advanceFinance/PreGateInList";

const useStyles = makeStyles((theme) => ({
  containerDetails: {
    padding: theme.spacing(2),
    borderRadius: 10,
    backgroundColor: theme.palette.background.paper,
    margin: "auto",
    marginTop: "8px",
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
}));

const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: "300px",
      marginTop: 50,
    },
  },
};

const PreGateIn = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const notify = useSnackbar().enqueueSnackbar;
  const history = useHistory();
  const { AdvanceFinanceReducer, gateIn } = useSelector((state) => state);
  const { preGateInEdit } = AdvanceFinanceReducer;

  useEffect(() => {
    dispatch({type:ADVANCE_FINANCE_CONSTANT.PRE_GATE_IN_EDIT_INIT})
    dispatch({type:ADVANCE_FINANCE_CONSTANT.PRE_GATE_IN_TABLE_INIT})
    let reqArray = [];
    dispatch(dropDownDispatch(reqArray, notify));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddPreGateIN = () => {
   
    if (preGateInEdit.client === "") {
      notify("Please Fill Client", { variant: "warning" });
    } else if (preGateInEdit.type === "") {
      notify("Please Fill Type", { variant: "warning" });
    } else if (preGateInEdit.size === "") {
      notify("Please Fill Size", { variant: "warning" });
    } else if (preGateInEdit.container_no === "") {
      notify("Please Fill Container No", { variant: "warning" });
    } else if (preGateInEdit.shipping_line === "") {
      notify("Please Fill Shipping Line", { variant: "warning" });
    } else if (preGateInEdit.bl_no === "") {
      notify("Please Fill BL No", { variant: "warning" });
    } else if (preGateInEdit.do_validity_in_date === "") {
      notify("Please Fill  Validity In Date", { variant: "warning" });
    } else if (preGateInEdit.do_validity_in_time === "") {
      notify("Please Fill  Validity In Time", { variant: "warning" });
    }else if(preGateInEdit.arrived ===""){
      notify("Please Choose Arrival Status", { variant: "warning" });
    } else {
      dispatch(addPreGateInDataAction(notify));
    }
  };

  const handleUpdatePreGateIn = () => {
    if (preGateInEdit.on_hold === true) {
      notify("On hold Container cannot be updated", { variant: "info" });
    } else if (preGateInEdit.is_gatein_done === true) {
      notify("Gatein Container cannot be updated", { variant: "info" });
    } else if (preGateInEdit.validity_expired === true) {
      notify("Validity Expired Container cannot be updated", {
        variant: "info",
      });
    } else if (preGateInEdit.client === "") {
      notify("Please Fill Client", { variant: "warning" });
    } else if (preGateInEdit.type === "") {
      notify("Please Fill Type", { variant: "warning" });
    } else if (preGateInEdit.size === "") {
      notify("Please Fill Size", { variant: "warning" });
    } else if (preGateInEdit.container_no === "") {
      notify("Please Fill Container No", { variant: "warning" });
    } else if (preGateInEdit.shipping_line === "") {
      notify("Please Fill Shipping Line", { variant: "warning" });
    } else if (preGateInEdit.bl_no === "") {
      notify("Please Fill BL No", { variant: "warning" });
    } else if (preGateInEdit.do_validity_in_date === "") {
      notify("Please Fill  Validity In Date", { variant: "warning" });
    } else if (preGateInEdit.do_validity_in_time === "") {
      notify("Please Fill  Validity In Time", { variant: "warning" });
    }else if(preGateInEdit.arrived ===""){
      notify("Please Choose Arrival Status", { variant: "warning" });
    } else {
      dispatch(updatePreGateInDataAction(notify));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    dispatch({
      type: ADVANCE_FINANCE_CONSTANT.PRE_GATE_IN_EDIT,
      [name]: value,
    });
  };

  return (
    <Box>
      
      <Stack
        direction={"row"}
        alignItems={"center"}
        justifyContent={"space-between"}
        spacing={4}
      >
        <Typography variant="subtitle2">Add Pre Gate In</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => history.go(0)}
          style={{ width: "150px" }}
          startIcon={<AddCircleOutlineIcon />}
        >
          New{" "}
        </Button>
        <Link
          href="/advance-finance-bulk-upload"
          className={classes.bulkUploadButton}
        >
          Bulk Upload
        </Link>
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

            <Select
              id="client-name"
              value={preGateInEdit.client}
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
                        type: ADVANCE_FINANCE_CONSTANT.PRE_GATE_IN_EDIT,
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
            </Select>
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
            <TextField
              id="container-number"
              value={preGateInEdit.container_no}
              variant="outlined"
              fullWidth
              name="container_no"
              className={classes.textField}
              inputProps={{ className: classes.input }}
              onChange={(e) =>
                handleContainerNumberChangeUtils(
                  e,
                  preGateInEdit.container_no,
                  dispatch,
                  ADVANCE_FINANCE_CONSTANT.PRE_GATE_IN_EDIT,
                  "container_no",
                  notify
                )
              }
              onBlur={(e) =>
                handleContainerNumberOnBlurUtils(
                  e,
                  notify,
                  dispatch,
                  ADVANCE_FINANCE_CONSTANT.PRE_GATE_IN_EDIT,
                  "container_no"
                )
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
              Size <span style={{ color: "red" }}>*</span>
            </Typography>

            <TextField
              id="container-size"
              select
              value={preGateInEdit.size}
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
                        type: ADVANCE_FINANCE_CONSTANT.PRE_GATE_IN_EDIT,
                        payload: { size: option.name },
                      })
                    }
                  >
                    {option.name}
                  </MenuItem>
                ))}
            </TextField>
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
            <TextField
              id="container-type"
              select
              value={preGateInEdit.type}
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
                        type: ADVANCE_FINANCE_CONSTANT.PRE_GATE_IN_EDIT,
                        payload: { type: option.name },
                      })
                    }
                  >
                    {option.name}
                  </MenuItem>
                ))}
            </TextField>
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
            <TextField
              id="container-type"
              select
              value={preGateInEdit.shipping_line}
              variant="outlined"
              fullWidth
              inputProps={{ className: classes.input }}
              onChange={handleChange}
            >
              {preGateInEdit?.shipping_line_data &&
                preGateInEdit?.shipping_line_data?.map((option) => (
                  <MenuItem
                    key={option?.name}
                    value={option?.name}
                    onClick={() =>
                      dispatch({
                        type: ADVANCE_FINANCE_CONSTANT.PRE_GATE_IN_EDIT,
                        payload: { shipping_line: option?.name },
                      })
                    }
                  >
                    {option?.name}
                  </MenuItem>
                ))}
            </TextField>
          </Grid>
         
          <Grid
            item
            xs={12}
            sm={6}
            lg={3}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Bl no <span style={{ color: "red" }}>*</span>
            </Typography>
            <TextField
              id="bl_no"
              name="bl_no"
              value={preGateInEdit.bl_no}
              variant="outlined"
              fullWidth
              className={classes.textField}
              inputProps={{ className: classes.input }}
              onChange={(e) =>
                dispatch({
                  type: ADVANCE_FINANCE_CONSTANT.PRE_GATE_IN_EDIT,
                  payload: { bl_no: e.target.value },
                })
              }
              autoComplete="off"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={4} lg={3}>
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Arrived <span style={{ color: "red" }}>*</span>
            </Typography>

            <TextField
              id="arrived"
              name="arrived"
              select
              value={preGateInEdit.arrived}
              variant="outlined"
              fullWidth
              inputProps={{ className: classes.input }}
              onChange={(e) => dispatch({
                type: ADVANCE_FINANCE_CONSTANT.PRE_GATE_IN_EDIT,
                payload: { arrived: e.target.value },
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
            <Typography variant="subtitle1" className={classes.LabelTypography}  style={{marginTop:"-2px"}}>
              Validity Date<span style={{ color: "red" }}>*</span>
            </Typography>

            <DatePickerField
              preGateIn
              dateId="in-date"
              dateValue={preGateInEdit.do_validity_in_date}
              dateChange={(date) =>
                handleDateChangeUTILSDispatch(
                  date,
                  dispatch,
                  ADVANCE_FINANCE_CONSTANT.PRE_GATE_IN_EDIT,
                  "do_validity_in_date"
                )
              }
            />
          </Grid>

          <Grid item xs={12} sm={6} md={4} lg={3}>
            <Typography variant="subtitle1" className={classes.LabelTypography} >
              Validity Time <span style={{ color: "red" }}>*</span>
            </Typography>
            <TextField
              id="in-time"
              type="time"
              name="do_validity_in_time"
              onChange={(e) =>
                dispatch({
                  type: ADVANCE_FINANCE_CONSTANT.PRE_GATE_IN_EDIT,
                  payload: { do_validity_in_time: e.target.value },
                })
              }
              value={preGateInEdit.do_validity_in_time}
              variant="outlined"
              defaultValue={preGateInEdit.do_validity_in_time}
              fullWidth
              style={{marginTop:"-4px"}}
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
              value={preGateInEdit.consignee}
              name="consignee"
              variant="outlined"
              fullWidth
              className={classes.textField}
              inputProps={{ className: classes.input }}
              onChange={(e) =>
                dispatch({
                  type: ADVANCE_FINANCE_CONSTANT.PRE_GATE_IN_EDIT,
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
              value={preGateInEdit.shipper}
              variant="outlined"
              fullWidth
              className={classes.textField}
              inputProps={{ className: classes.input }}
              onChange={(e) =>
                dispatch({
                  type: ADVANCE_FINANCE_CONSTANT.PRE_GATE_IN_EDIT,
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
              value={preGateInEdit.cargo}
              variant="outlined"
              fullWidth
              name="cargo"
              className={classes.textField}
              inputProps={{ className: classes.input }}
              onChange={(e) =>
                dispatch({
                  type: ADVANCE_FINANCE_CONSTANT.PRE_GATE_IN_EDIT,
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
              name="remarks"
              value={preGateInEdit.remarks}
              variant="outlined"
              fullWidth
              className={classes.textField}
              inputProps={{ className: classes.input }}
              onChange={(e) =>
                dispatch({
                  type: ADVANCE_FINANCE_CONSTANT.PRE_GATE_IN_EDIT,
                  payload: { remarks: e.target.value },
                })
              }
              autoComplete="off"
            />
          </Grid>
          <Grid item sm={12}>
            {preGateInEdit.pk ? (
              <Button
                fullWidth
                style={{ width: "250px", margin: "auto", display: "block" }}
                variant="contained"
                color="primary"
                onClick={handleUpdatePreGateIn}
              >
                Update Pre Gate IN
              </Button>
            ) : (
              <Button
                fullWidth
                style={{ width: "250px", margin: "auto", display: "block" }}
                variant="contained"
                color="primary"
                onClick={handleAddPreGateIN}
              >
                Add Pre Gate IN
              </Button>
            )}
          </Grid>
        </Grid>
      </Paper>
      <Divider style={{ width: "100%", marginTop: "24px" }} />
      <PreGateInList />
    </Box>
  );
};

export default PreGateIn;
