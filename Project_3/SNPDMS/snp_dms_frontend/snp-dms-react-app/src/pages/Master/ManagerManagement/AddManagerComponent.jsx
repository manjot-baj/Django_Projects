import React, { useEffect, useState } from "react";
import LayoutContainer from "../../../components/reusableComponents/LayoutContainer";
import {
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Grid,
  makeStyles,
  Paper,
} from "@material-ui/core";
import { useDispatch, useSelector } from "react-redux";
import { useSnackbar } from "notistack";
import { useParams, useHistory } from "react-router-dom";
import jwt_decode from "jwt-decode";
import CustomHeading from "../../../components/CustomHeading";
import { Image } from "semantic-ui-react";
import GateInTextField from "../../../components/reusableComponents/GateInTextField";
import ManageAccountsOutlinedIcon from "@mui/icons-material/ManageAccountsOutlined";
import {
  addManagerAction,
  deleteManagerAction,
  getSingleManagerAction,
  updateManagerAction,
} from "../../../actions/ManagerMasterAction";
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';

const useStyles = makeStyles((theme) => ({
  paperContainer: {
    padding: theme.spacing(4, 3),
    borderRadius: 8,
  },
  backImage: {
    height: 40,
    width: 40,
    marginBottom: 15,
    cursor: "pointer",
  },
  input: {
    padding: 7,
  },
  submitButton: {
    padding: "8px 80px",
  },
  deleteButton:{
    color:theme.palette.error.main,
    "&:hover":{
      color:theme.palette.error.dark
    }
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: "#fff",
  },
}));

const AddManagerComponent = () => {
  const history = useHistory();

  const classes = useStyles();
  const dispatch = useDispatch();

  const notify = useSnackbar().enqueueSnackbar;
  const { pk } = useParams();
  const [isEditing, setIsEditing] = useState(true);
  const { ui, siteMaster } = useSelector((state) => state);
  const [managerData, setManagerData] = useState({
    name: "",
    designation: "",
    email: "",
    mobile_no: "",
  });

  useEffect(() => {
    var token = localStorage.getItem("accessToken");
    if (token) {
      var decode = jwt_decode(token);
      if (decode.exp < new Date().getTime() / 1000) {
        history.push("/login");
      }
      if (!pk) {
        history.replace("/depot/truck-turn-around");
      } else {
        if (pk !== "add") {
          dispatch(getSingleManagerAction(pk, notify));
        }
      }
    } else {
      history.push("/login");
    }
  }, []);

  useEffect(() => {
    if (pk === "add") {
      setIsEditing(true);
    } else {
      setIsEditing(false);
      setManagerData((prev) => ({
        ...prev,
        mobile_no: siteMaster.managerDetail?.mobile_no,
        designation: siteMaster.managerDetail?.designation,
        email: siteMaster.managerDetail?.email,
        name: siteMaster.managerDetail?.name,
      }));
    }
  }, [pk, siteMaster.managerDetail]);

  const handleGoBack = () => {
    history.goBack();
  };


  const handleDelete =()=>{
    dispatch(deleteManagerAction(pk, notify,history))
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setManagerData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (managerData.name === "") {
      notify("Name is required and should be only Alphabets", {
        variant: "error",
      });
    } else if (!managerData.name.match(/^[a-zA-Z-,]+(\s{0,1}[a-zA-Z-, ])*$/)) {
      notify("Please enter name only in Alphabets", { variant: "error" });
    } else if (managerData.designation === "") {
      notify("Designation is required", { variant: "error" });
    } else if (managerData.email === "") {
      notify("Email is required", { variant: "error" });
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(managerData.email)) {
      notify("Please enter a valid email address", { variant: "error" });
    } else if (managerData.mobile_no === "") {
      notify("Mobile number is required", { variant: "error" });
    } else if (!/^\d{10}$/.test(managerData.mobile_no))
      notify("Please enter a valid 10 digit mobile number ", {
        variant: "error",
      });
    else {
      dispatch(addManagerAction(managerData, notify, history));
    }
  };

  const handleUpdate = () => {
    if (managerData.name === "") {
      notify("Name is required ", {
        variant: "error",
      });
    } else if (!managerData.name.match(/^[a-zA-Z-,]+(\s{0,1}[a-zA-Z-, ])*$/)) {
      notify("Please enter name only in Alphabets", { variant: "error" });
    } else if (managerData.designation === "") {
      notify("Designation is required", { variant: "error" });
    } else if (managerData.email === "") {
      notify("Email is required", { variant: "error" });
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(managerData.email)) {
      notify("Please enter a valid email address", { variant: "error" });
    } else if (managerData.mobile_no === "") {
      notify("Mobile number is required", { variant: "error" });
    } else if (!/^\d{10}$/.test(managerData.mobile_no))
      notify("Please enter a valid 10 digit mobile number ", {
        variant: "error",
      });
    else {
      dispatch(updateManagerAction(pk, managerData, notify, history));
    }
  };

  return (
    <LayoutContainer>
      <Box paddingX={8}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Image
              src={require("../../../assets/images/back-arrow.png")}
              className={classes.backImage}
              onClick={handleGoBack}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomHeading variant="body1" customClass="pageTitle">
              Add Manager
            </CustomHeading>
          </Grid>
          <Grid item xs={12}>
            <Paper
              className={classes.paperContainer}
              component={Grid}
              container
              spacing={2}
            >
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <CustomHeading variant="subtitle1" customClass="label">
                  Name <span style={{ color: "red" }}>*</span>
                </CustomHeading>
                <GateInTextField
                  type={"text"}
                  value={managerData.name}
                  name={"name"}
                  handleChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <CustomHeading variant="subtitle1" customClass="label">
                  Designation <span style={{ color: "red" }}>*</span>
                </CustomHeading>

                <GateInTextField
                  value={managerData.designation}
                  name={"designation"}
                  handleChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <CustomHeading variant="subtitle1" customClass="label">
                  Email <span style={{ color: "red" }}>*</span>
                </CustomHeading>

                <GateInTextField
                  value={managerData.email}
                  name={"email"}
                  handleChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <CustomHeading variant="subtitle1" customClass="label">
                  Mobile No <span style={{ color: "red" }}>*</span>
                </CustomHeading>

                <GateInTextField
                  value={managerData.mobile_no}
                  name={"mobile_no"}
                  handleChange={handleChange}
                />
              </Grid>
            </Paper>
          </Grid>
        </Grid>

        <Box
          style={{
            marginTop: 80,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
          }}
        >
           {pk !== "add" && (
            <Button
              startIcon={
                <DeleteOutlineOutlinedIcon  />
              }
              variant="text"
              color="secondary"
              className={`${classes.submitButton} ${classes.deleteButton}`}
              onClick={handleDelete}
            >
              Delete
            </Button>
          )}
          {pk !== "add" && (
            <Button
              startIcon={
                <ManageAccountsOutlinedIcon style={{ fill: "#FFF" }} />
              }
              variant="contained"
              color="secondary"
              className={classes.submitButton}
              onClick={handleUpdate}
            >
              Update
            </Button>
          )}
          {pk === "add" && (
            <Button
              startIcon={
                <ManageAccountsOutlinedIcon style={{ fill: "#FFF" }} />
              }
              variant="contained"
              color="primary"
              className={classes.submitButton}
              onClick={handleSubmit}
            >
              Save
            </Button>
          )}
        </Box>
      </Box>
      <Backdrop className={classes.backdrop} open={ui.isloading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </LayoutContainer>
  );
};

export default AddManagerComponent;
