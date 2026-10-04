import React, { useCallback, useEffect, useState } from "react";
import LayoutContainer from "@components/reusablecomponents/LayoutContainer";
import {
  ThemeProvider,
  createTheme,
  FormControlLabel,
  CircularProgress,
  Box,
  Backdrop,
  Grid,
  TextField,
  MenuItem,
} from "@mui/material";
import { Pagination } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import MUIDataTable from "mui-datatables";
import { useSnackbar } from "notistack";
import { getManufacturingLogs } from "../actions/ManufacturingLogsAction";
import { MANUFACTURING_CONST } from "../reducers/ManufacturinglogsReducer";
import { custombackDropStyle } from "../utils/CustomClasses";
import { theme } from "@/App";
import { TableCustomSearchBar } from "@/components/TableComponent/TableComponent";

const getMuiTheme = () =>
  createTheme({
    components: {
      MuiTableHead: {
        // For mui-datatables
        styleOverrides: {
          root: {
            fontSize: "11px !important",
            color: "white !important",
            backgroundColor: `${theme.palette.secondary.main} !important`,
          },
        },
      },
      MUIDataTableHeadCell: {
        styleOverrides: {
          data: {
            textTransform: "uppercase !important",
            fontSize: "11px !important",
            textAlign: "center",
            fontWeight: "bold !important",
          },
          fixedHeader: {
            textAlign: "center",
          },
        },
      },
      MUIDataTable: {
        styleOverrides: {
          responsiveBase: {
            zIndex: "0",
          },
          tableRoot: {
            border: "0px",
            xs: 0,
            sm: 600,
            md: 960,
            lg: 1280,
            xl: 1920,
          },
        },
      },
      MUIDataTableBodyRow: {
        styleOverrides: {
          root: {
            "&:nth-child(odd)": {
              backgroundColor: "#f7f7f7",
            },
            "&:hover": {
              backgroundColor: "#f1f0fb !important",
            },
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          head: {
            textTransform: "uppercase !important",
            color: "white !important",
            fontSize: "11px !important",
            fontWeight: "bold !important",
            backgroundColor: `${theme.palette.secondary.main} !important`,
            padding: "5px 10px !important",
          },
          root: {
            border: "1px solid rgba(0,0,0,.125)",
            padding: "5px 10px !important",
          },
        },
      },
    },
  });

const MnaufacturingLogsComponent = () => {
  const notify = useSnackbar().enqueueSnackbar;
  const dispatch = useDispatch();
  const [searchText, setSearchText] = useState("");
  const [manufacturingData, setManufacturingData] = useState([]);
  const { data, total_pages, on_page_data_edit, pg_no } = useSelector(
    (state) => state.ManufacturinglogsReducer,
  );
  const { isloading } = useSelector((state) => state.ui);

  useEffect(() => {
    dispatch({
      type: MANUFACTURING_CONST.GET_LISTING,
      payload: {
        pg_no: 1,
        container_no: "",
      },
    });
    dispatch(getManufacturingLogs(notify));
  }, []);

  useEffect(() => {
    let manufacturingDataArray = [];
    if (data?.length > 0) {
      data.map((rows) => {
        let manufacturingObj = {
          pk: rows.pk,
          container_no: rows.container_no,
          previous_manufacturing_date: rows.previous_manufacturing_date,
          current_manufacturing_date: rows.current_manufacturing_date,
          changed_by: rows.changed_by,
          updated_at: rows.updated_at,
          location: rows.location,
          site: rows.site,
        };
        manufacturingDataArray.push(manufacturingObj);
      });
      setManufacturingData(manufacturingDataArray);
    } else {
      setManufacturingData([]);
    }
  }, [data]);

  const columns = [
    {
      label: "Container No",
      name: "container_no",
      options: {
        filter: false,
      },
    },
    {
      label: "Previous manufacturing date",
      name: "previous_manufacturing_date",
      style: {
        color: "red",
      },
      options: {
        sort: false,
        filter: false,
        options: {
          setCellProps: () => ({
            style: {
              display: "flex",
              justifyContent: "center",
            },
          }),
        },
        customBodyRender: (value, tableMeta, updateValue) => {
          return (
            <FormControlLabel
              style={{ width: "100%" }}
              control={
                <div style={{ display: "flex", margin: "auto" }}>
                  {
                    tableMeta.tableData[tableMeta.rowIndex][
                      "previous_manufacturing_date"
                    ]
                  }
                </div>
              }
            />
          );
        },
      },
    },
    {
      label: "Current manufacturing date",
      name: "current_manufacturing_date",
      options: {
        sort: false,
        filter: false,
        options: {
          setCellProps: () => ({
            style: {
              display: "flex",
              justifyContent: "center",
            },
          }),
        },
        customBodyRender: (value, tableMeta, updateValue) => {
          return (
            <FormControlLabel
              style={{ width: "100%" }}
              control={
                <div style={{ display: "flex", margin: "auto" }}>
                  {
                    tableMeta.tableData[tableMeta.rowIndex][
                      "current_manufacturing_date"
                    ]
                  }
                </div>
              }
            />
          );
        },
      },
    },
    {
      label: "Updated At",
      name: "updated_at",
      options: {
        sort: false,
        filter: false,
        options: {
          setCellProps: () => ({
            style: {
              display: "flex",
              justifyContent: "center",
            },
          }),
        },
        customBodyRender: (value, tableMeta, updateValue) => {
          return (
            <FormControlLabel
              style={{ width: "100%" }}
              control={
                <div style={{ display: "flex", margin: "auto" }}>
                  {tableMeta.tableData[tableMeta.rowIndex]["updated_at"]}
                </div>
              }
            />
          );
        },
      },
    },
    {
      label: "Changed By",
      name: "changed_by",
      options: {
        sort: false,
        filter: false,
        options: {
          setCellProps: () => ({
            style: {
              display: "flex",
              justifyContent: "center",
            },
          }),
        },
        customBodyRender: (value, tableMeta, updateValue) => {
          return (
            <FormControlLabel
              style={{ width: "100%" }}
              control={
                <div
                  style={{
                    display: "flex",
                    margin: "auto",
                  }}
                >
                  {tableMeta.tableData[tableMeta.rowIndex]["changed_by"]}
                </div>
              }
            />
          );
        },
      },
    },

    {
      label: "Location",
      name: "location",
      options: {
        sort: false,
        filter: false,
        options: {
          setCellProps: () => ({
            style: {
              display: "flex",
              justifyContent: "center",
            },
          }),
        },
        customBodyRender: (value, tableMeta, updateValue) => {
          return (
            <FormControlLabel
              style={{ width: "100%" }}
              control={
                <div style={{ display: "flex", margin: "auto" }}>
                  {tableMeta.tableData[tableMeta.rowIndex]["location"]}
                </div>
              }
            />
          );
        },
      },
    },
    {
      label: "Site",
      name: "site",
      options: {
        sort: false,
        filter: false,
        options: {
          setCellProps: () => ({
            style: {
              display: "flex",
              justifyContent: "center",
            },
          }),
        },
        customBodyRender: (value, tableMeta, updateValue) => {
          return (
            <FormControlLabel
              style={{ width: "100%" }}
              control={
                <div style={{ display: "flex", margin: "auto" }}>
                  {tableMeta.tableData[tableMeta.rowIndex]["site"]}
                </div>
              }
            />
          );
        },
      },
    },
  ];

  const handleSearchChange = useCallback(
    (e) => {
      setSearchText(e.target.value);
    },
    [searchText],
  );

  const handleSearchButton = useCallback(() => {
    dispatch({
      type: MANUFACTURING_CONST.GET_LISTING,
      payload: {
        pg_no: 1,
        container_no: searchText,
        data: [],
      },
    });
    dispatch(getManufacturingLogs(notify));
  }, [searchText]);

  const handleCloseClick = useCallback(() => {
    setSearchText("");
    dispatch({
      type: MANUFACTURING_CONST.GET_LISTING,
      payload: {
        pg_no: 1,
        container_no: "",
      },
    });
    dispatch(getManufacturingLogs(notify));
  }, [searchText]);

  return (
    <LayoutContainer>
      <Box mt={4} width={"50%"} mb={2}>
        <TableCustomSearchBar
          noSelect={true}
          searchText={searchText}
          setSearchText={handleSearchChange}
          closeClick={handleCloseClick}
          selectName={"Container No"}
          searchClick={handleSearchButton}
        />
      </Box>

      <ThemeProvider theme={getMuiTheme()}>
        <MUIDataTable
          data={manufacturingData}
          columns={columns}
          title="Manufacturing Logs"
          searchTextControlled={true}
          options={{
            selectableRows: "none",
            pagination: false,
            responsive: "scroll",
            filterType: "dropdown",
            download: false,
            search: false,
            textLabels: {
              body: {
                noMatch: !manufacturingData ? (
                  <CircularProgress />
                ) : (
                  "Sorry, there is no matching data to display"
                ),
              },
            },

            filter: false,
            fixedHeaderOptions: false,
            viewColumns: false,
            print: false,
          }}
        />
      </ThemeProvider>
      <Grid container spacing={6} sx={{ marginTop: 4 }}>
        <Grid item sx={{ textAlign: "end" }} size={{ xs: 8 }}>
          {" "}
          <TextField
            id="client-master-code"
            select
            value={on_page_data_edit}
            variant="outlined"
            size="small"
            onChange={(e) => {
              dispatch({
                type: MANUFACTURING_CONST.GET_LISTING,
                payload: {
                  pg_no: 1,
                  on_page_data_edit: e.target.value,
                },
              });
              dispatch(getManufacturingLogs(notify));
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
        </Grid>
        <Grid
          item
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
          }}
          size={{ xs: 4 }}
        >
          <Pagination
            onChange={(e, val) => {
              dispatch({
                type: MANUFACTURING_CONST.GET_LISTING,
                payload: { pg_no: val },
              });
              dispatch(getManufacturingLogs(notify));
            }}
            count={total_pages}
            page={pg_no}
            variant="outlined"
          />
        </Grid>
      </Grid>
      <Backdrop sx={custombackDropStyle} open={isloading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </LayoutContainer>
  );
};

export default MnaufacturingLogsComponent;
