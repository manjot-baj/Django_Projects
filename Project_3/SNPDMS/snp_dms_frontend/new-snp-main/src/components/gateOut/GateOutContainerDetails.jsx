import React, { useState, useEffect } from "react";
import { Typography, Paper, Grid, Button } from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import CustomTextfield from "@components/reusablecomponents/GateInTextField";
import { customLabelTypography } from "../../utils/CustomClasses";

const GateOutContainerDetails = () => {
  const store = useSelector((state) => state);
  const dispatch = useDispatch();
  const { gateOutContainerDetails, gateOutEdit } = store;
  const [clientName, setClientName] = useState("");
  const [containerNumber, setContainerNumber] = useState("");
  const [size, setSize] = useState("");
  const [containerType, setContainerType] = useState("");
  // eslint-disable-next-line no-unused-vars
  const [payload, setPayload] = useState("");
  const [grossWeight, setGrossWeight] = useState("");
  const [tareWeight, setTareWeight] = useState("");
  const [manufacturingDate, setManufacturingDate] = useState("");
  const [shippingLine, setShippingLine] = useState("");
  const [doNotLiftRemark, setDoNotLiftRemark] = React.useState("");

  useEffect(() => {
    if (gateOutContainerDetails.gateOutContainerDetails.container_no) {
      // Container number
      setContainerNumber(
        gateOutContainerDetails.gateOutContainerDetails.container_no
      );
      // CLIENT NAME
      setClientName(gateOutContainerDetails.gateOutContainerDetails.client);
      //
      setShippingLine(
        gateOutContainerDetails.gateOutContainerDetails.shipping_line
      );
      // shipping line
      setSize(gateOutContainerDetails.gateOutContainerDetails.size);
      // type
      setContainerType(gateOutContainerDetails.gateOutContainerDetails.type);
      // container payload
      setPayload(gateOutContainerDetails.gateOutContainerDetails.payload);
      // container grossweight
      setGrossWeight(gateOutContainerDetails.gateOutContainerDetails.gross_wt);
      // tare weight
      setTareWeight(gateOutContainerDetails.gateOutContainerDetails.tare_wt);
      // manufacturing date
      setManufacturingDate(
        gateOutContainerDetails.gateOutContainerDetails.manufacturing_date
      );
      setDoNotLiftRemark(
        gateOutContainerDetails.gateOutContainerDetails.do_not_lift_remarks
      );
    } else if (gateOutEdit.selectedContainer.container_data.container_no) {
      // Container number
      setContainerNumber(
        gateOutEdit.selectedContainer.container_data.container_no
      );
      // CLIENT NAME
      setClientName(gateOutEdit.selectedContainer.container_data.client);
      //
      setShippingLine(
        gateOutEdit.selectedContainer.container_data.shipping_line
      );
      setDoNotLiftRemark(
        gateOutEdit.selectedContainer.container_data.do_not_lift_remarks
      );
      // shipping line
      setSize(gateOutEdit.selectedContainer.container_data.size);
      // type
      setContainerType(gateOutEdit.selectedContainer.container_data.type);
      // container payload
      setPayload(gateOutEdit.selectedContainer.container_data.payload);
      // container grossweight
      setGrossWeight(gateOutEdit.selectedContainer.container_data.gross_wt);
      // tare weight
      setTareWeight(gateOutEdit.selectedContainer.container_data.tare_wt);
      // manufacturing date
      setManufacturingDate(
        gateOutEdit.selectedContainer.container_data.manufacturing_date
      );
    }
  }, [
    gateOutContainerDetails.gateOutContainerDetails,
    gateOutEdit.selectedContainer,
  ]);

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography
          variant="subtitle2"
          style={{ paddingTop: 14, paddingBottom: 14 }}
        >
          Container details
        </Typography>
        {(containerNumber ||
          gateOutEdit.selectedContainer.container_data.container_no) && (
          <Button
            variant="contained"
            color="secondary"
            onClick={() => window.location.reload()}
            style={{
              paddingLeft: 8,
              paddingRight: 8,
            }}
          >
            Refresh
          </Button>
        )}
      </div>
      <Paper
        sx={(theme) => ({
          padding: theme.spacing(2, 3),
        })}
        elevation={0}
      >
        <Grid container spacing={3}>
          <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <Typography variant="subtitle1" sx={customLabelTypography}>
              Client Name <span style={{ color: "red" }}>*</span>
            </Typography>
            <CustomTextfield
              id="gate-out-client-name"
              value={clientName}
              readOnlyP={true}
            />
          </Grid>
          <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <Typography variant="subtitle1" sx={customLabelTypography}>
              Container Number <span style={{ color: "red" }}>*</span>
            </Typography>
            <CustomTextfield
              id="gate-out-container-number"
              value={containerNumber}
              readOnlyP={true}
            />
          </Grid>
          <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <Typography variant="subtitle1" sx={customLabelTypography}>
              Size <span style={{ color: "red" }}>*</span>
            </Typography>
            <CustomTextfield id="gate-out-size" value={size} readOnlyP={true} />
          </Grid>
          <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <Typography variant="subtitle1" sx={customLabelTypography}>
              Type <span style={{ color: "red" }}>*</span>
            </Typography>
            <CustomTextfield
              id="gate-out-type"
              value={containerType}
              readOnlyP={true}
            />
          </Grid>
          <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <Typography variant="subtitle1" sx={customLabelTypography}>
              Payload
            </Typography>
            <CustomTextfield
              id="gate-out-payload"
              value={
                parseFloat(
                  gateOutContainerDetails.gateOutContainerDetails.gross_wt
                ) -
                // tare weight
                parseFloat(
                  gateOutContainerDetails.gateOutContainerDetails.tare_wt
                )
              }
              readOnlyP={true}
            />
          </Grid>
          <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <Typography variant="subtitle1" sx={customLabelTypography}>
              Gross weight
              {/* <span style={{ color: 'red' }}>*</span> */}
            </Typography>
            <CustomTextfield
              id="gate-out-gross-weight"
              value={grossWeight}
              readOnlyP={true}
            />
          </Grid>
          <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <Typography variant="subtitle1" sx={customLabelTypography}>
              Tare weight
            </Typography>
            <CustomTextfield
              id="gate-out-tare-weight"
              value={tareWeight}
              readOnlyP={true}
            />
          </Grid>
          <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <Typography variant="subtitle1" sx={customLabelTypography}>
              Manufacturing date <span style={{ color: "red" }}>*</span>
            </Typography>
            <CustomTextfield
              id="gate-out-manufacturing-date"
              value={manufacturingDate}
              readOnlyP={true}
            />
          </Grid>
          <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <Typography variant="subtitle1" sx={customLabelTypography}>
              Shipping Line <span style={{ color: "red" }}>*</span>
            </Typography>
            <CustomTextfield
              id="gate-out-shipping-line"
              value={shippingLine}
              readOnlyP={true}
            />
          </Grid>
          <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <Typography variant="subtitle1" sx={customLabelTypography}>
              Leased box
            </Typography>
            <Grid
              container
              spacing={1}
              sx={{
                border: "1px solid #243545",
                marginTop: "0rem",
                display: "flex",
                borderRadius: 6,
              }}
            >
              <Grid item size={{ xs: 6 }}>
                <Button
                  sx={(theme)=>({
                    backgroundColor: gateOutContainerDetails
                      .gateOutContainerDetails.container_no
                      ? gateOutContainerDetails.gateOutContainerDetails
                          .leased_box === "False"
                        ? theme.palette.primary.main // selectedChoice color
                        : "#fff" // choice color
                      : gateOutEdit.selectedContainer.container_data
                          .container_no
                      ? gateOutEdit.selectedContainer.container_data
                          .leased_box === "False"
                        ? theme.palette.primary.main // selectedChoice color
                        : "#fff" // choice color
                      : theme.palette.primary.main, // default selectedChoice color
                    color: gateOutContainerDetails.gateOutContainerDetails
                      .container_no
                      ? gateOutContainerDetails.gateOutContainerDetails
                          .leased_box === "False"
                        ? "#fff" // selectedChoice text color
                        : "#000" // choice text color
                      : gateOutEdit.selectedContainer.container_data
                          .container_no
                      ? gateOutEdit.selectedContainer.container_data
                          .leased_box === "False"
                        ? "#fff" // selectedChoice text color
                        : "#000" // choice text color
                      : "#fff", // default selectedChoice text color
                    width: "100%",
                    padding: 1,
                    borderRadius: 5,
                    "&:hover": {
                      backgroundColor: gateOutContainerDetails
                        .gateOutContainerDetails.container_no
                        ? gateOutContainerDetails.gateOutContainerDetails
                            .leased_box === "False"
                          ? theme.palette.primary.main // selectedChoice hover color
                          : "#fff" // choice hover color
                        : gateOutEdit.selectedContainer.container_data
                            .container_no
                        ? gateOutEdit.selectedContainer.container_data
                            .leased_box === "False"
                          ? theme.palette.primary.main // selectedChoice hover color
                          : "#fff" // choice hover color
                        : theme.palette.primary.main, // default selectedChoice hover color
                    },
                  })}
                  onClick={() => {
                    dispatch({
                      type: gateOutEdit.selectedContainer.container_data
                        .leased_box
                        ? "EDIT_GATE_OUT_LEASED_BOX"
                        : "SET_GATE_OUT_LEASED_BOX",
                      payload: "False",
                    });
                  }}
                >
                  No
                </Button>
              </Grid>
              <Grid item size={{ xs: 6 }}>
                <Button
                  sx={(theme)=>({
                    backgroundColor: gateOutContainerDetails
                      .gateOutContainerDetails.container_no
                      ? gateOutContainerDetails.gateOutContainerDetails
                          .leased_box === "True"
                        ? theme.palette.primary.main // selectedChoice color
                        : "#fff" // choice color
                      : gateOutEdit.selectedContainer.container_data
                          .container_no
                      ? gateOutEdit.selectedContainer.container_data
                          .leased_box === "True"
                        ? theme.palette.primary.main // selectedChoice color
                        : "#fff" // choice color
                      : "#fff", // default choice color
                    color: gateOutContainerDetails.gateOutContainerDetails
                      .container_no
                      ? gateOutContainerDetails.gateOutContainerDetails
                          .leased_box === "True"
                        ? "#fff" // selectedChoice text color
                        : "#000" // choice text color
                      : gateOutEdit.selectedContainer.container_data
                          .container_no
                      ? gateOutEdit.selectedContainer.container_data
                          .leased_box === "True"
                        ? "#fff" // selectedChoice text color
                        : "#000" // choice text color
                      : "#000", // default choice text color
                    width: "100%",
                    padding: 1,
                    borderRadius: 5,
                    "&:hover": {
                      backgroundColor: gateOutContainerDetails
                        .gateOutContainerDetails.container_no
                        ? gateOutContainerDetails.gateOutContainerDetails
                            .leased_box === "True"
                          ? theme.palette.primary.main // selectedChoice hover color
                          : "#fff" // choice hover color
                        : gateOutEdit.selectedContainer.container_data
                            .container_no
                        ? gateOutEdit.selectedContainer.container_data
                            .leased_box === "True"
                          ? theme.palette.primary.main // selectedChoice hover color
                          : "#fff" // choice hover color
                        : theme.palette.primary.main, // default selectedChoice hover color
                    },
                  })}
                  onClick={() => {
                    dispatch({
                      type: gateOutEdit.selectedContainer.container_data
                        .leased_box
                        ? "EDIT_GATE_OUT_DO_NOT_LIFT_REMARKS"
                        : "SET_GATE_OUT_DO_NOT_LIFT_REMARKS",
                      payload: "True",
                    });
                  }}
                >
                  Yes
                </Button>
              </Grid>
            </Grid>
          </Grid>
          <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <Typography variant="subtitle1" sx={customLabelTypography}>
              Do Not Lift remark
            </Typography>
            <CustomTextfield
              id="do-not-lift-remark"
              value={doNotLiftRemark}
              readOnlyP={true}
            />
            {/* <TextField
                id="do-not-lift-remark"
                value={doNotLiftRemark}
                variant="outlined"
                fullWidth
                className={classes.textField}
                inputProps={{ className: classes.input }}
                onChange={(e) => {
                  setDoNotLiftRemark(e.target.value);
                  dispatch({
                    type: gateOutEdit.selectedContainer
                      .container_datado_not_lift_remarks
                      ? "EDIT_DO_NOT_LIFT_REMARKS"
                      : "SET_DO_NOT_LIFT_REMARKS",
                    payload: e.target.value,
                  });
                }}
                autoComplete="off"
              /> */}
          </Grid>
        </Grid>
      </Paper>
    </div>
  );
};

export default GateOutContainerDetails;
