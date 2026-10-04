import React from "react";
import {
  Box,
  Button,
  Typography,
  Stack,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  Paper,
  ListItemText,
  alpha,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DeleteIcon from "@mui/icons-material/Delete";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import FolderIcon from "@mui/icons-material/Folder";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteAttachmentSingleUserSupportTicketAction,
  downloadAttachmentSingleUserSupportTicketAction,
  uploadAttachmentSingleUserSupportTicketAction,
} from "@/actions/UserSupportAction";
import { useSnackbar } from "notistack";

const UserSupportSingleAttachmentSection = ({ ticket }) => {
  const dispatch = useDispatch();
  const notify = useSnackbar().enqueueSnackbar;
  const { role } = useSelector((state) => state.user);
  const inputRef = React.useRef(null);
  const [file, setFile] = React.useState(null);
  const [error, setError] = React.useState("");

  // ✅ Internal onChange handler
  const handleFileChange = (event) => {
    console.log("On Change");

    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.size > 5 * 1024 * 1024) {
      setError(`File size should be less than ${5}MB`);
      return;
    }

    setError("");
    setFile(selectedFile);
  };

  const handleRemove = () => {
    setFile(null);
    setError("");
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleFileUpload = () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    dispatch(
      uploadAttachmentSingleUserSupportTicketAction(
        ticket.pk,
        formData,
        handleRemove,
        notify
      )
    );
  };

  return (
    <Box>
      {role === "Admin" ? null : (
        <Box
          sx={{
            border: "1px dashed",
            borderColor: error ? "error.main" : "divider",
            borderRadius: 2,
            p: 1,
          }}
        >
          <input
            ref={inputRef}
            type="file"
            hidden
            accept={".png,.jpg,.jpeg,.pdf,.xls,.xlsx"}
            onChange={handleFileChange}
          />

          <Stack spacing={2} alignItems="center">
            <UploadFileIcon fontSize="large" color="action" />

            <Button
              variant="contained"
              onClick={() => inputRef.current?.click()}
            >
              Select File
            </Button>

            <Typography variant="body2" color="text.secondary">
              Supported formats: Images (PNG, JPG) & PDF | Max {5}MB
            </Typography>

            {error && (
              <Typography variant="body2" color="error">
                {error}
              </Typography>
            )}

            {file && (
              <Box
                sx={{
                  width: "100%",
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                  p: 1.5,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Typography variant="body2" noWrap>
                  {file.name}
                </Typography>
                <Stack
                  direction={"row"}
                  alignItems={"center"}
                  justifyContent={"flex-end"}
                  spacing={2}
                >
                  <Button
                    startIcon={<CloudUploadOutlinedIcon fontSize="small" />}
                    size="small"
                    color="info"
                    variant="contained"
                    onClick={handleFileUpload}
                  >
                    Upload Attachment
                  </Button>
                  <IconButton color="error" onClick={handleRemove}>
                    <DeleteIcon />
                  </IconButton>
                </Stack>
              </Box>
            )}
          </Stack>
        </Box>
      )}
      {ticket?.attachments?.length > 0 && (
        <Paper
          sx={{
            height: 200,
            overflowY: "scroll",
            pb: 22,
            mt: 1,
            "&::-webkit-scrollbar": {
              width: 0,
            },
          }}
          elevation={0}
        >
          <List
            sx={(theme) => ({
              width: "100%",
            })}
          >
            {ticket?.attachments?.map((val, index) => (
              <ListItem
                sx={(theme) => ({
                  bgcolor: alpha(theme.palette.secondary.main, 0.05),
                  borderRadius: 4,
                  mt: 1,
                })}
                secondaryAction={
                  <Stack
                    direction={"row"}
                    alignItems={"center"}
                    justifyContent={"flex-end"}
                    spacing={2}
                  >
                    <IconButton
                      color="success"
                      onClick={() =>
                        dispatch(
                          downloadAttachmentSingleUserSupportTicketAction(
                            val.pk,
                            val.file_name,
                            notify
                          )
                        )
                      }
                      edge="end"
                      aria-label="download"
                    >
                      <FileDownloadOutlinedIcon />
                    </IconButton>
                    <IconButton
                      onClick={() =>
                        dispatch(
                          deleteAttachmentSingleUserSupportTicketAction(
                            val.pk,
                            ticket?.pk,
                            notify
                          )
                        )
                      }
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Stack>
                }
              >
                <ListItemAvatar>
                  <Avatar>
                    <FolderIcon fontSize="medium" />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Stack spacing={0}>
                      <Typography
                        sx={{ fontWeight: 500 }}
                        variant="body2"
                        lineHeight={2}
                      >
                        {val?.file_name}
                      </Typography>
                      <Stack direction="row" spacing={4} alignItems="center">
                        <Stack direction="row" spacing={1} alignItems="center">
                          <ImageOutlinedIcon fontSize="small" />
                          <Typography variant="caption">
                            {val?.file_type}
                          </Typography>
                        </Stack>
                      </Stack>
                    </Stack>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
};

export default UserSupportSingleAttachmentSection;
