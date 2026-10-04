import React, { useEffect, useState, useCallback } from "react";
import LayoutContainer from "@components/reusablecomponents/LayoutContainer";
import { useDispatch, useSelector } from "react-redux";
import {
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Grid,
  MenuItem,
  FormControlLabel,
  Radio,
  Chip,
  alpha,
  useMediaQuery,
  Typography,
} from "@mui/material";
import { useSnackbar } from "notistack";
import { truckTurnAroundListingAction } from "../../actions/TruckTurnAroundAction";
import { TRUCK_TRACKING_CONST } from "../../reducers/TruckTurnAroundReducer";
import { Link } from "react-router-dom";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import { useHistory } from "react-router-dom";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import { Stack } from "@mui/material";
import { theme } from "../../App";
import EditNoteOutlinedIcon from "@mui/icons-material/EditNoteOutlined";
import { custombackDropStyle } from "../../utils/CustomClasses";
import {
  TableCellText,
  TableCustomAdvanceReactTable,
  TableCustomPaginationReactTable,
  TableCustomSearchBar,
  TableFilterComponent,
  TableFootercontainer,
  TableHeading,
  TablePageTitle,
  TableRefreshIcon,
} from "@/components/TableComponent/TableComponent";

const TruckTurnArroundPage = () => {
  const notify = useSnackbar().enqueueSnackbar;
  const dispatch = useDispatch();
  const matchesIphone = useMediaQuery("(max-width:400px)");

  const [process, setProcess] = useState("transporter");
  const history = useHistory();

  const { ui } = useSelector((state) => state);
  const { truckListing } = useSelector((store) => store.TruckTurnAroundReducer);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
     dispatch({
      type: TRUCK_TRACKING_CONST.TRUCK_TRACKING_LISTING,
      payload: {
        container_no:  "",
        transporter:  "",
        line:  "",
      },
    });
    dispatch(truckTurnAroundListingAction(notify));
  }, []);

  const Columns = [
    {
      Header: <TableHeading filter>Container Number</TableHeading>,
      accessor: "container_no",
      minWidth: 140,
      style: {
        textAlign: "center",
        cursor: "pointer",
      },

      Cell: (row) => {
        return (
          <Chip
            label={row.original.container_no}
            variant="filled"
            size="medium"
            color="info"
            sx={(theme) => ({
              bgcolor: alpha(theme.palette.info.light, 0.1),
              color: theme.palette.text.primary,
            })}
          />
        );
      },
    },
    {
      Header: <TableHeading filter>Vehicle No</TableHeading>,
      accessor: "vehicle_no",
      style: {
        textAlign: "center",
        cursor: "pointer",
      },
      Cell: (row) => {
        return (
          <TableCellText title={row.original.vehicle_no}>
            {row.original.vehicle_no}
          </TableCellText>
        );
      },
    },
    {
      Header: <TableHeading filter>Transporter</TableHeading>,
      accessor: "transporter",
      style: {
        textAlign: "center",
        cursor: "pointer",
      },
      Cell: (row) => {
        return (
          <TableCellText title={row.original.transporter}>
            {row.original.transporter}
          </TableCellText>
        );
      },
    },
    {
      Header: <TableHeading filter>Booking No</TableHeading>,
      accessor: "booking_no",
      style: {
        textAlign: "center",
        cursor: "pointer",
      },
      show: truckListing.type === "Empty",
      Cell: (row) => {
        return (
          <TableCellText title={row.original.booking_no}>
            {row.original.booking_no}
          </TableCellText>
        );
      },
    },
    {
      Header: <TableHeading filter>Line</TableHeading>,
      show: truckListing.type === "Loaded",
      accessor: "line",
      style: {
        textAlign: "center",
        cursor: "pointer",
      },
      Cell: (row) => {
        return (
          <TableCellText title={row.original.line}>
            {row.original.line}
          </TableCellText>
        );
      },
    },
    {
      Header: <TableHeading filter>Status</TableHeading>,
      accessor: "status",
      style: {
        textAlign: "center",
        cursor: "pointer",
      },
      Cell: (row) => {
        return (
          <TableCellText
            title={row.original.status}
            style={{
              color:
                row.original.status === "IN QUEUE"
                  ? theme.palette.info.dark
                  : theme.palette.success.main,
            }}
          >
            {row.original.status}
          </TableCellText>
        );
      },
    },
    {
      Header: <TableHeading filter>Move Mode</TableHeading>,
      accessor: "move_mode",
      style: {
        textAlign: "center",
        cursor: "pointer",
      },
      Cell: (row) => {
        return (
          <TableCellText title={row.original.move_mode}>
            {row.original.move_mode}
          </TableCellText>
        );
      },
    },
    {
      Header: <TableHeading filter>Truck In Time</TableHeading>,
      accessor: "gate_in_time",
      minWidth: 200,
      style: {
        textAlign: "center",
        cursor: "pointer",
      },
      Cell: (row) => {
        return (
          <TableCellText
            title={row.original.gate_in_time}
            style={{ color: theme.palette.error.main }}
          >
            {row.original.gate_in_time}
          </TableCellText>
        );
      },
    },
    {
      Header: <TableHeading filter>Truck Out Time</TableHeading>,
      accessor: "gate_out_time",
      minWidth: 200,
      style: {
        textAlign: "center",
        cursor: "pointer",
      },
      Cell: (row) => {
        return (
          <TableCellText
            title={row.original.gate_out_time}
            style={{ color: theme.palette.success.main }}
          >
            {row.original.gate_out_time}
          </TableCellText>
        );
      },
    },
    {
      Header: <TableHeading filter>Time Since</TableHeading>,
      accessor: "time_since",
      style: {
        textAlign: "center",
        cursor: "pointer",
      },
      Cell: (row) => {
        return (
          <TableCellText
            title={row.original.time_since}
            style={{ color: theme.palette.info.main }}
          >
            {row.original.time_since}
          </TableCellText>
        );
      },
    },
    {
      Header: <TableHeading>Action</TableHeading>,
      show: truckListing.type === "Loaded",
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

  const handleInitialPage = () => {
    dispatch({
      type: TRUCK_TRACKING_CONST.TRUCK_TRACKING_LISTING,
      payload: { page_no: 1 },
    });
    dispatch(truckTurnAroundListingAction(notify));
  };

  const handleOnPageDataChange = (value) => {
    dispatch({
      type: TRUCK_TRACKING_CONST.TRUCK_TRACKING_LISTING,
      payload: { page_no: 1, on_page_data_client: value },
    });
    dispatch(truckTurnAroundListingAction(notify));
  };

  const handlePaginationOnChange = (e, val) => {
    dispatch({
      type: TRUCK_TRACKING_CONST.TRUCK_TRACKING_LISTING,
      payload: { page_no: val },
    });
    dispatch(truckTurnAroundListingAction(notify));
  };
  const handleRefresh = () => {
    dispatch({ type: TRUCK_TRACKING_CONST.TRUCK_TRACKING_LISTING_INIT });
    dispatch(truckTurnAroundListingAction(notify));
  };

  return (
    <LayoutContainer>
      <Box padding={matchesIphone ? 1 : 2}>
        <Stack
          direction={"row"}
          alignItems={"center"}
          justifyContent={"flex-start"}
          spacing={2}
        >
          <LocalShippingOutlinedIcon style={{ fill: "#495057" }} />
          <TablePageTitle>Truck Tracking</TablePageTitle>
        </Stack>

        <Grid container spacing={2} mt={6}>
          <Grid
            item
            size={{ xs: 10, sm: 6, md: 6, lg: 6, xl: 6 }}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
              gap: 2,
            }}
          >
            <TableCustomSearchBar
              selectName={process.split("_").join(" ")}
              updateSelectname={handleSetProcess}
              searchText={searchText}
              setSearchText={handleSearchChange}
              closeClick={handleCloseClick}
              searchClick={handleSearchButton}
              maxWidthSearch={"70%"}
            >
              {truckListing.type === "Loaded" && (
                <MenuItem key={"container_no"} value="container_no">
                  &nbsp; &nbsp;&nbsp;Container No
                </MenuItem>
              )}
              <MenuItem key={"transporter"} value="transporter">
                &nbsp; &nbsp;&nbsp;Transporter
              </MenuItem>

              {truckListing.type === "Loaded" && (
                <MenuItem key={"line"} value="line">
                  &nbsp; &nbsp;&nbsp;Line
                </MenuItem>
              )}
            </TableCustomSearchBar>
            <TableFilterComponent
              activeFilter={true}
              style={{ width: "fit-content" }}
              title={` ${truckListing.type} Truck`}
            >
              <Grid item size={{ xs: 12 }}>
                <Typography variant="subtitle2">Filter </Typography>
              </Grid>
              <Grid item size={{ xs: 12 }}>
                <FormControlLabel
                  value="yes"
                  control={
                    <Radio
                      size="small"
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
              </Grid>
              <Grid item size={{ xs: 12 }}>
                <FormControlLabel
                  value="no"
                  control={
                    <Radio
                      size="small"
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
            </TableFilterComponent>
          </Grid>
          <Grid
            item
            size={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 6 }}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: 1,
            }}
          >
            <TableRefreshIcon onClick={handleRefresh} />
          </Grid>
          <Grid item size={{ xs: 12 }}>
            <TableCustomAdvanceReactTable
              data={truckListing.data || []}
              columns={[...Columns]}
              minRows={Number(truckListing.on_page_data_client)}
              pageSize={Number(truckListing.on_page_data_client)}
              defaultPageSize={Number(truckListing.on_page_data_client)}
            />
            <TableCustomPaginationReactTable
              total_pages={truckListing.total_pages}
              pg_no={truckListing.page_no}
              handlePaginationOnChange={handlePaginationOnChange}
              next_page={truckListing.next_page}
              on_page_data={truckListing.on_page_data}
              handleInitialPage={handleInitialPage}
              handleOnPageDataChange={handleOnPageDataChange}
            />
          </Grid>
        </Grid>
          <Box mt={12}></Box>
        <TableFootercontainer>
          <Link
            to="/depot/truck-turn-around/add"
            style={{ marginRight: "8px" }}
          >
            <Button
              startIcon={<AddCircleOutlineOutlinedIcon fontSize="small" />}
              variant="contained"
              color="primary"
              sx={{ borderRadius: 12 }}
            >
              Add Truck
            </Button>
          </Link>
        </TableFootercontainer>
      </Box>
      <Backdrop sx={custombackDropStyle} open={ui.isloading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </LayoutContainer>
  );
};

export default TruckTurnArroundPage;
