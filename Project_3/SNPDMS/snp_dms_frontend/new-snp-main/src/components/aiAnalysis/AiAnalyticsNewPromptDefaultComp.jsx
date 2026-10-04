import {
  Box,
  Chip,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { Image } from "semantic-ui-react";
import AI_UNSON_IMAGE from "@/assets/images/ai_union.png";
import { useDispatch } from "react-redux";
import { useSnackbar } from "notistack";
import SendIcon from "@mui/icons-material/Send";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import { aiAnalyticsQueryAction } from "@/actions/AIAnalyticsAction";

const ALLOWED_TYPES = [
  "application/pdf",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

const AiAnalyticsNewPromptDefaultComp = () => {
  const dispatch = useDispatch();
  const notify = useSnackbar().enqueueSnackbar;
  const [prompt, setPrompt] = useState("");
  const [files, setFiles] = useState([]);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);

    const validFiles = selectedFiles.filter((file) =>
      ALLOWED_TYPES.includes(file.type)
    );

    if (validFiles.length !== selectedFiles.length) {
      alert("Only PDF and Excel files are allowed.");
    }

    setFiles((prev) => [...prev, ...validFiles]);
    e.target.value = null;
  };

  const handleRemoveFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSend = () => {
    if (!prompt.trim() && files.length === 0) return;

    let formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });
    formData.append("prompt", prompt);

    dispatch(aiAnalyticsQueryAction(formData, setPrompt, setFiles, notify));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  return (
    <Stack
      sx={{ height: "80%" }}
      direction={"column"}
      alignItems={"center"}
      justifyContent={"center"}
    >
      <Image
        src={AI_UNSON_IMAGE}
        style={{
          height: 30,
          width: 30,
          cursor: "pointer",
        }}
      />
      <Typography variant="h4">
        <span style={{ fontWeight: 600 }}>AI</span> Analytics Dashboard
      </Typography>
      <Typography variant="body2" sx={{ mt: 1 }}>
        Select your File & add your prompts like below
      </Typography>
      <Stack
        direction={"row"}
        alignItems={"center"}
        justifyContent={"center"}
        spacing={2}
        pt={2}
        mt={2}
      >
        <Paper sx={{ p: 2, py: 4, borderRadius: 2 }}>
          <Typography variant="body2" sx={{ textAlign: "center" }}>
            What is the revenue for this month ?
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, py: 4, borderRadius: 2 }}>
          <Typography variant="body2" sx={{ textAlign: "center" }}>
            What is the revenue of West Bengal ?
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, py: 4, borderRadius: 2 }}>
          <Typography variant="body2" sx={{ textAlign: "center" }}>
            Show me the Revenue of MSC Client ?
          </Typography>
        </Paper>
      </Stack>
      <Paper
        elevation={3}
        sx={{
          p: 1.5,
          borderRadius: 3,
          width: "100%",
          maxWidth: 800,
          mx: "auto",
          position: "absolute",
          bottom: 20,
          left: 0,
          right: 0,
        }}
      >
        {/* Selected files */}
        {files.length > 0 && (
          <Stack direction="row" spacing={1} sx={{ mb: 1, flexWrap: "wrap" }}>
            {files.map((file, index) => (
              <Chip
                key={index}
                label={file.name}
                onDelete={() => handleRemoveFile(index)}
                size="small"
              />
            ))}
          </Stack>
        )}

        {/* Input row */}
        <Box display="flex" alignItems="center" gap={1}>
          <IconButton component="label">
            <AttachFileIcon />
            <input
              type="file"
              accept=".pdf,.xls,.xlsx"
              hidden
              multiple
              onChange={handleFileChange}
            />
          </IconButton>

          <TextField
            fullWidth
            multiline
            maxRows={4}
            placeholder="Ask anything..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
          />

          <IconButton
            color="primary"
            onClick={handleSend}
            disabled={!prompt.trim()}
          >
            <SendIcon />
          </IconButton>
        </Box>
      </Paper>
    </Stack>
  );
};

export default AiAnalyticsNewPromptDefaultComp;
