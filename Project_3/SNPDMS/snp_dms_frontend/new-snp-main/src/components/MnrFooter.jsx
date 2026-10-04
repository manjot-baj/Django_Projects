import React from "react";
import { Paper, Button, Tooltip, styled } from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import SendIcon from "@mui/icons-material/Send";
import {
  addRemoveContainerQueueMnr,
  removeMnrDispatch,
} from "../actions/MNRGridActions";
import { useHistory } from "react-router-dom";
import { useSnackbar } from "notistack";
import { getMNRStatementExcel } from "../actions/StocksAndAllotmentActions";
import ImportExportIcon from "@mui/icons-material/ImportExport";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import UploadIcon from "@mui/icons-material/CloudUpload";

const FooterRoot = styled(Paper)(({ theme }) => ({
  width: "100%",
  padding: theme.spacing(1.5),
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  position: "fixed",
  gap: 24,
  bottom: 0,
  left: 0,
  backgroundColor: "#fff",
  zIndex: 99,
  [theme.breakpoints.down("sm")]: {
    flexWrap: "wrap",
    gap: 4,
  },
}));

const footerShiftStyle = (theme) => ({
  marginLeft: 0,
  transition: theme.transitions.create("margin", {
    easing: theme.transitions.easing.easeOut,
    duration: theme.transitions.duration.enteringScreen,
  }),
});

const MnrFooter = (props) => {
  const { open } = props;
  const store = useSelector((state) => state);
  const { stocksAllotment, stocksAndAllotment, MNRGridSearch, user } = store;
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
    history.push("/mnr/mnr-upload");
  };

  const openWashingUpload = () => {
    history.push("/mnr/mnr-washing-upload");
  };

  const handleImportStock = () => {
    dispatch(getMNRStatementExcel(MNRGridSearch, notify));
  };

  const handleDirectPush = () => {
    history.push("/mnrprocess");
  };

  const openStockUploadStock = () => {
    history.push("/depot/stocks-upload");
  };

  return (
    <FooterRoot
      sx={(theme) => ({
        ...(open ? footerShiftStyle(theme) : {}),
      })}
    >
      {user.type === "NON DEPOT" && (
        <Button
          variant="contained"
          color="warning"
          size="small"
          sx={(theme) => ({
            borderRadius: 12,
         
          })}
          
          onClick={openStockUploadStock}
          startIcon={<UploadIcon />}
        >
          Stock Upload
        </Button>
      )}
      {(user?.mnr_team === true || user?.mnr_team === "True") &&
      user.role !== "Admin" ? null : (
        <Tooltip title="Navigate to MNR page">
          <Button
            variant="contained"
            color="primary"
            size="small"
            
            sx={{ borderRadius: 12 }}
            onClick={handleDirectPush}
            startIcon={<SendIcon />}
          >
            MNR Process
          </Button>
        </Tooltip>
      )}
      {(user?.mnr_team === true || user?.mnr_team === "True") &&
      user.role !== "Admin" ? null : (
        <Tooltip title="Upload MNR data using Excel sheet">
          <Button
            variant="contained"
            color="success"
            size="small"
            
            sx={{ borderRadius: 12 }}
            startIcon={<CloudUploadOutlinedIcon />}
            onClick={openStockUpload}
          >
            Stock Upload MNR
          </Button>
        </Tooltip>
      )}
      {(user?.mnr_team === true || user?.mnr_team === "True") &&
      user.role !== "Admin" ? null : (
        <Tooltip title="Bulk Upload Survey using Excel sheet">
          <Button
            variant="contained"
            color="success"
            size="small"
            
            sx={{ borderRadius: 12 }}
            startIcon={<CloudUploadOutlinedIcon />}
            onClick={openWashingUpload}
          >
            Survey Bulk Upload
          </Button>
        </Tooltip>
      )}
      {user.type === "NON DEPOT" && (
        <Tooltip title="Download Stock Excel sheet">
          <Button
            variant="contained"
            color="success"
            size="small"
            
            sx={(theme) => ({
              cursor: "pointer",
              borderRadius: 12,
              [theme.breakpoints.down("xs")]: {
                fontSize: "0.9rem",
                width: "240px",
                marginTop: 2,
              },
            })}
            onClick={handleImportStock}
            startIcon={<ImportExportIcon />}
          >
            Download Stock sheet
          </Button>
        </Tooltip>
      )}
      {stocksAllotment.container_list.length > 0 && (
        <Button
          sx={(theme) => ({
            width: "200px",
            borderRadius: 2,
            backgroundColor: "#2A5FA5",
            color: "#fff",
            border: "none",
            cursor: "pointer",
            marginLeft: 2,
            marginRight: 2,
            "&:hover": {
              backgroundColor: "#2A5FA5",
            },
            [theme.breakpoints.down("xs")]: {
              fontSize: "0.9rem",
              width: "240px",
              marginTop: 2,
            },
          })}
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
          <Button
            sx={(theme) => ({
              width: "200px",
              borderRadius: 2,
              backgroundColor: "#2A5FA5",
              color: "#fff",
              border: "none",
              cursor: "pointer",
              marginLeft: 2,
              marginRight: 2,
              "&:hover": {
                backgroundColor: "#2A5FA5",
              },
              [theme.breakpoints.down("xs")]: {
                fontSize: "0.9rem",
                width: "240px",
                marginTop: 2,
              },
            })}
            onClick={handleQueue}
          >
            Add To Queue
          </Button>
        )}

      {stocksAllotment.container_list.length > 0 &&
        stocksAndAllotment.selectedContainersListType &&
        stocksAndAllotment.selectedContainersListType.length > 0 &&
        stocksAndAllotment.selectedContainersListType[0].type ===
          "BOOKING_NO" && (
          <Button
            sx={(theme) => ({
              width: "200px",
              borderRadius: 2,
              backgroundColor: "#2A5FA5",
              color: "#fff",
              border: "none",
              cursor: "pointer",
              marginLeft: 2,
              marginRight: 2,
              "&:hover": {
                backgroundColor: "#2A5FA5",
              },
              [theme.breakpoints.down("xs")]: {
                fontSize: "0.9rem",
                width: "240px",
                marginTop: 2,
              },
            })}
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
    </FooterRoot>
  );
};

export default MnrFooter;
