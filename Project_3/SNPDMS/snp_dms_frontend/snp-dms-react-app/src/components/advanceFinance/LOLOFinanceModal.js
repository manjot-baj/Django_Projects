import { Box, Button, MenuItem, Modal, Paper, Select, Step, StepContent, StepLabel, Stepper, Typography } from '@material-ui/core';
import { Stack } from '@mui/material';
import React, { useState } from 'react'
import GateInTextField from '../reusableComponents/GateInTextField';
import { useSnackbar } from 'notistack';
const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    bgcolor: "background.paper",
    width: "700px",
    p: 2,
  };


  
const ADV_PAYMENT_TYPE = ["Cash", "UPI", "Cheque", "NEFT", "RTGS"];

const LOLOFinanceModal = ({open,handleClose,handleSubmitLoloFinance}) => {
    const notify = useSnackbar().enqueueSnackbar;
    const [activeStep, setActiveStep] = React.useState(0);
    const [formData, setFormData] = useState({
      Bl_no: "",
      client: "",
      payment_type: "",
      cheque_no: "",
      transaction_id: "",
      utr_no: "",
      bank_name: "",
  
      account_name: "",
      account_no: "",
      amount: "",
      quantity: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
      };
  

    const steps = [
        {
          label: "Select Bill No , Client and Payment Type",
          description: (
            <Stack direction={"row"} alignItems={"center"} spacing={2} mb={2}>
              <Stack direction={"column"}>
                <Typography variant="subtitle2" style={{ fontWeight: "bold" }}>
                  Bill No
                </Typography>
                <GateInTextField
                  id={"client"}
                  name={"Bl_no"}
                  value={formData.Bl_no}
                  handleChange={handleChange}
                />
              </Stack>
              <Stack direction={"column"}>
                <Typography variant="subtitle2" style={{ fontWeight: "bold" }}>
                  Client
                </Typography>
                <GateInTextField
                  id={"client"}
                  name={"client"}
                  value={formData.client}
                  handleChange={handleChange}
                />
              </Stack>
              <Stack direction={"column"}>
                <Typography variant="subtitle2" style={{ fontWeight: "bold" }}>
                  Payment Type
                </Typography>
                <Select
                  variant="outlined"
                  id={"payment_type"}
                  name={"payment_type"}
                  value={formData.payment_type}
                  onChange={handleChange}
                  style={{ height: "32px", width: "180px" }}
                  fullWidth
                >
                  {ADV_PAYMENT_TYPE.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </Stack>
            </Stack>
          ),
        },
        {
          label: "Fill Payment and Amount details ",
          description: (
            <Stack direction={"column"} spacing={2} mb={2}>
              {formData.payment_type === "Cheque" ? (
                <Stack direction={"row"} alignItems={"center"} spacing={2}>
                  <Stack direction={"column"}>
                    <Typography variant="subtitle2" style={{ fontWeight: "bold" }}>
                      Cheque No
                    </Typography>
                    <GateInTextField
                      id={"cheque_no"}
                      name={"cheque_no"}
                      value={formData.cheque_no}
                      handleChange={handleChange}
                    />
                  </Stack>
                  <Stack direction={"column"}>
                    <Typography variant="subtitle2" style={{ fontWeight: "bold" }}>
                      Bank Name
                    </Typography>
                    <GateInTextField
                      id={"bank_name"}
                      name={"bank_name"}
                      value={formData.bank_name}
                      handleChange={handleChange}
                    />
                  </Stack>
                  <Stack direction={"column"}>
                    <Typography variant="subtitle2" style={{ fontWeight: "bold" }}>
                      Account No
                    </Typography>
                    <GateInTextField
                      id={"account_no"}
                      name={"account_no"}
                      value={formData.account_no}
                      handleChange={handleChange}
                    />
                  </Stack>
                  <Stack direction={"column"}>
                    <Typography variant="subtitle2" style={{ fontWeight: "bold" }}>
                      Account Name
                    </Typography>
                    <GateInTextField
                      id={"account_name"}
                      name={"account_name"}
                      value={formData.account_name}
                      handleChange={handleChange}
                    />
                  </Stack>
                </Stack>
              ) : formData.payment_type ===
                "Cash" ? null : formData.payment_type === "UPI" ? (
                <Stack direction={"row"} alignItems={"center"} spacing={2}>
                  <Stack direction={"column"}>
                    <Typography variant="subtitle2" style={{ fontWeight: "bold" }}>
                      Transaction Id
                    </Typography>
                    <GateInTextField
                      id={"transaction_id"}
                      name={"transaction_id"}
                      value={formData.transaction_id}
                      handleChange={handleChange}
                    />
                  </Stack>
                </Stack>
              ) : (
                <Stack direction={"row"} alignItems={"center"} spacing={2}>
                  <Stack direction={"column"}>
                    <Typography variant="subtitle2" style={{ fontWeight: "bold" }}>
                      UTR No
                    </Typography>
                    <GateInTextField
                      id={"utr_no"}
                      name={"utr_no"}
                      value={formData.utr_no}
                      handleChange={handleChange}
                    />
                  </Stack>
                </Stack>
              )}
              <Stack direction={"row"} alignItems={"center"} spacing={2}>
                <Stack direction={"column"}>
                  <Typography variant="subtitle2" style={{ fontWeight: "bold" }}>
                    Amount
                  </Typography>
                  <GateInTextField
                    id={"amount"}
                    name={"amount"}
                    value={formData.amount}
                    handleChange={handleChange}
                  />
                </Stack>
                <Stack direction={"column"}>
                  <Typography variant="subtitle2" style={{ fontWeight: "bold" }}>
                    Quantity
                  </Typography>
                  <GateInTextField
                    type={"number"}
                    id={"quantity"}
                    name={"quantity"}
                    value={formData.quantity}
                    handleChange={handleChange}
                  />
                </Stack>
              </Stack>
            </Stack>
          ),
        },
      ];


      
  const handleNext = () => {
    setActiveStep((prevActiveStep) => {
      if (
        prevActiveStep === 0 &&
        (formData.Bl_no === "" ||
          formData.payment_type === "" ||
          formData.client === "")
      ) {
        notify("Please Fill all the required fields", { variant: "warning" });
        return prevActiveStep;
      }
      if (prevActiveStep === 1) {
        if (formData.payment_type === "UPI" && formData.transaction_id === "") {
          notify("Please Fill all Transaction ID required fields", {
            variant: "warning",
          });
          return prevActiveStep;
        } else if (
          formData.payment_type === "Cheque" &&
          (formData.cheque_no === "" ||
            formData.bank_name === "" ||
            formData.account_name === "" ||
            formData.account_no === "")
        ) {
          notify("Please Fill all the bank required fields", {
            variant: "warning",
          });
          return prevActiveStep;
        } else if (
          (formData.payment_type === "NEFT" ||
            formData.payment_type === "RTGS") &&
          formData.utr_no === ""
        ) {
          notify("Please Fill Utr no ", {
            variant: "warning",
          });
          return prevActiveStep;
        } else if (formData.amount === "" || formData.quantity === "") {
          notify("Please Fill Amount and Quantity", {
            variant: "warning",
          });
          return prevActiveStep;
        } else {
          return prevActiveStep + 1;
        }
      }

      return prevActiveStep + 1;
    });
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

    

  return (
    <Modal
    open={open}
    onClose={handleClose}
    aria-labelledby="modal-modal-title"
    aria-describedby="modal-modal-description"
  >
    <Box sx={style}>
      <Typography>Advance LOLO Finance</Typography>
      <Stepper activeStep={activeStep} orientation="vertical">
        {steps.map((step, index) => (
          <Step key={step.label}>
            <StepLabel>{step.label}</StepLabel>
            <StepContent>
              <Typography>{step.description}</Typography>
              <Box sx={{ mb: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleNext}
                  sx={{ mt: 2, mr: 1 }}
                >
                  {index === steps.length - 1 ? "Finish" : "Continue"}
                </Button>
                <Button
                  disabled={index === 0}
                  onClick={handleBack}
                  sx={{ mt: 2, mr: 1 }}
                >
                  Back
                </Button>
              </Box>
            </StepContent>
          </Step>
        ))}
      </Stepper>
      {activeStep === steps.length && (
        <Paper square elevation={0} sx={{ p: 3 }}>
          <Typography>All steps completed</Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmitLoloFinance}
            sx={{ mt: 1, mr: 1 }}
          >
            Submit
          </Button>
          <Button onClick={handleReset} sx={{ mt: 1, mr: 1 }}>
            Reset
          </Button>
        </Paper>
      )}
    </Box>
  </Modal>
  )
}

export default LOLOFinanceModal