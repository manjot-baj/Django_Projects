import React, { useState } from "react";
import clsx from "clsx";
import {
  makeStyles,
  Paper,
  Button,
  useMediaQuery,
  Modal,
  Typography,
  Chip,
  Grid,
} from "@material-ui/core";
import { useSelector, useDispatch } from "react-redux";
import {
  removeAllotmentDispatch,
  addRemoveContainerQueue,
  getZIMRepairEDIAction,
  getUSAApprovedContainersExcel,
} from "../actions/StocksAndAllotmentActions";
import { useHistory } from "react-router-dom";
import { useSnackbar } from "notistack";
import Tooltip from "@mui/material/Tooltip";
import ImportExportIcon from "@material-ui/icons/ImportExport";
import { getStockStatementExcel } from "../actions/StocksAndAllotmentActions";
import UploadIcon from "@mui/icons-material/Upload";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import QueueIcon from "@mui/icons-material/Queue";
import EditIcon from "@mui/icons-material/Edit";
import { Alert, Stack } from "@mui/material";

const useStyles = makeStyles((theme) => ({
  footerRoot: {
    width: "100%",
    padding: theme.spacing(1.5),
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "fixed",
    paddingLeft: "200px",
    bottom: 0,
    left: 0,
    backgroundColor: "#fff",
    [theme.breakpoints.down("sm")]: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      paddingLeft: "0px",
    },
  },
  footerShift: {
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
    position: "fixed",
    display: "flex",
  },
  button: {
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
    [theme.breakpoints.down("sm")]: {
      width: "240px",
      fontSize: "12px",
      marginTop: "8px",
    },
  },
  downlaodStockButton: {
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
    [theme.breakpoints.down("sm")]: {
      fontSize: "12px",
      marginTop: "8px",
      width: "240px",
    },
  },
  modalPaper: {
    position: "absolute",
    width: "70%",
    backgroundColor: "white",
    boxShadow: 5,
    padding: 20,
    outline: "none",
    borderRadius: 10,
  },
  stockButton: {
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
    [theme.breakpoints.down("sm")]: {
      fontSize: "12px",
      marginTop: "8px",
      width: "240px",
    },
  },
}));

const StocksAndAllotmentFooter = (props) => {
  const classes = useStyles();
  const { open } = props;
  const store = useSelector((state) => state);
  const { stocksAndAllotment, stocksAndAllotmentSearch, user } = store;
  const dispatch = useDispatch();
  const history = useHistory();
  const matchesIphone = useMediaQuery("(max-width:500px)");
  const [openModal, setOpenModal] = useState(false);
  const notify = useSnackbar().enqueueSnackbar;
  const handleAddBookingClick = () => {
    if (
      stocksAndAllotment?.checkedRow.some(
        (item) => item.usa_approval_container === true
      )
    ) {
      setOpenModal(true);
    } else {
      history.push("/allotment_booking");
    }
  };

  const handleQueue = () => {
    let req = {
      container_list: stocksAndAllotment?.checkedRow.map(
        (item) => item.container_no
      ),
    };
    dispatch(addRemoveContainerQueue(req, notify));
  };

  function getModalStyle() {
    const top = 50;
    const left = 50;

    return {
      top: `${top}%`,
      left: `${left}%`,
      transform: `translate(-${top}%, -${left}%)`,
    };
  }

  const handleModalClose = () => {
    setOpenModal(false);
  };
  const openStockUpload = () => {
    history.push("/stocks-upload");
  };

  const handleImportStock = () => {
    dispatch(getStockStatementExcel(stocksAndAllotmentSearch, notify));
  };

  const handleUSAApprovedSheet = () => {
    dispatch(getUSAApprovedContainersExcel(notify));
  };

  const handleDownloadZIMRepairEDI = () => {
    let pk_list = stocksAndAllotment?.checkedRow?.map((val) => val.pk);
    dispatch(getZIMRepairEDIAction(pk_list, notify));
  };

  return (
    <Paper
      className={clsx(classes.footerRoot, {
        [classes.footerShift]: open,
      })}
    >
      <Tooltip title="Click to upload a stock" arrow>
        {user.location === "Ludhiana" && user.site === "PGL Depot" ? null : (
          <Button
            className={classes.stockButton}
            style={{
              backgroundColor: "#2A5FA5",
              color: "#fff",
              border: "none",
            }}
            onClick={openStockUpload}
            startIcon={<UploadIcon fontSize="small" />}
          >
            Stock Upload
          </Button>
        )}
      </Tooltip>
      <Tooltip title="Click to download the stock sheet" arrow>
        <Button
          className={classes.downlaodStockButton}
          onClick={handleImportStock}
          startIcon={<ImportExportIcon />}
        >
          Download Stock sheet
        </Button>
      </Tooltip>

      <Tooltip title="USA approved containers sheet " arrow>
        <Button
          className={classes.downlaodStockButton}
          onClick={handleUSAApprovedSheet}
          startIcon={<ImportExportIcon />}
        >
          USA approved
        </Button>
      </Tooltip>

      {stocksAndAllotment?.checkedRow?.length > 0 &&
        stocksAndAllotmentSearch.out_history === "True" && (
          <Button
            className={classes.button}
            onClick={handleAddBookingClick}
            startIcon={<EditIcon fontSize="small" />}
          >
            Edit Booking Number
          </Button>
        )}
      {stocksAndAllotment?.checkedRow?.length > 0 &&
        stocksAndAllotmentSearch.do_not_lift_queue === "False" &&
        stocksAndAllotmentSearch.out_history === "False" && (
          <>
            {stocksAndAllotment?.checkedRow.some(
              (item) =>
                item.booking_no !== "" &&
                item.status === "Alloted" &&
                item.status !== "Available"
            ) ? (
              <>
                <Button
                  className={classes.button}
                  onClick={handleAddBookingClick}
                  startIcon={<EditIcon fontSize="small" />}
                >
                  Edit Allotment Number
                </Button>
                <Button
                  className={classes.button}
                  onClick={() => {
                    dispatch(
                      removeAllotmentDispatch(
                        stocksAndAllotment?.checkedRow.map((item) => item.pk),
                        notify
                      )
                    );
                  }}
                  style={{ backgroundColor: "red" }}
                >
                  Cancel Booking
                </Button>
              </>
            ) : (
              <Stack
                marginTop={matchesIphone ? 1 : 0}
                marginLeft={matchesIphone ? 1 : 0}
                display={"flex"}
                alignItems={matchesIphone ? "flex-start" : "center"}
                justifyContent={matchesIphone ? "flex-start" : "center"}
                flexDirection={matchesIphone ? "column" : "row"}
              >
                <Button
                  className={classes.button}
                  onClick={handleAddBookingClick}
                  startIcon={<AddCircleOutlineIcon fontSize="small" />}
                >
                  Add Booking Number
                </Button>
                <Button
                  className={classes.button}
                  onClick={handleQueue}
                  startIcon={<QueueIcon fontSize="small" />}
                >
                  Add To Queue
                </Button>
              </Stack>
            )}
          </>
        )}
      {stocksAndAllotment?.checkedRow?.length > 0 &&
        stocksAndAllotmentSearch.do_not_lift_queue === "True" &&
        stocksAndAllotmentSearch.out_history === "False" && (
          <Button
            className={classes.button}
            onClick={handleQueue}
            style={{ backgroundColor: "red" }}
          >
            Remove From Queue
          </Button>
        )}
      {stocksAndAllotment?.checkedRow?.length > 0 && (
        <Tooltip title="Click to download ZIM Repair EDI" arrow>
          <Button
            className={classes.downlaodStockButton}
            onClick={handleDownloadZIMRepairEDI}
            startIcon={<ImportExportIcon />}
          >
            ZIM Repair EDI
          </Button>
        </Tooltip>
      )}
      <Modal open={openModal} onClose={handleModalClose}>
        <div style={getModalStyle()} className={classes.modalPaper}>
          <Alert variant="standard" severity="info">
            The Containers you have selected are USA Approved Container.
          </Alert>
          <Grid
            container
            spacing={1}
            style={{
              marginTop: 24,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            {stocksAndAllotment?.checkedRow.map((item) =>
              item.usa_approval_container === true ? (
                <Grid item xs={4} sm={3} md={2} lg={2}>
                  <Chip
                    label={item.container_no}
                    color="primary"
                    variant="outlined"
                  />
                </Grid>
              ) : null
            )}
          </Grid>
          <Stack
            direction={"row"}
            alignItems={"center"}
            justifyContent={"flex-end"}
            spacing={2}
            mt={24}
          >
            <Button variant="text" color="primary" onClick={handleModalClose}>
              Cancel Booking
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => history.push("/allotment_booking")}
            >
              Continue Booking
            </Button>
          </Stack>
        </div>
      </Modal>
    </Paper>
  );
};

export default StocksAndAllotmentFooter;
