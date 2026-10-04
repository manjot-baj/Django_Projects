import { Image } from "expo-image";
import React, { useState } from "react";
import { Pressable, StyleSheet, View, Modal } from "react-native";
import {
  ActivityIndicator,
  Button,
  Chip,
  Divider,
  IconButton,
  List,
  MD2Colors,
  Snackbar,
  useTheme,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useAuthStore } from "@/store/authStore";
import Ionicons from "@expo/vector-icons/Ionicons";
import { ThemedText } from "./themed-text";
import LocationChangeView from "./LocationChangeView";

type Props = {
  children: React.ReactNode;
};

const LayoutContainer: React.FC<Props> = ({ children }) => {
  const theme = useTheme();

  const {
    user,
    logout,
    changeLocationAndSite,
    loading,
    networkError,
    setNetWorkError,
  } = useAuthStore();
  const [visibleMenu, setVisibleMenu] = React.useState(false);

  const openMenu = () => setVisibleMenu(!visibleMenu);

  const closeMenu = () => setVisibleMenu(false);

  return (
    <View style={styles.container}>
      <SafeAreaView>
        <View style={styles.appBarContainer}>
          <View style={styles.appBarLogoContainer}>
            <Image
              source={require("@/assets/images/appbar/yard_monitoring_logo_without_text.png")}
              style={styles.appBarLogo}
            />
          </View>

          <View style={styles.appBarTrailingContainer}>
            {user?.site && (
              <Chip
                icon="account-circle-outline"
                style={styles.appBarSitenameContainer}
              >
                <ThemedText type="default" style={styles.appBarSitename}>
                  {user?.site}
                </ThemedText>
              </Chip>
            )}
            <IconButton onPress={openMenu} icon={"menu"} />
            <Modal transparent visible={visibleMenu} animationType="fade">
              <Pressable style={styles.overlay} onPress={closeMenu}>
                <View style={styles.list}>
                  <List.Item
                    title={user?.role}
                    left={() => <FontAwesome name="user-o" size={20} />}
                  />
                  <List.Item
                    title={user?.site}
                    description={user?.location}
                    left={() => <Ionicons name="location-outline" size={20} />}
                  />
                  <Divider style={{ marginTop: 12 }} />
                  <View style={styles.menuButtons}>
                    <Button
                      mode="text"
                      icon="location-enter"
                      textColor={theme.colors.primary}
                      onPress={() => {
                        closeMenu();
                        changeLocationAndSite();
                      }}
                    >
                      Change Location
                    </Button>

                    <Button
                      icon="logout"
                      mode="contained"
                      buttonColor={theme.colors.primary}
                      style={styles.appBarMenuButton}
                      onPress={logout}
                    >
                      Logout
                    </Button>
                  </View>
                </View>
              </Pressable>
            </Modal>
          </View>
        </View>
       
        <Divider />
        {user?.location ? (
          loading ? (
            <ActivityIndicator
              size={"large"}
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                minHeight: "100%",
                marginTop: -50,
              }}
              animating={true}
              color={MD2Colors.blue700}
            />
          ) : (
            <View style={styles.mainContainer}>{children}</View>
          )
        ) : (
          <LocationChangeView />
        )}
      
      </SafeAreaView>
         <Snackbar
          visible={networkError}
          onDismiss={() => setNetWorkError(false)}
          action={{
            label: "Remove",
            onPress: () => setNetWorkError(false),
          }}
        >
          Please check your network connection & try again
        </Snackbar>
    </View>
  );
};

export default LayoutContainer;

const styles = StyleSheet.create({
  appBarMenuButton: {
    borderRadius: 8,
    width: 160,
    backgroundColor: "#004474ff",
  },
  appBarSitenameContainer: {
    backgroundColor: "#00447411",
  },
  appBarSitename: {
    color: "black",
    fontSize: 12,
    fontWeight: 200,
  },
  list: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    maxHeight: 260,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  appBarMenuItemContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingLeft: 12,
    gap: 8,
  },
  container: {
    flex: 1,
    padding: 12,
    backgroundColor: "white",
  },
  appBarContainer: {
    height: 56,
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    elevation: 6,
    borderRadius: 12,
  },
  menuButtons: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 24,
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
  },
  button: {
    fontSize: 22,
  },
  left: {
    width: 30,
  },
  right: {
    width: 30,
    alignItems: "flex-end",
  },
  appBarLogo: {
    height: 40,
    width: 40,
    resizeMode: "contain",
  },
  appBarLogoContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 10,
  },
  appBarTrailingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 24,
  },
  mainContainer: {
    marginTop: 24,
    paddingLeft: 12,
    marginLeft: 0,
    minHeight: "100%",
  },
});
