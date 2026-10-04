import React from 'react'
import LayoutContainer from '@components/reusablecomponents/LayoutContainer'
import PreGateInList from '../../components/advanceFinance/PreGateInList'
import { useSelector } from 'react-redux';
import { Backdrop, CircularProgress } from '@mui/material';
import { custombackDropStyle } from '@/utils/CustomClasses';

const PreGateInListing = () => {
   const { isloading } = useSelector((state) => state.ui);
  return (
    <LayoutContainer footer={false}>
       <PreGateInList />
         <Backdrop sx={custombackDropStyle} open={isloading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </LayoutContainer>
  )
}

export default PreGateInListing