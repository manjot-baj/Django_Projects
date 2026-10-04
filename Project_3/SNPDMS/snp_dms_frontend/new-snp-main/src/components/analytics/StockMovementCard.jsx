import React from "react";
import {

  Typography,
  Paper,
  useMediaQuery,
  Grid,
  Box,
} from "@mui/material";
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
import MovementTruckImage from '../../assets/images/dashboard-movement-truck.svg'

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
    <Paper sx={(theme)=>({
      borderRadius: 4,
      padding: theme.spacing(2),
      marginTop: 2,
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
    })}>
      <Box sx={{
           display: "flex",
           justifyContent: "space-between",
           alignItems: "center",
           flexWrap: "wrap",
      }}>
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
            src={MovementTruckImage}
            alt="Main Project Gist"
            width={"30"}
            height={"30"}
          />
        </div>
      </Box>
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
        <Box sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
     }}>
          <Box sx={{
             display: "flex",
             flexDirection: "column",
             alignItems: "center",
             justifyContent: "center",
          }}>
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
          </Box>
        </Box>
      )}
    </Paper>
  );
}
