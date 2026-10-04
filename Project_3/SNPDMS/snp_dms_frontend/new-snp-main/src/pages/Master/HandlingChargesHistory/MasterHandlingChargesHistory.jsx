import {
  createMasterHandlingChargesHistoryAction,
  deleteSingleMasterHandlingChargesHistoryAction,
  dropDownMasterHandlingChargesHistoryRefCodeAction,
  getHandlingChargesHistoryListingAction,
  getSingleMasterHandlingChargesHistoryAction,
  updateMasterHandlingChargesHistoryAction,
} from "@/actions/master/MasterHandlingChargesHistoryAction";
import MasterListings from "@/components/reusablecomponents/MasterListings";
import { MASTER_HANDLING_CHARGES_HISTORY } from "@/reducers/master/MasterHandlingChargesHistoryReducer";
import {
  Box,
  Grid,
  MenuItem,
  Modal,
  Stack,
  TextField,
  Typography,
  Autocomplete,
  Button,
  Alert,
} from "@mui/material";
import { useSnackbar } from "notistack";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  useHistory,
  useParams,
} from "react-router-dom/cjs/react-router-dom.min";
import * as Yup from "yup";
import { Formik } from "formik";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import { EditOutlined } from "@mui/icons-material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

const tableRow = [
  {
    id: 2,
    name: "ref_code",
  },
  {
    id: 3,
    name: "client_type",
  },
  {
    id: 4,
    name: "size_20_rate",
  },
  {
    id: 5,
    name: "size_40_rate",
  },
  {
    id: 6,
    name: "night_charge_size_20_rate",
  },
  {
    id: 7,
    name: "night_charge_size_40_rate",
  },
  {
    id: 8,
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

const MasterHandlingChargesHistory = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const { pk } = useParams();
  const formikRef = useRef(null);
  const notify = useSnackbar().enqueueSnackbar;
  const { role } = useSelector((state) => state.user);
  const {
    allHandlingChargesHistoryListing,
    handlingChargesHistorySingleDetails,
    handlingChargesHistoryRefCodeDropDown,
  } = useSelector((state) => state.MasterHandlingChargesHistoryReducer);
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [initialValues, setInitialValues] = useState({
    ref_code: "",
    client_type: "",
    size_20_rate: "",
    size_40_rate: "",
    night_charge_size_20_rate: 0,
    night_charge_size_40_rate: 0,
  });

  const validationSchema = useMemo(() => {
    return Yup.object({
      ref_code: Yup.string().when("client_type", {
        is: "Party",
        then: (schema) => schema.notRequired(),
        otherwise: (schema) =>
          schema
            .required("Reference code is required")
            .oneOf(
              handlingChargesHistoryRefCodeDropDown ?? [],
              "Please select a valid Ref Code",
            )
            .test("valid-client", "Please select a valid Ref Code", (value) =>
              handlingChargesHistoryRefCodeDropDown.some(
                (client) =>
                  client.toLowerCase() === (value || "").toLowerCase(),
              ),
            ),
      }),
      client_type: Yup.string().required("Client Type is Required."),
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
  }, [handlingChargesHistoryRefCodeDropDown]);

  useEffect(() => {
    dispatch(getHandlingChargesHistoryListingAction(notify));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (pk && pk !== "new") {
      dispatch(getSingleMasterHandlingChargesHistoryAction(pk, notify));
    }
  }, [pk]);

  useEffect(() => {
    dispatch(
      dropDownMasterHandlingChargesHistoryRefCodeAction(
        ["client_ref_codes"],
        notify,
      ),
    );
  }, [open]);

  useEffect(() => {
    if (handlingChargesHistorySingleDetails && pk && pk !== "new") {
      setInitialValues({
        client_type: handlingChargesHistorySingleDetails.client_type || "",
        ref_code: handlingChargesHistorySingleDetails.ref_code || "",
        size_20_rate: handlingChargesHistorySingleDetails.size_20_rate || "",
        size_40_rate: handlingChargesHistorySingleDetails.size_40_rate || "",
        night_charge_size_20_rate:
          handlingChargesHistorySingleDetails.night_charge_size_20_rate || 0,
        night_charge_size_40_rate:
          handlingChargesHistorySingleDetails.night_charge_size_40_rate || 0,
      });

      setInputValue(handlingChargesHistorySingleDetails.ref_code || "");
    }
  }, [handlingChargesHistorySingleDetails]);

  const handleButtonClick = () => {
    history.push("/master/handling-charges-history/new");
  };

  const handleOnClose = () => {
    setInputValue("");
    dispatch({
      type: MASTER_HANDLING_CHARGES_HISTORY.MASTER_HANDLING_CHARGES_HISTORY_SINGLE_DETAILS_INIT,
    });

    setInitialValues({
      client_type: "",
      ref_code: "",
      size_20_rate: "",
      size_40_rate: "",
      night_charge_size_20_rate: 0,
      night_charge_size_40_rate: 0,
    });
    history.goBack();
    formikRef.current?.resetForm();
  };

  const handleHandlingChargesSingleDelete = (resetForm) => {
    dispatch(
      deleteSingleMasterHandlingChargesHistoryAction(
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
        masterArray={allHandlingChargesHistoryListing}
        buttonName={"Handling Charges History"}
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
                  updateMasterHandlingChargesHistoryAction(
                    pk,
                    values,
                    handleOnClose,
                    resetForm,
                    notify,
                  ),
                );
              } else {
                dispatch(
                  createMasterHandlingChargesHistoryAction(
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
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="body2" fontWeight={600} mb={0.5}>
                      Client Type <span style={{ color: "red" }}>*</span>
                    </Typography>
                    <TextField
                      fullWidth
                      type="text"
                      name="client_type"
                      placeholder="Enter 20 Size Rate"
                      value={values.client_type}
                      onChange={(e) => {
                        const value = e.target.value;

                        setFieldValue("client_type", value);

                        if (value === "Party") {
                          setFieldValue("ref_code", "");
                          setInputValue("");
                        }
                      }}
                      onBlur={handleBlur}
                      disabled={pk && pk !== "new"}
                      size="small"
                      select
                      error={touched.client_type && Boolean(errors.client_type)}
                      helperText={touched.client_type && errors.client_type}
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
                    >
                      <MenuItem value="Line">Line</MenuItem>
                      <MenuItem value="Party">Party</MenuItem>
                    </TextField>
                  </Grid>
                  {/* Reference Code */}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="body2" fontWeight={600} mb={0.5}>
                      Ref Code <span style={{ color: "red" }}>*</span>
                    </Typography>

                    <Autocomplete
                      options={handlingChargesHistoryRefCodeDropDown}
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
                      disabled={
                        values.client_type === "Party" ||
                        values.client_type === "" ||
                        (pk && pk !== "new")
                      }
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
                      size="small"
                      slotProps={{
                        htmlInput: {
                          step: "0.1",
                          min: 0,
                        },
                      }}
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
                      slotProps={{
                        htmlInput: {
                          step: "0.1",
                          min: 0,
                        },
                      }}
                      onBlur={handleBlur}
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
                  <Grid size={12}>
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
                              handleHandlingChargesSingleDelete(resetForm)
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
                            ? "Update  Handling Charges History"
                            : "Create  Handling Charges History"}
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

export default MasterHandlingChargesHistory;
