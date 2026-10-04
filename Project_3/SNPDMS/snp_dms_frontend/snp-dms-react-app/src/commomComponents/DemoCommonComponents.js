import React,{useState} from "react";
import CustomTextfield from "../components/reusableComponents/GateInTextField";
import CustomeRadio from "../components/reusableComponents/RadioButton";
import CustomeCheckBox from "../components/reusableComponents/Checkbox";
import SelectTextField from "../components/reusableComponents/SelectTextField";
import ToggleButton from "../components/reusableComponents/ToggleButton";
import DatePickerField from "../components/reusableComponents/DatePickerField";
import { MenuItem } from "@material-ui/core";

const DemoCommonComponents = () => {
    const [lDate, setLDate] = useState("");
    
  return (
    <div>
      <div>
      
        <CustomeRadio />
        <ToggleButton value="switch" />
        <CustomeCheckBox value={"checkbox"} />
        <DatePickerField
          dateId="l-date"
          dateValue={lDate}
          dateChange={(date) => setLDate(date)}
        />
       
        <SelectTextField>
          <MenuItem>1</MenuItem>
        </SelectTextField>
       
        <CustomTextfield
          id="booking-no"
          value={"Booking"}
          handleChange={(e) => e.target.value}
          type="number"
        />
         
       
      </div>
    </div>
  );
};

export default DemoCommonComponents;
