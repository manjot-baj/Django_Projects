import {
  Button,
  Grid,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import React from "react";

import AddIcon from "@mui/icons-material/Add";
import { FieldArray } from "formik";
import { useDispatch, useSelector } from "react-redux";
import { toolGetNameByCategoryAdminAction } from "@/actions/Procurement/requestAction";
import { useSnackbar } from "notistack";

const AddToolTransferComponent = ({
  toolAddData,
  setToolAddData,
  handleClearAlldata,
  adminPK,
  adminLocationPK,
  tool_listing_values,
}) => {
  const { Procurement, ProcurementRequest } = useSelector((state) => state);
  const dispatch = useDispatch();
  const notify = useSnackbar().enqueueSnackbar;

  return (
    <FieldArray name="tool_list">
      {({ push }) => (
        <Grid
          container
          spacing={2}
          sx={{
            mt: 2,
            p: 1,
            px: 2,
            borderRadius: 2.5,
            border: "1px solid #e2e8f0",
            bgcolor: "#f8fafc",
            width: "100%",
          }}
          elevation={0}
          component={Paper}
        >
          <Grid item size={{ xs: 3 }}>
            <Typography variant="caption" color="textPrimary">
              Category <span style={{ color: "red" }}>*</span>
            </Typography>
            <TextField
              variant="outlined"
              name="category"
              fullWidth
              select
              type="text"
              size="small"
              value={toolAddData.category_id}
              onChange={(e) => {
                let category_id = e.target.value;
                let category_value =
                  Procurement?.getAllToolsCategory?.category_list.find(
                    (item) => item.pk === category_id,
                  );
                if (category_value) {
                  setToolAddData((prev) => ({
                    ...prev,
                    category: category_value.name,
                    category_id: category_id,
                    tool_id: "",
                    name: "",
                    quantity: 0,
                  }));
                  dispatch(
                    toolGetNameByCategoryAdminAction(
                      category_id,
                      adminPK,
                      adminLocationPK,
                    ),
                  );
                }
              }}
              sx={{ marginTop: 1 }}
            >
              {Procurement?.getAllToolsCategory?.category_list?.map((val) => (
                <MenuItem key={val.pk} value={val.pk}>
                  {val.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item size={{ xs: 3 }}>
            <Typography variant="caption" color="textPrimary">
              Item name<span style={{ color: "red" }}>*</span>
            </Typography>
            <TextField
              variant="outlined"
              name="item"
              fullWidth
              select
              type="text"
              size="small"
              value={toolAddData.tool_id}
              disabled={!toolAddData.category}
              sx={{ marginTop: 1 }}
              onChange={(e) => {
                let item_pk = e.target.value;
                let item_value = ProcurementRequest?.toolByCategory?.find(
                  (item) => item.pk === item_pk,
                );
                if (item_value) {
                  setToolAddData((prev) => ({
                    ...prev,
                    tool_id: item_pk,
                    name: item_value.name,
                    quantity: 0,
                  }));
                }
              }}
            >
              {ProcurementRequest?.toolByCategory?.map((val) => (
                <MenuItem key={val.pk} value={val.pk}>
                  {val.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item size={{ xs: 3 }}>
            <Typography variant="caption" color="textPrimary">
              Quantity <span style={{ color: "red" }}>*</span>
            </Typography>
            <TextField
              variant="outlined"
              name="quantity"
              fullWidth
              type="number"
              size="small"
              disabled={!toolAddData.category || !toolAddData.name}
              value={toolAddData.quantity}
              onChange={(e) => {
                let value_quantity = e.target.value;

                // If empty after backspace, restore to 1
                if (value_quantity === "") {
                  value_quantity = 1;
                }
                value_quantity = Math.max(1, Number(e.target.value));
                setToolAddData((prev) => ({
                  ...prev,
                  quantity: value_quantity,
                }));
              }}
              slotProps={{
                htmlInput: {
                  min: 1,
                  onKeyDown: (e) => {
                    if (["-", "+", "e", "E"].includes(e.key)) {
                      e.preventDefault();
                    }
                  },
                  // Disable copy
                  onCopy: (e) => e.preventDefault(),

                  // Disable paste
                  onPaste: (e) => e.preventDefault(),

                  // Disable cut
                  onCut: (e) => e.preventDefault(),

                  // Optional: disable drag/drop text
                  onDrop: (e) => e.preventDefault(),
                },
              }}
              sx={{ marginTop: 1 }}
            />
          </Grid>
          <Grid
            item
            size={{ xs: 3 }}
            sx={{
              display: "flex",
              alignItems: "flex-start",
              pt: "32px",
            }}
          >
            <Button
              fullWidth
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => {
                if (
                  tool_listing_values.find(
                    (item) => item.tool_id === toolAddData.tool_id,
                  )
                ) {
                  notify(
                    `You have already selected ${toolAddData.name}. Please try adding with different Tool or Delete the selected Tool in Listing.`,
                    { variant: "warning" },
                  );
                  return;
                }
                push(toolAddData);
                handleClearAlldata();
              }}
              sx={{
                textTransform: "none",
                borderRadius: 2,
                boxShadow: "none",
                fontWeight: 600,
              }}
              disabled={
                toolAddData.category === "" ||
                toolAddData.item === "" ||
                toolAddData.quantity === "" ||
                toolAddData.quantity === 0 ||
                toolAddData.quantity < 0
              }
            >
              Add Tool
            </Button>
          </Grid>
        </Grid>
      )}
    </FieldArray>
  );
};

export default AddToolTransferComponent;
