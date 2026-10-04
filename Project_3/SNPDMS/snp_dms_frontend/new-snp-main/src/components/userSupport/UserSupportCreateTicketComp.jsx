import React, { useEffect } from "react";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import LabelImportantOutlinedIcon from "@mui/icons-material/LabelImportantOutlined";
import BugReportOutlinedIcon from "@mui/icons-material/BugReportOutlined";
import { customLabelTypography } from "@/utils/CustomClasses";
import { Formik } from "formik";

import * as Yup from "yup";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import {
  Button,
  IconButton,
  InputAdornment,
  MenuItem,
  TextField,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { useSnackbar } from "notistack";
import { getTicketDropDownAction, userSupportCreateTicketAction } from "@/actions/UserSupportAction";
import { useHistory } from "react-router-dom";
import TICKET_EMPTY_IMAGE from "@/assets/images/empty.png";
import { Image } from "semantic-ui-react";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";


const validationSchema = Yup.object({
  subject: Yup.string().required("Subject is required"),
  description: Yup.string().required("Description is required"),
  module_name: Yup.string().required("Module name is required"),
  ticket_type: Yup.string().required("Ticket type is required"),
});

const UserSupportCreateTicketComp = ({ closeModal }) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const notify = useSnackbar().enqueueSnackbar;
  const { role } = useSelector((state) => state.user);
  const { ticket_dropdown } = useSelector(
    (state) => state.UserSupportReducer,
  );


  useEffect(() => {
    let reqArray = ["user_support"];

    dispatch(getTicketDropDownAction(reqArray, notify));
  }, []);

  return (
    <Formik
      initialValues={{
        subject: "",
        description: "",
        module_name: "",
        ticket_type: "",
      }}
      validationSchema={validationSchema}
      onSubmit={async (values) => {
        dispatch(userSupportCreateTicketAction(values, history, notify, closeModal));
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
      }) => (
        <form onSubmit={handleSubmit}>
          <Card elevation={0}>
            {/* <CardHeader
              sx={{
                py: 0.5,   // reduce vertical padding (default ~16px)
                px: 1.5,   // optional horizontal padding
                "& .MuiCardHeader-content": {
                  margin: 0,

                },
              }}
              title={
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  {role === "Admin" ? null : (
                    <Typography variant="body2">Create New Ticket </Typography>
                  )}
                  <IconButton color="secondary" onClick={closeModal}>
                    <CloseOutlinedIcon />
                  </IconButton>
                </Stack>
              }
            /> */}

            {role === "Admin" ? (
              <Stack
                direction={"column"}
                alignItems={"center"}
                justifyContent={"center"}
                spacing={2}
                sx={(theme) => ({
                  height: 500,
                })}
              >
                <Image src={TICKET_EMPTY_IMAGE} height={100} width={100} />
                <Typography>
                  Please select a ticket to view the ticket details.
                </Typography>
              </Stack>
            ) : (
              <CardContent>
           
                <Stack>
                  <Typography sx={customLabelTypography}>
                    Subject <span style={{ color: "red" }}>*</span>
                  </Typography>
                  <TextField
                    error={Boolean(touched.subject && errors.subject)}
                    helperText={touched.subject && errors.subject}
                    variant="outlined"
                    name="subject"
                    autoComplete="off"
                    fullWidth
                    type="text"
                    size="small"
                    value={values.subject}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    sx={{ marginTop: 1 }}
                  />
                </Stack>

                <Stack sx={{ mt: 4 }}>
                  <Typography sx={customLabelTypography}>
                    Description <span style={{ color: "red" }}>*</span>
                  </Typography>
                  <TextField
                    error={Boolean(touched.description && errors.description)}
                    helperText={touched.description && errors.description}
                    variant="outlined"
                    multiline
                    rows={4}
                    type="text"
                    size="small"
                    fullWidth
                    name="description"
                    value={values.description}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    sx={{ marginTop: 1 }}
                  />
                </Stack>
                <Stack
                  sx={{ mt: 4 }}
                  flexDirection={"row"}
                  alignItems={"flex-start"}
                  justifyContent={"flex-start"}
                  spacing={4}
                  direction={"row"}
                >
                  <Stack sx={{ width: 300 }}>
                    <Typography sx={customLabelTypography}>
                      Type <span style={{ color: "red" }}>*</span>
                    </Typography>

                    <TextField
                      error={Boolean(touched.ticket_type && errors.ticket_type)}
                      helperText={touched.ticket_type && errors.ticket_type}
                      select
                      name="ticket_type"
                      value={values.ticket_type}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      color="secondary"
                      size="small"
                      fullWidth
                      sx={{ mt: 1 }}
                      slotProps={{
                        input: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <BugReportOutlinedIcon color="primary" />
                            </InputAdornment>
                          ),
                        },
                      }}
                    >
                      {ticket_dropdown?.ticket_type_list?.map((name) => (
                        <MenuItem key={name} value={name}>
                          {name}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Stack>
                  <Stack sx={{ width: 300 }}>
                    <Typography sx={customLabelTypography}>
                      Module Name <span style={{ color: "red" }}>*</span>
                    </Typography>

                    <TextField
                      id="module_name"
                      error={Boolean(touched.module_name && errors.module_name)}
                      helperText={touched.module_name && errors.module_name}
                      select
                      name="module_name"
                      value={values.module_name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      color="secondary"
                      size="small"
                      fullWidth
                      sx={{ mt: 1 }}
                      slotProps={{
                        input: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <LabelImportantOutlinedIcon color="primary" />
                            </InputAdornment>
                          ),
                        },
                      }}
                    >
                      {ticket_dropdown?.ticket_modules_list?.map((name) => (
                        <MenuItem key={name} value={name}>
                          {name}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Stack>
                </Stack>
                <Stack
                  sx={{ mt: 6 }}
                  direction={"row"}
                  alignItems={"center"}
                  justifyContent={"center"}
                  spacing={2}
                >
                  <Button variant="outlined" color="secondary" onClick={closeModal}>
                    Cancel
                  </Button>
                  <Button
                    color="secondary"
                    disabled={isSubmitting}
                    startIcon={<AddOutlinedIcon />}
                    type="submit"
                    variant="contained"
                 
                    style={{
                      marginRight: "10px",
                      width: 240,
                    }}
                  >
                    Create Ticket
                  </Button>
                </Stack>
              </CardContent>
            )}
          </Card>
        </form>
      )}
    </Formik>
  );
};

export default UserSupportCreateTicketComp;
