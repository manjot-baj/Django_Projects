import {
  Table,
  TableCell,
  TableContainer,
  TableHead,
  withStyles,
  makeStyles,
  TableRow,
  Typography,
  TableBody,
  CircularProgress,
  Box,
  Paper,
  Button,
} from "@material-ui/core";
import { Stack } from "@mui/material";
import React, { memo } from "react";

const useStyles = makeStyles((theme) => ({
  tableContainer: {
    marginTop: "32px",
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
    minWidth: 650,
    borderCollapse: "separate",
    borderSpacing: "0px 10px",
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
    borderBottom: "none",
    borderColor: "transparent",
    textTransform: "uppercase",
  },
}))(TableCell);

const AutomationTable = ({
  rowArray,
  masterArray,
  edi = false,
  loading = false,
  moveCode = false,
}) => {
  const classes = useStyles();

  return (
    <TableContainer
      style={{ minHeight: 325 }}
      className={edi ? classes.tableContainerEdi : classes.tableContainer}
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
                <StyledTableCell key={row} style={{textAlign: moveCode?"center":"left"}}>
                  {row.split("_").join(" ")}
                </StyledTableCell>
              ))}
          </TableRow>
        </TableHead>

        <TableBody className={classes.tablebody}>
          {masterArray?.map((row, index) => (
            <StyledTableRow key={row.code}>
              {rowArray?.map((data, index) => {
                if (data === "IN/OUT") {
                  return (
                    <Stack
                      direction={"row"}
                      flexDirection={"row"}
                      alignItems={"center"}
                      justifyContent={"flex-start"}
                      spacing={2}
                      height={"50px"}
                    >
                      <Button
                        style={{
                          backgroundColor: "#2a5fa5",
                          color: "white",
                          height: "24px",
                        }}
                        disabled={true}
                        key={index}
                      >
                        {row[data]?.split("/")[0]}
                      </Button>
                      <Typography>/</Typography>
                      <Button
                        style={{
                          backgroundColor: "#c25100",
                          color: "white",
                          height: "24px",
                        }}
                        disabled={true}
                        key={index}
                      >
                        {row[data]?.split("/")[1]}
                      </Button>
                    </Stack>
                  );
                }
                return moveCode ? (
                  data === "date" ? (
                    <StyledTableDataCell scope="row" style={{textAlign:"center"}}>
                      {row[data]}
                    </StyledTableDataCell>
                  ) : (
                    <StyledTableDataCell style={{ position: "relative" }}>
                      { Object.keys(row).length >1 && <Box padding={1} bgcolor={"#c25100"}   width={"100%"} margin={"auto"} marginLeft={0} marginBottom={2} >
                        <Stack
                          flexDirection={"row"}
                          direction={"row"}
                          alignItems={"center"}
                          justifyContent={"center"}
                          spacing={2}
                        >
                            <Typography
                            variant="subtitle2"
                            style={{
                              textTransform: "capitalize",
                              width: "50px",
                                textAlign:"center",
                                 color:"white"
                            }}
                          >
                            Total
                          </Typography>
                          <Typography
                            variant="subtitle2"
                            style={{
                              textTransform: "capitalize",
                              width: "50px",
                                textAlign:"center",
                                 color:"white"
                            }}
                          >
                            Sent
                          </Typography>
                          <Typography
                            variant="subtitle2"
                            style={{
                              textTransform: "capitalize",
                              width: "50px",
                                textAlign:"center",
                                color:"white"
                            }}
                          >
                            Waiting
                          </Typography>
                        
                        
                        </Stack>
                      </Box>}
                      { Object.keys(row)
                        .filter((val) => val !== "date")
                        .filter(value=>value === data)
                        .map((moveData, indi) => (
                          <Stack
                            flexDirection={"row"}
                            direction={"row"}
                            alignItems={"center"}
                            justifyContent={"center"}
                            spacing={2}
                          >
                            <Typography
                              variant="body2"
                              style={{
                                textTransform: "capitalize",
                                width: "50px",
                                  textAlign:"center"
                              }}
                            >
                              {" "}
                              {row[moveData].total}
                            </Typography>
                            
                            <Typography
                              variant="body2"
                              style={{
                                textTransform: "capitalize",
                                width: "50px",
                                  textAlign:"center"
                              }}
                            >
                              {" "}
                              {row[moveData].sent}
                            </Typography>
                          
                            <Typography
                              variant="body2"
                              style={{
                                textTransform: "capitalize",
                                width: "50px",
                                textAlign:"center"
                              }}
                            >
                              {" "}
                              {row[moveData].waiting}
                            </Typography>
                          </Stack>
                        ))}
                    
                    </StyledTableDataCell>
                  )
                ) : (
                  <StyledTableDataCell scope="row">
                    {row[data]}
                  </StyledTableDataCell>
                );
              })}
            </StyledTableRow>
          ))}
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


export default memo(AutomationTable);
