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
  addMasterContainerSize,
  getSingleContainerSize,
  updateMasterContainerSize,
} from "../../../actions/Master/ContainerSizeMasterActions";
import { useSnackbar } from "notistack";
import { theme } from "../../../App";
import { Image } from "semantic-ui-react";

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

export default function AddUpdateContainerSize(props) {
  const classes = useStyles();
  const dispatch = useDispatch();
  const history = useHistory();
  const store = useSelector((state) => state);
  const { containerSizeMaster } = store;
  const [containerSizeName, setContainerSizeName] = useState("");
  const notify = useSnackbar().enqueueSnackbar;

  useEffect(() => {
    if (props.history.location.state) {
      dispatch(
        getSingleContainerSize(
          props.history.location.state.allDetails.pk,
          notify
        )
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (containerSizeMaster.containerSizeDetails.pk) {
      setContainerSizeName(containerSizeMaster.containerSizeDetails.name);
    }
  }, [containerSizeMaster.containerSizeDetails]);

  const createContainerSize = () => {
    if (containerSizeName === "")
      notify("Please Enter Container Size Name", { variant: "warning" });
    else {
      let data = {
        name: containerSizeName,
      };
      dispatch(addMasterContainerSize(data, history, notify));
    }
  };

  const updateContainerSize = () => {
    if (containerSizeName === "")
      notify("Please Enter Container Size Name", { variant: "warning" });
    else {
      let data = {
        pk: containerSizeMaster.containerSizeDetails.pk,
        name: containerSizeName,
      };
      dispatch(
        updateMasterContainerSize(
          containerSizeMaster.containerSizeDetails.pk,
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

  const handleContainerSizeChange = (e) => {
    const regex = /^[0-9\b]+$/;
    if (e.target.value === "" || regex.test(e.target.value)) {
      setContainerSizeName(e.target.value);
    }
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
            {containerSizeMaster.containerSizeDetails.pk
              ? "Update Container Size"
              : "Add Container Size"}
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
                Container Size <span style={{ color: "red" }}>*</span>
              </Typography>

              <TextField
                id="container-size-master-name"
                type={"text"}
                value={containerSizeName}
                variant="outlined"
                fullWidth
                className={classes.textField}
                inputProps={{ className: classes.input }}
                onChange={(e) => handleContainerSizeChange(e)}
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
            {containerSizeMaster.containerSizeDetails.pk ? (
              <Button className={classes.button} onClick={updateContainerSize}>
                Update
              </Button>
            ) : (
              <Button className={classes.button} onClick={createContainerSize}>
                Save
              </Button>
            )}
          </Grid>
        </Paper>
      </div>
    </LayoutContainer>
  );
}
