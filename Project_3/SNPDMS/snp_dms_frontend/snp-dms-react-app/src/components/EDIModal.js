import React from "react";
import { Button, makeStyles, Typography } from "@material-ui/core";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import EmailIcon from "@material-ui/icons/Email";
import GetAppIcon from "@material-ui/icons/GetApp";
import { useDispatch, useSelector } from "react-redux";

const useStyles = makeStyles((theme) => ({
  optionContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "center",
    borderRadius: 6,
    border: "1px solid #2A5FA5",
    padding: theme.spacing(1.5, 1),
    width: "40%",
  },
}));

const EDIModal = () => {
  const classes = useStyles();
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
        <Button aria-label="download" className={classes.optionContainer}>
          <GetAppIcon fontSize="large" />
          <Typography
            color="primary"
            variant="subtitle2"
            style={{ paddingLeft: 4 }}
          >
            Download EDI report
          </Typography>
        </Button>
        <Button aria-label="email" className={classes.optionContainer}>
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
