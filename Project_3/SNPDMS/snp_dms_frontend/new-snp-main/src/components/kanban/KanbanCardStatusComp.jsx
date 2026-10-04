import {
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
} from "@mui/material";
import React from "react";

const KanbanCardStatusComp = ({
  headerTitle,
  headerIcon,
  kanbanCardDataComp,
  ...props
}) => {
  return (
    <Stack
      direction={"column"}
      alignItems={"flex-start"}
      justifyContent={"flex-start"}
      spacing={2}
    >
      <Box sx={{ flex: 0.1, width: "100%" }}>
        {" "}
        <ListItem
          disablePadding
          sx={(theme) => ({
            bgcolor: theme.palette.action.selected,
            borderRadius: 2,
            px: 1,
            py: 0.5,
          })}
        >
          <ListItemIcon sx={{ minWidth: "auto", mr: 1 }}>
            {headerIcon}
          </ListItemIcon>
          <ListItemText primary={headerTitle} />
        </ListItem>
        {props?.NewTicketButton && props?.NewTicketButton}
      </Box>
      <Box
        sx={(theme) => ({
          flex: 0.9,
          width: "100%",
          overflowY: "auto",
          maxHeight: "calc(100vh - 400px)",
          scrollBehavior: "smooth",
          [theme.breakpoints.down('sm')]: {
            maxHeight: "calc(100vh - 200px)",
          },
          /* Firefox */
          scrollbarWidth: "none", // 👈 hide completely
          "&:hover": {
            scrollbarWidth: "thin", // 👈 show on hover
          },

          /* Chrome, Edge, Safari */
          "&::-webkit-scrollbar": {
            width: "0px",
            transition: "width 0.3s ease",
          },
          "&:hover::-webkit-scrollbar": {
            width: "6px",
          },

          "&::-webkit-scrollbar-track": {
            background: "transparent",
            marginBlock: "6px",
          },

          "&::-webkit-scrollbar-thumb": {
            background: "linear-gradient(180deg, #9e9e9e, #c7c7c7)",
            borderRadius: "10px",
            transition: "all 0.3s ease",
          },

          "&::-webkit-scrollbar-thumb:hover": {
            background: "linear-gradient(180deg, #7a7a7a, #a8a8a8)",
          },
        })}
      >

        {kanbanCardDataComp}
      </Box>
    </Stack>
  );
};

export default KanbanCardStatusComp;
