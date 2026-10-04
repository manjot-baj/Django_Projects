import {
  createJiraTicketSingleUserSupportTicketAction,
  deleteSingleUserSupportTicketAction,
  getSingleUserSupportTicketAction,
  statusChangeSingleUserSupportTicketAction,
  updateModuleNameSingleUserSupportTicketAction,
} from "@/actions/UserSupportAction";
import { useSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Divider,
  Box,
  CardHeader,
  Stack,
  Paper,
  alpha,
  ToggleButtonGroup,
  ToggleButton,
  Button,
  Menu,
  MenuItem,
  TextField,
  IconButton,
  Link,
  Tooltip,
  useMediaQuery,
} from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PersonIcon from "@mui/icons-material/Person";
import BugReportOutlinedIcon from "@mui/icons-material/BugReportOutlined";
import LabelImportantOutlinedIcon from "@mui/icons-material/LabelImportantOutlined";
import CommentOutlinedIcon from "@mui/icons-material/CommentOutlined";
import AttachFileOutlinedIcon from "@mui/icons-material/AttachFileOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import UserSupportSingleCommentSection from "./UserSupportSingleCommentSection";
import UserSupportSingleHistorySection from "./UserSupportSingleHistorySection";
import UserSupportSingleAttachmentSection from "./UserSupportSingleAttachmentSection";
import { DeleteOutline } from "@mui/icons-material";
import { useHistory } from "react-router-dom";
import ArrowDropDownOutlinedIcon from "@mui/icons-material/ArrowDropDownOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import GradeOutlinedIcon from "@mui/icons-material/GradeOutlined";
import { Image } from "semantic-ui-react";
import JIRAIMAGE from "@/assets/images/jira.png";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";

const statusBgColor = {
  "Review Pending": "#FFB703", // dark amber
  "Review Passed": "#2E7D32", // dark green
  "Review Failed": "#C62828", // dark red
  Open: "#1565C0", // deep blue
  "In Progress": "#6A1B9A", // deep purple
  Closed: "#00897B", // dark teal
};

const singleTicketStatus = {
  "Review Pending": ["Review Passed", "Review Failed"], // dark amber
  "Review Passed": ["Review Pending", "Review Failed", "Open"], // dark green
  "Review Failed": ["Review Pending", "Review Passed"], // dark red
  Open: ["In Progress", "Closed"], // deep blue
  "In Progress": ["Closed", "Open"], // deep purple
  Closed: ["Open", "In Progress"],
};

const UserSupportSingleTicketComp = () => {
  const { pk } = useParams();
  const dispatch = useDispatch();
  const history = useHistory();
  const notify = useSnackbar().enqueueSnackbar;
  const [alignment, setAlignment] = React.useState("comments");
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [ticket_description, setTicketDescription] = useState("");
  const [ticket_subject, setTicketSubject] = useState("");
  const open = Boolean(anchorEl);
  const [anchorElModule, setAnchorElModule] = useState(null);
  const openModule = Boolean(anchorElModule);
  const [anchorElTicketType, setAnchorElModuleTicketType] = useState(null);
  const openModuleTicketType = Boolean(anchorElTicketType);
  const matchesTab = useMediaQuery((theme) => theme.breakpoints.down("lg"));

  const handleCommentToggle = (event, newAlignment) => {
    setAlignment(newAlignment);
  };
  const { get_single_ticket, ticket_dropdown } = useSelector(
    (state) => state.UserSupportReducer
  );
  const { role } = useSelector((state) => state.user);
  useEffect(() => {
    if (pk) {
      dispatch(getSingleUserSupportTicketAction(pk, notify));
    }
  }, [pk]);

  const handleDeleteTicket = () => {
    dispatch(deleteSingleUserSupportTicketAction(pk, history, notify));
  };

  useEffect(() => {
    setTicketDescription(get_single_ticket?.description);
    setTicketSubject(get_single_ticket?.subject);
  }, [get_single_ticket]);

  const handleDescriptionBlur = () => {
    if (role === "Admin") {
      return;
    }
    if (!ticket_description.trim()) {
      setTicketDescription(get_single_ticket?.description);
      return;
    }
    dispatch(
      updateModuleNameSingleUserSupportTicketAction(
        pk,
        ticket_description,
        "description",
        setAnchorElModule,
        notify
      )
    );
  };

  const handleSubjectBlur = () => {
    if (role === "Admin") {
      return;
    }
    if (!ticket_subject.trim()) {
      setTicketSubject(get_single_ticket?.subject);
      return;
    }
    dispatch(
      updateModuleNameSingleUserSupportTicketAction(
        pk,
        ticket_subject,
        "subject",
        setAnchorElModule,
        notify
      )
    );
  };

  return (
    <Card elevation={0}>
      <CardHeader
        sx={(theme) => ({
          [theme.breakpoints.down("lg")]: {
            p: 0,
          },
        })}
        title={
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            flexWrap={ matchesTab ? "wrap":'nowrap'}
          >
            <TextField
              variant="outlined"
              name="subject"
              autoComplete="off"
              fullWidth
              type="text"
              size="small"
              value={ticket_subject}
              onChange={(e) => {
                if (role === "Admin") {
                  return;
                }
                setTicketSubject(e.target.value);
              }}
              onBlur={handleSubjectBlur}
              sx={{
                ml: -2,

                "& .MuiInputBase-input": {
                  fontSize: "20px",
                  fontWeight: 600,
                },
                "& .MuiOutlinedInput-notchedOutline": {
                  border: "none",
                },
              }}
            />

            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={() => setAnchorEl(null)}
            >
              {singleTicketStatus?.[get_single_ticket?.status]?.map((item) => (
                <MenuItem
                  onClick={() =>
                    dispatch(
                      statusChangeSingleUserSupportTicketAction(
                        pk,
                        item,
                        notify
                      )
                    )
                  }
                  key={item}
                >
                  {item}
                </MenuItem>
              ))}
            </Menu>
            <Chip
              label={get_single_ticket?.status}
              sx={(theme) => ({
                borderColor: statusBgColor?.[get_single_ticket?.status],
                color: statusBgColor?.[get_single_ticket?.status],
                [theme.breakpoints.down("lg")]: {
                  marginLeft: "auto", // push to right
                },
              })}
              variant={
                get_single_ticket?.status === "Closed" ? "filled" : "outlined"
              }
              onDelete={(e) =>
                role === "Admin" ? setAnchorEl(e.currentTarget) : null
              }
              deleteIcon={
                <ArrowDropDownOutlinedIcon
                  sx={{
                    fill: statusBgColor?.[get_single_ticket?.status],
                  }}
                  fontSize="small"
                />
              }
            />
          </Stack>
        }
        subheader={
          <Stack
            direction={"row"}
            alignItems={"center"}
            justifyContent={"flex-start"}
            spacing={1}
            sx={(theme)=>({
                [theme.breakpoints.down('lg')]:{
                  mt:2
                }
            })}
          >
            <IconButton
              onClick={() =>
                navigator.clipboard.writeText(get_single_ticket?.ticket_number)
              }
              color="primary"
              size="small"
              sx={(theme)=>({
                [theme.breakpoints.down('lg')]:{
                  display:'none'
                }
              })}
            >
              <ContentCopyOutlinedIcon />
            </IconButton>
            <Typography
              variant="body2"
              sx={(theme) => ({
                color: theme.palette.secondary.main,
              })}
            >
              Ticket ID: {get_single_ticket?.ticket_number}
            </Typography>

            {get_single_ticket?.jira_ticket_url && (
              <Tooltip title={get_single_ticket?.jira_created_at}>
                <Link
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-start",
                    gap: 2,
                    pl: 4,
                  }}
                  target="_blank"
                  rel="noopener noreferrer"
                  href={get_single_ticket?.jira_ticket_url}
                >
                  <Image src={JIRAIMAGE} width={20} height={20} />
                  {get_single_ticket?.jira_ticket_id}
                </Link>
              </Tooltip>
            )}
          </Stack>
        }
      />
      <CardContent
        sx={(theme) => ({
          mt: -2,
          [theme.breakpoints.down("lg")]: {
            px: 0,
            py: 4,
          },
        })}
      >
        <Divider sx={{ mb: 2 }} />
        <Box
          sx={(theme) => ({
            mb: 3,
            flexWrap: "nowrap",
            overflowX: "auto",
            [theme.breakpoints.down("lg")]: {
              pr: 12,
            },
            "&::-webkit-scrollbar": {
              display: "none",
            },
            scrollbarWidth: "none",
          })}
        >
          <Stack
            direction="row"
            spacing={4}
            sx={(theme) => ({
              [theme.breakpoints.down("lg")]: {
                minWidth: 1000,
              },
            })}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <PersonIcon fontSize="small" />
              <Typography variant="body2">
                {get_single_ticket?.reported_by}
              </Typography>
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center">
              <AccessTimeIcon fontSize="small" />
              <Typography variant="body2">
                {get_single_ticket?.created_at}
              </Typography>
            </Stack>
            <Menu
              anchorEl={anchorElModule}
              open={openModule}
              onClose={() => setAnchorElModule(null)}
            >
              {ticket_dropdown?.ticket_modules_list?.map((item) => (
                <MenuItem
                  onClick={() =>
                    dispatch(
                      updateModuleNameSingleUserSupportTicketAction(
                        pk,
                        item,
                        "module_name",
                        setAnchorElModule,
                        notify
                      )
                    )
                  }
                  key={item}
                >
                  {item}
                </MenuItem>
              ))}
            </Menu>
            {role === "Admin" ? (
              <Chip
                icon={<LabelImportantOutlinedIcon />}
                variant="filled"
                color="default"
                label={get_single_ticket?.module_name}
              />
            ) : (
              <Chip
                icon={<LabelImportantOutlinedIcon />}
                variant="filled"
                color="default"
                label={get_single_ticket?.module_name}
                onDelete={(e) => setAnchorElModule(e.currentTarget)}
                deleteIcon={<ArrowDropDownOutlinedIcon fontSize="small" />}
              />
            )}
            {role === "Admin" ? (
              <Chip
                icon={
                  get_single_ticket?.ticket_type === "Bug Report" ? (
                    <BugReportOutlinedIcon />
                  ) : get_single_ticket?.ticket_type === "Feature Request" ? (
                    <GradeOutlinedIcon />
                  ) : (
                    <CheckCircleOutlinedIcon />
                  )
                }
                variant="filled"
                color={
                  get_single_ticket?.ticket_type === "Bug Report"
                    ? "error"
                    : get_single_ticket?.ticket_type === "Feature Request"
                    ? "primary"
                    : "info"
                }
                label={get_single_ticket?.ticket_type}
              />
            ) : (
              <Chip
                icon={
                  get_single_ticket?.ticket_type === "Bug Report" ? (
                    <BugReportOutlinedIcon />
                  ) : get_single_ticket?.ticket_type === "Feature Request" ? (
                    <GradeOutlinedIcon />
                  ) : (
                    <CheckCircleOutlinedIcon />
                  )
                }
                variant="filled"
                color={
                  get_single_ticket?.ticket_type === "Bug Report"
                    ? "error"
                    : get_single_ticket?.ticket_type === "Feature Request"
                    ? "primary"
                    : "info"
                }
                label={get_single_ticket?.ticket_type}
                onDelete={(e) => setAnchorElModuleTicketType(e.currentTarget)}
                deleteIcon={<ArrowDropDownOutlinedIcon fontSize="small" />}
              />
            )}

            <Menu
              anchorEl={anchorElTicketType}
              open={openModuleTicketType}
              onClose={() => setAnchorElModuleTicketType(null)}
            >
              {ticket_dropdown?.ticket_type_list?.map((item) => (
                <MenuItem
                  onClick={() =>
                    dispatch(
                      updateModuleNameSingleUserSupportTicketAction(
                        pk,
                        item,
                        "ticket_type",
                        setAnchorElModule,
                        notify
                      )
                    )
                  }
                  key={item}
                >
                  {item}
                </MenuItem>
              ))}
            </Menu>
            {role === "Admin" &&
              get_single_ticket?.status === "Review Passed" &&
              !get_single_ticket?.jira_ticket_url && (
                <Button
                  onClick={() =>
                    dispatch(
                      createJiraTicketSingleUserSupportTicketAction(pk, notify)
                    )
                  }
                  startIcon={<Image src={JIRAIMAGE} width={20} height={20} />}
                  variant="contained"
                  color="secondary"
                  size="small"
                >
                  Create Jira
                </Button>
              )}
            {get_single_ticket?.status === "Review Pending" &&
              role !== "Admin" && (
                <Button
                  startIcon={<DeleteOutline />}
                  color="error"
                  variant="text"
                  size="small"
                  onClick={handleDeleteTicket}
                >
                  Delete Ticket
                </Button>
              )}
          </Stack>
        </Box>
        <Paper
          elevation={0}
          sx={(theme) => ({
            px: 1,
            minHeight: 100,
            backgroundColor: alpha(theme.palette.info.main, 0.05),
          })}
        >
          <TextField
            variant="outlined"
            multiline
            rows={4}
            type="text"
            size="small"
            fullWidth
            name="description"
            value={ticket_description}
            onChange={(e) => {
              if (role === "Admin") {
                return;
              }
              setTicketDescription(e.target.value);
            }}
            sx={(theme) => ({
              marginTop: 1,
              "& .MuiOutlinedInput-notchedOutline": {
                border: "none", // default
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                border: `2px solid ${theme.palette.primary.main}`, // hover
              },
              "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                {
                  border: `2px solid ${theme.palette.primary.main}`, // focused
                },
            })}
            onBlur={handleDescriptionBlur}
          />
          {/* <Typography variant="body2">{ticket_description}</Typography> */}
        </Paper>

        <ToggleButtonGroup
          value={alignment}
          exclusive
          onChange={handleCommentToggle}
          aria-label="Ticket Toggle "
          sx={{
            mt: 4,
          }}
          size="small"
          color="secondary"
        >
          <ToggleButton value="comments" aria-label="Comments">
            <CommentOutlinedIcon sx={{ mr: 1 }} /> Comments
          </ToggleButton>
          <ToggleButton value="attachments" aria-label="Attachment Files">
            <AttachFileOutlinedIcon sx={{ mr: 1 }} /> Attachments
          </ToggleButton>
          <ToggleButton value="history" aria-label="history">
            <HistoryOutlinedIcon sx={{ mr: 1 }} /> History
          </ToggleButton>
        </ToggleButtonGroup>
        <Box sx={{ minHeight: 300 }}>
          {alignment === "comments" && (
            <UserSupportSingleCommentSection ticket={get_single_ticket} />
          )}
          {alignment === "history" && (
            <UserSupportSingleHistorySection ticket={get_single_ticket} />
          )}
          {alignment === "attachments" && (
            <UserSupportSingleAttachmentSection ticket={get_single_ticket} />
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default UserSupportSingleTicketComp;
