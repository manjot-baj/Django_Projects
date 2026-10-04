import React from "react";
import {
  makeStyles,
  Typography,
  Paper,
  useMediaQuery,
} from "@material-ui/core";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  ResponsiveContainer,
} from "recharts";
import { theme } from "../../App";

const useStyles = makeStyles((theme) => ({
  PaperCardContainer: {
    borderRadius: 10,
    padding: theme.spacing(2),
    marginTop: 10,
    [theme.breakpoints.down("xs")]: {
      overflowX: "scroll",
      borderRadius: 5,
      marginTop: 20,
      padding: theme.spacing(1),
      "&::-webkit-scrollbar": {
        width: 8,
        height: 5,
      },
    },
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
    padding: 4,
    marginRight: 6,
    color: "#fff",
  },
  orangeBox: {
    backgroundColor: "#F7A844",
    textAlign: "center",
    borderRadius: 6,
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

// const sampData = [
//   {
//     name: "West Bengal",
//     volume_data: 4000,
//     revenue_data: 2400,
//   },
//   {
//     name: "Non Depot",
//     volume_data: 3000,
//     revenue_data: 1398,
//   },
//   {
//     name: "Andhra Pradesh",
//     volume_data: 2000,
//     revenue_data: 9800,
//   },
//   {
//     name: "Bandra",
//     volume_data: 2780,
//     revenue_data: 3908,
//   },
//   {
//     name: "Mumbai",
//     volume_data: 1890,
//     revenue_data: 4800,
//   },
//   {
//     name: "Mundra",
//     volume_data: 2390,
//     revenue_data: 3800,
//   },
// ];

// const data2 = [
//   {
//     name: "Monday",
//     WestBengal: 4000,
//     TamilNadu: 2400,
//   },
//   {
//     name: "Tuesday",
//     WestBengal: 3000,
//     TamilNadu: 1398,
//   },
//   {
//     name: "Wednesday",
//     WestBengal: 2000,
//     TamilNadu: 9800,
//   },
//   {
//     name: "Thursday",
//     WestBengal: 2780,
//     TamilNadu: 3908,
//   },
//   {
//     name: "Friday",
//     WestBengal: 1890,
//     TamilNadu: 4800,
//   },
//   {
//     name: "Saturday",
//     WestBengal: 2390,
//     TamilNadu: 3800,
//   },
//   {
//     name: "Sunday",
//     WestBengal: 3375,
//     TamilNadu: 3245,
//   },
// ];

const setBg = () => {
  const randomColor = Math.floor(Math.random() * 16777215).toString(16);
  return "#" + randomColor;
};

export default function MovementCard(props) {
  const classes = useStyles();
  const { title, data, fromDate, toDate } = props;
  const matchesIpad = useMediaQuery(theme.breakpoints.down("md"));

  const mappedData =
    title === "Weekly Volume" ? data?.volume_data : data?.revenue_data;

  const from_date = title === "Overall" ? fromDate : data.from_date;
  const to_date = title === "Overall" ? toDate : data.to_date;

  return (
    <Paper className={classes.PaperCardContainer}>
      <div className={classes.flexDisplay}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <Typography style={{ color: "#9199A1" }}>{title}</Typography>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <Typography style={{ color: "#9199A1" }}>
            ({from_date} - {to_date})
          </Typography>
        </div>
      </div>

      {title === "Overall" ? (
        <ResponsiveContainer width={"100%"} height={350}>
          <BarChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" style={{ fontSize: 7 }} />
            <YAxis yAxisId="left" orientation="left" stroke="#7569EE" />
            <YAxis yAxisId="right" orientation="right" stroke="#F7A844" />
            <Tooltip />
            <Legend />
            <Bar
              yAxisId="left"
              dataKey="volume_data"
              barSize={20}
              fill="#7569EE"
              name="volume_data"
            />
            <Bar
              yAxisId="right"
              dataKey="revenue_data"
              name="revenue_data(₹)"
              barSize={20}
              fill="#F7A844"
            />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <ResponsiveContainer width={"100%"} height={350}>

  
        <LineChart
      
          data={mappedData}
          margin={{
            top: 5,
            right: 30,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" style={{ fontSize: 8 }} />
          <YAxis />
          <Tooltip />
          <Legend />
          {mappedData?.map((option, key) => {
            return (
              Object.keys(option)[key + 1] !== undefined && (
                <Line
                  type="monotone"
                  dataKey={Object.keys(option)[key + 1]}
                  stroke={setBg()}
                />
              )
            );
          })}
        </LineChart>
        </ResponsiveContainer>
      )}
    </Paper>
  );
}
