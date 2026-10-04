import {
  Box,
  CircularProgress,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  styled
} from "@mui/material";
import React, { memo } from "react";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  // Styles for header cells
  '&.MuiTableCell-head': {
    fontWeight: 600,
    backgroundColor: theme.palette.secondary.main,
    color: 'white',
    fontSize: '12px',
    textTransform: 'uppercase',
  },

  // Styles for all cells
  '&.MuiTableCell-root': {
    borderBottom: 'none',
    borderColor: 'transparent',
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  backgroundColor: 'white',
  borderRadius: 20,
  transition: 'box-shadow 0.2s ease-in-out',

  '&:hover': {
    boxShadow: '0px 3px 6px #9199A14D',
    // cursor: 'pointer', // uncomment if needed
  },
}));

const StyledTableDataCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 600,
  color: '#243545',
  fontSize: 12.5,
  borderBottom: 'none',
  padding: '10px',
  borderColor: 'transparent',
  textTransform: 'uppercase',
}));

const WISTIMAnalysisTable = ({ rowArray, masterArray, loading, distim }) => {

  return (
    <TableContainer
      style={{ minHeight: 325 }}
      sx={{
        padding: "4px",
        paddingTop: "0px",
        borderRadius: "4px",
        "&::-webkit-scrollbar": {
          height: "8px",
        },
      }}
    >
      <Table
        sx={{
          minWidth: 1200,
          width: "100%",
          overFlowX: "scroll",
          borderCollapse: "separate",
          borderSpacing: "0px 32px",
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
                <StyledTableCell key={row} style={{ textAlign: "center" }}>
                  {row.split("_").join(" ")}
                </StyledTableCell>
              ))}
          </TableRow>
        </TableHead>

        <TableBody >
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
                            size={{sm:6}}
                          
                            sx={{
                              textAlign: "center",
                              marginTop: "-40px",
                            }}
                            alignItems="center"
                          >
                            <Typography
                              variant="caption"
                              sx={{
                                fontWeight: "600",
                                color: "gray",
                                textAlign: "center",
                                textTransform: "capitalize",
                                border: "1px solid gray",
                                padding: "1px 8px",
                                borderRadius: "4px",
                              }}
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
                            size={{sm:6}}
                            
                            sx={{
                              textAlign: "center",
                              marginTop: "-40px",
                            }}
                          >
                            <Typography
                              variant="caption"
                              sx={{
                                fontWeight: "600",
                                color: "gray",
                                textAlign: "center",
                                textTransform: "capitalize",
                                border: "1px solid gray",
                                padding: "1px 8px",
                                borderRadius: "4px",
                              }}
                              style={{
                                border: "1px solid rgb(23,43,77)",
                                color: "rgb(23,43,77)",
                              }}
                            >
                              +24 hr
                            </Typography>
                          </Grid>
                        )}
                        <Grid item   size={{sm:6}}>
                          <Typography
                            variant="subtitle2"
                          
                            sx={{
                              textAlign: "center",
                            }}
                            style={{ color: "#608BC1" }}
                          >
                            {row?.["wistim_within_24_hrs"]}
                          </Typography>
                        </Grid>
                        <Grid item   size={{sm:6}}>
                          <Typography
                            variant="subtitle2"
                              sx={{
                              textAlign: "center",
                            }}
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
                            size={{sm:6}}
                            sx={{
                              textAlign: "center",
                              marginTop: "-40px",
                            }}
                            alignItems="center"
                          >
                            <Typography
                              variant="caption"
                              sx={{
                                fontWeight: "600",
                                color: "gray",
                                textAlign: "center",
                                textTransform: "capitalize",
                                border: "1px solid gray",
                                padding: "1px 8px",
                                borderRadius: "4px",
                              }}
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
                            size={{sm:6}}
                            sx={{
                              textAlign: "center",
                              marginTop: "-40px",
                            }}
                          >
                            <Typography
                              variant="caption"
                              sx={{
                                fontWeight: "600",
                                color: "gray",
                                textAlign: "center",
                                textTransform: "capitalize",
                                border: "1px solid gray",
                                padding: "1px 8px",
                                borderRadius: "4px",
                              }}
                              style={{
                                border: "1px solid rgb(23,43,77)",
                                color: "rgb(23,43,77)",
                              }}
                            >
                              + 48 hr
                            </Typography>
                          </Grid>
                        )}
                        <Grid item   size={{sm:6}}>
                          <Typography
                            variant="subtitle2"
                              sx={{
                              textAlign: "center",
                            }}
                            style={{ color: "#608BC1" }}
                          >
                            {row?.["approved_under_48_hrs"]}
                          </Typography>
                        </Grid>
                        <Grid item   size={{sm:6}}>
                          <Typography
                            variant="subtitle2"
                              sx={{
                              textAlign: "center",
                            }}
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
                            size={{sm:2}}
                            sx={{
                              textAlign: "center",
                              marginTop: "-40px",
                            }}
                            alignItems="center"
                          >
                            <Typography
                              variant="caption"
                              sx={{
                                fontWeight: "600",
                                color: "gray",
                                textAlign: "center",
                                textTransform: "capitalize",
                                border: "1px solid gray",
                                padding: "1px 8px",
                                borderRadius: "4px",
                              }}
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
                          <Grid
                            item
                            size={{sm:2}}
                            sx={{
                              textAlign: "center",
                              marginTop: "-40px",
                            }}
                          >
                            <Typography
                              variant="caption"
                              sx={{
                                fontWeight: "600",
                                color: "gray",
                                textAlign: "center",
                                textTransform: "capitalize",
                                border: "1px solid gray",
                                padding: "1px 8px",
                                borderRadius: "4px",
                              }}
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
                          <Grid
                            item
                            size={{sm:2}}
                            sx={{
                              textAlign: "center",
                              marginTop: "-40px",
                            }}
                          >
                            <Typography
                              variant="caption"
                              sx={{
                                fontWeight: "600",
                                color: "gray",
                                textAlign: "center",
                                textTransform: "capitalize",
                                border: "1px solid gray",
                                padding: "1px 8px",
                                borderRadius: "4px",
                              }}
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
                            size={{sm:2}}
                            sx={{
                              textAlign: "center",
                              marginTop: "-40px",
                            }}
                            alignItems="center"
                          >
                            <Typography
                              variant="caption"
                              sx={{
                                fontWeight: "600",
                                color: "gray",
                                textAlign: "center",
                                textTransform: "capitalize",
                                border: "1px solid gray",
                                padding: "1px 8px",
                                borderRadius: "4px",
                              }}
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
                          <Grid
                            item
                            size={{sm:2}}
                            sx={{
                              textAlign: "center",
                              marginTop: "-40px",
                            }}
                          >
                            <Typography
                              variant="caption"
                              sx={{
                                fontWeight: "600",
                                color: "gray",
                                textAlign: "center",
                                textTransform: "capitalize",
                                border: "1px solid gray",
                                padding: "1px 8px",
                                borderRadius: "4px",
                              }}
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
                          <Grid
                            item
                            size={{sm:2}}
                            sx={{
                              textAlign: "center",
                              marginTop: "-40px",
                            }}
                          >
                            <Typography
                              variant="caption"
                              sx={{
                                fontWeight: "600",
                                color: "gray",
                                textAlign: "center",
                                textTransform: "capitalize",
                                border: "1px solid gray",
                                padding: "1px 8px",
                                borderRadius: "4px",
                              }}
                              style={{
                                border: "1px solid rgb(23,43,77)",
                                color: "rgb(23,43,77)",
                              }}
                            >
                              HD +10 days
                            </Typography>
                          </Grid>
                        )}
                        <Grid item   size={{sm:2}}>
                          <Typography
                            variant="subtitle2"
                              sx={{
                              textAlign: "center",
                            }}
                            style={{ color: "#608BC1" }}
                          >
                            {row?.["repair_ld_within_3_days"]}
                          </Typography>
                        </Grid>
                        <Grid item   size={{sm:2}}>
                          <Typography
                            variant="subtitle2"
                              sx={{
                              textAlign: "center",
                            }}
                            style={{ color: "rgb(23,43,77)" }}
                          >
                            {row?.["repair_ld_above_3_days"]}
                          </Typography>
                        </Grid>
                        <Grid item   size={{sm:2}}>
                          <Typography
                            variant="subtitle2"
                              sx={{
                              textAlign: "center",
                            }}
                            style={{ color: "#608BC1" }}
                          >
                            {row?.["repair_md_within_5_days"]}
                          </Typography>
                        </Grid>
                        <Grid item   size={{sm:2}}>
                          <Typography
                            variant="subtitle2"
                              sx={{
                              textAlign: "center",
                            }}
                            style={{ color: "rgb(23,43,77)" }}
                          >
                            {row?.["repair_md_above_5_days"]}
                          </Typography>
                        </Grid>
                        <Grid item   size={{sm:2}}>
                          <Typography
                            variant="subtitle2"
                              sx={{
                              textAlign: "center",
                            }}
                            style={{ color: "#608BC1" }}
                          >
                            {row?.["repair_hd_within_10_days"]}
                          </Typography>
                        </Grid>
                        <Grid item   size={{sm:2}}>
                          <Typography
                            variant="subtitle2"
                              sx={{
                              textAlign: "center",
                            }}
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
                            size={{sm:6}}
                            sx={{
                              textAlign: "center",
                              marginTop: "-40px",
                            }}
                            alignItems="center"
                          >
                            <Typography
                              variant="caption"
                              sx={{
                                fontWeight: "600",
                                color: "gray",
                                textAlign: "center",
                                textTransform: "capitalize",
                                border: "1px solid gray",
                                padding: "1px 8px",
                                borderRadius: "4px",
                              }}
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
                          <Grid
                            item
                            size={{sm:6}}
                            sx={{
                              textAlign: "center",
                              marginTop: "-40px",
                            }}
                          >
                            <Typography
                              variant="caption"
                              sx={{
                                fontWeight: "600",
                                color: "gray",
                                textAlign: "center",
                                textTransform: "capitalize",
                                border: "1px solid gray",
                                padding: "1px 8px",
                                borderRadius: "4px",
                              }}
                              style={{
                                border: "1px solid rgb(23,43,77)",
                                color: "rgb(23,43,77)",
                              }}
                            >
                              Not Sent
                            </Typography>
                          </Grid>
                        )}
                        <Grid item   size={{sm:6}}>
                          <Typography
                            variant="subtitle2"
                              sx={{
                              textAlign: "center",
                            }}
                            style={{ color: "#608BC1" }}
                          >
                            {row?.["estimate_wistim_sent"]}
                          </Typography>
                        </Grid>
                        <Grid item   size={{sm:6}}>
                          <Typography
                            variant="subtitle2"
                              sx={{
                              textAlign: "center",
                            }}
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
                            size={{sm:6}}
                            sx={{
                              textAlign: "center",
                              marginTop: "-40px",
                            }}
                            alignItems="center"
                          >
                            <Typography
                              variant="caption"
                              sx={{
                                fontWeight: "600",
                                color: "gray",
                                textAlign: "center",
                                textTransform: "capitalize",
                                border: "1px solid gray",
                                padding: "1px 8px",
                                borderRadius: "4px",
                              }}
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
                          <Grid
                            item
                            size={{sm:6}}
                            sx={{
                              textAlign: "center",
                              marginTop: "-40px",
                            }}
                          >
                            <Typography
                              variant="caption"
                              sx={{
                                fontWeight: "600",
                                color: "gray",
                                textAlign: "center",
                                textTransform: "capitalize",
                                border: "1px solid gray",
                                padding: "1px 8px",
                                borderRadius: "4px",
                              }}
                              style={{
                                border: "1px solid rgb(23,43,77)",
                                color: "rgb(23,43,77)",
                              }}
                            >
                              Not Sent
                            </Typography>
                          </Grid>
                        )}
                        <Grid item   size={{sm:6}}>
                          <Typography
                            variant="subtitle2"
                              sx={{
                              textAlign: "center",
                            }}
                            style={{ color: "#608BC1" }}
                          >
                            {row?.["repair_distim_sent"]}
                          </Typography>
                        </Grid>
                        <Grid item   size={{sm:6}}>
                          <Typography
                            variant="subtitle2"
                              sx={{
                              textAlign: "center",
                            }}
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
                          <Grid
                            item
                            size={{sm:12}}
                            style={{
                              display: "flex ",
                              alignItems: "center",
                              justifyContent: "space-between",
                            }}
                            sx={{
                              textAlign: "center",
                              marginTop: "-48px",
                            }}
                          >
                            <Typography
                              variant="caption"
                              sx={{
                                fontWeight: "600",
                                color: "gray",
                                textAlign: "center",
                                textTransform: "capitalize",
                                border: "1px solid gray",
                                padding: "1px 8px",
                                borderRadius: "4px",
                              }}
                              style={{
                                border: "1px solid rgb(116,167,75)",
                                color: "rgb(116,167,75)",
                                height: "22px",
                              }}
                            >
                              Approved
                            </Typography>

                            <Typography
                              variant="caption"
                              sx={{
                                fontWeight: "600",
                                color: "gray",
                                textAlign: "center",
                                textTransform: "capitalize",
                                border: "1px solid gray",
                                padding: "1px 8px",
                                borderRadius: "4px",
                              }}
                              style={{
                                border: "1px solid rgb(208,160,87)",
                                color: "rgb(208,160,87)",
                                height: "22px",
                              }}
                            >
                              Partiall
                            </Typography>

                            <Typography
                              variant="caption"
                              sx={{
                                fontWeight: "600",
                                color: "gray",
                                textAlign: "center",
                                textTransform: "capitalize",
                                border: "1px solid gray",
                                padding: "1px 8px",
                                borderRadius: "4px",
                              }}
                              style={{
                                border: "1px solid rgb(58,78,105)",
                                color: "rgb(58,78,105)",
                                height: "22px",
                              }}
                            >
                              Cancelled
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                fontWeight: "600",
                                color: "gray",
                                textAlign: "center",
                                textTransform: "capitalize",
                                border: "1px solid gray",
                                padding: "1px 8px",
                                borderRadius: "4px",
                              }}
                              style={{
                                border: "1px solid rgb(185,64,27)",
                                color: "rgb(185,64,27)",
                                height: "22px",
                              }}
                            >
                              Rejected
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                fontWeight: "600",
                                color: "gray",
                                textAlign: "center",
                                textTransform: "capitalize",
                                border: "1px solid gray",
                                padding: "1px 8px",
                                borderRadius: "4px",
                              }}
                              style={{
                                border: "1px solid rgb(80,80,80)",
                                color: "rgb(80,80,80)",
                                height: "22px",
                              }}
                            >
                              No Action
                            </Typography>
                          </Grid>
                        )}

                        <Grid
                          item
                          size={{sm:12}}
                          style={{
                            display: "flex ",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <Typography
                            variant="subtitle2"
                              sx={{
                              textAlign: "center",
                            }}
                            style={{
                              color: "rgb(116,167,75)",
                              textAlign: "center",
                              width: "100%",
                            }}
                          >
                            {row?.["response_distim_approved"]}
                          </Typography>
                          <Typography
                            variant="subtitle2"
                              sx={{
                              textAlign: "center",
                            }}
                            style={{
                              color: "rgb(208,160,87)",
                              textAlign: "center",
                              width: "100%",
                            }}
                          >
                            {row?.["response_distim_partially_approved"]}
                          </Typography>
                          <Typography
                            variant="subtitle2"
                              sx={{
                              textAlign: "center",
                            }}
                            style={{
                              color: "rgb(58,78,105)",
                              textAlign: "center",
                              width: "100%",
                            }}
                          >
                            {row?.["response_distim_cancel"] ?? 0}
                          </Typography>
                          <Typography
                            variant="subtitle2"
                              sx={{
                              textAlign: "center",
                            }}
                            style={{
                              color: "rgb(185,64,27)",
                              textAlign: "center",
                              width: "100%",
                            }}
                          >
                            {row?.["response_distim_rejected"]}
                          </Typography>
                          <Typography
                            variant="subtitle2"
                              sx={{
                              textAlign: "center",
                            }}
                            style={{
                              color: "rgb(80,80,80)",
                              textAlign: "center",
                              width: "100%",
                            }}
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
        <Typography
          variant="body2"
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "300px",
            textAlign: "center",
            width: "100%",
          }}
        >
          {loading ? (
            <CircularProgress
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "300px",
                textAlign: "center",
                width: "100%",
              }}
              color="inherit"
            />
          ) : (
            "No Data Available"
          )}
        </Typography>
      )}
    </TableContainer>
  );
};

export default memo(WISTIMAnalysisTable);
