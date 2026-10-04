import {
  Button,
  Grid,
  makeStyles,
  Paper,
  TextField,
  Typography,
  MenuItem,
  useMediaQuery,
} from "@material-ui/core";
import React from "react";
import ReactTable from "react-table-v6";
import "react-table-v6/react-table.css";
import PreviousIcon from "@material-ui/icons/ArrowBack";
import NextIcon from "@material-ui/icons/ArrowForward";

const useStyles = makeStyles((theme) => ({
  paperContainer: {
    padding: theme.spacing(2, 3),
  },
  reactTable: {
    "& ::-webkit-scrollbar": {
      height: "5px",
    },
  },
  input: {
    padding: 7,
    borderColor: "black",
    "& .MuiInputBase-input": {
      width: "400px",
    },
    [theme.breakpoints.down("xs")]: {
      "& .MuiInputBase-input": {
        width: "200px",
        fontSize: "0.8rem",
        padding: 1,
      },
    },
  },
}));

const CustomReactTable = (props) => {
  const classes = useStyles();
  const matchesIphone = useMediaQuery("(max-width:500px)");
  return (
    <Paper className={classes.paperContainer} elevation={0}>
      <ReactTable
        {...props}
        collapseOnDataChange={false}
        className={classes.reactTable}
        showPagination={false}
        defaultPageSize={100}
      />
      {props.enableFooter && (
        <Grid
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            padding: 10,
            border: "1px solid #0000000d",
            marginBottom: 20,
          }}
        >
          <Button
            variant="contained"
            startIcon={<PreviousIcon />}
            color="secondary"
            onClick={props?.prevReactPage}
            disabled={
              props?.React_pg_no === 1 || props?.React_pg_no === "1"
                ? true
                : false
            }
          >
          { !matchesIphone && "Previous"}
          </Button>
          <Grid style={{ display: "flex", alignItems: "flex-end" }}>
            <Typography variant="subtitle2" style={{ padding: "3px" }}>
              Page
            </Typography>

            <TextField
              id="basic"
              variant="outlined"
              size="small"
              style={{ width: "50px", padding: "3px" }}
              value={props?.React_pg_no}
              onChange={(e) => {
                if (e.target.value > props?.React_total_pages) {
                  props.notify("Invalid value entered", {
                    variant: "warning",
                  });
                } else {
                  props.handleReact_change_page(e.target.value);
                }
              }}
              onBlur={(e) => {
                if (
                  e.target.value === "" ||
                  e.target.value === "0" ||
                  e.target.value > props?.React_total_pages
                ) {
                  props.notify("Invalid value entered", {
                    variant: "warning",
                  });
                  props.handleReact_initial_page();
                  props.fetchReact_page();
                } else {
                  props.handleReact_change_page(e.target.value);
                  props.fetchReact_page();
                }
              }}
            />

            <Typography variant="subtitle2" style={{ padding: "3px" }}>
              of
            </Typography>

            <Typography
              variant="subtitle2"
              style={{
                padding: "3px",
                fontSize: "14px",
              }}
            >
              {props?.React_total_pages}
            </Typography>
          </Grid>
         { !matchesIphone && <TextField
            id="client-master-code"
            select
            value={props?.on_page_data_client}
            variant="outlined"
            inputProps={{ className: classes.input }}
            onChange={(e) => {
              props.handleReact_change_page_data_client(e.target.value);
              props.fetchReact_page();
            }}
          >
            <MenuItem key={"5 rows"} value={"5"}>
              {"5 rows"}
            </MenuItem>
            <MenuItem key={"10 rows"} value={"10"}>
              {"10 rows"}
            </MenuItem>
            <MenuItem key={"20 rows"} value={"20"}>
              {"20 rows"}
            </MenuItem>
            <MenuItem key={"25 rows"} value={"25"}>
              {"25 rows"}
            </MenuItem>
            <MenuItem key={"50 rows"} value={"50"}>
              {"50 rows"}
            </MenuItem>
            <MenuItem key={"100 rows"} value={"100"}>
              {"100 rows"}
            </MenuItem>
          </TextField>}
          <Button
            variant="contained"
            endIcon={<NextIcon />}
            color="secondary"
            onClick={props?.nextReactPage}
            disabled={props.next_React_page === "" ? true : false}
          >
          { !matchesIphone && "Next"}
          </Button>
        </Grid>
      )}
    </Paper>
  );
};

export default CustomReactTable;
