import React, { useEffect, useState } from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/core/styles";
import Drawer from "@material-ui/core/Drawer";
import { useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useSnackbar } from "notistack";
import List from "@material-ui/core/List";
import Divider from "@material-ui/core/Divider";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import Typography from "@material-ui/core/Typography";
import {
  drawerMenuItems,
  drawerMenuItemsLoaded,
  drawerMenuItemsServey,
} from "../utils/DrawerMenuItems";
import { hasChildren } from "../utils/DrawerLogic";
import Collapse from "@material-ui/core/Collapse";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import Logo from "../assets/images/snp-logo-new.png";
import { Box, IconButton } from "@material-ui/core";
import { useLocation } from "react-router-dom";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";

const drawerWidth = 250;
const phone = window.innerWidth <= 380 || "orientation" in window;

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
  },
  drawer: {
    width: drawerWidth,
    display: phone ? "hidden" : "block",
    flexShrink: 0,
    position: "relative",
    overflowY: "auto",

    backgroundColor: "transparent !important",
  },
  drawerPaper: {
    width: drawerWidth,
    backgroundColor: "rgb(10,10,10)",
    color: "#fff",
    opacity: 1,
  },
  drawerHeader: {
    display: "flex",
    position: "relative",
    alignItems: "center",
    padding: theme.spacing(0, 1),
    ...theme.mixins.toolbar,
    justifyContent: "flex-start",
    marginBottom: 10,
    marginTop: 2,
  },
  drawerCloseIcon: {
    backgroundColor: "white",
    height: "4px",
    width: "4px",
    padding: 10,
    position: "absolute",
    right: "-12px",
  },
  drawerFooter: {
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(0, 1),
    justifyContent: "space-evenly",
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "red",
  },
  headerTitle: {
    fontWeight: 600,
    letterSpacing: 3,
    marginLeft: 1,
  },
  nested: {
    paddingLeft: theme.spacing(4),
  },
  DrawerWrapper: {
    margin: "10px 0px",
  },
  selecteNestedItem: {
    backgroundColor: "#2A5FA5",
    borderRadius: 20,
    width: "100%",
    fontWeight: 600,
  },
  nestedItemIcon: {
    height: 20,
    width: 20,
    minWidth: 30,
  },
  nestedItemText: {
    fontSize: 12,
  },

  /*_______________ From example _____________*/
  drawerOpen: {
    //

    padding: "0px 8px ",
    width: drawerWidth,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    backgroundColor: "rgb(10,10,10)",
    color: "#fff",
    opacity: 1,
  },
  drawerClose: {
    overflow: "hidden",
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),

    width: phone ? 0 : theme.spacing(5) + 1,
    [theme.breakpoints.up("sm")]: {
      width: theme.spacing(7) + 1,
    },
    backgroundColor: "rgb(10,10,10)",
    color: "#fff",
    opacity: 1,
    zIndex: 1000,
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

  toggler: {
    alignSelf: "center",
    position: "fixed",
    bottom: 0,
    background: "#20303f",
    zIndex: 1,
    opacity: 1,
    borderRadius: 0,
    borderTop: "1px solid rgba(0,0,0, 0.1)",
  },

  togglerOpen: {
    width: drawerWidth,
  },

  togglerClose: {
    width: phone ? 0 : theme.spacing(7) + 1,

    paddingLeft: phone ? 0 : "inherit",
    paddingRight: phone ? 0 : "inherit",

    [theme.breakpoints.up("sm")]: {
      width: theme.spacing(9) + 1,
    },
  },
  selectedList: {},
  listItemIcon: {
    minWidth: 12,
  },
  drawerToggler: {
    position: "absolute",
    backgroundColor: "red",
    top: "calc(100vh - 50vh)",
    right: 10,
  },
  drawerTogglerIcon: {
    position: "fixed",
    height: "8px",
    width: "8px",
    padding: 12,
    backgroundColor: "white",
    zIndex: 10000,
    boxShadow: "rgba(0, 0, 0, 0.56) 0px 22px 70px 4px;",
    "&:hover": {
      backgroundColor: "white",
    },
  },
}));

const DrawerMenu = (props) => {
  const classes = useStyles();
  const { open } = props;
  const history = useHistory();
  const store = useSelector((state) => state);
  const dispatch = useDispatch();
  const { pathname } = useLocation();

  const transportModule = useSelector((state) =>
    state.user?.transportation_module === "False" ||
    state.user?.transportation_module === false
      ? "False"
      : "True"
  );

  const truckTrackingModule = useSelector((state) =>
    state.user?.truck_tracking === "False" ||
    state.user?.truck_tracking === false ||
    state.user?.truck_tracking === "false"
      ? "False"
      : "True"
  );

  const newBillingModule = useSelector((state) =>
    state.user?.new_billing_module === "False" ||
    state.user?.new_billing_module === false
      ? "False"
      : "True"
  );

  const loadedYardModule = useSelector((state) =>
    state.user?.loaded_yard_module === "False" ||
    state.user?.loaded_yard_module === false
      ? "False"
      : "True"
  );

  const mnrModule = useSelector((state) =>
    state.user?.mnr_module === "False" || state.user?.mnr_module === false
      ? "False"
      : "True"
  );

  const enBlockModule = useSelector((state) =>
    state.user?.en_block_movement === "False" ||
    state.user?.en_block_movement === false ||
    state.user?.en_block_movement === "false" ||
    state.user?.en_block_movement === null ||
    state.user?.en_block_movement === undefined
      ? "False"
      : "True"
  );

  const enBlockVersion2 = useSelector((state) =>
    state.user?.en_block_movement_v2 === "False" ||
    state.user?.en_block_movement_v2 === false ||
    state.user?.en_block_movement_v2 === "false" ||
    state.user?.en_block_movement_v2 === null ||
    state.user?.en_block_movement_v2 === undefined
      ? "False"
      : "True"
  );

  const procurementModule = useSelector((state) =>
    state.user?.procurement_module === "False" ||
    state.user?.procurement_module === false ||
    state.user?.procurement_module === undefined
      ? "False"
      : "True"
  );

  const loloFinanceModule = useSelector((state) =>
    state.user?.lolo_finance === "False" ||
    state.user?.lolo_finance === false ||
    state.user?.lolo_finance === undefined
      ? "False"
      : "True"
  );

  const notify = useSnackbar().enqueueSnackbar;
  const { user } = store;
  const [drawerMenuItemData, setDrawerMenuItemData] = useState(
    user.role === "Loaded Yard"
      ? drawerMenuItemsLoaded
      : user.role === "Surveyor"
      ? drawerMenuItemsServey
      : drawerMenuItems(user)
  );
  const [drawerMenuItemDataToMap, setDrawerMenuItemDataToMap] = useState(
    user.role === "Loaded Yard"
      ? drawerMenuItemsLoaded
      : user.role === "Surveyor"
      ? drawerMenuItemsServey
      : drawerMenuItems(user)
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
          (menu) => menu.title !== "Transportation"
        );
      }

      if (loadedYardModule === "False" && user.role !== "Loaded Yard") {
        temporaryDrawerData = temporaryDrawerData.filter(
          (menu) => menu.title !== "Loaded-Yard"
        );
      }

      if (procurementModule === "False") {
        temporaryDrawerData = temporaryDrawerData.filter(
          (menu) => menu.title !== "Procurement"
        );
      }

      if (
        (user.procurement_admin === false ||
          user.procurement_admin === "False") &&
        procurementModule === "True"
      ) {
        let procurementMenuData = temporaryDrawerData?.filter(
          (menu) => menu.title === "Procurement"
        )[0];
        procurementMenuData.items = procurementMenuData?.items?.filter(
          (item) =>
            item.title !== "Requistion" &&
            item.title !== "Master Stock" &&
            item.title !== "Tool Rate history"
        );
        let procurementIndex = temporaryDrawerData?.findIndex(
          (item) => item.title === "Procurement"
        );
        temporaryDrawerData[procurementIndex] = procurementMenuData;
      } else if (
        (user.procurement_admin === true ||
          user.procurement_admin === "True") &&
        procurementModule === "True"
      ) {
        let tempProcurementData = drawerMenuItems(user)?.filter(
          (menu) => menu.title === "Procurement"
        )[0];
        let procurementAdminIndex = temporaryDrawerData?.findIndex(
          (item) => item.title === "Procurement"
        );
        temporaryDrawerData[procurementAdminIndex] = tempProcurementData;
      }
      if (user.role !== "Admin") {
        temporaryDrawerData = temporaryDrawerData.filter(
          (menu) => menu.title !== "Adhoc Report"
        );
      }

      if (newBillingModule === "False") {
        temporaryDrawerData = temporaryDrawerData.filter(
          (menu) => menu.title !== "Billing"
        );
      }

      if (loloFinanceModule === "False") {
        temporaryDrawerData = temporaryDrawerData.filter(
          (menu) => menu.title !== "Lolo Payment"
        );
      }

      if (truckTrackingModule === "False") {
        let truckTrackingMenuData = temporaryDrawerData?.filter(
          (menu) => menu.title === "Empty Yard"
        )[0];
        if (truckTrackingMenuData?.items === undefined) {
          return;
        }
        truckTrackingMenuData.items = truckTrackingMenuData?.items.filter(
          (item) => item.title !== "Truck Tracking"
        );
        let truckTrackingIndex = temporaryDrawerData?.findIndex(
          (item) => item.title === "Empty Yard"
        );
        temporaryDrawerData[truckTrackingIndex] = truckTrackingMenuData;
      }else if(truckTrackingModule ==="True"){
        let truckTrackingMenuData = temporaryDrawerData?.filter(
          (menu) => menu.title === "Empty Yard"
        )[0];
        if (!truckTrackingMenuData?.items.find(val=>val.title ==="Truck Tracking")) {
          if (truckTrackingMenuData?.items !==undefined) {
            truckTrackingMenuData.items.push({title:"Truck Tracking",to:'/depot/truck-turn-around'})
            let truckTrackingIndex = temporaryDrawerData?.findIndex(
             (item) => item.title === "Empty Yard"
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
          (item) => item.title === "Empty Yard"
        );
        if (
          temporaryDrawerData[enBlockIndex]?.items !== null &&
          temporaryDrawerData[enBlockIndex]?.items !== undefined
        ) {
          temporaryDrawerData[enBlockIndex].items = tempEnBlock;
        }
      } else if (enBlockModule === "True") {
        let enBlockData = temporaryDrawerData?.filter(
          (menu) => menu.title === "Empty Yard"
        )[0];

        if (
          !enBlockData?.items.find(
            (val) => val.title === "EN Block Movement"
          )
        ) {
          if (enBlockData?.items !== undefined) {
            enBlockData.items.push({title:"EN Block Movement", to: "/enBlock" });
            let enBlockIndex = temporaryDrawerData?.findIndex(
              (item) => item.title === "Empty Yard"
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
          (item) => item.title === "Empty Yard"
        );
        if (
          temporaryDrawerData[enBlockVersion2Index]?.items !== null &&
          temporaryDrawerData[enBlockVersion2Index]?.items !== undefined
        ) {
          temporaryDrawerData[enBlockVersion2Index].items = tempEnBlockVersion2;
        }
      }else if(enBlockVersion2 ==="True"){
        let enBlockVersion2Data = temporaryDrawerData?.filter(
          (menu) => menu.title === "Empty Yard"
        )[0];

        if (
          !enBlockVersion2Data?.items.find(
            (val) => val.title === "EN Block Pre Gate In"
          )
        ) {
          if (enBlockVersion2Data?.items !== undefined) {
            enBlockVersion2Data.items.push({title:"EN Block Pre Gate In", to: "/enBlock-Pre-Gate-IN" });
            let enBlockIndex = temporaryDrawerData?.findIndex(
              (item) => item.title === "Empty Yard"
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
          : drawerMenuItems(user)
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
      className={clsx(classes.drawer, {
        [classes.drawerOpen]: open,
        [classes.drawerClose]: !open,
      })}
      classes={{
        paper: clsx({
          [classes.drawerOpen]: open,
          [classes.drawerClose]: !open,
        }),
      }}
      onClick={() => {
        if (!open) {
          handleDrawerOpen();
        }
      }}
    >
      {!phone && (
        <Box className={classes.drawerToggler}>
          <IconButton
            onClick={open ? handleDrawerClose : handleDrawerOpen}
            className={classes.drawerTogglerIcon}
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

      <div className={classes.drawerHeader}>
        <img src={Logo} alt="" height="30" width="fit-content" />
        {open && (
          <Typography variant="h5" className={classes.headerTitle}>
            SNP
          </Typography>
        )}
        {/* { <IconButton onClick={handleDrawerClose} className={classes.drawerCloseIcon}>
      <ExpandMoreIcon  style={{fill:"#000"}} fontSize="small"/>
    </IconButton>} */}
      </div>
      <Divider
        style={{ marginTop: "12px", backgroundColor: "rgb(24,25,27)" }}
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
            ? (loadedYardModule === "True" && item.title === "Loaded Yard") ||
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
              item.title !== "Automation"
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
  const classes = makeStyles();
  const dispatch = useDispatch();

  const handleDrawerClose = () => {
    // setOpen(false);
    dispatch({ type: "TOGGLE_DRAWER_OPEN", payload: false });
  };

  return (
    <ListItem
      button
      style={{
        backgroundColor:
          item?.title?.toLowerCase() === pathname.split("/")[1] ||
          item?.headline?.includes(pathname.split("/")[1])
            ? "rgb(34,34,34)"
            : "transparent",
        borderRadius: "12px",
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
        style={{
          color: "white",
          minWidth: "24px",
          width: "40px",
          opacity: item?.to === pathname ? 1 : 0.5,
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
              opacity: item?.to === pathname ? 1 : 0.7,
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
  const classes = makeStyles();

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
