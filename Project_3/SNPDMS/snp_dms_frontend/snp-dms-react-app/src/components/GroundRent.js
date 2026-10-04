import React, { useState, useEffect } from "react";
import {
  makeStyles,
  Typography,
  Grid,
  withStyles,
  Button,
} from "@material-ui/core";

import { useDispatch, useSelector } from "react-redux";
import GroundRentSearch from "./GroundRentSearch";

import Pagination from "./Pagination";

import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";

import Checkbox from "./reusableComponents/Checkbox";
import { useSnackbar } from "notistack";
import {
  getGroundRentBilling,
  collectInvoice,
  rejectInvoice,
} from "../actions/BillingActions";
import { useHistory } from "react-router-dom";

const StyledTableCell = withStyles(() => ({
  head: {
    fontWeight: 600,
    background: "#243545",
    color: "white",
  },
  root: {
    borderBottom: "none",
  },
}))(TableCell);

const StyledTableRow = withStyles(() => ({
  root: {
    backgroundColor: "white",
    borderRadius: 20,
    "&:hover": {
      boxShadow: "0px 3px 6px #9199A14D",
    },
  },
}))(TableRow);

const StyledTableDataCell = withStyles(() => ({
  root: {
    fontWeight: 600,
    color: "#243545",
    fontSize: 12.5,
    borderBottom: "none",
  },
}))(TableCell);

const GroundRent = (props) => {
  const dispatch = useDispatch();
  const store = useSelector((state) => state);
  const { billing, ui, clientMaster } = store;
  const history = useHistory();
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(3);
  const notify = useSnackbar().enqueueSnackbar;

  useEffect(() => {
    let data;
    data = {
      container_no: "",
      client: "MSC",
      location: localStorage.getItem("location")
        ? localStorage.getItem("location")
        : null,
      site: localStorage.getItem("site") ? localStorage.getItem("site") : null,
    };
    dispatch(getGroundRentBilling(data));
  }, []);

  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts =
    billing.allGroundRentBills.length !== 0 &&
    billing.allGroundRentBills.slice(indexOfFirstPost, indexOfLastPost);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const useStyles = makeStyles((theme) => ({
    pdHorizontal: {
      paddingLeft: ui.drawerOpen ? 0 : "160px",
      paddingRight: ui.drawerOpen ? 0 : 160,
      [theme.breakpoints.down("sm")]: {
        paddingLeft: 0,
        paddingRight: 0,
      },
    },
    button: {
      background: "lightgreen",
      border: "1px solid green",
      color: "green",
      "&:hover": {
        cursor: "pointer",
        background: "lightgreen",
        border: "1px solid green",
        color: "green",
      },
    },
    button2: {
      background: "#FFCCCB",
      border: "1px solid red",
      color: "red",
      "&:hover": {
        cursor: "pointer",
        background: "#FFCCCB",
        border: "1px solid red",
        color: "red",
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
  }));

  const classes = useStyles();

  var tableRow = [
    {
      id: 1,
      name: "",
    },
    {
      id: 2,
      name: "Client Name",
    },
    {
      id: 3,
      name: "In Date",
    },
    {
      id: 4,
      name: "Container Number",
    },
    {
      id: 5,
      name: "Size",
    },
    {
      id: 6,
      name: "Day",
    },
  ];

  const handleInvoice = () => {
    let req = {
      pk_list: clientMaster.check,
      location: localStorage.getItem("location")
        ? localStorage.getItem("location")
        : null,
      site: localStorage.getItem("site") ? localStorage.getItem("site") : null,
    };
    dispatch(collectInvoice(req, history, "ground_rent"));
  };

  const rejectInvoiceBill = () => {
    let request = {
      pk_list: clientMaster.check,
    };
    dispatch(rejectInvoice(request, notify));
  };

  return (
    <div className={classes.pdHorizontal}>
      <Grid container>
        <Grid item xs={12}>
          <GroundRentSearch />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              paddingTop: 20,
            }}
          >
            <Grid
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: 10,
                width: "100%",
              }}
            >
              <Typography>Ground Rent</Typography>
              {clientMaster.check.length !== 0 && (
                <>
                  <Button className={classes.button} onClick={handleInvoice}>
                    Collect Invoice Bills
                  </Button>
                  <Button
                    className={classes.button2}
                    onClick={rejectInvoiceBill}
                  >
                    Reject Invoice Bills
                  </Button>
                </>
              )}
            </Grid>
          </div>
          <TableContainer style={{ minHeight: 325 }}>
            <Table className={classes.table} aria-label="simple table">
              <TableHead>
                <TableRow>
                  {tableRow.length > 0 &&
                    tableRow.map((row) => (
                      <StyledTableCell key={row.id}>{row.name}</StyledTableCell>
                    ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {billing.allGroundRentBills[0] !== null &&
                billing.allGroundRentBills.length > 0 ? (
                  currentPosts.map((row) => (
                    <StyledTableRow key={row.pk}>
                      <StyledTableDataCell scope="row">
                        <Checkbox id={row.pk} value={row.pk} />
                      </StyledTableDataCell>
                      <StyledTableDataCell>
                        {row.client ? row.client : "-"}
                      </StyledTableDataCell>
                      <StyledTableDataCell>
                        {row.in_data ? row.in_data : "-"}
                      </StyledTableDataCell>
                      <StyledTableDataCell>
                        {row.container_no ? row.container_no : "-"}
                      </StyledTableDataCell>
                      <StyledTableDataCell>
                        {row.size ? row.size : "-"}
                      </StyledTableDataCell>
                      <StyledTableDataCell>
                        {row.day ? row.day : "-"}
                      </StyledTableDataCell>
                    </StyledTableRow>
                  ))
                ) : (
                  <Grid style={{ marginTop: "35%", width: "100%" }}>
                    <Typography style={{ textAlign: "right" }}>
                      No Data Found
                    </Typography>
                  </Grid>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Pagination
              postsPerPage={postsPerPage}
              totalPosts={billing.allGroundRentBills.length}
              paginate={paginate}
            />
          </div>
        </Grid>
      </Grid>
    </div>
  );
};

export default GroundRent;
