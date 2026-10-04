import React from "react";
import { makeStyles, Typography, Paper, Grid } from "@material-ui/core";
import Divider from "@material-ui/core/Divider";

const useStyles = makeStyles((theme) => ({
  PaperCardContainer: {
    borderRadius: 10,
    padding: theme.spacing(2),
    // width: "50%",
    marginTop: 10,
  },
  titleTypography: {
    color: "#243545",
    fontWeight: 600,
  },
  countBoxContainer: {
    display: "flex",
    marginTop: 12,
    backgroundColor: "#EAF0F5",

    padding: theme.spacing(0.75, 1),
    borderRadius: 4,
    width: "100%",
  },
  purpleBox: {
    backgroundColor: "#7569EE",
    textAlign: "center",
    borderRadius: 4,
    // height: 20,
    padding: 4,
    marginRight: 6,
    color: "#fff",
  },
  orangeBox: {
    backgroundColor: "#F7A844",
    textAlign: "center",
    borderRadius: 6,
    // height: 20,
    padding: 4,
    marginRight: 4,
    color: "#fff",
  },
  flexDisplay: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  indicatorLegend: {
    width: "20%",
    height: 8,
    borderRadius: 4,
    boxShadow: "0px 3px 6px #7569EE4D",
  },
  containerTypeSize: {
    color: "#9199A1",
  },
  containerTypeSizeValue: {
    color: "#243545",
    fontWeight: 600,
  },
}));

export default function MovementCard(props) {
  const classes = useStyles();
  const { total, party, line, title, party_20, party_40, line_20, line_40 } =
    props;

  return (
    <Paper className={classes.PaperCardContainer}>
      <div className={classes.flexDisplay}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <Typography variant="h4" className={classes.titleTypography}>
            {total}
          </Typography>
          <Typography style={{ color: "#9199A1" }}>{title}</Typography>
        </div>
        <div
          style={{
            height: 50,
            width: 50,
            borderRadius: "50%",
            backgroundColor: "#E9EFF6",
            // opacity: 0.1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <img
            src={require("../../assets/images/dashboard-movement-truck.svg")}
            alt="Main Project Gist" width={"50"} height={"50"}
          />
        </div>
      </div>

      <div className={classes.countBoxContainer}>
        <div
          className={classes.purpleBox}
          style={{ width: `calc(${party}/${total}*100%)` }}
        >
          <Typography variant="h6">
            {party === "0" && line !== "0" ? "" : party}
          </Typography>
        </div>
        <div
          className={classes.orangeBox}
          style={{ width: `calc(${line}/${total}*100%)` }}
        >
          <Typography variant="h6">
            {line === "0" && party !== "0" ? "" : line}
          </Typography>
        </div>
      </div>
      <Grid container spacing={3} style={{ marginTop: 12 }}>
        <Grid item xs={5}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <span
              className={classes.indicatorLegend}
              style={{
                backgroundColor: "#7569EE",
              }}
            ></span>
            <Typography style={{ paddingLeft: 12 }}>Party</Typography>
          </div>
          <div style={{ marginTop: 6 }}>
            <div className={classes.flexDisplay}>
              <Typography className={classes.containerTypeSize}>20'</Typography>
              <Typography className={classes.containerTypeSizeValue}>
                {party_20}
              </Typography>
            </div>
            <div className={classes.flexDisplay}>
              <Typography className={classes.containerTypeSize}>40'</Typography>
              <Typography className={classes.containerTypeSizeValue}>
                {party_40}
              </Typography>
            </div>
          </div>
        </Grid>
        <Grid item xs={1}>
          <Divider
            // variant="middle"
            orientation="vertical"
            flexItem
            style={{ height: "100%", margin: "0px 2px" }}
          />
        </Grid>

        <Grid item xs={5}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <span
              className={classes.indicatorLegend}
              style={{
                backgroundColor: "#F7A844",
              }}
            ></span>
            <Typography style={{ paddingLeft: 12 }}>Line</Typography>
          </div>

          <div style={{ marginTop: 6 }}>
            <div className={classes.flexDisplay}>
              <Typography className={classes.containerTypeSize}>20'</Typography>
              <Typography className={classes.containerTypeSizeValue}>
                {line_20}
              </Typography>
            </div>
            <div className={classes.flexDisplay}>
              <Typography className={classes.containerTypeSize}>40'</Typography>
              <Typography className={classes.containerTypeSizeValue}>
                {line_40}
              </Typography>
            </div>
          </div>
        </Grid>
      </Grid>
    </Paper>
  );
}
