import {
  createMasterLineHandlingChargesAction,
  deleteSingleMasterLineHandlingChargesAction,
  dropDownMasterLineHandlingChargesRefCodeAction,
  getLineHandlingChargesListingAction,
  getSingleMasterLineHandlingChargesAction,
  updateMasterLineHandlingChargesAction,
} from "@/actions/master/MasterLineHandlingChargesAction";
import MasterListings from "@/components/reusablecomponents/MasterListings";
import { useSnackbar } from "notistack";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  useHistory,
  useParams,
} from "react-router-dom/cjs/react-router-dom.min";
import * as Yup from "yup";
import { Formik } from "formik";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Grid,
  Modal,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import { EditOutlined } from "@mui/icons-material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { MASTER_LINE_HANDLING_CHARGES } from "@/reducers/master/MasterLineHandlingChargesReducer";

const tableRow = [
  {
    id: 2,
    name: "ref_code",
  },
  {
    id: 3,
    name: "size_20_rate",
  },
  {
    id: 4,
    name: "size_40_rate",
  },
  {
    id: 5,
    name: "night_charge_size_20_rate",
  },
  {
    id: 6,
    name: "night_charge_size_40_rate",
  },
  {
    id: 7,
    name: "action",
  },
];

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",

  width: {
    xs: "95%",
    sm: 700,
    md: 850,
    lg: 1000,
  },

  maxHeight: "85vh",
  overflowY: "auto",

  bgcolor: "background.paper",
  borderRadius: 3,
  boxShadow: 24,
  p: 4,
};

const MasterLineHandlingCharges = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const { pk } = useParams();
  const formikRef = useRef(null);
  const { role } = useSelector((state) => state.user);
  const {
    allLineHandlingChargesListing,
    lineHandlingChargesSingleDetails,
    lineHandlingChargesRefCodeDropDown,
  } = useSelector((state) => state.MasterLineHandlingChargesReducer);
  const notify = useSnackbar().enqueueSnackbar;
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [initialValues, setInitialValues] = useState({
    ref_code: "",
    size_20_rate: "",
    size_40_rate: "",
    night_charge_size_20_rate: 0,
    night_charge_size_40_rate: 0,
  });

  const validationSchema = useMemo(() => {
    return Yup.object({
      ref_code: Yup.string()
        .required("Reference code is required")
        .oneOf(
          lineHandlingChargesRefCodeDropDown ?? [],
          "Please select a valid Ref Code",
        )
        .test("valid-client", "Please select a valid Ref Code", (value) =>
          lineHandlingChargesRefCodeDropDown.some(
            (client) => client.toLowerCase() === (value || "").toLowerCase(),
          ),
        ),
      size_20_rate: Yup.number()
        .typeError("Must be a number")
        .required("20 Size rate is required")
        .moreThan(0, "Must be greater than 0"),

      size_40_rate: Yup.number()
        .typeError("Must be a number")
        .required("40 Size rate is required")
        .moreThan(0, "Must be greater than 0"),

      night_charge_size_20_rate: Yup.number()
        .transform((value, originalValue) =>
          originalValue === "" || originalValue == null ? 0 : value,
        )
        .min(0, "Cannot be negative"),

      night_charge_size_40_rate: Yup.number()
        .transform((value, originalValue) =>
          originalValue === "" || originalValue == null ? 0 : value,
        )
        .min(0, "Cannot be negative"),
    });
  }, [lineHandlingChargesRefCodeDropDown]);

  useEffect(() => {
    dispatch(getLineHandlingChargesListingAction(notify));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (pk && pk !== "new") {
      dispatch(getSingleMasterLineHandlingChargesAction(pk, notify));
    }
  }, [pk]);

  useEffect(() => {
    dispatch(
      dropDownMasterLineHandlingChargesRefCodeAction(
        ["client_ref_codes"],
        notify,
      ),
    );
  }, [open]);

  useEffect(() => {
    if (lineHandlingChargesSingleDetails && pk && pk !== "new") {
      setInitialValues({
        ref_code: lineHandlingChargesSingleDetails.ref_code || "",
        size_20_rate: lineHandlingChargesSingleDetails.size_20_rate || "",
        size_40_rate: lineHandlingChargesSingleDetails.size_40_rate || "",
        night_charge_size_20_rate:
          lineHandlingChargesSingleDetails.night_charge_size_20_rate || 0,
        night_charge_size_40_rate:
          lineHandlingChargesSingleDetails.night_charge_size_40_rate || 0,
      });

      setInputValue(lineHandlingChargesSingleDetails.ref_code || "");
    }
  }, [lineHandlingChargesSingleDetails]);

  const handleButtonClick = () => {
    history.push("/master/line-handling-charges/new");
  };

  const handleOnClose = () => {
    setInputValue("");
    dispatch({
      type: MASTER_LINE_HANDLING_CHARGES.MASTER_LINE_HANDLING_CHARGES_SINGLE_DETAILS_INIT,
    });

    setInitialValues({
      ref_code: "",
      size_20_rate: "",
      size_40_rate: "",
      night_charge_size_20_rate: 0,
      night_charge_size_40_rate: 0,
    });
    history.goBack();
    formikRef.current?.resetForm();
  };

  const lineChargesHandleSingleDelete = (resetForm) => {
    dispatch(
      deleteSingleMasterLineHandlingChargesAction(
        pk,
        handleOnClose,
        resetForm,
        notify,
      ),
    );
  };

  return (
    <>
      <MasterListings
        rowArray={tableRow}
        masterArray={allLineHandlingChargesListing}
        buttonName={"Line Handling Charges"}
        buttonClick={handleButtonClick}
      />
      <Modal open={Boolean(pk)} onClose={handleOnClose}>
        <Box sx={style}>
          <Formik
            innerRef={formikRef}
            enableReinitialize
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={(values, { resetForm }) => {
              if (pk && pk !== "new") {
                dispatch(
                  updateMasterLineHandlingChargesAction(
                    pk,
                    values,
                    handleOnClose,
                    resetForm,
                    notify,
                  ),
                );
              } else {
                dispatch(
                  createMasterLineHandlingChargesAction(
                    values,
                    handleOnClose,
                    resetForm,
                    notify,
                  ),
                );
              }
            }}
          >
            {({
              values,
              errors,
              touched,
              handleBlur,
              handleChange,
              handleSubmit,
              setFieldValue,
              setFieldTouched,
              resetForm,
            }) => (
              <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  {/* Reference Code */}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="body2" fontWeight={600} mb={0.5}>
                      Ref Code <span style={{ color: "red" }}>*</span>
                    </Typography>

                    <Autocomplete
                      options={lineHandlingChargesRefCodeDropDown}
                      value={values.ref_code || null}
                      inputValue={inputValue}
                      onInputChange={(event, value) => {
                        setInputValue(value);
                        setFieldValue("ref_code", value);
                      }}
                      onChange={(event, value) => {
                        setInputValue(value ?? "");
                        setFieldValue("ref_code", value ?? "");
                      }}
                      onBlur={() => {
                        setFieldTouched("ref_code", true);
                      }}
                      autoHighlight
                      selectOnFocus
                      clearOnBlur={false}
                      handleHomeEndKeys
                      disabled={pk && pk !== "new"}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          size="small"
                          placeholder="Search Reference Code"
                          error={touched.ref_code && Boolean(errors.ref_code)}
                          helperText={touched.ref_code && errors.ref_code}
                          sx={{
                            "& .MuiOutlinedInput-root.Mui-disabled": {
                              bgcolor: "#F5F5F5", // Background
                            },
                            "& .MuiInputBase-input.Mui-disabled": {
                              WebkitTextFillColor: "#616161",
                              color: "#616161",
                            },
                            "& .MuiInputLabel-root.Mui-disabled": {
                              color: "#757575",
                            },
                          }}
                        />
                      )}
                    />
                  </Grid>

                  {/* 20 Size Rate */}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="body2" fontWeight={600} mb={0.5}>
                      20 Size Rate <span style={{ color: "red" }}>*</span>
                    </Typography>

                    <TextField
                      fullWidth
                      type="number"
                      name="size_20_rate"
                      placeholder="Enter 20 Size Rate"
                      value={values.size_20_rate}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      slotProps={{
                        htmlInput: {
                          step: "0.1",
                          min: 0,
                        },
                      }}
                      size="small"
                      error={
                        touched.size_20_rate && Boolean(errors.size_20_rate)
                      }
                      helperText={touched.size_20_rate && errors.size_20_rate}
                    />
                  </Grid>

                  {/* 40 Size Rate */}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="body2" fontWeight={600} mb={0.5}>
                      40 Size Rate <span style={{ color: "red" }}>*</span>
                    </Typography>

                    <TextField
                      fullWidth
                      type="number"
                      name="size_40_rate"
                      size="small"
                      placeholder="Enter 40 Size Rate"
                      value={values.size_40_rate}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      slotProps={{
                        htmlInput: {
                          step: "0.1",
                          min: 0,
                        },
                      }}
                      error={
                        touched.size_40_rate && Boolean(errors.size_40_rate)
                      }
                      helperText={touched.size_40_rate && errors.size_40_rate}
                    />
                  </Grid>

                  {/* Night Charge 20 */}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="body2" fontWeight={600} mb={0.5}>
                      Night Charge (20 Size){" "}
                    </Typography>

                    <TextField
                      fullWidth
                      type="number"
                      name="night_charge_size_20_rate"
                      placeholder="Enter Night Charge"
                      size="small"
                      value={values.night_charge_size_20_rate}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      slotProps={{
                        htmlInput: {
                          step: "0.1",
                          min: 0,
                        },
                      }}
                      error={
                        touched.night_charge_size_20_rate &&
                        Boolean(errors.night_charge_size_20_rate)
                      }
                      helperText={
                        touched.night_charge_size_20_rate &&
                        errors.night_charge_size_20_rate
                      }
                    />
                  </Grid>

                  {/* Night Charge 40 */}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="body2" fontWeight={600} mb={0.5}>
                      Night Charge (40 Size){" "}
                    </Typography>

                    <TextField
                      fullWidth
                      type="number"
                      name="night_charge_size_40_rate"
                      placeholder="Enter Night Charge"
                      size="small"
                      value={values.night_charge_size_40_rate}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      slotProps={{
                        htmlInput: {
                          step: "0.1",
                          min: 0,
                        },
                      }}
                      error={
                        touched.night_charge_size_40_rate &&
                        Boolean(errors.night_charge_size_40_rate)
                      }
                      helperText={
                        touched.night_charge_size_40_rate &&
                        errors.night_charge_size_40_rate
                      }
                    />
                  </Grid>

                  {/* Buttons */}
                  <Grid size={{ xs: 12 }}>
                    {role === "Admin" ? (
                      <Stack
                        direction="row"
                        spacing={2}
                        justifyContent="flex-end"
                        mt={2}
                      >
                        <Button
                          variant="outlined"
                          color="secondary"
                          onClick={handleOnClose}
                        >
                          Cancel
                        </Button>
                        {pk && pk !== "new" && (
                          <Button
                            onClick={() =>
                              lineChargesHandleSingleDelete(resetForm)
                            }
                            variant="contained"
                            color="error"
                            startIcon={<DeleteOutlineIcon />}
                            sx={{
                              minWidth: 140,
                              borderRadius: 2,
                              textTransform: "none",
                              fontWeight: 600,
                              px: 3,
                              py: 1.2,
                              boxShadow: 3,
                              transition: "all .2s ease",
                              "&:hover": {
                                boxShadow: 6,
                                transform: "translateY(-1px)",
                              },
                            }}
                          >
                            Delete
                          </Button>
                        )}

                        <Button
                          type="submit"
                          variant="contained"
                          color="secondary"
                          startIcon={
                            pk && pk !== "new" ? (
                              <EditOutlined />
                            ) : (
                              <SaveOutlinedIcon />
                            )
                          }
                          sx={{
                            minWidth: 140,
                            borderRadius: 2,
                            textTransform: "none",
                            fontWeight: 600,
                            px: 3,
                            py: 1.2,
                            boxShadow: 3,
                            transition: "all .2s ease",
                            "&:hover": {
                              boxShadow: 6,
                              transform: "translateY(-1px)",
                            },
                          }}
                        >
                          {pk && pk !== "new"
                            ? "Update Line Handling Charges"
                            : "Create Line Handling Charges"}
                        </Button>
                      </Stack>
                    ) : (
                      <Alert color="error">
                        Only Admin has the Permission to make changes in Line
                        Handling Charges
                      </Alert>
                    )}
                  </Grid>
                </Grid>
              </form>
            )}
          </Formik>
        </Box>
      </Modal>
    </>
  );
};

export default MasterLineHandlingCharges;
