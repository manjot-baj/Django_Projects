import {
  Alert,
  Box,
  Button,
  Divider,
  Grid,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { Form, Formik } from "formik";
import * as Yup from "yup";
import { customLabelTypography } from "@/utils/CustomClasses";
import AddToolTransferComponent from "./AddToolTransferComponent";
import AddedToolListingcomponent from "./AddedToolListingcomponent";
import { useDispatch, useSelector } from "react-redux";
import { useSnackbar } from "notistack";
import {
  getToolTransferNoAction,
  requestToolTransferAction,
} from "@/actions/Procurement/toolTransferAction";
import GateInTextField from "../reusablecomponents/GateInTextField";
import { toolGetAllCategoryByAdminAction } from "@/actions/Procurement/procurementAction";

const ToolTransferNewTransferDefaultComp = ({ handleChangeTab }) => {
  const notify = useSnackbar().enqueueSnackbar;
  const dispatch = useDispatch();
  const [adminMessage, setAdminMessage] = useState(false);
  const { toolTransferReducer, user } = useSelector((state) => state);
  const { toolRequest } = toolTransferReducer;
  const { procurement_admin } = user;

  const [toolTransferFormInitial, setToolTransferFormInitial] = useState({
    date: new Date().toISOString().split("T")[0],
    tool_transfer_no: "",
    transfer_type: "",
    admin: "",
    admin_id: "",
    admin_location_id: "",
    tool_list: [],
    fromLocation: "",
    toLocation: "",
    quantity: "",
    requestedBy: "",
    remarks: "",
  });
  const [toolAddData, setToolAddData] = useState({
    category: "",
    category_id: "",
    tool_id: "",
    name: "",
    quantity: "",
  });

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleSubmit = (values, { resetForm }) => {
    if (values.date === "") {
      notify("Please select a date", { variant: "warning" });
    } else {
      let tool_request_payload = {
        date: values.date,
        tool_transfer_no: values.tool_transfer_no,
        transfer_type: values.transfer_type,
        tool_request_line: values.tool_list,
      };
      if (values.transfer_type === "Location Transfer") {
        tool_request_payload.all_admin_sites = toolRequest?.admin_sites;
        delete tool_request_payload.admin_sites;
      } else {
        delete tool_request_payload.all_admin_sites;
        tool_request_payload.admin_sites = toolRequest?.admin_sites;
      }


      dispatch(
        requestToolTransferAction(
          tool_request_payload,
          values.admin_id,
          notify,
          scrollToTop,
          handleChangeTab
        ),
      );
    }
    resetForm();
  };

  const handleClearAllDataToolAdd = () => {
    setToolAddData((prev) => ({
      ...prev,
      category: "",
      category_id: "",
      name: "",
      tool_id: "",
      quantity: 0,
    }));
  };

  const validationSchema = React.useMemo(
    () =>
      Yup.object({
        date: Yup.date().required("Date is required"),

        transfer_type: Yup.string()
          .required("Tool Transfer Type is required")
          .test(
            "site-transfer-validation",
            "Procurement Admin can only do Location Transfer",
            function (value) {
              return !(
                (procurement_admin === true || procurement_admin === "True") &&
                procurement_admin !== "False" &&
                value === "Site Transfer"
              );
            },
          )
          .test(
            "site-transfer-validation-non-admin",
            "A Non Procurement Admin Site  can only do Site Transfer (Parent -> Child)",
            function (value) {
              return !(
                (procurement_admin === "False" ||
                  procurement_admin === false) &&
                value === "Location Transfer"
              );
            },
          ),

        admin: Yup.string().when("transfer_type", {
          is: (value) => !!value,
          then: (schema) => schema.required("Admin is required"),
        }),
        admin_location_id: Yup.number().required(
          "Requested Admin Location ID is required",
        ),
        admin_id: Yup.number().required("Requested Admin ID is required "),
        tool_list: Yup.array()
          .of(
            Yup.object({
              category: Yup.string().required("Category is required"),
              name: Yup.string().required("Item Name is required"),
              category_id: Yup.number().required("Category ID is required"),
              tool_id: Yup.number().required("Item  ID is required"),
              quantity: Yup.number()
                .required("Quantity is required")
                .min(1, "Quantity must be greater than 0"),
            }),
          )
          .min(1, "At least one tool is required"),
      }),
    [procurement_admin],
  );

  return (
    <Paper
      elevation={0}
      sx={{
        mx: 1,
        minHeight: "calc(100vh - 250px)",
        borderRadius: 2.5,
        py: 3,
        px: 2,
        display: "flex",
        flexDirection: "column",
        bgcolor: "#FAFCFE",
      }}
    >
      <Box sx={{ px: 2, flexGrow: 1 }}>
        <Formik
          initialValues={toolTransferFormInitial}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({
            values,
            errors,
            touched,
            handleChange,
            handleBlur,
            setFieldValue,
            resetForm,
          }) => {
            const handleAdminTypechange = async (e) => {
              const adminTypeSiteName = e.target.value;
              let adminTypePKSite = toolRequest?.admin_sites?.find(
                (item) => item.name === adminTypeSiteName,
              );

              setFieldValue("admin", adminTypeSiteName);
              setFieldValue("admin_id", adminTypePKSite.pk);
              if (values.transfer_type === "Site Transfer") {
                setFieldValue("admin_location_id", user.location_id);
                dispatch(
                  toolGetAllCategoryByAdminAction(
                    adminTypePKSite?.pk,
                    user.location_id,
                    notify,
                  ),
                );
              } else {
                setFieldValue(
                  "admin_location_id",
                  adminTypePKSite?.location_pk,
                );
                dispatch(
                  toolGetAllCategoryByAdminAction(
                    adminTypePKSite?.pk,
                    adminTypePKSite?.location_pk,
                    notify,
                  ),
                );
              }
            };

            return (
              <Form
                style={{
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                }}
              >
                <Grid container columnSpacing={4} rowSpacing={2}>
                  <Grid item size={{ xs: 12, md: 3 }}>
                    <Typography sx={customLabelTypography}>
                      Tool Transfer Type <span style={{ color: "red" }}>*</span>
                    </Typography>
                    <TextField
                      fullWidth
                      select
                      size="small"
                      name="transfer_type"
                      value={values.transfer_type}
                      onChange={(e) => {
                        handleChange(e);
                        if (
                          (procurement_admin === true ||
                            procurement_admin === "True") &&
                          !procurement_admin !== "False" &&
                          e.target.value === "Site Transfer"
                        ) {
                          return;
                        }
                        if (
                          (procurement_admin === "False" ||
                            procurement_admin === false) &&
                          e.target.value === "Location Transfer"
                        ) {
                          return;
                        }
                        dispatch(
                          getToolTransferNoAction(
                            e.target.value,
                            setFieldValue,
                            notify,
                          ),
                        );
                      }}
                      onBlur={handleBlur}
                      error={
                        touched.transfer_type &&
                        Boolean(errors.transfer_type)
                      }
                      sx={{ marginTop: 1 }}
                      helperText={
                        touched.transfer_type && errors.transfer_type
                      }
                    >
                      <MenuItem value="Location Transfer">
                        Location Transfer
                      </MenuItem>

                      <MenuItem value="Site Transfer">Site Transfer</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item size={{ xs: 12, md: 3 }}>
                    <Typography
                      sx={customLabelTypography}
                      style={{ marginBottom: 8 }}
                    >
                      Tool Transfer No. <span style={{ color: "red" }}>*</span>
                    </Typography>
                    <GateInTextField
                      readOnlyP={true}
                      value={values.tool_transfer_no}
                    />
                  </Grid>
                  <Grid item size={{ xs: 12, md: 3 }}>
                    <Typography sx={customLabelTypography}>
                      Tool Transfer Date <span style={{ color: "red" }}>*</span>
                    </Typography>
                    <TextField
                      error={Boolean(touched.date && errors.date)}
                      helperText={touched.date && errors.date}
                      variant="outlined"
                      name="date"
                      autoComplete="new-password"
                      fullWidth
                      type="date"
                      size="small"
                      value={values.date}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      sx={{ marginTop: 1 }}
                    />
                  </Grid>
                  {/* TOOL */}

                  <Grid item size={{ xs: 12, md: 3 }}>
                    <Typography sx={customLabelTypography}>
                      Select Admin
                      <span style={{ color: "red" }}>*</span>
                    </Typography>
                    <TextField
                      fullWidth
                      select
                      size="small"
                      name="admin"
                      value={values.admin}
                      onChange={handleAdminTypechange}
                      onBlur={handleBlur}
                      disabled={!values.transfer_type}
                      error={
                        adminMessage && !values.transfer_type
                          ? true
                          : touched.admin && Boolean(errors.admin)
                      }
                      helperText={
                        adminMessage && !values.transfer_type
                          ? "Please select transfer type first"
                          : touched.admin && errors.admin
                      }
                      sx={{ mt: 1 }}
                      onMouseDown={(e) => {
                        if (!values.transfer_type) {
                          e.preventDefault(); // Prevent dropdown opening
                          setAdminMessage(true);
                        }
                      }}
                    >
                      {toolRequest?.admin_sites?.map((admin_site_item) => (
                        <MenuItem
                          key={admin_site_item?.pk}
                          value={admin_site_item.name}
                        >
                          {admin_site_item?.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                </Grid>
                <Box
                  sx={{
                    flexDirection: "column",
                    flexGrow: 1,
                    display: "flex",
                    alignItems: "flex-start",
                    width: "100%",
                    justifyContent: "flex-start",
                    gap: 2,
                  }}
                >
                  <AddedToolListingcomponent toolListing={values.tool_list} />

                  {values.tool_transfer_no && values.admin && (
                    <AddToolTransferComponent
                      setToolAddData={setToolAddData}
                      handleClearAlldata={handleClearAllDataToolAdd}
                      toolAddData={toolAddData}
                      adminPK={values.admin_id}
                      adminLocationPK={values.admin_location_id}
                      tool_listing_values={values.tool_list}
                    />
                  )}
                </Box>

                <Stack
                  sx={{ mt: 6 }}
                  direction={"row"}
                  alignItems={"center"}
                  justifyContent={"flex-end"}
                  spacing={2}
                >
                  <Button
                    onClick={() => resetForm()}
                    sx={{
                      textTransform: "none",
                      color: "#64748b",
                    }}

                  >
                    Clear Data
                  </Button>

                  <Button
                    type="submit"
                    variant="contained"
                    color="secondary"
                    sx={{
                      width: 250,
                      height: 50,
                      borderRadius: 3,
                      textTransform: "none",
                      fontSize: "1rem",
                      fontWeight: 700,
                      color: "#fff",
                      background:
                        "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                      boxShadow: "0 8px 20px rgba(34, 197, 94, 0.35)",
                      transition: "all 0.25s ease",
                      "&:hover": {
                        background:
                          "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
                        transform: "translateY(-2px)",
                        boxShadow: "0 12px 28px rgba(34, 197, 94, 0.45)",
                      },
                      "&:active": {
                        transform: "translateY(0)",
                      },
                    }}
                  >
                    Send Transfer Request
                  </Button>
                </Stack>
              </Form>
            );
          }}
        </Formik>
      </Box>
    </Paper>
  );
};

export default ToolTransferNewTransferDefaultComp;
