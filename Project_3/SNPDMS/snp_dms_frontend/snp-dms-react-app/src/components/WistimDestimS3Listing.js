import React, { useState, useEffect } from "react";
import { makeStyles, Typography, Grid, withStyles } from "@material-ui/core";
import { useDispatch, useSelector } from "react-redux";
import WestimDestimS3Search from "./WestimDestimS3Search";
import Pagination from "./Pagination";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import {
  getWistimDestimS3Listings,
  downloadWistimDestimS3Listings,
} from "../actions/WistimDestimS3Actions";
import { useHistory } from "react-router-dom";
import FileDownloadIcon from "@material-ui/icons/CloudDownload";

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

const WistimDestimS3Listing = (props) => {
  const dispatch = useDispatch();
  const store = useSelector((state) => state);
  const { WistimDestimS3, ui } = store;
  const history = useHistory();
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(5);

  useEffect(() => {
    let data;
    data = {
      location: localStorage.getItem("location")
        ? localStorage.getItem("location")
        : null,
      site: localStorage.getItem("site") ? localStorage.getItem("site") : null,
      type: "",
      date: { from: "", to: "" },
      pg_no: currentPage === 1 ? 1 : store.stocksAndAllotmentSearch.pg_no,
      on_page_data: 200,
    };
    dispatch(getWistimDestimS3Listings(data));
   
// eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //* Get Current Posts
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts =
    WistimDestimS3?.allWestimDestimS3Listing?.length !== 0 &&
    WistimDestimS3?.allWestimDestimS3Listing?.slice(
      indexOfFirstPost,
      indexOfLastPost
    );

  //* Change Page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const useStyles = makeStyles((theme) => ({
    pdHorizontal: {
      paddingLeft: ui.drawerOpen ? 0 : 40,
      paddingRight: ui.drawerOpen ? 0 : 40,
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
    button3: {
      background: "#ADD8E6",
      border: "1px solid #243545",
      color: "#243545",
      "&:hover": {
        cursor: "pointer",
        background: "#ADD8E6",
        border: "1px solid #243545",
        color: "#243545",
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
      name: "Sr. No",
    },
    {
      id: 2,
      name: "Date",
    },
    {
      id: 3,
      name: "Type",
    },
    {
      id: 4,
      name: "S3 File Name",
    },
    {
      id: 5,
      name: "",
    },
  ];

  return (
    <div className={classes.pdHorizontal}>
      <Grid container>
        <Grid item xs={12}>
          <WestimDestimS3Search />
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
              <Typography>Wistim Destim Repository</Typography>
            </Grid>
          </div>
          <TableContainer style={{ minHeight: 325 }} >
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
                {WistimDestimS3?.allWestimDestimS3Listing[0] !== null &&
                WistimDestimS3?.allWestimDestimS3Listing?.length > 0 ? (
                  currentPosts.map((row) => (
                    <StyledTableRow key={row.pk}>
                      <StyledTableDataCell>
                        {row.sr_no ? row.sr_no : "-"}
                      </StyledTableDataCell>
                      <StyledTableDataCell>
                        {row.date ? row.date : "-"}
                      </StyledTableDataCell>
                      <StyledTableDataCell>
                        {row.type ? row.type : "-"}
                      </StyledTableDataCell>
                      <StyledTableDataCell>
                        {row.s3_file_name ? row.s3_file_name : "-"}
                      </StyledTableDataCell>
                      <StyledTableDataCell>
                        <FileDownloadIcon
                          style={{ cursor: "pointer" }}
                          onClick={() => {
                            let req = {
                              pk: row.pk,
                              name: row.s3_file_name,
                            };
                            dispatch(
                              downloadWistimDestimS3Listings(req, history)
                            );
                          }}
                        />
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
              totalPosts={WistimDestimS3.allWestimDestimS3Listing.length}
              paginate={paginate}
            />
          </div>
        </Grid>
      </Grid>
    </div>
  );
};

export default WistimDestimS3Listing;
