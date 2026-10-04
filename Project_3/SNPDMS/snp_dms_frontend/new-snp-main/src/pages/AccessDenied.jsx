import React from "react";
import "../../src/index.css";
import { useHistory } from "react-router-dom";
import CustomBackButton from "@components/reusablecomponents/CustomBackButton";
import { Box, Stack } from "@mui/material";

const AccessDenied = () => {
  const history = useHistory();

  const handleGoBack = () => {
    history.goBack();
  };

  return (
    <div
      style={{
        backgroundColor: "#1C2127",
        height: "100vh",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Box mt={2} ml={2}>
        <CustomBackButton handleGoBack={handleGoBack} />
      </Box>

      {/* 403 Code */}
      <Stack
        sx={{
          position: "absolute",
          top: "80px",
          right: "200px",
        }}
        direction={"column"}
        flexDirection={"column"}
        alignItems={"center"}
        justifyContent={"flex-start"}
      >
        <div
          style={{
            textAlign: "center",
            fontSize: "90px",
            color: "#5BE0B3",
            letterSpacing: "3px",
            fontFamily: "'Varela Round', sans-serif",
            textShadow: "0 0 5px #6EECC1",
          }}
        >
          403
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
              position: "relative",
            }}
          >
            <div
              style={{
                height: "70px",
                width: "25px",
                backgroundColor: "#CBD8E6",
                borderRadius: "4px",
                position: "absolute",
                top: "220px",
                left: "20px",
              }}
            ></div>

            <div
              style={{
                height: "8px",
                width: "50px",
                borderRadius: "4px",
                backgroundColor: "#EBF3FC",
                position: "absolute",
                top: "250px",
                left: "30px",
              }}
            ></div>

            <div
              style={{
                height: "40px",
                width: "130px",
                backgroundColor: "#1C2127",
                borderRadius: "3px",
                margin: "80px auto",
                position: "relative",
              }}
            >
              {/* Eyes */}
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

              <div
                style={{
                  top: "15px",
                  left: "65px",
                  height: "5px",
                  width: "15px",
                  borderRadius: "50%",
                  backgroundColor: "white",
                  animation: "eye 7s ease-in-out infinite",
                  position: "absolute",
                }}
              ></div>
            </div>

            {/* Moving Leaf */}
            <div
              style={{
                height: "40px",
                width: "130px",
                backgroundColor: "#8594A5",
                borderRadius: "3px",
                margin: "80px auto",
                animation: "leaf 7s infinite",
                transformOrigin: "right",
              }}
            ></div>
          </div>
        </div>
      </Stack>

    

      {/* Friendly Message */}
      <div
        style={{
          position: "absolute",
          top: "180px",
          left: "150px",
          color: "white",
          fontFamily: "'Poppins', sans-serif",
          maxWidth: "600px",
        }}
      >
        <div style={{ fontSize: "32px", fontWeight: "600", color: "#FF6B6B" }}>
          Oops! You don't have access 😔
        </div>

        <div style={{ marginTop: "20px", fontSize: "18px", fontWeight: "300" }}>
          You tried to access a page that requires special permissions or your
          access has expired.
        </div>

        <div style={{ marginTop: "20px", fontSize: "16px", fontWeight: "300" }}>
          Please contact your admin or email us at:
          <br />
          <span style={{ color: "#5BE0B3", fontWeight: "500" }}>
            pooja.kumari@sunandpearls.com
          </span>
        </div>
      </div>
    </div>
  );
};

export default AccessDenied;
