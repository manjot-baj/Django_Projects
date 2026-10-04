import LayoutContainer from "@/components/reusablecomponents/LayoutContainer";
import {
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Divider,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
  Autocomplete,
} from "@mui/material";
import RoomPreferencesOutlinedIcon from "@mui/icons-material/RoomPreferencesOutlined";
import { custombackDropStyle } from "@/utils/CustomClasses";
import { useDispatch, useSelector } from "react-redux";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useEffect, useState } from "react";
import {
  singlePartyClientOperationAction,
  singlePartyClientOperationdropDownDispatchAction,
} from "@/actions/Automation/AutomationClientOperationAction";
import { useSnackbar } from "notistack";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";

const validationSchema = Yup.object({
  replaceFrom: Yup.string().trim().required("Replace From is required"),

  replaceTo: Yup.string().when("replaceFrom", {
    is: (value) => value?.trim().length > 0,
    then: (schema) =>
      schema
        .required("Replace To is required")
        .notOneOf(
          [Yup.ref("replaceFrom")],
          "Replace To must be different from Replace From",
        ),
    otherwise: (schema) => schema.notRequired(),
  }),
});

const AutomationSinglePartyClientDependecyTransfer = () => {
  const ui = useSelector((state) => state.ui);
  const { client_party_data_dropDown } = useSelector(
    (state) => state.AutomationClientOperationReducer,
  );
  const notify = useSnackbar().enqueueSnackbar;
  const dispatch = useDispatch();
  const [initialValues, setInitialValues] = useState({
    replaceFrom: "",
    replaceTo: "",
  });

  useEffect(() => {
    dispatch(
      singlePartyClientOperationdropDownDispatchAction(
        ["party_client_data"],
        notify,
      ),
    );
  }, []);

  const handleSubmit = (values, { setSubmitting, resetForm }) => {
    dispatch(
      singlePartyClientOperationAction(
        values.replaceFrom,
        values.replaceTo,
        resetForm,
        notify,
      ),
    );
    setSubmitting(false);
  };

  return (
    <LayoutContainer>
      <Box>
        <Stack
          direction={"row"}
          alignItems={"center"}
          justifyContent={"flex-start"}
          spacing={2}
          sx={{ mb: 2 }}
        >
          {" "}
          <RoomPreferencesOutlinedIcon
            fontSize="large"
            sx={(theme) => ({
              fill: "white",
              bgcolor: theme.palette.primary.main,
              padding: 0.6,
              borderRadius: 2,
            })}
          />
          <Stack
            direction={"column"}
            alignItems={"flex-start"}
            justifyContent={"center"}
          >
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              Single party client dependency transfer
            </Typography>
            <Typography variant="caption">
              Client dependency transfer to new client and delete old one for
              single party clients
            </Typography>
          </Stack>
        </Stack>{" "}
        <Divider />
        <Paper
          elevation={0}
          sx={{
            width: "70%",
            mx: "auto",
            mt: 6,
            borderRadius: 6,
            p: { xs: 1, md: 5 },
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
          }}
        >
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            enableReinitialize={true}
          >
            {({
              values,
              errors,
              touched,
              handleChange,
              handleBlur,
              isSubmitting,
              setFieldValue,
            }) => (
              <Form noValidate>
                <Box display="flex" flexDirection="column" gap={2}>
                  <Box>
                    <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
                      Replace From
                    </Typography>

                    <Autocomplete
                      openOnFocus
                      autoHighlight
                      clearOnEscape
                      options={client_party_data_dropDown || []}
                      getOptionLabel={(option) => option?.name || ""}
                      value={
                        client_party_data_dropDown?.find(
                          (item) => item.name === values.replaceFrom,
                        ) || null
                      }
                      onChange={(_, newValue) => {
                        setFieldValue("replaceFrom", newValue?.name || "");

                        if (!newValue) {
                          setFieldValue("replaceTo", "");
                        }
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder="Client A"
                          error={
                            touched.replaceFrom && Boolean(errors.replaceFrom)
                          }
                          helperText={touched.replaceFrom && errors.replaceFrom}
                        />
                      )}
                    />
                  </Box>

                  <Box>
                    <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
                      Replace To
                    </Typography>

                    <Autocomplete
                        openOnFocus
                      autoHighlight
                      clearOnEscape
                      options={
                        client_party_data_dropDown?.filter(
                          (item) => item.name !== values.replaceFrom,
                        ) || []
                      }
                      getOptionLabel={(option) => option?.name || ""}
                      disabled={!values.replaceFrom}
                      value={
                        client_party_data_dropDown?.find(
                          (item) => item.name === values.replaceTo,
                        ) || null
                      }
                      onChange={(_, newValue) => {
                        setFieldValue("replaceTo", newValue?.name || "");
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder="Client B"
                          error={touched.replaceTo && Boolean(errors.replaceTo)}
                          helperText={touched.replaceTo && errors.replaceTo}
                        />
                      )}
                    />
                  </Box>

                  <Button
                    type="submit"
                    variant="contained"
                    disabled={isSubmitting}
                    startIcon={<SwapHorizIcon />}
                    color="secondary"
                    size="large"
                  >
                    Transfer Dependency
                  </Button>
                </Box>
              </Form>
            )}
          </Formik>
        </Paper>
      </Box>
      <Backdrop sx={custombackDropStyle} open={ui.isloading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </LayoutContainer>
  );
};

export default AutomationSinglePartyClientDependecyTransfer;
