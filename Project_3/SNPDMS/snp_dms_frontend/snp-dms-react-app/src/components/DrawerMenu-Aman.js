import React, { useEffect, useState } from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/core/styles";
import Drawer from "@material-ui/core/Drawer";
import { useHistory } from "react-router-dom";
import { useSelector } from "react-redux";
import { useSnackbar } from "notistack";
import List from "@material-ui/core/List";
import Divider from "@material-ui/core/Divider";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import Typography from "@material-ui/core/Typography";
import { drawerMenuItems } from "../utils/DrawerMenuItems";
import { hasChildren } from "../utils/DrawerLogic";
import Tooltip from "@material-ui/core/Tooltip";
import Zoom from "@material-ui/core/Zoom";
import Collapse from "@material-ui/core/Collapse";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";

function Info({ title, children, isOpen }) {
  if (isOpen) return children;
  return (
    <Tooltip
      title={title}
      placement="right"
      TransitionComponent={Zoom}
      arrow
      interactive={isOpen}
    >
      {children}
    </Tooltip>
  );
}

const drawerWidth = 300;
const phone = window.innerWidth <= 380 || "orientation" in window;

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
  },

  drawer: {
    width: drawerWidth,
    flexShrink: 0,
    position: "relative",
    overflowY: "auto",
  },
  drawerPaper: {
    width: drawerWidth,
    backgroundColor: "#243545",
    color: "#fff",
    opacity: 1,
  },
  drawerHeader: {
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(0, 1),
    ...theme.mixins.toolbar,
    justifyContent: "space-evenly",
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
    width: drawerWidth,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    backgroundColor: "#243545",
    color: "#fff",
    opacity: 1,

    overflowX: "hidden",
  },
  drawerClose: {
    //
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: "hidden",
    width: phone ? 0 : theme.spacing(7) + 1,

    [theme.breakpoints.up("sm")]: {
      width: theme.spacing(9) + 1,
    },

    backgroundColor: "#243545",
    color: "#fff",
    opacity: 1,
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
}));

const DrawerMenu = (props) => {
  const classes = useStyles();
  const { open } = props;
  const history = useHistory();
  const store = useSelector((state) => state);

  const transportModule = useSelector((state) =>
    state.user?.transportation_module === "False" ||
      state.user?.transportation_module === false
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

  const procurementModule = useSelector((state) =>
  state.user?.procurement_module === "False" || state.user?.procurement_module === false ||state.user?.procurement_module === undefined
    ? "False"
    : "True"
);

  const notify = useSnackbar().enqueueSnackbar;
  const { user } = store;
  const [drawerMenuItemData, setDrawerMenuItemData] = useState(drawerMenuItems);
  const [drawerMenuItemDataToMap, setDrawerMenuItemDataToMap] =
    useState(drawerMenuItems);

  useEffect(() => {
    let tempDrawrData = [...drawerMenuItemData];
    let removeIndex = tempDrawrData.findIndex(
      (drwrItem) => drwrItem?.title === "Transportation"
    );
    let removeLoadedYardIndex = tempDrawrData.findIndex(
      (drwrItem) => drwrItem.title === "Loaded Yard"
    );
  
    let removetransportData = tempDrawrData.find(
      (drwrItem) => drwrItem?.title === "Transportation" 
    );
 
    let removeLoadedYardData = tempDrawrData.find(
      (drwrItem) => drwrItem.title === "Loaded Yard"
    );
    let loadedProcurementModule =tempDrawrData.find((drwrItem) =>drwrItem.title==="Procurement")
    let procurementIndex = tempDrawrData.findIndex( (drwrItem) => drwrItem.title === "Procurement")
   
  
    if (
      (transportModule === "False" || !transportModule) &&
      (newBillingModule === "False" || !newBillingModule) &&
      (loadedYardModule === "False" || !loadedYardModule) &&
      (procurementModule === "False" || !procurementModule) &&
      (removetransportData?.title || removeLoadedYardData.title))
      {
      tempDrawrData.splice(removeIndex, 1);
      tempDrawrData.splice(removeLoadedYardIndex, 1);
      tempDrawrData.splice(procurementIndex,1)
      
     
      setDrawerMenuItemData(tempDrawrData);
    } else {
      setDrawerMenuItemData(drawerMenuItems);
    }
  }, [transportModule, loadedYardModule,newBillingModule,procurementModule]);

   // Based on values for Transportation and Billing, removing respective items from array
  useEffect(()=>{
    if (transportModule === "False" || loadedYardModule === "False"||procurementModule==="False") {
      let temporaryDrawerData = [...drawerMenuItemData];
      if (transportModule === "False") {
        temporaryDrawerData = temporaryDrawerData.filter(
          (menu) => menu.title !== "Transportation"
        );
      }

      if (loadedYardModule === "False") {
        temporaryDrawerData = temporaryDrawerData.filter(
          (menu) => menu.title !== "Loaded Yard"
        );
      }

      if (loadedYardModule === "False") {
        temporaryDrawerData = temporaryDrawerData.filter(
          (menu) => menu.title !== "Loaded Yard"
        );
      }

      if (procurementModule === "False") {
        temporaryDrawerData = temporaryDrawerData.filter(
          (menu) => menu.title !== "Procurement"
        );
      }
      

      setDrawerMenuItemDataToMap(temporaryDrawerData);
    } else {
      setDrawerMenuItemDataToMap(drawerMenuItems);
    }
  },[user.site])
 
   
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
    >
      <div className={classes.drawerHeader}>
        <Typography variant="h5" className={classes.headerTitle}>
          SNP
        </Typography>
      </div>
      <Divider />
      {drawerMenuItemDataToMap
        .filter((item) =>
          // Showing only logout on 'no role' and 'wistim distim' user
          user.role === "no role" || user.role === "Wistim Distim"
            ? item.title === "Logout"
            : // Showing only analytics and logout on 'analytics' user
            user.role === "Analytics"
              ? item.title === "Analytics" || item.title === "Logout"
              : // Showing only automation and logout on 'automation' user
              user.role === "Automation"
                ? item.title === "Automation" || item.title === "Logout"
                : // Not showing empty yard, analytics and automation on Non Depot user
                user.type === "NON DEPOT"
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
  return (
    <ListItem
      button
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
            history.push("analytics-dashboard");
          } else {
            history.push("dashboard");
          }
        } else {
          history.push(item.to);
        }
      }}
    >
      <ListItemIcon style={{ color: "white", opacity: 0.7 }}>
        {item.icon}
      </ListItemIcon>
      <ListItemText primary={item.title} />
    </ListItem>
  );
};

const MultiLevel = ({ item, history, notify, mnrModule }) => {
  const { items: children } = item;
  const [open, setOpen] = useState(false);

  return (
    <React.Fragment>
      <ListItem
        button
        onClick={() => {
          setOpen((prev) => !prev);
          history.push(children.to);
        }}
      >
        <ListItemIcon style={{ color: "white", opacity: 0.7 }}>
          {item.icon}
        </ListItemIcon>
        <ListItemText primary={item.title} />
        {open ? <ExpandLessIcon /> : <ExpandMoreIcon />}
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
