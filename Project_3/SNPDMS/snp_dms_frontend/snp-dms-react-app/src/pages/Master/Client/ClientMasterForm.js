import React, { useEffect } from "react";
import { Grid, Button, makeStyles } from "@material-ui/core";
import { useDispatch, useSelector } from "react-redux";
import LayoutContainer from "../../../components/reusableComponents/LayoutContainer";
import AddSection from "./AddSection";
import StatutoryDetails from "./StatutoryDetails";
import ClientRepresentatives from "./ClientRepresentatives";
import {
  getSingleClient,
  addMasterClient,
  updateMasterClient,
} from "../../../actions/Master/ClientMasterActions";
import { useHistory } from "react-router-dom";
import { Image } from "semantic-ui-react";
import { useSnackbar } from "notistack";

const useStyles = makeStyles((theme) => ({
  button: {
    fontSize: 12.5,
    borderRadius: 6,
    // marginLeft: 'auto',
    // marginRight: 'auto',
    width: "100%",
    border: "1.5px solid #2A5FA5",
    boxShadow: "0px 3px 6px #9199A14D",
    backgroundColor: "#2A5FA5",
    color: "#fff",
    "&:hover": {
      backgroundColor: "#2A5FA5",
    },
  },
  backImage: {
    height: 40,
    width: 40,
    marginBottom: 15,
    cursor: "pointer",
  },
}));

export default function ClientMasterForm(props) {
  const dispatch = useDispatch();
  const classes = useStyles();
  const store = useSelector((state) => state);
  const { clientMaster } = store;
  const history = useHistory();
  const notify = useSnackbar().enqueueSnackbar;

  function validateEmail(email) {
    var re = /\S+@\S+\.\S+/;
    return re.test(email);
  }

  function isAlphaNumeric(str, gstOrPan) {
    var code, i, len;

    if (gstOrPan === "gst") {
      if (str.length !== 15) return false;
    } else if (str.length !== 10) {
      return false;
    }

    for (i = 0, len = str.length; i < len; i++) {
      code = str.charCodeAt(i);
      if (
        !(code > 47 && code < 58) && // numeric (0-9)
        !(code > 64 && code < 91) && // upper alpha (A-Z)
        !(code > 96 && code < 123) // lower alpha (a-z)
      ) {
        return false;
      }
    }
    return true;
  }

  useEffect(() => {
    if (props.history.location.state) {
      dispatch(
        getSingleClient(props.history.location.state.allDetails.pk, notify)
      );
    }

    // cleanup function
    return () => {
      dispatch({ type: "CLEAN_CLIENT_MASTER" });
    };
    // eslint-disable-next-line no-unused-vars
// eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function isMobileNoValid(str) {
    const mobileValidation = /^[0-9]{10}$/;
    return mobileValidation.test(str);
  }

  const handleClientCreation = () => {
    if (clientMaster.clientDetails.client_data.name === "")
      notify("Please Enter Client Name", {
        variant: "warning",
      });
    else if (clientMaster.clientDetails.client_data.office_address === "")
      notify("Please Enter Office Address", {
        variant: "warning",
      });
    else if (clientMaster.clientDetails.client_data.location === "")
      notify("Please Enter Location", {
        variant: "warning",
      });
    else if (clientMaster.clientDetails.client_data.site === "")
      notify("Please Enter Site", {
        variant: "warning",
      });
    else if (clientMaster.clientDetails.client_data.type === "")
      notify("Please Enter Type", {
        variant: "warning",
      });
    else if (clientMaster.clientDetails.client_data.mobile_no  && 
      !isMobileNoValid(clientMaster.clientDetails.client_data.mobile_no, "mobile"))
      notify("Please Enter correct Mobile Number", {
        variant: "warning",
      });
    else if (clientMaster.clientDetails.client_data.email_id && 
      !validateEmail(clientMaster.clientDetails.client_data.email_id, "email"))
      notify("Please Enter correct Email Address", {
        variant: "warning",
      });
    else if (
      clientMaster.clientDetails.client_data.type === "Line" &&
      clientMaster.clientDetails.client_data.shipping_line === ""
    )
      notify("Please Enter Shipping Line", {
        variant: "warning",
      });
    else if (
      clientMaster.clientDetails.client_data.gst_no &&
      !isAlphaNumeric(clientMaster.clientDetails.client_data.gst_no, "gst")
    )
      notify("GST Number is incorrect", {
        variant: "warning",
      });
    else if (
      clientMaster.clientDetails.client_data.pan_no &&
      !isAlphaNumeric(clientMaster.clientDetails.client_data.pan_no, "pan")
    )
      notify("PAN Number is incorrect", {
        variant: "warning",
      });
    else if (
      clientMaster.clientDetails.client_data.edi_service &&
      clientMaster.clientDetails.client_data.ref_code === ""
    )
      notify("Enter Ref Code when EDI selected", {
        variant: "warning",
      });
    else {
      let count1 = 0;
      let count2 = 0;
      if (clientMaster.clientDetails.client_data.edi_service) {
        let value =
          clientMaster.clientDetails.client_data.edi_to_email_id.replace(
            / /g,
            ""
          );
        let newValue = value.split(",");
        for (var i = 0; i < newValue.length; i++) {
          if (!validateEmail(newValue[i])) {
            count1 = count1 + 1;
          }
        }
        let value2 =
          clientMaster.clientDetails.client_data.edi_cc_email_id.replace(
            / /g,
            ""
          );
        let newValue2 = value2.split(",");
        for (var j = 0; j < newValue2.length; j++) {
          if (!validateEmail(newValue2[j])) {
            count2 = count2 + 1;
          }
          // dispatch(addMasterClient(clientMaster.clientDetails, history));
        }
      }
      if (count1 > 0)
        notify("Please enter Proper Email IDs in EDI To", {
          variant: "warning",
        });
      else if (count2 > 0)
        notify("Please enter Proper Email IDs in EDI CC", {
          variant: "warning",
        });
      else
        dispatch(addMasterClient(clientMaster.clientDetails, history, notify));
    }
  };

  const handleClientUpdateCreation = () => {
    if (clientMaster.clientDetails.client_data.name === "")
      notify("Please Enter Client Name", {
        variant: "warning",
      });
    else if (clientMaster.clientDetails.client_data.office_address === "")
      notify("Please Enter Office Address", {
        variant: "warning",
      });
    else if (clientMaster.clientDetails.client_data.location === "")
      notify("Please Enter Location", {
        variant: "warning",
      });
    else if (clientMaster.clientDetails.client_data.site === "")
      notify("Please Enter Site", {
        variant: "warning",
      });
    else if (clientMaster.clientDetails.client_data.type === "")
      notify("Please Enter Type", {
        variant: "warning",
      });
    else if (
      clientMaster.clientDetails.client_data.type === "Line" &&
      clientMaster.clientDetails.client_data.shipping_line === ""
    )
      notify("Please Enter Shipping Line", {
        variant: "warning",
      });
    else
      dispatch(
        updateMasterClient(
          clientMaster.clientDetails.client_data.pk,
          clientMaster.clientDetails,
          history,
          notify
        )
      );
  };

  const handleGoBack = () => {
    history.goBack();
  };

  return (
    <LayoutContainer footer={false}>
      <Grid container>
        <Grid item xs={12}>
          <Image
            src={require("../../../assets/images/back-arrow.png")}
            className={classes.backImage}
            onClick={handleGoBack}
          />
          <AddSection />
          <StatutoryDetails />
          <ClientRepresentatives />
          <Grid
            style={{
              marginLeft: "auto",
              marginRight: "auto",
              width: "30%",
              marginTop: 16,
              marginBottom: 16,
            }}
          >
            {clientMaster.clientDetails.client_data.pk ? (
              <Button
                className={classes.button}
                onClick={handleClientUpdateCreation}
              >
                Update
              </Button>
            ) : (
              <Button className={classes.button} onClick={handleClientCreation}>
                Save
              </Button>
            )}
          </Grid>
        </Grid>
      </Grid>
    </LayoutContainer>
  );
}
