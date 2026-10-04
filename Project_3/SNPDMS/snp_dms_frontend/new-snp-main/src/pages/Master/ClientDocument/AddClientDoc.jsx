import React, { useEffect, useState } from "react";

import {
  Grid,
  Button,
  Typography,
  Box,
  Paper,
  TextField,
  MenuItem,
  useMediaQuery,
  Backdrop,
  CircularProgress,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import LayoutContainer from "@components/reusablecomponents/LayoutContainer";
import { useHistory } from "react-router-dom";
import { Image } from "semantic-ui-react";
import CustomTextfield from "@components/reusablecomponents/GateInTextField";
import { theme } from "../../../App";
import { dropDownDispatch } from "../../../actions/GateInActions";
import { useSnackbar } from "notistack";
import {
  addMasterClientDocument,
  getSingleClientDocument,
  updateMasterClientDoc,
  downloadClientDocument,
} from "../../../actions/master/ClientDocumentMasterActions";
import BACKIMAGE from "../../../assets/images/back-arrow.png";
import { custombackDropStyle, customLabelTypography } from "../../../utils/CustomClasses";

export default function AddClientDoc(props) {
  const dispatch = useDispatch();
  const store = useSelector((state) => state);
  const { clientDocMaster, gateIn } = store;
    const { isloading } = useSelector((state) => state.ui);
  const history = useHistory();
  const [clientName, setClientName] = useState("");
  const [documentName, setDocumentName] = useState("");
  const [icon, setIcon] = useState("");
  const notify = useSnackbar().enqueueSnackbar;
  const formData = new FormData();
  const matchesIphone = useMediaQuery("(max-width:400px)");

  useEffect(() => {
    if (props.history.location.state) {
      dispatch(
        getSingleClientDocument(
          props.history.location.state.allDetails.pk,
          notify
        )
      );
    }
  }, []);

  useEffect(() => {
    if (clientDocMaster.clientDocDetails.pk) {
      setClientName(clientDocMaster.clientDocDetails.client);
      setDocumentName(clientDocMaster.clientDocDetails.name);
    }
  }, [clientDocMaster.clientDocDetails]);

  useEffect(() => {
    let reqArray = ["client_data"];

    dispatch(dropDownDispatch(reqArray, notify));
  }, []);

  const handleGoBack = () => {
    dispatch({ type: "CLEAN_CLIENT_DOC" });
    history.goBack();
  };

  const handleDownloadClientDoc = () => {
    const id = clientDocMaster.clientDocDetails.pk;
    dispatch(downloadClientDocument(id));
  };

  const handleDocCreation = () => {
    if (clientName === "") {
      notify("Please Enter Client Name", { variant: "warning" });
    } else if (documentName === "") {
      notify("Please Enter Document Name", { variant: "warning" });
    } else if (icon === "") {
      notify("Please Upload Document (PDF/ZIP)", { variant: "warning" });
    } else {
      formData.append("client", clientName);
      formData.append("name", documentName);
      formData.append("upload", icon);
      formData.append(
        "location",
        localStorage.getItem("location")
          ? localStorage.getItem("location")
          : null
      );
      formData.append(
        "site",
        localStorage.getItem("site") ? localStorage.getItem("site") : null
      );
      dispatch(addMasterClientDocument(formData, history, notify));
    }
  };

  const handleDocUpdate = () => {
    if (clientName === "") {
      notify("Please Enter Client Name", { variant: "warning" });
    } else if (documentName === "") {
      notify("Please Enter Document Name", { variant: "warning" });
    } else if (icon === "") {
      notify("Please Upload Document (PDF/ZIP)", { variant: "warning" });
    } else {
      formData.append("client", clientName);
      formData.append("name", documentName);
      formData.append("upload", icon);
      formData.append(
        "location",
        localStorage.getItem("location")
          ? localStorage.getItem("location")
          : null
      );
      formData.append(
        "site",
        localStorage.getItem("site") ? localStorage.getItem("site") : null
      );
      dispatch(
        updateMasterClientDoc(
          clientDocMaster.clientDocDetails.pk,
          formData,
          history,
          notify
        )
      );
    }
  };
  const mapped =
    gateIn.allDropDown &&
    gateIn.allDropDown.client_data &&
    gateIn.allDropDown.client_data.map((obj) => obj.name);
  const filtered =
    mapped && mapped.filter((type, index) => mapped.indexOf(type) === index);

  return (
    <LayoutContainer footer={false}>
      <Grid container>
        <Grid item size={{ xs: 12 }}>
          <Image
            src={BACKIMAGE}
            style={{
              height: 40,
              width: 40,
              marginBottom: 15,
              cursor: "pointer",
            }}
            onClick={handleGoBack}
          />
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
                Upload Documents
              </Box>
            </Typography>
            <Paper
              sx={(theme) => ({
                padding: theme.spacing(4, 3),
              })}
              elevation={0}
            >
              <Grid container spacing={1}>
                <Grid
                  item
                  size={{ xs: 12, sm: 6, lg: 3 }}
                  style={theme.breakpoints.down("sm") && { padding: 7 }}
                >
                  <Typography variant="subtitle1" sx={customLabelTypography}>
                    Client Name <span style={{ color: "red" }}>*</span>
                  </Typography>
                  <TextField
                    id="client-master-name"
                    select
                    value={clientName}
                    variant="outlined"
                    fullWidth
                    size="small"
                    onChange={(e) => {
                      setClientName(e.target.value);
                    }}
                  >
                    {filtered &&
                      filtered.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                  </TextField>
                </Grid>
                <Grid
                  item
                  size={{ xs: 12, sm: 6, lg: 3 }}
                  style={theme.breakpoints.down("sm") && { padding: 7 }}
                >
                  <Typography variant="subtitle1" sx={customLabelTypography}>
                    Document Name <span style={{ color: "red" }}>*</span>
                  </Typography>
                  <CustomTextfield
                    id="client-master-doc-name"
                    handleChange={(e) => setDocumentName(e.target.value)}
                    value={documentName}
                    dispatchType={"SET_MASTER_CLIENT_DOCUMENT_NAME"}
                  />
                </Grid>
                <Grid
                  item
                  size={{ xs: 12, sm: 6, lg: 6 }}
                  style={theme.breakpoints.down("sm") && { padding: 7 }}
                >
                  <Typography variant="subtitle1" sx={customLabelTypography}>
                    Upload Document <span style={{ color: "red" }}>*</span>
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    sx={{
                      fontSize: 12.5,
                      borderRadius: 6,

                      boxShadow: "0px 3px 6px #9199A14D",

                      width: "165px",
                    }}
                    style={{
                      width: matchesIphone ? "100px" : "165px",
                    }}
                    id="client-document-master-upload"
                    component="label"
                  >
                    Choose File
                    <input
                      type="file"
                      style={{ display: "none" }}
                      id="client-document-master-upload"
                      onChange={(e) => {
                        var file = e.target.files[0];

                        if (
                          file.type === "application/pdf" ||
                          file.type === "application/x-zip-compressed"
                        )
                          setIcon(file);
                        else {
                          notify("Only PDF or Zip can be uploaded", {
                            variant: "warning",
                          });
                        }
                      }}
                    />
                  </Button>

                  <Button
                    sx={{
                      fontSize: 12.5,
                      borderRadius: 6,

                      boxShadow: "0px 3px 6px #9199A14D",
                      backgroundColor: "#FFF",
                      width: "165px",

                      "&:hover": {
                        backgroundColor: "#FFF",
                      },
                      marginLeft: 15,
                    }}
                    onClick={handleDownloadClientDoc}
                    disabled={
                      clientDocMaster.clientDocDetails.pk
                        ? icon !== ""
                        : !clientDocMaster.clientDocDetails.pk
                    }
                  >
                    Download
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </div>
          <Grid
            style={{
              marginLeft: "auto",
              marginRight: "auto",
              width: "30%",
              marginTop: 16,
              marginBottom: 16,
            }}
          >
            {clientDocMaster.clientDocDetails.pk ? (
              <Button
                variant="contained"
                color="primary"
                sx={{
                  fontSize: 12.5,
                  borderRadius: 2,
                  width: "100%",
                }}
                onClick={handleDocUpdate}
              >
                Update
              </Button>
            ) : (
              <Button
                variant="contained"
                color="primary"
                sx={{
                  fontSize: 12.5,
                  borderRadius: 2,
                  width: "100%",
                }}
                onClick={handleDocCreation}
              >
                Save
              </Button>
            )}
          </Grid>
        </Grid>
      </Grid>
         <Backdrop sx={custombackDropStyle} open={isloading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </LayoutContainer>
  );
}
