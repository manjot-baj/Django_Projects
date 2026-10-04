import LayoutContainer from "@/components/reusablecomponents/LayoutContainer";
import {
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import { useDispatch, useSelector } from "react-redux";
import { custombackDropStyle } from "@/utils/CustomClasses";
import { automationProcurementDeleteStockAction } from "@/actions/Procurement/procurementAction";
import { useSnackbar } from "notistack";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { useState } from "react";

const AutomationProcurementStockDelete = () => {
  const { site, location } = useSelector((state) => state.user);
  const ui = useSelector((state) => state.ui);
  const notify = useSnackbar().enqueueSnackbar;
  const dispatch = useDispatch();
  const [openWarningDialog, setOpenWarningDialog] = useState(false);

  const handleOnCloseWarningDialog = () => {
    setOpenWarningDialog(false);
  };

  const handleOpenWarningDialog = () => {
    setOpenWarningDialog(true);
  };

  const handleDeleteProcurementStockButton = () => {
    dispatch(automationProcurementDeleteStockAction(notify,handleOnCloseWarningDialog));
  };

  return (
    <LayoutContainer>
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
          justifyContent={"flex-start"}
          spacing={2}
          sx={{ mb: 2 }}
        >
          {" "}
          <DeleteOutlineOutlinedIcon
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
              Procurement Stock Delete
            </Typography>
            <Typography variant="caption">
              Permanently delete Procurement Stock records from ToolRoom. This
              action will remove the selected stock details and may impact
              inventory balances and reporting.
            </Typography>
          </Stack>
        </Stack>{" "}
        <Divider />
        <Paper
          elevation={0}
          sx={{
            mt: 6,
            width: "80%",
            mx: "auto",
            borderRadius: 6,
            p: { xs: 1, md: 5 },
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
          }}
        >
          <Stack spacing={2}>
            <Typography variant="h6" fontWeight={600}>
              Delete Procurement Stock
            </Typography>

            <Typography variant="body2" color="textDisabled">
              Delete procurement stock for the selected site and location.
            </Typography>

            <Divider />

            <Stack spacing={1}>
              <Stack direction="row" spacing={1} alignItems="center">
                <BusinessOutlinedIcon fontSize="small" />
                <Typography variant="body1">
                  <strong>Site:</strong> {site}
                </Typography>
              </Stack>

              <Stack direction="row" spacing={1} alignItems="center">
                <LocationOnOutlinedIcon fontSize="small" />
                <Typography variant="body1">
                  <strong>Location:</strong> {location}
                </Typography>
              </Stack>
            </Stack>

            <Divider />

            <Button
              variant="contained"
              color="error"
              size="large"
              onClick={handleOpenWarningDialog}
              startIcon={<DeleteOutlineOutlinedIcon />}
              sx={{ alignSelf: "flex-start" }}
            >
              Delete Procurement Stock
            </Button>
          </Stack>
        </Paper>
      </Box>
      <Dialog
        open={openWarningDialog}
        onClose={handleOnCloseWarningDialog}
        maxWidth="xs"
        fullWidth
        sx={{ borderRadius: 4 }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <WarningAmberIcon color="warning" />
          Warning
        </DialogTitle>

        <DialogContent>
          <DialogContentText color="textDisabled">
            This will delete your <strong>Procurement stocks</strong> in{" "}
            Location : <strong>{location}</strong> and Site :{" "}
            <strong>{site}</strong>.
            <br />
            <br />
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleOnCloseWarningDialog} variant="outlined">
            Cancel
          </Button>

          <Button
            onClick={handleDeleteProcurementStockButton}
            variant="contained"
            color="error"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      <Backdrop sx={custombackDropStyle} open={ui.isloading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </LayoutContainer>
  );
};

export default AutomationProcurementStockDelete;
