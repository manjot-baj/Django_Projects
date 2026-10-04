import React from "react";
import "../../src/index.css";
import { useHistory } from "react-router-dom";
import CustomBackButton from "@components/reusablecomponents/CustomBackButton";
import { Box } from "@mui/material";

const Unauthorized = () => {

  const history = useHistory();
  const handleGoBack = () => {
    history.push("/login");
  };
  return (
    <div style={{ backgroundColor: "#1C2127", height: "750px" }}>
      <Box mt={2} ml={2}>
      <CustomBackButton handleGoBack={handleGoBack}
      />
      </Box>
      <div
        style={{
          fontFamily: "'Poppins', sans-serif",
          fontSize: "30px",
          color: "white",
          fontWeight: "500",
          position: "absolute",
          top: "230px",
          left: "150px",
        }}
      >
        You are not authorized.
      </div>
      <div
        style={{
          fontFamily: "'Poppins', sans-serif",
          fontSize: "18px",
          color: "white",
          fontWeight: "300",
          width: "600px",
          position: "absolute",
          top: "280px",
          left: "150px",
        }}
      >
        You tried to access a page you did not have prior authorization for or
        may be the license has expired.
      </div>
      <div
        style={{
          fontFamily: "'Poppins', sans-serif",
          fontSize: "18px",
          color: "white",
          fontWeight: "300",
          width: "600px",
          position: "absolute",
          top: "380px",
          left: "150px",
        }}
      >
        Kindly contact to Authorized person or reach out to
        pooja.kumari@sunandpearls.com
      </div>
      <div
        style={{
          position: "absolute",
          right: "200px",
        }}
      >
        <div
          style={{
            textAlign: "center",
            width: "300px",
            marginTop: "30px",
            marginBottom: "10px",
            fontFamily: "'Varela Round', sans-serif",
            fontSize: "90px",
            color: "#5BE0B3",
            letterSpacing: "3px",
            textShadow: "0 0 5px #6EECC1",
            animation: "flux 2s linear infinite",
          }}
        >
          401
        </div>
        <div
          style={{
            height: "495px",
            width: "295px",
            borderRadius: "90px 90px 0 0",
            backgroundColor: "#8594A5",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              height: "450px",
              width: "250px",
              borderRadius: "70px 70px 0 0",
              backgroundColor: "#A0AEC0",
            }}
          >
            <div style={{
                height: "70px",
    width: "25px",
    backgroundColor: "#CBD8E6",
    borderRadius: "4px",
    position: "absolute",
    marginTop: "220px",
    marginLeft: "20px",
            }}></div>
            <div style={{
                  height: "8px",
    width: "50px",
    borderRadius: "4px",
    backgroundColor: "#EBF3FC",
    position: "absolute",
    marginTop: "250px",
    marginLeft: "30px",
            }}></div>
            <div style={{
                 height: "40px",
    width: "130px",
    backgroundColor: "#1C2127",
    borderRadius: "3px",
    margin: "80px auto",
    position: "relative",
            }}>
              <div
                style={{
                  top: "15px",
                  left: "25px",
                  height: "5px",
                  width: "15px",
                  borderRadius: "50%",
                  backgroundColor: "white",
                  animation: "eye 7s ease-in-out infinite",
                  position: "absolute",
                }}
              ></div>
              <div style={{
                  top: "15px",
    height: "5px",
    left: "65px",
    width: "15px",
    borderRadius: "50%",
    backgroundColor: "white",
    animation: "eye 7s ease-in-out infinite",
    position: "absolute",
              }}></div>
              <div style={{
                    height: "40px",
    width: "130px",
    backgroundColor: "#8594A5",
    borderRadius: "3px",
    margin: "80px auto",
    animation: "leaf 7s infinite",
    transformOrigin: "right",
              }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
