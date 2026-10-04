import {
  Box,
  Grid,
  makeStyles,
  MenuItem,
  Modal,
  TextField,
  Typography,
  Button,
  useMediaQuery,
} from "@material-ui/core";
import { Stack } from "@mui/material";
import React from "react";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import { useDispatch, useSelector } from "react-redux";
import { ADVANCE_FINANCE_CONSTANT } from "../../reducers/AdvanceFinance/AdvanceFinanceReducer";
import {
  addAdvanceFinanceAction,
  updateAdvanceFinanceAction,
} from "../../actions/AdvanceFinance/AdvanceFinanceAction";
import { useSnackbar } from "notistack";

const style = {
  position: "absolute",
  top: "56%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  bgcolor: "background.paper",
  width: "900px",
  outline: "none",
  border: "none",
  borderRadius: "4px",
  p: 4,
};

const mobileStyle ={
 
    position: "absolute",
    top: "56%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    bgcolor: "background.paper",
    width: "100%",
    outline: "none",
    border: "none",
    borderRadius: "4px",
    p: 4,

}

const label = {
  color: "black",
  fontSize: "12px",
  marginTop: "-10px",
};

const useStyles = makeStyles((theme) => ({
  heading: {
    color: "gray",
  },
  TextField: {
    height: "32px",
  },
  input: {
    padding: 8,
    backgroundColor: "#fff",
    marginTop: -4,
    pointerEvents: "painted",
    color: "#243545",
  },
  label: {
    color: "black",
    fontSize: "12px",
    marginTop: "-10px",
  },
  paymentButton: {
    borderRadius: "12px",
  },
  paymentButtonDisable: {
    borderRadius: "12px",
    backgroundColor: "transparent",
    color: "black",
    boxShadow: "none",
    border: "1px solid rgba(0,0,0,0.1)",
    "&:hover": {
      backgroundColor: "transparent",
      color: "black",
    },
  },
  labelHeading:{
    fontSize:"12px",
    color:"rgb(23,43,77)",
    marginBottom:"4px",
  },
  modalContainer:{
    [theme.breakpoints.down('md')]:{
      overflowY:"scroll",
      height:"calc(100% - 250px)",
      "& ::-webkit-scrollbar": {
        height: "5px",
      },
    }
  
  }
}));

const LOLOFinanceUpdateModal = ({ openUpdate, handleCloseUpdate }) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const notify = useSnackbar().enqueueSnackbar;
  const { gateIn } = useSelector((state) => state);
  const { requestData } = useSelector((state) => state.AdvanceFinanceReducer);
    const matchesIphone = useMediaQuery("(max-width:500px)");

  const handleChange = (e) => {
    const { name, value } = e.target;
    if(name==="tds" && (value <1 || value >100)){
       notify("Tds % should be from 1 to 100 ",{variant:'warning'})
       return 
    }
    dispatch({
      type: ADVANCE_FINANCE_CONSTANT.GET_ADVANCE_UPDATE,
      payload: {
        [name]: value,
      },
    });
  };

  const handleFinancePayment = () => {
    if(requestData.entry_type ==="IN" && requestData.bl_no ===""){
      notify("Please Fill Billing Number",{variant:"warning"})
    }else if(requestData.entry_type ==="OUT" && requestData.bk_no ===""){
      notify("Please Fill Booking Number",{variant:"warning"})
    }else if(requestData.original_amount ==="" || requestData.original_amount <=0){
        notify("Please Fill Amount ",{variant:"warning"})
    }else if(requestData.quantity ===""||requestData.quantity <=0){
      notify("Please Fill Quantity ",{variant:"warning"})
    }else if(requestData.payment_type ==="UPI" && requestData.transaction_id ===""){
      notify("Please Fill Transaction ID ",{variant:"warning"})
    }else if(requestData.payment_type==="Cheque"&& (requestData.cheque_no ==="" || requestData.account_no===""||requestData.bank_name===""||requestData.account_name==="")){
      notify("Please Fill Cheque No and Bank Details ",{variant:"warning"})
    }else if((requestData.payment_type ==="NEFT" || requestData.payment_type ==="RTGS")&& (requestData.utr_no ==="" || requestData.account_no===""||requestData.bank_name===""||requestData.account_name==="")){
      notify("Please Fill Bank Details ",{variant:"warning"})
    }else {
      dispatch(addAdvanceFinanceAction(notify, handleCloseUpdate));
    }
  };
  const handleFinancePaymentUpdate = () => {
    if(requestData.entry_type ==="IN" && requestData.bl_no ===""){
      notify("Please Fill Billing Number",{variant:"warning"})
    }else if(requestData.entry_type ==="OUT" && requestData.bk_no ===""){
      notify("Please Fill Booking Number",{variant:"warning"})
    }else if(requestData.original_amount ==="" || requestData.original_amount <=0){
        notify("Please Fill Amount ",{variant:"warning"})
    }else if(requestData.quantity ===""||requestData.quantity <=0){
      notify("Please Fill Quantity ",{variant:"warning"})
    }else if(requestData.payment_type ==="UPI" && requestData.transaction_id ===""){
      notify("Please Fill Transaction ID ",{variant:"warning"})
    }else if(requestData.payment_type==="Cheque"&& (requestData.cheque_no ==="" || requestData.account_no===""||requestData.bank_name===""||requestData.account_name==="")){
      notify("Please Fill Cheque No and Bank Details ",{variant:"warning"})
    }else if((requestData.payment_type ==="NEFT" || requestData.payment_type ==="RTGS")&& (requestData.utr_no ==="" || requestData.account_no===""||requestData.bank_name===""||requestData.account_name==="")){
      notify("Please Fill Bank Details ",{variant:"warning"})
    }else {
      dispatch(updateAdvanceFinanceAction(notify, handleCloseUpdate));
    }
   
  };

  return (
    <Modal
      open={openUpdate}
      onClose={handleCloseUpdate}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={matchesIphone?mobileStyle: style} className={classes.modalContainer}>
        <Stack spacing={2}>
          <Typography variant="h6" style={{ fontWeight: "bold" }}>
            Advance LOLO Payment
          </Typography>
          <Typography variant="caption" className={classes.heading}>
            1. Select Bill Details
          </Typography>
          <Grid container spacing={2} >
            <Grid item xs={6} sm={6} md={4}>
              <Typography variant="subtitle2" className={classes.labelHeading}>
                Select Type <span style={{ color: "red" }}>*</span>
              </Typography>
              <TextField
                variant="outlined"
                color="primary"
                select
                value={requestData.entry_type}
                defaultValue={requestData.entry_type}
                name="entry_type"
                onChange={handleChange}
                fullWidth
                className={classes.TextField}
                inputProps={{ className: classes.input }}
                InputLabelProps={{ style: label }}
              >
                {["IN", "OUT"].map((val, ind) => (
                  <MenuItem key={val} value={val}>
                    {val}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            {requestData.entry_type === "IN" ? (
              <Grid item xs={6} sm={6} md={4}>
                 <Typography variant="subtitle2" className={classes.labelHeading}>
                   BL No <span style={{ color: "red" }}>*</span>
                 </Typography>
                <TextField
                  variant="outlined"
                  value={requestData.bl_no}
                  name="bl_no"
                  color="primary"
                  onChange={handleChange}
                  fullWidth
                  className={classes.TextField}
                  inputProps={{ className: classes.input }}
                  InputLabelProps={{ style: label }}
                />
              </Grid>
            ) : (
              <Grid item xs={6} sm={6} md={4}>
                <Typography variant="subtitle2" className={classes.labelHeading}>
                Booking No <span style={{ color: "red" }}>*</span>
              </Typography>
                <TextField
                  variant="outlined"
                  value={requestData.bk_no}
                  name="bk_no"
                  color="primary"
                  onChange={handleChange}
                  fullWidth
                  className={classes.TextField}
                  inputProps={{ className: classes.input }}
                  InputLabelProps={{ style: label }}
                />
              </Grid>
            )}
            <Grid item xs={6} sm={6} md={4}>
            <Typography variant="subtitle2" className={classes.labelHeading}>
                Customer <span style={{ color: "red" }}>*</span>
              </Typography>
              <TextField
                variant="outlined"
                color="primary"
                select
                fullWidth
                value={requestData.client}
                name="client"
                onChange={handleChange}
                className={classes.TextField}
                inputProps={{ className: classes.input }}
                InputLabelProps={{ style: label }}
              >
                {gateIn.allDropDown?.lf_advance_payment_client_list?.map(
                  (val, ind) => (
                    <MenuItem key={val} value={val}>
                      {val}
                    </MenuItem>
                  )
                )}
              </TextField>
            </Grid>
          </Grid>
          <Typography variant="caption" className={classes.heading}>
            2. Select Payment Type
          </Typography>
          <Grid container spacing={2}>
            <Grid item sm={2}>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                className={
                  requestData.payment_type === "Cash"
                    ? classes.paymentButton
                    : classes.paymentButtonDisable
                }
                onClick={(e) =>
                  dispatch({
                    type: ADVANCE_FINANCE_CONSTANT.GET_ADVANCE_UPDATE,
                    payload: {
                      payment_type: "Cash",
                      cheque_no: null,
                      utr_no: null,
                      bank_name: null,
                      account_name: null,
                      account_no: null,
                      transaction_id: null,
                    },
                  })
                }
              >
                Cash
              </Button>
            </Grid>
            <Grid item sm={2}>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                className={
                  requestData.payment_type === "UPI"
                    ? classes.paymentButton
                    : classes.paymentButtonDisable
                }
                onClick={(e) =>
                  dispatch({
                    type: ADVANCE_FINANCE_CONSTANT.GET_ADVANCE_UPDATE,
                    payload: {
                      payment_type: "UPI",
                      cheque_no: null,
                      utr_no: null,
                      bank_name: null,
                      account_name: null,
                      account_no: null,
                    },
                  })
                }
              >
                UPI
              </Button>
            </Grid>
            <Grid item sm={2}>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                className={
                  requestData.payment_type === "Cheque"
                    ? classes.paymentButton
                    : classes.paymentButtonDisable
                }
                onClick={(e) =>
                  dispatch({
                    type: ADVANCE_FINANCE_CONSTANT.GET_ADVANCE_UPDATE,
                    payload: {
                      payment_type: "Cheque",
                      utr_no: null,
                      transaction_id: null,
                    },
                  })
                }
              >
                Cheque
              </Button>
            </Grid>
            <Grid item sm={2}>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                className={
                  requestData.payment_type === "NEFT"
                    ? classes.paymentButton
                    : classes.paymentButtonDisable
                }
                onClick={(e) =>
                  dispatch({
                    type: ADVANCE_FINANCE_CONSTANT.GET_ADVANCE_UPDATE,
                    payload: {
                      payment_type: "NEFT",
                      cheque_no: null,
                      transaction_id: null,
                    },
                  })
                }
              >
                NEFT
              </Button>
            </Grid>
            <Grid item sm={2}>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                className={
                  requestData.payment_type === "RTGS"
                    ? classes.paymentButton
                    : classes.paymentButtonDisable
                }
                onClick={(e) =>
                  dispatch({
                    type: ADVANCE_FINANCE_CONSTANT.GET_ADVANCE_UPDATE,
                    payload: {
                      payment_type: "RTGS",
                      cheque_no: null,
                      transaction_id: null,
                    },
                  })
                }
              >
                RTGS
              </Button>
            </Grid>
          </Grid>
          {requestData.payment_type !== "Cash" && (
            <Typography variant="caption" className={classes.heading}>
              3. Add Payment Deatils
            </Typography>
          )}
          <Grid container spacing={2}>
            {requestData.payment_type === "Cheque" ? (
              <Grid item xs={6} sm={6} md={3}>
                <Typography variant="subtitle2" className={classes.labelHeading}>
                Cheque No <span style={{ color: "red" }}>*</span>
              </Typography>
                <TextField
                  variant="outlined"
                  color="primary"
                  type="text"
                  value={requestData.cheque_no}
                  name="cheque_no"
                  onChange={handleChange}
                  fullWidth
                  className={classes.TextField}
                  inputProps={{ className: classes.input }}
                  InputLabelProps={{ style: label }}
                />
              </Grid>
            ) : requestData.payment_type === "NEFT" ||
              requestData.payment_type === "RTGS" ? (
              <Grid item xs={6} sm={6} md={3}>
                <Typography variant="subtitle2" className={classes.labelHeading}>
                 Utr no <span style={{ color: "red" }}>*</span>
              </Typography>
                <TextField
                  variant="outlined"
                  color="primary"
                  type="text"
                  value={requestData.utr_no}
                  name="utr_no"
                  onChange={handleChange}
                  fullWidth
                  className={classes.TextField}
                  inputProps={{ className: classes.input }}
                  InputLabelProps={{ style: label }}
                />
              </Grid>
            ) : requestData.payment_type === "UPI" ? (
              <Grid item xs={6} sm={6} md={3}>
                <Typography variant="subtitle2" className={classes.labelHeading}>
                Transaction No <span style={{ color: "red" }}>*</span>
              </Typography>
                <TextField
                  variant="outlined"
                  color="primary"
                  type="text"
                  value={requestData.transaction_id}
                  name="transaction_id"
                  onChange={handleChange}
                  fullWidth
                  className={classes.TextField}
                  inputProps={{ className: classes.input }}
                  InputLabelProps={{ style: label }}
                />
              </Grid>
            ) : null}
            {(requestData.payment_type === "Cheque" ||
              requestData.payment_type === "NEFT" ||
              requestData.payment_type === "RTGS") && (
              <Grid item xs={6} sm={6} md={3}>
                <Typography variant="subtitle2" className={classes.labelHeading}>
                Account No <span style={{ color: "red" }}>*</span>
              </Typography>
                <TextField
                  variant="outlined"
                  color="primary"
                  type="text"
                  value={requestData.account_no}
                  name="account_no"
                  onChange={handleChange}
                  fullWidth
                  className={classes.TextField}
                  inputProps={{ className: classes.input }}
                  InputLabelProps={{ style: label }}
                />
              </Grid>
            )}
            {(requestData.payment_type === "Cheque" ||
              requestData.payment_type === "NEFT" ||
              requestData.payment_type === "RTGS") && (
              <Grid item sxs={6} sm={6} md={3}>
                <Typography variant="subtitle2" className={classes.labelHeading}>
                Bank Name <span style={{ color: "red" }}>*</span>
              </Typography>
                <TextField
                  variant="outlined"
                  color="primary"
                  type="text"
                  fullWidth
                  value={requestData.bank_name}
                  name="bank_name"
                  onChange={handleChange}
                  className={classes.TextField}
                  inputProps={{ className: classes.input }}
                  InputLabelProps={{ style: label }}
                />
              </Grid>
            )}
            {(requestData.payment_type === "Cheque" ||
              requestData.payment_type === "NEFT" ||
              requestData.payment_type === "RTGS") && (
              <Grid item xs={6} sm={6} md={3}>
                <Typography variant="subtitle2" className={classes.labelHeading}>
                Account Name <span style={{ color: "red" }}>*</span>
              </Typography>
                <TextField
                  variant="outlined"
                  color="primary"
                  type="text"
                  fullWidth
                  value={requestData.account_name}
                  name="account_name"
                  onChange={handleChange}
                  className={classes.TextField}
                  inputProps={{ className: classes.input }}
                  InputLabelProps={{ style: label }}
                />
              </Grid>
            )}
          </Grid>
          <Typography variant="caption" className={classes.heading}>
            {requestData.payment_type === "Cash"?"3":"4"}. Select Amount and Quantity
          </Typography>
          <Grid container spacing={2}>
            <Grid item sm={4}>
            <Typography variant="subtitle2" className={classes.labelHeading}>
                Amount <span style={{ color: "red" }}>*</span>
              </Typography>
              <TextField
                variant="outlined"
                color="primary"
                type="number"
                value={requestData.original_amount}
                name="original_amount"
                onChange={handleChange}
                fullWidth
                className={classes.TextField}
                inputProps={{ className: classes.input }}
                InputLabelProps={{ style: label }}
              />
            </Grid>
            <Grid item sm={4}>
            <Typography variant="subtitle2" className={classes.labelHeading}>
                Quantity <span style={{ color: "red" }}>*</span>
              </Typography>
              <TextField
                variant="outlined"
                color="primary"
                type="number"
                fullWidth
                value={requestData.quantity}
                name="quantity"
                onChange={handleChange}
                className={classes.TextField}
                inputProps={{ className: classes.input }}
                InputLabelProps={{ style: label }}
              />
            </Grid>
            <Grid item sm={4}>
            <Typography variant="subtitle2" className={classes.labelHeading}>
                TDS % 
              </Typography>
              <TextField
                variant="outlined"
                color="primary"
                type="number"
                fullWidth
                value={requestData.tds}
                name="tds"
                onChange={handleChange}
                className={classes.TextField}
                InputProps={{ inputProps: { min: 1, max: 100 ,className:classes.input}  }}
                InputLabelProps={{ style: label }}
              />
            </Grid>
          </Grid>
        </Stack>
        <Stack marginTop={"32px"} direction={"row"} justifyContent={"flex-end"}>
          <Button variant="text" color="primary" onClick={handleCloseUpdate}>
            Close
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={
              requestData.pk ? handleFinancePaymentUpdate : handleFinancePayment
            }
            style={{ width: "200px", backgroundColor: "" }}
          >
            {requestData.pk ? "Update" : "Add Payment Request"}
          </Button>
        </Stack>
      </Box>
    </Modal>
  );
};

export default LOLOFinanceUpdateModal;
