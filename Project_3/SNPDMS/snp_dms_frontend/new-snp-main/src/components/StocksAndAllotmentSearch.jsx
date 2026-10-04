import React, { useState } from "react";
import {
  Grid,
  MenuItem,
  Modal,
  Box,
  useMediaQuery,
  Chip,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { searchStocksDispatch } from "../actions/StocksAndAllotmentActions";
import ContainerListModal from "./ContainerListModal";
import Tooltip from "@mui/material/Tooltip";
import StocksAndAllotmentSearchModal from "./StockAndAllotmentSearchModal";
import {
  TableAdvanceSearchWithModal,
  TableCustomSearchBar,
  TableRefreshIcon,
} from "./TableComponent/TableComponent";
const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "60%",
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

const StocksAndAllotmentSearch = () => {
  const dispatch = useDispatch();
  const store = useSelector((state) => state);
  const { stocksAndAllotmentSearch } = store;
  const [name, setName] = useState("Container Number");
  const [filterType, setFilterType] = useState("");
  const [open, setOpen] = React.useState(false);
  const [searchData, setSearchData] = useState("");
  const [openSearch, setOpenSearch] = React.useState(false);
  const handleOpenSearch = () => setOpenSearch(true);
  const handleCloseSearch = () => setOpenSearch(!openSearch);
  const matchesIphone = useMediaQuery("(max-width:500px)");
  const matchesIpad = useMediaQuery("(max-width:1050px)");

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(!open);

  const updateName = (event) => {
    setFilterType("");
    setName(event.target.value);
  };

  const getData = () => {
    dispatch(searchStocksDispatch(stocksAndAllotmentSearch));
  };

  const setDispatchType = (e) => {
    setFilterType(e.target.value);
    if (name === "Container Number") {
      dispatch({
        type: "SET_STOCK_ALLOT_SEARCH_CONTAINER_NUMBER",
        payload: e.target.value,
      });
      var removeSpace = e.target.value.replace(/ /g, "");
      var array = removeSpace.split(",");

      setSearchData(array);
    } else if (name === "Booking Number") {
      dispatch({
        type: "SET_STOCK_ALLOT_SEARCH_BOOKING_NUMBER",
        payload: e.target.value,
      });
    } else if (name === "Client") {
      dispatch({
        type: "SET_STOCK_ALLOT_SEARCH_CLIENT_NAME",
        payload: e.target.value,
      });
    } else {
      dispatch({
        type: "SET_STOCK_ALLOT_SEARCH_STATUS",
        payload: e.target.value,
      });
    }
  };

  const handleCloseClick = () => {
    setFilterType("");
  };

  const handleDeleteClientNameChip = () => {
    dispatch({
      type: "SET_STOCK_ALLOT_SEARCH_CLIENT_NAME",
      payload: "",
    });
    dispatch(searchStocksDispatch());
  };

  const handleDeleteBookingChip = () => {
    dispatch({
      type: "SET_STOCK_ALLOT_SEARCH_BOOKING_NUMBER",
      payload: "",
    });
    dispatch(searchStocksDispatch());
  };

  const handleDeleteStatusChip = () => {
    dispatch({
      type: "SET_STOCK_ALLOT_SEARCH_STATUS",
      payload: "",
    });
    dispatch(searchStocksDispatch());
  };

  const handleDeleteRefCodeChip = () => {
    dispatch({
      type: "SET_STOCK_ALLOT_SEARCH_REF_CODE",
      payload: "",
    });
    dispatch(searchStocksDispatch());
  };

  return (
    <div>
      <Grid
        sx={(theme) => ({
          display: "flex",
          width: "100%",
          justifyContent: "flex-start",
          alignItems: "center",
          gap: 2,
          [theme.breakpoints.down("sm")]: {
            flexDirection: "row",
          },
        })}
      >
        <Grid
       
        >
          <TableCustomSearchBar
            selectName={name}
            updateSelectname={updateName}
            searchText={filterType}
            setSearchText={setDispatchType}
            closeClick={handleCloseClick}
            searchClick={getData}
            infoIcon
            handleOpenInfo={handleOpen}
             multipleContainer={true}
          >
            <MenuItem value={"Container Number"}>
              &nbsp; &nbsp;&nbsp; Container Number
            </MenuItem>
            <MenuItem value={"Booking Number"}>
              &nbsp; &nbsp;&nbsp; Booking Number
            </MenuItem>
            <MenuItem value={"Client"}>&nbsp; &nbsp;&nbsp; Client</MenuItem>
            <MenuItem value={"Status"}>&nbsp; &nbsp;&nbsp; Status</MenuItem>
          </TableCustomSearchBar>
        </Grid>
        <Box sx={(theme)=>({ width: 220 ,[theme.breakpoints.down('sm')]:{
          width:22
        }})}>
          <Tooltip title="Click to find more search results" arrow>
            <TableAdvanceSearchWithModal
              open={openSearch}
              handleClose={handleCloseSearch}
              handleOpen={handleOpenSearch}
              style={{ width: "fit-content" }}
            >
              <Box
                sx={(theme) => ({
                  background: "#FFF",
                  width: "100%",

                  margin: "auto",

                  padding: 1,
                  pointerEvents: "painted",
                })}
              >
                <StocksAndAllotmentSearchModal
                  handleClose={handleCloseSearch}
                />
              </Box>
            </TableAdvanceSearchWithModal>
          </Tooltip>
        </Box>
      </Grid>
      <Grid container spacing={2} style={{ margin: "20px 0 4px 0" }}>
        <Grid
          item
          size={{ xs: 12 }}
          style={{
            justifyContent: "flex-end",
            display: "flex",
            alignItems: "center",
            paddingRight: "20px",
            gap: 4,
          }}
        >
          {stocksAndAllotmentSearch?.ref_code !== "" && (
            <Chip
              variant="outlined"
              color="primary"
              size="small"
              label={`Ref Code - ${stocksAndAllotmentSearch?.ref_code}`}
              onDelete={handleDeleteRefCodeChip}
            />
          )}
          {stocksAndAllotmentSearch?.status !== "" && (
            <Chip
              variant="outlined"
              color="primary"
              size="small"
              label={`Status - ${stocksAndAllotmentSearch?.status}`}
              onDelete={handleDeleteStatusChip}
            />
          )}
          {stocksAndAllotmentSearch?.booking_no !== "" && (
            <Chip
              variant="outlined"
              color="primary"
              size="small"
              label={`Booking - ${stocksAndAllotmentSearch?.booking_no}`}
              onDelete={handleDeleteBookingChip}
            />
          )}
          {stocksAndAllotmentSearch?.client !== "" && (
            <Chip
              variant="outlined"
              color="primary"
              size="small"
              label={`Client - ${stocksAndAllotmentSearch?.client}`}
              onDelete={handleDeleteClientNameChip}
            />
          )}
          <Chip
            onClick={() => {
              dispatch({
                type: "TOGGLE_QUEUED_RECENTLY",
                payload: !stocksAndAllotmentSearch.queued_recently,
              });
              dispatch({
                type: "SET_CHECK_ROW",
                payload: [],
              });
            }}
            label="Queued Recenty"
            variant="filled"
            color={
              stocksAndAllotmentSearch.queued_recently ? "primary" : "default"
            }
            sx={{ cursor: "pointer" }}
            size="small"
          />
          <Chip
            onClick={() => {
              const newValue =
                stocksAndAllotmentSearch.do_not_lift_queue === "True"
                  ? "False"
                  : "True";
              dispatch({
                type: "TOGGLE_DO_NOT_LIFT_VALUE",
                payload: newValue,
              });
              dispatch({
                type: "SET_CHECK_ROW",
                payload: [],
              });
            }}
            label="Do Not Lift"
            variant="filled"
            color={
              stocksAndAllotmentSearch.do_not_lift_queue === "True"
                ? "primary"
                : "default"
            }
            sx={{ cursor: "pointer" }}
            size="small"
          />
          <Chip
            onClick={() => {
              const newValue =
                stocksAndAllotmentSearch.out_history === "True"
                  ? "False"
                  : "True";
              dispatch({
                type: "TOGGLE_SELF_STOCKS_SEARCH_VALUE",
                payload: newValue,
              });
              dispatch({
                type: "SET_CHECK_ROW",
                payload: [],
              });
            }}
            label="History"
            variant="filled"
            color={
              stocksAndAllotmentSearch.out_history === "True"
                ? "primary"
                : "default"
            }
            sx={{ cursor: "pointer" }}
            size="small"
          />
          <Tooltip title="Refresh the page" arrow>
            <TableRefreshIcon onClick={() => window.location.reload()} />
          </Tooltip>
        </Grid>
      </Grid>

      <Modal open={open} onClose={handleClose}>
        <Box sx={style}>
          <ContainerListModal
            handleClose={handleClose}
            searchData={searchData}
          />
        </Box>
      </Modal>
    </div>
  );
};

export default StocksAndAllotmentSearch;
