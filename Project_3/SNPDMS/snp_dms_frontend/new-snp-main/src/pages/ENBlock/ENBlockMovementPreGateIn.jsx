import React, { useCallback, useEffect, useState } from "react";
import LayoutContainer from "@components/reusablecomponents/LayoutContainer";
import CustomHeading from "../../components/CustomHeading";
import CustomReactTable from "../../components/CustomReactTable";
import { useSnackbar } from "notistack";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSort } from "@fortawesome/free-solid-svg-icons";
import { useDispatch, useSelector } from "react-redux";
import { ENBLOCK_REDUCER_CONST } from "../../reducers/EnBlockReducer";
import ListIcon from "@mui/icons-material/List";
import {
  alpha,
  Backdrop,
  Badge,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  FormControlLabel,
  Grid,
  MenuItem,
  Modal,
  Popover,
  Radio,
  Typography,
  useMediaQuery,
} from "@mui/material";

import { Link } from "react-router-dom";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";

import {
  discardEnBLockPreGateInContainerAction,
  downloadEnBlockPreGateInReportFile,
  getEnBLockListingPreGateInAction,
} from "../../actions/EnBlockMovementAction";
import { theme } from "../../App";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import GateInTextField from "@components/reusablecomponents/GateInTextField";
import { Stack } from "@mui/material";
import DoneIcon from "@mui/icons-material/Done";
import CrossIcon from "@mui/icons-material/Cancel";
import DeleteSweepOutlinedIcon from "@mui/icons-material/DeleteSweepOutlined";
import {
  custombackDropStyle,
  customLabelTypography,
} from "../../utils/CustomClasses";
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

const ENBlockMovementPreGateIn = () => {
  const notify = useSnackbar().enqueueSnackbar;
  const dispatch = useDispatch();

  const [process, setProcess] = useState("job_order_no");

  const { ui, user } = useSelector((state) => state);
  const { enBlockPreGateInListing } = useSelector(
    (store) => store.EnBlockReducer
  );
  const matchesIphone = useMediaQuery("(max-width:400px)");

  const [searchText, setSearchText] = useState("");
  const [jobOrder, setJobOrder] = useState("");
  const [openDiscardModal, setOpenDiscardModal] = useState(false);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [discardRemark, setDiscardRemark] = useState("");
  const handleOpen = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  useEffect(() => {
    dispatch(getEnBLockListingPreGateInAction(notify));
  }, []);

  const handleJobOrderChange = (e) => {
    setJobOrder(e.target.value);
  };

  const handleDiscardRemarkChange = (e) => {
    setDiscardRemark(e.target.value);
  };

  const checkAllRows = (val) => {
    if (val) {
      enBlockPreGateInListing.data.forEach((val) =>
        setSelectedRows((prev) => prev.filter((data) => data.pk !== val.pk))
      );
    } else {
      if (selectedRows.length === 0) {
        let allData = enBlockPreGateInListing.data
          .filter(
            (data) =>
              data.job_order_no ===
              enBlockPreGateInListing.data?.[0]?.job_order_no
          )
          .map((val, index) => ({
            pk: val.pk,
            container_no: val.container_no,
            job_order_no: val.job_order_no,
            enabled: true,
          }));
        setSelectedRows(allData);
      } else {
        let allData = enBlockPreGateInListing.data
          .filter(
            (data) => data.job_order_no === selectedRows?.[0]?.job_order_no
          )
          .map((val, index) => ({
            pk: val.pk,
            container_no: val.container_no,
            job_order_no: val.job_order_no,
            enabled: true,
          }));
        setSelectedRows((prev) => [...prev, ...allData]);
      }
    }
  };

  const handleCheck = (pk, val, job_order_no) => {
    if (
      selectedRows.length > 0 &&
      selectedRows[0].job_order_no !== job_order_no
    ) {
      notify("Please select Containers with same Job Order No", {
        variant: "warning",
      });
      return;
    }
    if (!selectedRows.some((value) => value.pk === pk)) {
      setSelectedRows([
        ...selectedRows,
        {
          pk,
          container_no: val,
          enabled: true,
          job_order_no: job_order_no,
        },
      ]);
    } else {
      const updatedVal = selectedRows.filter((item) => item.pk !== pk);
      setSelectedRows(updatedVal);
    }
  };

  const totalSelectedContainers = () => {
    let counts = selectedRows?.filter((item) => item.enabled).length;
    return counts;
  };

  const handleChip = (pkToUpdate) => {
    const updatedData = selectedRows.map((item) => {
      if (item.pk === pkToUpdate) {
        return {
          ...item,
          enabled: !item.enabled,
        };
      }
      return item;
    });

    setSelectedRows(updatedData);
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

  const Columns = [
    {
      Header: (
        <div>
          <Checkbox
            checked={enBlockPreGateInListing.data?.every((item) =>
              selectedRows.some((data) => data.pk === item.pk)
            )}
            onClick={(e) => {
              checkAllRows(!e.target.checked);
            }}
            color="primary"
            inputProps={{ "aria-label": "Checkbox A" }}
          />
        </div>
      ),

      width: 50,
      style: {
        textAlign: "center",
      },
      show: enBlockPreGateInListing.status === "Pending",
      Cell: (row) => {
        return (
          <div>
            <Checkbox
              checked={selectedRows.some((item) => item.pk === row.original.pk)}
              key={row.original.pk}
              onClick={(e) => {
                handleCheck(
                  row.original.pk,
                  row.original.container_no,
                  row.original.job_order_no
                );
              }}
              color="primary"
              sx={{ color: "black" }}
              inputProps={{ "aria-label": "Checkbox A" }}
            />
          </div>
        );
      },
    },
    {
      Header: <TableHeading filter>Container No</TableHeading>,
      accessor: "container_no",
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
      Header: <TableHeading filter>Size</TableHeading>,
      accessor: "size",
      style: {
        textAlign: "center",
        cursor: "pointer",
      },
      Cell: (row) => {
        return (
          <TableCellText title={row.original}>
            {row.original.size}
          </TableCellText>
        );
      },
    },
    {
      Header: <TableHeading filter>Type</TableHeading>,
      accessor: "type",
      style: {
        textAlign: "center",
        cursor: "pointer",
      },
      Cell: (row) => {
        return (
          <TableCellText title={row.original}>
            {row.original.type}
          </TableCellText>
        );
      },
    },
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
      Header: <TableHeading filter>Vessel Name</TableHeading>,
      accessor: "vessel_name",
      style: {
        textAlign: "center",
        cursor: "pointer",
      },
      Cell: (row) => {
        return (
          <TableCellText title={row.original.vessel_name}>
            {row.original.vessel_name}
          </TableCellText>
        );
      },
    },
    {
      Header: <TableHeading filter>Voyage Number</TableHeading>,
      accessor: "voyage_no",
      style: {
        textAlign: "center",
        cursor: "pointer",
      },
      Cell: (row) => {
        return (
          <TableCellText title={row.original.voyage_no}>
            {row.original.voyage_no}
          </TableCellText>
        );
      },
    },
    {
      Header: <TableHeading filter>Status</TableHeading>,
      accessor: "is_processed",
      style: {
        textAlign: "center",
        cursor: "pointer",
      },
      Cell: (row) => {
        return (
          <TableCellText
            style={{
              color: row.original?.is_processed
                ? theme.palette.success.dark
                : row.original?.is_discarded
                ? theme.palette.error.main
                : theme.palette.info.main,
            }}
            title={row.original.is_processed}
          >
            {row.original?.is_processed
              ? "Processed"
              : row.original?.is_discarded
              ? "Discarded"
              : "Pending"}
          </TableCellText>
        );
      },
    },
    {
      Header: <TableHeading filter>Remark</TableHeading>,
      accessor: "remark",
      style: {
        textAlign: "center",
        cursor: "pointer",
      },
      show: enBlockPreGateInListing.status === "Discarded",
      Cell: (row) => {
        return (
          <TableCellText title={row.original.remark}>
            {row.original.remark}
          </TableCellText>
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
    dispatch({ type: ENBLOCK_REDUCER_CONST.EN_BLOCK_PRE_GATE_IN_LISTING });
    dispatch({
      type: ENBLOCK_REDUCER_CONST.EN_BLOCK_PRE_GATE_IN_LISTING,
      payload: {
        vessel_name: process === "vessel_name" ? searchText : "",
        voyage_no: process === "voyage_no" ? searchText : "",
        job_order_no: process === "job_order_no" ? searchText : "",
        container_no: process === "container_no" ? searchText : "",
      },
    });
    dispatch(getEnBLockListingPreGateInAction(notify));
  }, [searchText, notify, process]);

  const handleCloseClick = useCallback(() => setSearchText(""), [searchText]);

  const handleSetProcess = useCallback(
    (e) => setProcess(e.target.value),
    [process]
  );

  const handleInitialPage = () => {
    dispatch({
      type: ENBLOCK_REDUCER_CONST.EN_BLOCK_PRE_GATE_IN_LISTING,
      payload: { page_no: 1 },
    });
    dispatch(getEnBLockListingPreGateInAction(notify));
  };

  const handleOnPageDataChange = (value) => {
    dispatch({
      type: ENBLOCK_REDUCER_CONST.EN_BLOCK_PRE_GATE_IN_LISTING,
      payload: { on_page_data_client: value, page_no: 1 },
    });
    dispatch(getEnBLockListingPreGateInAction(notify));
  };

  const handlePaginationOnChange = (e, val) => {
    dispatch({
      type: ENBLOCK_REDUCER_CONST.EN_BLOCK_PRE_GATE_IN_LISTING,
      payload: { page_no: val },
    });
    dispatch(getEnBLockListingPreGateInAction(notify));
  };

  const handleRefresh = () => {
    dispatch({ type: ENBLOCK_REDUCER_CONST.EN_BLOCK_PRE_GATE_IN_LISTING_INIT });
    dispatch(getEnBLockListingPreGateInAction(notify));
  };

  const handleDownloadReport = () => {
    dispatch(downloadEnBlockPreGateInReportFile(jobOrder, notify, handleClose));
  };

  const handleModalCloseDiscard = () => {
    setOpenDiscardModal(false);
  };

  const handleDiscardSelectedContiner = () => {
    if (discardRemark === "") {
      notify("Please enter remark to discard the containers", {
        variant: "error",
      });
      return;
    }

    let job_no;

    let selectedValue = selectedRows.map((item) => {
      if (item.enabled) {
        job_no = item.job_order_no;
        return item.pk;
      } else {
        return null;
      }
    });
    let selected_containers_delete = selectedValue.filter(
      (item) => item !== null
    );

    dispatch(
      discardEnBLockPreGateInContainerAction(
        selected_containers_delete,
        discardRemark,
        job_no,
        notify,
        setSelectedRows,
        handleModalCloseDiscard
      )
    );
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
          <TablePageTitle> En Block Movement Pre Gate In</TablePageTitle>
        </Stack>

        <Grid container spacing={2}>
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
              selectName={process}
              updateSelectname={handleSetProcess}
              searchText={searchText}
              setSearchText={handleSearchChange}
              closeClick={handleCloseClick}
              searchClick={handleSearchButton}
              maxWidthSearch={"60%"}
            >
              <MenuItem key={"job_order_no"} value="job_order_no">
                Job Order No
              </MenuItem>
              <MenuItem key={"vessel_name"} value="vessel_name">
                Vessel Name
              </MenuItem>
              <MenuItem key={"voyage_no"} value="voyage_no">
                Voyage No
              </MenuItem>
              <MenuItem key={"container_no"} value="container_no">
                Container No
              </MenuItem>
            </TableCustomSearchBar>
            <TableFilterComponent
              activeFilter={true}
              style={{ width: "fit-content" }}
              title={`Status - ${enBlockPreGateInListing.status}`}
            >
              <Grid item size={{ xs: 12 }}>
                <Typography variant="subtitle2">Status</Typography>
              </Grid>
              <Grid item size={{ xs: 12 }}>
                <FormControlLabel
                  value="Pending"
                  control={
                    <Radio
                      size="small"
                      style={{ color: theme.palette.info.dark }}
                      checked={enBlockPreGateInListing.status === "Pending"}
                      onClick={() => {
                        dispatch({
                          type: ENBLOCK_REDUCER_CONST.EN_BLOCK_PRE_GATE_IN_LISTING,
                          payload: {
                            pg_no: 1,
                            status: "Pending",
                          },
                        });
                        dispatch(getEnBLockListingPreGateInAction(notify));
                      }}
                    />
                  }
                  label="Pending"
                />
              </Grid>
              <Grid item size={{ xs: 12 }}>
                <FormControlLabel
                  value="Processed"
                  control={
                    <Radio
                      size="small"
                      style={{ color: theme.palette.success.dark }}
                      checked={enBlockPreGateInListing.status === "Processed"}
                      onClick={() => {
                        setSelectedRows([]);
                        dispatch({
                          type: ENBLOCK_REDUCER_CONST.EN_BLOCK_PRE_GATE_IN_LISTING,
                          payload: {
                            pg_no: 1,
                            status: "Processed",
                          },
                        });
                        dispatch(getEnBLockListingPreGateInAction(notify));
                      }}
                    />
                  }
                  label="Processed"
                />
              </Grid>
              <Grid item size={{ xs: 12 }}>
                <FormControlLabel
                  value="Discarded"
                  control={
                    <Radio
                      size="small"
                      style={{ color: theme.palette.error.dark }}
                      checked={enBlockPreGateInListing.status === "Discarded"}
                      onClick={() => {
                        setSelectedRows([]);
                        dispatch({
                          type: ENBLOCK_REDUCER_CONST.EN_BLOCK_PRE_GATE_IN_LISTING,
                          payload: {
                            pg_no: 1,
                            status: "Discarded",
                          },
                        });
                        dispatch(getEnBLockListingPreGateInAction(notify));
                      }}
                    />
                  }
                  label="Discarded"
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
              data={enBlockPreGateInListing.data || []}
              columns={[...Columns]}
              minRows={Number(enBlockPreGateInListing.on_page_data_client)}
              pageSize={Number(enBlockPreGateInListing.on_page_data_client)}
              defaultPageSize={Number(
                enBlockPreGateInListing.on_page_data_client
              )}
            />
            <TableCustomPaginationReactTable
              total_pages={enBlockPreGateInListing.total_pages}
              pg_no={enBlockPreGateInListing.page_no}
              handlePaginationOnChange={handlePaginationOnChange}
              next_page={enBlockPreGateInListing.next_page}
              on_page_data={enBlockPreGateInListing.on_page_data_client}
              handleInitialPage={handleInitialPage}
              handleOnPageDataChange={handleOnPageDataChange}
            />
          </Grid>
        </Grid>
      </Box>
      <Box mt={12}></Box>

      <TableFootercontainer>
        {selectedRows.length > 0 && (
          <Button
            color="secondary"
            variant="contained"
            sx={(theme) => ({
              borderRadius: 12,
              [theme.breakpoints.down("sm")]: {
                minWidth: 160,
              },
            })}
            startIcon={
              <Badge
                badgeContent={selectedRows?.length}
                color="primary"
                sx={{
                  "& .MuiBadge-badge": {
                    right: 22,
                    top: 6,
                    padding: 0,
                  },
                }}
              >
                <DeleteSweepOutlinedIcon fontSize="small" />
              </Badge>
            }
            onClick={() => setOpenDiscardModal(true)}
          >
            Discard Containers
          </Button>
        )}
        <Link
          to="/enBlock-Pre-Gate-IN/bulk-upload"
          style={{ marginRight: "8px", marginLeft: 12 }}
        >
          <Button
            startIcon={<CloudUploadOutlinedIcon fontSize="small" />}
            variant="contained"
            color="success"
            sx={(theme) => ({
              borderRadius: 12,
              [theme.breakpoints.down("sm")]: {
                minWidth: 160,
              },
            })}
          >
            Bulk Upload
          </Button>
        </Link>
        <Button
          aria-describedby={id}
          onClick={handleOpen}
          startIcon={<FileDownloadOutlinedIcon fontSize="small" />}
          variant="contained"
          color="success"
          sx={(theme) => ({
            borderRadius: 12,
            [theme.breakpoints.down("sm")]: {
              minWidth: 160,
            },
          })}
          style={{ marginRight: "8px", marginLeft: 12 }}
          // onClick={handleDownloadReport}
        >
          Download Report
        </Button>

        <Popover
          id={id}
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{
            vertical: "top",
            horizontal: "left",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          elevation={1}
          style={{ marginTop: 20, overflow: "hidden", borderRadius: 12 }}
          sx={{
            "& .MuiPopover-paper": {
              overflowY: "hidden",
              padding: "12px 12px",
            },
          }}
        >
          <Box
            style={{
              overflow: "hidden",
              maxWidth: 220,
              padding: "24px 12px",
            }}
            component={Grid}
            container
            spacing={2}
          >
            <Stack
              direction={"column"}
              alignItems={"flex-start"}
              justifyContent={"space-between"}
              spacing={5}
            >
              <Box
                direction={"column"}
                alignItems={"flex-start"}
                justifyContent={"space-between"}
                spacing={1}
              >
                <Typography variant="caption">Type Job Order No</Typography>
                <GateInTextField
                  value={jobOrder}
                  handleChange={(e) => handleJobOrderChange(e)}
                />
              </Box>
              <Button
                aria-describedby={id}
                startIcon={
                  <FileDownloadOutlinedIcon
                    fontSize="small"
                    style={{ fill: theme.palette.success.dark }}
                  />
                }
                variant="text"
                color="primary"
                fullWidth
                style={{ color: theme.palette.success.dark }}
                disabled={jobOrder === ""}
                onClick={handleDownloadReport}
              >
                Download Report
              </Button>
            </Stack>
          </Box>
        </Popover>

        <Link to="/empty-yard/enBlock" style={{ marginRight: "8px", marginLeft: 12 }}>
          <Button
            startIcon={<ListIcon fontSize="small" />}
            variant="contained"
            color="primary"
            sx={{ borderRadius: 12 }}
          >
            En Block List
          </Button>
        </Link>
      </TableFootercontainer>

      <Modal open={openDiscardModal} onClose={handleModalCloseDiscard}>
        <Box
          style={getModalStyle()}
          sx={{
            position: "absolute",
            width: "70%",
            backgroundColor: "white",
            boxShadow: 5,
            padding: 20,
            outline: "none",
            borderRadius: 10,
          }}
        >
          <Typography>
            Total Containers Selected: {totalSelectedContainers()}
          </Typography>

          <Grid style={{ paddingBottom: 50, marginTop: 12 }}>
            {selectedRows.length !== 0 &&
              selectedRows.map((option) => (
                <Chip
                  label={option.container_no}
                  clickable
                  sx={{
                    background:
                      option.enabled === true ? "lightgreen" : "#FFCCCB",
                    border:
                      option.enabled === true
                        ? "1px solid green"
                        : "1px solid red",
                    color: option.enabled === true ? "green" : "red",
                    "&:hover": {
                      cursor: "pointer",
                      background:
                        option.enabled === true ? "lightgreen" : "#FFCCCB",
                      border:
                        option.enabled === true
                          ? "1px solid green"
                          : "1px solid red",
                      color: option.enabled === true ? "green" : "red",
                    },
                    margin: 5,
                  }}
                  onClick={() => {
                    handleChip(option.pk);
                  }}
                  onDelete={() => {
                    handleChip(option.pk);
                  }}
                  deleteIcon={
                    option.enabled === true ? <DoneIcon /> : <CrossIcon />
                  }
                />
              ))}
          </Grid>

          <Grid container spacing={2}>
            <Grid item sm={4}>
              <Typography variant="subtitle1" sx={customLabelTypography}>
                Add Remark <span style={{ color: "red" }}>*</span>
              </Typography>

              <GateInTextField
                value={discardRemark}
                handleChange={handleDiscardRemarkChange}
              />
            </Grid>
            <Grid item sm={8}></Grid>
          </Grid>

          <Stack
            direction={"row"}
            alignItems={"center"}
            justifyContent={"flex-end"}
            spacing={2}
            mt={2}
            mb={2}
          >
            <Button
              onClick={handleModalCloseDiscard}
              variant="text"
              color="primary"
            >
              Cancel
            </Button>

            <Button
              onClick={handleDiscardSelectedContiner}
              style={{
                width: "160px",
                backgroundColor: "rgb(243,37,37)",
                color: "white",
                borderRadius: 7,
              }}
            >
              Discard Selected
            </Button>
          </Stack>
        </Box>
      </Modal>
      <Backdrop sx={custombackDropStyle} open={ui.isloading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </LayoutContainer>
  );
};

export default ENBlockMovementPreGateIn;
