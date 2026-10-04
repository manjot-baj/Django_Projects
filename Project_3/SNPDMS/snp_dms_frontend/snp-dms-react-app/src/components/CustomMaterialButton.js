import { Button, makeStyles } from "@material-ui/core";
import React from "react";

export const BUTTON_COLORS_SNP ={
    PRIMARY:"primary",
    TERTIARY_GREEN:"tertiary",
    SECONDARY_DARK:"secondary",
    SECONDARY_GRAY:"secondaryGray",
    SECONDARY_WHITE:"secondaryWhite"
}

const useStyles = makeStyles((theme) => ({
  primary:{
    backgroundColor:"#FE5E37"
  },
  tertiary:{
    backgroundColor:"#8AC389"
  },
  secondary:{
    backgroundColor:"#0A0A0A"
  },
  secondaryGray:{
    backgroundColor:"#ECEDEF"
  },
  secondaryWhite:{
    backgroundColor:"#FFFFFF"
  }
}));

const CustomMaterialButton = ({variant="contained",color="primary" ,...props}) => {
    const classes = useStyles()
  return <Button {...props} variant={variant} color={color} className={classes?.[props.customColor]}>{props.children}</Button>;
};



export default CustomMaterialButton;
