import React, { lazy } from "react";
import { makeStyles, useMediaQuery } from "@material-ui/core";
import CssBaseline from "@material-ui/core/CssBaseline";
import { useSelector, useDispatch } from "react-redux";
import AppbarHeader from "../AppbarHeader";
import DrawerMenu from "../DrawerMenu";
import GateOutFooter from '../gateOut/GateOutFooter'

const Footer = lazy(() => import('../Footer'))
const StocksAndAllotmentFooter = lazy(() => import('../StocksAndAllotmentFooter'))


const drawerWidth = 220;

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    backgroundColor: "#EAF0F5",
    minHeight: "100vh",
    overflowY:"scroll",
    [theme.breakpoints.down("sm")]: {
      display: "block",
    },
  },

  drawerHeader: {
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
    justifyContent: "flex-end",
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(1.5),
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: -drawerWidth,
    [theme.breakpoints.down("xs")]: {
      padding: theme.spacing(0.5),
      paddingLeft: theme.spacing(0.5),
      paddingRight: theme.spacing(0.5),
      marginLeft: "unset",
    },
  },
  contentShift: {
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  },
  /* _____Custom Styles__________ */

  appBar: {
    //
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    //
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    //
    marginRight: 36,
  },
  hide: {
    //
    display: "none",
  },
  toolbar: {
    //
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
  },

  Mycontent: {
    flexGrow: 1,
    padding: theme.spacing(3),
    [theme.breakpoints.down('xs')]: {
      padding: theme.spacing(2),
    },
    [theme.breakpoints.down("md")]: {
      width: "75%",
      fontSize: "0.8rem",
      padding: 1,
      height: 30
    },
  },
  [theme.breakpoints.down("md")]: {
    Mycontent: {
      width: "500px",
      fontSize: "0.8rem",
      padding: 1,
      height: 30
    },
  },
 
}));

const LayoutContainer = (props) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const store = useSelector((state) => state);
  const { ui ,user} = store;
  const matchesIpad = useMediaQuery("(max-width:1024px)");

  const handleDrawerOpen = () => {
    // setOpen(true);
    dispatch({ type: "TOGGLE_DRAWER_OPEN", payload: true });
  };

  const handleDrawerClose = () => {
    // setOpen(false);
    dispatch({ type: "TOGGLE_DRAWER_OPEN", payload: false });
  };

  const handleEmptyRedux = () => {
    dispatch({ type: "CLEAR_CHECKBOX" });
  };

  return (
    <>
      <div className={classes.root}>
        <CssBaseline />
        <AppbarHeader
          handleDrawerOpen={handleDrawerOpen}
          handleDrawerClose={handleDrawerClose}
          open={ui.drawerOpen}
        />
        {/* DRAWER MENU */}
       {(user.role!=="Surveyor"&& user.role!=="Repair" && user.role !== "MNR Team") && <DrawerMenu
          handleDrawerOpen={handleDrawerOpen}
          handleDrawerClose={handleDrawerClose}
          open={ui.drawerOpen}
          emptyRedux={handleEmptyRedux}
        />}
        <main
          className={
            classes.Mycontent
          }
          style={{width: matchesIpad ? "100%" : "80%" }}
          onClick={()=>{
            if (ui.drawerOpen) {
               handleDrawerClose()
            }
          }}
        >
          <div className={classes.drawerHeader} />
          {props.children}
        </main>
      </div>
      {props.footer &&
        (ui.depotGateType === "IN" ? (
          <Footer open={ui.drawerOpen} />
        ) : ui.depotGateType === "OUT" ? (
          <GateOutFooter open={ui.drawerOpen} />
        ) : (
          <StocksAndAllotmentFooter open={ui.drawerOpen} />
        ))}
    </>
  );
};
export default LayoutContainer;
