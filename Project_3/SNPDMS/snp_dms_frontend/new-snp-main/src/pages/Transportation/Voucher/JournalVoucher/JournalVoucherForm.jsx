import React from "react";
import { Grid } from "@mui/material";
import LayoutContainer from "@components/reusablecomponents/LayoutContainer";
import { useHistory } from "react-router-dom";
import { Image } from "semantic-ui-react";
import AddJournalVoucher from './AddJournalVoucher';
import BACKIMAGE from '../../../../assets/images/back-arrow.png'


export default function JournalVoucherForm(props) {

  const history = useHistory();

  const handleGoBack = () => {
    history.goBack();
  };

  return (
    <LayoutContainer footer={false}>
      <Grid container>
        <Grid item xs={12}>
         <Image
                 src={BACKIMAGE}
                 style={{ height: 40, width: 40, marginBottom: 15, cursor: "pointer" }}
                 onClick={handleGoBack}
               />
          <AddJournalVoucher />
        </Grid>
      </Grid>
    </LayoutContainer>
  );
}
