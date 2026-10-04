import React, { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { yardDashboardAction } from "@/services/api/yard/yardDashboard";
import LayoutContainer from "@/components/LayoutContainer";
import {
  ScrollView,
  StyleSheet,
  View,
  Text,
  RefreshControl,
} from "react-native";
import { ThemedText } from "@/components/themed-text";
import { Chip, useTheme } from "react-native-paper";
import { useYardDashboardStore } from "@/store/yardDashboardStore";
import Color from "color";
import BarChartComponent from "@/components/BarChartComponent";
import { useRouter } from "expo-router";
import Constants from "expo-constants";


export default function HomeScreen() {
  const { env } =
    (Constants.expoConfig?.extra as {
      apiUrl: string;
      env: string;
    }) ?? {};
  const { loading } = useAuthStore();
  const user = useAuthStore((state: any) => state.user);
  const theme = useTheme();
  const router = useRouter();
  const { yard_data, from_date, to_date, setFromAndToDate } =
    useYardDashboardStore();
  const [showSnackbaar, setShowSnackbaar] = useState(false);
  const [lolo_20_ft, setLOLO_20_ft] = useState(true);
  const [lolo_40_ft, setLOLO_40_ft] = useState(false);

  const onToggleSnackBar = () => setShowSnackbaar(!showSnackbaar);
  const onDismissSnackBar = () => setShowSnackbaar(false);

  useEffect(() => {
    if (user?.site && user?.location) {
      yardDashboardAction(
        user,
        [
          "yard_stock_main_data",
          "yard_mnr_stage_main_data",
          "yard_mnr_volume_revenue_data",
          "yard_in_lolo_volume_revenue_data",
        ],
        onToggleSnackBar
      );
    }
  }, [user?.site]);

  const handleRevenuenavigation = () => {
    router.navigate("/(tabs)/revenue");
  };

  const handleInventorynavigation = () => {
    router.navigate("/(tabs)/inventory");
  };

  const onRefresh = () => {
    if (user?.site && user?.location) {
      yardDashboardAction(
        user,
        [
          "yard_stock_main_data",
          "yard_mnr_stage_main_data",
          "yard_mnr_volume_revenue_data",
          "yard_in_lolo_volume_revenue_data",
        ],
        onToggleSnackBar
      );
    }
  };

  return (
    <LayoutContainer>
      <ThemedText type="default" style={{ color: "black", fontWeight: 600 }}>
        Analytics {env === "production" && "Dashboard"}
      </ThemedText>

      <View style={styles.filterContainer}>
        <Chip
          style={[
            styles.filterChips,
            {
              backgroundColor: lolo_20_ft
                ? Color(theme.colors.primary).alpha(1).rgb().string()
                : "white",
            },
          ]}
          mode="outlined"
          onPress={() => {
            setLOLO_40_ft(false);
            setLOLO_20_ft(true);
          }}
          selectedColor={lolo_20_ft ? "white" : theme.colors.primary}
          theme={theme}
          selected={lolo_20_ft}
        >
          20ft
        </Chip>
        <Chip
          style={[
            styles.filterChips,
            {
              backgroundColor: lolo_40_ft
                ? Color(theme.colors.primary).alpha(1).rgb().string()
                : "white",
            },
          ]}
          mode="outlined"
          onPress={() => {
            setLOLO_40_ft(true);
            setLOLO_20_ft(false);
          }}
          theme={theme}
          selectedColor={lolo_40_ft ? "white" : theme.colors.primary}
          selected={lolo_40_ft}
        >
          40ft
        </Chip>
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            color: theme.colors.backdrop,
            textAlign: "right",
            marginTop: 12,
            fontSize: 12,
          }}
        >{`${from_date} - ${to_date}`}</Text>
        <ScrollView
          contentContainerStyle={{ paddingBottom: 200 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={onRefresh}
              colors={["#9Bd35A", "#689F38"]} // Example colors for Android
              progressBackgroundColor="#ffffff" // Example for Android
            />
          }
        >
          {lolo_20_ft && (
            <BarChartComponent
              containerType="20ft"
              data={yard_data?.yard_stock_main_data?.["20_total_data"]}
              seeMore={handleInventorynavigation}
              title="Inventory"
            />
          )}
          {lolo_40_ft && (
            <BarChartComponent
              containerType="40ft"
              data={yard_data?.yard_stock_main_data?.["40_total_data"]}
              seeMore={handleInventorynavigation}
              title="Inventory"
            />
          )}

          {lolo_20_ft && (
            <BarChartComponent
              containerType="20ft"
              data={yard_data?.yard_mnr_stage_main_data?.["20_total_data"]}
              seeMore={handleRevenuenavigation}
              title="MNR"
              barWidth={40}
            />
          )}
          {lolo_40_ft && (
            <BarChartComponent
              containerType="40ft"
              data={yard_data?.yard_mnr_stage_main_data?.["40_total_data"]}
              seeMore={handleRevenuenavigation}
              title="MNR"
              barWidth={40}
            />
          )}
        </ScrollView>
      </View>
    </LayoutContainer>
  );
}

const styles = StyleSheet.create({
  apply: {
    backgroundColor: "#000",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  row: {
    flexDirection: "row",
    gap: 10,
    marginVertical: 12,
  },
  dateBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
  },
  filterChips: {
    borderRadius: 50,
  },
  filterContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },
});
