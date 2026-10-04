import React, { useCallback, useEffect, useState } from "react";
import LayoutContainer from "@components/reusablecomponents/LayoutContainer";
import {
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Grid,
  MenuItem,
  Paper,
  Stack,
  styled,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useSnackbar } from "notistack";
import { useDispatch, useSelector } from "react-redux";
import {
  downloadMasterStockAction,
  procurementMasterStockAction,
} from "../../actions/Procurement/procurementAction";
import DownloadIcon from "@mui/icons-material/Download";
import {
  TableCustomPaginationReactTable,
  TableCustomSearchBar,
  TableFootercontainer,
  TablePageTitle,
  TableRefreshIcon,
} from "@/components/TableComponent/TableComponent";
import { custombackDropStyle } from "@/utils/CustomClasses";

const TABLE_CONST = [
  "category",
  "name",
  "sku_code",
  "rate",
  "in_stock",
  "unit",
  "site",
  "location",
];

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
  border: "1px solid rgba(0,0,0,0.05)",
}));

const ProcurementMasterStock = () => {
  const [searchText, setSearchText] = useState("");
  const [process, setProcess] = useState("item");
  const notify = useSnackbar().enqueueSnackbar;
  const dispatch = useDispatch();
  const { masterStock } = useSelector((state) => state.Procurement);
  const { isloading } = useSelector((state) => state.ui);
  const matchesIphone = useMediaQuery("(max-width:500px)");

  useEffect(() => {
    dispatch(procurementMasterStockAction(notify));
  }, []);

  const handleSearchChange = useCallback(
    (e) => {
      setSearchText(e.target.value);
    },
    [searchText]
  );

  const handleSearchButton = useCallback(() => {
    dispatch({
      type: "GET_ALL_MASTER_STOCKS",
      payload: {
        category: "",
        sku_code: "",
        name: "",
      },
    });
    dispatch({
      type: "GET_ALL_MASTER_STOCKS",
      payload: {
        pg_no: 1,
        [process === "item"
          ? "name"
          : process === "category"
          ? "category"
          : process === "sku_code"
          ? "sku_code"
          : "name"]: searchText,
      },
    });
    dispatch(procurementMasterStockAction(notify));
  }, [searchText, notify, process]);

  const handleCloseClick = useCallback(() => setSearchText(""), [searchText]);

  const handleSetProcess = useCallback(
    (e) => setProcess(e.target.value),
    [process]
  );



  const handleInitialPage = () => {
    dispatch({
      type: "GET_ALL_MASTER_STOCKS",
      payload: {
        pg_no: 1,
      },
    });
    dispatch(procurementMasterStockAction(notify));
  };

  const handleOnPageDataChange = (value) => {
    dispatch({
      type: "GET_ALL_MASTER_STOCKS",
      payload: { on_page_data_client: value, pg_no: 1 },
    });
    dispatch(procurementMasterStockAction(notify));
  };

  const handlePaginationOnChange = (e, val) => {
    dispatch({
      type: "GET_ALL_MASTER_STOCKS",
      payload: { pg_no: val },
    });
    dispatch(procurementMasterStockAction(notify));
  };

  const handleRefreshTable = () => {
    dispatch({
      type: "GET_ALL_MASTER_STOCKS_INIT",
    });
    dispatch(procurementMasterStockAction(notify));
  };

  const handleDownloadReport = () => {
    dispatch(downloadMasterStockAction(notify));
  };

  return (
    <LayoutContainer footer={false}>
      <Box padding={matchesIphone ? 1 : 2}>
        <Stack
          direction={"row"}
          alignItems={"center"}
          justifyContent={"space-between"}
          mb={6}
        >
          {" "}
          <TablePageTitle> Procurement Master Stock</TablePageTitle>
        </Stack>
      </Box>

      <Grid container spacing={2}>
        <Grid
          item
          size={{ xs: 6 }}
          style={{ padding: matchesIphone ? "0 12px" : "0 4px" }}
        >
          {" "}
          <TableCustomSearchBar
            selectName={process.split("_").join(" ")}
            updateSelectname={handleSetProcess}
            searchText={searchText}
            setSearchText={handleSearchChange}
            closeClick={handleCloseClick}
            searchClick={handleSearchButton}
          >
            <MenuItem key={"item"} value="item">
              Item
            </MenuItem>
            <MenuItem key={"category"} value="category">
              Category
            </MenuItem>
            <MenuItem key={"sku_code"} value="sku_code">
              SKU code
            </MenuItem>
          </TableCustomSearchBar>
        </Grid>
        <Grid item size={{ xs: 6 }} sx={{ textAlign: "end" }}>
          <TableRefreshIcon onClick={handleRefreshTable} />
        </Grid>
        <Grid
          item
          size={{ sm: 12 }}
          style={{
            marginTop: "24px",
            overflowX: "scroll",
            padding: matchesIphone ? "0 12px" : "0 4px",
          }}
          sx={{
            "&::-webkit-scrollbar": {
              display: "none",
            },
          }}
        >
          <TableContainer
            component={Paper}
            style={{ borderRadius: "8px  8px 0 0" }}
            sx={{
              "&::-webkit-scrollbar": {
                display: "none",
              },
            }}
          >
            <Table
              sx={{
                "&::-webkit-scrollbar": {
                  display: "none",
                },
              }}
              aria-label="simple table"
            >
              <TableHead>
                <TableRow style={{ backgroundColor: "#fafafa" }}>
                  {TABLE_CONST.map((val) => (
                    <StyledTableCell>
                      <Typography
                        variant="subtitle2"
                        style={{
                          fontWeight: "700",
                          fontSize: "10px",

                          textAlign: "center",
                        }}
                      >
                        {val === "name"
                          ? "ITEM"
                          : val.split("_").join(" ").toUpperCase()}
                      </Typography>
                    </StyledTableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {masterStock.data?.map((tabledata) => (
                  <StyledTableRow key={tabledata.pk}>
                    {TABLE_CONST.map((val) => (
                      <StyledTableDataCell
                        component="th"
                        scope="row"
                        style={{
                          fontWeight: "bold",
                          textAlign: "center",
                          fontSize: "13px",
                          color:
                            val === "rate"
                              ? "rgb(51,188,153)"
                              : val === "in_stock"
                              ? "rgb(62,188,239)"
                              : "rgba(23,43,77,0.8)",
                        }}
                      >
                        {tabledata[val]}
                      </StyledTableDataCell>
                    ))}
                  </StyledTableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
        <Grid item size={{ xs: 12 }}>
          <TableCustomPaginationReactTable
            total_pages={masterStock.total_pages}
            pg_no={masterStock.pg_no}
            handlePaginationOnChange={handlePaginationOnChange}
            next_page={masterStock.next_page}
            on_page_data={masterStock.on_page_data_client}
            handleInitialPage={handleInitialPage}
            handleOnPageDataChange={handleOnPageDataChange}
          />
        </Grid>
      </Grid>
      <Box mt={12}/>
      <TableFootercontainer>
        <Button
          startIcon={<DownloadIcon fontSize="small" />}
          variant="contained"
          fullWidth
          color="primary"
          sx={{
            backgroundColor: "rgb(100,184,101)",
            color: "white",
            fontSize: "12px",
          }}
          onClick={handleDownloadReport}
        >
          Download Report
        </Button>
      </TableFootercontainer>
          <Backdrop sx={custombackDropStyle} open={isloading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </LayoutContainer>
  );
};

export default ProcurementMasterStock;
