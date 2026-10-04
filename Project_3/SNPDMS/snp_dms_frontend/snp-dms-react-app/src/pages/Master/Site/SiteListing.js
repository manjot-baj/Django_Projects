import React, { useEffect, useState } from "react";
import { useSnackbar } from "notistack";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { getSiteListings, deleteSiteListings } from "../../../actions/Master/SiteMasterActions";
import MUIDataTable from "mui-datatables";
import LayoutContainer from "../../../components/reusableComponents/LayoutContainer";
import { createMuiTheme, MuiThemeProvider } from "@material-ui/core/styles";
import { Link } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
} from "@material-ui/core";

const SiteListing = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const store = useSelector((state) => state);
  const { siteMaster, clientMaster } = store;
  const notify = useSnackbar().enqueueSnackbar;

  const tableColumns = [
    { name: "code", label: "Site Code" ,   options: {
      filter: true,
      setCellProps: () => ({
        style: {
          whiteSpace: "nowrap",
          position: "sticky",
          left: "0",
          background: "white",
          zIndex: 100
        }
      }),
      setCellHeaderProps: () => ({
        style: {
          whiteSpace: "nowrap",
          position: "sticky",
          left: 0,
          background: "white",
          zIndex: 101
        }
      })
    }},
    { name: "name", label: "Site Name",   options: {
      filter: true,
      setCellProps: () => ({
        style: {
          whiteSpace: "nowrap",
          position: "sticky",
          left: "0",
          background: "white",
          zIndex: 100
        }
      }),
      setCellHeaderProps: () => ({
        style: {
          whiteSpace: "nowrap",
          position: "sticky",
          left: 0,
          background: "white",
          zIndex: 101
        }
      })
    } },
    { name: "location", label: "Site Location",   options: {
      filter: true,
      setCellProps: () => ({
        style: {
          whiteSpace: "nowrap",
          position: "sticky",
          left: "0",
          background: "white",
          zIndex: 100
        }
      }),
      setCellHeaderProps: () => ({
        style: {
          whiteSpace: "nowrap",
          position: "sticky",
          background: "white",
          left: 0,
          zIndex: 101
        }
      })
    } },
    { name: "address", label: "Site Address",   options: {
      filter: true,
      setCellProps: () => ({
        style: {
          background: "white",
          position: "sticky",
          left: "0",
          zIndex: 100
        }
      }),
      setCellHeaderProps: () => ({
        style: {
          background: "white",
          position: "sticky",
          left: 0,
          zIndex: 101
        }
      })
    } },
    { name: "contact", label: "Contact" ,   options: {
      filter: true,
      setCellProps: () => ({
        style: {
          whiteSpace: "nowrap",
          overflowX:"clip",
          position: "sticky",
          left: "0",
          background: "white",
          zIndex: 100
        }
      }),
      setCellHeaderProps: () => ({
        style: {
          whiteSpace: "nowrap",
          position: "sticky",
          left: 0,
          background: "white",
          zIndex: 101
        }
      })
    }},
    { name: "type", label: "Type" ,   options: {
      filter: true,
      setCellProps: () => ({
        style: {
          whiteSpace: "nowrap",
          position: "sticky",
          left: "0",
          background: "white",
          zIndex: 100
        }
      }),
      setCellHeaderProps: () => ({
        style: {
          whiteSpace: "nowrap",
          position: "sticky",
          left: 0,
          background: "white",
          zIndex: 101
        }
      })
    }},
    { name: "depot_code", label: "Depot Code",   options: {
      filter: true,
      setCellProps: () => ({
        style: {
          whiteSpace: "nowrap",
          position: "sticky",
          left: "0",
          background: "white",
          zIndex: 100
        }
      }),
      setCellHeaderProps: () => ({
        style: {
          whiteSpace: "nowrap",
          position: "sticky",
          left: 0,
          background: "white",
          zIndex: 101
        }
      })
    } },
    { name: "depot_name", label: "Depot Name" ,   options: {
      filter: true,
      setCellProps: () => ({
        style: {
          whiteSpace: "nowrap",
          position: "sticky",
          left: "0",
          overflowWrap:"break-word",
          overflowX:"clip",
          background: "white",
          zIndex: 100 
        }
      }),
      setCellHeaderProps: () => ({
        style: {
          whiteSpace: "nowrap",
          position: "sticky",
          left: 0,
          background: "white",
          zIndex: 101
        }
      })
    }},
    { name: "vendor_code", label: "Vendor Code" ,   options: {
      filter: true,
      setCellProps: () => ({
        style: {
          whiteSpace: "nowrap",
          position: "sticky",
          left: "0",
          background: "white",
          zIndex: 100
        }
      }),
      setCellHeaderProps: () => ({
        style: {
          whiteSpace: "nowrap",
          position: "sticky",
          left: 0,
          background: "white",
          zIndex: 101
        }
      })
    }},
    { name: "vendor_name", label: "Vendor Name",   options: {
      filter: true,
      setCellProps: () => ({
        style: {
          whiteSpace: "nowrap",
          position: "sticky",
          left: "0",
          overflowX:"clip",
          background: "white",
          zIndex: 100
        }
      }),
      setCellHeaderProps: () => ({
        style: {
          whiteSpace: "nowrap",
          position: "sticky",
          left: 0,
          background: "white",
          zIndex: 101
        }
      })
    } },
  ];

  useEffect(() => {
    dispatch(getSiteListings(notify));
  }, [dispatch]);

  const handleButtonClick = () => {
    dispatch({ type: "CLEAN_SITE_MASTER" });
    history.push("/master/site-form");
  };

  const deleteSelected = () => {
    dispatch(deleteSiteListings(clientMaster.check, notify));
  };

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
          }
        },
      },
    });


  return (

    <LayoutContainer footer={false}>
      <div
        className="payroll-policy-details"
        style={{ margin: "30px 10px 10px 10px" }}
      >
        <Card>
          <CardContent>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <h4>Site List</h4>
              <Box style={{ textAlign: "right" }}>
               
                <Button
                  className="add_btn btn btn-primary"
                  variant="contained"
                  style={{ marginBottom: "20px", backgroundColor: "#2A5FA5", color: "#FFF" }}
                  component={Link}
                  to="/master/site-form"
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
                  onRowsDelete: deleteSelected,
                  onRowClick: (rowData, rowMeta) => {
                    const selectedRow = siteMaster.allSiteListing[rowMeta.dataIndex];
                    history.push({
                      pathname: "/master/site-form",
                      state: { pk: selectedRow.pk, allDetails: selectedRow },
                    });
                  },
                }}
              />
            </MuiThemeProvider>
          </CardContent>
        </Card>

      </div>
    </LayoutContainer>
  );
};

export default SiteListing;