import React from "react";
import clsx from "clsx";
import { makeStyles, Paper, Button, Tooltip } from "@material-ui/core";
import { useSelector, useDispatch } from "react-redux";
import {
  addRemoveContainerQueueMnr,
  removeMnrDispatch,
} from "../actions/MNRGridActions";
import { useHistory } from "react-router-dom";
import { useSnackbar } from "notistack";
import { getMNRStatementExcel } from "../actions/StocksAndAllotmentActions";
import ImportExportIcon from "@material-ui/icons/ImportExport";

const useStyles = makeStyles((theme) => ({
  footerRoot: {
    width: "100%",
    padding: theme.spacing(1.5),
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "fixed",
    bottom: 0,
    left: 0,
    backgroundColor: "#fff",
    zIndex: 99,
    [theme.breakpoints.down('sm')]:{
      flexWrap:"wrap"
    }
  },
  footerShift: {
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  },
  button: {
    width: "200px",
    borderRadius: 6,
    backgroundColor: "#2A5FA5",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    marginLeft: 10,
    marginRight: 10,
    "&:hover": {
      backgroundColor: "#2A5FA5",
    },
    [theme.breakpoints.down("xs")]: {
      fontSize: "0.9rem",
      width: "240px",
      marginTop:2
    },
  },
}));

const MnrFooter = (props) => {
  const classes = useStyles();
  const { open } = props;
  const store = useSelector((state) => state);
  const { stocksAllotment, stocksAndAllotment ,MNRGridSearch,user} = store;
  const dispatch = useDispatch();
  const history = useHistory();
  const notify = useSnackbar().enqueueSnackbar;

  const handleAddBookingClick = () => {
    var win = window.open(
      `${window.location.href.split("/")[0]}/allotment_booking

      `,
      "_blank"
    );
    win.focus();
  };

  const handleQueue = () => {
    let req = {
      container_list: stocksAllotment.container_list,
    };
    dispatch(addRemoveContainerQueueMnr(req, notify));
  };

  const openStockUpload = () => {
    history.push("/mnr-upload");
  };

  const openWashingUpload = () => {
    history.push("/mnr-washing-upload");
  };

  const handleImportStock = () => {
    dispatch(getMNRStatementExcel(MNRGridSearch, notify));
  };

  return (
    <Paper
      className={clsx(classes.footerRoot, {
        [classes.footerShift]: open,
      })}
    >
    {((user?.mnr_team === true || user?.mnr_team === "True") &&
        user.role !== "Admin") ?null :  <Tooltip title="Upload MNR data using Excel sheet">
        <Button
          className={classes.button}
          style={{ backgroundColor: "#2A5FA5", color: "#fff", border: "none" }}
          onClick={openStockUpload}
        >
          Stock Upload MNR
        </Button>
      </Tooltip>}
    { ((user?.mnr_team === true || user?.mnr_team === "True") &&
        user.role !== "Admin") ?null:  <Tooltip title="Bulk Upload Survey using Excel sheet">
        <Button
          className={classes.button}
          style={{
            backgroundColor: "#2A5FA5",
            color: "#fff",
            border: "none",
        
          }}
          onClick={openWashingUpload}
        >
          Survey Bulk Upload
        </Button>
      </Tooltip>}
     {user.type === "NON DEPOT" && <Tooltip title="Download Stock Excel sheet">
        <Button
         className={classes.button}
          style={{
            backgroundColor: "#2A5FA5",
            color: "white",
            height: "40px",
         
          }}
          onClick={handleImportStock}
          startIcon={<ImportExportIcon />}
        >
          Download Stock sheet
        </Button>
      </Tooltip>}
      {stocksAllotment.container_list.length > 0 && (
        <Button
          className={classes.button}
          onClick={
            stocksAndAllotment.selectedContainersListType.length > 0 &&
            stocksAndAllotment.selectedContainersListType[0].type ===
              "DO_NOT_LIFT"
              ? handleQueue
              : handleAddBookingClick
          }
          style={
            stocksAndAllotment.selectedContainersListType.length > 0 &&
            stocksAndAllotment.selectedContainersListType[0].type ===
              "DO_NOT_LIFT"
              ? { backgroundColor: "red" }
              : null
          }
        >
          {stocksAndAllotment.selectedContainersListType.length > 0 &&
          stocksAndAllotment.selectedContainersListType[0].type === "BOOKING_NO"
            ? "Edit Booking Number"
            : stocksAndAllotment.selectedContainersListType.length > 0 &&
              stocksAndAllotment.selectedContainersListType[0].type === "NEW"
            ? "Add Booking Number"
            : "Remove From Queue"}
        </Button>
      )}
      {stocksAllotment.container_list.length > 0 &&
        stocksAndAllotment.selectedContainersListType.length > 0 &&
        stocksAndAllotment.selectedContainersListType[0].type === "NEW" && (
          <Button className={classes.button} onClick={handleQueue}>
            Add To Queue
          </Button>
        )}

      {stocksAllotment.container_list.length > 0 &&
        stocksAndAllotment.selectedContainersListType &&
        stocksAndAllotment.selectedContainersListType.length > 0 &&
        stocksAndAllotment.selectedContainersListType[0].type ===
          "BOOKING_NO" && (
          <Button
            className={classes.button}
            onClick={() => {
              dispatch(
                removeMnrDispatch(stocksAndAllotment.containerPK, notify)
              );
            }}
            style={{ backgroundColor: "red" }}
          >
            Cancel Booking
          </Button>
        )}
    </Paper>
  );
};

export default MnrFooter;
