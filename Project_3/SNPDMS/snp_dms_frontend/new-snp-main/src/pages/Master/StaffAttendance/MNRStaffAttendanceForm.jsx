import LayoutContainer from "@/components/reusablecomponents/LayoutContainer";
import {
  Button,
  Card,
  Divider,
  CardContent,
  Typography,
  Grid,
  TextField,
  Box,
  MenuItem,
  Backdrop,
  CircularProgress,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import * as Yup from "yup";
import { Formik } from "formik";
import { useSnackbar } from "notistack";
import { useDispatch, useSelector } from "react-redux";
import { custombackDropStyle, customLabelTypography } from "@/utils/CustomClasses";
import { useHistory, useParams } from "react-router-dom";
import CustomBackButton from "@/components/reusablecomponents/CustomBackButton";
import {
  addMNRStaffAttendanceAction,
  deleteMNRStaffAttendanceAction,
  getSingleMNRStaffAttendanceAction,
  informDropdownMNRStaffAttendanceAction,
  updateMNRStaffAttendanceAction,
} from "@/actions/master/MNRStaffAttendenceAction";
import GateInTextField from "@/components/reusablecomponents/GateInTextField";

const MNRStaffAttendanceForm = (props) => {
  const notify = useSnackbar().enqueueSnackbar;
  const history = useHistory();
  const { pk } = useParams();
  const dispatch = useDispatch();
    const { isloading } = useSelector((state) => state.ui);
  const [editing, setIsEditing] = useState(true);
  const { gateIn, MNRStaffAttendanceReducer } = useSelector((state) => state);
  const { staff_attendance_dropdown, get_single_attendance } =
    MNRStaffAttendanceReducer;

  const [staffData, setStaffData] = useState({
    date: new Date(),
    employee: "",
    status: "",
    in_time: null,
    out_time: null,
    remarks: "",
  });

  const handleGoBack = () => {
    history.goBack();
  };

  useEffect(() => {
    dispatch(informDropdownMNRStaffAttendanceAction(notify));
    if (pk === "add") {
      setIsEditing(true);
    } else {
      setIsEditing(false);
      dispatch(getSingleMNRStaffAttendanceAction(pk, notify));
    }
  }, [pk]);

  useEffect(() => {
    if (pk !== "add" && get_single_attendance) {
      setStaffData((prev) => ({
        ...prev,
        date: get_single_attendance.date,
        status: get_single_attendance.status,
        in_time: get_single_attendance.in_time,
        out_time: get_single_attendance.out_time,
        remarks: get_single_attendance.remarks,
        employee: `${get_single_attendance.employee?.firstName} ${get_single_attendance.employee?.lastName}`,
      }));
    }
  }, [pk, get_single_attendance]);

  return (
    <LayoutContainer>
      <CustomBackButton handleGoBack={handleGoBack} />
      <Typography variant="subtitle2">
        <Box fontWeight="fontWeightBold" m={1}>
          {editing ? "Add Staff Attendance" : "Update Staff Attendance"}
        </Box>
      </Typography>
      <Card elevation={0}>
        <Divider sx={{ width: "98%", margin: "auto", mb: 1 }} />
        <CardContent>
          <Formik
            initialValues={staffData}
            enableReinitialize={true}
            validationSchema={Yup.object().shape({
              date: Yup.date()
                .required("Date is Required")
                .max(Date(), "Date cannot be in the future"),
              employee: Yup.string().required("Employee name is Required"),
              status: Yup.string().required("Status is Required"),
              in_time: Yup.string().when("status", {
                is: (status) => status === "Absent" || status === "Leave",
                then: (schema) => schema.nullable(),
                otherwise: (schema) => schema.required("In Time is Required"),
              }),
              out_time: Yup.string()
                .test(
                  "time-check",
                  "Out Time must be after In Time",
                  function (value) {
                    const { in_time } = this.parent;
                    if (!in_time || !value) return true;
                    return value >= in_time;
                  }
                )
                .when("status", {
                  is: (status) => status === "Absent" || status === "Leave",
                  then: (schema) => schema.nullable(),
                  otherwise: (schema) =>
                    schema.required("Out Time is Required"),
                }),
              remarks: Yup.string().nullable(),
            })}
            onSubmit={async (values) => {
              if (values.in_time > values.out_time) {
                notify("In Time Cannot be greater than Out Time ", {
                  variant: "error",
                });
                return;
              }

              if (editing) {
                dispatch(addMNRStaffAttendanceAction(values, history, notify));
              } else {
                values.id = Number(pk);

                dispatch(
                  updateMNRStaffAttendanceAction(
                    pk,
                    get_single_attendance?.employee?.pk,
                    values,
                    history,
                    notify
                  )
                );
              }
            }}
          >
            {({
              errors,
              handleSubmit,
              isSubmitting,
              touched,
              values,
              handleBlur,
              handleChange,
              setFieldValue,
            }) => (
              <form onSubmit={handleSubmit}>
                <Grid container spacing={2} sx={{ marginLeft: 6 }}>
                  <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
                    <Typography variant="subtitle2" sx={customLabelTypography}>
                      Employee<span style={{ color: "red" }}>*</span>
                    </Typography>
                    {editing ? (
                      <TextField
                        error={Boolean(touched.employee && errors.employee)}
                        helperText={touched.employee && errors.employee}
                        margin="none"
                        autoComplete="off"
                        name="employee"
                        fullWidth
                        onChange={handleChange}
                        onBlur={handleBlur}
                        select={true}
                        size="small"
                        value={values.employee}
                        variant="outlined"
                      >
                        {staff_attendance_dropdown?.mnr_staff?.map(
                          (val, ind) => (
                            <MenuItem key={val.pk} value={val.pk}>
                              {val?.firstName} {val?.lastName}
                            </MenuItem>
                          )
                        )}
                      </TextField>
                    ) : (
                      <GateInTextField
                        value={values.employee}
                        readOnlyP={true}
                      />
                    )}
                  </Grid>
                  <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
                    <Typography variant="subtitle2" sx={customLabelTypography}>
                      Date<span style={{ color: "red" }}>*</span>
                    </Typography>

                    <TextField
                      error={Boolean(touched.date && errors.date)}
                      helperText={touched.date && errors.date}
                      margin="none"
                      autoComplete="off"
                      name="date"
                      fullWidth
                      onChange={handleChange}
                      onBlur={handleBlur}
                      type="date"
                      size="small"
                      value={values.date}
                      defaultValue={values.date}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
                    <Typography variant="subtitle2" sx={customLabelTypography}>
                      Status<span style={{ color: "red" }}>*</span>
                    </Typography>
                    <TextField
                      error={Boolean(touched.status && errors.status)}
                      helperText={touched.status && errors.status}
                      margin="none"
                      autoComplete="off"
                      name="status"
                      fullWidth
                      onChange={handleChange}
                      onBlur={handleBlur}
                      select={true}
                      size="small"
                      value={values.status}
                      variant="outlined"
                    >
                      {staff_attendance_dropdown?.mnr_staff_attendance_status?.map(
                        (val, ind) => (
                          <MenuItem key={val} value={val}>
                            {val}
                          </MenuItem>
                        )
                      )}
                    </TextField>
                  </Grid>
                  <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
                    <Typography variant="subtitle2" sx={customLabelTypography}>
                      In Time<span style={{ color: "red" }}>*</span>
                    </Typography>
                    <TextField
                      error={Boolean(touched.in_time && errors.in_time)}
                      helperText={touched.in_time && errors.in_time}
                      margin="none"
                      autoComplete="off"
                      name="in_time"
                      fullWidth
                      onChange={handleChange}
                      onBlur={handleBlur}
                      type="time"
                      size="small"
                      value={values.in_time}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
                    <Typography variant="subtitle2" sx={customLabelTypography}>
                      Out Time<span style={{ color: "red" }}>*</span>
                    </Typography>
                    <TextField
                      error={Boolean(touched.out_time && errors.out_time)}
                      helperText={touched.out_time && errors.out_time}
                      margin="none"
                      autoComplete="off"
                      name="out_time"
                      fullWidth
                      onChange={handleChange}
                      onBlur={handleBlur}
                      type="time"
                      size="small"
                      value={values.out_time}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
                    <Typography variant="subtitle2" sx={customLabelTypography}>
                      Remarks<span style={{ color: "red" }}>*</span>
                    </Typography>
                    <TextField
                      error={Boolean(touched.remarks && errors.remarks)}
                      helperText={touched.remarks && errors.remarks}
                      margin="none"
                      autoComplete="off"
                      name="remarks"
                      fullWidth
                      onChange={handleChange}
                      onBlur={handleBlur}
                      type="text"
                      size="small"
                      value={values.remarks}
                      variant="outlined"
                    />
                  </Grid>
                </Grid>
                {!editing && (
                  <Box paddingLeft={6}>
                    <Divider sx={{ mt: 6 }} />
                    <Grid container spacing={2} sx={{ mt: 4 }}>
                      <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
                        <Typography
                          variant="subtitle2"
                          sx={customLabelTypography}
                        >
                          Email Id
                        </Typography>
                        <GateInTextField
                          value={get_single_attendance?.employee?.emailId}
                          readOnlyP={true}
                        />
                      </Grid>
                      <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
                        <Typography
                          variant="subtitle2"
                          sx={customLabelTypography}
                        >
                          Mobile No
                        </Typography>
                        <GateInTextField
                          value={get_single_attendance?.employee?.mobileNo}
                          readOnlyP={true}
                        />
                      </Grid>
                      <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
                        <Typography
                          variant="subtitle2"
                          sx={customLabelTypography}
                        >
                          Role
                        </Typography>
                        <GateInTextField
                          value={get_single_attendance?.employee?.role}
                          readOnlyP={true}
                        />
                      </Grid>
                      <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
                        <Typography
                          variant="subtitle2"
                          sx={customLabelTypography}
                        >
                          Qualification
                        </Typography>
                        <GateInTextField
                          value={get_single_attendance?.employee?.qualification}
                          readOnlyP={true}
                        />
                      </Grid>
                      <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
                        <Typography
                          variant="subtitle2"
                          sx={customLabelTypography}
                        >
                          Location
                        </Typography>
                        <GateInTextField
                          value={get_single_attendance?.employee?.location}
                          readOnlyP={true}
                        />
                      </Grid>
                      <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
                        <Typography
                          variant="subtitle2"
                          sx={customLabelTypography}
                        >
                          Site
                        </Typography>
                        <GateInTextField
                          value={get_single_attendance?.employee?.site}
                          readOnlyP={true}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                )}

                <Box style={{ textAlign: "center" }} ml={1} mt={6}>
                  {!editing ? (
                    <Button
                      color="primary"
                      disabled={isSubmitting}
                      size="medium"
                      type="submit"
                      variant="contained"
                      style={{
                        marginRight: "10px",
                        width: 240,
                      }}
                    >
                      Update Staff Attendance
                    </Button>
                  ) : (
                    <Button
                      color="primary"
                      disabled={isSubmitting}
                      size="medium"
                      type="submit"
                      variant="contained"
                      style={{
                        marginRight: "10px",
                        width: 240,
                      }}
                    >
                      Add Staff Attendance
                    </Button>
                  )}
                  {!editing && (
                    <Button
                      sx={{ marginRight: "10px", width: 220 }}
                      color="error"
                      variant="outlined"
                      onClick={() =>
                        dispatch(
                          deleteMNRStaffAttendanceAction(pk, history, notify)
                        )
                      }
                    >
                      Delete
                    </Button>
                  )}
                  <Button
                    color="secondary"
                    size="medium"
                    type="button"
                    variant="outlined"
                    onClick={() => history.goBack()}
                  >
                    Cancel
                  </Button>
                </Box>
              </form>
            )}
          </Formik>
        </CardContent>
      </Card>
        <Backdrop sx={custombackDropStyle} open={isloading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </LayoutContainer>
  );
};

export default MNRStaffAttendanceForm;
