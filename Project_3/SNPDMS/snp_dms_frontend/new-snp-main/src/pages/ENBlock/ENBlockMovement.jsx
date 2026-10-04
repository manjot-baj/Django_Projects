import React, { useCallback, useEffect, useState } from "react";
import LayoutContainer from "@components/reusablecomponents/LayoutContainer";
import { useSnackbar } from "notistack";
import { useDispatch, useSelector } from "react-redux";
import {
  addEnBLockDataAction,
  downloadEnBlockReportFileAction,
  getEnBLockDataByPkAction,
  getEnBLockListingAction,
  getEnBLockVesselVoyageNameDataAction,
  updateEnBlockAction,
} from "../../actions/EnBlockMovementAction";
import { ENBLOCK_REDUCER_CONST } from "../../reducers/EnBlockReducer";
import {
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Grid,
  MenuItem,
  Modal,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { theme } from "../../App";
import GateInTextField from "@components/reusablecomponents/GateInTextField";
import { Link } from "react-router-dom";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { Autocomplete } from "@mui/material";
import { dropDownDispatch } from "../../actions/GateInActions";
import {
  custombackDropStyle,
  customLabelTypography,
} from "../../utils/CustomClasses";
import {
  TableCellText,
  TableCustomAdvanceReactTable,
  TableCustomPaginationReactTable,
  TableCustomSearchBar,
  TableFootercontainer,
  TableHeading,
  TablePageTitle,
  TableRefreshIcon,
} from "@/components/TableComponent/TableComponent";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 700,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: "8px",
};

const ENBlockMovement = () => {
  const notify = useSnackbar().enqueueSnackbar;
  const dispatch = useDispatch();
  const matchesIphone = useMediaQuery("(max-width:400px)");

  const [open, setOpen] = React.useState(false);
  const [process, setProcess] = useState("vessel_no");

  const { ui, gateIn, user } = useSelector((state) => state);
  const { enBlockListing, enBlock_data, enBlock_Vessel_Voyage_Name } =
    useSelector((store) => store.EnBlockReducer);
  const [searchText, setSearchText] = useState("");
  const [enBlockEdit, setEnBlockEdit] = useState({
    line: "",
    job_order_no: "",
    vessel_no: "",
    quantity: 0,
    voyage_no: "",
    gate_ins: 0,
    pendency: 0,
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    let reqArray = ["client_ref_codes"];
    dispatch(dropDownDispatch(reqArray, notify));
       dispatch({
      type: ENBLOCK_REDUCER_CONST.EN_BLOCK_REDUCER_LISTING,
      payload: {
        vessel_no:  "",
        voyage_no: "",
        job_order_no:  "",
      },
    });
    dispatch(getEnBLockListingAction(notify));
    dispatch(getEnBLockVesselVoyageNameDataAction(notify));
  }, []);

  useEffect(() => {
    if (enBlock_data.vessel_no !== "") {
      setEnBlockEdit((prev) => ({ ...prev, ...enBlock_data }));
    }
  }, [enBlock_data]);

  const handleOpen = (original) => {
    dispatch(
      getEnBLockDataByPkAction(original.pk, notify, setOpen, setEnBlockEdit)
    );
  };
  const handleClose = () => {
    setIsEditing(false);
    setOpen(false);
    setEnBlockEdit({
      line: "",
      job_order_no: "",
      vessel_no: "",
      quantity: 0,
      voyage_no: "",
      gate_ins: 0,
      pendency: 0,
    });
    dispatch({ type: ENBLOCK_REDUCER_CONST.EN_BLOCK_EDIT_INIT });
  };

  const handleAddEnBlock = () => {
    setOpen(true);
    setIsEditing(true);
  };

  const Columns = [
    {
      Header: <TableHeading filter>Line</TableHeading>,
      accessor: "line",
      style: {
        textAlign: "center",
        cursor: "pointer",
      },
      Cell: (row) => {
        return (
          <TableCellText title={row.original}>
            {row.original.line}
          </TableCellText>
        );
      },
    },
    {
      Header: <TableHeading filter>Job Order No</TableHeading>,
      accessor: "job_order_no",
      style: {
        textAlign: "center",
        cursor: "pointer",
      },
      Cell: (row) => {
        return (
          <TableCellText title={row.original}>
            {row.original.job_order_no}
          </TableCellText>
        );
      },
    },
    {
      Header: <TableHeading filter>Vessel Voyage No</TableHeading>,
      accessor: "vessel_voyage_no",
      style: {
        textAlign: "center",
        cursor: "pointer",
      },
      Cell: (row) => {
        return (
          <TableCellText title={row.original.vessel_voyage_no}>
            {row.original.vessel_voyage_no}
          </TableCellText>
        );
      },
    },
    {
      Header: <TableHeading filter>Quantity</TableHeading>,
      accessor: "quantity",
      style: {
        textAlign: "center",
        cursor: "pointer",
      },
      Cell: (row) => {
        return (
          <TableCellText title={row.original.quantity}>
            {row.original.quantity}
          </TableCellText>
        );
      },
    },
    {
      Header: <TableHeading filter>Gate Ins</TableHeading>,
      accessor: "gate_ins",
      style: {
        textAlign: "center",
        cursor: "pointer",
      },
      Cell: (row) => {
        return (
          <TableCellText title={row.original.gate_ins}>
            {row.original.gate_ins}
          </TableCellText>
        );
      },
    },
    {
      Header: <TableHeading filter>Pendency</TableHeading>,
      accessor: "pendency",
      style: {
        textAlign: "center",
        cursor: "pointer",
      },
      Cell: (row) => {
        return (
          <TableCellText title={row.original.pendency}>
            {row.original.pendency}
          </TableCellText>
        );
      },
    },

    {
      Header: <TableHeading filter>Discarded</TableHeading>,
      show:
        user.en_block_movement_v2 === "True" ||
        user.en_block_movement_v2 === "true" ||
        user.en_block_movement_v2 === true,
      accessor: "discarded",
      style: {
        textAlign: "center",
        cursor: "pointer",
      },
      Cell: (row) => {
        return (
          <TableCellText title={row.original.discarded}>
            {row.original.discarded}
          </TableCellText>
        );
      },
    },
    {
      Header: <TableHeading filter>Report</TableHeading>,
      accessor: "pendency",
      style: {
        textAlign: "center",
        cursor: "pointer",
      },
      Cell: (row) => {
        return (
          <Button
            startIcon={<FileDownloadOutlinedIcon />}
            variant="text"
            color="primary"
            onClick={() => handleDownloadReport(row.original.job_order_no)}
          >
            En Block Report
          </Button>
        );
      },
    },
    {
      Header: <TableHeading filter>Action</TableHeading>,
      show:
        user.en_block_movement === "True" ||
        user.en_block_movement === "true" ||
        user.en_block_movement === true,
      style: {
        textAlign: "center",
        cursor: "pointer",
      },
      Cell: (row) => {
        return (
          <Button
            startIcon={<EditOutlinedIcon />}
            variant="text"
            color="primary"
            onClick={() => handleOpen(row.original)}
          >
            Update
          </Button>
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
    dispatch({ type: ENBLOCK_REDUCER_CONST.EN_BLOCK_REDUCER_LISTING_INIT });
    dispatch({
      type: ENBLOCK_REDUCER_CONST.EN_BLOCK_REDUCER_LISTING,
      payload: {
        vessel_no: process === "vessel_no" ? searchText : "",
        voyage_no: process === "voyage_no" ? searchText : "",
        job_order_no: process === "job_order_no" ? searchText : "",
      },
    });
    dispatch(getEnBLockListingAction(notify));
  }, [searchText, notify, process]);

  const handleCloseClick = useCallback(() => setSearchText(""), [searchText]);

  const handleSetProcess = useCallback(
    (e) => setProcess(e.target.value),
    [process]
  );


    const handleOnPageDataChange = (value) => {
      dispatch({
        type: ENBLOCK_REDUCER_CONST.EN_BLOCK_REDUCER_LISTING,
        payload: { on_page_data_client: value, page_no: 1 },
      });
          dispatch(getEnBLockListingAction(notify));

    };
  
    const handlePaginationOnChange = (e, val) => {
      dispatch({
        type: ENBLOCK_REDUCER_CONST.EN_BLOCK_REDUCER_LISTING,
        payload: { page_no: val },
      });
        dispatch(getEnBLockListingAction(notify));

    };
  
 

  const handleInitialPage = () => {
    dispatch({
      type: ENBLOCK_REDUCER_CONST.EN_BLOCK_REDUCER_LISTING,
      payload: { page_no: 1 },
    });
    dispatch(getEnBLockListingAction(notify));
  };



  const handleChange = (e) => {
    const { value, name } = e.target;
    setEnBlockEdit((prev) => ({ ...prev, [name]: value }));
  };
  const handleRefresh = () => {
    dispatch({ type: ENBLOCK_REDUCER_CONST.EN_BLOCK_REDUCER_LISTING_INIT });
    dispatch(getEnBLockListingAction(notify));
  };

  const handleDownloadReport = (job_order_no) => {
    dispatch(downloadEnBlockReportFileAction(job_order_no, notify));
  };

  const handleUpdateEnBlock = () => {
    dispatch(updateEnBlockAction(enBlockEdit, notify, setOpen));
  };

  const handleAddEnBlockData = () => {
    if (enBlockEdit.line === "") {
      notify("Line is required", { variant: "warning" });
    } else if (enBlockEdit.job_order_no === "") {
      notify("Job Order No is required ", { variant: "warning" });
    } else if (enBlockEdit.vessel_no === "") {
      notify("Vessel No is required", { variant: "warning" });
    } else if (enBlockEdit.voyage_no === "") {
      notify("Voyage No is reqiuired", { variant: "warning" });
    } else if (enBlockEdit.quantity === "" || enBlockEdit.quantity <= 0) {
      notify("Quantity is required", { variant: "warning" });
    } else {
      let addData = {
        line: enBlockEdit.line,
        job_order_no: enBlockEdit.job_order_no,
        vessel_name: enBlockEdit.vessel_no,
        voyage_no: enBlockEdit.voyage_no,
        quantity: Number(enBlockEdit.quantity),
        gate_ins: 0,
        pendency: Number(enBlockEdit.quantity),
      };

      dispatch(addEnBLockDataAction(addData, notify, handleClose));
    }
  };

  return (
    <LayoutContainer>
      <Box padding={matchesIphone ? 1 : 2}>
        <Stack
          direction={"row"}
          alignItems={"center"}
          justifyContent={"space-between"}
          mb={6}
        >
          {" "}
          <TablePageTitle> En Block Movement </TablePageTitle>
        </Stack>
        <Grid container spacing={2}>
          <Grid item size={{ xs: 10, sm: 6, md: 5, lg: 5, xl: 3 }}>
            <TableCustomSearchBar
              selectName={process}
              updateSelectname={handleSetProcess}
              searchText={searchText}
              setSearchText={handleSearchChange}
              closeClick={handleCloseClick}
              searchClick={handleSearchButton}
              maxWidthSearch={'100%'}
            >
              <MenuItem key={"vessel_no"} value="vessel_no">
                &nbsp; &nbsp;&nbsp;Vessel No
              </MenuItem>
              <MenuItem key={"voyage_no"} value="voyage_no">
                &nbsp; &nbsp;&nbsp;Voyage No
              </MenuItem>
              <MenuItem key={"job_order_no"} value="job_order_no">
                &nbsp; &nbsp;&nbsp;Job Order No
              </MenuItem>
            </TableCustomSearchBar>
          </Grid>
          <Grid
            item
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: 1,
            }}
            size={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 9 }}
          >
            <TableRefreshIcon onClick={handleRefresh} />
          </Grid>
          <Grid item size={{ xs: 12 }}>
            <TableCustomAdvanceReactTable
              data={enBlockListing.data || []}
              columns={[...Columns]}
              minRows={enBlockListing.on_page_data_client}
            />
            <TableCustomPaginationReactTable
              total_pages={enBlockListing.total_pages}
              pg_no={enBlockListing.page_no}
              handlePaginationOnChange={handlePaginationOnChange}
              next_page={enBlockListing.next_page}
              on_page_data={enBlockListing.on_page_data_client}
              handleInitialPage={handleInitialPage}
              handleOnPageDataChange={handleOnPageDataChange}
            />
          </Grid>
        </Grid>
        <TableFootercontainer>
          {(user.en_block_movement === "True" ||
            user.en_block_movement === "true" ||
            user.en_block_movement === true) && (
            <Link to="/empty-yard/enBlock/bulk-upload" style={{ marginRight: "8px" }}>
              <Button
                startIcon={<CloudUploadOutlinedIcon fontSize="small" />}
                variant="contained"
                color="success"
                sx={{borderRadius:12}}
              >
                Bulk Upload
              </Button>
            </Link>
          )}
        </TableFootercontainer>
      </Box>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style} style={{ outline: "none" }}>
          <Typography id="modal-modal-title" variant="body2" component="h2">
            En Block Data
          </Typography>
          <Box mt={4}></Box>
          <Grid container spacing={2}>
            <Grid
              item
              size={{ xs: 12, sm: 6, lg: 4 }}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography variant="subtitle1" sx={customLabelTypography}>
                Line <span style={{ color: "red" }}>*</span>
              </Typography>
              {isEditing ? (
                <Autocomplete
                  id="report-line"
                  freeSolo={true}
                  value={enBlockEdit.line}
                  noOptionsText="No Reports Available"
                  options={
                    gateIn?.allDropDown &&
                    gateIn?.allDropDown?.report_shipping_lines &&
                    gateIn?.allDropDown?.report_shipping_lines
                  }
                  getOptionLabel={(option) => option}
                  style={{ padding: 0 }}
                  sx={{
                    "& .MuiAutocomplete-inputRoot[class*='MuiOutlinedInput-root']":
                      {
                        padding: 0,
                      },
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      autoComplete="off"
                      value={enBlockEdit.line}
                      onBlur={(e) => {
                        setEnBlockEdit((prev) => ({
                          ...prev,
                          line: e.target.value,
                        }));
                      }}
                      fullWidth
                      variant="outlined"
                    />
                  )}
                />
              ) : (
                <GateInTextField
                  name={"line"}
                  readOnlyP={isEditing ? false : true}
                  value={enBlockEdit.line}
                  handleChange={handleChange}
                />
              )}
            </Grid>
            <Grid
              item
              size={{ xs: 12, sm: 6, lg: 4 }}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography variant="subtitle1" sx={customLabelTypography}>
                Job Order No <span style={{ color: "red" }}>*</span>
              </Typography>
              <GateInTextField
                readOnlyP={isEditing ? false : true}
                value={enBlockEdit.job_order_no}
                name={"job_order_no"}
                handleChange={handleChange}
              />
            </Grid>
            <Grid
              item
              size={{ xs: 12, sm: 6, lg: 4 }}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography variant="subtitle1" sx={customLabelTypography}>
                Vessel Name <span style={{ color: "red" }}>*</span>
              </Typography>
              {isEditing ? (
                <Autocomplete
                  id="report-line"
                  freeSolo={true}
                  value={enBlockEdit.vessel_no}
                  noOptionsText="No Reports Available"
                  options={
                    enBlock_Vessel_Voyage_Name?.data?.vessel_name &&
                    enBlock_Vessel_Voyage_Name?.data?.vessel_name
                  }
                  getOptionLabel={(option) => option}
                  style={{ padding: 0 }}
                  sx={{
                    "& .MuiAutocomplete-inputRoot[class*='MuiOutlinedInput-root']":
                      {
                        padding: 0,
                      },
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      autoComplete="off"
                      value={enBlockEdit.vessel_no}
                      onBlur={(e) => {
                        setEnBlockEdit((prev) => ({
                          ...prev,
                          vessel_no: e.target.value,
                        }));
                      }}
                      fullWidth
                      variant="outlined"
                    />
                  )}
                />
              ) : (
                <GateInTextField
                  readOnlyP={isEditing ? false : true}
                  value={enBlockEdit.vessel_no}
                  name={"vessel_no"}
                  handleChange={handleChange}
                />
              )}
            </Grid>
            <Grid
              item
              size={{ xs: 12, sm: 6, lg: 4 }}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography variant="subtitle1" sx={customLabelTypography}>
                Voyage No <span style={{ color: "red" }}>*</span>
              </Typography>
              {isEditing ? (
                <Autocomplete
                  id="report-line"
                  freeSolo={true}
                  value={enBlockEdit.voyage_no}
                  noOptionsText="No Reports Available"
                  options={
                    (enBlock_Vessel_Voyage_Name?.data?.voyage_no &&
                      enBlock_Vessel_Voyage_Name?.data?.voyage_no) ||
                    []
                  }
                  getOptionLabel={(option) => option}
                  style={{ padding: 0 }}
                  sx={{
                    "& .MuiAutocomplete-inputRoot[class*='MuiOutlinedInput-root']":
                      {
                        padding: 0,
                      },
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      autoComplete="off"
                      value={enBlockEdit.voyage_no}
                      onBlur={(e) => {
                        setEnBlockEdit((prev) => ({
                          ...prev,
                          voyage_no: e.target.value,
                        }));
                      }}
                      fullWidth
                      variant="outlined"
                    />
                  )}
                />
              ) : (
                <GateInTextField
                  readOnlyP={isEditing ? false : true}
                  value={enBlockEdit.voyage_no}
                  name={"voyage_no"}
                  handleChange={handleChange}
                />
              )}
            </Grid>
            <Grid
              item
              size={{ xs: 12, sm: 6, lg: 4 }}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography variant="subtitle1" sx={customLabelTypography}>
                Quantity <span style={{ color: "red" }}>*</span>
              </Typography>
              <GateInTextField
                value={enBlockEdit.quantity}
                name={"quantity"}
                handleChange={handleChange}
              />
            </Grid>
            {!isEditing && (
              <Grid
                item
                size={{ xs: 12, sm: 6, lg: 4 }}
                style={theme.breakpoints.down("sm") && { padding: 7 }}
              >
                <Typography variant="subtitle1" sx={customLabelTypography}>
                  Gate Ins <span style={{ color: "red" }}>*</span>
                </Typography>
                <GateInTextField
                  readOnlyP={isEditing ? false : true}
                  value={enBlockEdit.gate_ins?.toString()}
                  name={"gate_ins"}
                  handleChange={handleChange}
                />
              </Grid>
            )}
            {!isEditing && (
              <Grid
                item
                size={{ xs: 12, sm: 6, lg: 4 }}
                style={theme.breakpoints.down("sm") && { padding: 7 }}
              >
                <Typography variant="subtitle1" sx={customLabelTypography}>
                  Pendency <span style={{ color: "red" }}>*</span>
                </Typography>
                <GateInTextField
                  readOnlyP={isEditing ? false : true}
                  value={enBlockEdit.pendency}
                  name="pendency"
                  handleChange={handleChange}
                />
              </Grid>
            )}
            <Grid
              item
              size={{ xs: 12 }}
              style={
                theme.breakpoints.down("sm") && { padding: 7, textAlign: "end" }
              }
            >
              <Button variant="text" color="primary" onClick={handleClose}>
                Cancel
              </Button>
              {isEditing ? (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleAddEnBlockData}
                >
                  Add
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleUpdateEnBlock}
                >
                  Update
                </Button>
              )}
            </Grid>
          </Grid>
        </Box>
      </Modal>
      <Backdrop sx={custombackDropStyle} open={ui.isloading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </LayoutContainer>
  );
};

export default ENBlockMovement;
