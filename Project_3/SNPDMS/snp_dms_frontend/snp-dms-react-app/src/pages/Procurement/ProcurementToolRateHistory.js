import React, { useCallback, useEffect, useState } from "react";
import LayoutContainer from "../../components/reusableComponents/LayoutContainer";
import {
  Box,
  Button,
  FormControl,
  Grid,
  InputLabel,
  makeStyles,
  MenuItem,
  Select,
  TextField,
  Typography,
  useMediaQuery,
} from "@material-ui/core";
import AutomationSearch from "../../components/reusableComponents/AutomationSearch";
import { procurementToolHistoryAction } from "../../actions/Procurement/procurementAction";
import { useDispatch } from "react-redux";
import { useSnackbar } from "notistack";
import AutomationTable from "../../components/reusableComponents/AutomationTable.";
import PreviousIcon from "@material-ui/icons/ArrowBack";
import NextIcon from "@material-ui/icons/ArrowForward";
import DatePickerField from "../../components/reusableComponents/DatePickerField";
import { Stack } from "@mui/material";
import { handleDateChangeUTILS } from "../../utils/WeekNumbre";
import CustomHeading from "../../components/CustomHeading";

const useStyles = makeStyles((theme) => ({
  input: {
    marginLeft: theme.spacing(1),
    flex: 1,
    padding: 7,
    [theme.breakpoints.down("xs")]: {
      padding: 1,
      fontSize: "0.8rem",
    },
  },
  inputProcess: {
    marginLeft: theme.spacing(1),
    flex: 1,
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
}));

const procurementRowArray = [
  "created_at",
  "category",
  "item",
  "modified_rate",
  "previous_rate",
  "location",
  "site",
];

const ProcurementToolRateHistory = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const notify = useSnackbar().enqueueSnackbar;
  const [searchText, setSearchText] = useState("");
  const [process, setProcess] = useState("category");
  const [data, setData] = useState([]);
  const matchesIphone = useMediaQuery("(max-width:500px)");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [onPageData, setOnPageData] = useState(5);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const handleSearchChange = useCallback(
    (e) => {
      setSearchText(e.target.value);
    },
    [searchText]
  );
  const handleSearchButton = useCallback(
    () =>
      dispatch(
        procurementToolHistoryAction(
          {
            category: process === "category" ? searchText : "",
            name: process === "name" ? searchText : "",
            pg_no: 1,
            on_page_data: onPageData,
            from_date: fromDate,
            to_date: toDate,
          },
          setLoading,
          setData,
          notify
        )
      ),
    [data, searchText, loading, notify, process]
  );
  const handleCloseClick = useCallback(() => setSearchText(""), [searchText]);
  const handleSetProcess = (event) => {
    setProcess(event.target.value);
  };

  const nextStockPage = () => {
    setCurrentPage(currentPage + 1);
    dispatch(
      procurementToolHistoryAction(
        {
          category: process === "category" ? searchText : "",
          name: process === "name" ? searchText : "",
          pg_no: currentPage + 1,
          on_page_data: Number(onPageData),
          from_date: fromDate,
          to_date: toDate,
        },
        setLoading,
        setData,
        notify
      )
    );
  };

  const prevStockPage = () => {
    setCurrentPage(currentPage - 1);
    dispatch(
      procurementToolHistoryAction(
        {
          category: process === "category" ? searchText : "",
          name: process === "name" ? searchText : "",
          pg_no: currentPage - 1,
          on_page_data: Number(onPageData),
          from_date: fromDate,
          to_date: toDate,
        },
        setLoading,
        setData,
        notify
      )
    );
  };

  const handleOnRowsChange = (e) => {
    setCurrentPage(1);
    setOnPageData(Number(e.target.value));
    dispatch(
      procurementToolHistoryAction(
        {
          category: process === "category" ? searchText : "",
          name: process === "name" ? searchText : "",
          pg_no: currentPage,
          on_page_data: Number(e.target.value),
          from_date: fromDate,
          to_date: toDate,
        },
        setLoading,
        setData,
        notify
      )
    );
  };

  const changePageCount = (e) => {
    if (
      e.target.value === "" ||
      e.target.value === "0" ||
      e.target.value > data.totalPages
    ) {
      notify("Invalid value entered", {
        variant: "warning",
      });
      setCurrentPage(1);
      dispatch(
        procurementToolHistoryAction(
          {
            category: process === "category" ? searchText : "",
            name: process === "name" ? searchText : "",
            pg_no: currentPage,
            on_page_data: Number(onPageData),
            from_date: fromDate,
            to_date: toDate,
          },
          setLoading,
          setData,
          notify
        )
      );
    } else {
      setCurrentPage(e.target.value);
      dispatch(
        procurementToolHistoryAction(
          {
            category: process === "category" ? searchText : "",
            name: process === "name" ? searchText : "",
            pg_no: e.target.value,
            on_page_data: Number(onPageData),
            from_date: fromDate,
            to_date: toDate,
          },
          setLoading,
          setData,
          notify
        )
      );
    }
  };

  useEffect(() => {
    dispatch(
      procurementToolHistoryAction(
        {
          category: process === "category" ? searchText : "",
          name: process === "name" ? searchText : "",
          pg_no: 1,
          on_page_data: onPageData,
          from_date: fromDate,
          to_date: toDate,
        },
        setLoading,
        setData,
        notify
      )
    );
  }, []);

  useEffect(() => {
    if (fromDate !== "" && toDate !== "") {
      dispatch(
        procurementToolHistoryAction(
          {
            category: process === "category" ? searchText : "",
            name: process === "name" ? searchText : "",
            pg_no: 1,
            on_page_data: onPageData,
            from_date: fromDate,
            to_date: toDate,
          },
          setLoading,
          setData,
          notify
        )
      );
    }
  }, [fromDate, toDate]);

  return (
    <LayoutContainer footer={false}>
      <CustomHeading variant="body1" customClass="pageTitle">
        Tool Rate history
      </CustomHeading>

      <Box marginTop={8}></Box>

      <Box paddingX={matchesIphone?2:1}>
        {" "}
        <AutomationSearch
          searchText={searchText}
          process={process}
          handleSearchChange={handleSearchChange}
          handleSearchButton={handleSearchButton}
          handleCloseClick={handleCloseClick}
          loading={loading}
          setLoading={setLoading}
          procurement={matchesIphone}
        >
          <FormControl
            variant="standard"
            style={{ marginTop: "-15px", marginLeft: "10px" }}
          >
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
              value={process}
              labelId="container_list_select_label"
              name="client"
              defaultValue={process}
              label="Process"
              variant="standard"
              onChange={handleSetProcess}
              className={classes.inputProcess}
              inputProps={{
                style: {
                  padding: "0px 10px",
                  marginTop: "-10px",
                  outline: "none",
                },
              }}
              style={{
                width: "100px",
                backgroundColor: "transparent",
                border: "0.5px solid rgba(0,0,0,0.2)",
                borderRadius: "32px",
                outline: "none",
              }}
            >
              <MenuItem key={"category"} value="category">
                Category
              </MenuItem>
              <MenuItem key={"name"} value="name">
                Item
              </MenuItem>
            </Select>
          </FormControl>
        </AutomationSearch>{" "}
      </Box>
      <Stack
        direction={"row"}
        justifyContent={"flex-end"}
        alignItems={"center"}
        marginBottom={"-20px"}
        marginTop={matchesIphone ? "24px" : "0"}
        spacing={2}
      >
        <Stack direction={"column"} justifyContent={"flex-start"}>
          <Typography variant="caption" style={{ fontWeight: "bold" }}>
            From Date
          </Typography>
          <DatePickerField
            procurement
            dateId="tool-history-date"
            dateValue={fromDate}
            dateChange={(date) => handleDateChangeUTILS(date, setFromDate)}
          />
        </Stack>
        <Stack direction={"column"} justifyContent={"flex-start"}>
          <Typography variant="caption" style={{ fontWeight: "bold" }}>
            To Date
          </Typography>
          <DatePickerField
            procurement
            dateId="tool-history-date"
            dateValue={toDate}
            dateChange={(date) => handleDateChangeUTILS(date, setToDate)}
          />
        </Stack>
      </Stack>

      <AutomationTable rowArray={procurementRowArray} masterArray={data.data} />
      <Grid
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          padding: 10,
          border: "1px solid #0000000d",
        }}
      >
        <Button
          variant="contained"
          startIcon={<PreviousIcon />}
          color="secondary"
          onClick={prevStockPage}
          disabled={data?.prev_page === "" ? true : false}
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
            style={{ width: "50px", padding: "3px" }}
            value={currentPage}
            onChange={changePageCount}
            disabled
          />
          <Typography variant="subtitle2" style={{ padding: "3px" }}>
            of
          </Typography>
          <Typography variant="subtitle2" style={{ padding: "3px" }}>
            {data?.total_pages}
          </Typography>
        </Grid>

        {!matchesIphone && (
          <TextField
            id="client-master-code"
            select
            value={Number(onPageData)}
            variant="outlined"
            inputProps={{ className: classes.input }}
            onChange={handleOnRowsChange}
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
          disabled={data?.next_page === "" ? true : false}
        >
          {!matchesIphone && "Next"}
        </Button>
      </Grid>
    </LayoutContainer>
  );
};

export default ProcurementToolRateHistory;
