import React, { useEffect, useState } from "react";
import {
  Drawer,
  List,
  Divider,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Collapse,
  Box,
  IconButton,
} from "@mui/material";
import { useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useSnackbar } from "notistack";

import {
  drawerMenuItems,
  drawerMenuItemsLoaded,
  drawerMenuItemsServey,
} from "../utils/DrawerMenuItems";
import { hasChildren } from "../utils/DrawerLogic";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Logo from "../assets/images/snp-logo-new.png";
import { useLocation } from "react-router-dom";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";

const drawerWidth = 250;
const phone = window.innerWidth <= 380 || "orientation" in window;

const DrawerMenu = (props) => {
  const { open } = props;
  const history = useHistory();
  const store = useSelector((state) => state);
  const dispatch = useDispatch();
  const { pathname } = useLocation();

  const transportModule = useSelector((state) =>
    state.user?.transportation_module === "False" ||
    state.user?.transportation_module === false
      ? "False"
      : "True",
  );

  const truckTrackingModule = useSelector((state) =>
    state.user?.truck_tracking === "False" ||
    state.user?.truck_tracking === false ||
    state.user?.truck_tracking === "false"
      ? "False"
      : "True",
  );

  const newBillingModule = useSelector((state) =>
    state.user?.new_billing_module === "False" ||
    state.user?.new_billing_module === false
      ? "False"
      : "True",
  );

  const loadedYardModule = useSelector((state) =>
    state.user?.loaded_yard_module === "False" ||
    state.user?.loaded_yard_module === false
      ? "False"
      : "True",
  );

  const mnrModule = useSelector((state) =>
    state.user?.mnr_module === "False" || state.user?.mnr_module === false
      ? "False"
      : "True",
  );

  const enBlockModule = useSelector((state) =>
    state.user?.en_block_movement === "False" ||
    state.user?.en_block_movement === false ||
    state.user?.en_block_movement === "false" ||
    state.user?.en_block_movement === null ||
    state.user?.en_block_movement === undefined
      ? "False"
      : "True",
  );

  const enBlockVersion2 = useSelector((state) =>
    state.user?.en_block_movement_v2 === "False" ||
    state.user?.en_block_movement_v2 === false ||
    state.user?.en_block_movement_v2 === "false" ||
    state.user?.en_block_movement_v2 === null ||
    state.user?.en_block_movement_v2 === undefined
      ? "False"
      : "True",
  );

  const procurementModule = useSelector((state) =>
    state.user?.procurement_module === "False" ||
    state.user?.procurement_module === false ||
    state.user?.procurement_module === undefined
      ? "False"
      : "True",
  );

  const loloFinanceModule = useSelector((state) =>
    state.user?.lolo_finance === "False" ||
    state.user?.lolo_finance === false ||
    state.user?.lolo_finance === undefined
      ? "False"
      : "True",
  );

  const notify = useSnackbar().enqueueSnackbar;
  const { user } = store;
  const [drawerMenuItemData, setDrawerMenuItemData] = useState(
    user.role === "Loaded Yard"
      ? drawerMenuItemsLoaded
      : user.role === "Surveyor"
        ? drawerMenuItemsServey
        : drawerMenuItems(user),
  );
  const [drawerMenuItemDataToMap, setDrawerMenuItemDataToMap] = useState(
    user.role === "Loaded Yard"
      ? drawerMenuItemsLoaded
      : user.role === "Surveyor"
        ? drawerMenuItemsServey
        : drawerMenuItems(user),
  );

  //  Based on values for Transportation and Billing, removing respective items from array

  useEffect(() => {
    if (
      transportModule === "False" ||
      loadedYardModule === "False" ||
      procurementModule === "False" ||
      newBillingModule == "False" ||
      loloFinanceModule === "False" ||
      procurementModule === "True" ||
      truckTrackingModule === "False" ||
      enBlockModule === "False" ||
      enBlockModule === "True" ||
      enBlockVersion2 === "False"
    ) {
      let temporaryDrawerData = [...drawerMenuItemData];
      if (transportModule === "False") {
        temporaryDrawerData = temporaryDrawerData.filter(
          (menu) => menu.title !== "Transportation",
        );
      }

      if (loadedYardModule === "False" && user.role !== "Loaded Yard") {
        temporaryDrawerData = temporaryDrawerData.filter(
          (menu) => menu.title !== "Loaded-Yard",
        );
      }

      if (procurementModule === "False") {
        temporaryDrawerData = temporaryDrawerData.filter(
          (menu) => menu.title !== "Procurement",
        );
      }

      if (
        (user.procurement_admin === false ||
          user.procurement_admin === "False") &&
        procurementModule === "True"
      ) {
        let procurementMenuData = temporaryDrawerData?.filter(
          (menu) => menu.title === "Procurement",
        )[0];
        procurementMenuData.items = procurementMenuData?.items?.filter(
          (item) =>
            item.title !== "Requistion" &&
            item.title !== "Master Stock" &&
            item.title !== "Tool Rate history",
        );
        let procurementIndex = temporaryDrawerData?.findIndex(
          (item) => item.title === "Procurement",
        );
        temporaryDrawerData[procurementIndex] = procurementMenuData;
      } else if (
        (user.procurement_admin === true ||
          user.procurement_admin === "True") &&
        procurementModule === "True"
      ) {
        let tempProcurementData = drawerMenuItems(user)?.filter(
          (menu) => menu.title === "Procurement",
        )[0];
        let procurementAdminIndex = temporaryDrawerData?.findIndex(
          (item) => item.title === "Procurement",
        );
        temporaryDrawerData[procurementAdminIndex] = tempProcurementData;
      }
      if (user.role !== "Admin") {
        temporaryDrawerData = temporaryDrawerData.filter(
          (menu) =>
            menu.title !== "Adhoc Report" && menu.title !== "AI Analytics",
        );
      }
     

      if (newBillingModule === "False") {
        temporaryDrawerData = temporaryDrawerData.filter(
          (menu) => menu.title !== "Billing",
        );
      }

      if (loloFinanceModule === "False") {
        temporaryDrawerData = temporaryDrawerData.filter(
          (menu) => menu.title !== "Lolo Payment",
        );
      }

      if (truckTrackingModule === "False") {
        let truckTrackingMenuData = temporaryDrawerData?.filter(
          (menu) => menu.title === "Empty Yard",
        )[0];
        if (truckTrackingMenuData?.items === undefined) {
          return;
        }
        truckTrackingMenuData.items = truckTrackingMenuData?.items.filter(
          (item) => item.title !== "Truck Tracking",
        );
        let truckTrackingIndex = temporaryDrawerData?.findIndex(
          (item) => item.title === "Empty Yard",
        );
        temporaryDrawerData[truckTrackingIndex] = truckTrackingMenuData;
      } else if (truckTrackingModule === "True") {
        let truckTrackingMenuData = temporaryDrawerData?.filter(
          (menu) => menu.title === "Empty Yard",
        )[0];
        if (
          !truckTrackingMenuData?.items.find(
            (val) => val.title === "Truck Tracking",
          )
        ) {
          if (truckTrackingMenuData?.items !== undefined) {
            truckTrackingMenuData.items.push({
              title: "Truck Tracking",
              to: "/depot/truck-turn-around",
            });
            let truckTrackingIndex = temporaryDrawerData?.findIndex(
              (item) => item.title === "Empty Yard",
            );
            temporaryDrawerData[truckTrackingIndex] = truckTrackingMenuData;
          }
        }
      }

      if (enBlockModule === "False") {
        let tempEnBlock = temporaryDrawerData
          .find((menu) => menu.title === "Empty Yard")
          ?.items.filter((item) => item.title !== "EN Block Movement");
        let enBlockIndex = temporaryDrawerData?.findIndex(
          (item) => item.title === "Empty Yard",
        );
        if (
          temporaryDrawerData[enBlockIndex]?.items !== null &&
          temporaryDrawerData[enBlockIndex]?.items !== undefined
        ) {
          temporaryDrawerData[enBlockIndex].items = tempEnBlock;
        }
      } else if (enBlockModule === "True") {
        let enBlockData = temporaryDrawerData?.filter(
          (menu) => menu.title === "Empty Yard",
        )[0];

        if (
          !enBlockData?.items.find((val) => val.title === "EN Block Movement")
        ) {
          if (enBlockData?.items !== undefined) {
            enBlockData.items.push({
              title: "EN Block Movement",
              to: "/empty-yard/enBlock",
            });
            let enBlockIndex = temporaryDrawerData?.findIndex(
              (item) => item.title === "Empty Yard",
            );
            temporaryDrawerData[enBlockIndex] = enBlockData;
          }
        }
      }

      if (enBlockVersion2 === "False") {
        let tempEnBlockVersion2 = temporaryDrawerData
          .find((menu) => menu.title === "Empty Yard")
          ?.items.filter((item) => item.title !== "EN Block Pre Gate In");
        let enBlockVersion2Index = temporaryDrawerData?.findIndex(
          (item) => item.title === "Empty Yard",
        );
        if (
          temporaryDrawerData[enBlockVersion2Index]?.items !== null &&
          temporaryDrawerData[enBlockVersion2Index]?.items !== undefined
        ) {
          temporaryDrawerData[enBlockVersion2Index].items = tempEnBlockVersion2;
        }
      } else if (enBlockVersion2 === "True") {
        let enBlockVersion2Data = temporaryDrawerData?.filter(
          (menu) => menu.title === "Empty Yard",
        )[0];

        if (
          !enBlockVersion2Data?.items.find(
            (val) => val.title === "EN Block Pre Gate In",
          )
        ) {
          if (enBlockVersion2Data?.items !== undefined) {
            enBlockVersion2Data.items.push({
              title: "EN Block Pre Gate In",
              to: "/enBlock-Pre-Gate-IN",
            });
            let enBlockIndex = temporaryDrawerData?.findIndex(
              (item) => item.title === "Empty Yard",
            );
            temporaryDrawerData[enBlockIndex] = enBlockVersion2Data;
          }
        }
      }

      setDrawerMenuItemDataToMap(temporaryDrawerData);
    } else {
      setDrawerMenuItemDataToMap(
        user.role === "Loaded Yard"
          ? drawerMenuItemsLoaded
          : user.role === "Surveyor"
            ? drawerMenuItemsServey
            : drawerMenuItems(user),
      );
    }
  }, [
    user.site,
    procurementModule,
    loadedYardModule,
    transportModule,
    newBillingModule,
    mnrModule,
    drawerMenuItemData,
    loloFinanceModule,
    user.procurement_admin,
    truckTrackingModule,
    enBlockModule,
    enBlockVersion2,
  ]);

  const handleDrawerOpen = () => {
    dispatch({ type: "TOGGLE_DRAWER_OPEN", payload: true });
  };

  const handleDrawerClose = () => {
    // setOpen(false);
    dispatch({ type: "TOGGLE_DRAWER_OPEN", payload: false });
  };
  return (
    <Drawer
      variant="permanent"
      color="secondary"
      sx={(theme) => ({
        display: "block",
        flexShrink: 0,
        position: "relative",

        width: open ? drawerWidth : 61,
        transition: `${theme.transitions.create("width", {
          easing: theme.transitions.easing.sharp,
          duration: open
            ? theme.transitions.duration.enteringScreen
            : theme.transitions.duration.leavingScreen,
        })} `,

        padding: "0 8px",
        "& .MuiPaper-root": {
          bgcolor: theme.palette.secondary.dark,
          width: open ? drawerWidth : 61,
          [theme.breakpoints.down("sm")]: {
            visibility: open ? "visible" : "hidden",
          },
          transition: `${theme.transitions.create("width", {
            easing: theme.transitions.easing.sharp,
            duration: open
              ? theme.transitions.duration.enteringScreen
              : theme.transitions.duration.leavingScreen,
          })} `,
          overflowX: open ? "visible" : "hidden",
          padding: "0 8px",
        },
      })}
      onClick={() => {
        if (!open) {
          handleDrawerOpen();
        }
      }}
    >
      {!phone && (
        <Box
          sx={{
            position: "absolute",
            backgroundColor: "red",
            top: "calc(100vh - 50vh)",
            right: 10,
          }}
        >
          <IconButton
            onClick={open ? handleDrawerClose : handleDrawerOpen}
            color="primary"
            sx={{
              position: "fixed",
              height: "12px",
              width: "12px",
              padding: 1.2,
              backgroundColor: "white",
              zIndex: 10000,
              boxShadow: "rgba(0, 0, 0, 0.56) 0px 22px 70px 4px;",
              "&:hover": {
                backgroundColor: "white",
              },
            }}
          >
            {open ? (
              <KeyboardArrowLeftIcon
                fontSize="small"
                style={{ fill: "rgb(10,10,10)" }}
              />
            ) : (
              <KeyboardArrowRightIcon
                style={{ fill: "rgb(10,10,10)" }}
                fontSize="small"
              />
            )}
          </IconButton>
        </Box>
      )}

      <Box
        sx={(theme) => ({
          display: "flex",
          position: "relative",
          alignItems: "center",
          padding: theme.spacing(0, 1),
          ...theme.mixins.toolbar,
          justifyContent: "flex-start",

          marginTop: 0,
        })}
      >
        <img src={Logo} alt="" height="30" width="fit-content" />
        {open && (
          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              letterSpacing: 3,
              marginLeft: 1,
              color: "white",
            }}
          >
            SNP
          </Typography>
        )}
      </Box>
      <Divider
        style={{
          marginTop: 0,
          backgroundColor: "rgb(24,25,27)",
          marginBottom: 24,
        }}
      />

      {drawerMenuItemDataToMap
        .filter((item) =>
          // Showing only logout on 'no role' and 'wistim distim' user
          user.role === "no role" || user.role === "Wistim Distim"
            ? item.title === "Logout"
            : // Showing only analytics and logout on 'analytics' user
              user.role === "Analytics"
              ? item.title === "Analytics" || item.title === "Logout"
              : user.role === "Loaded Yard"
                ? (loadedYardModule === "True" &&
                    item.title === "Loaded Yard") ||
                  item.title === "Logout" ||
                  item.title === "Dashboard"
                : // Showing only automation and logout on 'automation' user
                  user.role === "Surveyor"
                  ? item.title === "Servey" ||
                    item.title === "Logout" ||
                    item.title === "Dashboard"
                  : user.role === "Automation"
                    ? item.title === "Automation" || item.title === "Logout"
                    : // Not showing empty yard, analytics and automation on Non Depot user
                      user.role === "Admin"
                      ? user.type === "NON DEPOT"
                        ? item.title !== "Empty Yard"
                        : // Not showing the below listed items for Depot sites
                          item.title !== "CFS/ICD"
                      : user.type === "NON DEPOT"
                        ? item.title !== "Empty Yard" &&
                          item.title !== "Analytics" &&
                          item.title !== "Automation"
                        : // Not showing the below listed items for Depot sites
                          item.title !== "CFS/ICD" &&
                          item.title !== "Analytics" &&
                          item.title !== "Automation",
        )
        .map((item, key) => (
          <MenuItem
            key={key}
            item={item}
            history={history}
            notify={notify}
            mnrModule={mnrModule}
          />
        ))}

      <Divider />
      <Divider />
    </Drawer>
  );
};

const MenuItem = ({ item, history, notify, mnrModule }) => {
  const Component = hasChildren(item) ? MultiLevel : SingleLevel;
  return (
    <Component
      item={item}
      history={history}
      notify={notify}
      mnrModule={mnrModule}
    />
  );
};

const SingleLevel = ({ item, history, notify }) => {
  const { pathname } = useLocation();

  const dispatch = useDispatch();

  const handleDrawerClose = () => {
    // setOpen(false);
    dispatch({ type: "TOGGLE_DRAWER_OPEN", payload: false });
  };
  

  
  
  
  if (item.disableOnDrawer) {
    return null
  }

  return (
    <ListItem
      button
      style={{
        backgroundColor:
          item?.title?.toLowerCase() === pathname.split("/")[1] ||
          item?.headline?.includes(pathname.split("/")[1]) ||
          pathname?.split("/")?.[1] === item?.enableSinglePageLink
            ? "rgb(34,34,34)"
            : "transparent",
        borderRadius: "12px",
        cursor: "pointer",
      }}
      onClick={() => {
        if (
          item.title !== "Dashboard" &&
          item.title !== "Logout" &&
          (localStorage.getItem("location") === "" ||
            localStorage.getItem("site") === "")
        ) {
          notify("Enter Location and Site in Dashboard", {
            variant: "warning",
          });
          if (
            item.title === "Handling" ||
            item.title === "Self Transportation" ||
            item.title === "Stock" ||
            item.title === "MNR"
          ) {
            history.push("analytics/dashboard");
          } else {
            history.push("dashboard");
          }
        } else {
          history.push(item.to);
          if (phone) {
            handleDrawerClose();
          }
        }
      }}
    >
      <ListItemIcon
        sx={{
          color: "white",
          minWidth: "24px",
          width: "40px",
          opacity:
            item?.to === pathname ||
            pathname?.split("/")?.[1] === item?.enableSinglePageLink
              ? 1
              : 0.5,
        }}
      >
        {item.icon}
      </ListItemIcon>
      <ListItemText
        primary={
          <Typography
            variant="caption"
            style={{
              color: "#FFFFFF",
              opacity:
                item?.to === pathname ||
                (pathname?.split("/")?.[3]
                  ? pathname?.split("/")?.[2] ===
                    item?.enableNestedSinglePageLink
                  : pathname?.split("/")?.[1] === item?.enableNestedSinglePageLink)
                  ? 1
                  : 0.7,
            }}
          >
            {item.title}
          </Typography>
        }
      />
    </ListItem>
  );
};

const MultiLevel = ({ item, history, notify, mnrModule }) => {
  const { items: children } = item;
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  return (
    <React.Fragment>
      <ListItem
        button
        onClick={() => {
          setOpen((prev) => !prev);
          history.push(children.to);
        }}
        style={{
          backgroundColor:
            item?.title?.toLowerCase() === pathname.split("/")[1] ||
            item?.headline?.includes(pathname.split("/")[1])
              ? "rgb(34,34,34)"
              : "transparent",
          borderRadius: "12px",
          cursor: "pointer",
        }}
      >
        <ListItemIcon
          style={{
            color: "white",
            minWidth: "24px",
            width: "40px",
            opacity:
              item?.title?.toLowerCase() === pathname.split("/")[1] ||
              item?.headline?.includes(pathname.split("/")[1])
                ? 1
                : item?.sub && children?.some((val) => val.to === pathname)
                  ? 1
                  : 0.5,
          }}
        >
          {item.icon}
        </ListItemIcon>
        <ListItemText
          primary={
            <Typography
              variant="caption"
              style={{
                color: "#FFFFFF",
                opacity:
                  item?.title?.toLowerCase() === pathname.split("/")[1] ||
                  item?.headline?.includes(pathname.split("/")[1])
                    ? 1
                    : item?.sub && children?.some((val) => val.to === pathname)
                      ? 1
                      : 0.7,
              }}
            >
              {item.title}
            </Typography>
          }
        />
        {open ? (
          <ExpandLessIcon fontSize="small" />
        ) : (
          <ExpandMoreIcon fontSize="small" />
        )}
      </ListItem>
      <Collapse
        in={open}
        timeout="auto"
        unmountOnExit
        style={{ minHeight: "auto" }}
      >
        <List component="div" disablePadding>
          {mnrModule === "False"
            ? children
                .filter((e) => e.title !== "MNR")
                .map((child, key) => (
                  <MenuItem
                    key={key}
                    item={child}
                    history={history}
                    notify={notify}
                  />
                ))
            : children.map((child, key) => (
                <MenuItem
                  key={key}
                  item={child}
                  history={history}
                  notify={notify}
                />
              ))}
        </List>
      </Collapse>
    </React.Fragment>
  );
};
export default DrawerMenu;
