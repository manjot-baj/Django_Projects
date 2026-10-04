import {
  Box,
  IconButton,
  List,
  ListItem,
  Paper,
  Typography,
} from "@mui/material";

import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { FieldArray } from "formik";

const AddedToolListingcomponent = ({ toolListing }) => {
  return (
    <FieldArray name="tool_list">
      {({ push, remove }) => (
        <Paper
          elevation={0}
          sx={{
            mt: 3,
            width: "100%",
            borderRadius: 3,
            border: "1px solid #e2e8f0",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <Box
            sx={{
              px: 2,
              py: 1,
              display: "flex",
              justifyContent: "space-between",
              borderBottom: "1px solid #e2e8f0",
              bgcolor: "#f8fafc",
            }}
          >
            <Typography variant="body2" fontWeight={600}>
              Added Tools
            </Typography>

            <Typography color="textDisabled">
              {toolListing?.length} Items
            </Typography>
          </Box>

          <List
            dense
            sx={(theme) => ({
              minHeight: 300,
              maxHeight: 300, // adjust as needed
              [theme.breakpoints.down("lg")]: {
                minHeight: 200,
                maxHeight: 200,
              },
              overflowY: "auto",
              p: 0,

              "&::-webkit-scrollbar": {
                width: 6,
              },

              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "#7769c2",
                borderRadius: 10,
              },

              "&::-webkit-scrollbar-track": {
                backgroundColor: "#f8fafc",
              },
            })}
          >
            {toolListing?.map((tool, index) => (
              <ListItem
                key={index}
                divider
                sx={{
                  py: 1,
                  px: 1.5,
                }}
                secondaryAction={
                  <IconButton
                    size="small"
                    onClick={() => remove(index)}
                    color="error"
                  >
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                }
              >
                <Box
                  sx={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    pr: 5,
                  }}
                >
                  {/* Tool Name */}
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      sx={{
                        fontSize: "13px",
                        fontWeight: 600,
                        lineHeight: 1.2,
                      }}
                    >
                      {tool.name}
                    </Typography>

                    <Typography
                      sx={{
                        fontSize: "11px",
                      }}
                      color="textDisabled"
                    >
                      {tool.category}
                    </Typography>
                  </Box>

                  {/* Quantity */}
                  <Typography
                    sx={{
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "primary.main",
                      minWidth: 50,
                      textAlign: "right",
                    }}
                  >
                    × {tool.quantity}
                  </Typography>
                </Box>
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </FieldArray>
  );
};

export default AddedToolListingcomponent;
