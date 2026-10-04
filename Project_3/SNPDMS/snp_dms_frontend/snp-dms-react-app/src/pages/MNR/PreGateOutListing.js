import React from 'react'
import LayoutContainer from '../../components/reusableComponents/LayoutContainer'
import PreGateOutList from '../../components/advanceFinance/PreGateOutList'

const PreGateOutListing = () => {
  return (
    <LayoutContainer footer={false}>
       <PreGateOutList />
    </LayoutContainer>
  )
}

export default PreGateOutListing