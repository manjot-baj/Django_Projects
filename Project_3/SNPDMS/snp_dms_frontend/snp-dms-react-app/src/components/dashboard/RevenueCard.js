import React from "react";
import {
  makeStyles,
  Typography,
  Paper,
  useTheme,
  useMediaQuery,
} from "@material-ui/core";

import truck from "../../assets/images/dashboard-movement-truck.svg";
const phone = window.innerWidth <= 350 || "orientation" in window;
const useStyles = makeStyles((theme) => ({
  PaperCardContainer: {
    borderRadius: 10,
    padding: theme.spacing(2),
    wordWrap: "break-word",
    // width: "50%",
    marginTop: 10,
    [theme.breakpoints.down("xs")]: {
      padding: theme.spacing(1),
      fontSize: 20,
      height: "max-content",
    },
  },
  titleTypography: {
    color: "#243545",
    fontWeight: 600,
    fontSize: 26,
    [theme.breakpoints.down("xs")]: {
      fontSize: 16,
    },
  },

  flexDisplay: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    [theme.breakpoints.down("xs")]: {
      flexDirection: "column",
    },
  },
  icon: {
    height: 50,
    width: 50,
    borderRadius: "50%",
    backgroundColor: "#E9EFF6",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    [theme.breakpoints.down("xs")]: {
      position: "absolute",
      top: 0,
      right: 0,
      height: 20,
      width: 20,
      borderRadius: "50%",
      margin: 10,
    },
  },
}));

export default function RevenueCard(props) {
  const classes = useStyles();
  const { total, title } = props;
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down("xs"));
  return (
    <Paper className={classes.PaperCardContainer}>
      {phone ? (
        <div className={classes.flexDisplay}>
          <div
            style={{
              display: "flex",
              flexDirection: "rows",
              width: matches && "50%",
              wordBreak: "break-all",
            }}
          >
            <Typography className={classes.titleTypography}>{total}</Typography>
            <div className={classes.icon}>
              <img src={truck} alt="Truck" width={"50"} height={"50"}/>
            </div>
          </div>
          <Typography style={{ color: "#9199A1" }}>{title}</Typography>
        </div>
      ) : (
        <div className={classes.flexDisplay}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: matches && "50%",
              wordBreak: "break-all",
            }}
          >
            <Typography className={classes.titleTypography}>{total}</Typography>
            <Typography style={{ color: "#9199A1" }}>{title}</Typography>
          </div>
          <div className={classes.icon}>
            <img src={truck} alt="Truck" width={"50"} height={"50"}/>
          </div>
        </div>
      )}
    </Paper>
  );
}
