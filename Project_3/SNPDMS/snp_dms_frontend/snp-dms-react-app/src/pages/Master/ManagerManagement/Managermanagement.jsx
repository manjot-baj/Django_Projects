import React, { useEffect } from "react";
import LayoutContainer from "../../../components/reusableComponents/LayoutContainer";
import {
  Backdrop,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  createMuiTheme,
  Divider,
  makeStyles,
  MuiThemeProvider,
} from "@material-ui/core";
import { Link } from "react-router-dom";
import MUIDataTable from "mui-datatables";
import { useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { deleteManagerAction, getListingManagerAction } from "../../../actions/ManagerMasterAction";
import { useSnackbar } from "notistack";

const tableColumns = [
  {
    name: "name",
    label: "Name",
    options: {
      filter: true,
      setCellProps: () => ({
        style: {
          whiteSpace: "nowrap",
          position: "sticky",
          left: "0",
          background: "white",
          zIndex: 100,
        },
      }),
      setCellHeaderProps: () => ({
        style: {
          whiteSpace: "nowrap",
          position: "sticky",
          left: 0,
          background: "white",
          zIndex: 101,
        },
      }),
    },
  },
  {
    name: "designation",
    label: "Designation",
    options: {
      filter: true,
      setCellProps: () => ({
        style: {
          whiteSpace: "nowrap",
          position: "sticky",
          left: "0",
          background: "white",
          zIndex: 100,
        },
      }),
      setCellHeaderProps: () => ({
        style: {
          whiteSpace: "nowrap",
          position: "sticky",
          left: 0,
          background: "white",
          zIndex: 101,
        },
      }),
    },
  },
  {
    name: "email",
    label: "Email",
    options: {
      filter: true,
      setCellProps: () => ({
        style: {
          whiteSpace: "nowrap",
          position: "sticky",
          left: "0",
          background: "white",
          zIndex: 100,
        },
      }),
      setCellHeaderProps: () => ({
        style: {
          whiteSpace: "nowrap",
          position: "sticky",
          background: "white",
          left: 0,
          zIndex: 101,
        },
      }),
    },
  },
  {
    name: "mobile_no",
    label: "Mobile No",
    options: {
      filter: true,
      setCellProps: () => ({
        style: {
          background: "white",
          position: "sticky",
          left: "0",
          zIndex: 100,
        },
      }),
      setCellHeaderProps: () => ({
        style: {
          background: "white",
          position: "sticky",
          left: 0,
          zIndex: 101,
        },
      }),
    },
  },
  {
    name: "location",
    label: "Location",
    options: {
      filter: true,
      setCellProps: () => ({
        style: {
          whiteSpace: "nowrap",
          overflowX: "clip",
          position: "sticky",
          left: "0",
          background: "white",
          zIndex: 100,
        },
      }),
      setCellHeaderProps: () => ({
        style: {
          whiteSpace: "nowrap",
          position: "sticky",
          left: 0,
          background: "white",
          zIndex: 101,
        },
      }),
    },
  },
  {
    name: "site",
    label: "Site",
    options: {
      filter: true,
      setCellProps: () => ({
        style: {
          whiteSpace: "nowrap",
          position: "sticky",
          left: "0",
          background: "white",
          zIndex: 100,
        },
      }),
      setCellHeaderProps: () => ({
        style: {
          whiteSpace: "nowrap",
          position: "sticky",
          left: 0,
          background: "white",
          zIndex: 101,
        },
      }),
    },
  },
];


const useStyles = makeStyles((theme) => ({
  tableContainer:{

  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: "#fff",
  },
}));

const getMuiTheme = () =>
  createMuiTheme({
    overrides: {
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

const Managermanagement = () => {
  const history = useHistory();
  const store = useSelector((state) => state);
  const { siteMaster } = store;
  const classes =useStyles()
  const dispatch = useDispatch();
  const notify = useSnackbar().enqueueSnackbar;
  const {ui} = useSelector(state=>state)
  const deleteSelected = (row) => {
    const selectedRow =
    siteMaster.siteManager[row.data[0].dataIndex];
    dispatch(deleteManagerAction(selectedRow.pk, notify));
  };

  useEffect(()=>{
   dispatch(getListingManagerAction(notify))
  },[])

  return (
    <LayoutContainer>
      <div
        className="payroll-policy-details"
        style={{ margin: "30px 10px 10px 10px" }}
      >
        <Card>
          <CardContent>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <h4>Manager List</h4>
              <Box style={{ textAlign: "right" }}>
                <Button
                  className="add_btn btn btn-primary"
                  variant="contained"
                  style={{
                    marginBottom: "20px",
                    backgroundColor: "#2A5FA5",
                    color: "#FFF",
                  }}
                  component={Link}
                  to="/master/manager-management/add"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    className="feather feather-plus"
                  >
                    <line x1="12" y1="2" x2="12" y2="18"></line>
                    <line x1="5" y1="10" x2="19" y2="10"></line>
                  </svg>
                  &nbsp; Add New
                </Button>
              </Box>
            </div>

            <Divider />
            <MuiThemeProvider theme={getMuiTheme()}>
              <MUIDataTable
                data={siteMaster.siteManager}
                columns={tableColumns}
                className={classes.tableContainer}
                responsive={"standard"}
                options={{
                  filterType: "checkbox",
                  download: false,
                  print: false,
                  selectableRows: false,
                  viewColumns: false,
                  filter: false,
                  onRowsDelete: deleteSelected,
                  onRowClick: (rowData, rowMeta) => {
                    const selectedRow =
                      siteMaster.siteManager[rowMeta.dataIndex];
                    history.push({
                      pathname: `/master/manager-management/${selectedRow.pk}`,
                      state: { pk: selectedRow.pk, allDetails: selectedRow },
                    });
                  },
                }}
              />
            </MuiThemeProvider>
          </CardContent>
        </Card>
      </div>
        <Backdrop className={classes.backdrop} open={ui.isloading}>
              <CircularProgress color="inherit" />
            </Backdrop>
    </LayoutContainer>
  );
};

export default Managermanagement;
