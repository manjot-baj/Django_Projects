import React, { useCallback, useEffect, useState } from "react";
import LayoutContainer from "../components/reusableComponents/LayoutContainer";
import {
  MuiThemeProvider,
  createMuiTheme,
  FormControlLabel,
  makeStyles,
  CircularProgress,
  Box,
  Backdrop,
  Grid,
  TextField,
  MenuItem,
} from "@material-ui/core";
import { Pagination } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import MUIDataTable from "mui-datatables";
import { useSnackbar } from "notistack";
import { getManufacturingLogs } from "../actions/ManufacturingLogsAction";
import { MANUFACTURING_CONST } from "../reducers/ManufacturinglogsReducer";
import AutomationSearch from "../components/reusableComponents/AutomationSearch";

const getMuiTheme = () =>
  createMuiTheme({
    overrides: {
      MuiPaper:{
      rounded:{
        borderRadius:8,
      }
      },
      MuiTableCell: {
        head: {
          backgroundColor: "#f1f0fb !important",
          padding: "5px 10px !important",
        },
        root: {
          border: "1px solid rgba(0,0,0,.125)",
          padding: "5px 10px !important",
        },
      },
      MUIDataTableHeadCell: {
        data: {
          textAlign: "center",
          fontWeight: "bold",
        },
        fixedHeader: {
          textAlign: "center",
          fontWeight: "bold",
        },
      },
      MuiTablePagination: {
        root: {
          display: "none",
        },
      },
      MUIDataTableBodyRow: {
        root: {
          "&:nth-child(odd)": {
            backgroundColor: "#f7f7f7",
          },
          "&:hover": {
            backgroundColor: "#f1f0fb !important",
          },
        },
      },
      MUIDataTable: {
      
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
  });

const useStyle = makeStyles((theme) => ({
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: "#fff",
  },
  modalPaper: {
    position: "absolute",
    width: "70%",
    backgroundColor: "white",
    boxShadow: 5,
    padding: 20,
    outline: "none",
    borderRadius: 10,
  },
  chipRoot: {
    display: "flex",
    justifyContent: "center",

    flexWrap: "wrap",
    paddingTop: 20,
  },
  searchBox: {
    padding: "20px 20px 20px",
  },
  input: {
    padding: 8,
  },
  textField: {
    borderColor: "#2a5fa5",

    "& .MuiOutlinedInput-root": {
      borderColor: "red",
      borderRadius: "5px",

      "& fieldset": {
        borderColor: "red",
      },
    },
    "& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
      padding: "0 !important",
      border: "2px solid rgba(0,0,0,0.2)",
      borderRadius: "8px",
    },
  },
}));

const MnaufacturingLogsComponent = () => {
  const classes = useStyle();
  const notify = useSnackbar().enqueueSnackbar;
  const dispatch = useDispatch();
  const [searchText, setSearchText] = useState("");
  const [manufacturingData, setManufacturingData] = useState([]);
  const { data, total_pages, on_page_data_edit, pg_no } = useSelector(
    (state) => state.ManufacturinglogsReducer
  );
  const { isloading } = useSelector((state) => state.ui);

  useEffect(() => {
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
          updated_at:rows.updated_at,
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
                  {
                    tableMeta.tableData[tableMeta.rowIndex][
                      "updated_at"
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
    [searchText]
  );

  const handleSearchButton = useCallback(() => {
    dispatch({
      type: MANUFACTURING_CONST.GET_LISTING,
      payload: {
        pg_no: 1,
        container_no: searchText,
        data:[]
      },
    });
    dispatch(getManufacturingLogs(notify));
  }, [searchText]);

  const handleCloseClick = useCallback(() =>{
    setSearchText("")
    dispatch({type:MANUFACTURING_CONST.GET_LISTING,payload:{
      pg_no:1,
      container_no:""
    }})
    dispatch(getManufacturingLogs(notify))
  }, [searchText]);

  return (
    <LayoutContainer>
      <Box mt={4} width={"50%"} mb={8}>
        <AutomationSearch
          searchText={searchText}
          handleSearchChange={handleSearchChange}
          handleSearchButton={handleSearchButton}
          handleCloseClick={handleCloseClick}
          children
          procurement
          process={"Container No"}
        ></AutomationSearch>
      </Box>

      <MuiThemeProvider theme={getMuiTheme()}>
        <MUIDataTable
          data={manufacturingData}
          columns={columns}
          title="Manufacturing Logs"
          searchTextControlled={true}
          options={{
            selectableRows: "none",

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
      </MuiThemeProvider>
      <Grid container spacing={6} style={{ marginTop: 12 }}>
        <Grid item style={{ textAlign: "end" }} xs={8}>
          {" "}
          <TextField
            id="client-master-code"
            select
            value={on_page_data_edit}
            variant="outlined"
            inputProps={{ className: classes.input }}
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
        <Grid item style={{ textAlign: "end" }} xs={4}>
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
      <Backdrop className={classes.backdrop} open={isloading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </LayoutContainer>
  );
};

export default MnaufacturingLogsComponent;
