import React from "react";
import { useMediaQuery, CssBaseline, Box } from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import AppbarHeader from "../AppbarHeader";
import DrawerMenu from "../DrawerMenu";
import Footer from "../Footer";
import StocksAndAllotmentFooter from "../StocksAndAllotmentFooter";
import GateOutFooter from "../gateOut/GateOutFooter";

const drawerWidth = 220;

const LayoutContainer = (props) => {
  const dispatch = useDispatch();
  const store = useSelector((state) => state);
  const { ui, user } = store;
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
      <Box
        sx={(theme) => ({
          display: "flex",
          backgroundColor: theme.palette.secondary.light,
          minHeight: "100vh",
          overflowY:props?.hideScrollbar? "hidden":"scroll",

          [theme.breakpoints.down("sm")]: {
            display: "block",
          },
        })}
      >
        <CssBaseline />
        <AppbarHeader
          handleDrawerOpen={handleDrawerOpen}
          handleDrawerClose={handleDrawerClose}
          open={ui.drawerOpen}
        />
        {/* DRAWER MENU */}
        {user.role !== "Surveyor" &&
          user.role !== "Repair" &&
          user.role !== "MNR Team" && (
            <DrawerMenu
              handleDrawerOpen={handleDrawerOpen}
              handleDrawerClose={handleDrawerClose}
              open={ui.drawerOpen}
              emptyRedux={handleEmptyRedux}
            />
          )}
        <Box
          component={"main"}
          sx={(theme) => ({
            flexGrow: 1,
            padding: theme.spacing(3),
            [theme.breakpoints.down("xs")]: {
              padding: theme.spacing(2),
            },
            [theme.breakpoints.down("md")]: {
              width: "75%",
              fontSize: "0.8rem",
              padding: 1,
             
            },
          })}
          style={{ width: matchesIpad ? "100%" : "80%" }}
          onClick={() => {
            if (ui.drawerOpen) {
              handleDrawerClose();
            }
          }}
        >
          <Box
            sx={(theme) => ({
              display: "flex",
              alignItems: "center",
              padding: theme.spacing(0, 1),
              // necessary for content to be below app bar
              ...theme.mixins.toolbar,
              justifyContent: "flex-end",
            })}
          />
          {props.children}
        </Box>
      </Box>
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
