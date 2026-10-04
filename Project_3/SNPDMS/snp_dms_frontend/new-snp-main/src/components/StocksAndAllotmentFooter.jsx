import React, { useState } from "react";
import {
  Paper,
  Button,
  useMediaQuery,
  styled,
  Modal,
  Box,
  Alert,
  Grid,
  Chip,
  Badge,
} from "@mui/material";
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
import ImportExportIcon from "@mui/icons-material/ImportExport";
import { getStockStatementExcel } from "../actions/StocksAndAllotmentActions";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import QueueIcon from "@mui/icons-material/Queue";
import EditIcon from "@mui/icons-material/Edit";
import { Stack } from "@mui/material";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import DownloadForOfflineOutlinedIcon from "@mui/icons-material/DownloadForOfflineOutlined";
import PlaylistRemoveIcon from "@mui/icons-material/PlaylistRemove";
import { CloseOutlined } from "@mui/icons-material";

const FooterRoot = styled(Paper)(({ theme, open }) => ({
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
  marginLeft: 10,
  paddingLeft: open ? 180 : 2,
  ...(open && {
    width: "100%",
    marginLeft: 10,
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
  [theme.breakpoints.down("sm")]: {
    marginLeft: 1,
    flexDirection: "column",
    width: "100%",
  },
}));

const StocksAndAllotmentFooter = (props) => {
  const { open } = props;
  const store = useSelector((state) => state);
  const { stocksAndAllotment, stocksAndAllotmentSearch, user } = store;
  const dispatch = useDispatch();
  const history = useHistory();
  const matchesIphone = useMediaQuery("(max-width:500px)");
  const notify = useSnackbar().enqueueSnackbar;
  const [openModal, setOpenModal] = useState(false);
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
    history.push("/depot/stocks-upload");
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
    <FooterRoot open={open}>
      <Tooltip title="Click to upload a stock" arrow>
        {user.location === "Ludhiana" && user.site === "PGL Depot" ? null : (
          <Button
            variant="contained"
            color="success"
            size="small"
            sx={(theme) => ({
              marginLeft: 2,
              marginRight: 2,
              borderRadius: 12,
              [theme.breakpoints.down("sm")]: {
                fontSize: "12px",
                marginTop: "8px",
                width: "240px",
              },
            })}
            onClick={openStockUpload}
            startIcon={<CloudUploadOutlinedIcon fontSize="small" />}
          >
            Stock Upload
          </Button>
        )}
      </Tooltip>
      <Tooltip title="Click to download the stock sheet" arrow>
        <Button
          variant="contained"
          color="success"
          size="small"
          sx={(theme) => ({
            marginRight: 2,
            borderRadius: 12,
            [theme.breakpoints.down("sm")]: {
              fontSize: "12px",
              marginTop: "8px",
              width: "240px",
            },
          })}
          onClick={handleImportStock}
          startIcon={<DownloadForOfflineOutlinedIcon fontSize="small" />}
        >
          Download Stock sheet
        </Button>
      </Tooltip>

      <Tooltip title="USA approved containers sheet " arrow>
        <Button
          variant="contained"
          color="secondary"
          size="small"
          sx={(theme) => ({
            marginRight: 2,
            borderRadius: 12,
            [theme.breakpoints.down("sm")]: {
              fontSize: "12px",
              marginTop: "8px",
              width: "240px",
            },
          })}
          onClick={handleUSAApprovedSheet}
          startIcon={<DownloadForOfflineOutlinedIcon fontSize="small" />}
        >
          USA approved
        </Button>
      </Tooltip>

      {stocksAndAllotment?.checkedRow?.length > 0 &&
        stocksAndAllotmentSearch.out_history === "True" && (
          <Button
            variant="contained"
            color="secondary"
            size="small"
            sx={{ borderRadius: 12 }}
            onClick={handleAddBookingClick}
            startIcon={
              <Badge
                badgeContent={stocksAndAllotment?.checkedRow?.length}
                color="primary"
                sx={{
                  "& .MuiBadge-badge": {
                    right: 20,
                    top: 2,
                    padding: 0,
                  },
                }}
              >
                <EditIcon fontSize="small" />
              </Badge>
            }
          >
            Edit Allotment Quantity
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
              <Stack
                direction={"row"}
                alignItems={"center"}
                justifyContent={"center"}
                spacing={1}
              >
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  sx={{ borderRadius: 12 }}
                  onClick={handleAddBookingClick}
                  startIcon={
                    <Badge
                      badgeContent={stocksAndAllotment?.checkedRow?.length}
                      color="secondary"
                      sx={{
                        "& .MuiBadge-badge": {
                          right: 20,
                          top: 2,
                          padding: 0,
                        },
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </Badge>
                  }
                >
                  Edit Allotment Quantity
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  size="small"
                  sx={{ borderRadius: 12 }}
                  startIcon={
                    <Badge
                      badgeContent={stocksAndAllotment?.checkedRow?.length}
                      color="secondary"
                      sx={{
                        "& .MuiBadge-badge": {
                          right: 20,
                          top: 2,
                          padding: 0,
                        },
                      }}
                    >
                      <CloseOutlined fontSize="small" />
                    </Badge>
                  }
                  onClick={() => {
                    dispatch(
                      removeAllotmentDispatch(
                        stocksAndAllotment?.checkedRow.map((item) => item.pk),
                        notify
                      )
                    );
                  }}
                >
                  Cancel Booking
                </Button>
              </Stack>
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
                  variant="contained"
                  color="primary"
                  size="small"
                  sx={(theme) => ({
                    marginLeft: 1,
                    marginRight: 1,
                    borderRadius: 12,
                    [theme.breakpoints.down("sm")]: {
                      width: 240,
                      marginLeft: 0,
                      mb: 1
                    },
                  })}
                  onClick={handleAddBookingClick}
                  startIcon={<AddCircleOutlineIcon fontSize="small" />}
                >
                  Add Booking Number
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  sx={(theme) => ({
                    marginLeft: 2,
                    marginRight: 2,
                    borderRadius: 12,
                    [theme.breakpoints.down("sm")]: {
                      width: 240,
                      marginLeft: 0,
                    },
                  })}
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
            variant="contained"
            color="error"
            size="small"
            sx={(theme) => ({
              width: 200,
              marginLeft: 1,
              marginRight: 1,
              borderRadius: 12,
              [theme.breakpoints.down("sm")]: {
                width: 240,
                marginLeft: 0,
              },
            })}
            onClick={handleQueue}
            startIcon={
              <Badge
                badgeContent={stocksAndAllotment?.checkedRow?.length}
                color="secondary"
                sx={{
                  "& .MuiBadge-badge": {
                    right: 22,
                    top: 1,
                    padding: 0,
                  },
                }}
              >
                <PlaylistRemoveIcon fontSize="small" />
              </Badge>
            }
          >
            Remove From Queue
          </Button>
        )}
      {stocksAndAllotment?.checkedRow?.length > 0 && (
        <Tooltip title="Click to download ZIM Repair EDI" arrow>
          <Button
            variant="contained"
            color="secondary"
            size="small"
            sx={(theme) => ({
              marginLeft: 2,
              marginRight: 2,
              borderRadius: 12,
              [theme.breakpoints.down("sm")]: {
                fontSize: "12px",
                marginTop: "8px",
                width: "240px",
              },
            })}
            onClick={handleDownloadZIMRepairEDI}
            startIcon={<ImportExportIcon color="success" fontSize="small" />}
          >
            ZIM Repair EDI
          </Button>
        </Tooltip>
      )}
      <Modal open={openModal} onClose={handleModalClose}>
        <Box
          style={getModalStyle()}
          sx={{
            position: "absolute",
            width: "70%",
            backgroundColor: "white",
            boxShadow: 5,
            padding: 2,
            outline: "none",
            borderRadius: 2,
          }}
        >
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
                <Grid item size={{ xs: 4, sm: 3, md: 2, lg: 2 }}>
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
            mt={4}
          >
            <Button variant="text" color="primary" onClick={handleModalClose}>
              {stocksAndAllotment?.checkedRow?.[0]?.booking_no ? "Cancel" : "Cancel Booking"}
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => history.push("/allotment_booking")}
            >
              {stocksAndAllotment?.checkedRow?.[0]?.booking_no ? "Continue Allotment Quantity Change" : "Continue Booking"}
            </Button>
          </Stack>
        </Box>
      </Modal>
    </FooterRoot>
  );
};

export default StocksAndAllotmentFooter;
