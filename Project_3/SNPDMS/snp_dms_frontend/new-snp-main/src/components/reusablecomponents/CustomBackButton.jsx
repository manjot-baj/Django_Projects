import React from "react";
import { Image } from "semantic-ui-react";
import BACKIMAGE from "../../assets/images/back-arrow.png";
const CustomBackButton = ({handleGoBack}) => {
  return (
    <Image
      src={BACKIMAGE}
      style={{
        height: 40,
        width: 40,
        marginBottom: 15,
        cursor: "pointer",
      }}
      onClick={handleGoBack}
    />
  );
};

export default CustomBackButton;
