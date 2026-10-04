import React from "react";
import "../../src/index.css";
import { makeStyles } from "@material-ui/core";
import { Image } from "semantic-ui-react";
import { useHistory } from "react-router-dom";
const useStyles = makeStyles((theme) => ({
  container: { position: "absolute", right: "200px"},
  message: {
    fontFamily: "'Poppins', sans-serif",
    fontSize: "30px",
    color: "white",
    fontWeight: "500",
    position: "absolute",
    top: "230px",
    left: "150px",
  },
  message2: {
    fontFamily: "'Poppins', sans-serif",
    fontSize: "18px",
    color: "white",
    fontWeight: "300",
    width: "600px",
    position: "absolute",
    top: "280px",
    left: "150px",
  },
  message3: {
    fontFamily: "'Poppins', sans-serif",
    fontSize: "18px",
    color: "white",
    fontWeight: "300",
    width: "600px",
    position: "absolute",
    top: "380px",
    left: "150px",
  },
  neon: {
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
  },
  trash: {
    width: "170px",
    height: "220px",
    backgroundColor: "#585F67",
    top: "300px",
  },
  can: {
    width: "190px",
    height: "30px",
    backgroundColor: "#6B737C",
    borderRadius: "15px 15px 0 0",
  },
  door_frame: {
    height: "495px",
    width: "295px",
    borderRadius: "90px 90px 0 0",
    backgroundColor: "#8594A5",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  door: {
    height: "450px",
    width: "250px",
    borderRadius: "70px 70px 0 0",
    backgroundColor: "#A0AEC0",
  },
  eye: {
    top: "15px",
    left: "25px",
    height: "5px",
    width: "15px",
    borderRadius: "50%",
    backgroundColor: "white",
    animation: "eye 7s ease-in-out infinite",
    position: "absolute",
  },
  eye2: { left: "65px" },
  eye3:{
    top: "15px",
    height: "5px",
    left: "65px",
    width: "15px",
    borderRadius: "50%",
    backgroundColor: "white",
    animation: "eye 7s ease-in-out infinite",
    position: "absolute",
  },
  window: {
    height: "40px",
    width: "130px",
    backgroundColor: "#1C2127",
    borderRadius: "3px",
    margin: "80px auto",
    position: "relative",
  },
  leaf: {
    height: "40px",
    width: "130px",
    backgroundColor: "#8594A5",
    borderRadius: "3px",
    margin: "80px auto",
    animation: "leaf 7s infinite",
    transformOrigin: "right",
  },
  handle: {
    height: "8px",
    width: "50px",
    borderRadius: "4px",
    backgroundColor: "#EBF3FC",
    position: "absolute",
    marginTop: "250px",
    marginLeft: "30px",
  },
  rectangle: {
    height: "70px",
    width: "25px",
    backgroundColor: "#CBD8E6",
    borderRadius: "4px",
    position: "absolute",
    marginTop: "220px",
    marginLeft: "20px",
  },
  backImage: {
    height: 40,
    width: 40,
    marginBottom: 15,
    marginTop:20,
    marginLeft:20,
    cursor: "pointer",
  },
}));
const Unauthorized = () => {
  const classes = useStyles();
  const history = useHistory();
  const handleGoBack = () => {
    history.push('/login');
  };
  return (
    <div style={{backgroundColor:"#1C2127", height:"750px"}}>
       <Image
          src={require("../assets/images/back-arrow.png")}
          className={classes.backImage}
          onClick={handleGoBack}
        />
      <div className={classes.message}>You are not authorized.</div>
      <div  className={classes.message2}>
        You tried to access a page you did not have prior authorization for or may be the license has expired.
      </div>
      <div  className={classes.message3}>
       Kindly contact to Authorized person or reach out to pooja.kumari@sunandpearls.com
      </div>
      <div  className={classes.container}>
        <div className={classes.neon}>401</div>
        <div  className={classes.door_frame}>
          <div className={classes.door}>
            <div className={classes.rectangle}></div>
            <div className={classes.handle}></div>
            <div className={classes.window}>
              <div  className={classes.eye}></div>
              <div  className={classes.eye3}></div>
              <div  className={classes.leaf}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
