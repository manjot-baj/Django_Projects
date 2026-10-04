import React, { useEffect } from "react";
import { useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  styled,
  Typography,
  Button,
  Grid,
  Fab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  useMediaQuery,
  Badge,
  alpha,
  Backdrop,
  CircularProgress,
  Stack,
} from "@mui/material";
import UploadIcon from "@mui/icons-material/CloudUpload";

import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";

// import Pagination from "../Pagination";

import ClientSearch from "../../pages/Master/Client/ClientSearch";
import SealManagementSearch from "../../pages/Master/SealManagement/SealManagementSearch";

import CarrierCodeSearch from "../../pages/Master/CarrierCode/CarrierCodeSearch";

import ClientDocumentSearch from "../../pages/Master/ClientDocument/ClientDocumentSearch";

import TransporterSearch from "../../pages/Master/Transporter/TransporterSearch";

import VesselBkgNoSearch from "../../pages/Master/VesselBkgNo/VesselBkgNoSearch";

import VesselVoyageDetailSearch from "../../pages/Master/VesselVoyageDetail/VesselVoyageDetailSearch";

import LocationCodeDetailSearch from "../../pages/Master/LocationCodeDetail/LocationCodeDetailSearch";

import Add from "@mui/icons-material/Add";
import TariffDocumentSearch from "../../pages/Master/Tarrif/TariffDocumentSearch";
import StaffMasterSearch from "../../pages/Master/StaffMaster/StaffMasterSearch";
import LayoutContainer from "@components/reusablecomponents/LayoutContainer";
import Checkbox from "@components/reusablecomponents/ReusableCheckbox";
import { clearCheck } from "@/actions/master/ClientMasterActions";
import {
  TableCustomAdvanceReactTable,
  TableCustomPaginationReactTable,
  TableFootercontainer,
} from "../TableComponent/TableComponent";
import StaffAttendanceSearch from "../master/mnr/StaffAttendanceSearch";
import { custombackDropStyle } from "@/utils/CustomClasses";

import Tooltip from "@mui/material/Tooltip";
import { EditOutlined } from "@mui/icons-material";
import { useSnackbar } from "notistack";
const phone = window.innerWidth <= 380 || "orientation" in window;

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  // Styles for header cells
  "&.MuiTableCell-head": {
    fontWeight: 600,
    backgroundColor: theme.palette.secondary.main,
    color: "white",
    fontSize: "12px",
    textTransform: "uppercase",
  },

  // Styles for all cells
  "&.MuiTableCell-root": {
    borderBottom: "none",
    borderColor: "transparent",
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  backgroundColor: "white",
  borderRadius: 20,
  transition: "box-shadow 0.2s ease-in-out",

  "&:hover": {
    boxShadow: "0px 3px 6px #9199A14D",
    // cursor: 'pointer', // uncomment if needed
  },
}));

const StyledTableDataCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 600,
  color: "#243545",
  fontSize: 12.5,
  borderBottom: "none",
  padding: "10px",
  borderColor: "transparent",
  textTransform: "uppercase",
  textAlign: "center",
}));

const MasterListings = (props) => {
  const {
    rowArray,
    masterArray,
    buttonName,
    buttonClick,
    deleteSelected,
    downloadSelected,
    handleOnRowsChange,
    currentPage,
    handleInitialPage,
    handleOnPageDataChange,
    handlePaginationOnChange,
  } = props;
  const history = useHistory();
  const store = useSelector((state) => state);
  const { isloading } = useSelector((state) => state.ui);
  const { clientMaster } = store;
  const dispatch = useDispatch();
  const notify = useSnackbar().enqueueSnackbar;
  const { stocksAndAllotment, user } = store;
  const matchesIphone = useMediaQuery("(max-width:500px)");
  const Buttons = ["Country", "Location", "Site", "Role", "User", "Ref Code"];
  let role = localStorage.getItem("userInfo")
    ? JSON.parse(localStorage.getItem("userInfo")).role
    : null;

  const openSealUpload = () => {
    history.push("/master/sealManagement/seal-upload");
  };

  function FAB() {
    if (phone)
      return (
        <Fab
          onClick={buttonClick}
          size="small"
          sx={(theme) => ({
            color: "#fff",
            cursor: "pointer",
            zIndex: 0,
          })}
          variant="extended"
          color="primary"
        >
          <Add />
          &nbsp;Add New {buttonName}
        </Fab>
      );
    return (
      (user.role === "Admin" ||
        (user.role !== "Admin" && !Buttons.includes(buttonName))) && (
        <Fab
          onClick={buttonClick}
          size="small"
          sx={(theme) => ({
            cursor: "pointer",
            zIndex: 0,
          })}
          variant="extended"
          color="primary"
        >
          <Add />
          &nbsp;Add New {buttonName}
        </Fab>
      )
    );
  }

  useEffect(() => {
    return () => dispatch(clearCheck());
  }, []);

  return (
    <LayoutContainer footer={false}>
      {buttonName === "Client" && <ClientSearch />}
      {buttonName === "Client Document" && <ClientDocumentSearch />}

      {buttonName === "Transporter" && <TransporterSearch />}
      {buttonName === "Carrier Code" && <CarrierCodeSearch />}
      {buttonName === "Vessel Bkg No" && <VesselBkgNoSearch />}
      {buttonName === "Vessel Voyage Detail" && <VesselVoyageDetailSearch />}
      {buttonName === "Location Code Detail" && <LocationCodeDetailSearch />}
      {buttonName === "Tariff Type" && <TariffDocumentSearch />}
      {buttonName === "Staff Master" && <StaffMasterSearch />}

      <Box
        sx={(theme) => ({
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 24px",

          [theme.breakpoints.down("sm")]: {
            padding: "1px 2px",
          },
        })}
      >
        <Grid
          style={{
            display: "flex",
            alignItems: "center",
            width: "80%",
            justifyContent: "flex-start",
            gap: 12,
            padding: 2,
          }}
        >
          <Typography>
            Master {">"} {buttonName}
          </Typography>
          {props.searchComp ? props.searchComp : null}
          {buttonName === "Seal Management" && <SealManagementSearch />}
          {buttonName === "Staff Attendance" && <StaffAttendanceSearch />}
        </Grid>
      </Box>
      <TableFootercontainer>
        {clientMaster.check.length !== 0 && (
          <>
            <Button
              sx={{ borderRadius: 12, mx: 2 }}
              variant="contained"
              color="secondary"
              startIcon={
                <Badge
                  badgeContent={clientMaster.check?.length}
                  color="primary"
                  sx={{
                    "& .MuiBadge-badge": {
                      right: 22,
                      top: 6,
                      padding: 0,
                    },
                  }}
                >
                  <DeleteOutlineOutlinedIcon />
                </Badge>
              }
              onClick={deleteSelected}
            >
              Delete
            </Button>
            {buttonName === "Tariff Type" && (
              <Button
                variant="contained"
                color="success"
                sx={{ borderRadius: 12, mr: 2 }}
                onClick={downloadSelected}
              >
                Download Tariff
              </Button>
            )}
          </>
        )}
        <FAB />
        {buttonName === "Seal Management" && (
          <Button
            variant="contained"
            color="success"
            sx={{ mx: 1, borderRadius: 12 }}
            onClick={openSealUpload}
            startIcon={<UploadIcon />}
          >
            Seal Upload
          </Button>
        )}
      </TableFootercontainer>

      {buttonName === "Client" || buttonName === "Transporter" ? (
        <TableCustomAdvanceReactTable
          data={masterArray}
          columns={[...rowArray]}
          minRows={store.stocksAndAllotmentSearch.on_page_data}
          style={{
            height: "300px", // This will force the table body to overflow and scroll, since there is not enough room
          }}
          defaultPageSize={100}
          getTdProps={(state, rowInfo, column) => {
            return {
              onClick: () => props?.handleCellClick(rowInfo, column),
            };
          }}
        />
      ) : (
        <TableContainer style={{ minHeight: 325 }}>
          <Table
            sx={{
              minWidth: 650,
              borderCollapse: "separate",
              borderSpacing: "0px 10px",
              borderColor: "transparent",
              backgroundColor: "#EAF0F5",
            }}
            aria-label="simple table"
          >
            <TableHead>
              <TableRow>
                {rowArray.length > 0 &&
                  rowArray.map((row) => (
                    <StyledTableCell
                      key={row.id}
                      style={{ textAlign: "center" }}
                    >
                      {row.name?.split("_")?.join(" ")}
                    </StyledTableCell>
                  ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {buttonName === "Country" ? (
                masterArray.length > 0 ? (
                  masterArray.map((row) => (
                    <StyledTableRow key={row.pk} sx={{ cursor: "pointer" }}>
                      <StyledTableDataCell scope="row">
                        {role === "Admin" && (
                          <Checkbox id={row.pk} value={row.pk} />
                        )}
                      </StyledTableDataCell>
                      <StyledTableDataCell
                        scope="row"
                        onClick={() =>
                          (user.role === "Admin" ||
                            (user.role !== "Admin" &&
                              !Buttons.includes(buttonName))) &&
                          history.push({
                            pathname: "/master/country/form",
                            state: { pk: row.pk, allDetails: row },
                          })
                        }
                      >
                        {row.pk ? row.pk : "-"}
                      </StyledTableDataCell>
                      <StyledTableDataCell
                        onClick={() =>
                          (user.role === "Admin" ||
                            (user.role !== "Admin" &&
                              !Buttons.includes(buttonName))) &&
                          history.push({
                            pathname: "/master/country/form",
                            state: { pk: row.pk, allDetails: row },
                          })
                        }
                      >
                        {row.name ? row.name : "-"}
                      </StyledTableDataCell>
                      <StyledTableDataCell
                        onClick={() =>
                          (user.role === "Admin" ||
                            (user.role !== "Admin" &&
                              !Buttons.includes(buttonName))) &&
                          history.push({
                            pathname: "/master/country/form",
                            state: { pk: row.pk, allDetails: row },
                          })
                        }
                      >
                        {row.currency ? row.currency : "-"}
                      </StyledTableDataCell>
                    </StyledTableRow>
                  ))
                ) : (
                  <Grid style={{ marginTop: "35%", width: "100%" }}>
                    <Typography>No Data Found</Typography>
                  </Grid>
                )
              ) : buttonName === "Staff Attendance" ? (
                masterArray.map((staff_value) => (
                  <StyledTableRow
                    key={staff_value.id}
                    sx={{ cursor: "pointer" }}
                    onClick={() =>
                      history.push(
                        `/master/mnr-staff-attendance/${staff_value.id}`,
                      )
                    }
                  >
                    <StyledTableDataCell scope="row">
                      {staff_value?.sr_no ? staff_value?.sr_no : ""}
                    </StyledTableDataCell>
                    <StyledTableDataCell scope="row">
                      {staff_value?.employee?.firstName
                        ? staff_value?.employee?.firstName
                        : ""}{" "}
                      {staff_value?.employee?.lastName
                        ? staff_value?.employee?.lastName
                        : ""}
                    </StyledTableDataCell>
                    <StyledTableDataCell scope="row">
                      {staff_value?.employee?.role
                        ? staff_value?.employee?.role
                        : ""}
                    </StyledTableDataCell>
                    <StyledTableDataCell scope="row">
                      {staff_value?.employee?.qualification
                        ? staff_value?.employee?.qualification
                        : ""}
                    </StyledTableDataCell>
                    <StyledTableDataCell scope="row">
                      {staff_value?.employee?.emailId
                        ? staff_value?.employee?.emailId
                        : ""}
                    </StyledTableDataCell>
                    <StyledTableDataCell scope="row">
                      {staff_value?.employee?.mobileNo
                        ? staff_value?.employee?.mobileNo
                        : ""}
                    </StyledTableDataCell>
                    <StyledTableDataCell scope="row">
                      {staff_value?.date ? staff_value?.date : ""}
                    </StyledTableDataCell>
                    <StyledTableDataCell
                      scope="row"
                      sx={(theme) => ({
                        color:
                          staff_value?.status === "Present"
                            ? theme.palette.success.main
                            : staff_value?.status === "Absent"
                              ? theme.palette.error.main
                              : staff_value?.status === "Leave"
                                ? theme.palette.info.main
                                : theme.palette.warning.main,
                      })}
                    >
                      {staff_value?.status ? staff_value?.status : ""}
                    </StyledTableDataCell>
                    <StyledTableDataCell
                      scope="row"
                      sx={(theme) => ({
                        bgcolor: alpha(theme.palette.success.main, 0.2),
                      })}
                    >
                      {staff_value?.in_time ? staff_value?.in_time : ""}
                    </StyledTableDataCell>
                    <StyledTableDataCell
                      scope="row"
                      sx={(theme) => ({
                        bgcolor: alpha(theme.palette.error.main, 0.2),
                      })}
                    >
                      {staff_value?.out_time ? staff_value?.out_time : ""}
                    </StyledTableDataCell>
                    <StyledTableDataCell scope="row">
                      {staff_value?.remarks ? staff_value?.remarks : ""}
                    </StyledTableDataCell>
                  </StyledTableRow>
                ))
              ) : buttonName === "Location" ? (
                masterArray?.length > 0 ? (
                  masterArray.map((row) => (
                    <StyledTableRow key={row.code} sx={{ cursor: "pointer" }}>
                      <StyledTableDataCell scope="row">
                        {role === "Admin" && (
                          <Checkbox id={row.pk} value={row.pk} />
                        )}
                      </StyledTableDataCell>
                      <StyledTableDataCell
                        scope="row"
                        onClick={() =>
                          (user.role === "Admin" ||
                            (user.role !== "Admin" &&
                              !Buttons.includes(buttonName))) &&
                          history.push({
                            pathname: "/master/location/form",
                            state: { pk: row.pk, allDetails: row },
                          })
                        }
                      >
                        {row.code ? row.code : "-"}
                      </StyledTableDataCell>
                      <StyledTableDataCell
                        onClick={() =>
                          (user.role === "Admin" ||
                            (user.role !== "Admin" &&
                              !Buttons.includes(buttonName))) &&
                          history.push({
                            pathname: "/master/location/form",
                            state: { pk: row.pk, allDetails: row },
                          })
                        }
                      >
                        {row.name ? row.name : "-"}
                      </StyledTableDataCell>
                      <StyledTableDataCell
                        onClick={() =>
                          (user.role === "Admin" ||
                            (user.role !== "Admin" &&
                              !Buttons.includes(buttonName))) &&
                          history.push({
                            pathname: "/master/location/form",
                            state: { pk: row.pk, allDetails: row },
                          })
                        }
                      >
                        {row.target ? row.target : "-"}
                      </StyledTableDataCell>
                      <StyledTableDataCell
                        onClick={() =>
                          (user.role === "Admin" ||
                            (user.role !== "Admin" &&
                              !Buttons.includes(buttonName))) &&
                          history.push({
                            pathname: "/master/location/form",
                            state: { pk: row.pk, allDetails: row },
                          })
                        }
                      >
                        {row.company_name ? row.company_name : "-"}
                      </StyledTableDataCell>
                      <StyledTableDataCell
                        onClick={() =>
                          (user.role === "Admin" ||
                            (user.role !== "Admin" &&
                              !Buttons.includes(buttonName))) &&
                          history.push({
                            pathname: "/master/location/form",
                            state: { pk: row.pk, allDetails: row },
                          })
                        }
                      >
                        {row.company_address ? row.company_address : "-"}
                      </StyledTableDataCell>
                      <StyledTableDataCell
                        onClick={() =>
                          (user.role === "Admin" ||
                            (user.role !== "Admin" &&
                              !Buttons.includes(buttonName))) &&
                          history.push({
                            pathname: "/master/location/form",
                            state: { pk: row.pk, allDetails: row },
                          })
                        }
                      >
                        {row.state_code ? row.state_code : "-"}
                      </StyledTableDataCell>
                      <StyledTableDataCell
                        onClick={() =>
                          (user.role === "Admin" ||
                            (user.role !== "Admin" &&
                              !Buttons.includes(buttonName))) &&
                          history.push({
                            pathname: "/master/location/form",
                            state: { pk: row.pk, allDetails: row },
                          })
                        }
                      >
                        {row.country ? row.country : "-"}
                      </StyledTableDataCell>
                      <StyledTableDataCell
                        onClick={() =>
                          (user.role === "Admin" ||
                            (user.role !== "Admin" &&
                              !Buttons.includes(buttonName))) &&
                          history.push({
                            pathname: "/master/location/form",
                            state: { pk: row.pk, allDetails: row },
                          })
                        }
                      >
                        {row.gst_no ? row.gst_no : "-"}
                      </StyledTableDataCell>
                      <StyledTableDataCell
                        onClick={() =>
                          (user.role === "Admin" ||
                            (user.role !== "Admin" &&
                              !Buttons.includes(buttonName))) &&
                          history.push({
                            pathname: "/master/location/form",
                            state: { pk: row.pk, allDetails: row },
                          })
                        }
                      >
                        {row.lut_no ? row.lut_no : "-"}
                      </StyledTableDataCell>
                    </StyledTableRow>
                  ))
                ) : (
                  <Grid style={{ marginTop: "35%", width: "100%" }}>
                    <Typography>No Data Found</Typography>
                  </Grid>
                )
              ) : buttonName === "Site" ? (
                masterArray?.length > 0 ? (
                  masterArray.map((row) => (
                    <StyledTableRow key={row.code}>
                      <StyledTableDataCell scope="row">
                        {role === "Admin" && (
                          <Checkbox id={row.pk} value={row.pk} />
                        )}
                      </StyledTableDataCell>
                      <StyledTableDataCell
                        scope="row"
                        onClick={() =>
                          (user.role === "Admin" ||
                            (user.role !== "Admin" &&
                              !Buttons.includes(buttonName))) &&
                          history.push({
                            pathname: "/master/site/form",
                            state: { pk: row.pk, allDetails: row },
                          })
                        }
                      >
                        {row.code ? row.code : "-"}
                      </StyledTableDataCell>
                      <StyledTableDataCell
                        onClick={() =>
                          (user.role === "Admin" ||
                            (user.role !== "Admin" &&
                              !Buttons.includes(buttonName))) &&
                          history.push({
                            pathname: "/master/site/form",
                            state: { pk: row.pk, allDetails: row },
                          })
                        }
                      >
                        {row.name ? row.name : "-"}
                      </StyledTableDataCell>
                      <StyledTableDataCell
                        onClick={() =>
                          (user.role === "Admin" ||
                            (user.role !== "Admin" &&
                              !Buttons.includes(buttonName))) &&
                          history.push({
                            pathname: "/master/site/form",
                            state: { pk: row.pk, allDetails: row },
                          })
                        }
                      >
                        {row.location ? row.location : "-"}
                      </StyledTableDataCell>
                      <StyledTableDataCell
                        onClick={() =>
                          (user.role === "Admin" ||
                            (user.role !== "Admin" &&
                              !Buttons.includes(buttonName))) &&
                          history.push({
                            pathname: "/master/site/form",
                            state: { pk: row.pk, allDetails: row },
                          })
                        }
                      >
                        {row.address ? row.address : "-"}
                      </StyledTableDataCell>
                      <StyledTableDataCell
                        onClick={() =>
                          (user.role === "Admin" ||
                            (user.role !== "Admin" &&
                              !Buttons.includes(buttonName))) &&
                          history.push({
                            pathname: "/master/site/form",
                            state: { pk: row.pk, allDetails: row },
                          })
                        }
                      >
                        {row.contact ? row.contact : "-"}
                      </StyledTableDataCell>
                      <StyledTableDataCell
                        onClick={() =>
                          (user.role === "Admin" ||
                            (user.role !== "Admin" &&
                              !Buttons.includes(buttonName))) &&
                          history.push({
                            pathname: "/master/site/form",
                            state: { pk: row.pk, allDetails: row },
                          })
                        }
                      >
                        {row.type ? row.type : "-"}
                      </StyledTableDataCell>
                      <StyledTableDataCell
                        scope="row"
                        onClick={() =>
                          (user.role === "Admin" ||
                            (user.role !== "Admin" &&
                              !Buttons.includes(buttonName))) &&
                          history.push({
                            pathname: "/master/site/form",
                            state: { pk: row.pk, allDetails: row },
                          })
                        }
                      >
                        {row.depot_code ? row.depot_code : "-"}
                      </StyledTableDataCell>
                      <StyledTableDataCell
                        scope="row"
                        onClick={() =>
                          (user.role === "Admin" ||
                            (user.role !== "Admin" &&
                              !Buttons.includes(buttonName))) &&
                          history.push({
                            pathname: "/master/site/form",
                            state: { pk: row.pk, allDetails: row },
                          })
                        }
                      >
                        {row.depot_name ? row.depot_name : "-"}
                      </StyledTableDataCell>
                      <StyledTableDataCell
                        scope="row"
                        onClick={() =>
                          (user.role === "Admin" ||
                            (user.role !== "Admin" &&
                              !Buttons.includes(buttonName))) &&
                          history.push({
                            pathname: "/master/site/form",
                            state: { pk: row.pk, allDetails: row },
                          })
                        }
                      >
                        {row.vendor_code ? row.vendor_code : "-"}
                      </StyledTableDataCell>
                      <StyledTableDataCell
                        scope="row"
                        onClick={() =>
                          (user.role === "Admin" ||
                            (user.role !== "Admin" &&
                              !Buttons.includes(buttonName))) &&
                          history.push({
                            pathname: "/master/site/form",
                            state: { pk: row.pk, allDetails: row },
                          })
                        }
                      >
                        {row.vendor_name ? row.vendor_name : "-"}
                      </StyledTableDataCell>
                    </StyledTableRow>
                  ))
                ) : (
                  <Grid style={{ marginTop: "35%", width: "100%" }}>
                    <Typography>No Data Found</Typography>
                  </Grid>
                )
              ) : buttonName === "Seal Management" ? (
                masterArray?.length > 0 ? (
                  masterArray.map((row) => (
                    <StyledTableRow key={row.pk} sx={{ cursor: "pointer" }}>
                      <StyledTableDataCell scope="row">
                        {role === "Admin" && row.is_lock === false && (
                          <Checkbox id={row.pk} value={row.pk} />
                        )}
                      </StyledTableDataCell>

                      <StyledTableDataCell
                        onClick={() =>
                          history.push({
                            pathname: "/master/sealManagement/form",
                            state: { pk: row.pk, allDetails: row },
                          })
                        }
                      >
                        {row.number ? row.number : "-"}
                      </StyledTableDataCell>
                      <StyledTableDataCell
                        onClick={() =>
                          history.push({
                            pathname: "/master/sealManagement/form",
                            state: { pk: row.pk, allDetails: row },
                          })
                        }
                      >
                        {row.container_no ? row.container_no : "-"}
                      </StyledTableDataCell>
                      <StyledTableDataCell
                        onClick={() =>
                          history.push({
                            pathname: "/master/sealManagement/form",
                            state: { pk: row.pk, allDetails: row },
                          })
                        }
                      >
                        {row.seal_box_number ? row.seal_box_number : "-"}
                      </StyledTableDataCell>

                      <StyledTableDataCell
                        onClick={() =>
                          history.push({
                            pathname: "/master/sealManagement/form",
                            state: { pk: row.pk, allDetails: row },
                          })
                        }
                      >
                        {row.location ? row.location : "-"}
                      </StyledTableDataCell>

                      <StyledTableDataCell
                        onClick={() =>
                          history.push({
                            pathname: "/master/sealManagement/form",
                            state: { pk: row.pk, allDetails: row },
                          })
                        }
                      >
                        {row.site ? row.site : "-"}
                      </StyledTableDataCell>

                      <StyledTableDataCell
                        onClick={() =>
                          history.push({
                            pathname: "/master/sealManagement/form",
                            state: { pk: row.pk, allDetails: row },
                          })
                        }
                      >
                        {row.line ? row.line : "-"}
                      </StyledTableDataCell>

                      <StyledTableDataCell
                        onClick={() =>
                          history.push({
                            pathname: "/master/sealManagement/form",
                            state: { pk: row.pk, allDetails: row },
                          })
                        }
                      >
                        {row.in_date ? row.in_date : "-"}
                      </StyledTableDataCell>

                      <StyledTableDataCell
                        onClick={() =>
                          history.push({
                            pathname: "/master/sealManagement/form",
                            state: { pk: row.pk, allDetails: row },
                          })
                        }
                      >
                        {row.in_time ? row.in_time : "-"}
                      </StyledTableDataCell>
                    </StyledTableRow>
                  ))
                ) : (
                  <Grid style={{ marginTop: "35%", width: "100%" }}>
                    <Typography>No Data Found</Typography>
                  </Grid>
                )
              ) : buttonName === "Container Size" ||
                buttonName === "Container Type" ||
                buttonName === "Export Cargo Type" ? (
                masterArray?.length > 0 ? (
                  masterArray.map((row) => (
                    <StyledTableRow key={row.pk} sx={{ cursor: "pointer" }}>
                      <StyledTableDataCell scope="row">
                        {role === "Admin" && (
                          <Checkbox id={row.pk} value={row.pk} />
                        )}
                      </StyledTableDataCell>
                      <StyledTableDataCell
                        scope="row"
                        onClick={() =>
                          (user.role === "Admin" ||
                            (user.role !== "Admin" &&
                              !Buttons.includes(buttonName))) &&
                          buttonName === "Container Size"
                            ? history.push({
                                pathname: "/master/containerSize/form",
                                state: { pk: row.pk, allDetails: row },
                              })
                            : buttonName === "Container Type"
                              ? history.push({
                                  pathname: "/master/containerType/form",
                                  state: { pk: row.pk, allDetails: row },
                                })
                              : history.push({
                                  pathname: "/master/exportCargoType/form",
                                  state: { pk: row.pk, allDetails: row },
                                })
                        }
                      >
                        {row.pk ? row.pk : "-"}
                      </StyledTableDataCell>
                      <StyledTableDataCell
                        onClick={() =>
                          (user.role === "Admin" ||
                            (user.role !== "Admin" &&
                              !Buttons.includes(buttonName))) &&
                          buttonName === "Container Size"
                            ? history.push({
                                pathname: "/master/containerSize/form",
                                state: { pk: row.pk, allDetails: row },
                              })
                            : buttonName === "Container Type"
                              ? history.push({
                                  pathname: "/master/containerType/form",
                                  state: { pk: row.pk, allDetails: row },
                                })
                              : history.push({
                                  pathname: "/master/exportCargoType/form",
                                  state: { pk: row.pk, allDetails: row },
                                })
                        }
                      >
                        {row.name ? row.name : "-"}
                      </StyledTableDataCell>
                    </StyledTableRow>
                  ))
                ) : (
                  <Grid style={{ marginTop: "35%", width: "100%" }}>
                    <Typography>No Data Found</Typography>
                  </Grid>
                )
              ) : buttonName === "Container ISO Code" ? (
                masterArray?.length > 0 ? (
                  masterArray.map((row) => (
                    <StyledTableRow key={row.pk} sx={{ cursor: "pointer" }}>
                      <StyledTableDataCell scope="row">
                        {role === "Admin" && (
                          <Checkbox id={row.pk} value={row.pk} />
                        )}
                      </StyledTableDataCell>
                      <StyledTableDataCell
                        onClick={() =>
                          (user.role === "Admin" ||
                            (user.role !== "Admin" &&
                              !Buttons.includes(buttonName))) &&
                          history.push({
                            pathname: "/master/containerTypeSizeCode/form",
                            state: { pk: row.pk, allDetails: row },
                          })
                        }
                      >
                        {row.code ? row.code : "-"}
                      </StyledTableDataCell>
                      <StyledTableDataCell
                        onClick={() =>
                          (user.role === "Admin" ||
                            (user.role !== "Admin" &&
                              !Buttons.includes(buttonName))) &&
                          history.push({
                            pathname: "/master/containerTypeSizeCode/form",
                            state: { pk: row.pk, allDetails: row },
                          })
                        }
                      >
                        {row.type ? row.type : "-"}
                      </StyledTableDataCell>
                      <StyledTableDataCell
                        onClick={() =>
                          (user.role === "Admin" ||
                            (user.role !== "Admin" &&
                              !Buttons.includes(buttonName))) &&
                          history.push({
                            pathname: "/master/containerTypeSizeCode/form",
                            state: { pk: row.pk, allDetails: row },
                          })
                        }
                      >
                        {row.size ? row.size : "-"}
                      </StyledTableDataCell>
                    </StyledTableRow>
                  ))
                ) : (
                  <Grid style={{ marginTop: "35%", width: "100%" }}>
                    <Typography>No Data Found</Typography>
                  </Grid>
                )
              ) : buttonName === "Handling Charges" ? (
                masterArray?.length > 0 ? (
                  masterArray.map((row) => (
                    <StyledTableRow key={row.pk} sx={{ cursor: "pointer" }}>
                      <StyledTableDataCell scope="row">
                        {role === "Admin" && (
                          <Checkbox id={row.pk} value={row.pk} />
                        )}
                      </StyledTableDataCell>
                      <StyledTableDataCell
                        scope="row"
                        onClick={() =>
                          (user.role === "Admin" ||
                            (user.role !== "Admin" &&
                              !Buttons.includes(buttonName))) &&
                          history.push({
                            pathname: "/master/containerHandlingCharges/form",
                            state: { pk: row.pk, allDetails: row },
                          })
                        }
                      >
                        {row.pk ? row.pk : "-"}
                      </StyledTableDataCell>
                      <StyledTableDataCell
                        onClick={() =>
                          (user.role === "Admin" ||
                            (user.role !== "Admin" &&
                              !Buttons.includes(buttonName))) &&
                          history.push({
                            pathname: "/master/containerHandlingCharges/form",
                            state: { pk: row.pk, allDetails: row },
                          })
                        }
                      >
                        {row.client ? row.client : "-"}
                      </StyledTableDataCell>
                      <StyledTableDataCell
                        onClick={() =>
                          (user.role === "Admin" ||
                            (user.role !== "Admin" &&
                              !Buttons.includes(buttonName))) &&
                          history.push({
                            pathname: "/master/containerHandlingCharges/form",
                            state: { pk: row.pk, allDetails: row },
                          })
                        }
                      >
                        {row.type ? row.type : "-"}
                      </StyledTableDataCell>
                      <StyledTableDataCell
                        onClick={() =>
                          (user.role === "Admin" ||
                            (user.role !== "Admin" &&
                              !Buttons.includes(buttonName))) &&
                          history.push({
                            pathname: "/master/containerHandlingCharges/form",
                            state: { pk: row.pk, allDetails: row },
                          })
                        }
                      >
                        {row.rate_of ? row.rate_of : "-"}
                      </StyledTableDataCell>
                      <StyledTableDataCell
                        onClick={() =>
                          (user.role === "Admin" ||
                            (user.role !== "Admin" &&
                              !Buttons.includes(buttonName))) &&
                          history.push({
                            pathname: "/master/containerHandlingCharges/form",
                            state: { pk: row.pk, allDetails: row },
                          })
                        }
                      >
                        {row.amount ? row.amount : "-"}
                      </StyledTableDataCell>
                      <StyledTableDataCell
                        onClick={() =>
                          (user.role === "Admin" ||
                            (user.role !== "Admin" &&
                              !Buttons.includes(buttonName))) &&
                          history.push({
                            pathname: "/master/containerHandlingCharges/form",
                            state: { pk: row.pk, allDetails: row },
                          })
                        }
                      >
                        {row.size ? row.size : "-"}
                      </StyledTableDataCell>
                      <StyledTableDataCell
                        onClick={() =>
                          (user.role === "Admin" ||
                            (user.role !== "Admin" &&
                              !Buttons.includes(buttonName))) &&
                          history.push({
                            pathname: "/master/containerHandlingCharges/form",
                            state: { pk: row.pk, allDetails: row },
                          })
                        }
                      >
                        {row.location ? row.location : "-"}
                      </StyledTableDataCell>
                      <StyledTableDataCell
                        onClick={() =>
                          (user.role === "Admin" ||
                            (user.role !== "Admin" &&
                              !Buttons.includes(buttonName))) &&
                          history.push({
                            pathname: "/master/containerHandlingCharges/form",
                            state: { pk: row.pk, allDetails: row },
                          })
                        }
                      >
                        {row.site ? row.site : "-"}
                      </StyledTableDataCell>
                    </StyledTableRow>
                  ))
                ) : (
                  <Grid style={{ marginTop: "35%", width: "100%" }}>
                    <Typography>No Data Found</Typography>
                  </Grid>
                )
              ) : buttonName === "Transportation Charges" ? (
                masterArray?.length > 0 ? (
                  masterArray.map((row) => (
                    <StyledTableRow key={row.pk} sx={{ cursor: "pointer" }}>
                      <StyledTableDataCell scope="row">
                        {role === "Admin" && (
                          <Checkbox id={row.pk} value={row.pk} />
                        )}
                      </StyledTableDataCell>
                      <StyledTableDataCell
                        scope="row"
                        onClick={() =>
                          (user.role === "Admin" ||
                            (user.role !== "Admin" &&
                              !Buttons.includes(buttonName))) &&
                          history.push({
                            pathname:
                              "/master/containerTransportationCharges/form",
                            state: { pk: row.pk, allDetails: row },
                          })
                        }
                      >
                        {row.pk ? row.pk : "-"}
                      </StyledTableDataCell>
                      <StyledTableDataCell
                        onClick={() =>
                          (user.role === "Admin" ||
                            (user.role !== "Admin" &&
                              !Buttons.includes(buttonName))) &&
                          history.push({
                            pathname:
                              "/master/containerTransportationCharges/form",
                            state: { pk: row.pk, allDetails: row },
                          })
                        }
                      >
                        {row.client ? row.client : "-"}
                      </StyledTableDataCell>
                      <StyledTableDataCell
                        onClick={() =>
                          (user.role === "Admin" ||
                            (user.role !== "Admin" &&
                              !Buttons.includes(buttonName))) &&
                          history.push({
                            pathname:
                              "/master/containerTransportationCharges/form",
                            state: { pk: row.pk, allDetails: row },
                          })
                        }
                      >
                        {row.type ? row.type : "-"}
                      </StyledTableDataCell>
                      <StyledTableDataCell
                        onClick={() =>
                          (user.role === "Admin" ||
                            (user.role !== "Admin" &&
                              !Buttons.includes(buttonName))) &&
                          history.push({
                            pathname:
                              "/master/containerTransportationCharges/form",
                            state: { pk: row.pk, allDetails: row },
                          })
                        }
                      >
                        {row.amount ? row.amount : "-"}
                      </StyledTableDataCell>
                      <StyledTableDataCell
                        onClick={() =>
                          (user.role === "Admin" ||
                            (user.role !== "Admin" &&
                              !Buttons.includes(buttonName))) &&
                          history.push({
                            pathname:
                              "/master/containerTransportationCharges/form",
                            state: { pk: row.pk, allDetails: row },
                          })
                        }
                      >
                        {row.size ? row.size : "-"}
                      </StyledTableDataCell>
                      <StyledTableDataCell
                        onClick={() =>
                          (user.role === "Admin" ||
                            (user.role !== "Admin" &&
                              !Buttons.includes(buttonName))) &&
                          history.push({
                            pathname:
                              "/master/containerTransportationCharges/form",
                            state: { pk: row.pk, allDetails: row },
                          })
                        }
                      >
                        {row.location ? row.location : "-"}
                      </StyledTableDataCell>
                      <StyledTableDataCell
                        onClick={() =>
                          (user.role === "Admin" ||
                            (user.role !== "Admin" &&
                              !Buttons.includes(buttonName))) &&
                          history.push({
                            pathname:
                              "/master/containerTransportationCharges/form",
                            state: { pk: row.pk, allDetails: row },
                          })
                        }
                      >
                        {row.site ? row.site : "-"}
                      </StyledTableDataCell>
                    </StyledTableRow>
                  ))
                ) : (
                  <Grid style={{ marginTop: "35%", width: "100%" }}>
                    <Typography>No Data Found</Typography>
                  </Grid>
                )
              ) : buttonName === "Ground Rent Charges" ? (
                masterArray?.length > 0 ? (
                  masterArray.map((row) => (
                    <StyledTableRow key={row.pk} sx={{ cursor: "pointer" }}>
                      <StyledTableDataCell scope="row">
                        {role === "Admin" && (
                          <Checkbox id={row.pk} value={row.pk} />
                        )}
                      </StyledTableDataCell>
                      <StyledTableDataCell
                        scope="row"
                        onClick={() =>
                          (user.role === "Admin" ||
                            (user.role !== "Admin" &&
                              !Buttons.includes(buttonName))) &&
                          history.push({
                            pathname: "/master/containerGroundRentCharges/form",
                            state: { pk: row.pk, allDetails: row },
                          })
                        }
                      >
                        {row.client_ref_code ? row.client_ref_code : "-"}
                      </StyledTableDataCell>
                      <StyledTableDataCell
                        onClick={() =>
                          (user.role === "Admin" ||
                            (user.role !== "Admin" &&
                              !Buttons.includes(buttonName))) &&
                          history.push({
                            pathname: "/master/containerGroundRentCharges/form",
                            state: { pk: row.pk, allDetails: row },
                          })
                        }
                      >
                        {row.day_1_to_30_amount ? row.day_1_to_30_amount : "-"}
                      </StyledTableDataCell>
                      <StyledTableDataCell
                        onClick={() =>
                          (user.role === "Admin" ||
                            (user.role !== "Admin" &&
                              !Buttons.includes(buttonName))) &&
                          history.push({
                            pathname: "/master/containerGroundRentCharges/form",
                            state: { pk: row.pk, allDetails: row },
                          })
                        }
                      >
                        {row.day_31_to_60_amount
                          ? row.day_31_to_60_amount
                          : "-"}
                      </StyledTableDataCell>
                      <StyledTableDataCell
                        onClick={() =>
                          (user.role === "Admin" ||
                            (user.role !== "Admin" &&
                              !Buttons.includes(buttonName))) &&
                          history.push({
                            pathname: "/master/containerGroundRentCharges/form",
                            state: { pk: row.pk, allDetails: row },
                          })
                        }
                      >
                        {row.day_61_to_90_amount
                          ? row.day_61_to_90_amount
                          : "-"}
                      </StyledTableDataCell>
                      <StyledTableDataCell
                        onClick={() =>
                          (user.role === "Admin" ||
                            (user.role !== "Admin" &&
                              !Buttons.includes(buttonName))) &&
                          history.push({
                            pathname: "/master/containerGroundRentCharges/form",
                            state: { pk: row.pk, allDetails: row },
                          })
                        }
                      >
                        {row.day_91_to_120_amount
                          ? row.day_91_to_120_amount
                          : "-"}
                      </StyledTableDataCell>
                      <StyledTableDataCell
                        onClick={() =>
                          (user.role === "Admin" ||
                            (user.role !== "Admin" &&
                              !Buttons.includes(buttonName))) &&
                          history.push({
                            pathname: "/master/containerGroundRentCharges/form",
                            state: { pk: row.pk, allDetails: row },
                          })
                        }
                      >
                        {row.day_over_120_amount
                          ? row.day_over_120_amount
                          : "-"}
                      </StyledTableDataCell>
                      <StyledTableDataCell
                        onClick={() =>
                          (user.role === "Admin" ||
                            (user.role !== "Admin" &&
                              !Buttons.includes(buttonName))) &&
                          history.push({
                            pathname: "/master/containerGroundRentCharges/form",
                            state: { pk: row.pk, allDetails: row },
                          })
                        }
                      >
                        {row.size ? row.size : "-"}
                      </StyledTableDataCell>
                      <StyledTableDataCell
                        onClick={() =>
                          (user.role === "Admin" ||
                            (user.role !== "Admin" &&
                              !Buttons.includes(buttonName))) &&
                          history.push({
                            pathname: "/master/containerGroundRentCharges/form",
                            state: { pk: row.pk, allDetails: row },
                          })
                        }
                      >
                        {row.location ? row.location : "-"}
                      </StyledTableDataCell>
                      <StyledTableDataCell
                        onClick={() =>
                          (user.role === "Admin" ||
                            (user.role !== "Admin" &&
                              !Buttons.includes(buttonName))) &&
                          history.push({
                            pathname: "/master/containerGroundRentCharges/form",
                            state: { pk: row.pk, allDetails: row },
                          })
                        }
                      >
                        {row.site ? row.site : "-"}
                      </StyledTableDataCell>
                    </StyledTableRow>
                  ))
                ) : (
                  <Grid style={{ marginTop: "35%", width: "100%" }}>
                    <Typography>No Data Found</Typography>
                  </Grid>
                )
              ) : buttonName === "Role" ? (
                masterArray?.length > 0 ? (
                  masterArray.map((row) => (
                    <StyledTableRow key={row.pk} sx={{ cursor: "pointer" }}>
                      <StyledTableDataCell scope="row">
                        {user.role === "Admin" && (
                          <Checkbox id={row.pk} value={row.pk} />
                        )}
                      </StyledTableDataCell>

                      <StyledTableDataCell
                        scope="row"
                        onClick={() =>
                          (user.role === "Admin" ||
                            (user.role !== "Admin" &&
                              !Buttons.includes(buttonName))) &&
                          history.push({
                            pathname: "/account/role/form",
                            state: { pk: row.pk, allDetails: row },
                          })
                        }
                      >
                        {row.pk ? row.pk : "-"}
                      </StyledTableDataCell>
                      <StyledTableDataCell
                        onClick={() =>
                          (user.role === "Admin" ||
                            (user.role !== "Admin" &&
                              !Buttons.includes(buttonName))) &&
                          history.push({
                            pathname: "/account/role/form",
                            state: { pk: row.pk, allDetails: row },
                          })
                        }
                      >
                        {row.name ? row.name : "-"}
                      </StyledTableDataCell>
                    </StyledTableRow>
                  ))
                ) : (
                  <Grid style={{ marginTop: "35%", width: "100%" }}>
                    <Typography>No Data Found</Typography>
                  </Grid>
                )
              ) : buttonName === "Ref Code" ? (
                masterArray?.length > 0 ? (
                  masterArray.map((row) => (
                    <StyledTableRow key={row.pk} sx={{ cursor: "pointer" }}>
                      <StyledTableDataCell scope="row">
                        {user.role === "Admin" && (
                          <Checkbox id={row.pk} value={row.pk} />
                        )}
                      </StyledTableDataCell>
                      <StyledTableDataCell
                        scope="row"
                        onClick={() =>
                          (user.role === "Admin" ||
                            (user.role !== "Admin" &&
                              !Buttons.includes(buttonName))) &&
                          history.push({
                            pathname: "/master/refcode/form",
                            state: { pk: row.pk, allDetails: row },
                          })
                        }
                      >
                        {row.pk ? row.pk : "-"}
                      </StyledTableDataCell>
                      <StyledTableDataCell
                        onClick={() =>
                          (user.role === "Admin" ||
                            (user.role !== "Admin" &&
                              !Buttons.includes(buttonName))) &&
                          history.push({
                            pathname: "/master/refcode/form",
                            state: { pk: row.pk, allDetails: row },
                          })
                        }
                      >
                        {row.ref_code ? row.ref_code : "-"}
                      </StyledTableDataCell>
                    </StyledTableRow>
                  ))
                ) : (
                  <Grid style={{ marginTop: "35%", width: "100%" }}>
                    <Typography>No Data Found</Typography>
                  </Grid>
                )
              ) : buttonName === "User" ? (
                masterArray?.length > 0 ? (
                  masterArray.map((row, index) => (
                    <StyledTableRow key={row.pk} sx={{ cursor: "pointer" }}>
                      <StyledTableDataCell scope="row">
                        {localStorage.getItem("userInfo") &&
                          JSON.parse(localStorage.getItem("userInfo"))
                            .username !== row.username &&
                          user.role === "Admin" && (
                            <Checkbox id={row.pk} value={row.pk} />
                          )}
                      </StyledTableDataCell>
                      <StyledTableDataCell
                        scope="row"
                        onClick={() =>
                          (user.role === "Admin" ||
                            (user.role !== "Admin" &&
                              !Buttons.includes(buttonName))) &&
                          history.push({
                            pathname: "/account/user/form",
                            state: { pk: row.pk, allDetails: row },
                          })
                        }
                      >
                        {index + 1 ? index + 1 : "-"}
                      </StyledTableDataCell>
                      <StyledTableDataCell
                        onClick={() =>
                          (user.role === "Admin" ||
                            (user.role !== "Admin" &&
                              !Buttons.includes(buttonName))) &&
                          history.push({
                            pathname: "/account/user/form",
                            state: { pk: row.pk, allDetails: row },
                          })
                        }
                      >
                        {row.username ? row.username : "-"}
                      </StyledTableDataCell>
                      <StyledTableDataCell
                        onClick={() =>
                          (user.role === "Admin" ||
                            (user.role !== "Admin" &&
                              !Buttons.includes(buttonName))) &&
                          history.push({
                            pathname: "/account/user/form",
                            state: { pk: row.pk, allDetails: row },
                          })
                        }
                      >
                        {row.firstname ? row.firstname : "-"}
                      </StyledTableDataCell>
                      <StyledTableDataCell
                        onClick={() =>
                          (user.role === "Admin" ||
                            (user.role !== "Admin" &&
                              !Buttons.includes(buttonName))) &&
                          history.push({
                            pathname: "/account/user/form",
                            state: { pk: row.pk, allDetails: row },
                          })
                        }
                      >
                        {row.lastname ? row.lastname : "-"}
                      </StyledTableDataCell>
                      <StyledTableDataCell
                        onClick={() =>
                          (user.role === "Admin" ||
                            (user.role !== "Admin" &&
                              !Buttons.includes(buttonName))) &&
                          history.push({
                            pathname: "/account/user/form",
                            state: { pk: row.pk, allDetails: row },
                          })
                        }
                      >
                        {row.mobile_no ? row.mobile_no : "-"}
                      </StyledTableDataCell>
                      <StyledTableDataCell
                        onClick={() =>
                          (user.role === "Admin" ||
                            (user.role !== "Admin" &&
                              !Buttons.includes(buttonName))) &&
                          history.push({
                            pathname: "/account/user/form",
                            state: { pk: row.pk, allDetails: row },
                          })
                        }
                      >
                        {row.email_id ? row.email_id : "-"}
                      </StyledTableDataCell>
                      <StyledTableDataCell
                        onClick={() =>
                          (user.role === "Admin" ||
                            (user.role !== "Admin" &&
                              !Buttons.includes(buttonName))) &&
                          history.push({
                            pathname: "/account/user/form",
                            state: { pk: row.pk, allDetails: row },
                          })
                        }
                      >
                        {row.location ? row.location : "-"}
                      </StyledTableDataCell>
                      <StyledTableDataCell
                        onClick={() =>
                          (user.role === "Admin" ||
                            (user.role !== "Admin" &&
                              !Buttons.includes(buttonName))) &&
                          history.push({
                            pathname: "/account/user/form",
                            state: { pk: row.pk, allDetails: row },
                          })
                        }
                      >
                        {row.site ? row.site : "-"}
                      </StyledTableDataCell>
                      <StyledTableDataCell
                        onClick={() =>
                          (user.role === "Admin" ||
                            (user.role !== "Admin" &&
                              !Buttons.includes(buttonName))) &&
                          history.push({
                            pathname: "/account/user/form",
                            state: { pk: row.pk, allDetails: row },
                          })
                        }
                      >
                        {row.role ? row.role : "-"}
                      </StyledTableDataCell>
                    </StyledTableRow>
                  ))
                ) : (
                  <Grid style={{ marginTop: "35%", width: "100%" }}>
                    <Typography>No Data Found</Typography>
                  </Grid>
                )
              ) : buttonName === "Client Document" ? (
                masterArray?.length > 0 ? (
                  masterArray.map((row, index) => (
                    <StyledTableRow key={row.pk} sx={{ cursor: "pointer" }}>
                      <StyledTableDataCell scope="row">
                        {role === "Admin" && (
                          <Checkbox id={row.pk} value={row.pk} />
                        )}
                      </StyledTableDataCell>
                      <StyledTableDataCell
                        scope="row"
                        onClick={() =>
                          (user.role === "Admin" ||
                            (user.role !== "Admin" &&
                              !Buttons.includes(buttonName))) &&
                          history.push({
                            pathname: "/master/clientDocument/form",
                            state: { pk: row.pk, allDetails: row },
                          })
                        }
                      >
                        {row.client ? row.client : "-"}
                      </StyledTableDataCell>
                      <StyledTableDataCell
                        onClick={() =>
                          (user.role === "Admin" ||
                            (user.role !== "Admin" &&
                              !Buttons.includes(buttonName))) &&
                          history.push({
                            pathname: "/master/clientDocument/form",
                            state: { pk: row.pk, allDetails: row },
                          })
                        }
                      >
                        {row.name ? row.name : "-"}
                      </StyledTableDataCell>
                    </StyledTableRow>
                  ))
                ) : (
                  <Grid style={{ marginTop: "35%", width: "100%" }}>
                    <Typography>No Data Found</Typography>
                  </Grid>
                )
              ) : buttonName === "Vessel Bkg No" ? (
                masterArray?.length > 0 ? (
                  masterArray.map((row) => (
                    <StyledTableRow key={row.pk} sx={{ cursor: "pointer" }}>
                      <StyledTableDataCell scope="row">
                        {role === "Admin" && (
                          <Checkbox id={row.pk} value={row.pk} />
                        )}
                      </StyledTableDataCell>
                      <StyledTableDataCell
                        scope="row"
                        onClick={() =>
                          (user.role === "Admin" ||
                            (user.role !== "Admin" &&
                              !Buttons.includes(buttonName))) &&
                          history.push({
                            pathname: "/master/vesselBkgNo/form",
                            state: { pk: row.pk, allDetails: row },
                          })
                        }
                      >
                        {row.date ? row.date : "-"}
                      </StyledTableDataCell>
                      <StyledTableDataCell
                        onClick={() =>
                          (user.role === "Admin" ||
                            (user.role !== "Admin" &&
                              !Buttons.includes(buttonName))) &&
                          history.push({
                            pathname: "/master/vesselBkgNo/form",
                            state: { pk: row.pk, allDetails: row },
                          })
                        }
                      >
                        {row.number ? row.number : "-"}
                      </StyledTableDataCell>
                      <StyledTableDataCell
                        onClick={() =>
                          (user.role === "Admin" ||
                            (user.role !== "Admin" &&
                              !Buttons.includes(buttonName))) &&
                          history.push({
                            pathname: "/master/vesselBkgNo/form",
                            state: { pk: row.pk, allDetails: row },
                          })
                        }
                      >
                        {row.location ? row.location : "-"}
                      </StyledTableDataCell>
                      <StyledTableDataCell
                        onClick={() =>
                          (user.role === "Admin" ||
                            (user.role !== "Admin" &&
                              !Buttons.includes(buttonName))) &&
                          history.push({
                            pathname: "/master/vesselBkgNo/form",
                            state: { pk: row.pk, allDetails: row },
                          })
                        }
                      >
                        {row.site ? row.site : "-"}
                      </StyledTableDataCell>
                    </StyledTableRow>
                  ))
                ) : (
                  <Grid style={{ marginTop: "35%", width: "100%" }}>
                    <Typography>No Data Found</Typography>
                  </Grid>
                )
              ) : buttonName === "Location Code Detail" ? (
                masterArray?.length > 0 ? (
                  masterArray.map((row) => (
                    <StyledTableRow key={row.pk} sx={{ cursor: "pointer" }}>
                      <StyledTableDataCell scope="row">
                        {role === "Admin" && (
                          <Checkbox id={row.pk} value={row.pk} />
                        )}
                      </StyledTableDataCell>
                      <StyledTableDataCell
                        scope="row"
                        onClick={() =>
                          (user.role === "Admin" ||
                            (user.role !== "Admin" &&
                              !Buttons.includes(buttonName))) &&
                          history.push({
                            pathname: "/master/locationCodeDetail/form",
                            state: { pk: row.pk, allDetails: row },
                          })
                        }
                      >
                        {row.name_code ? row.name_code : "-"}
                      </StyledTableDataCell>
                      <StyledTableDataCell
                        onClick={() =>
                          (user.role === "Admin" ||
                            (user.role !== "Admin" &&
                              !Buttons.includes(buttonName))) &&
                          history.push({
                            pathname: "/master/locationCodeDetail/form",
                            state: { pk: row.pk, allDetails: row },
                          })
                        }
                      >
                        {row.name ? row.name : "-"}
                      </StyledTableDataCell>
                      <StyledTableDataCell
                        onClick={() =>
                          (user.role === "Admin" ||
                            (user.role !== "Admin" &&
                              !Buttons.includes(buttonName))) &&
                          history.push({
                            pathname: "/master/locationCodeDetail/form",
                            state: { pk: row.pk, allDetails: row },
                          })
                        }
                      >
                        {row.code ? row.code : "-"}
                      </StyledTableDataCell>
                      <StyledTableDataCell
                        onClick={() =>
                          (user.role === "Admin" ||
                            (user.role !== "Admin" &&
                              !Buttons.includes(buttonName))) &&
                          history.push({
                            pathname: "/master/locationCodeDetail/form",
                            state: { pk: row.pk, allDetails: row },
                          })
                        }
                      >
                        {row.type ? row.type : "-"}
                      </StyledTableDataCell>
                      <StyledTableDataCell
                        onClick={() =>
                          (user.role === "Admin" ||
                            (user.role !== "Admin" &&
                              !Buttons.includes(buttonName))) &&
                          history.push({
                            pathname: "/master/locationCodeDetail/form",
                            state: { pk: row.pk, allDetails: row },
                          })
                        }
                      >
                        {row.location ? row.location : "-"}
                      </StyledTableDataCell>
                      <StyledTableDataCell
                        onClick={() =>
                          (user.role === "Admin" ||
                            (user.role !== "Admin" &&
                              !Buttons.includes(buttonName))) &&
                          history.push({
                            pathname: "/master/locationCodeDetail/form",
                            state: { pk: row.pk, allDetails: row },
                          })
                        }
                      >
                        {row.site ? row.site : "-"}
                      </StyledTableDataCell>
                    </StyledTableRow>
                  ))
                ) : (
                  <Grid style={{ marginTop: "35%", width: "100%" }}>
                    <Typography>No Data Found</Typography>
                  </Grid>
                )
              ) : buttonName === "Vessel Voyage Detail" ? (
                masterArray?.length > 0 ? (
                  masterArray.map((row) => (
                    <StyledTableRow key={row.pk} sx={{ cursor: "pointer" }}>
                      <StyledTableDataCell scope="row">
                        {role === "Admin" && (
                          <Checkbox id={row.pk} value={row.pk} />
                        )}
                      </StyledTableDataCell>
                      <StyledTableDataCell
                        scope="row"
                        onClick={() =>
                          (user.role === "Admin" ||
                            (user.role !== "Admin" &&
                              !Buttons.includes(buttonName))) &&
                          history.push({
                            pathname: "/master/vesselVoyageDetail/form",
                            state: { pk: row.pk, allDetails: row },
                          })
                        }
                      >
                        {row.location ? row.location : "-"}
                      </StyledTableDataCell>
                      <StyledTableDataCell
                        onClick={() =>
                          (user.role === "Admin" ||
                            (user.role !== "Admin" &&
                              !Buttons.includes(buttonName))) &&
                          history.push({
                            pathname: "/master/vesselVoyageDetail/form",
                            state: { pk: row.pk, allDetails: row },
                          })
                        }
                      >
                        {row.site ? row.site : "-"}
                      </StyledTableDataCell>
                      <StyledTableDataCell
                        onClick={() =>
                          (user.role === "Admin" ||
                            (user.role !== "Admin" &&
                              !Buttons.includes(buttonName))) &&
                          history.push({
                            pathname: "/master/vesselVoyageDetail/form",
                            state: { pk: row.pk, allDetails: row },
                          })
                        }
                      >
                        {row.booking_no ? row.booking_no : "-"}
                      </StyledTableDataCell>
                      <StyledTableDataCell
                        onClick={() =>
                          (user.role === "Admin" ||
                            (user.role !== "Admin" &&
                              !Buttons.includes(buttonName))) &&
                          history.push({
                            pathname: "/master/vesselVoyageDetail/form",
                            state: { pk: row.pk, allDetails: row },
                          })
                        }
                      >
                        {row.vessel_voyage_name ? row.vessel_voyage_name : "-"}
                      </StyledTableDataCell>
                      <StyledTableDataCell
                        onClick={() =>
                          (user.role === "Admin" ||
                            (user.role !== "Admin" &&
                              !Buttons.includes(buttonName))) &&
                          history.push({
                            pathname: "/master/vesselVoyageDetail/form",
                            state: { pk: row.pk, allDetails: row },
                          })
                        }
                      >
                        {row.vessel_name ? row.vessel_name : "-"}
                      </StyledTableDataCell>
                      <StyledTableDataCell
                        onClick={() =>
                          (user.role === "Admin" ||
                            (user.role !== "Admin" &&
                              !Buttons.includes(buttonName))) &&
                          history.push({
                            pathname: "/master/vesselVoyageDetail/form",
                            state: { pk: row.pk, allDetails: row },
                          })
                        }
                      >
                        {row.voyage_no ? row.voyage_no : "-"}
                      </StyledTableDataCell>
                    </StyledTableRow>
                  ))
                ) : (
                  <Grid style={{ marginTop: "35%", width: "100%" }}>
                    <Typography>No Data Found</Typography>
                  </Grid>
                )
              ) : buttonName === "Tariff Type" ? (
                masterArray?.length > 0 ? (
                  masterArray.map((row) => (
                    <StyledTableRow key={row.code} sx={{ cursor: "pointer" }}>
                      <StyledTableDataCell scope="row">
                        {role === "Admin" && (
                          <Checkbox id={row.pk} value={row.pk} />
                        )}
                      </StyledTableDataCell>
                      <StyledTableDataCell>
                        {row.client ? row.client : "-"}
                      </StyledTableDataCell>
                      <StyledTableDataCell>
                        {row.location ? row.location : "-"}
                      </StyledTableDataCell>
                      <StyledTableDataCell>
                        {row.site ? row.site : "-"}
                      </StyledTableDataCell>
                      <StyledTableDataCell scope="row">
                        {row.labour_rate ? row.labour_rate : "-"}
                      </StyledTableDataCell>
                    </StyledTableRow>
                  ))
                ) : (
                  <Grid style={{ marginTop: "35%", width: "100%" }}>
                    <Typography>No Data Found</Typography>
                  </Grid>
                )
              ) : buttonName === "Staff Master" ? (
                masterArray?.length > 0 ? (
                  masterArray.map((row) => (
                    <StyledTableRow key={row.pk} sx={{ cursor: "pointer" }}>
                      <StyledTableDataCell scope="row">
                        {role === "Admin" && (
                          <Checkbox id={row.pk} value={row.pk} />
                        )}
                      </StyledTableDataCell>

                      <StyledTableDataCell
                        onClick={() =>
                          (user.role === "Admin" ||
                            (user.role !== "Admin" &&
                              !Buttons.includes(buttonName))) &&
                          history.push({
                            pathname: "/master/staffMaster/form",
                            state: { pk: row.pk, allDetails: row },
                          })
                        }
                      >
                        {row.qualification ? row.qualification : "-"}
                      </StyledTableDataCell>
                      <StyledTableDataCell
                        onClick={() =>
                          (user.role === "Admin" ||
                            (user.role !== "Admin" &&
                              !Buttons.includes(buttonName))) &&
                          history.push({
                            pathname: "/master/staffMaster/form",
                            state: { pk: row.pk, allDetails: row },
                          })
                        }
                      >
                        {row.firstName ? row.firstName : "-"}
                      </StyledTableDataCell>
                      <StyledTableDataCell
                        onClick={() =>
                          (user.role === "Admin" ||
                            (user.role !== "Admin" &&
                              !Buttons.includes(buttonName))) &&
                          history.push({
                            pathname: "/master/staffMaster/form",
                            state: { pk: row.pk, allDetails: row },
                          })
                        }
                      >
                        {row.lastName ? row.lastName : "-"}
                      </StyledTableDataCell>
                      <StyledTableDataCell
                        onClick={() =>
                          (user.role === "Admin" ||
                            (user.role !== "Admin" &&
                              !Buttons.includes(buttonName))) &&
                          history.push({
                            pathname: "/master/staffMaster/form",
                            state: { pk: row.pk, allDetails: row },
                          })
                        }
                      >
                        {row.mobileNo ? row.mobileNo : "-"}
                      </StyledTableDataCell>
                      <StyledTableDataCell
                        onClick={() =>
                          (user.role === "Admin" ||
                            (user.role !== "Admin" &&
                              !Buttons.includes(buttonName))) &&
                          history.push({
                            pathname: "/master/staffMaster/form",
                            state: { pk: row.pk, allDetails: row },
                          })
                        }
                      >
                        {row.emailId ? row.emailId : "-"}
                      </StyledTableDataCell>
                      <StyledTableDataCell
                        onClick={() =>
                          (user.role === "Admin" ||
                            (user.role !== "Admin" &&
                              !Buttons.includes(buttonName))) &&
                          history.push({
                            pathname: "/master/staffMaster/form",
                            state: { pk: row.pk, allDetails: row },
                          })
                        }
                      >
                        {row.location ? row.location : "-"}
                      </StyledTableDataCell>
                      <StyledTableDataCell
                        onClick={() =>
                          (user.role === "Admin" ||
                            (user.role !== "Admin" &&
                              !Buttons.includes(buttonName))) &&
                          history.push({
                            pathname: "/master/staffMaster/form",
                            state: { pk: row.pk, allDetails: row },
                          })
                        }
                      >
                        {row.site ? row.site : "-"}
                      </StyledTableDataCell>
                      <StyledTableDataCell
                        onClick={() =>
                          (user.role === "Admin" ||
                            (user.role !== "Admin" &&
                              !Buttons.includes(buttonName))) &&
                          history.push({
                            pathname: "/master/staffMaster/form",
                            state: { pk: row.pk, allDetails: row },
                          })
                        }
                      >
                        {row.role ? row.role : "-"}
                      </StyledTableDataCell>
                    </StyledTableRow>
                  ))
                ) : (
                  <Grid style={{ marginTop: "35%", width: "100%" }}>
                    <Typography>No Data Found</Typography>
                  </Grid>
                )
              ) : buttonName === "Carrier Code" ? (
                masterArray?.length > 0 ? (
                  masterArray.map((row) => (
                    <StyledTableRow key={row.pk} sx={{ cursor: "pointer" }}>
                      <StyledTableDataCell scope="row">
                        {role === "Admin" && (
                          <Checkbox id={row.pk} value={row.pk} />
                        )}
                      </StyledTableDataCell>

                      <StyledTableDataCell
                        onClick={() =>
                          (user.role === "Admin" ||
                            (user.role !== "Admin" &&
                              !Buttons.includes(buttonName))) &&
                          history.push({
                            pathname: "/master/carrier-code/form",
                            state: { pk: row.pk, allDetails: row },
                          })
                        }
                      >
                        {row.location ? row.location : "-"}
                      </StyledTableDataCell>
                      <StyledTableDataCell
                        onClick={() =>
                          (user.role === "Admin" ||
                            (user.role !== "Admin" &&
                              !Buttons.includes(buttonName))) &&
                          history.push({
                            pathname: "/master/carrier-code/form",
                            state: { pk: row.pk, allDetails: row },
                          })
                        }
                      >
                        {row.site ? row.site : "-"}
                      </StyledTableDataCell>
                      <StyledTableDataCell
                        onClick={() =>
                          (user.role === "Admin" ||
                            (user.role !== "Admin" &&
                              !Buttons.includes(buttonName))) &&
                          history.push({
                            pathname: "/master/carrier-code/form",
                            state: { pk: row.pk, allDetails: row },
                          })
                        }
                      >
                        {row.code ? row.code : "-"}
                      </StyledTableDataCell>
                    </StyledTableRow>
                  ))
                ) : (
                  <Grid style={{ marginTop: "35%", width: "100%" }}>
                    <Typography>No Data Found</Typography>
                  </Grid>
                )
              ) : buttonName === "Line Handling Charges" ? (
                masterArray?.length > 0 ? (
                  masterArray.map((row) => (
                    <StyledTableRow key={row.pk} sx={{ cursor: "pointer" }}>
                      <StyledTableDataCell style={{ textAlign: "center" }}>
                        {row.ref_code ? row.ref_code : "-"}
                      </StyledTableDataCell>
                      <StyledTableDataCell style={{ textAlign: "center" }}>
                        {row.size_20_rate ? row.size_20_rate : "-"}
                      </StyledTableDataCell>
                      <StyledTableDataCell style={{ textAlign: "center" }}>
                        {row.size_40_rate ? row.size_40_rate : "-"}
                      </StyledTableDataCell>
                      <StyledTableDataCell style={{ textAlign: "center" }}>
                        {row.night_charge_size_20_rate
                          ? row.night_charge_size_20_rate
                          : "-"}
                      </StyledTableDataCell>
                      <StyledTableDataCell style={{ textAlign: "center" }}>
                        {row.night_charge_size_40_rate
                          ? row.night_charge_size_40_rate
                          : "-"}
                      </StyledTableDataCell>
                      <StyledTableDataCell style={{ textAlign: "center" }}>
                        <Stack
                          direction={"row"}
                          alignItems={"center"}
                          justifyContent={"center"}
                          spacing={2}
                        >
                          <Tooltip title="Edit Line Handling Charge" arrow>
                            <Button
                              size="small"
                              color="secondary"
                              variant="outlined"
                              startIcon={<EditOutlined />}
                              onClick={() => {
                                if (user.role === "Admin") {
                                  history.push(
                                    `/master/line-handling-charges/${row.pk}`,
                                  );
                                } else {
                                  notify(
                                    "Only Admin have permission to change the Line Handling Charges.",
                                    { variant: "error" },
                                  );
                                }
                              }}
                              sx={{
                                textTransform: "none",
                                borderRadius: 2,
                                fontWeight: 600,
                                minWidth: 90,
                                "&:hover": {
                                  transform: "translateY(-1px)",
                                  boxShadow: 2,
                                },
                              }}
                            >
                              Edit
                            </Button>
                          </Tooltip>
                        </Stack>
                      </StyledTableDataCell>
                    </StyledTableRow>
                  ))
                ) : (
                  <StyledTableRow sx={{ cursor: "pointer" }}>
                    <StyledTableDataCell
                      colSpan={rowArray?.length}
                      sx={{
                        height: 200,
                      }}
                    >
                      <Typography sx={{ textAlign: "center" }}>
                        No Data Found
                      </Typography>
                    </StyledTableDataCell>
                  </StyledTableRow>
                )
              ) : buttonName === "Handling Charges History" ? (
                masterArray?.length > 0 ? (
                  masterArray.map((row) => (
                    <StyledTableRow key={row.pk} sx={{ cursor: "pointer" }}>
                      <StyledTableDataCell style={{ textAlign: "center" }}>
                        {row.ref_code ? row.ref_code : "-"}
                      </StyledTableDataCell>
                      <StyledTableDataCell style={{ textAlign: "center" }}>
                        {row.client_type ? row.client_type : "-"}
                      </StyledTableDataCell>
                      <StyledTableDataCell style={{ textAlign: "center" }}>
                        {row.size_20_rate ? row.size_20_rate : "-"}
                      </StyledTableDataCell>
                      <StyledTableDataCell style={{ textAlign: "center" }}>
                        {row.size_40_rate ? row.size_40_rate : "-"}
                      </StyledTableDataCell>
                      <StyledTableDataCell style={{ textAlign: "center" }}>
                        {row.night_charge_size_20_rate
                          ? row.night_charge_size_20_rate
                          : "-"}
                      </StyledTableDataCell>
                      <StyledTableDataCell style={{ textAlign: "center" }}>
                        {row.night_charge_size_40_rate
                          ? row.night_charge_size_40_rate
                          : "-"}
                      </StyledTableDataCell>
                      <StyledTableDataCell style={{ textAlign: "center" }}>
                        <Stack
                          direction={"row"}
                          alignItems={"center"}
                          justifyContent={"center"}
                          spacing={2}
                        >
                          <Tooltip title="Edit  Handling Charge History" arrow>
                            <Button
                              size="small"
                              color="secondary"
                              variant="outlined"
                              startIcon={<EditOutlined />}
                              onClick={() => {
                                if (user.role === "Admin") {
                                  history.push(
                                    `/master/handling-charges-history/${row.pk}`,
                                  );
                                } else {
                                  notify(
                                    "Only Admin have permission to change the Handling Charges History.",
                                    { variant: "error" },
                                  );
                                }
                              }}
                              sx={{
                                textTransform: "none",
                                borderRadius: 2,
                                fontWeight: 600,
                                minWidth: 90,
                                "&:hover": {
                                  transform: "translateY(-1px)",
                                  boxShadow: 2,
                                },
                              }}
                            >
                              Edit
                            </Button>
                          </Tooltip>
                        </Stack>
                      </StyledTableDataCell>
                    </StyledTableRow>
                  ))
                ) : (
                  <StyledTableRow sx={{ cursor: "pointer" }}>
                    <StyledTableDataCell
                      colSpan={rowArray?.length}
                      sx={{
                        height: 200,
                      }}
                    >
                      <Typography sx={{ textAlign: "center" }}>
                        No Data Found
                      </Typography>
                    </StyledTableDataCell>
                  </StyledTableRow>
                )
              ) : null}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {(buttonName === "Client" ||
        buttonName === "Client Document" ||
        buttonName === "Transporter" ||
        buttonName === "Seal Management" ||
        buttonName === "Staff Attendance" ||
        buttonName === "Handling Charges" ||
        buttonName === "Transportation Charges" ||
        buttonName === "Ground Rent Charges" ||
        buttonName === "Vessel Bkg No" ||
        buttonName === "Vessel Voyage Detail" ||
        buttonName === "Location Code Detail" ||
        buttonName === "Client" ||
        buttonName === "Transporter" ||
        buttonName === "Carrier Code") && (
        <Grid
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "flex-end",

            border: "1px solid #0000000d",
          }}
        >
          {props?.handleCustomPagination ? (
            props.handleCustomPagination
          ) : (
            <TableCustomPaginationReactTable
              total_pages={stocksAndAllotment.totalPages}
              pg_no={currentPage}
              handleInitialPage={handleInitialPage}
              handleOnPageDataChange={handleOnPageDataChange}
              handlePaginationOnChange={handlePaginationOnChange}
              next_page={stocksAndAllotment.nextPage}
              on_page_data={store.stocksAndAllotmentSearch.on_page_data}
            />
          )}
        </Grid>
      )}
      <Box mt={12} />
      <Backdrop sx={custombackDropStyle} open={isloading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </LayoutContainer>
  );
};

export default MasterListings;
