import React, { useState } from "react";
import {
  makeStyles,
  Typography,
  Paper,
  Box,
  Grid,
  Button,
  IconButton,
} from "@material-ui/core";
import DeleteIcon from "@material-ui/icons/Delete";
import { useDispatch, useSelector } from "react-redux";
import CustomRow from "../../../components/GateInEIRShippingLineRow";

const useStyles = makeStyles((theme) => ({
  paperContainer: {
    padding: theme.spacing(2),
    width: "100%",
  },
  input: {
    padding: 8,
    // backgroundColor: "#fff",
  },
  textField: {
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        borderColor: "#243545",
      },
    },
  },
  choiceSelectContainer: {
    border: "1px solid #243545",
    marginTop: "0rem",
    display: "flex",
    borderRadius: 6,
  },
  choice: {
    backgroundColor: "#fff",
    width: "100%",
    padding: 1,
  },
  selectedChoice: {
    borderRadius: 5,
    color: "#fff",
    backgroundColor: "#2F6FB7",
    width: "100%",
    padding: 1,
    "&:hover": {
      backgroundColor: "#2F6FB7",
    },
  },
  LabelTypography: {
    fontSize: 14,
    fontWeight: 600,
    color: "#243545",
    paddingBottom: 4,
    [theme.breakpoints.down("sm")]: {
      // padding: "1px 4px",
      paddingBottom: 1,
    },
  },
}));

const NewRow = (props) => {
  const { onDelete, rowIndex } = props;
  return (
    <div key={`row-key-${rowIndex}`} id={`row-id-${rowIndex}`}>
      <Grid
        container
        alignItems="center"
        spacing={2}
        style={{ backgroundColor: "#EAF0F5", width: "100%", padding: 10 }}
      >
        <Grid item xs={4} sm={4} lg={1} className="gridItem">
          <IconButton onClick={() => onDelete(rowIndex)}>
            <DeleteIcon fontSize="inherit" style={{ color: "red" }} />
          </IconButton>
        </Grid>

        <CustomRow
          rowId={`fieldId-exec-name-${rowIndex}`}
          fieldValue={""}
          lgsize={3}
          xssize={4}
          readOnlyTF={false}
          dispatchType={"SET_REPRESENTATIVE_NAME"}
          index={rowIndex}
          select={false}
        />

        <CustomRow
          rowId={`fieldId-designation-${rowIndex}`}
          fieldValue={""}
          lgsize={2}
          xssize={4}
          readOnlyTF={false}
          dispatchType={"SET_REPRESENTATIVE_DESIGNATION"}
          index={rowIndex}
          select={false}
        />
        <CustomRow
          rowId={`fieldId-email-id-${rowIndex}`}
          fieldValue={""}
          lgsize={2}
          xssize={4}
          readOnlyTF={false}
          dispatchType={"SET_REPRESENTATIVE_EMAIL"}
          index={rowIndex}
          select={false}
        />
        <CustomRow
          rowId={`fieldId-phone-${rowIndex}`}
          fieldValue={""}
          lgsize={2}
          xssize={4}
          readOnlyTF={false}
          dispatchType={"SET_REPRESENTATIVE_PHONE"}
          index={rowIndex}
          select={false}
        />
        <CustomRow
          rowId={`fieldId-mobile-${rowIndex}`}
          // fieldValue={area.description}
          fieldValue={""}
          lgsize={2}
          xssize={4}
          readOnlyTF={false}
          dispatchType={"SET_REPRESENTATIVE_MOBILE"}
          index={rowIndex}
          select={false}
        />
      </Grid>
    </div>
  );
};

export default function ClientRepresentatives() {
  const classes = useStyles();
  const store = useSelector((state) => state);
  const { clientMaster } = store;
  const [rowCount, setRowCount] = useState([]);
  const dispatch = useDispatch();

  const onDelete = (ind) => {
    let rowCountArray = [...rowCount];

    if (ind !== -1) {
      rowCountArray.splice(ind, 1);
      dispatch({
        type: "SET_REMOVE_CLIENT_REPRESENTATIVE_DATA",
        payload: { index: ind },
      });
      setRowCount(rowCountArray);
    }
  };

  return (
    <div>
      <Typography
        variant="subtitle2"
        style={{
          paddingTop: 14,
          paddingBottom: 14,
          backgroundColor: "#243545",
          color: "#FFF",
          marginTop: 20,
          borderTopLeftRadius: 5,
          borderTopRightRadius: 5,
        }}
      >
        <Box fontWeight="fontWeightBold" m={1}>
          Client Representatives
        </Box>
      </Typography>
      <Paper className={classes.paperContainer} elevation={0}>
        <div style={{ backgroundColor: "#EAF0F5" }}>
          <Grid
            container
            // justify='space-between'
            spacing={2}
            style={{ backgroundColor: "#BDCCD9", width: "100%", padding: 10 }}
          >
            <Grid item xs={4} sm={4} lg={1} className="gridItem"></Grid>
            <Grid item xs={4} sm={4} lg={3} className="gridItem">
              <Typography>Executive name</Typography>
            </Grid>
            <Grid item xs={4} sm={4} lg={2} className="gridItem">
              <Typography>Designation</Typography>
            </Grid>

            <Grid item xs={4} sm={4} lg={2} className="gridItem">
              <Typography>Email Id</Typography>
            </Grid>
            <Grid item xs={4} sm={4} lg={2} className="gridItem">
              <Typography>Phone</Typography>
            </Grid>
            <Grid item xs={4} sm={4} lg={2} className="gridItem">
              <Typography>Mobile</Typography>
            </Grid>
          </Grid>
        </div>
        {clientMaster.clientDetails.client_representative_data.length > 0 &&
          clientMaster.clientDetails.client_representative_data.map(
            (item, index) => {
              return <NewRow rowIndex={index} onDelete={onDelete} />;
            }
          )}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
          }}
        >
          <Button
            style={{
              backgroundColor: "#FDBD2E",
              padding: 6,
              marginTop: 18,
              color: "white",
              width: "165px",
            }}
            onClick={() => {
              dispatch({
                type: "SET_ADD_CLIENT_REPRESENTATIVE_DATA",
                payload: {
                  client: "",
                  name: "",
                  designation: "",
                  phone_no: "",
                  mobile_no: "",
                  email_id: "",
                },
              });
              setRowCount((prev) => [
                ...prev,
                {
                  client: "",
                  name: "",
                  designation: "",
                  phone_no: "",
                  mobile_no: "",
                  email_id: "",
                },
              ]);
            }}
          >
            Add New Row
          </Button>
        </div>
      </Paper>
    </div>
  );
}
