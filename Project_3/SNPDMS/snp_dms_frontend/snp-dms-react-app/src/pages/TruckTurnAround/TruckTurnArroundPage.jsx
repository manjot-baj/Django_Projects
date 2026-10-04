import React, { useEffect, useState, useCallback } from "react";
import LayoutContainer from "../../components/reusableComponents/LayoutContainer";
import CustomHeading from "../../components/CustomHeading";
import CustomReactTable from "../../components/CustomReactTable";
import { useDispatch, useSelector } from "react-redux";
import {
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Grid,
  IconButton,
  makeStyles,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormControlLabel,
  Radio,
  Chip,
} from "@material-ui/core";
import { useSnackbar } from "notistack";
import { truckTurnAroundListingAction } from "../../actions/TruckTurnAroundAction";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSort } from "@fortawesome/free-solid-svg-icons";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import { TRUCK_TRACKING_CONST } from "../../reducers/TruckTurnAroundReducer";
import AutomationSearch from "../../components/reusableComponents/AutomationSearch";
import { Link } from "react-router-dom";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import { useHistory } from "react-router-dom";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import { Stack } from "@mui/material";
import { theme } from "../../App";
import EditNoteOutlinedIcon from "@mui/icons-material/EditNoteOutlined";

const useStyles = makeStyles((theme) => ({
  searchPaper: {
    borderRadius: 0,
    backgroundColor: "transparent",
    color: theme.palette.text.primary,
    position: "relative",
    width: "calc(100% - 50%)",
    margin: "auto",
    marginLeft: "0px",
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
  searchPaperProcurement: {
    borderRadius: 0,
    backgroundColor: "transparent",
    color: theme.palette.text.primary,
    position: "relative",
    width: "100%",
    margin: "auto",
    marginLeft: "0px",
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: "#fff",
  },
  input: {
    marginLeft: theme.spacing(1),
    flex: 1,
    padding: 7,
    [theme.breakpoints.down("xs")]: {
      padding: 1,
      fontSize: "0.8rem",
    },
  },
  inputProcess: {
    marginLeft: theme.spacing(1),
    flex: 1,
    "&.MuiInput-underline:before": {
      borderBottom: "none",
    },
    "&.MuiInput-underline:after": {
      borderBottom: "none",
    },
    padding: "0 10px",
    [theme.breakpoints.down("xs")]: {
      padding: 1,
      fontSize: "0.8rem",
    },
  },
  searchButton: {
    backgroundColor: "#FDBD2E",
    color: "#fff",
    borderRadius: "0.5rem",
    padding: "1px 4px",
    height: 40,
    width: "200px",
    "&:hover": {
      backgroundColor: "#FDBD2E",
      color: "#fff",
    },
    [theme.breakpoints.down("xs")]: {
      // padding: "1px 4px",
      paddingRight: 3,
      height: 35,
    },
  },
}));

const TruckTurnArroundPage = () => {
  const notify = useSnackbar().enqueueSnackbar;
  const dispatch = useDispatch();
  const classes = useStyles();

  const [process, setProcess] = useState("transporter");
  const history = useHistory();

  const { ui } = useSelector((state) => state);
  const { truckListing } = useSelector((store) => store.TruckTurnAroundReducer);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    dispatch(truckTurnAroundListingAction(notify));
  }, []);

  const Columns = [
    {
      Header: (
        <b style={{ color: "#2A5FA5" }}>
          Container No
          <FontAwesomeIcon icon={faSort} />
        </b>
      ),
      accessor: "container_no",
      style: {
        textAlign: "center",
        cursor: "pointer",
      },
     
      Cell: (row) => {
        return (
          <div>
            <span title={row.original}>{row.original.container_no}</span>
          </div>
        );
      },
    },
    {
      Header: (
        <b style={{ color: "#2A5FA5" }}>
          Vehicle No
          <FontAwesomeIcon icon={faSort} />
        </b>
      ),
      accessor: "vehicle_no",
      style: {
        textAlign: "center",
        cursor: "pointer",
      },
      Cell: (row) => {
        return (
          <div>
            <span title={row.original}>{row.original.vehicle_no}</span>
          </div>
        );
      },
    },
    {
      Header: (
        <b style={{ color: "#2A5FA5" }}>
          Transporter <FontAwesomeIcon icon={faSort} />
        </b>
      ),
      accessor: "transporter",
      style: {
        textAlign: "center",
        cursor: "pointer",
      },
      Cell: (row) => {
        return (
          <div>
            <span title={row.original.transporter}>
              {row.original.transporter}
            </span>
          </div>
        );
      },
    },
    {
      Header: (
        <b style={{ color: "#2A5FA5" }}>
          Booking No <FontAwesomeIcon icon={faSort} />
        </b>
      ),
      accessor: "booking_no",
      style: {
        textAlign: "center",
        cursor: "pointer",
      },
      show:truckListing.type === "Empty",
      Cell: (row) => {
        return (
          <div>
            <span title={row.original.booking_no}>
              {row.original.booking_no}
            </span>
          </div>
        );
      },
    },
    {
      Header: (
        <b style={{ color: "#2A5FA5" }}>
          Line <FontAwesomeIcon icon={faSort} />
        </b>
      ),
      show: truckListing.type === "Loaded",
      accessor: "line",
      style: {
        textAlign: "center",
        cursor: "pointer",
      },
      Cell: (row) => {
        return (
          <div>
            <span title={row.original.line}>{row.original.line}</span>
          </div>
        );
      },
    },
    {
      Header: (
        <b style={{ color: "#2A5FA5" }}>
          Status <FontAwesomeIcon icon={faSort} />
        </b>
      ),
      accessor: "status",
      style: {
        textAlign: "center",
        cursor: "pointer",
      },
      Cell: (row) => {
        return (
          <div>
            <span
              title={row.original.status}
              style={{
                color:
                  row.original.status === "IN QUEUE"
                    ? theme.palette.info.dark
                    : theme.palette.success.main,
              }}
            >
              {row.original.status}
            </span>
          </div>
        );
      },
    },
    {
      Header: (
        <b style={{ color: "#2A5FA5" }}>
          Move Mode <FontAwesomeIcon icon={faSort} />
        </b>
      ),
      accessor: "move_mode",
      style: {
        textAlign: "center",
        cursor: "pointer",
      },
      Cell: (row) => {
        return (
          <div>
            <span title={row.original.move_mode}>{row.original.move_mode}</span>
          </div>
        );
      },
    },
    {
      Header: (
        <b style={{ color: "#2A5FA5" }}>
          Truck In Time <FontAwesomeIcon icon={faSort} />
        </b>
      ),
      accessor: "gate_in_time",
      style: {
        textAlign: "center",
        cursor: "pointer",
      },
      Cell: (row) => {
        return (
          <div>
            <span title={row.original.gate_in_time} style={{color:theme.palette.error.main}}>{row.original.gate_in_time}</span>
          </div>
        );
      },
    },
    {
      Header: (
        <b style={{ color: "#2A5FA5" }}>
          Truck Out Time <FontAwesomeIcon icon={faSort} />
        </b>
      ),
      accessor: "gate_out_time",
      style: {
        textAlign: "center",
        cursor: "pointer",
      },
      Cell: (row) => {
        return (
          <div>
            <span title={row.original.gate_out_time} style={{color:theme.palette.success.main}}>{row.original.gate_out_time}</span>
          </div>
        );
      },
    },
    {
      Header: (
        <b style={{ color: "#2A5FA5" }}>
           Time Since<FontAwesomeIcon icon={faSort} />
        </b>
      ),
      accessor: "time_since",
      style: {
        textAlign: "center",
        cursor: "pointer",
      },
      Cell: (row) => {
        return (
          <div>
            <span title={row.original.time_since} style={{color:theme.palette.info.main}}>{row.original.time_since}</span>
          </div>
        );
      },
    },
    {
      Header: (
        <b style={{ color: "#2A5FA5" }}>
          Action <FontAwesomeIcon icon={faSort} />
        </b>
      ),
      show:  truckListing.type === "Loaded",
      style: {
        textAlign: "center",
        cursor: "pointer",
      },
      Cell: (row) => {
        return (
          row.original.status === "IN QUEUE" &&
          row.original?.move_mode === "IMPORT" && (
            <Button
              color="primary"
              variant="text"
              onClick={() =>
                history.push(`/depot/truck-turn-around/${row.original.pk}/`)
              }
              startIcon={<EditNoteOutlinedIcon />}
            >
              edit
            </Button>
          )
        );
      },
    },
  ];

  const handleSearchChange = useCallback(
    (e) => {
      setSearchText(e.target.value);
    },
    [searchText]
  );

  const handleSearchButton = useCallback(() => {
    dispatch({ type: TRUCK_TRACKING_CONST.TRUCK_TRACKING_LISTING_INIT });
    dispatch({
      type: TRUCK_TRACKING_CONST.TRUCK_TRACKING_LISTING,
      payload: {
        container_no: process === "container_no" ? searchText : "",
        transporter: process === "transporter" ? searchText : "",
        line: process === "line" ? searchText : "",
      },
    });
    dispatch(truckTurnAroundListingAction(notify));
  }, [searchText, notify, process]);

  const handleCloseClick = useCallback(() => setSearchText(""), [searchText]);

  const handleSetProcess = useCallback(
    (e) => setProcess(e.target.value),
    [process]
  );

  const prevTruckTrackingPage = () => {
    dispatch({
      type: TRUCK_TRACKING_CONST.TRUCK_TRACKING_LISTING,
      payload: { page_no: Number(truckListing.page_no) - 1 },
    });
    dispatch(truckTurnAroundListingAction(notify));
  };

  const handleEnblockChange = () => {
    dispatch({
      type: TRUCK_TRACKING_CONST.TRUCK_TRACKING_LISTING,
      payload: { page_no: Number(truckListing.page_no) + 1 },
    });
    dispatch(truckTurnAroundListingAction(notify));
  };

  const handleInitialPage = () => {
    dispatch({
      type: TRUCK_TRACKING_CONST.TRUCK_TRACKING_LISTING,
      payload: { page_no: 1 },
    });
    dispatch(truckTurnAroundListingAction(notify));
  };

  const handleFetchData = () => {
    dispatch(truckTurnAroundListingAction(notify));
  };
  const handleEnBlockOnPageDataClientChange = (value) => {
    dispatch({
      type: TRUCK_TRACKING_CONST.TRUCK_TRACKING_LISTING,
      payload: { on_page_data_client: value, page_no: 1 },
    });
    dispatch(truckTurnAroundListingAction(notify));
  };

  const handleNextTruckTrackingPage = () => {
    dispatch({
      type: TRUCK_TRACKING_CONST.TRUCK_TRACKING_LISTING,
      payload: { page_no: Number(truckListing.page_no) + 1 },
    });
    dispatch(truckTurnAroundListingAction(notify));
  };

  const handleRefresh = () => {
    dispatch({ type: TRUCK_TRACKING_CONST.TRUCK_TRACKING_LISTING_INIT });
    dispatch(truckTurnAroundListingAction(notify));
  };

  return (
    <LayoutContainer>
      <Box padding={3}>
        <Stack
          direction={"row"}
          alignItems={"center"}
          justifyContent={"flex-start"}
          spacing={2}
        >
          <LocalShippingOutlinedIcon style={{ fill: "#495057" }} />
          <CustomHeading variant="body1" component="h1" customClass="pageTitle">
            Truck Tracking
          </CustomHeading>
        </Stack>

        <Box mt={8}></Box>
        <Grid container spacing={2}>
          <Grid
            item
            md={6}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
            }}
          >
            <AutomationSearch
              searchText={searchText}
              handleSearchChange={handleSearchChange}
              handleSearchButton={handleSearchButton}
              handleCloseClick={handleCloseClick}
              // handleSetProcess={handleSetProcess}
              procurement={true}
              process={process.split("_").join(" ")}
            >
              <FormControl
                variant="standard"
                style={{ marginTop: "-15px", marginLeft: "10px" }}
              >
                <InputLabel
                  id="container_list_select_label"
                  style={{
                    color: "grey",
                    zIndex: 10,
                    fontSize: "15px",
                    textAlign: "center",
                    padding: "0 10px",
                    marginTop: "-10px",
                    display: "none",
                  }}
                >
                  Process
                </InputLabel>
                <Select
                  id="container_list_select"
                  value={process}
                  labelId="container_list_select_label"
                  name="client"
                  defaultValue={process}
                  label="Process"
                  variant="standard"
                  onChange={handleSetProcess}
                  className={classes.inputProcess}
                  inputProps={{
                    style: {
                      padding: "0px 10px",
                      marginTop: "-10px",
                      outline: "none",
                    },
                  }}
                  style={{
                    width: "100px",
                    backgroundColor: "transparent",
                    border: "0.5px solid rgba(0,0,0,0.2)",

                    borderRadius: "32px",
                    outline: "none",
                  }}
                >
                  {truckListing.type === "Loaded" && (
                    <MenuItem key={"container_no"} value="container_no">
                      Container No
                    </MenuItem>
                  )}
                  <MenuItem key={"transporter"} value="transporter">
                    Transporter
                  </MenuItem>

                  {truckListing.type === "Loaded" && (
                    <MenuItem key={"line"} value="line">
                      Line
                    </MenuItem>
                  )}
                </Select>
              </FormControl>
            </AutomationSearch>
          </Grid>
          <Grid
            item
            md={4}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
            }}
          >
            <FormControlLabel
              value="yes"
              control={
                <Radio
                  style={{ color: "#2A5FA5" }}
                  checked={truckListing.type === "Loaded"}
                  onClick={() => {
                    dispatch({
                      type: TRUCK_TRACKING_CONST.TRUCK_TRACKING_LISTING,
                      payload: { type: "Loaded" },
                    });
                    dispatch(truckTurnAroundListingAction(notify));
                  }}
                />
              }
              label="Loaded Truck"
            />
            <FormControlLabel
              value="no"
              control={
                <Radio
                  style={{ color: "#2A5FA5" }}
                  checked={truckListing.type === "Empty"}
                  onClick={() => {
                    dispatch({
                      type: TRUCK_TRACKING_CONST.TRUCK_TRACKING_LISTING,
                      payload: { type: "Empty" },
                    });

                    dispatch(truckTurnAroundListingAction(notify));
                  }}
                />
              }
              label="Empty Truck"
            />
          </Grid>
          <Grid item md={2} style={{ textAlign: "end", alignItems: "center" }}>
            <Link
              to="/depot/truck-turn-around/add"
              style={{ marginRight: "8px" }}
            >
              <Button
                startIcon={<AddCircleOutlineOutlinedIcon fontSize="small" />}
                variant="text"
                color="primary"
              >
                Add Truck
              </Button>
            </Link>

            <IconButton onClick={handleRefresh}>
              <RefreshOutlinedIcon
                style={{ fill: "#3265a8" }}
                fontSize="small"
              />
            </IconButton>
          </Grid>
        </Grid>
        <Box mt={4}></Box>

        <CustomReactTable
          data={truckListing.data || []}
          columns={[...Columns]}
          minRows={truckListing.on_page_data_client}
          enableFooter
          prevReactPage={prevTruckTrackingPage}
          React_pg_no={truckListing.page_no}
          notify={notify}
          React_total_pages={truckListing.total_pages}
          handleReact_change_page={handleEnblockChange}
          handleReact_initial_page={handleInitialPage}
          fetchReact_page={handleFetchData}
          on_page_data_client={truckListing.on_page_data_client}
          handleReact_change_page_data_client={
            handleEnBlockOnPageDataClientChange
          }
          nextReactPage={handleNextTruckTrackingPage}
          next_React_page={truckListing.next_page}
        />
      </Box>
      <Backdrop className={classes.backdrop} open={ui.isloading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </LayoutContainer>
  );
};

export default TruckTurnArroundPage;
