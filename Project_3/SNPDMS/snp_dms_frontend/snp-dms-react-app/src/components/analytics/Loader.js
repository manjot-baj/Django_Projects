import React from "react";
import Logo from "../../assets/images/snp-logo.jpeg";
import LinearProgress from "@material-ui/core/LinearProgress";
import makeStyles from "@material-ui/core/styles/makeStyles";

const useStyles = makeStyles((theme) => ({
  container: {
    alignItems: "center",
    justifyContent: "center",
    // textAlign: "center",
    alignSelf: "center",
    marginTop: window.innerHeight / 3,
  },
  img: {
    width: 200,
    [theme.breakpoints.down("xs")]: { width: 150 },
  },
  progress: {
    width: "30%",
    [theme.breakpoints.down("xs")]: { width: "70%" },
  },
}));

export default function Loader() {
  const styles = useStyles();
  return (
    <center>
      <div className={styles.container}>
        <img className={styles.img} src={Logo} height={"fit-content"} width={"fit-content"} alt="Main Page Loader" />
        <p>Please wait while we make everything done for you</p>
        <LinearProgress className={styles.progress} />
      </div>
    </center>
  );
}
