import * as React from "react";
import PropTypes from "prop-types";
import { useTheme } from "@mui/material/styles";
import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableFooter from "@mui/material/TableFooter";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import TableHead from "@mui/material/TableHead";
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";
import FirstPageIcon from "@mui/icons-material/FirstPage";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import LastPageIcon from "@mui/icons-material/LastPage";
import CircularProgress from "@mui/material/CircularProgress";
import FuseScrollbars from "@fuse/core/FuseScrollbars";
import "./style.css";
import { styled } from "@mui/material/styles";
import Tooltip, { tooltipClasses } from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
const HtmlTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: "#f5f5f9",
    color: "rgba(0, 0, 0, 0.87)",
    maxWidth: 220,
    fontSize: theme.typography.pxToRem(12),
    border: "1px solid #dadde9",
  },
}));
function TablePaginationActions(props) {
  const theme = useTheme();
  const { count, page, rowsPerPage, onPageChange } = props;

  const handleFirstPageButtonClick = (event) => {
    onPageChange(event, 0);
  };

  const handleBackButtonClick = (event) => {
    onPageChange(event, page - 1);
  };

  const handleNextButtonClick = (event) => {
    onPageChange(event, page + 1);
  };

  const handleLastPageButtonClick = (event) => {
    onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
  };

  return (
    <Box sx={{ flexShrink: 0, ml: 2.5 }}>
      <IconButton
        onClick={handleFirstPageButtonClick}
        disabled={page === 0}
        aria-label="first page"
      >
        {theme.direction === "rtl" ? <LastPageIcon /> : <FirstPageIcon />}
      </IconButton>
      <IconButton
        onClick={handleBackButtonClick}
        disabled={page === 0}
        aria-label="previous page"
      >
        {theme.direction === "rtl" ? (
          <KeyboardArrowRight />
        ) : (
          <KeyboardArrowLeft />
        )}
      </IconButton>
      <IconButton
        onClick={handleNextButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="next page"
      >
        {theme.direction === "rtl" ? (
          <KeyboardArrowLeft />
        ) : (
          <KeyboardArrowRight />
        )}
      </IconButton>
      <IconButton
        onClick={handleLastPageButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="last page"
      >
        {theme.direction === "rtl" ? <FirstPageIcon /> : <LastPageIcon />}
      </IconButton>
    </Box>
  );
}

TablePaginationActions.propTypes = {
  count: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
};

function datatable(props) {
  const { tableHeader, tableData, colSpan, isLoading, perPage } = props;
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState("");
  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - tableData.length) : 0;

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  useEffect(() => {
    setRowsPerPage(perPage ? perPage : 5);
  }, []);
  return (
    <TableContainer component={Paper}>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, { label: "All", value: -1 }]}
        className="shrink-0 border-t-1"
        component="div"
        count={tableData.length}
        rowsPerPage={rowsPerPage}
        page={page}
        backIconButtonProps={{
          "aria-label": "Previous Page",
        }}
        nextIconButtonProps={{
          "aria-label": "Next Page",
        }}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
      <FuseScrollbars className="grow overflow-x-auto">
        <Table
          sx={{ minWidth: 500 }}
          aria-label="custom pagination table"
          size="small"
        >
          <TableHead>
            <TableRow>
              {tableHeader.map((header, index) => (
                <TableCell
                  className="text-center"
                  key={index}
                  style={{ minWidth: header.width, textAlign: header.align }}
                >
                  {header.columnHeader}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow style={{ height: 53 * emptyRows }}>
                <TableCell colSpan={colSpan} className="text-center">
                  <CircularProgress style={{ color: "rgb(34, 211, 238)" }} />
                </TableCell>
              </TableRow>
            ) : tableData.length === 0 ? (
              <TableRow className="h-40 cursor-pointer" hover>
                <TableCell className="text-center" colSpan={7} padding="none">
                  No Records Found
                </TableCell>
              </TableRow>
            ) : (
              (rowsPerPage > 0
                ? tableData.slice(
                    page * rowsPerPage,
                    page * rowsPerPage + rowsPerPage
                  )
                : tableData
              ).map((value, index) => (
                <TableRow
                  key={index}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  {tableHeader.map((item, j) => (
                    <TableCell
                      style={{ minWidth: item.width, textAlign: item.align }}
                    >
                      {item.dataFormat ? (
                        item.dataFormat(value, tableData, value[item.dataField])
                      ) : value[item.dataField] !== null ? (
                        item.dataField === "field20" ? (
                          value[item.dataField]
                            .replace(/<(.|\n)*?>/g, "")
                            .trim().length > 12 ? (
                            <>
                              <HtmlTooltip
                                title={
                                  <React.Fragment>
                                    <Typography color="inherit">
                                      {
                                        <div
                                          dangerouslySetInnerHTML={{
                                            __html: value[item.dataField],
                                          }}
                                        ></div>
                                      }
                                    </Typography>
                                  </React.Fragment>
                                }
                              >
                                {/* <div dangerouslySetInnerHTML={{ __html: value[item.dataField] }}></div> */}
                                <p>
                                  {value[item.dataField]
                                    .replace(/<(.|\n)*?>/g, "")
                                    .trim()
                                    .substring(0, 9) + "..."}
                                </p>
                              </HtmlTooltip>
                            </>
                          ) : (
                            <div
                              dangerouslySetInnerHTML={{
                                __html: value[item.dataField],
                              }}
                            ></div>
                          )
                        ) : value[item.dataField].length > 12 ? (
                          <>
                            <HtmlTooltip
                              title={
                                <React.Fragment>
                                  <Typography color="inherit">
                                    {value[item.dataField]}
                                  </Typography>
                                </React.Fragment>
                              }
                            >
                              <p>
                                {value[item.dataField].substring(0, 9) + "..."}
                              </p>
                            </HtmlTooltip>
                          </>
                        ) : (
                          value[item.dataField]
                        )
                      ) : (
                        value[item.dataField]
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </FuseScrollbars>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, { label: "All", value: -1 }]}
        className="shrink-0 border-t-1"
        component="div"
        count={tableData.length}
        rowsPerPage={rowsPerPage}
        page={page}
        backIconButtonProps={{
          "aria-label": "Previous Page",
        }}
        nextIconButtonProps={{
          "aria-label": "Next Page",
        }}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </TableContainer>
  );
}
export default datatable;
