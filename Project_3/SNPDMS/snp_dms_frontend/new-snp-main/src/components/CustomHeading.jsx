import { styled, Typography } from '@mui/material'
import React from 'react'

const PageTitle = styled(Typography)(({ theme }) => ({
  [theme.breakpoints.down("md")]: {
    marginTop: "24px",
    marginLeft: "12px",
  },
}));

const Label = styled(Typography)(({ theme }) => ({
  fontSize: 14,
  fontWeight: 600,
  color: "#243545",
  paddingBottom: 4,
}));

const CustomHeading = ({ customClass = "label", children, ...props }) => {
  const Component = customClass === "pageTitle" ? PageTitle : Label;
  return (
    <Component {...props}>{children}</Component>
  )
}

export default CustomHeading