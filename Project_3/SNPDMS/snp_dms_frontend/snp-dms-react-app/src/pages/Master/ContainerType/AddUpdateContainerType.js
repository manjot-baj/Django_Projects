import React, { useState, useEffect } from "react";
import {
  makeStyles,
  Typography,
  Paper,
  Grid,
  Box,
  Button,
  TextField,
} from "@material-ui/core";

import { useHistory } from "react-router-dom";
import LayoutContainer from "../../../components/reusableComponents/LayoutContainer";
import { useDispatch, useSelector } from "react-redux";
import {
  addMasterContainerType,
  getSingleContainerType,
  updateMasterContainerType,
} from "../../../actions/Master/ContainerTypeMasterActions";
import { useSnackbar } from "notistack";

import { Image } from "semantic-ui-react";
import { theme } from "../../../App";

const useStyles = makeStyles((theme) => ({
  paperContainer: {
    padding: theme.spacing(4, 3),
  },
  LabelTypography: {
    fontSize: 14,
    fontWeight: 600,
    color: "#243545",
    paddingBottom: 4,
    [theme.breakpoints.down("sm")]: {
      paddingBottom: 1,
    },
  },
  button: {
    fontSize: 12.5,
    borderRadius: 6,
    marginLeft: "auto",
    marginRight: "auto",
    marginTop: 20,
    width: "30%",
    border: "1.5px solid #2A5FA5",
    boxShadow: "0px 3px 6px #9199A14D",
    backgroundColor: "#2A5FA5",
    color: "#fff",
    "&:hover": {
      backgroundColor: "#2A5FA5",
    },
  },
  input: {
    padding: 8,
  },
  textField: {
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        borderColor: "#243545",
      },
    },
  },
  backImage: {
    height: 40,
    width: 40,
    marginBottom: 15,
    cursor: "pointer",
  },
}));

export default function AddUpdateContainerType(props) {
  const classes = useStyles();
  const dispatch = useDispatch();
  const history = useHistory();
  const store = useSelector((state) => state);
  const { containerTypeMaster } = store;
  const [containerTypeName, setContainerTypeName] = useState("");
  const notify = useSnackbar().enqueueSnackbar;

  useEffect(() => {
    if (props.history.location.state) {
      dispatch(
        getSingleContainerType(
          props.history.location.state.allDetails.pk,
          notify
        )
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (containerTypeMaster.containerTypeDetails.pk) {
      setContainerTypeName(containerTypeMaster.containerTypeDetails.name);
    }
  }, [containerTypeMaster.containerTypeDetails]);

  const createContainerType = () => {
    if (containerTypeName === "")
      notify("Please Enter Container Type Name", { variant: "warning" });
    else {
      let data = {
        name: containerTypeName,
      };
      dispatch(addMasterContainerType(data, history, notify));
    }
  };

  const updateContainerType = () => {
    if (containerTypeName === "")
      notify("Please Enter Container Type Name", { variant: "warning" });
    else {
      let data = {
        pk: containerTypeMaster.containerTypeDetails.pk,
        name: containerTypeName,
      };
      dispatch(
        updateMasterContainerType(
          containerTypeMaster.containerTypeDetails.pk,
          data,
          history,
          notify
        )
      );
    }
  };

  const handleGoBack = () => {
    history.goBack();
  };

  return (
    <LayoutContainer footer={false}>
      <div>
        <Image
          src={require("../../../assets/images/back-arrow.png")}
          className={classes.backImage}
          onClick={handleGoBack}
        />
        <Typography variant="subtitle2">
          <Box fontWeight="fontWeightBold" m={1}>
            {containerTypeMaster.containerTypeDetails.pk
              ? "Update Container Type"
              : "Add Container Type"}
          </Box>
        </Typography>
        <Paper className={classes.paperContainer} elevation={0}>
          <Grid container spacing={4} alignItems="center" justify="center">
            <Grid
              item
              xs={12}
              sm={5}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Container Type <span style={{ color: "red" }}>*</span>
              </Typography>

              <TextField
                id="container-type-master-name"
                type={"text"}
                value={containerTypeName}
                variant="outlined"
                fullWidth
                className={classes.textField}
                inputProps={{ className: classes.input }}
                onChange={(e) => setContainerTypeName(e.target.value)}
              />
            </Grid>
          </Grid>

          <Grid
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginTop: 20,
            }}
          >
            {containerTypeMaster.containerTypeDetails.pk ? (
              <Button className={classes.button} onClick={updateContainerType}>
                Update
              </Button>
            ) : (
              <Button className={classes.button} onClick={createContainerType}>
                Save
              </Button>
            )}
          </Grid>
        </Paper>
      </div>
    </LayoutContainer>
  );
}
