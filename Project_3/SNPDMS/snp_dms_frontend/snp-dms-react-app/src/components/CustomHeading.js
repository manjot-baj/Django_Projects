import { makeStyles, Typography } from '@material-ui/core'
import React from 'react'

  const useStyles = makeStyles((theme) => ({
    pageTitle:{
      [theme.breakpoints.down("md")]:{
        marginTop:"24px",
        marginLeft:"12px"
      }
    },
    label:{
      fontSize: 14,
      fontWeight: 600,
      color: "#243545",
      paddingBottom: 4,
    }
  }));

const CustomHeading = (props) => {
    const classes= useStyles()
  return (
    <Typography {...props} className={classes?.[props.customClass]}>
       {props.children}
    </Typography>
  )
}

export default CustomHeading