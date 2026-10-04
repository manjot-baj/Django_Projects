import React, { useEffect } from "react";
import LayoutContainer from "@components/reusablecomponents/LayoutContainer";
import {
  Backdrop,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  createTheme,
  Divider,
  ThemeProvider,
} from "@mui/material";
import { Link } from "react-router-dom";
import MUIDataTable from "mui-datatables";
import { useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteManagerAction,
  getListingManagerAction,
} from "../../../actions/ManagerMasterAction";
import { useSnackbar } from "notistack";
import { custombackDropStyle } from "../../../utils/CustomClasses";
import { theme } from "@/App";
import { TableFootercontainer } from "@/components/TableComponent/TableComponent";

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
            cursor: "pointer !important",
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

const Managermanagement = () => {
  const history = useHistory();
  const store = useSelector((state) => state);
  const { siteMaster } = store;

  const dispatch = useDispatch();
  const notify = useSnackbar().enqueueSnackbar;
  const { ui } = useSelector((state) => state);
  const deleteSelected = (row) => {
    const selectedRow = siteMaster.siteManager[row.data[0].dataIndex];
    dispatch(deleteManagerAction(selectedRow.pk, notify));
  };

  useEffect(() => {
    dispatch(getListingManagerAction(notify));
  }, []);

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
            </div>

            <Divider />
            <ThemeProvider theme={getMuiTheme()}>
              <MUIDataTable
                data={siteMaster.siteManager}
                columns={tableColumns}
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
            </ThemeProvider>
          </CardContent>
        </Card>
      </div>
      <TableFootercontainer>
        <Button
          className="add_btn btn btn-primary"
          variant="contained"
          component={Link}
          sx={{ borderRadius: 12 }}
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
      </TableFootercontainer>
      <Backdrop sx={custombackDropStyle} open={ui.isloading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </LayoutContainer>
  );
};

export default Managermanagement;
