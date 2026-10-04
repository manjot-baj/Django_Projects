import {
  Box,
  CircularProgress,
  Grid,
  makeStyles,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  withStyles,
} from "@material-ui/core";
import React, { memo } from "react";

const useStyles = makeStyles((theme) => ({
  tableContainer: {
    padding: "4px",
    paddingTop: "0px",
    borderRadius: "4px",
    "&::-webkit-scrollbar": {
      height: "8px",
    },
  },
  tableContainerEdi: {
    marginTop: "2px",
    padding: "4px",
    paddingTop: "0px",
    borderRadius: "4px",

    "&::-webkit-scrollbar": {
      display: "none",
    },
  },
  table: {
    minWidth: 1200,
    width: "100%",
    overFlowX: "scroll",
    borderCollapse: "separate",
    borderSpacing: "0px 32px",
    borderColor: "transparent",
    backgroundColor: "transparent",
    
  },
  tableEsimate: {
    minWidth: 650,
    overFlowX: "scroll",
    borderCollapse: "separate",
    borderSpacing: "0px 32px",
    borderColor: "transparent",
    backgroundColor: "transparent",
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
  noFound: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "300px",
    textAlign: "center",
    width: "100%",
  },
  nestedHeading: {
    fontWeight: "600",
    color: "gray",
    textAlign: "center",
    textTransform: "capitalize",
    border: "1px solid gray",
    padding: "1px 8px",
    borderRadius: "4px",
  },
  nestedContainer: {
    textAlign: "center",
    marginTop: "-40px",
  },
  nestedContainerApproval:{
    textAlign: "center",
    marginTop: "-48px",
  },
  nestedContainerSecond: {
    textAlign: "center",
    marginTop: "-40px",
  },
  subPara: {
    textAlign: "center",
  },
  tableHeading: {
    fontSize: "12px",
    fontWeight: "bold",
    textAlign: "center",
  },
}));

const StyledTableCell = withStyles(() => ({
  head: {
    fontWeight: 600,
    color: "white",
    fontSize: "12px",
    textTransform: "uppercase",
    whiteSpace: "nowrap",
    backgroundColor: "#172b4d",
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
    color: "#172b4d",
    fontSize: 12.5,
    paddingLeft: "20px",
    textTransform: "uppercase",
    border: "1px solid rgba(128,128,128,0.3)",
  },
}))(TableCell);

const WISTIMAnalysisTable = ({ rowArray, masterArray, loading, distim }) => {
  const classes = useStyles();
  return (
    <TableContainer
      style={{ minHeight: 325 }}
      className={classes.tableContainer}
    >
      <Table
        className={classes.table}
        aria-label="simple table"
        stickyHeader={true}
      >
        <TableHead style={{ backgroundColor: "#243545", borderRadius: "80px" }}>
          <TableRow>
            {rowArray?.length > 0 &&
              rowArray.map((row) => (
                <StyledTableCell key={row} style={{ textAlign: "center" }}>
                  {row.split("_").join(" ")}
                </StyledTableCell>
              ))}
          </TableRow>
        </TableHead>

        <TableBody className={classes.tablebody}>
          {masterArray?.map((row, indexMaster) =>
            distim ? (
              <StyledTableRow key={row.code}>
                {rowArray?.map((data, index) =>
                  data === "gate_in" ? (
                    <StyledTableDataCell scope="row">
                      {row.gate_in_count}
                    </StyledTableDataCell>
                  ) : data === "wistim" ? (
                    <StyledTableDataCell scope="row">
                      <Grid container spacing={1}>
                        {indexMaster === 0 && (
                          <Grid
                            item
                            sm={6}
                            className={classes.nestedContainerSecond}
                            alignItems="center"
                          >
                            <Typography
                              variant="caption"
                              className={classes.nestedHeading}
                              style={{
                                border: "1px solid #608BC1",
                                color: "#608BC1",
                              }}
                            >
                              24 hr
                            </Typography>
                          </Grid>
                        )}
                        {indexMaster === 0 && (
                          <Grid
                            item
                            sm={6}
                            className={classes.nestedContainerSecond}
                          >
                            <Typography
                              variant="caption"
                              className={classes.nestedHeading}
                              style={{
                                border: "1px solid rgb(23,43,77)",
                                color: "rgb(23,43,77)",
                              }}
                            >
                              +24 hr
                            </Typography>
                          </Grid>
                        )}
                        <Grid item sm={6}>
                          <Typography
                            variant="subtitle2"
                            className={classes.subPara}
                            style={{ color: "#608BC1" }}
                          >
                            {row?.["wistim_within_24_hrs"]}
                          </Typography>
                        </Grid>
                        <Grid item sm={6}>
                          <Typography
                            variant="subtitle2"
                            className={classes.subPara}
                            style={{ color: "rgb(23,43,77)" }}
                          >
                            {row?.["wistim_above_24_hrs"]}
                          </Typography>
                        </Grid>
                      </Grid>
                    </StyledTableDataCell>
                  ) : data === "approved" ? (
                    <StyledTableDataCell scope="row">
                      <Grid container spacing={2}>
                        {indexMaster === 0 && (
                          <Grid
                            item
                            sm={6}
                            className={classes.nestedContainerSecond}
                            alignItems="center"
                          >
                            <Typography
                              variant="caption"
                              className={classes.nestedHeading}
                              style={{
                                border: "1px solid #608BC1",
                                color: "#608BC1",
                              }}
                            >
                              48 hr
                            </Typography>
                          </Grid>
                        )}
                        {indexMaster === 0 && (
                          <Grid
                            item
                            sm={6}
                            className={classes.nestedContainerSecond}
                          >
                            <Typography
                              variant="caption"
                              className={classes.nestedHeading}
                              style={{
                                border: "1px solid rgb(23,43,77)",
                                color: "rgb(23,43,77)",
                              }}
                            >
                              + 48 hr
                            </Typography>
                          </Grid>
                        )}
                        <Grid item sm={6}>
                          <Typography
                            variant="subtitle2"
                            className={classes.subPara}
                            style={{ color: "#608BC1" }}
                          >
                            {row?.["approved_under_48_hrs"]}
                          </Typography>
                        </Grid>
                        <Grid item sm={6}>
                          <Typography
                            variant="subtitle2"
                            className={classes.subPara}
                            style={{ color: "rgb(23,43,77)" }}
                          >
                            {row?.["approved_above_48_hrs"]}
                          </Typography>
                        </Grid>
                      </Grid>
                    </StyledTableDataCell>
                  ) : data === "repair" ? (
                    <StyledTableDataCell scope="row">
                      <Grid container spacing={0}>
                        {indexMaster === 0 && (
                          <Grid
                            item
                            sm={2}
                            className={classes.nestedContainer}
                            alignItems="center"
                          >
                            <Typography
                              variant="caption"
                              className={classes.nestedHeading}
                              style={{
                                border: "1px solid #608BC1",
                                color: "#608BC1",
                              }}
                            >
                              LD 3 days
                            </Typography>
                          </Grid>
                        )}
                        {indexMaster === 0 && (
                          <Grid item sm={2} className={classes.nestedContainer}>
                            <Typography
                              variant="caption"
                              className={classes.nestedHeading}
                              style={{
                                border: "1px solid rgb(23,43,77)",
                                color: "rgb(23,43,77)",
                              }}
                            >
                              LD +3 days
                            </Typography>
                          </Grid>
                        )}
                        {indexMaster === 0 && (
                          <Grid item sm={2} className={classes.nestedContainer}>
                            <Typography
                              variant="caption"
                              className={classes.nestedHeading}
                              style={{
                                border: "1px solid #608BC1",
                                color: "#608BC1",
                              }}
                            >
                              MD 5 days
                            </Typography>
                          </Grid>
                        )}
                        {indexMaster === 0 && (
                          <Grid
                            item
                            sm={2}
                            className={classes.nestedContainer}
                            alignItems="center"
                          >
                            <Typography
                              variant="caption"
                              className={classes.nestedHeading}
                              style={{
                                border: "1px solid rgb(23,43,77)",
                                color: "rgb(23,43,77)",
                              }}
                            >
                              MD +5 days
                            </Typography>
                          </Grid>
                        )}
                        {indexMaster === 0 && (
                          <Grid item sm={2} className={classes.nestedContainer}>
                            <Typography
                              variant="caption"
                              className={classes.nestedHeading}
                              style={{
                                border: "1px solid #608BC1",
                                color: "#608BC1",
                              }}
                            >
                              HD 10 days
                            </Typography>
                          </Grid>
                        )}
                        {indexMaster === 0 && (
                          <Grid item sm={2} className={classes.nestedContainer}>
                            <Typography
                              variant="caption"
                              className={classes.nestedHeading}
                              style={{
                                border: "1px solid rgb(23,43,77)",
                                color: "rgb(23,43,77)",
                              }}
                            >
                              HD +10 days
                            </Typography>
                          </Grid>
                        )}
                        <Grid item sm={2}>
                          <Typography
                            variant="subtitle2"
                            className={classes.subPara}
                            style={{ color: "#608BC1" }}
                          >
                            {row?.["repair_ld_within_3_days"]}
                          </Typography>
                        </Grid>
                        <Grid item sm={2}>
                          <Typography
                            variant="subtitle2"
                            className={classes.subPara}
                            style={{ color: "rgb(23,43,77)" }}
                          >
                            {row?.["repair_ld_above_3_days"]}
                          </Typography>
                        </Grid>
                        <Grid item sm={2}>
                          <Typography
                            variant="subtitle2"
                            className={classes.subPara}
                            style={{ color: "#608BC1" }}
                          >
                            {row?.["repair_md_within_5_days"]}
                          </Typography>
                        </Grid>
                        <Grid item sm={2}>
                          <Typography
                            variant="subtitle2"
                            className={classes.subPara}
                            style={{ color: "rgb(23,43,77)" }}
                          >
                            {row?.["repair_md_above_5_days"]}
                          </Typography>
                        </Grid>
                        <Grid item sm={2}>
                          <Typography
                            variant="subtitle2"
                            className={classes.subPara}
                            style={{ color: "#608BC1" }}
                          >
                            {row?.["repair_hd_within_10_days"]}
                          </Typography>
                        </Grid>
                        <Grid item sm={2}>
                          <Typography
                            variant="subtitle2"
                            className={classes.subPara}
                            style={{ color: "rgb(23,43,77)" }}
                          >
                            {row?.["repair_hd_above_10_days"]}
                          </Typography>
                        </Grid>
                      </Grid>
                    </StyledTableDataCell>
                  ) : (
                    <StyledTableDataCell scope="row">
                      {row[data]}
                    </StyledTableDataCell>
                  )
                )}
              </StyledTableRow>
            ) : (
              <StyledTableRow key={row.code}>
                {rowArray?.map((data, index) =>
                  data === "gate_in" ? (
                    <StyledTableDataCell scope="row">
                      {row.gate_in_count}
                    </StyledTableDataCell>
                  ) : data === "estimate_wistim" ? (
                    <StyledTableDataCell scope="row">
                      <Grid container spacing={2}>
                        {indexMaster === 0 && (
                          <Grid
                            item
                            sm={6}
                            className={classes.nestedContainer}
                            alignItems="center"
                          >
                            <Typography
                              variant="caption"
                              className={classes.nestedHeading}
                              style={{
                                border: "1px solid #608BC1",
                                color: "#608BC1",
                              }}
                            >
                              Sent
                            </Typography>
                          </Grid>
                        )}
                        {indexMaster === 0 && (
                          <Grid item sm={6} className={classes.nestedContainer}>
                            <Typography
                              variant="caption"
                              className={classes.nestedHeading}
                              style={{
                                border: "1px solid rgb(23,43,77)",
                                color: "rgb(23,43,77)",
                              }}
                            >
                              Not Sent
                            </Typography>
                          </Grid>
                        )}
                        <Grid item sm={6}>
                          <Typography
                            variant="subtitle2"
                            className={classes.subPara}
                            style={{ color: "#608BC1" }}
                          >
                            {row?.["estimate_wistim_sent"]}
                          </Typography>
                        </Grid>
                        <Grid item sm={6}>
                          <Typography
                            variant="subtitle2"
                            className={classes.subPara}
                            style={{ color: "rgb(23,43,77)" }}
                          >
                            {row?.["estimate_wistim_not_sent"]}
                          </Typography>
                        </Grid>
                      </Grid>
                    </StyledTableDataCell>
                  ) : data === "repair_distim" ? (
                    <StyledTableDataCell scope="row">
                      <Grid container spacing={2}>
                        {indexMaster === 0 && (
                          <Grid
                            item
                            sm={6}
                            className={classes.nestedContainer}
                            alignItems="center"
                          >
                            <Typography
                              variant="caption"
                              className={classes.nestedHeading}
                              style={{
                                border: "1px solid #608BC1",
                                color: "#608BC1",
                              }}
                            >
                              Sent
                            </Typography>
                          </Grid>
                        )}
                        {indexMaster === 0 && (
                          <Grid item sm={6} className={classes.nestedContainer}>
                            <Typography
                              variant="caption"
                              className={classes.nestedHeading}
                              style={{
                                border: "1px solid rgb(23,43,77)",
                                color: "rgb(23,43,77)",
                              }}
                            >
                              Not Sent
                            </Typography>
                          </Grid>
                        )}
                        <Grid item sm={6}>
                          <Typography
                            variant="subtitle2"
                            className={classes.subPara}
                            style={{ color: "#608BC1" }}
                          >
                            {row?.["repair_distim_sent"]}
                          </Typography>
                        </Grid>
                        <Grid item sm={6}>
                          <Typography
                            variant="subtitle2"
                            className={classes.subPara}
                            style={{ color: "rgb(23,43,77)" }}
                          >
                            {row?.["repair_distim_not_sent"]}
                          </Typography>
                        </Grid>
                      </Grid>
                    </StyledTableDataCell>
                  ) : data === "response_distim" ? (
                    <StyledTableDataCell scope="row">
                      <Grid container spacing={2}>
                        {indexMaster === 0 && (
                          <Grid item sm={12} style={{display:"flex ",alignItems:"center",justifyContent:"space-between"}}   className={classes.nestedContainerApproval}>
                            <Typography
                              variant="caption"
                              className={classes.nestedHeading}
                              style={{
                                border: "1px solid rgb(116,167,75)",
                                color: "rgb(116,167,75)",
                                height:"22px"
                              }}
                            >
                              Approved
                            </Typography>

                            <Typography
                              variant="caption"
                              className={classes.nestedHeading}
                              
                              style={{
                                border: "1px solid rgb(208,160,87)",
                                color: "rgb(208,160,87)",
                                height:"22px"
                              }}
                            >
                              Partiall
                            </Typography>

                            <Typography
                              variant="caption"
                              className={classes.nestedHeading}
                              style={{
                                border: "1px solid rgb(58,78,105)",
                                color: "rgb(58,78,105)",
                                    height:"22px"
                              }}
                            >
                              Cancelled
                            </Typography>
                            <Typography
                              variant="caption"
                              className={classes.nestedHeading}
                              style={{
                                border: "1px solid rgb(185,64,27)",
                                color: "rgb(185,64,27)",
                                    height:"22px"
                              }}
                            >
                              Rejected
                            </Typography>
                            <Typography
                              variant="caption"
                              className={classes.nestedHeading}
                              style={{
                                border: "1px solid rgb(80,80,80)",
                                color: "rgb(80,80,80)",
                                    height:"22px"
                              }}
                            >
                              No Action
                            </Typography>
                          </Grid>
                        )}

                        <Grid item sm={12} style={{display:"flex ",alignItems:"center",justifyContent:"space-between"}}>
                          <Typography
                            variant="subtitle2"
                            className={classes.subPara}

                            style={{ color: "rgb(116,167,75)" ,textAlign:"center",width:"100%"}}
                          >
                            {row?.["response_distim_approved"]}
                          </Typography>
                          <Typography
                            variant="subtitle2"
                            className={classes.subPara}
                            style={{ color: "rgb(208,160,87)" ,textAlign:"center",width:"100%"}}
                          >
                            {row?.["response_distim_partially_approved"]}
                          </Typography>
                          <Typography
                            variant="subtitle2"
                            className={classes.subPara}
                            style={{ color: "rgb(58,78,105)" ,textAlign:"center",width:"100%"}}
                          >
                            {row?.["response_distim_cancel"]??0}
                          </Typography>
                          <Typography
                            variant="subtitle2"
                            className={classes.subPara}
                          
                            style={{ color: "rgb(185,64,27)" ,textAlign:"center",width:"100%"}}
                          >
                            {row?.["response_distim_rejected"]}
                          </Typography>
                          <Typography
                            variant="subtitle2"
                            className={classes.subPara}
                            style={{ color: "rgb(80,80,80)" ,textAlign:"center",width:"100%"}}
                          >
                            {row?.["response_distim_no_action"]}
                          </Typography>
                        </Grid>
                      </Grid>
                    </StyledTableDataCell>
                  ) : (
                    <StyledTableDataCell scope="row">
                      {row[data]}
                    </StyledTableDataCell>
                  )
                )}
              </StyledTableRow>
            )
          )}
        </TableBody>
      </Table>
      {(masterArray?.length === 0 || loading) && (
        <Typography variant="body2" className={classes.noFound}>
          {loading ? (
            <CircularProgress className={classes.noFound} color="inherit" />
          ) : (
            "No Data Available"
          )}
        </Typography>
      )}
    </TableContainer>
  );
};

export default memo(WISTIMAnalysisTable);
