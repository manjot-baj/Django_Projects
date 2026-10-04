import React, { useState, useEffect } from "react";

import { Typography, Paper, Grid, Box, TextField } from "@mui/material";

import { useSelector } from "react-redux";
import CustomTextfield from "@components/reusablecomponents/GateInTextField";

import { theme } from "../../../App";
import { customLabelTypography } from "../../../utils/CustomClasses";
import { useSnackbar } from "notistack";



export default function StatutoryDetails() {
  const store = useSelector((state) => state);
  const notify = useSnackbar().enqueueSnackbar;
  const { clientMaster } = store;
  const [cstNo, setCstNo] = useState("");
  const [vatNo, setVatNo] = useState("");
  const [panNo, setPanNo] = useState("");
  const [serviceTaxNo, setServiceTaxNo] = useState("");
  const [eccNo, setEccNo] = useState("");
  const [gstNo, setGstNo] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankBranch, setBankBranch] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountNo, setAccountNo] = useState("");
  const [swiftCode, setSwiftCode] = useState("");

  useEffect(() => {
    if (clientMaster.clientDetails.client_data.pk) {
      setCstNo(clientMaster.clientDetails.client_data.cst_no);
      setVatNo(clientMaster.clientDetails.client_data.vat_no);
      setPanNo(clientMaster.clientDetails.client_data.pan_no);
      setServiceTaxNo(clientMaster.clientDetails.client_data.service_tax_no);
      setEccNo(clientMaster.clientDetails.client_data.ecc_no);
      setGstNo(clientMaster.clientDetails.client_data.gst_no);
      setBankName(clientMaster.clientDetails.client_data.bank_name);
      setBankBranch(clientMaster.clientDetails.client_data.bank_branch);
      setIfsc(clientMaster.clientDetails.client_data.ifsc_code);
      setAccountName(clientMaster.clientDetails.client_data.account_name);
      setAccountNo(clientMaster.clientDetails.client_data.account_no);
      setSwiftCode(clientMaster.clientDetails.client_data.swift_code);
    }
  }, [clientMaster.clientDetails]);

  return (
    <div>
      <Typography
        variant="subtitle2"
        sx={(theme) => ({
          paddingTop: 2,
          paddingBottom: 2,
          backgroundColor: theme.palette.secondary.main,
          color: "#FFF",
          marginTop: 2,
          borderTopLeftRadius: 5,
          borderTopRightRadius: 5,
        })}
      >
        <Box fontWeight="fontWeightBold" m={1}>
          Statutory Details
        </Box>
      </Typography>
      <Paper
        sx={(theme) => ({
          padding: theme.spacing(2, 2),
        })}
        elevation={0}
      >
        <Grid container spacing={1}>
          <Grid
            item
            xs={12}
            sm={6}
            lg={3}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" sx={customLabelTypography}>
              CST No.
            </Typography>
            <CustomTextfield
              id="client-master-cst-no"
              value={cstNo}
              handleChange={(e) => setCstNo(e.target.value)}
              dispatchType={"SET_MASTER_CLIENT_CST_NO"}
            />
          </Grid>
          <Grid
            item
            xs={12}
            sm={6}
            lg={3}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" sx={customLabelTypography}>
              Vat No.
            </Typography>

            <CustomTextfield
              id="client-master-vat-no"
              handleChange={(e) => setVatNo(e.target.value)}
              value={vatNo}
              dispatchType={"SET_MASTER_CLIENT_VAT_NO"}
            />
          </Grid>
          <Grid
            item
            xs={12}
            sm={6}
            lg={3}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" sx={customLabelTypography}>
              Pan No.
            </Typography>

            <CustomTextfield
              id="client-master-panNo"
              // handleChange={handleContainerNumberChange}
              value={panNo}
              handleChange={(e) => setPanNo(e.target.value)}
              dispatchType={"SET_MASTER_CLIENT_PAN_NO"}
            />
          </Grid>
          <Grid
            item
            xs={12}
            sm={6}
            lg={3}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" sx={customLabelTypography}>
              Service Tax No.
            </Typography>

            <CustomTextfield
              id="client-master-service-tax-no"
              value={serviceTaxNo}
              handleChange={(e) => setServiceTaxNo(e.target.value)}
              dispatchType={"SET_MASTER_CLIENT_SERVICE_TAX_NO"}
            />
          </Grid>
          <Grid
            item
            xs={12}
            sm={6}
            lg={3}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" sx={customLabelTypography}>
              ECC No.
            </Typography>

            <CustomTextfield
              id="client-master-ecc-no"
              // handleChange={handleContainerNumberChange}
              value={eccNo}
              handleChange={(e) => setEccNo(e.target.value)}
              dispatchType={"SET_MASTER_CLIENT_ECC_NO"}
            />
          </Grid>
          <Grid
            item
            xs={12}
            sm={6}
            lg={3}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" sx={customLabelTypography}>
              GST No. <span style={{ color: "red" }}>*</span>
            </Typography>
              <CustomTextfield
              id="client-master-gst-no"
              value={gstNo}
              handleChange={(e) => setGstNo(e.target.value)}
              dispatchType={"SET_MASTER_CLIENT_GST_NO"}
            />
           
          </Grid>

          <Grid
            item
            xs={12}
            sm={6}
            lg={3}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" sx={customLabelTypography}>
              Bank Name
            </Typography>

            <CustomTextfield
              id="client-master-bank-name"
              value={bankName}
              handleChange={(e) => setBankName(e.target.value)}
              dispatchType={"SET_MASTER_CLIENT_BANK_NAME"}
            />
          </Grid>
          <Grid
            item
            xs={12}
            sm={6}
            lg={3}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" sx={customLabelTypography}>
              Bank Branch
            </Typography>

            <CustomTextfield
              id="client-master-bank-branch"
              value={bankBranch}
              handleChange={(e) => setBankBranch(e.target.value)}
              dispatchType={"SET_MASTER_CLIENT_BANK_BRANCH"}
            />
          </Grid>
          <Grid
            item
            xs={12}
            sm={6}
            lg={3}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" sx={customLabelTypography}>
              Ifsc Code
            </Typography>

            <CustomTextfield
              id="client-master-ifscCode"
              value={ifsc}
              handleChange={(e) => setIfsc(e.target.value)}
              dispatchType={"SET_MASTER_CLIENT_IFSC_CODE"}
            />
          </Grid>

          <Grid
            item
            xs={12}
            sm={6}
            lg={3}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" sx={customLabelTypography}>
              Account Name
            </Typography>

            <CustomTextfield
              id="client-master-acc-name"
              value={accountName}
              handleChange={(e) => setAccountName(e.target.value)}
              dispatchType={"SET_MASTER_CLIENT_ACCOUNT_NAME"}
            />
          </Grid>
          <Grid
            item
            xs={12}
            sm={6}
            lg={3}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" sx={customLabelTypography}>
              Account No.
            </Typography>

            <CustomTextfield
              id="client-master-acc-no"
              value={accountNo}
              handleChange={(e) => setAccountNo(e.target.value)}
              dispatchType={"SET_MASTER_CLIENT_ACCOUNT_NUMBER"}
            />
          </Grid>
          <Grid
            item
            xs={12}
            sm={6}
            lg={3}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" sx={customLabelTypography}>
              Swift Code
            </Typography>

            <CustomTextfield
              id="client-master-swift-code"
              value={swiftCode}
              handleChange={(e) => setSwiftCode(e.target.value)}
              dispatchType={"SET_MASTER_CLIENT_SWIFT_CODE"}
            />
          </Grid>
        </Grid>
      </Paper>
    </div>
  );
}
