import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItemText,
  TextField,
  Button,
  Stack,
  Grid,
  InputAdornment,
  ListItemButton,
  Chip,
} from "@mui/material";
import { Formik } from "formik";
import * as Yup from "yup";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSnackbar } from "notistack";
import {
  addUpdateMSCFtpCredentialsAction,
  getMSCFtpCredentialsDataAction,
  getMSCFtpEnableSiteListingAction,
} from "@/actions/EdiFtpCredAction";
import { customLabelTypography } from "@/utils/CustomClasses";
import GateInTextField from "./reusablecomponents/GateInTextField";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import IconButton from "@mui/material/IconButton";
import VpnKeyOutlinedIcon from "@mui/icons-material/VpnKeyOutlined";
import { EDI_FTP_CRED_CONST } from "@/reducers/FtpCredentialsReducer";

const validationSchema = Yup.object({
  site: Yup.string().required("Site is required"),

  username: Yup.string().required("Username is required"),

  password: Yup.string().required("Password is required"),

  email_list: Yup.array()
    .of(
      Yup.string().email("Invalid email format").required("Email is required"),
    )
    .min(1, "At least one email is required"),
});

const AppBarHeaderFtpComp = ({ handleCloseFTPLogin }) => {
  const dispatch = useDispatch();
  const { role } = useSelector((state) => state.user);
  const notify = useSnackbar().enqueueSnackbar;

  const { ftpEnabledsiteList, ediFtpSingleCred } = useSelector(
    (state) => state.ftpCredentialsReducer,
  );
  const [singleCredData, setSingleCredData] = useState({
    site: "",
    username: "",
    password: "",
    email_list: [],
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleSelectSite = (selectedSite) => {
    dispatch(getMSCFtpCredentialsDataAction(notify, selectedSite));
  };

  useEffect(() => {
    dispatch(getMSCFtpCredentialsDataAction(notify));
    dispatch(getMSCFtpEnableSiteListingAction(notify));
  }, []);

  useEffect(() => {
    if (ediFtpSingleCred?.site) {
      setSingleCredData((prev) => ({
        ...prev,
        site: ediFtpSingleCred?.site,
        password: ediFtpSingleCred?.data?.password
          ? ediFtpSingleCred?.data?.password
          : "",
        username: ediFtpSingleCred?.data?.username
          ? ediFtpSingleCred?.data?.username
          : "",
        email_list: ediFtpSingleCred?.data?.email_list
          ? ediFtpSingleCred?.data?.email_list
          : [],
      }));
    }
  }, [ediFtpSingleCred?.site]);

  return (
    <Box
      sx={{
        p: 0,
        maxWidth: "100%",
        height: "100%",
      }}
      component={Grid}
      container
      spacing={2}
    >
      <Grid
        item
        size={{ xs: 4 }}
        component={Card}
        sx={(theme) => ({
          borderRadius: 2,
          maxHeight: "100%",
          overflowY: "scroll",
          "&::-webkit-scrollbar": {
            width: 0,
          },
        })}
      >
        <CardContent>
          <Typography variant="h6" >
            FTP enabled Sites
          </Typography>
          <List>
            {ftpEnabledsiteList?.edi_enabled_sites?.map((site, index) => (
              <ListItemButton
                key={site}
                selected={site === ediFtpSingleCred?.site}
                onClick={() => handleSelectSite(site)}
                sx={{
                  position: "relative",
                  pl: 3,

                  "&.Mui-selected": {
                    backgroundColor: "action.selected",
                  },

                  "&.Mui-selected::before": {
                    content: '""',
                    position: "absolute",
                    left: 0,
                    top: 0,
                    width: "4px",
                    height: "100%",
                    backgroundColor: "primary.main",
                    borderRadius: "0 4px 4px 0",
                  },
                }}
              >
                <ListItemText primary={site} />
              </ListItemButton>
            ))}
          </List>
        </CardContent>
      </Grid>
      <Grid
        item
        size={{ xs: 8 }}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 4,
        }}
      >
        {ediFtpSingleCred?.data && (
          <Typography variant="h6" >
            Update FTP Login - {ediFtpSingleCred?.site}
          </Typography>
        )}
        {ediFtpSingleCred?.site ? (
          <Card elevation={0}>
            <CardContent>
              <Formik
                initialValues={singleCredData}
                enableReinitialize
                validationSchema={validationSchema}
                onSubmit={async (values, actions) => {
                  dispatch(
                    addUpdateMSCFtpCredentialsAction(
                      values,
                      notify,
                      handleCloseFTPLogin,
                    ),
                  );
                }}
              >
                {({
                  values,
                  handleChange,
                  errors,
                  touched,
                  handleSubmit,
                  isSubmitting,
                  handleBlur,
                  setFieldValue,
                }) => (
                  <form autoComplete="off" onSubmit={handleSubmit}>
                    <Grid container spacing={2}>
                      <Grid item size={{ xs: 12 }}>
                        <Typography sx={customLabelTypography}>
                          Site <span style={{ color: "red" }}>*</span>
                        </Typography>
                        <GateInTextField value={values.site} readOnlyP={true} />
                      </Grid>
                      <Grid item size={{ xs: 6 }}>
                        <Typography sx={customLabelTypography}>
                          Username <span style={{ color: "red" }}>*</span>
                        </Typography>
                        <TextField
                          error={Boolean(touched.username && errors.username)}
                          helperText={touched.username && errors.username}
                          variant="outlined"
                          name="username"
                          autoComplete="new-password"
                          fullWidth
                          type="text"
                          size="small"
                          value={values.username}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          sx={{ marginTop: 1 }}
                        />
                      </Grid>
                      <Grid item size={{ xs: 6 }}>
                        <Typography sx={customLabelTypography}>
                          Password <span style={{ color: "red" }}>*</span>
                        </Typography>
                        <TextField
                          name="password"
                          type={showPassword ? "text" : "password"}
                          fullWidth
                          size="small"
                          autoComplete="new-password"
                          sx={{ mt: 1 }}
                          value={values.password}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={Boolean(touched.password && errors.password)}
                          helperText={touched.password && errors.password}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  disabled={role !== "Admin"}
                                  onClick={() =>
                                    setShowPassword((prev) => !prev)
                                  }
                                  edge="end"
                                >
                                  {showPassword ? (
                                    <VisibilityOff />
                                  ) : (
                                    <Visibility />
                                  )}
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>
                      <Grid item size={{ xs: 12 }}>
                        <Typography sx={customLabelTypography}>
                          Email List <span style={{ color: "red" }}>*</span>
                        </Typography>

                        <EmailListField
                          name="email_list"
                          value={values.email_list}
                          setFieldValue={setFieldValue}
                          error={touched.email_list && errors.email_list}
                        />
                      </Grid>
                    </Grid>
                    <Grid
                      item
                      size={{ xs: 12 }}
                      textAlign={"center"}
                      sx={{ mt: 6 }}
                    >
                      {role === "Admin" ? (
                        <Button
                          startIcon={<VpnKeyOutlinedIcon />}
                          type="submit"
                          color="secondary"
                          variant="contained"
                          disabled={isSubmitting}
                        >
                          Update FTP Login
                        </Button>
                      ) : null}
                    </Grid>
                  </form>
                )}
              </Formik>
            </CardContent>
          </Card>
        ) : (
          <Stack
            direction={"column"}
            alignItems={"center"}
            justifyContent={"center"}
            spacing={2}
            sx={{
              height: "100%",
            }}
          >
            <Typography
              textAlign={"center"}
              sx={{ width: "80%" }}
              variant="body2"
              color="textPrimary"
            >
              {ediFtpSingleCred?.site
                ? " EDI FTP Credential data for this site not Found. Please select again or try again with other site "
                : "Login as Admin and select a Site to View or Update Ftp Login Credentials. "}
            </Typography>
            <Button
              onClick={() => {
                dispatch(getMSCFtpCredentialsDataAction(notify));
                dispatch(getMSCFtpEnableSiteListingAction(notify));
                dispatch({
                  type: EDI_FTP_CRED_CONST.SINGLE_EDI_FTP_CRED,
                  payload: null,
                });
              }}
              color="primary"
              variant="contained"
            >
              Refresh
            </Button>
          </Stack>
        )}
      </Grid>
    </Box>
  );
};

export default AppBarHeaderFtpComp;

const EmailListField = ({ name, value, setFieldValue, error }) => {
  const [inputValue, setInputValue] = useState("");

  const addEmail = () => {
    if (!inputValue.trim()) return;

    setFieldValue(name, [...value, inputValue.trim()]);
    setInputValue("");
  };

  const removeEmail = (emailToRemove) => {
    setFieldValue(
      name,
      value.filter((email) => email !== emailToRemove),
    );
  };

  return (
    <Box>
      <TextField
        fullWidth
        size="small"
        placeholder="Type email & press Enter"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            addEmail();
          }
        }}
        error={Boolean(error)}
        helperText={error}
      />

      <Box sx={{ mt: 1, display: "flex", gap: 1, flexWrap: "wrap" }}>
        {value.map((email, index) => (
          <Chip key={index} label={email} onDelete={() => removeEmail(email)} />
        ))}
      </Box>
    </Box>
  );
};
