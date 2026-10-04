import React, { useCallback, useEffect, useState } from "react";
import LayoutContainer from "../../components/reusableComponents/LayoutContainer";
import {
  Button,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  makeStyles,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  useMediaQuery,
} from "@material-ui/core";
import AutomationSearch from "../../components/reusableComponents/AutomationSearch";
import { useSnackbar } from "notistack";
import { useDispatch, useSelector } from "react-redux";
import PreviousIcon from "@material-ui/icons/ArrowBack";
import NextIcon from "@material-ui/icons/ArrowForward";
import ReplayIcon from "@mui/icons-material/Replay";
import {
  downloadMasterStockAction,
  procurementMasterStockAction,
} from "../../actions/Procurement/procurementAction";
import DownloadIcon from "@mui/icons-material/Download";
import CustomHeading from "../../components/CustomHeading";

const useStyles = makeStyles((theme) => ({
  radioLabel: {
    "& .MuiFormControlLabel-label": {
      fontSize: "12px",
    },
  },
  textField: {
    "& .MuiFormLabel-root": {
      fontSize: "12px",
    },
    "& .MuiFormLabel-root.Mui-focused": {
      fontSize: "14px",
    },
  },
  procurementTable: {
    "&::-webkit-scrollbar": {
      display: "none",
    },
  },
  selectText: {
    height: "32px",
    backgroundColor: "#f8fafb",
  },
  headingColor: {
    color: "black",
    fontSize: "12px",
  },
  addIcon: {
    backgroundColor: "#2c036a",
    borderRadius: "4px",
    color: "white",
  },
  inputDate: {
    fontSize: 12,
    padding: 8,
    backgroundColor: "#fff",
  },
  textFieldDate: {
    backgroundColor: "#f8fafb",
    "& .MuiOutlinedInput-root": {
      backgroundColor: "#f8fafb",
      "& fieldset": {
        backgroundColor: "#f8fafb",
        borderColor: "#b3b4b8",
      },
    },
  },
  dialogContainer: {
    "& .MuiPaper-root": {
      backgroundColor: "white",
    },
  },
  inputProcess: {
    marginLeft: theme.spacing(1),
    flex: 1,
    width: "32px",
    fontSize: "0.8rem",
    "&.MuiInput-underline:before": {
      borderBottom: "none",
    },
    "&.MuiInput-underline:after": {
      borderBottom: "none",
    },
    padding: "0 10px",
    [theme.breakpoints.down("xs")]: {
      padding: 1,
      fontSize: "0.8rem",
    },
  },
  approveButton: {
    backgroundColor: "#10b981",
    color: "white",
    padding: "4px 20px",
    display: "block",
    margin: "auto",
  },
  closeIcon: {
    border: "2px solid gray",
    borderRadius: "4px",
    padding: "4px",
  },
  input: {
    marginLeft: theme.spacing(1),
    flex: 1,
    padding: 7,
    width: "70px",
    borderRadius: "0px",
    borderColor: "#2a5fa5",
    fontSize: "12px",
    [theme.breakpoints.down("xs")]: {
      padding: 1,
      fontSize: "0.8rem",
    },
  },
  accordion: {
    boxShadow: "0px 0px 1px 0.1px rgba(0, 0, 0, 0.5)",
    "&::before": {
      top: 0,
      height: 1,
      content: "",
      opacity: 1,
      position: "absolute",
      right: "initial",
    },
  },
  downloadReport: {
    backgroundColor: "rgb(100,184,101)",
    color: "white",
    fontSize: "12px",
    marginBottom: "-24px",
  },
}));

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

const ProcurementMasterStock = () => {
  const classes = useStyles();
  const [searchText, setSearchText] = useState("");
  const [process, setProcess] = useState("item");
  const [currentPage, setCurrentPage] = useState(1);
  const [disable, setDisable] = useState(1);
  const notify = useSnackbar().enqueueSnackbar;
  const dispatch = useDispatch();
  const { masterStock } = useSelector((state) => state.Procurement);
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

  const prevStockPage = () => {
    setCurrentPage(Number(currentPage) - 1);
    setDisable(disable - 1);
    dispatch({
      type: "GET_ALL_MASTER_STOCKS",
      payload: {
        pg_no: Number(masterStock.pg_no) - 1,
      },
    });
    dispatch(procurementMasterStockAction(notify));
  };

  const nextStockPage = () => {
    setCurrentPage(Number(currentPage) + 1);
    setDisable(disable + 1);
    dispatch({
      type: "GET_ALL_MASTER_STOCKS",
      payload: {
        pg_no: Number(masterStock.pg_no) + 1,
      },
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
      <CustomHeading variant="body1" customClass="pageTitle">
        Procurement Master Stock
      </CustomHeading>
      <Grid container spacing={2} style={{ marginTop: "40px" }}>
        <Grid item sm={6} style={{padding:matchesIphone ?"0 12px":"0 4px"}}>
          {" "}
          <AutomationSearch
            searchText={searchText}
            handleSearchChange={handleSearchChange}
            handleSearchButton={handleSearchButton}
            handleCloseClick={handleCloseClick}
            handleSetProcess={handleSetProcess}
            procurement={true}
            process={process.split("_").join(" ")}
          >
            <FormControl variant="standard" style={{ marginTop: "-15px" }}>
              <InputLabel
                id="container_list_select_label"
                style={{
                  color: "grey",
                  zIndex: 10,
                  fontSize: "15px",
                  textAlign: "center",
                  padding: "0 10px",
                  marginTop: "-10px",
                  display: "none",
                }}
              >
                Process
              </InputLabel>
              <Select
                id="=container_list_select"
                labelId="container_list_select_label"
                name="client"
                label="Process"
                value={""}
                defaultValue={""}
                variant="standard"
                onChange={handleSetProcess}
                className={classes.inputProcess}
                inputProps={{
                  style: {
                    padding: "0px 10px",
                    marginTop: "-10px",
                    outline: "none",
                    fontSize: "12px",
                  },
                }}
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
              </Select>
            </FormControl>
          </AutomationSearch>{" "}
        </Grid>
        <Grid item sm={3}></Grid>
        {!matchesIphone && (
          <Grid item sm={2}>
            <Button
              startIcon={<DownloadIcon fontSize="small" />}
              variant="contained"
              fullWidth
              color="primary"
              className={classes.downloadReport}
              onClick={handleDownloadReport}
            >
              Download Report
            </Button>
          </Grid>
        )}
        {!matchesIphone && (
          <Grid item sm={1}>
            <IconButton onClick={handleRefreshTable}>
              <ReplayIcon style={{ fill: "rgb(36,53,69)" }} />
            </IconButton>
          </Grid>
        )}
        {matchesIphone && (
          <Grid item sm={12} style={{ textAlign: "end" ,display:"flex" ,alignItems:"baseline" ,justifyContent:"flex-end",width:"100%"}} spacing={2} >
            <Button
              startIcon={<DownloadIcon fontSize="small" />}
              variant="contained"
              
              color="primary"
              className={classes.downloadReport}
              onClick={handleDownloadReport}
            >
              Download Report
            </Button>
            <IconButton onClick={handleRefreshTable}>
              <ReplayIcon style={{ fill: "rgb(36,53,69)" }} />
            </IconButton>
          </Grid>
        )}
        <Grid
          item
          sm={12}
          style={{ marginTop: "24px", overflowX: "scroll" ,padding:matchesIphone ?"0 12px":"0 4px"}}
          className={classes.procurementTable}
        >
          <TableContainer
            component={Paper}
            style={{ borderRadius: "8px  8px 0 0" }}
            className={classes.procurementTable}
          >
            <Table
              sx={{ maxWidth: 230 }}
              className={classes.procurementTable}
              aria-label="simple table"
            >
              <TableHead>
                <TableRow style={{ backgroundColor: "#fafafa" }}>
                  {TABLE_CONST.map((val) => (
                    <TableCell>
                      <Typography
                        variant="subtitle2"
                        style={{
                          fontWeight: "700",
                          fontSize: "10px",
                          color: "gray",
                          textAlign: "center",
                        }}
                      >
                        {val === "name"
                          ? "ITEM"
                          : val.split("_").join(" ").toUpperCase()}
                      </Typography>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {masterStock.data?.map((tabledata) => (
                  <TableRow
                    key={tabledata.pk}
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    {TABLE_CONST.map((val) => (
                      <TableCell
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
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
        <Grid
          item
          sm={12}
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "8px 16px",
            margin: "0px 8px",
            marginTop: "-8px",
            backgroundColor: "#fafafa",
            borderRadius: "0 0 8px 8px",
          }}
        >
          <Button
            variant="contained"
            startIcon={<PreviousIcon />}
            color="secondary"
            onClick={prevStockPage}
            disabled={
              masterStock.pg_no === 1 || masterStock.pg_no === "1"
                ? true
                : false
            }
          >
            {!matchesIphone && "Previous"}
          </Button>

          <Grid style={{ display: "flex", alignItems: "flex-end" }}>
            <Typography variant="subtitle2" style={{ padding: "3px" }}>
              Page
            </Typography>

            <TextField
              id="basic"
              variant="outlined"
              size="small"
              inputProps={{
                className: classes.input,
                style: { width: "32px" },
              }}
              value={masterStock.pg_no}
              onChange={(e) => {
                if (e.target.value > masterStock.total_pages) {
                  notify("Invalid value entered", {
                    variant: "warning",
                  });
                } else {
                  dispatch({
                    type: "GET_ALL_MASTER_STOCKS",
                    payload: {
                      pg_no: e.target.value,
                    },
                  });
                }
              }}
              onBlur={(e) => {
                if (
                  e.target.value === "" ||
                  e.target.value === "0" ||
                  e.target.value > masterStock.total_pages
                ) {
                  notify("Invalid value entered", {
                    variant: "warning",
                  });

                  dispatch({
                    type: "GET_ALL_MASTER_STOCKS",
                    payload: {
                      pg_no: 1,
                    },
                  });
                  dispatch(procurementMasterStockAction(notify));
                } else {
                  setCurrentPage(e.target.value);
                  dispatch({
                    type: "GET_ALL_MASTER_STOCKS",
                    payload: {
                      pg_no: e.target.value,
                    },
                  });
                  dispatch(procurementMasterStockAction(notify));
                }
              }}
            />

            <Typography variant="subtitle2" style={{ padding: "3px" }}>
              of
            </Typography>

            <Typography
              variant="subtitle2"
              style={{
                padding: "3px",
                fontSize: "14px",
              }}
            >
              {masterStock.total_pages}
            </Typography>
          </Grid>
          {!matchesIphone && (
            <TextField
              id="client-master-code"
              select
              value={masterStock.on_page_data_client}
              variant="outlined"
              inputProps={{ className: classes.input }}
              onChange={(e) => {
                setCurrentPage(1);
                dispatch({
                  type: "GET_ALL_MASTER_STOCKS",
                  payload: {
                    pg_no: 1,
                    on_page_data_client: e.target.value,
                  },
                });
                dispatch(procurementMasterStockAction(notify));
              }}
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
            disabled={masterStock.next_page === "" ? true : false}
          >
            {!matchesIphone && "Next"}
          </Button>
        </Grid>
      </Grid>

      {/* Add your ProcurementMasterStock components here */}
    </LayoutContainer>
  );
};

export default ProcurementMasterStock;
