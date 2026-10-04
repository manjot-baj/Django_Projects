import React from "react";
import { Button, Typography ,Dialog,DialogActions,DialogContent,DialogTitle} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import GetAppIcon from "@mui/icons-material/GetApp";
import { useDispatch, useSelector } from "react-redux";



const EDIModal = () => {

  const dispatch = useDispatch();
  const gateInReducer = useSelector((state) => state.gateIn);
  const [fullWidth] = React.useState(true);

  const handleClose = () => {
    dispatch({ type: "TOGGLE_EDI_MODAL", payload: false });
  };

  return (
    <Dialog
      fullWidth={fullWidth}
      open={gateInReducer.showEDIModal}
      onClose={() => dispatch({ type: "TOGGLE_EDI_MODAL" })}
      aria-labelledby="max-width-dialog-title"
    >
      <DialogTitle id="max-width-dialog-title">Generate EDI</DialogTitle>
      <DialogContent
        style={{
          display: "flex",
          justifyContent: "space-evenly",
          alignItems: "center",
        }}
      >
        <Button aria-label="download" sx={(theme)=>({
           display: "flex",
           flexDirection: "column",
           justifyContent: "flex-start",
           alignItems: "center",
           borderRadius: 6,
           border: "1px solid #2A5FA5",
           padding: theme.spacing(1.5, 1),
           width: "40%",
        })}>
          <GetAppIcon fontSize="large" />
          <Typography
            color="primary"
            variant="subtitle2"
            style={{ paddingLeft: 4 }}
          >
            Download EDI report
          </Typography>
        </Button>
        <Button aria-label="email" sx={(theme)=>({
           display: "flex",
           flexDirection: "column",
           justifyContent: "flex-start",
           alignItems: "center",
           borderRadius: 6,
           border: "1px solid #2A5FA5",
           padding: theme.spacing(1.5, 1),
           width: "40%",
        })}>
          <EmailIcon fontSize="large" />
          <Typography
            color="primary"
            variant="subtitle2"
            style={{ paddingLeft: 4 }}
          >
            Email EDI report
          </Typography>
        </Button>

        {/* </div> */}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EDIModal;
