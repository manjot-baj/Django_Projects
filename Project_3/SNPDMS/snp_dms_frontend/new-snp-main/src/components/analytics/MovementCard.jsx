import React from "react";
import {

  Typography,
  Paper,
  useMediaQuery,
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
  BarChart,
  Bar,
  ResponsiveContainer,
} from "recharts";
import { theme } from "../../App";


const setBg = () => {
  const randomColor = Math.floor(Math.random() * 16777215).toString(16);
  return "#" + randomColor;
};

export default function MovementCard(props) {

  const { title, data, fromDate, toDate } = props;
  const matchesIpad = useMediaQuery(theme.breakpoints.down("md"));

  const mappedData =
    title === "Weekly Volume" ? data?.volume_data : data?.revenue_data;

  const from_date = title === "Overall" ? fromDate : data.from_date;
  const to_date = title === "Overall" ? toDate : data.to_date;

  return (
    <Paper sx={(theme)=>({
      borderRadius: 4,
      padding: theme.spacing(2),
      marginTop: 4,
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
      }}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <Typography style={{ color: "#9199A1" }}>{title}</Typography>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <Typography style={{ color: "#9199A1" }}>
            ({from_date} - {to_date})
          </Typography>
        </div>
      </Box>

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
