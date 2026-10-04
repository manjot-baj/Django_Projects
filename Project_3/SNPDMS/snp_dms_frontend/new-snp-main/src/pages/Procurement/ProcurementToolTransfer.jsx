import React, { useCallback, useEffect, useRef, useState } from "react";
import { useHistory } from "react-router-dom";
import LayoutContainer from "@components/reusablecomponents/LayoutContainer";
import {
  Grid,
  Typography,
  MenuItem,
  Box,
  FormControlLabel,
  Radio,
  useMediaQuery,
  Backdrop,
  CircularProgress,
  Tabs,
  Tab,
  Card,
  List,
  ListItem,
  Chip,
  Tooltip,
  Button,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { TOOL_TRANSFER_CONSTANT } from "../../reducers/procurement/toolTransferReducer";

import { toolGetNameByCategory } from "../../actions/Procurement/requestAction";
import { toolGetAllCategory } from "../../actions/Procurement/procurementAction";
import { getToolTransferTableAction } from "../../actions/Procurement/toolTransferAction";

import { Stack } from "@mui/material";
import { useSnackbar } from "notistack";

import {
  TableCustomPaginationReactTable,
  TableCustomSearchBar,
  TableFilterComponent,
  TableRefreshIcon,
} from "@/components/TableComponent/TableComponent";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import { custombackDropStyle } from "@/utils/CustomClasses";
import {
  Route,
  Switch,
  useLocation,
  useRouteMatch,
} from "react-router-dom/cjs/react-router-dom.min";
import ToolTransferNewTransferDefaultComp from "@/components/Procurement/ToolTransferNewTransferDefaultComp";
import ToolTransferSingleTransferComp from "./ToolTransferSingleTransferComp";
import BusinessIcon from "@mui/icons-material/Business";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AssignmentIcon from "@mui/icons-material/Assignment";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import SearchOffIcon from "@mui/icons-material/SearchOff";

const filterStatus = {
  Pending: "No Action",
  Approved: "Received",
  "Partial Approved": "Partial Received",
};

const fliterStatusLocation = {
  Pending: "Pending",
  Approved: "Transferred",
  "Partial Approved": "Partial Transferred",
};

const ProcurementToolTransfer = () => {
  const dispatch = useDispatch();
  const notify = useSnackbar().enqueueSnackbar;
  const history = useHistory();
  const { path, url } = useRouteMatch();
  const location = useLocation();
  const [searchText, setSearchText] = useState("");
  const [process, setProcess] = useState("item");
  const [loading, setLoading] = useState(false);
  const matchesIphone = useMediaQuery("(max-width:500px)");
  const { toolTransferReducer, user } = useSelector((state) => state);
  const { isloading } = useSelector((state) => state.ui);
  const { toolTable } = toolTransferReducer;
  const [selectedRequest, setSelectedRequest] = useState({
    category: "",
    name: "",
    quantity: 0,
  });
  const [tab, setTab] = useState(0);
  const [selectedId, setSelectedId] = useState(null);
  const createTransferRef = useRef(null);
  const site_Transfer_Admin =
    tab === 0 &&
    ((user.procurement_admin === true && user.procurement_admin !== "False") ||
      user.procurement_admin === "True");
  const non_admin__site_transfer =
    tab === 0 &&
    (user.procurement_admin === false || user.procurement_admin === "False");

  useEffect(() => {
    dispatch(toolGetAllCategory());
    dispatch(getToolTransferTableAction(notify));
  }, []);

  useEffect(() => {
    dispatch(toolGetNameByCategory(selectedRequest.category, notify));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRequest.category, selectedRequest.name]);

  const handleChangeTab = (e, value) => {
    if (value === 0) {
      dispatch({
        type: TOOL_TRANSFER_CONSTANT.TOOL_TRANSFER_TABLE,
        payload: {
          is_admin:
            user.procurement_admin === "False" ||
              user.procurement_admin === false
              ? false
              : true,
          transfer_type: "Site Transfer",
        },
      });
    } else if (value === 1) {
      dispatch({
        type: TOOL_TRANSFER_CONSTANT.TOOL_TRANSFER_TABLE,
        payload: {
          is_admin: true,
          transfer_type: "Location Transfer",
        },
      });
    } else if (value === 2) {
      dispatch({
        type: TOOL_TRANSFER_CONSTANT.TOOL_TRANSFER_TABLE,
        payload: {
          is_admin: false,
          transfer_type: "Location Transfer",
        },
      });
    }
    dispatch(getToolTransferTableAction(notify));
    setTab(value);
  };

  const handleSearchChange = useCallback(
    (e) => {
      setSearchText(e.target.value);
    },
    [searchText],
  );
  const handleCloseClick = useCallback(() => setSearchText(""), [searchText]);
  const handleSearchButton = useCallback(() => {
    dispatch({
      type: TOOL_TRANSFER_CONSTANT.TOOL_TRANSFER_TABLE,
      payload:
        process === "item"
          ? { item: searchText }
          : process === "category"
            ? { category: searchText }
            : {
              tool_transfer_no: searchText,
            },
    });
    dispatch(getToolTransferTableAction(notify));
  }, [searchText, loading, notify, process]);

  const handleRefreshTable = () => {
    dispatch({
      type: TOOL_TRANSFER_CONSTANT.TOOL_TRANSFER_TABLE,
      payload: {
        item: "",
        sku_code: "",
        tool_transfer_no: "",
        pg_no: 1,
        category: "",
      },
    });
    dispatch(getToolTransferTableAction(notify));
  };

  const handleSetProcess = (event) => {
    setSearchText("");
    dispatch({
      type: TOOL_TRANSFER_CONSTANT.TOOL_TRANSFER_TABLE,
      payload: {
        item: "",
        sku_code: "",
        tool_transfer_no: "",
      },
    });
    setProcess(event.target.value);
  };

  const handleInitialPage = () => {
    dispatch({
      type: TOOL_TRANSFER_CONSTANT.TOOL_TRANSFER_TABLE,
      payload: {
        pg_no: 1,
      },
    });
    dispatch(getToolTransferTableAction(notify));
  };

  const handleOnPageDataChange = (value) => {
    dispatch({
      type: TOOL_TRANSFER_CONSTANT.TOOL_TRANSFER_TABLE,
      payload: {
        pg_no: 1,
        on_page_data_client: value,
      },
    });
    dispatch(getToolTransferTableAction(notify));
  };

  const handlePaginationOnChange = (e, val) => {
    dispatch({
      type: TOOL_TRANSFER_CONSTANT.TOOL_TRANSFER_TABLE,
      payload: {
        pg_no: val,
      },
    });
    dispatch(getToolTransferTableAction(notify));
  };

  const handleCreateNewTicket = () => {
    createTransferRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
    setSelectedId(null);
    history.replace("/procurement/tool-transfer");
  };

  return (
    <LayoutContainer footer={false} hideScrollbar={true}>
      <Box padding={matchesIphone ? 1 : 2}>
        <Stack
          direction={"row"}
          alignItems={"center"}
          justifyContent={"space-between"}
          sx={{ mb: 1 }}
        >
          <Stack
            direction={"row"}
            alignItems={"center"}
            justifyContent={"flex"}
            spacing={2}
            sx={{ mb: 2 }}
          >
            {" "}
            <SwapHorizIcon
              fontSize="large"
              sx={(theme) => ({
                fill: "white",
                bgcolor: theme.palette.primary.main,
                padding: 0.4,
                borderRadius: 2,
              })}
            />
            <Stack
              direction={"column"}
              alignItems={"flex-start"}
              justifyContent={"center"}
            >
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                Tool Tranfer System
              </Typography>
              <Typography variant="caption">
                Transfer Tools Across Locations & Hierarchies
              </Typography>
            </Stack>
          </Stack>
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={handleCreateNewTicket}
            sx={{
              px: 4,
              py: 1.1,
              borderRadius: "14px",
              textTransform: "none",
              fontWeight: 700,
              fontSize: "0.95rem",

              background: "linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)",

              boxShadow: "0 4px 14px rgba(124, 58, 237, 0.25)",

              transition: "all 0.25s ease",

              "&:hover": {
                background: "linear-gradient(135deg, #1D4ED8 0%, #6D28D9 100%)",
                boxShadow: "0 8px 24px rgba(124, 58, 237, 0.35)",
                transform: "translateY(-2px)",
              },

              "&:active": {
                transform: "translateY(0px)",
              },
            }}
          >
            Create New Transfer
          </Button>
        </Stack>

        <Box
          sx={{
            mt: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: 'column'
          }}
          component={Grid}
          container
          spacing={2}
        >
          <Grid
            item
            size={{ xs: 12 }}
            component={Card}
            elevation={0}
            sx={(theme) => ({
              borderRadius: 2.5,
              padding: 2.5,
              height: "100%",
              display: "flex",
              flexDirection: "column",
              bgcolor: "#F8FAFC",
            })}
          >
            <Box
              sx={{
                mb: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Tabs
                value={tab}
                onChange={handleChangeTab}
                variant="fullWidth"
                slotProps={{
                  indicator: {
                    sx: {
                      height: 2,
                      borderRadius: 1,
                    },
                  },
                }}
                sx={(theme) => ({
                  minWidth: 550,

                  minHeight: 30,
                  "& .MuiTab-root": {
                    minHeight: 30,
                    py: 0,
                    px: 1.5,
                    fontSize: "0.72rem",
                    fontWeight: 500,
                    textTransform: "none",
                    gap: 0.5,
                    color: "#5f6368",

                    opacity: 0.75,
                    transition: "all 0.2s ease",
                  },

                  "& .MuiTab-root:hover": {
                    color: "primary.main",
                    opacity: 1,
                    bgcolor: "action.hover",
                  },

                  "& .MuiTab-root.Mui-selected .MuiSvgIcon-root": {
                    color: "primary.main",
                  },

                  "& .MuiSvgIcon-root": {
                    fontSize: "0.9rem",
                    transition: "color 0.2s ease",
                  },
                  "& .MuiTab-root.Mui-selected": {
                    color: "primary.main",
                    bgcolor: "rgba(25, 118, 210, 0.08)",
                    borderRadius: 1,
                    opacity: 1,
                    fontWeight: 600,
                  },
                })}
              >
                <Tooltip
                  title="List of Tool Transfer between Procurement Admin -> Child Site "
                  arrow
                >
                  <Tab
                    icon={<BusinessIcon />}
                    iconPosition="start"
                    label="Site Transfer"
                  />
                </Tooltip>

                {(user?.procurement_admin === "True" ||
                  (user?.procurement_admin !== "False" &&
                    user.procurement_admin === true)) && (
                    <Tooltip
                      title="List of Tool Transfer between Location(Admin) -> Location (Admin)"
                      arrow
                    >
                      <Tab
                        icon={<LocationOnIcon />}
                        iconPosition="start"
                        label="Location Transfer"
                      />
                    </Tooltip>
                  )}

                {(user?.procurement_admin === "True" ||
                  (user?.procurement_admin !== "False" &&
                    user.procurement_admin === true)) && (
                    <Tooltip
                      title="List of Tool Transfer Request You have request to Athor Location(Admin)"
                      arrow
                    >
                      <Tab
                        icon={<AssignmentIcon />}
                        iconPosition="start"
                        label="My Requests"
                      />
                    </Tooltip>
                  )}
              </Tabs>
              <Stack
                direction={"row"}
                alignItems={"center"}
                justifyContent={"flex-end"}
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
                  <MenuItem key={"item"} value="item">
                    Item
                  </MenuItem>
                  <MenuItem key={"category"} value="category">
                    Category
                  </MenuItem>
                  <MenuItem key={"tool_transfer_no"} value="tool_transfer_no">
                    Tool Transfer No
                  </MenuItem>
                </TableCustomSearchBar>
                <TableFilterComponent
                  style={{ width: "fit-content" }}
                  activeFilter={true}
                  title={` ${user?.procurement_admin === "False" || user?.procurement_admin === false ? filterStatus?.[toolTable.status] : site_Transfer_Admin ? fliterStatusLocation?.[toolTable.status] : tab === 2 ? filterStatus?.[toolTable.status] : tab === 1 ? fliterStatusLocation?.[toolTable.status] : toolTable.status}`}
                >
                  <Grid item size={{ xs: 12 }}>
                    <Typography variant="subtitle2">Status</Typography>
                  </Grid>
                  <Grid item size={{ xs: 12 }}>
                    <FormControlLabel
                      value="yes"
                      sx={{
                        "& .MuiFormControlLabel-label": {
                          fontSize: "12px",
                        },
                      }}
                      control={
                        <Radio
                          style={{ color: "#10b981" }}
                          size="small"
                          checked={toolTable.status === "Approved"}
                          onClick={() => {
                            dispatch({
                              type: TOOL_TRANSFER_CONSTANT.TOOL_TRANSFER_TABLE,
                              payload: {
                                status: "Approved",
                              },
                            });
                            dispatch(getToolTransferTableAction(notify));
                          }}
                        />
                      }
                      label={
                        (user.procurement_admin === true ||
                          user.procurement_admin === "True") &&
                          tab !== 2
                          ? "Transferred"
                          : "Received"
                      }
                    />
                  </Grid>
                  <Grid item size={{ xs: 12 }}>
                    <FormControlLabel
                      value="no"
                      sx={{
                        "& .MuiFormControlLabel-label": {
                          fontSize: "12px",
                        },
                      }}
                      control={
                        <Radio
                          size="small"
                          style={{ color: "#505050" }}
                          checked={toolTable.status === "Partial Approved"}
                          onClick={() => {
                            dispatch({
                              type: TOOL_TRANSFER_CONSTANT.TOOL_TRANSFER_TABLE,
                              payload: {
                                status: "Partial Approved",
                              },
                            });
                            dispatch(getToolTransferTableAction(notify));
                          }}
                        />
                      }
                      label={
                        (user.procurement_admin === true ||
                          user.procurement_admin === "True") &&
                          tab !== 2
                          ? " Partially Transferred"
                          : "Partially Received"
                      }
                    />
                  </Grid>
                  <Grid item size={{ xs: 12 }}>
                    <FormControlLabel
                      value="no"
                      sx={{
                        "& .MuiFormControlLabel-label": {
                          fontSize: "12px",
                        },
                      }}
                      control={
                        <Radio
                          size="small"
                          style={{ color: "#f97215" }}
                          checked={toolTable.status === "Pending"}
                          onClick={() => {
                            dispatch({
                              type: TOOL_TRANSFER_CONSTANT.TOOL_TRANSFER_TABLE,
                              payload: {
                                status: "Pending",
                              },
                            });
                            dispatch(getToolTransferTableAction(notify));
                          }}
                        />
                      }
                      label={
                        (user.procurement_admin === true ||
                          user.procurement_admin === "True") &&
                          tab !== 2
                          ? " Pending"
                          : "No Action"
                      }
                    />
                  </Grid>
                </TableFilterComponent>
                <TableRefreshIcon onClick={handleRefreshTable} />
              </Stack>
            </Box>

            {toolTable.data?.length === 0 ? (
              <Stack
                alignItems="center"
                justifyContent="center"
                spacing={1.5}
                sx={{
                  py: 8,
                  px: 2,
                  minHeight: 200,
                  textAlign: "center",
                }}
              >
                <SearchOffIcon
                  sx={{
                    fontSize: 56,
                  }}
                />

                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    color: "text.primary",
                  }}
                >
                  No Tool Transfers Found
                </Typography>

                <Typography
                  variant="body2"
                  color="textDisabled"
                  sx={{ maxWidth: 450 }}
                >
                  We couldn't find any tool transfers matching your current
                  filters. Try changing the search criteria or refreshing the
                  list.
                </Typography>
              </Stack>
            ) : (
              <List
                sx={{
                  overflowY: "auto",
                  my: 2,
                  flexGrow: 1,
                  minHeight: 250,
                  // Hide scrollbar
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                  "&::-webkit-scrollbar": {
                    display: "none",
                  },
                }}
              >
                {toolTable?.data?.map((item) => (
                  <ListItem
                    onClick={() => {
                      history.push(`${path}/${item.pk}`);
                      setSelectedId(item.pk);
                      createTransferRef.current?.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      });
                    }}
                    sx={{
                      bgcolor:
                        selectedId === item.pk ||
                          Number(location.pathname?.split("/")?.pop()) === item.pk
                          ? "#EFF6FF"
                          : "#F8FAFC",
                      border: "1px solid #E2E8F0",
                      borderLeft: "4px solid",
                      borderLeftColor:
                        selectedId === item.pk ||
                          Number(location.pathname?.split("/")?.pop()) === item.pk
                          ? "primary.main"
                          : "#acc2dd",
                      borderRadius: 2,
                      py: 1,
                      px: 1.5,

                      mb: 0.75,
                      cursor: "pointer",
                      transition: "all 0.2s ease",

                      "&:hover": {
                        bgcolor: "#F1F5F9",
                        borderLeftColor: "primary.main",
                      },
                    }}
                  >
                    <Box
                      width="100%"
                      display="flex"
                      alignItems="center"
                      justifyContent="space-between"
                      gap={2}
                    >
                      <Stack
                        direction={"row"}
                        alignItems={"center"}
                        justifyContent={"flex-start"}
                        spacing={4}
                      >
                        <Typography
                          sx={{
                            fontSize: "0.8rem",
                            fontWeight: 600,
                            minWidth: 120,
                          }}
                        >
                          {item.tool_transfer_no}
                        </Typography>

                        <Typography
                          sx={{ fontSize: "0.68rem", fontWeight: 500 }}
                          color={
                            selectedId === item.pk ||
                              Number(location.pathname?.split("/")?.pop()) ===
                              item.pk
                              ? "primary"
                              : "textDisabled"
                          }
                        >
                          {item.date}
                        </Typography>
                        {(non_admin__site_transfer || site_Transfer_Admin) ? null : (
                          <Typography
                            sx={{
                              fontSize: "0.68rem",

                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              fontWeight: 500,
                            }}
                            color={
                              selectedId === item.pk ||
                                Number(location.pathname?.split("/")?.pop()) ===
                                item.pk
                                ? "primary"
                                : "textDisabled"
                            }
                          >
                            {(site_Transfer_Admin || tab === 1)
                              ? "Requesting Location"
                              : "Location"}
                            : {item.location}
                          </Typography>
                        )}
                        {non_admin__site_transfer ? null : (
                          <Typography
                            sx={{
                              fontSize: "0.68rem",

                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              fontWeight: 500,
                            }}
                            color={
                              selectedId === item.pk ||
                                Number(location.pathname?.split("/")?.pop()) ===
                                item.pk
                                ? "primary"
                                : "textDisabled"
                            }
                          >
                            {(site_Transfer_Admin || tab === 1) ? "Requesting Site" : "Site"}:{" "}
                            {item.site}
                          </Typography>
                        )}

                        {(tab === 1 || site_Transfer_Admin) ? null : <Typography
                          sx={{
                            fontSize: "0.68rem",

                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            fontWeight: 500,
                          }}
                          color={
                            selectedId === item.pk ||
                              Number(location.pathname?.split("/")?.pop()) ===
                              item.pk
                              ? "primary"
                              : "textDisabled"
                          }
                        >
                          {non_admin__site_transfer
                            ? "Requested From"
                            : site_Transfer_Admin
                              ? "Requested To"
                              : "Requesting Site"}
                          : {item.requested_from}
                        </Typography>}
                      </Stack>

                      <Chip
                        label={
                          (user.procurement_admin === "True" ||
                            (user.procurement_admin === true &&
                              user.procurement_admin !== "False")) &&
                            tab === 2
                            ? filterStatus?.[item.status]
                            : tab === 1
                              ? fliterStatusLocation?.[item.status]
                              : (tab === 0) &
                                (user.procurement_admin === false ||
                                  user.procurement_admin === "False")
                                ? filterStatus?.[item.status]
                                : site_Transfer_Admin
                                  ? fliterStatusLocation?.[item.status]
                                  : item.status
                        }
                        size="small"
                        color={
                          item.status === "Approved"
                            ? "success"
                            : item.status === "Partial Approved"
                              ? "secondary"
                              : "warning"
                        }
                        sx={{
                          height: 20,

                          fontSize: "0.65rem",
                          fontWeight: 600,
                        }}
                      />
                    </Box>
                  </ListItem>
                ))}
              </List>
            )}

            <TableCustomPaginationReactTable
              pg_no={toolTable.pg_no}
              total_pages={toolTable.total_pages}
              handleInitialPage={handleInitialPage}
              on_page_data={toolTable.on_page_data_client}
              next_page={toolTable.next_page}
              handleOnPageDataChange={handleOnPageDataChange}
              handlePaginationOnChange={handlePaginationOnChange}
              disableOnPage={true}
              tablePaginationheightNone={true}
            />
          </Grid>
          <Grid item size={{ xs: 12 }} ref={createTransferRef}>
            <Typography variant="body1" sx={{ mt: 4 }}>
              Create New Tool Transfer Request
            </Typography>
          </Grid>
          <Grid
            item
            size={{ xs: 12 }}
            sx={(theme) => ({
              pb: 6,

              [theme.breakpoints.down("lg")]: {
                pb: 24,
              },
            })}
          >
            <Switch>
              <Route
                exact
                path={path}
                render={(routeProps) => (
                  <ToolTransferNewTransferDefaultComp
                    {...routeProps}
                    handleChangeTab={handleChangeTab}
                  />
                )}
              />
              <Route
                exact
                path={`${path}/:pk`}
                component={ToolTransferSingleTransferComp}
              />
            </Switch>
          </Grid>
        </Box>
      </Box>

      <Backdrop sx={custombackDropStyle} open={isloading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </LayoutContainer>
  );
};

export default ProcurementToolTransfer;
