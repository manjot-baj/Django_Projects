import { Backdrop, CircularProgress, Grid } from "@mui/material";
import LayoutContainer from "@components/reusablecomponents/LayoutContainer";
import DownloadMnrSampleData from "./MnrUpload/DownloadMnrSampleData";
import ExtractMnrData from "./MnrUpload/ExtractMnrData";
import { useHistory } from "react-router-dom";
import CustomBackButton from "@components/reusablecomponents/CustomBackButton";
import { custombackDropStyle } from "@/utils/CustomClasses";
import { useSelector } from "react-redux";



export default function MnrUploadForm(props) {
  const history = useHistory();
  const { isloading } = useSelector((state) => state.ui);

  const handleGoBack = () => {
    history.goBack();
  };

  return (
    <LayoutContainer footer={false}>
      <Grid container>
        <Grid item size={{xs:12}}>
          <CustomBackButton handleGoBack={handleGoBack}
          />
          <DownloadMnrSampleData />
          <ExtractMnrData />
        </Grid>
      </Grid>
         <Backdrop sx={custombackDropStyle} open={isloading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </LayoutContainer>
  );
}
