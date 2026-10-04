import React, { Component } from "react";
import ImageMapper from "react-image-mapper";
import { Grid, Typography, Paper } from "@material-ui/core";
import { connect } from "react-redux";
import CustomTextfield from "./reusableComponents/GateInTextField";
import DatePickerField from "./reusableComponents/DatePickerField";

import CustomRow from "./GateInEIRShippingLineRow";
import SelectTextField from "./reusableComponents/SelectTextField";
import "../assets/styles/EIRmapster.css";
import { theme } from "../App";

const phone = window.innerWidth <= 380 || "orientation" in window;

class EIRmapster extends Component {
  state = {
    hoveredArea: null,

    selectedArea: [],
    MAP: {
      name: "my-map",
      areas: [
        {
          name: "A1",
          shape: "rect",
          coords: [23, 37, 49, 66],
          preFillColor: "",
          fillColor: "rgba(0,255, 0, 0.6)",
        },
        {
          name: "B1",
          shape: "rect",
          coords: [50, 37, 74, 66],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "C1",
          shape: "rect",
          coords: [76, 37, 100, 66],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "D1",
          shape: "rect",
          coords: [101, 37, 127, 66],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "E1",
          shape: "rect",
          coords: [128, 37, 153, 66],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "F1",
          shape: "rect",
          coords: [153, 37, 177, 66],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "G1",
          shape: "rect",
          coords: [177, 37, 205, 66],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "H1",
          shape: "rect",
          coords: [205, 37, 231, 66],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "I1",
          shape: "rect",
          coords: [231, 37, 255, 66],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "J1",
          shape: "rect",
          coords: [255, 37, 280, 66],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "K1",
          shape: "rect",
          coords: [280, 37, 307, 66],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "L1",
          shape: "rect",
          coords: [307, 37, 332, 66],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "M1",
          shape: "rect",
          coords: [335, 37, 361, 66],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "N1",
          shape: "rect",
          coords: [362, 37, 386, 66],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "O1",
          shape: "rect",
          coords: [387, 37, 413, 66],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "P1",
          shape: "rect",
          coords: [414, 37, 439, 66],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "Q1",
          shape: "rect",
          coords: [439, 37, 464, 66],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "R1",
          shape: "rect",
          coords: [464, 37, 490, 66],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "S1",
          shape: "rect",
          coords: [492, 37, 516, 66],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "T1",
          shape: "rect",
          coords: [517, 37, 543, 66],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "U1",
          shape: "rect",
          coords: [544, 37, 569, 66],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "V1",
          shape: "rect",
          coords: [571, 37, 593, 66],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },

        {
          name: "A2",
          shape: "rect",
          coords: [23, 67, 49, 96],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "B2",
          shape: "rect",
          coords: [50, 67, 74, 96],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "C2",
          shape: "rect",
          coords: [76, 67, 100, 96],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "D2",
          shape: "rect",
          coords: [101, 67, 127, 96],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "E2",
          shape: "rect",
          coords: [128, 67, 153, 96],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "F2",
          shape: "rect",
          coords: [153, 67, 177, 96],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "G2",
          shape: "rect",
          coords: [178, 67, 205, 96],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "H2",
          shape: "rect",
          coords: [205, 67, 231, 96],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "I2",
          shape: "rect",
          coords: [231, 67, 255, 96],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "J2",
          shape: "rect",
          coords: [257, 67, 282, 96],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "K2",
          shape: "rect",
          coords: [282, 67, 307, 96],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "L2",
          shape: "rect",
          coords: [309, 67, 333, 96],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "M2",
          shape: "rect",
          coords: [335, 67, 361, 96],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "N2",
          shape: "rect",
          coords: [362, 67, 386, 96],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "O2",
          shape: "rect",
          coords: [387, 67, 413, 96],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "P2",
          shape: "rect",
          coords: [414, 67, 439, 96],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "Q2",
          shape: "rect",
          coords: [439, 67, 464, 96],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "R2",
          shape: "rect",
          coords: [464, 67, 490, 96],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "S2",
          shape: "rect",
          coords: [492, 67, 516, 96],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "T2",
          shape: "rect",
          coords: [517, 67, 543, 96],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "U2",
          shape: "rect",
          coords: [544, 67, 569, 96],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "V2",
          shape: "rect",
          coords: [571, 67, 593, 96],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "A3",
          shape: "rect",
          coords: [23, 97, 49, 126],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "B3",
          shape: "rect",
          coords: [50, 97, 74, 126],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "C3",
          shape: "rect",
          coords: [76, 97, 100, 126],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "D3",
          shape: "rect",
          coords: [101, 97, 127, 126],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "E3",
          shape: "rect",
          coords: [128, 97, 153, 126],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "F3",
          shape: "rect",
          coords: [153, 97, 177, 126],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "G3",
          shape: "rect",
          coords: [178, 97, 205, 126],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "H3",
          shape: "rect",
          coords: [205, 97, 231, 126],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "I3",
          shape: "rect",
          coords: [231, 97, 255, 126],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "J3",
          shape: "rect",
          coords: [257, 97, 282, 126],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "K3",
          shape: "rect",
          coords: [282, 97, 307, 126],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "L3",
          shape: "rect",
          coords: [309, 97, 333, 126],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "M3",
          shape: "rect",
          coords: [335, 97, 361, 126],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "N3",
          shape: "rect",
          coords: [362, 97, 386, 126],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "O3",
          shape: "rect",
          coords: [387, 97, 413, 126],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "P3",
          shape: "rect",
          coords: [414, 97, 439, 126],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "Q3",
          shape: "rect",
          coords: [439, 97, 464, 126],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "R3",
          shape: "rect",
          coords: [464, 97, 490, 126],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "S3",
          shape: "rect",
          coords: [491, 97, 516, 126],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "T3",
          shape: "rect",
          coords: [517, 97, 543, 126],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "U3",
          shape: "rect",
          coords: [544, 97, 569, 126],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "V3",
          shape: "rect",
          coords: [571, 97, 593, 126],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "A4",
          shape: "rect",
          coords: [23, 127, 49, 156],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "B4",
          shape: "rect",
          coords: [50, 127, 74, 156],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "C4",
          shape: "rect",
          coords: [76, 127, 100, 156],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "D4",
          shape: "rect",
          coords: [101, 127, 127, 156],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "E4",
          shape: "rect",
          coords: [128, 127, 153, 156],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "F4",
          shape: "rect",
          coords: [153, 127, 177, 156],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "G4",
          shape: "rect",
          coords: [178, 127, 205, 156],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "H4",
          shape: "rect",
          coords: [205, 127, 231, 156],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "I4",
          shape: "rect",
          coords: [231, 127, 255, 156],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "J4",
          shape: "rect",
          coords: [257, 127, 282, 156],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "K4",
          shape: "rect",
          coords: [282, 127, 307, 156],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "L4",
          shape: "rect",
          coords: [309, 127, 333, 156],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "M4",
          shape: "rect",
          coords: [335, 127, 361, 156],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "N4",
          shape: "rect",
          coords: [362, 127, 386, 156],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "O4",
          shape: "rect",
          coords: [387, 127, 413, 156],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "P4",
          shape: "rect",
          coords: [414, 127, 439, 156],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "Q4",
          shape: "rect",
          coords: [439, 127, 464, 156],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "R4",
          shape: "rect",
          coords: [464, 127, 490, 156],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "S4",
          shape: "rect",
          coords: [492, 127, 516, 156],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "T4",
          shape: "rect",
          coords: [517, 127, 543, 156],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "U4",
          shape: "rect",
          coords: [544, 127, 569, 156],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "V4",
          shape: "rect",
          coords: [571, 127, 593, 156],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "A5",
          shape: "rect",
          coords: [23, 157, 49, 186],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "B5",
          shape: "rect",
          coords: [50, 157, 74, 186],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "C5",
          shape: "rect",
          coords: [76, 157, 100, 186],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "D5",
          shape: "rect",
          coords: [101, 157, 127, 186],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "E5",
          shape: "rect",
          coords: [128, 157, 153, 186],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "F5",
          shape: "rect",
          coords: [153, 157, 177, 186],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "G5",
          shape: "rect",
          coords: [178, 157, 205, 186],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "H5",
          shape: "rect",
          coords: [205, 157, 231, 186],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "I5",
          shape: "rect",
          coords: [231, 157, 255, 186],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "J5",
          shape: "rect",
          coords: [257, 157, 282, 186],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "K5",
          shape: "rect",
          coords: [282, 157, 307, 186],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "L5",
          shape: "rect",
          coords: [309, 157, 333, 186],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "M5",
          shape: "rect",
          coords: [335, 157, 361, 186],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "N5",
          shape: "rect",
          coords: [362, 157, 386, 186],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "O5",
          shape: "rect",
          coords: [387, 157, 413, 186],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "P5",
          shape: "rect",
          coords: [414, 157, 439, 186],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "Q5",
          shape: "rect",
          coords: [439, 157, 464, 186],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "R5",
          shape: "rect",
          coords: [464, 157, 490, 186],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "S5",
          shape: "rect",
          coords: [492, 157, 516, 186],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "T5",
          shape: "rect",
          coords: [517, 157, 543, 186],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "U5",
          shape: "rect",
          coords: [544, 157, 569, 186],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "V5",
          shape: "rect",
          coords: [571, 157, 593, 186],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "A6",
          shape: "rect",
          coords: [23, 187, 49, 216],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "B6",
          shape: "rect",
          coords: [50, 187, 74, 216],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "C6",
          shape: "rect",
          coords: [76, 187, 100, 216],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "D6",
          shape: "rect",
          coords: [101, 187, 127, 216],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "E6",
          shape: "rect",
          coords: [128, 187, 153, 216],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "F6",
          shape: "rect",
          coords: [153, 187, 177, 216],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "G6",
          shape: "rect",
          coords: [178, 187, 205, 216],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "H6",
          shape: "rect",
          coords: [205, 187, 231, 216],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "I6",
          shape: "rect",
          coords: [231, 187, 255, 216],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "J6",
          shape: "rect",
          coords: [257, 187, 282, 216],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "K6",
          shape: "rect",
          coords: [282, 187, 307, 216],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "L6",
          shape: "rect",
          coords: [309, 187, 333, 216],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "M6",
          shape: "rect",
          coords: [335, 187, 361, 216],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "N6",
          shape: "rect",
          coords: [362, 187, 386, 216],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "O6",
          shape: "rect",
          coords: [387, 187, 413, 216],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "P6",
          shape: "rect",
          coords: [414, 187, 439, 216],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "Q6",
          shape: "rect",
          coords: [439, 187, 464, 216],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "R6",
          shape: "rect",
          coords: [464, 187, 490, 216],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "S6",
          shape: "rect",
          coords: [492, 187, 516, 216],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "T6",
          shape: "rect",
          coords: [517, 187, 543, 216],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "U6",
          shape: "rect",
          coords: [544, 187, 569, 216],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "V6",
          shape: "rect",
          coords: [571, 187, 593, 216],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "A7",
          shape: "rect",
          coords: [23, 217, 49, 246],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "B7",
          shape: "rect",
          coords: [50, 217, 74, 246],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "C7",
          shape: "rect",
          coords: [76, 217, 100, 246],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "D7",
          shape: "rect",
          coords: [101, 217, 127, 246],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "E7",
          shape: "rect",
          coords: [128, 217, 153, 246],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "F7",
          shape: "rect",
          coords: [153, 217, 177, 246],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "G7",
          shape: "rect",
          coords: [178, 217, 205, 246],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "H7",
          shape: "rect",
          coords: [205, 217, 231, 246],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "I7",
          shape: "rect",
          coords: [231, 217, 255, 246],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "J7",
          shape: "rect",
          coords: [257, 217, 282, 246],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "K7",
          shape: "rect",
          coords: [282, 217, 307, 246],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "L7",
          shape: "rect",
          coords: [309, 217, 333, 246],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "M7",
          shape: "rect",
          coords: [335, 217, 361, 246],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "N7",
          shape: "rect",
          coords: [362, 217, 386, 246],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "O7",
          shape: "rect",
          coords: [387, 217, 413, 246],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "P7",
          shape: "rect",
          coords: [414, 217, 439, 246],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "Q7",
          shape: "rect",
          coords: [439, 217, 464, 246],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "R7",
          shape: "rect",
          coords: [464, 217, 490, 246],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "S7",
          shape: "rect",
          coords: [492, 217, 516, 246],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "T7",
          shape: "rect",
          coords: [517, 217, 543, 246],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "U7",
          shape: "rect",
          coords: [544, 217, 569, 246],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "V7",
          shape: "rect",
          coords: [571, 217, 593, 246],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "A8",
          shape: "rect",
          coords: [23, 247, 49, 276],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "B8",
          shape: "rect",
          coords: [50, 247, 74, 276],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "C8",
          shape: "rect",
          coords: [76, 247, 100, 276],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "D8",
          shape: "rect",
          coords: [101, 247, 127, 276],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "E8",
          shape: "rect",
          coords: [128, 247, 153, 276],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "F8",
          shape: "rect",
          coords: [153, 247, 177, 276],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "G8",
          shape: "rect",
          coords: [178, 247, 205, 276],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "H8",
          shape: "rect",
          coords: [205, 247, 231, 276],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "I8",
          shape: "rect",
          coords: [231, 247, 255, 276],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "J8",
          shape: "rect",
          coords: [257, 247, 282, 276],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "K8",
          shape: "rect",
          coords: [282, 247, 307, 276],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "L8",
          shape: "rect",
          coords: [309, 247, 333, 276],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "M8",
          shape: "rect",
          coords: [335, 247, 361, 276],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "N8",
          shape: "rect",
          coords: [362, 247, 386, 276],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "O8",
          shape: "rect",
          coords: [387, 247, 413, 276],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "P8",
          shape: "rect",
          coords: [414, 247, 439, 276],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "Q8",
          shape: "rect",
          coords: [439, 247, 464, 276],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "R8",
          shape: "rect",
          coords: [464, 247, 490, 276],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "S8",
          shape: "rect",
          coords: [492, 247, 516, 276],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "T8",
          shape: "rect",
          coords: [517, 247, 543, 276],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "U8",
          shape: "rect",
          coords: [544, 247, 569, 276],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
        {
          name: "V8",
          shape: "rect",
          coords: [571, 247, 593, 276],
          preFillColor: "",
          fillColor: "rgba(0, 255, 0, 0.6)",
        },
      ],
    },

    eirDate: "",
    eirTime: "",
    eirAmount: "",
    offloadDate: "",
    offloadTime: "",
    repairAmount: "",
  };

  enterArea(area) {
    this.setState({
      hoveredArea: area,
    });
  }
  leaveArea(area) {
    this.setState({
      hoveredArea: null,
    });
  }
  clicked(area) {
    const { MAP, selectedArea } = this.state;
    const areaIndex = MAP.areas.findIndex((el) => el.name === area.name);
    const newStateMap = {};
    let selectedPoint = [];
    // let unselectPoint = [...selectedArea];

    let newAreaArray = [...MAP.areas];
    if (area.preFillColor === "") {
      newAreaArray[areaIndex] = {
        ...newAreaArray[areaIndex],
        preFillColor: "rgba(255, 0, 0, 0.4)",
      };
      newStateMap["name"] = "my-map";
      newStateMap["areas"] = newAreaArray;
      selectedPoint = [...selectedArea, area.name];
      this.setState((prev) => ({
        ...prev,
        MAP: newStateMap,
        // ...prev.selectedArea,
        selectedArea: selectedPoint,
      }));
      if (
        // this.props.gateInEdit.selectedContainer.eir_data.eir_line.length > 0
        this.props.gateInEdit.selectedContainer.container_data.pk !== ""
      ) {
        this.props.dispatch({
          type: "EDIT_ADD_EIR_LINE",
          payload: {
            grap_position: area.name,
            damage_code: "",
            description: "",
            // index: areaIndex,
          },
        });
      } else {
        this.props.dispatch({
          type: "SET_ADD_EIR_LINE",
          payload: {
            grap_position: area.name,
            damage_code: "",
            description: "",
            // index: areaIndex,
          },
        });
      }
    } else {
      newAreaArray[areaIndex] = {
        ...newAreaArray[areaIndex],
        preFillColor: "",
      };
      newStateMap["name"] = "my-map";
      newStateMap["areas"] = newAreaArray;

      let unselectPoint = [...selectedArea].filter(
        (point) => point !== area.name
      );

      this.setState((prev) => ({
        ...prev,
        MAP: newStateMap,

        selectedArea: unselectPoint,
      }));
      if (
        // this.props.gateInEdit.selectedContainer.eir_data.eir_line.length > 0
        this.props.gateInEdit.selectedContainer.container_data.pk !== ""
      ) {
        this.props.dispatch({
          type: "EDIT_REMOVE_EIR_LINE",
          payload: {
            areaName: area.name,
          },
        });
      } else {
        this.props.dispatch({
          type: "SET_REMOVE_EIR_LINE",
          payload: {
            areaName: area.name,
          },
        });
      }
    }
  }

  componentDidMount() {
    this.setState({
      eirDate: this.props.todayDate,
      eirTime: this.props.todayTime,
      offloadDate: this.props.todayDate,
      offloadTime: this.props.todayTime,
    });
  }

  componentDidUpdate(prevProps, prevState) {
    const { MAP } = this.state;

    if (
      prevProps.gateInEdit.selectedContainer.container_data.container_no !==
      this.props.gateInEdit.selectedContainer.container_data.container_no
    ) {
      this.setState({
        eirDate: this.props.gateInEdit.selectedContainer.eir_data.eir_date,
        eirTime: this.props.gateInEdit.selectedContainer.eir_data.eir_time,
        eirAmount: this.props.gateInEdit.selectedContainer.eir_data.eir_amount,
        offloadDate:
          this.props.gateInEdit.selectedContainer.eir_data.offload_date,
        offloadTime:
          this.props.gateInEdit.selectedContainer.eir_data.offload_time,
        repairAmount:
          this.props.gateInEdit.selectedContainer.eir_data.repair_amount,
      });
    }

    if (
      prevProps.gateInEdit.selectedContainer.eir_data.eir_line !==
      this.props.gateInEdit.selectedContainer.eir_data.eir_line
    ) {
      var temMapArea = [...MAP.areas];
      const newStateMap = {};
      for (var pos in this.props.gateInEdit.selectedContainer.eir_data
        .eir_line) {
        MAP.areas.map((area) => {
          if (
            area.name ===
            this.props.gateInEdit.selectedContainer.eir_data.eir_line[pos]
              .grap_position
          ) {
            const areaIndex = MAP.areas.findIndex(
              (el) =>
                el.name ===
                this.props.gateInEdit.selectedContainer.eir_data.eir_line[pos]
                  .grap_position
            );

            temMapArea[areaIndex] = {
              ...temMapArea[areaIndex],
              preFillColor: "rgba(255, 0, 0, 0.4)",
            };
          }
        });
      }
      newStateMap["name"] = "my-map";
      newStateMap["areas"] = temMapArea;

      this.setState((prev) => ({
        ...prev,
        MAP: newStateMap,
        // ...prev.selectedArea,
        // selectedArea: selectedPoint,
      }));
    }
  }

  handleOffloadDate = (date) => {
    this.setState({ offloadDate: date });
  };
  handleEIRDate = (date) => {
    this.setState({ eirDate: date });
  };
  handleEIRTime = (event) => {
    this.setState({ eirTime: event.target.value });
  };
  handleEIRAmount = (event) => {
    this.setState({ eirAmount: event.target.value });
  };
  handleOffloadTime = (event) => {
    this.setState({ offloadTime: event.target.value });
  };
  handleRepairAmount = (event) => {
    this.setState({ repairAmount: event.target.value });
  };
  // forceUpdateHandler() {
  //   this.forceUpdate();
  // }

  render() {
    const {
      MAP,
      offloadDate,
      eirDate,
      eirTime,
      eirAmount,
      offloadTime,
      repairAmount,
    } = this.state;
    const { gateInEir, damageCodeList, gateInEdit } = this.props;
    return (
      <div>
        {this.props.hide && (
          <Paper className="paperPadding" elevation={0}>
            <div
              style={{
                zIndex: -1,

                width: "70%",
                margin: "0 auto",
                display: "flex",
                // border: "1px solid blue",
              }}
            >
              <div
                id="eir-graph-image-id"
                style={
                  phone
                    ? {
                        transform: "rotate(0.25turn)",
                        marginTop: 150,
                        marginBottom: 150,
                        marginLeft: -200,
                        display: "flex",
                        justifyContent: "center",
                      }
                    : {}
                }
              >
                <ImageMapper
                  src={require("../assets/images/EIR-graph.png")}
                  map={MAP}
                  onClick={(area) => this.clicked(area)}
                  onMouseEnter={(area) => this.enterArea(area)}
                  onMouseLeave={(area) => this.leaveArea(area)}
                />
              </div>
            </div>

            <Typography
              variant="subtitle2"
              style={{
                paddingTop: 14,
                paddingBottom: 14,
                width: "70%",
                margin: "0 auto",
              }}
            >
              (Click any box to select and add entry)
            </Typography>
            <div style={{ backgroundColor: "#EAF0F5" }}>
              <Grid
                container
                justify="space-between"
                style={{
                  backgroundColor: "#BDCCD9",
                  width: "100%",
                  padding: 10,
                }}
              >
                <Grid item xs={4} sm={4} lg={2} className="gridItem">
                  <Typography></Typography>
                </Grid>
                <Grid item xs={4} sm={4} lg={4} className="gridItem">
                  <Typography>Damage Code</Typography>
                </Grid>

                <Grid item xs={4} sm={4} lg={6} className="gridItem">
                  <Typography>Description</Typography>
                </Grid>
              </Grid>
              {gateInEdit.selectedContainer.eir_data.eir_line.length > 0 ? (
                gateInEdit.selectedContainer.eir_data.eir_line.map(
                  (area, index) => {
                    return (
                      <Grid
                        container
                        style={{ width: "100%", padding: 10 }}
                        spacing={2}
                      >
                        <CustomRow
                          rowId={`${area.grap_position}-grap-position`}
                          fieldValue={area.grap_position}
                          lgsize={2}
                          xssize={4}
                          readOnlyTF={true}
                          select={false}
                        />

                        <Grid
                          item
                          xs={4}
                          style={{ paddingLeft: 20 }}
                          id={`${area.grap_position}-damage-code-row`}
                        >
                          <SelectTextField
                            menuItemList={
                              damageCodeList &&
                              damageCodeList.damage_code_n_condition
                            }
                            selectFieldId={`${area.grap_position}-damage-code`}
                            dispatchType="EDIT_EIR_DAMAGE_CODE"
                            value={area.damage_code}
                            index={index}
                          />
                        </Grid>

                        <CustomRow
                          rowId={`${area.grap_position}-desc`}
                          fieldValue={area.description}
                          lgsize={6}
                          xssize={4}
                          readOnlyTF={false}
                          dispatchType={"EDIT_EIR_LINE_DESCRIPTION"}
                          index={index}
                          select={false}
                        />
                      </Grid>
                    );
                  }
                )
              ) : gateInEir.eir_line.length < 1 ? (
                <Grid
                  container
                  style={{ width: "100%", padding: 10 }}
                  spacing={2}
                >
                  <Grid item lg={2} xs={4} sm={4} className="gridItem">
                    <CustomTextfield id="dummy-position" />
                  </Grid>
                  <Grid item lg={4} xs={4} sm={4} className="gridItem">
                    <CustomTextfield id="dummy-damage-code" />
                  </Grid>

                  <Grid item lg={6} xs={4} sm={4} className="gridItem">
                    <CustomTextfield id="dummy-desc" />
                  </Grid>
                </Grid>
              ) : (
                gateInEir.eir_line.map((area, index) => {
                  return (
                    <Grid
                      container
                      style={{ width: "100%", padding: 10 }}
                      spacing={2}
                    >
                      <CustomRow
                        rowId={`${area.grap_position}-grap-position`}
                        fieldValue={area.grap_position}
                        lgsize={2}
                        xssize={4}
                        readOnlyTF={true}
                        select={false}
                      />

                      <Grid
                        item
                        xs={4}
                        style={{ paddingLeft: 20 }}
                        id={`${area.grap_position}-damage-code-row`}
                      >
                        <SelectTextField
                          menuItemList={
                            damageCodeList &&
                            damageCodeList.damage_code_n_condition
                          }
                          selectFieldId={`${area.grap_position}-damage-code`}
                          dispatchType="SET_EIR_SHIPPING_LINE_DAMAGE_CODE"
                          value={area.damage_code}
                          index={index}
                        />
                      </Grid>

                      <CustomRow
                        rowId={`${area.grap_position}-desc`}
                        fieldValue={area.description}
                        lgsize={6}
                        xssize={4}
                        readOnlyTF={false}
                        dispatchType={"SET_EIR_SHIPPING_LINE_DESCRIPTION"}
                        index={index}
                        select={false}
                      />
                    </Grid>
                  );
                })
              )}
            </div>
            <Grid
              container
              spacing={2}
              style={theme.breakpoints.down("sm") && { width: "98%" }}
            >
              {gateInEdit.selectedContainer.eir_data.eir_no && (
                <Grid
                  item
                  xs={12}
                  sm={4}
                  lg={3}
                  style={
                    theme.breakpoints.down("sm") && {
                      paddingLeft: 6,
                      paddingRight: 4,
                      marginRight: 6,
                      marginLeft: 6,
                    }
                  }
                >
                  <Typography variant="subtitle1" className="fieldLabel">
                    EIR Number
                  </Typography>

                  <CustomTextfield
                    id="eir-number"
                    readOnlyP={true}
                    value={gateInEdit.selectedContainer.eir_data.eir_no}
                  />
                </Grid>
              )}
              {gateInEdit.selectedContainer.eir_data.done_by && (
                <Grid
                  item
                  xs={12}
                  sm={6}
                  lg={3}
                  style={
                    theme.breakpoints.down("sm") && {
                      paddingLeft: 6,
                      paddingRight: 4,
                      marginRight: 6,
                      marginLeft: 6,
                    }
                  }
                >
                  <Typography variant="subtitle1" className="fieldLabel">
                    EIR done by
                  </Typography>

                  <CustomTextfield
                    id="eir-done-by"
                    readOnlyP={true}
                    value={gateInEdit.selectedContainer.eir_data.done_by}
                  />
                </Grid>
              )}
              <Grid item xs={12} sm={4} lg={3}>
                <p className="fieldLabel">
                  EIR Date <span style={{ color: "red" }}>*</span>
                </p>

                <DatePickerField
                  dateId="eir-date"
                  dateValue={eirDate}
                  dateChange={this.handleEIRDate}
                  dispatchType={
                    gateInEdit.selectedContainer.eir_data.eir_date
                      ? "EDIT_EIR_DATE"
                      : "SET_EIR_DATE"
                  }
                />
              
              </Grid>
              <Grid item xs={12} sm={4} lg={3}>
                <p className="fieldLabel">
                  EIR Time <span style={{ color: "red" }}>*</span>
                </p>

                <CustomTextfield
                  id="eir-time"
                  type="time"
                  value={eirTime}
                  handleChange={this.handleEIRTime}
                  dispatchType={
                    gateInEdit.selectedContainer.eir_data.eir_time
                      ? "EDIT_EIR_TIME"
                      : "SET_EIR_TIME"
                  }
                />
              
              </Grid>
              <Grid item xs={12} sm={4} lg={3}>
                <p className="fieldLabel">EIR Amount</p>

                <CustomTextfield
                  id="eir-amount"
                  value={eirAmount}
                  handleChange={this.handleEIRAmount}
                  dispatchType={
                    gateInEdit.selectedContainer.eir_data.eir_amount
                      ? "EDIT_EIR_AMOUNT"
                      : "SET_EIR_AMOUNT"
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6} lg={3}>
                <p className="fieldLabel">Off Load Date</p>

                <DatePickerField
                  dateId="offload-date"
                  dateValue={offloadDate}
                  dateChange={this.handleOffloadDate}
                  dispatchType={
                    gateInEdit.selectedContainer.eir_data.offload_date
                      ? "EDIT_OFFLOAD_DATE"
                      : "SET_OFFLOAD_DATE"
                  }
                />
            
              </Grid>
              <Grid item xs={12} sm={6} lg={3}>
                <p className="fieldLabel">
                  Off Load Time <span style={{ color: "red" }}>*</span>
                </p>

                <CustomTextfield
                  id="offload-time"
                  type="time"
                  value={offloadTime}
                  handleChange={this.handleOffloadTime}
                  dispatchType={
                    gateInEdit.selectedContainer.eir_data.offload_time
                      ? "EDIT_OFFLOAD_TIME"
                      : "SET_OFFLOAD_TIME"
                  }
                />
             
              </Grid>
              <Grid item xs={12} sm={6} lg={3}>
                <p className="fieldLabel">Repair Amount</p>

                <CustomTextfield
                  id="repair-amount"
                  value={repairAmount}
                  handleChange={this.handleRepairAmount}
                  dispatchType={
                    gateInEdit.selectedContainer.eir_data.repair_amount
                      ? "EDIT_REPAIR_AMOUNT"
                      : "SET_REPAIR_AMOUNT"
                  }
                />
              </Grid>
            </Grid>
          </Paper>
        )}
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    gateInEir: state.gateInEirFields,
    damageCodeList: state.gateIn.allDropDown,
    gateInEdit: state.gateInEdit,
    gateInEirFields: state.gateInEirFields,
    ui: state.ui,
  };
};

export default connect(mapStateToProps)(EIRmapster);
