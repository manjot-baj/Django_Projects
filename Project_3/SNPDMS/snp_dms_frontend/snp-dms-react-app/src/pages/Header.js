import React, { useEffect, useState } from "react";

import { Grid, makeStyles, Typography } from "@material-ui/core";
import CustomTextfield from "../components/reusableComponents/GateInTextField";
import { useSelector } from "react-redux";

const useStyles = makeStyles((theme) => ({
  paperContainerMNR: {
    padding: theme.spacing(2.5),
    // width: "100%",
    borderRadius: 10,
    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(1),
      width: "98%",
      marginLeft: "auto",
      marginRight: "auto",
    },
  },
  selectTextField: {
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        borderColor: "#243545",
      },
    },
  },

  accordion: {
    boxShadow: "0px 0px 5px 0.1px rgba(0, 0, 0, 0.5)",
    "&::before": {
      top: 0,
      height: 1,
      content: "",
      opacity: 1,
      position: "absolute",
      right: "initial",
    },
  },
  searchButton: {
    backgroundColor: "#FDBD2E",
    color: "#fff",
    borderRadius: "0.5rem",
    padding: "1px 4px",
    height: 40,
    fontSize: 12.5,
    marginLeft: "auto",
    marginRight: "auto",
    width: "35%",
    border: "1.5px solid #2A5FA5",
    boxShadow: "0px 3px 6px #9199A14D",
    "&:hover": {
      backgroundColor: "#FDBD2E",
      color: "#fff",
    },
  },
  searchButton2: {
    backgroundColor: "#2A5FA5",
    color: "#fff",
    borderRadius: "0.5rem",
    padding: "1px 4px",
    height: 40,
    fontSize: 12.5,
    marginLeft: "auto",
    marginRight: "auto",
    width: "35%",
    border: "1.5px solid #FDBD2E",
    boxShadow: "0px 3px 6px #9199A14D",
    "&:hover": {
      backgroundColor: "#2A5FA5",
      color: "#fff",
    },
  },
  searchPaper: {
    padding: "1px 4px",
    margin: 5,
    display: "flex",
    alignItems: "center",
    height: 40,
    backgroundColor: "#DFE6EC",
    borderRadius: "0.5rem",
    [theme.breakpoints.down("xs")]: {
      // padding: "1px 4px",
      height: 35,
    },
  },
  iconbtn: {
    fontSize: 35,
    fontWeight: 900,
    color: "#000000",
  },

  button: {
    fontSize: 12.5,
    borderRadius: 6,
    width: "100%",
    border: "1.5px solid #2A5FA5",
    boxShadow: "0px 3px 6px #9199A14D",
    backgroundColor: "#2A5FA5",
    color: "#fff",
    "&:hover": {
      backgroundColor: "#2A5FA5",
    },
  },
  heading: {
    fontSize: 17,
    fontWeight: 900,
    color: "#000000",
  },

  paperContainer: {
    padding: theme.spacing(4, 3),
    marginBottom: 20,
  },
  // paperContainer1: {
  //   padding: theme.spacing(8, 4),

  // },

  input: {
    padding: 7,
  },
  inputfile: {
    display: "none",
  },

  LabelTypography: {
    fontSize: 14,
    fontWeight: 600,
    color: "#243545",
    paddingBottom: 4,
    [theme.breakpoints.down("sm")]: {
      paddingBottom: 1,
    },
  },
}));

export const Header = () => {
  const [containerNumber, setContainerNumber] = useState("");
  const classes = useStyles();
  const [sizeType, setSizeType] = useState("");
  const [line, setLine] = useState("");
  const [date, setDate] = useState("");
  const [condition, setCondition] = useState("");
  const [grade, setGrade] = useState("");

  const store = useSelector((state) => state);
  const { MNRProcess } = store;

  useEffect(() => {
    if (MNRProcess.mnrProcessData.container_data) {
      setContainerNumber(MNRProcess.mnrProcessData.container_data.container_no);
      setSizeType(MNRProcess.mnrProcessData.container_data.size_type);
      setLine(MNRProcess.mnrProcessData.container_data.line);
      setDate(
        MNRProcess.mnrProcessData.container_data.in_date
          .split("/")
          .reverse()
          .join("-")
      );
      setCondition(MNRProcess.mnrProcessData.container_data.condition);
      setGrade(MNRProcess.mnrProcessData.container_data.grade);
    }
  }, [MNRProcess.mnrProcessData]);

  return (
    <>
      <Grid container spacing={3}>
        <Grid item xs={6} sm={4}>
          <Typography variant="subtitle1" className={classes.LabelTypography}>
            Container No
          </Typography>
          <CustomTextfield
            value={containerNumber}
            handleChange={(e) => setContainerNumber(e.target.value)}
            // dispatchType={"SET_MNR_SEARCH_CONTAINER_NUMBER"}
            readOnlyP={true}
          />
        </Grid>

        <Grid item xs={6} sm={4} style={{ alignSelf: "flex-end" }}>
          <Typography variant="subtitle1" className={classes.LabelTypography}>
            Size/Type
          </Typography>
          <CustomTextfield
            id="stocks-allot-container-number"
            value={sizeType}
            handleChange={(e) => setSizeType(e.target.value)}
            // dispatchType={"SET_MNR_SEARCH_CONTAINER_NUMBER"}
            readOnlyP={true}
          />
        </Grid>

        <Grid item xs={6} sm={4}>
          <Typography variant="subtitle1" className={classes.LabelTypography}>
            Line
          </Typography>
          <CustomTextfield
            value={line}
            handleChange={(e) => setLine(e.target.value)}
            // dispatchType={"SET_MNR_SEARCH_CONTAINER_NUMBER"}
            readOnlyP={true}
          />
        </Grid>

        <Grid item xs={6} sm={4}>
          <Typography variant="subtitle1" className={classes.LabelTypography}>
            In Date
          </Typography>
          <CustomTextfield
            id="gate-out-manufacturing-date"
            value={date}
            readOnlyP={true}
          />
        </Grid>

        <Grid item xs={6} sm={4}>
          <Typography variant="subtitle1" className={classes.LabelTypography}>
            Condition
          </Typography>
          <CustomTextfield
            value={condition}
            handleChange={(e) => setCondition(e.target.value)}
            // dispatchType={"SET_MNR_SEARCH_CONTAINER_NUMBER"}
            readOnlyP={true}
          />
        </Grid>

        <Grid item xs={6} sm={4}>
          <Typography variant="subtitle1" className={classes.LabelTypography}>
            Grade
          </Typography>
          <CustomTextfield
            value={grade}
            handleChange={(e) => setGrade(e.target.value)}
            // dispatchType={"SET_MNR_SEARCH_CONTAINER_NUMBER"}
            readOnlyP={true}
          />
        </Grid>
      </Grid>
      {/* </Paper> */}
    </>
  );
};
