import {
  Table,
  TableCell,
  TableContainer,
  TableHead,
  styled,
  TableRow,
  Typography,
  TableBody,
  CircularProgress,
  Box,
  Paper,
  Button,
} from "@mui/material";
import { Stack } from "@mui/material";
import React, { memo } from "react";





const StyledTableCell = styled(TableCell)(({ theme }) => ({
  '&.MuiTableCell-head': {
    fontWeight: 600,
    color: "white",
    fontSize: "12px",
    textTransform: "uppercase",
    whiteSpace: "nowrap",
    backgroundColor: theme.palette.secondary.main
  },
  borderBottom: "none",
  borderColor: "transparent",
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  backgroundColor: "white",
  borderRadius: 20,
  "&:hover": {
    boxShadow: "0px 3px 6px #9199A14D",
  },
}));

const StyledTableDataCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 600,
  color: "#172b4d",
  fontSize: 12.5,
  paddingLeft: "20px",
  borderBottom: "none",
  borderColor: "transparent",
  textTransform: "uppercase",
}));

const AutomationTable = ({
  rowArray,
  masterArray,
  edi = false,
  loading = false,
  moveCode = false,
}) => {
 

  return (
    <TableContainer
      style={{ minHeight: 325 }}
   
      sx={(theme)=>({
        marginTop: edi?"2px": "32px",
        padding: "4px",
        paddingTop: "0px",
        borderRadius: "4px",
        "&::-webkit-scrollbar": {
          height: "8px",
          display:edi?"none":"block"
        },
      })}
    >
      <Table
        sx={{
          minWidth: 650,
          borderCollapse: "separate",
          borderSpacing: "0px 10px",
          borderColor: "transparent",
          backgroundColor: "transparent",
        }}
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

        <TableBody >
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
        <Typography variant="body2" sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "300px",
          textAlign: "center",
          width: "100%",
        }}>
          {loading ? (
            <CircularProgress sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "300px",
              textAlign: "center",
              width: "100%",
            }} color="inherit" />
          ) : (
            "No Data Available"
          )}
        </Typography>
      )}
    </TableContainer>
  );
};


export default memo(AutomationTable);
