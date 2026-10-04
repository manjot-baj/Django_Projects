import React from "react";
import {
  makeStyles,
  Typography,
  Paper,
  useMediaQuery,
  Grid,
  Box,
} from "@material-ui/core";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
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
    flexWrap: "wrap",
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
  pieFlex: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
}));

const setBg = () => {
  const randomColor = Math.floor(Math.random() * 16777215).toString(16);
  return "#" + randomColor;
};

const pieBgColor = {
  "Survey Pending": "#fb4b4b",
  "Estimate Pending": "#ffa879",
  "Approval Pending": "#ffc163",
  Approved: "#feff5c",
  "Under Repairing": "#ababab",
  "Empty Alloted": "#c0ff33",
  Available: "#33bc08",
  Alloted: "#e16ae2",
};

export default function StockMovementCard(props) {
  const classes = useStyles();
  const { title, data } = props;
  const matchesIpad = useMediaQuery(theme.breakpoints.down("md"));

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    index,
  }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };
  return (
    <Paper className={classes.PaperCardContainer}>
      <div className={classes.flexDisplay}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <Typography style={{ color: "#9199A1" }}>{title}</Typography>
        </div>
        <div
          style={{
            height: 50,
            width: 50,
            borderRadius: "50%",
            backgroundColor: "#E9EFF6",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <img
            src={require("../../assets/images/dashboard-movement-truck.svg")}
            alt="Main Project Gist"
            width={"30"}
            height={"30"}
          />
        </div>
      </div>
      {title === "Stock" || title === "20 Stock" || title === "40 Stock" ? (
        <ResponsiveContainer width={"100%"} height={350}>
          <LineChart
            data={data}
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
            {data.map((option, key) => {
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
      ) : (
        <div className={classes.flexDisplay}>
          <div className={classes.pieFlex}>
            <PieChart width={200} height={200}>
              <Pie
                dataKey="value"
                label={renderCustomizedLabel}
                data={data}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                labelLine={false}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={pieBgColor[entry.name]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
            <Grid
              container
              spacing={1}
              style={{ width: "90%", margin: "auto" }}
            >
              {data.map((val, ind) => (
                <Grid
                  item
                  lg={6}
                  spacing={1}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-start",
                  }}
                >
                  <Box
                    style={{
                      width: "10px",
                      height: "10px",
                      backgroundColor: pieBgColor[val.name],
                      borderRadius: "100px",
                      marginRight: "5px",
                    }}
                  ></Box>
                  <Typography variant="caption">
                    {val.name} ({val.value})
                  </Typography>
                </Grid>
              ))}
            </Grid>
          </div>
        </div>
      )}
    </Paper>
  );
}
