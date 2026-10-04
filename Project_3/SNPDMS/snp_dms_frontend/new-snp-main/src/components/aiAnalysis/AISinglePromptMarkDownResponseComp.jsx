import {
  Divider,
  List,
  ListItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const AISinglePromptMarkDownResponseComp = ({ content }) => {
  const cleanedText = content
    ?.replace(/```markdown/g, "")
    ?.replace(/```/g, "")
    ?.replace(/\*\*/g, "");

  return (
    <Paper
      elevation={0}
      sx={{
        p: 4,
        mt:1,
        borderRadius: 2,
        overflowY: "scroll",
         maxHeight: "calc(100vh - 180px)",
         pb:24,
        "&::-webkit-scrollbar": {
          width: 0,
        },
      }}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h3: ({ children }) => (
            <Typography variant="h5" fontWeight={600} mt={3} mb={1}>
              {children}
            </Typography>
          ),
          h4: ({ children }) => (
            <Typography variant="h6" fontWeight={500} mt={2} mb={1}>
              {children}
            </Typography>
          ),
          p: ({ children }) => (
            <Typography variant="body1" mb={1.5}>
              {children}
            </Typography>
          ),
          li: ({ children }) => (
            <ListItem sx={{ pl: 2, display: "list-item" }}>
              <Typography variant="body2">{children}</Typography>
            </ListItem>
          ),
          ul: ({ children }) => (
            <List sx={{ listStyleType: "disc", pl: 3 }}>{children}</List>
          ),
          hr: () => <Divider sx={{ my: 3 }} />,
          table: ({ children }) => (
            <Table
              size="small"
              sx={{
                my: 2,
                border: "1px solid #e0e0e0",
                borderRadius: 2,
              }}
            >
              {children}
            </Table>
          ),
          thead: ({ children }) => (
            <TableHead sx={{ backgroundColor: "#f5f7fa" }}>
              {children}
            </TableHead>
          ),
          tbody: ({ children }) => <TableBody>{children}</TableBody>,
          tr: ({ children }) => <TableRow>{children}</TableRow>,
          th: ({ children }) => (
            <TableCell sx={{ fontWeight: 600 }}>{children}</TableCell>
          ),
          td: ({ children }) => <TableCell>{children}</TableCell>,
        }}
      >
        {cleanedText}
      </ReactMarkdown>
    </Paper>
  );
};

export default AISinglePromptMarkDownResponseComp;
