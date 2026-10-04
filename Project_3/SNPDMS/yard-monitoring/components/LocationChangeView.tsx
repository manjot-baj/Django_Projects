import { StyleSheet, View } from "react-native";
import React, { useEffect, useState } from "react";
import { Chip, Divider, Menu, Snackbar } from "react-native-paper";
import { useYardDashboardStore } from "@/store/yardDashboardStore";
import { yardDashboardLocationSitedata } from "@/services/api/yard/yardDashboard";
import { useAuthStore } from "@/store/authStore";
import { ThemedText } from "./themed-text";

const LocationChangeView = () => {
  const [location, setLocation] = useState<string>();
  const [visibleLocationMenu, setVisibleLocationMenu] = React.useState(false);
  const [visibleSiteMenu, setVisibleSiteMenu] = React.useState(false);

  const { setLoadingFalse, setLoadingTrue, setLocationAndSite } =
    useAuthStore();
  const [showSnackbaar, setShowSnackbaar] = useState(false);
  const { location_site_dashboard_list, setLocationSiteDashboardList } =
    useYardDashboardStore();

  const openLocationMenu = () => setVisibleLocationMenu(!visibleLocationMenu);
  const openSiteMenu = () => setVisibleSiteMenu(!visibleSiteMenu);
  const closeSiteMenu = () => setVisibleSiteMenu(false);

  const closeLocationMenu = () => setVisibleLocationMenu(false);
  const onToggleSnackBar = () => setShowSnackbaar(!showSnackbaar);
  const onDismissSnackBar = () => setShowSnackbaar(false);

  useEffect(() => {
    yardDashboardLocationSitedata(
      setLocationSiteDashboardList,
      setLoadingFalse,
      setLoadingTrue,
      onToggleSnackBar
    );
  }, []);

  return (
    <View style={styles.locationcontainer}>
      <ThemedText
        type="default"
        style={{
          marginBottom: 24,
          width: "100%",
          textAlign: "center",
          color: "gray",
          fontWeight: 400,
          fontSize: 14,
        }}
      >
        Please Select Location and Site To View the Data{" "}
      </ThemedText>
      <Menu
        visible={visibleLocationMenu}
        onDismiss={closeLocationMenu}
        anchorPosition="top"
        mode="elevated"
        contentStyle={{
          backgroundColor: "white", // 👈 Change background color
          borderRadius: 4,
          maxHeight: "100%",
          marginTop: 120,
        }}
        anchor={
          <Chip
            closeIcon={"menu-down"}
            onClose={() => {}}
            style={{
              backgroundColor: "white",
              borderColor: "black",
              minWidth: "100%",
            }}
            onPress={openLocationMenu}
          >
            {location ? location : "Select Location"}
          </Chip>
        }
      >
        {location_site_dashboard_list ? (
          Object.keys(location_site_dashboard_list)?.map((val) => (
            <Menu.Item
              key={val}
              onPress={() => {
                setLocation(val);
                closeLocationMenu();
              }}
              title={val}
            />
          ))
        ) : (
          <Menu.Item onPress={() => {}} title={"Loading"} />
        )}
      </Menu>
      <Divider style={{ marginTop: 24 }} />
      <Menu
        visible={visibleSiteMenu}
        onDismiss={closeSiteMenu}
        anchorPosition="top"
        mode="elevated"
        contentStyle={{
          backgroundColor: "white", // 👈 Change background color
          borderRadius: 4,
          maxHeight: "100%",
          marginTop: 45,
        }}
        anchor={
          <Chip
            closeIcon={"menu-down"}
            onClose={() => {}}
            style={{
              backgroundColor: "white",
              borderColor: "black",
              minWidth: "100%",
            }}
            onPress={openSiteMenu}
          >
            Select Site
          </Chip>
        }
      >
        {location_site_dashboard_list && location ? (
          location_site_dashboard_list?.[location]?.map((val: any) => (
            <Menu.Item
              key={val}
              onPress={() => {
                if (location && val) {
                  setLocationAndSite(location, val);
                }
              }}
              title={val}
            />
          ))
        ) : (
          <Menu.Item onPress={() => {}} title={"Loading"} />
        )}
      </Menu>
      <Snackbar
        visible={showSnackbaar}
        onDismiss={onDismissSnackBar}
        action={{
          label: "Remove",
          onPress: () => onToggleSnackBar(),
        }}
      >
        Please Login as Admin & try again.
      </Snackbar>
    </View>
  );
};

export default LocationChangeView;

const styles = StyleSheet.create({
  locationcontainer: {
    flex: 1,
    justifyContent: "flex-start", // vertical center
    alignItems: "center", // horizontal center
    width: "100%",
    minHeight: "100%",
    paddingHorizontal: 24,
    marginTop:100
  },
});
