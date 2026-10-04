import React from "react";
import LayoutContainer from "./LayoutContainer";
import { useHistory } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  makeStyles,
  withStyles,
  Typography,
  Button,
  Grid,
  Fab,
  Paper,
  TextField,
  MenuItem,
} from "@material-ui/core";
import PreviousIcon from "@material-ui/icons/ArrowBack";
import NextIcon from "@material-ui/icons/ArrowForward";

// import Pagination from "../Pagination";
import Checkbox from "./Checkbox";
import ClientSearch from "../../pages/Master/Client/ClientSearch";
import SealManagementSearch from "./../../pages/Master/SealManagement/SealManagementSearch";

import CarrierCodeSearch from "../../pages/Master/CarrierCode/CarrierCodeSearch";

import ClientDocumentSearch from "../../pages/Master/ClientDocument/ClientDocumentSearch";

import TransporterSearch from "../../pages/Master/Transporter/TransporterSearch";

import VesselBkgNoSearch from "../../pages/Master/VesselBkgNo/VesselBkgNoSearch";

import VesselVoyageDetailSearch from "../../pages/Master/VesselVoyageDetail/VesselVoyageDetailSearch";

import LocationCodeDetailSearch from "../../pages/Master/LocationCodeDetail/LocationCodeDetailSearch";

import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";

import Add from "@material-ui/icons/Add";
import TariffDocumentSearch from "../../pages/Master/Tarrif/TariffDocumentSearch";
import StaffMasterSearch from "../../pages/Master/StaffMaster/StaffMasterSearch";
import ReactTable from "react-table-v6";
import "react-table-v6/react-table.css";
const phone = window.innerWidth <= 380 || "orientation" in window;

const useStyles = makeStyles((theme) => ({
  table: {
    minWidth: 650,
    borderCollapse: "separate",
    borderSpacing: "0px 10px",
    borderColor: "transparent",
    backgroundColor: "#EAF0F5",
  },
  button: {
    marginLeft: 10,
    "&:hover": {
      cursor: "pointer",
    },
  },
  [theme.breakpoints.down("xs")]: {
    "& .MuiInputBase-input": {
      width: "200px",
      fontSize: "0.8rem",
      padding: 1,
      height: 30,
    },
  },
  fab: {
    marginRight: theme.spacing(1),
    color: "#fff",
    cursor: "pointer",
    backgroundColor: "#2A5FA5",
    margin: 10,
  },
  bottom: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  downloadButton: {
    background: "lightgreen",
    boxShadow: "0px 3px 6px #9199A14D",
    cursor: "pointer",
    "&:hover": {
      background: "lightgreen",
      boxShadow: "0px 3px 6px #9199A14D",
      cursor: "pointer",
    },
  },
  paperContainer: {
    padding: theme.spacing(2, 3),
  },
  input: {
    padding: 7,
    borderColor: "black",
  },
}));

const StyledTableCell = withStyles(() => ({
  head: {
    fontWeight: 600,
    background: "#243545",
    color: "white",
    fontSize: "12px",
    textTransform: "uppercase",
  },
  root: {
    borderBottom: "none",
    borderColor: "transparent",
  },
}))(TableCell);

const StyledTableRow = withStyles(() => ({
  root: {
    backgroundColor: "white",
    borderRadius: 20,
    "&:hover": {
      boxShadow: "0px 3px 6px #9199A14D",
      // cursor: "pointer",
    },
  },
}))(TableRow);

const StyledTableDataCell = withStyles(() => ({
  root: {
    fontWeight: 600,
    color: "#243545",
    fontSize: 12.5,
    borderBottom: "none",
    padding: "10px",
    borderColor: "transparent",
    textTransform: "uppercase",
  },
}))(TableCell);

const MasterListings = (props) => {
  const {
    rowArray,
    masterArray,
    buttonName,
    buttonClick,
    deleteSelected,
    downloadSelected,
    prevStockPage,
    nextStockPage,
    handleOnRowsChange,
    changePageCount,
    currentPage
  } = props;
  const classes = useStyles();
  const history = useHistory();
  const store = useSelector((state) => state);
  const { clientMaster } = store;
  const { stocksAndAllotment, user } = store;
  const Buttons = ["Country", "Location", "Site", "Role", "User", "Ref Code"];
  let role = localStorage.getItem("userInfo")
    ? JSON.parse(localStorage.getItem("userInfo")).role
    : null;

  function FAB() {
    if (phone)
      return (
        <Fab onClick={buttonClick} className={classes.fab} color="primary">
          <Add />
        </Fab>
      );
    return (
      (user.role === "Admin" ||
        (user.role !== "Admin" && !Buttons.includes(buttonName))) && (
        <Fab
          onClick={buttonClick}
          className={classes.fab}
          variant="extended"
          color="primary"
        >
          <Add />
          &nbsp;Add New {buttonName}
        </Fab>
      )
    );
  }

  return (
    <LayoutContainer footer={false}>
      {buttonName === "Client" && <ClientSearch />}
      {buttonName === "Client Document" && <ClientDocumentSearch />}
      {buttonName === "Transporter" && <TransporterSearch />}
      {buttonName === "Vessel Bkg No" && <VesselBkgNoSearch />}
      {buttonName === "Vessel Voyage Detail" && <VesselVoyageDetailSearch />}
      {buttonName === "Location Code Detail" && <LocationCodeDetailSearch />}
      {buttonName === "Tariff Type" && <TariffDocumentSearch />}
      {buttonName === "Staff Master" && <StaffMasterSearch />}
      {buttonName === "Carrier Code" && <CarrierCodeSearch />}
      {buttonName === "Seal Management" && <SealManagementSearch />}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding:"20px 24px"
        }}
      >
        <Grid
          style={{
            display: "flex",
            alignItems: "center",
            padding: 10,
          }}
        >
          <Typography>
            Master {">"} {buttonName}
          </Typography>
          {clientMaster.check.length !== 0 && (
            <>
              <img
                src={require("../../assets/images/trash.png")}
                style={{ width: "14%" }}
                className={classes.button}
                onClick={deleteSelected}
                alt="Delete Selected Rows"
              />
              {buttonName === "Tariff Type" && (
                <Button
                  variant="contained"
                  className={classes.downloadButton}
                  onClick={downloadSelected}
                >
                  Download Tariff
                </Button>
              )}
            </>
          )}
        </Grid>
        <FAB />
      </div>

      {buttonName === "Client" || buttonName === "Transporter" ? (
        <Paper className={classes.paperContainer} elevation={0}>
          <ReactTable
            data={masterArray}
            columns={[...rowArray]}
            minRows={store.stocksAndAllotmentSearch.on_page_data}
            collapseOnDataChange={false}
            style={{
              height: "300px", // This will force the table body to overflow and scroll, since there is not enough room
            }}
            showPagination={false}
            defaultPageSize={100}
          />
        </Paper>
      ) : (
        <TableContainer style={{ minHeight: 325 }}>
          <Table className={classes.table} aria-label="simple table">
            <TableHead>
              <TableRow>
                {rowArray.length > 0 &&
                  rowArray.map((row) => (
                    <StyledTableCell key={row.id}>{row.name}</StyledTableCell>
                  ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {buttonName === "Country" ? (
                masterArray.length > 0 ? (
                  masterArray.map((row) => (
                    <StyledTableRow key={row.pk}>
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
                            pathname: "/master/country-form",
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
                            pathname: "/master/country-form",
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
                            pathname: "/master/country-form",
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
              ) : buttonName === "Location" ? (
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
                            pathname: "/master/location-form",
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
                            pathname: "/master/location-form",
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
                            pathname: "/master/location-form",
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
                            pathname: "/master/location-form",
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
                            pathname: "/master/location-form",
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
                            pathname: "/master/location-form",
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
                            pathname: "/master/location-form",
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
                            pathname: "/master/location-form",
                            state: { pk: row.pk, allDetails: row },
                          })
                        }
                      >
                        {row.gst_no ? row.gst_no : "-"}
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
                            pathname: "/master/site-form",
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
                            pathname: "/master/site-form",
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
                            pathname: "/master/site-form",
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
                            pathname: "/master/site-form",
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
                            pathname: "/master/site-form",
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
                            pathname: "/master/site-form",
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
                            pathname: "/master/site-form",
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
                            pathname: "/master/site-form",
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
                            pathname: "/master/site-form",
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
                            pathname: "/master/site-form",
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
                    <StyledTableRow key={row.pk}>
                      <StyledTableDataCell scope="row">
                        {role === "Admin" && row.is_lock === false && (
                          <Checkbox id={row.pk} value={row.pk} />
                        )}
                      </StyledTableDataCell>

                      <StyledTableDataCell
                        onClick={() =>
                          history.push({
                            pathname: "/master/sealManagement-form",
                            state: { pk: row.pk, allDetails: row },
                          })
                        }
                      >
                        {row.number ? row.number : "-"}
                      </StyledTableDataCell>
                      <StyledTableDataCell
                        onClick={() =>
                          history.push({
                            pathname: "/master/sealManagement-form",
                            state: { pk: row.pk, allDetails: row },
                          })
                        }
                      >
                        {row.container_no ? row.container_no : "-"}
                      </StyledTableDataCell>

                      <StyledTableDataCell
                        onClick={() =>
                          history.push({
                            pathname: "/master/sealManagement-form",
                            state: { pk: row.pk, allDetails: row },
                          })
                        }
                      >
                        {row.location ? row.location : "-"}
                      </StyledTableDataCell>

                      <StyledTableDataCell
                        onClick={() =>
                          history.push({
                            pathname: "/master/sealManagement-form",
                            state: { pk: row.pk, allDetails: row },
                          })
                        }
                      >
                        {row.site ? row.site : "-"}
                      </StyledTableDataCell>

                      <StyledTableDataCell
                        onClick={() =>
                          history.push({
                            pathname: "/master/sealManagement-form",
                            state: { pk: row.pk, allDetails: row },
                          })
                        }
                      >
                        {row.line ? row.line : "-"}
                      </StyledTableDataCell>

                      <StyledTableDataCell
                        onClick={() =>
                          history.push({
                            pathname: "/master/sealManagement-form",
                            state: { pk: row.pk, allDetails: row },
                          })
                        }
                      >
                        {row.in_date ? row.in_date : "-"}
                      </StyledTableDataCell>

                      <StyledTableDataCell
                        onClick={() =>
                          history.push({
                            pathname: "/master/sealManagement-form",
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
                    <StyledTableRow key={row.pk}>
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
                                pathname: "/master/container-size-form",
                                state: { pk: row.pk, allDetails: row },
                              })
                            : buttonName === "Container Type"
                            ? history.push({
                                pathname: "/master/container-type-form",
                                state: { pk: row.pk, allDetails: row },
                              })
                            : history.push({
                                pathname: "/master/export-cargo-type-form",
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
                                pathname: "/master/container-size-form",
                                state: { pk: row.pk, allDetails: row },
                              })
                            : buttonName === "Container Type"
                            ? history.push({
                                pathname: "/master/container-type-form",
                                state: { pk: row.pk, allDetails: row },
                              })
                            : history.push({
                                pathname: "/master/export-cargo-type-form",
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
                    <StyledTableRow key={row.pk}>
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
                            pathname: "/master/container-type-size-code-form",
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
                            pathname: "/master/container-type-size-code-form",
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
                            pathname: "/master/container-type-size-code-form",
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
                    <StyledTableRow key={row.pk}>
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
                            pathname: "/master/container-handling-charge-form",
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
                            pathname: "/master/container-handling-charge-form",
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
                            pathname: "/master/container-handling-charge-form",
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
                            pathname: "/master/container-handling-charge-form",
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
                            pathname: "/master/container-handling-charge-form",
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
                            pathname: "/master/container-handling-charge-form",
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
                            pathname: "/master/container-handling-charge-form",
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
                            pathname: "/master/container-handling-charge-form",
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
                    <StyledTableRow key={row.pk}>
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
                              "/master/container-transportation-charge-form",
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
                              "/master/container-transportation-charge-form",
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
                              "/master/container-transportation-charge-form",
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
                              "/master/container-transportation-charge-form",
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
                              "/master/container-transportation-charge-form",
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
                              "/master/container-transportation-charge-form",
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
                              "/master/container-transportation-charge-form",
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
                    <StyledTableRow key={row.pk}>
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
                              "/master/container-ground-rent-charge-form",
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
                            pathname:
                              "/master/container-ground-rent-charge-form",
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
                            pathname:
                              "/master/container-ground-rent-charge-form",
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
                            pathname:
                              "/master/container-ground-rent-charge-form",
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
                            pathname:
                              "/master/container-ground-rent-charge-form",
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
                            pathname:
                              "/master/container-ground-rent-charge-form",
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
                            pathname:
                              "/master/container-ground-rent-charge-form",
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
                              "/master/container-ground-rent-charge-form",
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
                              "/master/container-ground-rent-charge-form",
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
                    <StyledTableRow key={row.pk}>
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
                            pathname: "/account/role-form",
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
                            pathname: "/account/role-form",
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
                    <StyledTableRow key={row.pk}>
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
                            pathname: "/master/refcode-form",
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
                            pathname: "/master/refcode-form",
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
                    <StyledTableRow key={row.pk}>
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
                            pathname: "/account/user-form",
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
                            pathname: "/account/user-form",
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
                            pathname: "/account/user-form",
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
                            pathname: "/account/user-form",
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
                            pathname: "/account/user-form",
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
                            pathname: "/account/user-form",
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
                            pathname: "/account/user-form",
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
                            pathname: "/account/user-form",
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
                            pathname: "/account/user-form",
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
                    <StyledTableRow key={row.pk}>
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
                            pathname: "/master/client-document-form",
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
                            pathname: "/master/client-document-form",
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
                    <StyledTableRow key={row.pk}>
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
                            pathname: "/master/vessel-bkg-no-form",
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
                            pathname: "/master/vessel-bkg-no-form",
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
                            pathname: "/master/vessel-bkg-no-form",
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
                            pathname: "/master/vessel-bkg-no-form",
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
                    <StyledTableRow key={row.pk}>
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
                            pathname: "/master/location-code-detail-form",
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
                            pathname: "/master/location-code-detail-form",
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
                            pathname: "/master/location-code-detail-form",
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
                            pathname: "/master/location-code-detail-form",
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
                            pathname: "/master/location-code-detail-form",
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
                            pathname: "/master/location-code-detail-form",
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
                    <StyledTableRow key={row.pk}>
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
                            pathname: "/master/vessel-voyage-detail-form",
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
                            pathname: "/master/vessel-voyage-detail-form",
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
                            pathname: "/master/vessel-voyage-detail-form",
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
                            pathname: "/master/vessel-voyage-detail-form",
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
                            pathname: "/master/vessel-voyage-detail-form",
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
                            pathname: "/master/vessel-voyage-detail-form",
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
                    <StyledTableRow key={row.code}>
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
                    <StyledTableRow key={row.pk}>
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
                            pathname: "/master/staff-master-form",
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
                            pathname: "/master/staff-master-form",
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
                            pathname: "/master/staff-master-form",
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
                            pathname: "/master/staff-master-form",
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
                            pathname: "/master/staff-master-form",
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
                            pathname: "/master/staff-master-form",
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
                            pathname: "/master/staff-master-form",
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
                            pathname: "/master/staff-master-form",
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
                    <StyledTableRow key={row.pk}>
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
                            pathname: "/master/carrier-code-form",
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
                            pathname: "/master/carrier-code-form",
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
                            pathname: "/master/carrier-code-form",
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
              ) : null}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {(buttonName === "Client" ||
        buttonName === "Client Document" ||
        buttonName === "Transporter" ||
        buttonName === "Seal Management" ||
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
            justifyContent: "space-between",
            padding: 10,
            border: "1px solid #0000000d",
          }}
        >
          <Button
            variant="contained"
            startIcon={<PreviousIcon />}
            color="secondary"
            onClick={prevStockPage}
            disabled={stocksAndAllotment.prevPage === "" ? true : false}
          >
            Previous
          </Button>
          <Grid style={{ display: "flex", alignItems: "flex-end" }}>
            <Typography variant="subtitle2" style={{ padding: "3px" }}>
              Page
            </Typography>
            <TextField
              id="basic"
              variant="outlined"
              size="small"
              style={{ width: "50px", padding: "3px" }}
              value={currentPage}
              onChange={changePageCount}
              disabled
            />
            <Typography variant="subtitle2" style={{ padding: "3px" }}>
              of
            </Typography>
            <Typography variant="subtitle2" style={{ padding: "3px" }}>
              {stocksAndAllotment.totalPages}
            </Typography>
          </Grid>
          {(buttonName === "Client" || buttonName === "Transporter") && (
            <TextField
              id="client-master-code"
              select
              value={store.stocksAndAllotmentSearch.on_page_data}
              variant="outlined"
              inputProps={{ className: classes.input }}
              onChange={handleOnRowsChange}
            >
              <MenuItem key={"5 rows"} value={"5"}>
                {"5 rows"}
              </MenuItem>
              <MenuItem key={"10 rows"} value={"10"}>
                {"10 rows"}
              </MenuItem>
              <MenuItem key={"20 rows"} value={"20"}>
                {"20 rows"}
              </MenuItem>
              <MenuItem key={"25 rows"} value={"25"}>
                {"25 rows"}
              </MenuItem>
              <MenuItem key={"50 rows"} value={"50"}>
                {"50 rows"}
              </MenuItem>
              <MenuItem key={"100 rows"} value={"100"}>
                {"100 rows"}
              </MenuItem>
            </TextField>
          )}
          <Button
            variant="contained"
            endIcon={<NextIcon />}
            color="secondary"
            onClick={nextStockPage}
            disabled={stocksAndAllotment.nextPage === "" ? true : false}
          >
            Next
          </Button>
        </Grid>
      )}
      {/* <div className={classes.bottom}>
        {buttonName === "Client" ||
        buttonName === "Transporter" ||
        buttonName === "Staff Master" ? (
          <Pagination
            postsPerPage={paginationPostsPerPage}
            totalPosts={paginationTotalPosts}
            paginate={paginationPaginate}
          />
        ) : (
          <div />
        )}
      </div> */}
    </LayoutContainer>
  );
};

export default MasterListings;
