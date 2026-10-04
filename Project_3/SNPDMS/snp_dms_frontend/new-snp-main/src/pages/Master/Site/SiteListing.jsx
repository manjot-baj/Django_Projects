import React, { useEffect, useState } from "react";
import { useSnackbar } from "notistack";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import {
  getSiteListings,
  deleteSiteListings,
} from "../../../actions/master/SiteMasterActions";
import MUIDataTable from "mui-datatables";
import LayoutContainer from "@components/reusablecomponents/LayoutContainer";
import {
  Backdrop,
  Badge,
  CircularProgress,
  createTheme,
  ThemeProvider,
} from "@mui/material";
import { Link } from "react-router-dom";
import { Box, Button, Card, CardContent, Divider } from "@mui/material";
import { theme } from "@/App";
import { TableFootercontainer } from "@/components/TableComponent/TableComponent";
import { custombackDropStyle } from "@/utils/CustomClasses";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";

const SiteListing = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  // const store = useSelector((state) => state);
  // const { siteMaster, clientMaster } = store;

  const siteMaster = useSelector((state) => state.siteMaster);
  const clientMaster = useSelector((state) => state.clientMaster);
  const { role } = useSelector((state) => state.user);
  const { isloading } = useSelector((state) => state.ui);
  const [selectedRows, setSelectedRows] = useState([]);

  const notify = useSnackbar().enqueueSnackbar;

  const tableColumns = [
    {
      name: "code",
      label: "Site Code",
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
      name: "name",
      label: "Site Name",
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
      name: "location",
      label: "Site Location",
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
      name: "address",
      label: "Site Address",
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
      name: "contact",
      label: "Contact",
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
      name: "type",
      label: "Type",
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
      name: "depot_code",
      label: "Depot Code",
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
      name: "depot_name",
      label: "Depot Name",
      options: {
        filter: true,
        setCellProps: () => ({
          style: {
            whiteSpace: "nowrap",
            position: "sticky",
            left: "0",
            overflowWrap: "break-word",
            overflowX: "clip",
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
      name: "vendor_code",
      label: "Vendor Code",
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
      name: "vendor_name",
      label: "Vendor Name",
      options: {
        filter: true,
        setCellProps: () => ({
          style: {
            whiteSpace: "nowrap",
            position: "sticky",
            left: "0",
            overflowX: "clip",
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

  useEffect(() => {
    dispatch(getSiteListings(notify));
  }, [dispatch]);

  const handleButtonClick = () => {
    dispatch({ type: "CLEAN_SITE_MASTER" });
    history.push("/master/site/form");
  };

  const deleteSelected = () => {
    const siteDeleteId = selectedRows?.map((val) => val.pk);

    dispatch(deleteSiteListings(siteDeleteId, notify));
  };

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
              cursor: "pointer",
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
  return (
    <LayoutContainer footer={false}>
      <Box
        className="payroll-policy-details"
        sx={(theme) => ({
          margin: "30px 10px 10px 10px",

          [theme.breakpoints.down("sm")]: {
            marginY: "12px",
            marginX: 0,
          },
        })}
      >
        <Card>
          <CardContent>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <h4>Site List</h4>
            </div>

            <Divider />
            <ThemeProvider theme={getMuiTheme()}>
              <MUIDataTable
                title={"Master > Site"}
                data={siteMaster.allSiteListing}
                columns={tableColumns}
                responsive={"standard"}
                options={{
                  filterType: "checkbox",
                  download: false,
                  print: false,
                  viewColumns: false,
                  filter: false,
                  customToolbarSelect: () => null,
                  onRowSelectionChange: (
                    currentRowsSelected,
                    allRowsSelected,
                    rowsSelected,
                  ) => {
                    const selectedData = rowsSelected.map(
                      (index) => siteMaster.allSiteListing[index],
                    );

                    setSelectedRows(selectedData);
                  },
                  onRowClick: (rowData, rowMeta) => {
                  
                    const selectedRow =
                      siteMaster.allSiteListing[rowMeta.dataIndex];
                    history.push({
                      pathname: "/master/site/form",
                      state: { pk: selectedRow.pk, allDetails: selectedRow },
                    });
                  },
                }}
              />
            </ThemeProvider>
          </CardContent>
        </Card>
      </Box>
      <Box mt={12} />
      <TableFootercontainer>
        {selectedRows.length > 0 && (
          <Button
            sx={{ borderRadius: 12, mx: 2 }}
            variant="contained"
            color="secondary"
            startIcon={
              <Badge
                badgeContent={selectedRows.length}
                color="primary"
                sx={{
                  "& .MuiBadge-badge": {
                    right: 22,
                    top: 6,
                    padding: 0,
                  },
                }}
              >
                <DeleteOutlineOutlinedIcon />
              </Badge>
            }
            onClick={deleteSelected}
          >
            Delete
          </Button>
        )}
        {role !== "Site Admin" && role !== "Depot User" && (
          <Button
            className="add_btn btn btn-primary"
            variant="contained"
            component={Link}
            to={{
              pathname: "/master/site/form",
              state: null,
            }}
            sx={{ borderRadius: 12, width: 180 }}
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
        )}
      </TableFootercontainer>
      <Backdrop sx={custombackDropStyle} open={isloading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </LayoutContainer>
  );
};

export default SiteListing;
