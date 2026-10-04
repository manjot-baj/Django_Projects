import React, { useEffect, useState } from "react";
import LayoutContainer from "../../components/reusableComponents/LayoutContainer";
import ReactTable from "react-table-v6";
import "react-table-v6/react-table.css";
import {
  Button,
  Grid,
  IconButton,
  Typography,
  makeStyles,
  TextField,
  MenuItem,
  Box,
  InputBase,
  Select,
} from "@material-ui/core";
import { useDispatch, useSelector } from "react-redux";
import ReplayIcon from "@mui/icons-material/Replay";
import { Paper, Stack, useMediaQuery } from "@mui/material";
import { useSnackbar } from "notistack";
import { Link } from "react-router-dom";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import { getAllConsumeNew } from "../../actions/Procurement/consumptionAction";
import DatePickerField from "../../components/reusableComponents/DatePickerField";
import PreviousIcon from "@material-ui/icons/ArrowBack";
import NextIcon from "@material-ui/icons/ArrowForward";
import { REQ_REDUCER_CONSUME } from "../../reducers/procurement/consumptionReducer";
import { useHistory } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";

const customHeaderStyle = {
  background: "white",
  height: "40px",
  color: "#2a5fa5",
  fontSize: "1rem",
  fontWeight: "bold",
  border: "0.3px solid white",
  borderRadius: "5px",
};

const useStyles = makeStyles((theme) => ({
  paperContainer: {
    padding: theme.spacing(2, 3),
  },
  input: {
    padding: 7,
  },
  LabelTypography: {
    fontSize: 14,
    fontWeight: 600,
    color: "#243545",
    paddingBottom: 4,
    [theme.breakpoints.down("sm")]: {
      paddingBottom: 1,
    },
  },

  textField: {
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        borderColor: "#243545",
      },
    },
  },
  searchMenuItemPaper: {
    width: "20px",
    border: "none",
  
    "& .MuiPaper-root.MuiMenu-paper.MuiPopover-paper.MuiPaper-elevation8.MuiPaper-rounded":
      {
        marginTop: "123px !important",
      },
    "&:before": {
      borderBottom: "none",
    },
    "&:focus": {
      borderBottom: "none",
    },
    "&:hover": {
      borderBottom: "none",
    },
    "&:.MuiSelect-selectMenu": {
      textOverflow: "0px !important",
    },
    "& .MuiSelect-select.MuiSelect-select": {
      fontSize: "0px",
    },
    [theme.breakpoints.down("xs")]: {
      marginRight: "2px",
      marginLeft: "5px",
    },
  },
  searchButton: {
    backgroundColor: "#2A5FA5",
    color: "#fff",
    borderRadius: "0.5rem",
    padding: "1px 4px",
    height: 40,
    width: "100%",
    "&:hover": {
      backgroundColor: "#2A5FA5",
      color: "#fff",
    },
  },
}));

const Consumption = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const history = useHistory();
  const { getConsumeAllNew } = useSelector((state) => state.ProcurementConsume);
  const notify = useSnackbar().enqueueSnackbar;
  const [advance, setAdvance] = useState({
    from_date: "",
    to_date: "",
    is_approved: false,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [disable, setDisable] = useState(1);
  const [searchSelect,setSearchSelect] =useState("name")
  const matchesIphone = useMediaQuery("(max-width:450px)");

  const handleAdvanceDateFrom = (date) => {
    var selectedDate = new Date(date);
    var dd = String(selectedDate.getDate()).padStart(2, "0");
    var mm = String(selectedDate.getMonth() + 1).padStart(2, "0"); //
    var yyyy = selectedDate.getFullYear();
    var selectedDateFormat = yyyy + "-" + mm + "-" + dd;

    setAdvance((prev) => ({ ...prev, from_date: selectedDateFormat }));
    dispatch({
      type: REQ_REDUCER_CONSUME.REQ_GET_CONSUMER_ALL_NEW,
      payload: {
        from_date: selectedDateFormat,
      },
    });
    dispatch(getAllConsumeNew(notify));
  };

  const handleAdvanceDateTo = (date) => {
    var selectedDate = new Date(date);
    var dd = String(selectedDate.getDate()).padStart(2, "0");
    var mm = String(selectedDate.getMonth() + 1).padStart(2, "0"); //
    var yyyy = selectedDate.getFullYear();
    var selectedDateFormat = yyyy + "-" + mm + "-" + dd;
    setAdvance((prev) => ({ ...prev, to_date: selectedDateFormat }));
    dispatch({
      type: REQ_REDUCER_CONSUME.REQ_GET_CONSUMER_ALL_NEW,
      payload: {
        to_date: selectedDateFormat,
      },
    });
    dispatch(getAllConsumeNew(notify));
  };

  useEffect(() => {
    setCurrentPage(1);
    dispatch({
      type: REQ_REDUCER_CONSUME.REQ_GET_CONSUMER_ALL_NEW,
      payload: {
        pg_no: 1,
      },
    });
    dispatch(getAllConsumeNew(notify));
  }, []);

  const nextStockPage = () => {
    setCurrentPage(Number(currentPage) + 1);
    setDisable(disable + 1);
    dispatch({
      type: REQ_REDUCER_CONSUME.REQ_GET_CONSUMER_ALL_NEW,
      payload: {
        pg_no: Number(getConsumeAllNew.pg_no) + 1,
      },
    });
    dispatch(getAllConsumeNew(notify));
  };

  const onRowClick = (state, rowInfo, column, instance) => {
    return {
      onClick: (e) => {
        history.push({
          pathname: "/procurement/addconsumption",
          state: { original: rowInfo.original },
        });
      },
      style: {
        cursor: "pointer",
      },
    };
  };

  const prevStockPage = () => {
    setCurrentPage(Number(currentPage) - 1);
    setDisable(disable - 1);
    dispatch({
      type: REQ_REDUCER_CONSUME.REQ_GET_CONSUMER_ALL_NEW,
      payload: {
        pg_no: Number(getConsumeAllNew.pg_no) - 1,
      },
    });
    dispatch(getAllConsumeNew(notify));
  };

  return (
    <LayoutContainer footer={false}>
      <Typography
        variant="subtitle2"
        style={{
          paddingTop: 14,
          paddingBottom: 14,
          fontSize: "20px",
          color: "black",
          marginTop: 10,
          borderTopLeftRadius: 5,
          borderTopRightRadius: 5,
          borderRadius: "10px",
        }}
      >
        <Box fontWeight="fontWeightBold" m={1}>
          Tool Consumption
        </Box>
      </Typography>
      <Box>
        <Stack
          direction={"row"}
          alignItems={"center"}
          justifyContent={"space-between"}
          marginTop={"30px"}
        >
          <Grid
            container
            spacing={1}
            style={{
              flex: 0.99,
          
              alignItems: "center",
            }}
          >
             <Grid item xs={4} md={5}>
              <Paper
                component="form"
                sx={{
                  display: "flex",
                  alignItems: "center",
                }}
                style={{
                  padding: "1px 10px 1px 10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  height: 40,
                  borderRadius: "4px",
                  flex: 4,
                }}
              >
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={searchSelect}
                  className={classes.searchMenuItemPaper}
                  onChange={(e) => setSearchSelect(e.target.value)}
                >
                  <MenuItem value={"category"}>Category</MenuItem>
                  <MenuItem value={"name"}>Item </MenuItem>
                  <MenuItem value={"consumption_no"}>Consumption No</MenuItem>
                </Select>
                <InputBase
                  sx={{  flex: 1, p: "1px 4px" }}
                  placeholder={`Search by ${searchSelect==="name"?"Item":searchSelect==="consumption_no"?"Consumption No":"Category"}`}
                  value={getConsumeAllNew?.[searchSelect]}
                  onChange={(e) => {
                    dispatch({
                      type: REQ_REDUCER_CONSUME.REQ_GET_CONSUMER_ALL_NEW,
                      payload: {
                        [searchSelect]: e.target.value,
                      },
                    });
                  }}
                  style={{width:"300px"}}
                  inputProps={{ "aria-label": "search google maps" }}
                />
                <IconButton
                  variant="contained"
                  color="secondary"
                  style={{ borderRadius: "30px" }}
                  onClick={() => dispatch(getAllConsumeNew(notify))}
                >
                  <SearchIcon />
                </IconButton>
              </Paper>
            </Grid>
            <Grid item xs={4} md={2} style={{ marginBottom: "20px" }}>
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                From Date
              </Typography>

              <DatePickerField
                dateId="iit-date"
                dateValue={advance.from_date}
                dateChange={handleAdvanceDateFrom}
                // dispatchType={"LOADEDYARD_IIT_DATE"}
              />
            </Grid>
            <Grid item xs={4} md={2} style={{ marginBottom: "20px" }}>
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                To Date
              </Typography>

              <DatePickerField
                dateId="iit-date"
                dateValue={advance.to_date}
                dateChange={handleAdvanceDateTo}
              />
            </Grid>
           
            {!matchesIphone && (
              <Grid item xs={3} style={{display:"flex",justifyContent:"flex-end"}}>
                <Link
                  to="/procurement/addconsumption"
                  state={{ original: null }}
                  style={{ flex: 0.5, marginTop: "10px"}}
                >
                  <Button
                    variant="outlined"
                    color="secondary"
                    fullWidth
                    startIcon={<AddShoppingCartIcon />}
                    style={{
                      backgroundColor: "#2a5fa5",
                      borderRadius: "4px",
                      color: "white",
                      boxShadow: "2px 2px 2px white",
                      border: "none",
                      fontWeight: "bold",
                      width:"150px",
                   
                    }}
                  >
                    Consume
                  </Button>
                </Link>
              </Grid>
            )}
          </Grid>

          {!matchesIphone && (
            <IconButton
              variant="contained"
              color="secondary"
              style={{ borderRadius: "40px", flex: 0.01 }}
              onClick={() => window.location.reload()}
            >
              <ReplayIcon color="#FDBD2Eed" />
            </IconButton>
          )}
        </Stack>
      </Box>
      {matchesIphone && (
        <Stack
          direction={"row"}
          alignItems={"center"}
          justifyContent={"flex-end"}
        >
          <Link
            to="/procurement/addconsumption"
            state={{ original: null }}
            style={{ flex: 0.5, marginTop: "10px" }}
          >
            <Button
              variant="outlined"
              color="secondary"
              fullWidth
              startIcon={<AddShoppingCartIcon />}
              style={{
                backgroundColor: "#2a5fa5",
                borderRadius: "4px",
                width:"150px",
                color: "white",
                boxShadow: "2px 2px 2px white",
                border: "none",
                fontWeight: "bold",
              }}
            >
              Consume
            </Button>
          </Link>
          <IconButton
            variant="contained"
            color="secondary"
            style={{ borderRadius: "40px", flex: 0.01 }}
            onClick={() => window.location.reload()}
          >
            <ReplayIcon color="#FDBD2Eed" />
          </IconButton>
        </Stack>
      )}

      <ReactTable
        data={getConsumeAllNew.data}
        className="procuremenTable"
        noDataText="No Tool found"
        style={{
          height: "350px",
          backgroundColor: "white",
          padding: "0 0 20px 0",
          marginBottom: "-7px",
          marginTop: "20px",
        }}
        columns={[
          {
            Header: "Consumption  No",
            accessor: "consumption_no",
            headerStyle: customHeaderStyle,
            style: {
              textAlign: "center",
              fontSize: "0.9rem",
            },
          },
          {
            Header: "Consumption  Date",
            accessor: "date",
            headerStyle: customHeaderStyle,
            style: {
              textAlign: "center",
              fontSize: "0.9rem",
            },
          },
        ]}
        collapseOnDataChange={false}
        showPagination={false}
        getTrProps={onRowClick}
        defaultPageSize={getConsumeAllNew.edit_on_page_data}
        pageSize={Number(getConsumeAllNew.edit_on_page_data)}
      />
      <Grid
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          padding: 10,
          border: "1px solid #0000000d",
          marginBottom: 20,
        }}
      >
        {matchesIphone ? (
          <IconButton
            onClick={prevStockPage}
            disabled={
              getConsumeAllNew.pg_no === 1 || getConsumeAllNew.pg_no === "1"
                ? true
                : false
            }
          >
            <PreviousIcon
              style={{
                fill:
                  getConsumeAllNew.pg_no === 1 || getConsumeAllNew.pg_no === "1"
                    ? "grey"
                    : "#243545",
              }}
            />
          </IconButton>
        ) : (
          <Button
            variant="contained"
            startIcon={<PreviousIcon />}
            color="secondary"
            onClick={prevStockPage}
            disabled={
              getConsumeAllNew.pg_no === 1 || getConsumeAllNew.pg_no === "1"
                ? true
                : false
            }
          >
            Previous
          </Button>
        )}
        <Grid style={{ display: "flex", alignItems: "flex-end" }}>
          {!matchesIphone && (
            <Typography variant="subtitle2" style={{ padding: "3px" }}>
              Page
            </Typography>
          )}
          <TextField
            id="basic"
            variant="outlined"
            size="small"
            style={{ width: "50px", padding: "3px" }}
            value={currentPage}
            onChange={(e) => {
              if (e.target.value > getConsumeAllNew.total_pages) {
                notify("Invalid value entered", {
                  variant: "warning",
                });
              } else {
                setCurrentPage(e.target.value);
              }
            }}
            onBlur={(e) => {
              if (
                e.target.value === "" ||
                e.target.value === "0" ||
                e.target.value > getConsumeAllNew.total_pages
              ) {
                notify("Invalid value entered", {
                  variant: "warning",
                });
                setCurrentPage(1);
                dispatch({
                  type: REQ_REDUCER_CONSUME.REQ_GET_CONSUMER_ALL_NEW,
                  payload: {
                    pg_no: 1,
                  },
                });
                dispatch(getAllConsumeNew(notify));
              } else {
                setCurrentPage(e.target.value);
                dispatch({
                  type: REQ_REDUCER_CONSUME.REQ_GET_CONSUMER_ALL_NEW,
                  payload: {
                    pg_no: e.target.value,
                  },
                });
                dispatch(getAllConsumeNew(notify));
              }
            }}
          />
          {!matchesIphone && (
            <Typography variant="subtitle2" style={{ padding: "3px" }}>
              of
            </Typography>
          )}
          <Typography
            variant="subtitle2"
            style={{
              padding: matchesIphone ? "10px 0 10px 0" : "3px",
              fontSize: matchesIphone ? "12px" : "14px",
            }}
          >
            {getConsumeAllNew.total_pages}
          </Typography>
        </Grid>
        <TextField
          id="client-master-code"
          select
          value={getConsumeAllNew.edit_on_page_data}
          variant="outlined"
          inputProps={{ className: classes.input }}
          onChange={(e) => {
            setCurrentPage(1);
            dispatch({
              type: REQ_REDUCER_CONSUME.REQ_GET_CONSUMER_ALL_NEW,
              payload: {
                pg_no: 1,
                edit_on_page_data: e.target.value,
              },
            });
            dispatch(getAllConsumeNew(notify));
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
        {matchesIphone ? (
          <IconButton
            onClick={nextStockPage}
            disabled={getConsumeAllNew.next_page === "" ? true : false}
          >
            <NextIcon
              style={{
                fill: getConsumeAllNew.next_page === "" ? "gray" : "#243545",
              }}
            />
          </IconButton>
        ) : (
          <Button
            variant="contained"
            endIcon={<NextIcon />}
            color="secondary"
            onClick={nextStockPage}
            disabled={getConsumeAllNew.next_page === "" ? true : false}
          >
            Next
          </Button>
        )}
      </Grid>
    </LayoutContainer>
  );
};

export default Consumption;
