import React, { useEffect, useState } from "react";

import { Grid, Typography } from "@mui/material";
import CustomTextfield from "@components/reusablecomponents/GateInTextField";
import { useSelector } from "react-redux";
import { customLabelTypography } from "../utils/CustomClasses";



export const Header = () => {
  const [containerNumber, setContainerNumber] = useState("");
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
        <Grid item size={{xs:6,sm:4}}>
          <Typography variant="subtitle1" sx={customLabelTypography}>
            Container No
          </Typography>
          <CustomTextfield
            value={containerNumber}
            handleChange={(e) => setContainerNumber(e.target.value)}
            // dispatchType={"SET_MNR_SEARCH_CONTAINER_NUMBER"}
            readOnlyP={true}
          />
        </Grid>

        <Grid item size={{xs:6,sm:4}} style={{ alignSelf: "flex-end" }}>
          <Typography variant="subtitle1" sx={customLabelTypography}>
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

        <Grid item size={{xs:6,sm:4}}>
          <Typography variant="subtitle1" sx={customLabelTypography}>
            Line
          </Typography>
          <CustomTextfield
            value={line}
            handleChange={(e) => setLine(e.target.value)}
            // dispatchType={"SET_MNR_SEARCH_CONTAINER_NUMBER"}
            readOnlyP={true}
          />
        </Grid>

        <Grid item size={{xs:6,sm:4}}>
          <Typography variant="subtitle1" sx={customLabelTypography}>
            In Date
          </Typography>
          <CustomTextfield
            id="gate-out-manufacturing-date"
            value={date}
            readOnlyP={true}
          />
        </Grid>

        <Grid item size={{xs:6,sm:4}}>
          <Typography variant="subtitle1" sx={customLabelTypography}>
            Condition
          </Typography>
          <CustomTextfield
            value={condition}
            handleChange={(e) => setCondition(e.target.value)}
            // dispatchType={"SET_MNR_SEARCH_CONTAINER_NUMBER"}
            readOnlyP={true}
          />
        </Grid>

        <Grid item size={{xs:6,sm:4}}>
          <Typography variant="subtitle1" sx={customLabelTypography}>
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
