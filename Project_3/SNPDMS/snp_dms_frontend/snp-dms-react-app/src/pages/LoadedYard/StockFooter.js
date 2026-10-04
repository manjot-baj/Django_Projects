import React from "react";
import clsx from "clsx";
import { makeStyles, Paper, Button } from "@material-ui/core";
import { useHistory } from "react-router-dom";

const useStyles = makeStyles((theme) => ({
  footerRoot: {
    width: "100%",
    padding:"0px 0px 10px 0px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "fixed",
    bottom: 0,
    left: 0,
    backgroundColor: "#fff",
    zIndex: 99,
  },
  footerShift: {
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
    position:'fixed',
    display:'flex',
    bottom:'0'
  },
  button: {
    width: "20%",
    borderRadius: 6,
    backgroundColor: "#2A5FA5",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    marginLeft: 10,
    marginRight: 10,
    "&:hover": {
      backgroundColor: "#2A5FA5",
    },
    [theme.breakpoints.down('xs')]: {
      width: "50%",
    },
  },
}));

const StockFooter = (props) => {
  const classes = useStyles();
  const { open } = props;
  const history = useHistory();
  const openStockUpload = () => {
    history.push("/loaded-stock-upload");
  };

  return (
    <Paper
      className={clsx(classes.footerRoot, {
        [classes.footerShift]: open,
      })}
    >
      <Button
        className={classes.button}
        style={{ backgroundColor: "#2A5FA5", color: "#fff", border: "none" }}
        onClick={openStockUpload}
      >
        Loaded Yard Stock Upload
      </Button>
      
    </Paper>
  );
};

export default StockFooter;
