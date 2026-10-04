import React, { useCallback, useEffect, useState } from "react";
import LayoutContainer from "@components/reusablecomponents/LayoutContainer";
import {
  Backdrop,
  Box,
  Chip,
  CircularProgress,
  Grid,
  MenuItem,
  Pagination,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";

import { procurementToolHistoryAction } from "../../actions/Procurement/procurementAction";
import { useDispatch, useSelector } from "react-redux";
import { useSnackbar } from "notistack";
import AutomationTable from "@components/reusablecomponents/AutomationTable";
import DatePickerField from "@components/reusablecomponents/DatePickerField";
import { Stack } from "@mui/material";
import { handleDateChangeUTILS } from "../../utils/WeekNumbre";

import {
  TableCustomSearchBar,
  TableFilterComponent,
  TablePageTitle,
  TableRefreshIcon,
} from "@/components/TableComponent/TableComponent";
import { custombackDropStyle } from "@/utils/CustomClasses";

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
  const dispatch = useDispatch();
  const notify = useSnackbar().enqueueSnackbar;
   const { isloading } = useSelector((state) => state.ui);
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


  const handlePaginationOnChange = (e, val) => {
    setCurrentPage(val);
    dispatch(
      procurementToolHistoryAction(
        {
          category: process === "category" ? searchText : "",
          name: process === "name" ? searchText : "",
          pg_no: val,
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

  const handleDeleteDateFilter = () => {
    setFromDate("");
    setToDate("");
    dispatch(
      procurementToolHistoryAction(
        {
          category: process === "category" ? searchText : "",
          name: process === "name" ? searchText : "",
          pg_no: 1,
          on_page_data: onPageData,
          from_date: "",
          to_date: "",
        },
        setLoading,
        setData,
        notify
      )
    );
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
          <TablePageTitle> Tool Rate history</TablePageTitle>
        </Stack>
      </Box>

      <Grid container spacing={2}>
        <Grid
          item
          size={{ xs: 10, sm: 6, md: 6, lg: 6, xl: 6 }}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            gap: 2,
          }}
        >
          <TableCustomSearchBar
            selectName={process}
            updateSelectname={handleSetProcess}
            searchText={searchText}
            setSearchText={handleSearchChange}
            closeClick={handleCloseClick}
            searchClick={handleSearchButton}
            maxWidthSearch={"70%"}
          >
            <MenuItem key={"category"} value="category">
              Category
            </MenuItem>
            <MenuItem key={"name"} value="name">
              Item
            </MenuItem>
          </TableCustomSearchBar>
          <TableFilterComponent
            style={{ width: "fit-content" }}
            title={`Date Filter`}
            activeFilter={fromDate !== "" && toDate !== ""}
          >
            <Stack
              direction={matchesIphone?"column": "row"}
              justifyContent={"center"}
              flexDirection={matchesIphone?"column": "row"}
              alignItems={"center"}
              marginBottom={"-20px"}
              marginTop={matchesIphone ? "24px" : "0"}
              flexWrap={matchesIphone? "wrap":"nowrap"}
              spacing={4}
              mb={4}
            >
              <Stack direction={"column"} justifyContent={"flex-start"}>
                <Typography variant="caption" style={{ fontWeight: "bold" }}>
                  From Date
                </Typography>
                <DatePickerField
                  procurement
                  fullWidth
                  dateId="tool-history-date"
                  dateValue={fromDate}
                  dateChange={(date) =>
                    handleDateChangeUTILS(date, setFromDate)
                  }
                />
              </Stack>
              <Stack direction={"column"} justifyContent={"flex-start"}>
                <Typography variant="caption" style={{ fontWeight: "bold" }}>
                  To Date
                </Typography>
                <DatePickerField
                  procurement
                  fullWidth
                  dateId="tool-history-date"
                  dateValue={toDate}
                  dateChange={(date) => handleDateChangeUTILS(date, setToDate)}
                />
              </Stack>
            </Stack>
          </TableFilterComponent>
        </Grid>

        <Grid
          item
          size={{ xs: 12, sm: 12, md: 6, lg: 6, xl: 6 }}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: 1,
          }}
        >
          {fromDate !== "" && toDate !== "" && (
            <Chip
              size="small"
              variant="outlined"
              color="primary"
              onDelete={handleDeleteDateFilter}
              label={
                fromDate !== "" && toDate !== "" ? ` ${fromDate}/${toDate}` : ""
              }
            />
          )}
          <TableRefreshIcon onClick={() => window.location.reload()} />
        </Grid>
        <Grid item size={{ xs: 12 }}>
          <AutomationTable
            rowArray={procurementRowArray}
            masterArray={data.data}
          />
        </Grid>
      </Grid>

      <Grid
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "flex-end",
          padding: 10,
          border: "1px solid #0000000d",
        }}
      >
        {!matchesIphone && (
          <TextField
            id="client-master-code"
            select
            value={Number(onPageData)}
            variant="outlined"
            size="small"
            onChange={handleOnRowsChange}
            sx={{mr:12}}
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

        <Pagination
          onChange={handlePaginationOnChange}
          count={data?.total_pages}
          page={Number(currentPage)}
          variant="outlined"
          size="small"
        />
      </Grid>
        <Backdrop sx={custombackDropStyle} open={isloading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </LayoutContainer>
  );
};

export default ProcurementToolRateHistory;
