import LayoutContainer from "@/components/reusablecomponents/LayoutContainer";
import {
  alpha,
  Box,
  Button,
  Divider,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Modal,
  Stack,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import { useSnackbar } from "notistack";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import { userSupportTicketListingAction } from "@/actions/UserSupportAction";
import BugReportOutlinedIcon from "@mui/icons-material/BugReportOutlined";
import MoreVertOutlinedIcon from "@mui/icons-material/MoreVertOutlined";
import KanbanCardStatusComp from "@/components/kanban/KanbanCardStatusComp";
import LightbulbOutlinedIcon from "@mui/icons-material/LightbulbOutlined";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import {
  TableCustomPaginationReactTable,
  TableCustomSearchBar,
  TableFootercontainer,
} from "@/components/TableComponent/TableComponent";
import { USER_SUPPORT_CONST } from "@/reducers/UserSupportReducer";
import UserSupportFilterComp from "@/components/userSupport/UserSupportFilterComp";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import UserSupportCreateTicketComp from "@/components/userSupport/UserSupportCreateTicketComp";

const ticketStatusConfig = {
  "Review Pending": {
    text: "Review Pending",
    color: "#FFB703",
    icon: <PendingActionsIcon sx={{ fill: "#FFB703" }} fontSize="small" />,
  },
  "Review Passed": {
    text: "Review Passed",
    color: "#2E7D32",
    icon: <CheckCircleOutlineIcon sx={{ fill: "#2E7D32" }} fontSize="small" />,
  },
  "Review Failed": {
    text: "Review Failed",
    color: "#C62828",
    icon: <CancelOutlinedIcon sx={{ fill: "#C62828" }} fontSize="small" />,
  },
  Open: {
    text: "Open",
    color: "#1565C0",
    icon: <FolderOpenIcon sx={{ fill: "#1565C0" }} fontSize="small" />,
  },
  "In Progress": {
    text: "In Progress",
    color: "#6A1B9A",
    icon: <AutorenewIcon sx={{ fill: "#6A1B9A" }} fontSize="small" />,
  },
  Closed: {
    text: "Closed",
    color: "#00897B",
    icon: <TaskAltIcon sx={{ fill: "#00897B" }} fontSize="small" />,
  },
};

const UserSupportTicketDashboardComp = () => {
  const notify = useSnackbar().enqueueSnackbar;
  const dispatch = useDispatch();
  const history = useHistory();
  const { ticket_listing } = useSelector((state) => state.UserSupportReducer);
  const { role } = useSelector((state) => state.user);
  const [filterType, setFilterType] = useState("");
  const [name, setName] = useState("ticket_number");
  const matchesTab = useMediaQuery((theme) => theme.breakpoints.down("lg"));
  const [openKanbanCreateTicketModal, setOpenKanbanCreateTicketModal] =
    React.useState(false);
  const handleOpenKanbanCreateTicketModal = () =>
    setOpenKanbanCreateTicketModal(true);
  const handleCloseKanbanCreateTicketModal = () =>
    setOpenKanbanCreateTicketModal(false);

  useEffect(() => {
    dispatch(userSupportTicketListingAction(notify, history));
  }, []);

  const handleRefreshFilter = (e) => {
    e.stopPropagation();
    dispatch({
      type: USER_SUPPORT_CONST.GET_ALL_TICKETS,
      payload: {
        pg_no: 1,
        location: "",
        site: "",
        from_date: "",
        to_date: "",
      },
    });
    dispatch(userSupportTicketListingAction(notify));
  };

  const updateName = (event) => {
    setFilterType("");
    dispatch({
      type: USER_SUPPORT_CONST.GET_ALL_TICKETS,
      payload: {
        ticket_number: "",
        ticket_type: "",
        module_name: "",
      },
    });
    setName(event.target.value);
  };
  const setDispatchType = (e) => {
    setFilterType(e.target.value);
    if (name === "ticket_number") {
      dispatch({
        type: USER_SUPPORT_CONST.GET_ALL_TICKETS,
        payload: {
          module_name: "",
          ticket_number: e.target.value,
          ticket_type: "",
        },
      });
    } else if (name === "ticket_type") {
      dispatch({
        type: USER_SUPPORT_CONST.GET_ALL_TICKETS,
        payload: {
          ticket_type: e.target.value,
          ticket_number: "",
          module_name: "",
        },
      });
    } else {
      dispatch({
        type: USER_SUPPORT_CONST.GET_ALL_TICKETS,
        payload: {
          ticket_type: "",
          ticket_number: "",
          module_name: e.target.value,
        },
      });
    }
  };
  const getData = () => {
    dispatch({
      type: USER_SUPPORT_CONST.GET_ALL_TICKETS,
      payload: {
        pg_no: 1,
      },
    });
    dispatch(userSupportTicketListingAction(notify));
  };
  const handleCloseClick = () => {
    setFilterType("");
    dispatch({
      type: USER_SUPPORT_CONST.GET_ALL_TICKETS,
      payload: {
        ticket_type: "",
        ticket_number: "",
        module_name: "",
      },
    });
    dispatch(userSupportTicketListingAction(notify));
  };

  const handleInitialPage = () => {
    dispatch({
      type: USER_SUPPORT_CONST.GET_ALL_TICKETS,
      payload: {
        pg_no: 1,
      },
    });
    dispatch(userSupportTicketListingAction(notify));
  };
  const handleOnPageDataChange = (value) => {
    dispatch({
      type: USER_SUPPORT_CONST.GET_ALL_TICKETS,
      payload: {
        on_page_data_client: value,
      },
    });
    dispatch(userSupportTicketListingAction(notify));
  };
  const handlePaginationOnChange = (e, val) => {
    dispatch({
      type: USER_SUPPORT_CONST.GET_ALL_TICKETS,
      payload: {
        pg_no: val,
      },
    });
    dispatch(userSupportTicketListingAction(notify));
  };

  return (
    <LayoutContainer hideScrollbar={true}>
      <Box
        sx={(theme) => ({
          px: 4,
          [theme.breakpoints.down("sm")]: {
            p: 2,
          },
        })}
      >
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
          >
            {" "}
            <SupportAgentIcon
              fontSize="large"
              sx={(theme) => ({
                fill: "white",
                bgcolor: theme.palette.primary.main,
                padding: 0.6,
                borderRadius: 2,
              })}
            />
            <Stack
              direction={"column"}
              alignItems={"flex-start"}
              justifyContent={"center"}
            >
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                Support Ticket System
              </Typography>
              <Typography variant="caption">
                Raise, track, and resolve your issues with ease
              </Typography>
            </Stack>
          </Stack>
          <Stack
            direction={"row"}
            flexDirection={"row"}
            alignItems={"center"}
            justifyContent={"flex-end"}
            sx={(theme) => ({
              flex: 0.5,
              [theme.breakpoints.down("sm")]: {
                display: "none",
              },
            })}
            spacing={2}
          >
            <TableCustomSearchBar
              searchText={filterType}
              updateSelectname={updateName}
              setSearchText={setDispatchType}
              searchClick={getData}
              selectName={name}
              closeClick={handleCloseClick}
              maxWidthSearch={"100%"}
              inputWidth={"100%"}
            >
              {" "}
              <MenuItem value={"ticket_number"}>
                &nbsp; &nbsp;&nbsp;Ticket Number
              </MenuItem>
              <MenuItem value={"ticket_type"}>
                &nbsp; &nbsp;&nbsp;Ticket Type
              </MenuItem>
              <MenuItem value={"module_name"}>
                &nbsp; &nbsp;&nbsp; Module name
              </MenuItem>
            </TableCustomSearchBar>

            <UserSupportFilterComp />
            <IconButton onClick={handleRefreshFilter} color="secondary">
              <RefreshOutlinedIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Stack>
        <Divider />
        <Stack
          direction={"row"}
          flexDirection={"row"}
          alignItems={"center"}
          justifyContent={"flex-end"}
          sx={(theme) => ({
            flex: 0.5,
            mt: 2,
            [theme.breakpoints.up("sm")]: {
              display: "none",
            },
          })}
        >
          <TableCustomSearchBar
            searchText={filterType}
            updateSelectname={updateName}
            setSearchText={setDispatchType}
            searchClick={getData}
            selectName={name}
            closeClick={handleCloseClick}
            maxWidthSearch={"100%"}
            inputWidth={"100%"}
          >
            {" "}
            <MenuItem value={"ticket_number"}>
              &nbsp; &nbsp;&nbsp;Ticket Number
            </MenuItem>
            <MenuItem value={"ticket_type"}>
              &nbsp; &nbsp;&nbsp;Ticket Type
            </MenuItem>
            <MenuItem value={"module_name"}>
              &nbsp; &nbsp;&nbsp; Module name
            </MenuItem>
          </TableCustomSearchBar>

          <UserSupportFilterComp />
          <IconButton onClick={handleRefreshFilter} color="secondary">
            <RefreshOutlinedIcon fontSize="small" />
          </IconButton>
        </Stack>
        <Grid
          container
          spacing={2}
          sx={(theme) => ({
            minHeight: "calc(100vh - 200px)",
            width: "100%",
            mt: 4,
            flexWrap: "nowrap", // prevents wrapping
            overflowX: "auto", // enables horizontal scroll
            overflowY: "hidden",

            // Smooth scrolling
            scrollBehavior: "smooth",

            // Optional padding bottom for scrollbar spacing
            pb: 1,
            [theme.breakpoints.down("sm")]: {
              minHeight: "calc(100vh - 300px)",
            },
            // Firefox
            scrollbarWidth: "thin",
            scrollbarColor: "#b0b0b0 transparent",

            // Chrome, Edge, Safari
            "&::-webkit-scrollbar": {
              height: "6px",
            },
            "&::-webkit-scrollbar-track": {
              background: "transparent",
            },
            "&::-webkit-scrollbar-thumb": {
              background: "linear-gradient(90deg, #999, #bbb)",
              borderRadius: "10px",
            },
            "&::-webkit-scrollbar-thumb:hover": {
              background: "linear-gradient(90deg, #777, #aaa)",
            },
          })}
        >
          <Grid
            item
            size={{ xs: 2 }}
            sx={(theme) => ({
              bgcolor: theme.palette.action.selected,
              p: 1,
              borderRadius: 2,
              height: "fit-content",

              minWidth: 250,
              flexShrink: 0,
            })}
          >
            <KanbanCardStatusComp
              headerIcon={ticketStatusConfig["Review Pending"].icon}
              headerTitle={
                <Typography variant="subtitle2">Review Pending</Typography>
              }
              kanbanCardDataComp={
                <List>
                  {ticket_listing?.data
                    ?.filter(
                      (tic) =>
                        tic.status ===
                        ticketStatusConfig["Review Pending"].text,
                    )
                    .map((ticket) => (
                      <UserSupportTicketDataSingleComp ticket={ticket} />
                    ))}
                </List>
              }
              NewTicketButton={
                role === "Admin" ? null : matchesTab ? (
                  <IconButton
                    color="secondary"
                    onClick={handleOpenKanbanCreateTicketModal}
                     sx={{mt:2}}
                  >
                    <AddOutlinedIcon fontSize="small" />
                  </IconButton>
                ) : (
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={handleOpenKanbanCreateTicketModal}
                    startIcon={<AddOutlinedIcon />}
                    fullWidth
                    sx={{mt:2}}
                  >
                    New Ticket
                  </Button>
                )
              }
            />
          </Grid>
          <Grid
            item
            size={{ xs: 2 }}
            sx={(theme) => ({
              bgcolor: theme.palette.action.selected,
              p: 1,
              borderRadius: 2,
              height: "fit-content",
              minWidth: 250,
              flexShrink: 0,
            })}
          >
            <KanbanCardStatusComp
              headerIcon={ticketStatusConfig["Review Passed"].icon}
              headerTitle={
                <Typography variant="subtitle2">Review Passed</Typography>
              }
              kanbanCardDataComp={
                <List>
                  {ticket_listing?.data
                    ?.filter(
                      (tic) =>
                        tic.status === ticketStatusConfig["Review Passed"].text,
                    )
                    .map((ticket) => (
                      <UserSupportTicketDataSingleComp ticket={ticket} />
                    ))}
                </List>
              }
            />
          </Grid>
          <Grid
            item
            size={{ xs: 2 }}
            sx={(theme) => ({
              bgcolor: theme.palette.action.selected,
              p: 1,
              borderRadius: 2,
              height: "fit-content",
              minWidth: 250,
              flexShrink: 0,
            })}
          >
            <KanbanCardStatusComp
              headerIcon={ticketStatusConfig["Review Failed"].icon}
              headerTitle={
                <Typography variant="subtitle2">Review Failed</Typography>
              }
              kanbanCardDataComp={
                <List>
                  {ticket_listing?.data
                    ?.filter(
                      (tic) =>
                        tic.status === ticketStatusConfig["Review Failed"].text,
                    )
                    .map((ticket) => (
                      <UserSupportTicketDataSingleComp ticket={ticket} />
                    ))}
                </List>
              }
            />
          </Grid>
          <Grid
            item
            size={{ xs: 2 }}
            sx={(theme) => ({
              bgcolor: theme.palette.action.selected,
              p: 1,
              borderRadius: 2,
              height: "fit-content",
              minWidth: 250,
              flexShrink: 0,
            })}
          >
            <KanbanCardStatusComp
              headerIcon={ticketStatusConfig.Open.icon}
              headerTitle={<Typography variant="subtitle2">Open</Typography>}
              kanbanCardDataComp={
                <List>
                  {ticket_listing?.data
                    ?.filter(
                      (tic) => tic.status === ticketStatusConfig["Open"].text,
                    )
                    .map((ticket) => (
                      <UserSupportTicketDataSingleComp ticket={ticket} />
                    ))}
                </List>
              }
            />
          </Grid>
          <Grid
            item
            size={{ xs: 2 }}
            sx={(theme) => ({
              bgcolor: theme.palette.action.selected,
              p: 1,
              borderRadius: 2,
              height: "fit-content",
              minWidth: 250,
              flexShrink: 0,
            })}
          >
            <KanbanCardStatusComp
              headerIcon={ticketStatusConfig["In Progress"].icon}
              headerTitle={
                <Typography variant="subtitle2">In Progress</Typography>
              }
              kanbanCardDataComp={
                <List>
                  {ticket_listing?.data
                    ?.filter(
                      (tic) =>
                        tic.status === ticketStatusConfig["In Progress"].text,
                    )
                    .map((ticket) => (
                      <UserSupportTicketDataSingleComp ticket={ticket} />
                    ))}
                </List>
              }
            />
          </Grid>
          <Grid
            item
            size={{ xs: 2 }}
            sx={(theme) => ({
              bgcolor: theme.palette.action.selected,
              p: 1,
              borderRadius: 2,
              height: "fit-content",
              minWidth: 250,
              flexShrink: 0,
            })}
          >
            <KanbanCardStatusComp
              headerIcon={ticketStatusConfig.Closed.icon}
              headerTitle={<Typography variant="subtitle2">Closed</Typography>}
              kanbanCardDataComp={
                <List>
                  {ticket_listing?.data
                    ?.filter(
                      (tic) => tic.status === ticketStatusConfig.Closed.text,
                    )
                    .map((ticket) => (
                      <UserSupportTicketDataSingleComp ticket={ticket} />
                    ))}
                </List>
              }
            />
          </Grid>
        </Grid>
        <Divider />

        <TableFootercontainer footerContentRight={true}>
          <TableCustomPaginationReactTable
            pg_no={ticket_listing.pg_no}
            total_pages={ticket_listing.total_pages}
            handleInitialPage={handleInitialPage}
            on_page_data={ticket_listing.on_page_data_client}
            next_page={ticket_listing.next_page}
            handleOnPageDataChange={handleOnPageDataChange}
            handlePaginationOnChange={handlePaginationOnChange}
            disableOnPage={true}
            tablePaginationheightNone={true}
          />
        </TableFootercontainer>
      </Box>
      <Modal
        open={openKanbanCreateTicketModal}
        onClose={handleCloseKanbanCreateTicketModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          sx={(theme) => ({
            top: "10%",
            position: "absolute",
            background: "#FFF",
            width: "85%",
            height: "calc(100vh - 100px)",
            maxHeight: "calc(100vh - 100px)",
            margin: "auto",
            left: "10%",
            padding: 2,
            pointerEvents: "painted",
            borderRadius: 2,
            [theme.breakpoints.down("sm")]: {
              top: "10%",
              overflowY: "scroll",
              height: "calc(100vh - 150px)",
            },
          })}
        >
          <UserSupportCreateTicketComp
            closeModal={handleCloseKanbanCreateTicketModal}
          />
        </Box>
      </Modal>
    </LayoutContainer>
  );
};

export default UserSupportTicketDashboardComp;

const UserSupportTicketDataSingleComp = ({ ticket }) => {
  const history = useHistory();
  const onClickTicket = () => {
    history.push(`user-support-ticket/${ticket?.pk}`);
  };
  return (
    <ListItem
      onClick={onClickTicket}
      disablePadding
      sx={(theme) => ({
        bgcolor: theme.palette.background.paper,
        cursor: "pointer",
        borderRadius: 2,
        position: "relative",
        p: 1,
        mb: 1,
        overflow: "hidden",
        "&:hover": {
          background: `linear-gradient(
    90deg,
    ${ticketStatusConfig?.[ticket.status]?.color}15,
    transparent
  )`,
        },
        "&:hover::before": {
          content: '""',
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: "3px",
          borderRadius: "inherit",
          bgcolor: ticketStatusConfig?.[ticket.status]?.color,
          transform: "scaleY(2)",
          transformOrigin: "center",
          transition: "transform 0.2s ease", // same as icon color
        },
      })}
    >
      <ListItemIcon sx={{ minWidth: "auto", mr: 1 }}>
        {ticket?.ticket_type === "Bug Report" ? (
          <BugReportOutlinedIcon fontSize="small" color="error" />
        ) : ticket?.ticket_type === "Feature Request" ? (
          <PlayCircleOutlineIcon fontSize="small" color="primary" />
        ) : (
          <LightbulbOutlinedIcon color="info" fontSize="small" />
        )}
      </ListItemIcon>

      <ListItemText
        primary={ticket?.subject}
        secondary={`${ticket?.ticket_number} `}
        slotProps={{
          primary: {
            sx: {
              fontSize: "12px",
              fontWeight: 500,
              color: "text.primary",
              lineHeight: 1.8,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            },
          },
          secondary: {
            sx: {
              fontSize: 10,
              color: "text.primary",
              opacity: 0.8,
              lineHeight: 1.6,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            },
          },
        }}
      />

      <Tooltip
        title={
          <Stack
            direction={"column"}
            alignItems={"flex-start"}
            justifyContent={"flex-start"}
          >
            <Typography variant="body2" fontWeight={500}>
              {ticket?.subject}
            </Typography>
            <Typography variant="caption">
              Reported By : {ticket?.reported_by}
            </Typography>
            <Typography variant="caption">Site: {ticket?.site}</Typography>
            <Typography variant="caption">
              Created At: {ticket?.created_at}
            </Typography>
          </Stack>
        }
        slotProps={{
          tooltip: {
            sx: {
              bgcolor: "black",
              color: "white",
              fontSize: 12,
              borderRadius: "8px",
              px: 1.5,
              py: 1,
            },
          },
          arrow: {
            sx: {
              color: "black",
            },
          },
        }}
        arrow
      >
        <IconButton sx={{ ml: "auto" }}>
          <MoreVertOutlinedIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </ListItem>
  );
};
