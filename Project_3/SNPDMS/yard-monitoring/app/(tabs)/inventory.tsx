import {
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Image } from "expo-image";
import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";
import { Fonts } from "@/constants/theme";
import { Card, Chip, DataTable, useTheme } from "react-native-paper";
import Color from "color";
import BarChartComponent from "@/components/BarChartComponent";
import { useAuthStore } from "@/store/authStore";
import { inventoryListingAction } from "@/services/api/yard/InventoryAction";
import LayoutContainer from "@/components/LayoutContainer";
import { useInventoryStore } from "@/store/inventoryStore";


const inventory = () => {
  const { user } = useAuthStore();
  const {
    inventory_data,
    loading_inventory,
    inventory_main_data,
    from_date,
    to_date,
    setFromAndToDateInventory,
  } = useInventoryStore();
  const theme = useTheme();
  const [lolo_20_ft, setLOLO_20_ft] = useState(true);
  const [showSnackbaar, setShowSnackbaar] = useState(false);
  const [lolo_40_ft, setLOLO_40_ft] = useState(false);
  const [mnrStageData, setMnrStageData] = useState(false);

  const data_20_ft = inventory_data?.["20_total_data"];
  const data_40_ft = inventory_data?.["40_total_data"];
  const data_mnr_20_ft = inventory_main_data?.["20_total_data"];
  const data_mnr_40_ft = inventory_main_data?.["40_total_data"];

  const onToggleSnackBar = () => setShowSnackbaar(!showSnackbaar);
  const onDismissSnackBar = () => setShowSnackbaar(false);


  useEffect(() => {
    if (user?.site && user?.location) {
      inventoryListingAction(
        ["yard_stock_main_data", "yard_mnr_stage_main_data"],
        onToggleSnackBar
      );
    }
  }, [user?.site]);

  const onRefresh = (disableDateChange: boolean) => {
    if (!disableDateChange) {
      setFromAndToDateInventory("", "");
    }
    if (user?.site && user?.location) {
      inventoryListingAction(
        ["yard_stock_main_data", "yard_mnr_stage_main_data"],
        onToggleSnackBar
      );
    }
  };



  return (
    <LayoutContainer>
      <Image
        style={styles.headerImage}
        source={require("@/assets/images/onboarding/stock_image.png")}
      />

      <ThemedView style={styles.titleContainer}>
        <ThemedText
          type="title"
          style={{
            fontFamily: Fonts.rounded,
            color: "black",
          }}
        >
          Stock
        </ThemedText>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContainer}
        >
     
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
            LOLO 20ft
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
            LOLO 40ft
          </Chip>
          <Chip
            style={[
              styles.filterChips,
              {
                backgroundColor: mnrStageData
                  ? Color(theme.colors.primary).alpha(1).rgb().string()
                  : "white",
              },
            ]}
            mode="outlined"
            onPress={() => setMnrStageData(!mnrStageData)}
            theme={theme}
            selectedColor={mnrStageData ? "white" : theme.colors.primary}
            selected={mnrStageData}
          >
            MNR
          </Chip>
        </ScrollView>
        <Text
          style={{
            color: theme.colors.backdrop,
            textAlign: "right",
            marginTop: 12,
            fontSize: 12,
          }}
        >{`${from_date} - ${to_date}`}</Text>
      </ThemedView>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 220 }}
        refreshControl={
          <RefreshControl
            refreshing={loading_inventory}
            onRefresh={() => onRefresh(false)}
            colors={["#9Bd35A", "#689F38"]} // Example colors for Android
            progressBackgroundColor="#ffffff" // Example for Android
          />
        }
      >
        <ThemedView style={{ backgroundColor: "white" }}>
          {lolo_20_ft &&
            (mnrStageData ? (
              <BarChartComponent
                containerType="20ft"
                data={data_mnr_20_ft}
                disableButton={true}
                barWidth={40}
                title="Inventory MNR Stage"
              />
            ) : (
              <BarChartComponent
                containerType="20ft"
                data={inventory_data?.["20_total_data"]}
                disableButton={true}
                title="Inventory"
              />
            ))}
          {lolo_40_ft &&
            (mnrStageData ? (
              <BarChartComponent
                containerType="40ft"
                data={data_mnr_40_ft}
                disableButton={true}
                barWidth={40}
                title="Inventory MNR Stage"
              />
            ) : (
              <BarChartComponent
                containerType="40ft"
                data={inventory_data?.["40_total_data"]}
                disableButton={true}
                title="Inventory"
              />
            ))}
        </ThemedView>
        {mnrStageData ? (
          <Card
            style={{ marginTop: 24, backgroundColor: "white", marginLeft: -10 }}
            elevation={0}
          >
            <Card.Title
              title={
                <Text
                  style={{ fontSize: 18, fontWeight: 500, letterSpacing: 0.5 }}
                >
                  Inventory MNR Stage Table
                </Text>
              }
            />
            <Card.Content>
              <DataTable style={styles.dataTable}>
                <DataTable.Header>
                  <DataTable.Title>
                    {" "}
                    <Text
                      style={{
                        fontWeight: "700",
                        fontSize: 14,
                        color: "black",
                      }}
                    >
                      Type
                    </Text>
                  </DataTable.Title>
                  <DataTable.Title numeric>
                    {" "}
                    <Text
                      style={{
                        fontWeight: "700",
                        fontSize: 14,
                        color: "black",
                      }}
                    >
                      20ft
                    </Text>
                  </DataTable.Title>
                  <DataTable.Title numeric>
                    {" "}
                    <Text
                      style={{
                        fontWeight: "700",
                        fontSize: 14,
                        color: "black",
                      }}
                    >
                      40ft
                    </Text>
                  </DataTable.Title>
                </DataTable.Header>

                <DataTable.Row>
                  <DataTable.Cell>Survey</DataTable.Cell>
                  <DataTable.Cell numeric>
                    {
                      data_mnr_20_ft?.find((val: any) => val.name === "Survey")
                        ?.value
                    }
                  </DataTable.Cell>
                  <DataTable.Cell numeric>
                    {
                      data_mnr_40_ft?.find((val: any) => val.name === "Survey")
                        ?.value
                    }
                  </DataTable.Cell>
                </DataTable.Row>
                <DataTable.Row>
                  <DataTable.Cell>Estimate</DataTable.Cell>
                  <DataTable.Cell numeric>
                    {
                      data_mnr_20_ft?.find(
                        (val: any) => val.name === "Estimate"
                      )?.value
                    }
                  </DataTable.Cell>
                  <DataTable.Cell numeric>
                    {
                      data_mnr_40_ft?.find(
                        (val: any) => val.name === "Estimate"
                      )?.value
                    }
                  </DataTable.Cell>
                </DataTable.Row>
                <DataTable.Row>
                  <DataTable.Cell>Approval</DataTable.Cell>
                  <DataTable.Cell numeric>
                    {
                      data_mnr_20_ft?.find(
                        (val: any) => val.name === "Approval"
                      )?.value
                    }
                  </DataTable.Cell>
                  <DataTable.Cell numeric>
                    {
                      data_mnr_40_ft?.find(
                        (val: any) => val.name === "Approval"
                      )?.value
                    }
                  </DataTable.Cell>
                </DataTable.Row>
                <DataTable.Row>
                  <DataTable.Cell>Repair</DataTable.Cell>
                  <DataTable.Cell numeric>
                    {
                      data_mnr_20_ft?.find((val: any) => val.name === "Repair")
                        ?.value
                    }
                  </DataTable.Cell>
                  <DataTable.Cell numeric>
                    {
                      data_mnr_40_ft?.find((val: any) => val.name === "Repair")
                        ?.value
                    }
                  </DataTable.Cell>
                </DataTable.Row>
                <DataTable.Row>
                  <DataTable.Cell>Available</DataTable.Cell>
                  <DataTable.Cell numeric>
                    {
                      data_mnr_20_ft?.find(
                        (val: any) => val.name === "Available"
                      )?.value
                    }
                  </DataTable.Cell>
                  <DataTable.Cell numeric>
                    {
                      data_mnr_40_ft?.find(
                        (val: any) => val.name === "Available"
                      )?.value
                    }
                  </DataTable.Cell>
                </DataTable.Row>
              </DataTable>
            </Card.Content>
          </Card>
        ) : (
          <Card
            style={{ marginTop: 60, backgroundColor: "white" }}
            elevation={0}
          >
            <Card.Title
              title={
                <Text
                  style={{ fontSize: 18, fontWeight: 500, letterSpacing: 0.5 }}
                >
                  Inventory Table
                </Text>
              }
            />
            <Card.Content>
              <DataTable style={styles.dataTable}>
                <DataTable.Header>
                  <DataTable.Title>
                    {" "}
                    <Text
                      style={{
                        fontWeight: "700",
                        fontSize: 14,
                        color: "black",
                      }}
                    >
                      Type
                    </Text>
                  </DataTable.Title>
                  <DataTable.Title numeric>
                    {" "}
                    <Text
                      style={{
                        fontWeight: "700",
                        fontSize: 14,
                        color: "black",
                      }}
                    >
                      20ft
                    </Text>
                  </DataTable.Title>
                  <DataTable.Title numeric>
                    {" "}
                    <Text
                      style={{
                        fontWeight: "700",
                        fontSize: 14,
                        color: "black",
                      }}
                    >
                      40ft
                    </Text>
                  </DataTable.Title>
                </DataTable.Header>

                <DataTable.Row>
                  <DataTable.Cell>Survey Pending</DataTable.Cell>
                  <DataTable.Cell numeric>
                    {
                      data_20_ft?.find(
                        (val: any) => val.name === "Survey Pending"
                      )?.value
                    }
                  </DataTable.Cell>
                  <DataTable.Cell numeric>
                    {
                      data_40_ft?.find(
                        (val: any) => val.name === "Survey Pending"
                      )?.value
                    }
                  </DataTable.Cell>
                </DataTable.Row>
                <DataTable.Row>
                  <DataTable.Cell>Estimate Pending</DataTable.Cell>
                  <DataTable.Cell numeric>
                    {
                      data_20_ft?.find(
                        (val: any) => val.name === "Estimate Pending"
                      )?.value
                    }
                  </DataTable.Cell>
                  <DataTable.Cell numeric>
                    {
                      data_40_ft?.find(
                        (val: any) => val.name === "Estimate Pending"
                      )?.value
                    }
                  </DataTable.Cell>
                </DataTable.Row>
                <DataTable.Row>
                  <DataTable.Cell>Approval Pending</DataTable.Cell>
                  <DataTable.Cell numeric>
                    {
                      data_20_ft?.find(
                        (val: any) => val.name === "Approval Pending"
                      )?.value
                    }
                  </DataTable.Cell>
                  <DataTable.Cell numeric>
                    {
                      data_40_ft?.find(
                        (val: any) => val.name === "Approval Pending"
                      )?.value
                    }
                  </DataTable.Cell>
                </DataTable.Row>
                <DataTable.Row>
                  <DataTable.Cell>Under Repairing</DataTable.Cell>
                  <DataTable.Cell numeric>
                    {
                      data_20_ft?.find(
                        (val: any) => val.name === "Under Repairing"
                      )?.value
                    }
                  </DataTable.Cell>
                  <DataTable.Cell numeric>
                    {
                      data_40_ft?.find(
                        (val: any) => val.name === "Under Repairing"
                      )?.value
                    }
                  </DataTable.Cell>
                </DataTable.Row>
                <DataTable.Row>
                  <DataTable.Cell>Available</DataTable.Cell>
                  <DataTable.Cell numeric>
                    {
                      data_20_ft?.find((val: any) => val.name === "Available")
                        ?.value
                    }
                  </DataTable.Cell>
                  <DataTable.Cell numeric>
                    {
                      data_40_ft?.find((val: any) => val.name === "Available")
                        ?.value
                    }
                  </DataTable.Cell>
                </DataTable.Row>
                <DataTable.Row>
                  <DataTable.Cell>Alloted</DataTable.Cell>
                  <DataTable.Cell numeric>
                    {
                      data_20_ft?.find((val: any) => val.name === "Alloted")
                        ?.value
                    }
                  </DataTable.Cell>
                  <DataTable.Cell numeric>
                    {
                      data_40_ft?.find((val: any) => val.name === "Alloted")
                        ?.value
                    }
                  </DataTable.Cell>
                </DataTable.Row>
              </DataTable>
            </Card.Content>
          </Card>
        )}
      </ScrollView>
    </LayoutContainer>
  );
};

export default inventory;

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
  dataTable: {
    marginTop: 24,
    marginLeft: -14,
  },
  headerImage: {
    width: 160,
    height: 140,
    objectFit: "contain",
    margin: "auto",
  },
  titleContainer: {
    flexDirection: "column",
    gap: 4,
    backgroundColor: "white",
  },
  filterContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
    paddingRight: 24,
  },
  filterChips: {
    borderRadius: 50,
  },
});
