import React, { useEffect, useState } from "react";
import { Image } from "expo-image";
import {
  StyleSheet,
  View,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Platform,
} from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Fonts } from "@/constants/theme";
import LayoutContainer from "@/components/LayoutContainer";
import { useAuthStore } from "@/store/authStore";
import {
  Card,
  Chip,
  DataTable,
  Divider,
  Text,
  useTheme,
} from "react-native-paper";
import { revenueListingAction } from "@/services/api/yard/revenueAction";
import { useRevenueStore } from "@/store/revenueStore";
import Color from "color";
import { BarChart } from "react-native-gifted-charts";
import ModalWrapperComponent from "@/components/ModalWrapperComponent";
import DateTimePicker from "@react-native-community/datetimepicker";
import { handleDateFormatChangeUtil } from "@/utils/dateFormater";

export default function TabTwoScreen() {
  const { user } = useAuthStore();
  const theme = useTheme();
  const {
    revenue_data,
    loading_revenue,
    setFromAndToDateRevenue,
    from_date,
    to_date,
  } = useRevenueStore();
  const [showSnackbaar, setShowSnackbaar] = useState(false);
  const [loloIN, setLoloIn] = useState(true);
  const [loloOut, setLoloOut] = useState(false);
  const [showVolumeMNR, setShowVolumeMNR] = useState(false);
  const [visibleMenu, setVisibleMenu] = React.useState(false);
  const [showPicker, setShowPicker] = useState<null | string>(null);
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());

  const onToggleSnackBar = () => setShowSnackbaar(!showSnackbaar);
  const onDismissSnackBar = () => setShowSnackbaar(false);
  const data_IN = revenue_data?.["yard_in_lolo_volume_revenue_data"];
  const data_OUT = revenue_data?.["yard_out_lolo_volume_revenue_data"];
  const data_MNR_Volume = revenue_data?.["yard_mnr_volume_revenue_data"];

  const openMenu = () => setVisibleMenu(!visibleMenu);

  const closeMenu = () => {
    setShowPicker(null);
    setVisibleMenu(false);
  };

  useEffect(() => {
    if (user?.site && user?.location) {
      revenueListingAction(
        [
          "yard_in_lolo_volume_revenue_data",
          "yard_out_lolo_volume_revenue_data",
          "yard_mnr_volume_revenue_data",
        ],
        onToggleSnackBar
      );
    }
  }, [user?.site, user?.location]);

  const onRefresh = (disableDateChange: boolean) => {
    if (!disableDateChange) {
      setFromAndToDateRevenue("", "");
    }
    if (user?.site && user?.location) {
      revenueListingAction(
        [
          "yard_in_lolo_volume_revenue_data",
          "yard_out_lolo_volume_revenue_data",
          "yard_mnr_volume_revenue_data",
        ],
        onToggleSnackBar
      );
    }
  };

  const renderTitle = () => {
    return (
      <View style={{ marginBottom: 12 }}>
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            justifyContent: "space-evenly",
            marginTop: 24,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View
              style={{
                height: 12,
                width: 12,
                borderRadius: 6,
                backgroundColor: "#177AD5",
                marginRight: 4,
              }}
            />
            <Text
              style={{
                color: "lightgray",
              }}
            >
              Volume
            </Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View
              style={{
                height: 12,
                width: 12,
                borderRadius: 6,
                backgroundColor: "#ED6665",
                marginRight: 8,
              }}
            />
            <Text
              style={{
                color: "lightgray",
              }}
            >
              Revenue
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const onDateChange = (event: any, date: any) => {
    setShowPicker(null);
    if (!date) return;

    if (showPicker === "from") setFromDate(date);
    if (showPicker === "to") setToDate(date);
  };

  return (
    <LayoutContainer>
      <Image
        style={styles.headerImage}
        source={require("@/assets/images/onboarding/track_image.png")}
      />
      <ThemedView style={styles.titleContainer}>
        <ThemedText
          type="title"
          style={{
            fontFamily: Fonts.rounded,
            color: "black",
          }}
        >
          Revenue
        </ThemedText>
        <ModalWrapperComponent visibleMenu={visibleMenu} closeMenu={closeMenu}>
          <View style={styles.row}>
            <TouchableOpacity
              style={styles.dateBtn}
              onPress={() => setShowPicker("from")}
            >
              <Text>From: {fromDate.toDateString()}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dateBtn}
              onPress={() => setShowPicker("to")}
            >
              <Text>To: {toDate.toDateString()}</Text>
            </TouchableOpacity>
          </View>
          {showPicker && (
            <DateTimePicker
              value={fromDate}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={onDateChange}
            />
          )}
          <TouchableOpacity
            style={styles.apply}
            onPress={() => {
              setFromAndToDateRevenue(
                handleDateFormatChangeUtil(fromDate),
                handleDateFormatChangeUtil(toDate)
              );
              onRefresh(true);
              closeMenu();
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "bold" }}>
              Apply Filters
            </Text>
          </TouchableOpacity>
        </ModalWrapperComponent>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContainer}
        >
          <Chip
            style={[
              styles.filterChips,
              {
                backgroundColor: "white",
              },
            ]}
            icon={"timetable"}
            mode="outlined"
            onPress={openMenu}
          >
            Filter
          </Chip>
          <Chip
            style={[
              styles.filterChips,
              {
                backgroundColor: loloIN
                  ? Color(theme.colors.primary).alpha(1).rgb().string()
                  : "white",
              },
            ]}
            mode="outlined"
            onPress={() => {
              setLoloOut(false);
              setLoloIn(true);
              setShowVolumeMNR(false);
            }}
            selectedColor={loloIN ? "white" : theme.colors.primary}
            theme={theme}
            selected={loloIN}
          >
            LOLO IN
          </Chip>
          <Chip
            style={[
              styles.filterChips,
              {
                backgroundColor: loloOut
                  ? Color(theme.colors.primary).alpha(1).rgb().string()
                  : "white",
              },
            ]}
            mode="outlined"
            onPress={() => {
              setLoloOut(true);
              setLoloIn(false);
              setShowVolumeMNR(false);
            }}
            theme={theme}
            selectedColor={loloOut ? "white" : theme.colors.primary}
            selected={loloOut}
          >
            LOLO OUT
          </Chip>
          <Chip
            style={[
              styles.filterChips,
              {
                backgroundColor: showVolumeMNR
                  ? Color(theme.colors.primary).alpha(1).rgb().string()
                  : "white",
              },
            ]}
            mode="outlined"
            onPress={() => {
              setLoloIn(false);
              setLoloOut(false);
              setShowVolumeMNR(!showVolumeMNR);
            }}
            theme={theme}
            selectedColor={showVolumeMNR ? "white" : theme.colors.primary}
            selected={showVolumeMNR}
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
            refreshing={loading_revenue}
            onRefresh={() => onRefresh(false)}
            colors={["#9Bd35A", "#689F38"]} // Example colors for Android
            progressBackgroundColor="#ffffff" // Example for Android
          />
        }
      >
        <ThemedView style={{ backgroundColor: "white" }}>
          {!showVolumeMNR && renderTitle()}
          {loloIN && data_IN && (
            <BarChart
              barWidth={50}
              noOfSections={5}
              barBorderRadius={4}
              frontColor="lightgray"
              spacing={50}
              yAxisExtraHeight={20}
              xAxisLabelsHeight={20}
              yAxisLabelWidth={60}
              data={[
                {
                  value: Number(
                    data_IN?.data?.find((val: any) => val.name === "20_data")
                      ?.volume
                  ),
                  label: "20ft",
                  spacing: 2,
                  labelWidth: 100,
                  topLabelComponent: () => (
                    <Text
                      style={{
                        color: "blue",
                        fontSize: 12,
                        marginBottom: 6,
                        width: 60,
                      }}
                    >
                      {Number(
                        data_IN?.data?.find(
                          (val: any) => val.name === "20_data"
                        )?.volume
                      )}
                    </Text>
                  ),
                  labelTextStyle: { color: "gray" },
                  frontColor: "#177AD5",
                },
                {
                  value: Number(
                    data_IN?.data?.find((val: any) => val.name === "20_data")
                      ?.revenue
                  ),
                  frontColor: "#ED6665",
                  topLabelComponent: () => (
                    <Text
                      style={{
                        color: "#ED6665",
                        fontSize: 12,
                        marginBottom: 6,
                        width: 60,
                      }}
                    >
                      {Number(
                        data_IN?.data?.find(
                          (val: any) => val.name === "20_data"
                        )?.revenue
                      )}
                    </Text>
                  ),
                },
                {
                  value: Number(
                    data_IN?.data?.find((val: any) => val.name === "40_data")
                      ?.volume
                  ),
                  label: "40ft",
                  spacing: 2,
                  labelWidth: 100,
                  labelTextStyle: { color: "gray" },
                  frontColor: "#177AD5",
                  topLabelComponent: () => (
                    <Text
                      style={{
                        color: "blue",
                        fontSize: 12,
                        marginBottom: 6,
                        width: 60,
                      }}
                    >
                      {Number(
                        data_IN?.data?.find(
                          (val: any) => val.name === "40_data"
                        )?.volume
                      )}
                    </Text>
                  ),
                },
                {
                  value: Number(
                    data_IN?.data?.find((val: any) => val.name === "40_data")
                      ?.revenue
                  ),
                  frontColor: "#ED6665",
                  topLabelComponent: () => (
                    <Text
                      style={{
                        color: "#ED6665",
                        fontSize: 12,
                        marginBottom: 6,
                        width: 60,
                      }}
                    >
                      {Number(
                        data_IN?.data?.find(
                          (val: any) => val.name === "40_data"
                        )?.revenue
                      )}
                    </Text>
                  ),
                },
              ]}
              yAxisThickness={0}
              xAxisThickness={0}
            />
          )}
          {loloOut && data_OUT && (
            <BarChart
              barWidth={50}
              noOfSections={5}
              barBorderRadius={4}
              frontColor="lightgray"
              spacing={50}
              yAxisExtraHeight={20}
              xAxisLabelsHeight={20}
              yAxisLabelWidth={60}
              data={[
                {
                  value: Number(
                    data_OUT?.data?.find((val: any) => val.name === "20_data")
                      ?.volume
                  ),
                  label: "20ft",
                  spacing: 2,
                  labelWidth: 100,
                  labelTextStyle: { color: "gray" },
                  frontColor: "#177AD5",
                  topLabelComponent: () => (
                    <Text
                      style={{
                        color: "blue",
                        fontSize: 12,
                        marginBottom: 6,
                        width: 60,
                      }}
                    >
                      {Number(
                        data_OUT?.data?.find(
                          (val: any) => val.name === "20_data"
                        )?.volume
                      )}
                    </Text>
                  ),
                },
                {
                  value: Number(
                    data_OUT?.data?.find((val: any) => val.name === "20_data")
                      ?.revenue
                  ),
                  frontColor: "#ED6665",
                  topLabelComponent: () => (
                    <Text
                      style={{
                        color: "#ED6665",
                        fontSize: 12,
                        marginBottom: 6,
                        width: 60,
                      }}
                    >
                      {Number(
                        data_OUT?.data?.find(
                          (val: any) => val.name === "20_data"
                        )?.revenue
                      )}
                    </Text>
                  ),
                },
                {
                  value: Number(
                    data_OUT?.data?.find((val: any) => val.name === "40_data")
                      ?.volume
                  ),
                  label: "40ft",
                  spacing: 2,
                  labelWidth: 100,
                  labelTextStyle: { color: "gray" },
                  frontColor: "#177AD5",
                  topLabelComponent: () => (
                    <Text
                      style={{
                        color: "blue",
                        fontSize: 12,
                        marginBottom: 6,
                        width: 60,
                      }}
                    >
                      {Number(
                        data_OUT?.data?.find(
                          (val: any) => val.name === "40_data"
                        )?.volume
                      )}
                    </Text>
                  ),
                },
                {
                  value: Number(
                    data_OUT?.data?.find((val: any) => val.name === "40_data")
                      ?.revenue
                  ),
                  frontColor: "#ED6665",
                  topLabelComponent: () => (
                    <Text
                      style={{
                        color: "#ED6665",
                        fontSize: 12,
                        marginBottom: 6,
                        width: 60,
                      }}
                    >
                      {Number(
                        data_OUT?.data?.find(
                          (val: any) => val.name === "40_data"
                        )?.revenue
                      )}
                    </Text>
                  ),
                },
              ]}
              yAxisThickness={0}
              xAxisThickness={0}
            />
          )}
          {showVolumeMNR && data_MNR_Volume && (
            <Text style={{ textAlign: "center" }}>20ft</Text>
          )}
          {showVolumeMNR && data_MNR_Volume && (
            <BarChart
              barWidth={50}
              noOfSections={5}
              barBorderRadius={4}
              frontColor="lightgray"
              spacing={20}
              yAxisExtraHeight={20}
              xAxisLabelsHeight={20}
              yAxisLabelWidth={60}
              data={[
                {
                  value: Number(
                    data_MNR_Volume?.data?.find(
                      (val: any) => val.name === "size_20"
                    )?.volume
                  ),
                  label: "Volume",
                  spacing: 20,

                  labelTextStyle: { color: "gray" },
                  frontColor: "#177AD5",

                  topLabelComponent: () => (
                    <Text
                      style={{
                        color: "blue",
                        fontSize: 12,
                        marginBottom: 6,
                        width: 60,
                      }}
                    >
                      {Number(
                        data_MNR_Volume?.data?.find(
                          (val: any) => val.name === "size_20"
                        )?.volume
                      )}
                    </Text>
                  ),
                },
                {
                  value: Number(
                    data_MNR_Volume?.data?.find(
                      (val: any) => val.name === "size_20"
                    )?.revenue_damage
                  ),
                  label: "Revenue damage",
                  spacing: 60,
                  labelWidth: 100,
                  barWidth: 60,
                  labelTextStyle: { color: "gray" },
                  frontColor: "#ED6665",
                  topLabelComponent: () => (
                    <Text
                      style={{
                        color: "#ED6665",
                        fontSize: 12,
                        marginBottom: 6,
                        width: 60,
                      }}
                    >
                      {Number(
                        data_MNR_Volume?.data?.find(
                          (val: any) => val.name === "size_20"
                        )?.revenue_damage
                      )}
                    </Text>
                  ),
                },
                {
                  value: Number(
                    data_MNR_Volume?.data?.find(
                      (val: any) => val.name === "size_20"
                    )?.revenue_cleaning
                  ),
                  label: "Revenue cleaning",
                  spacing: 60,
                  labelWidth: 100,
                  barWidth: 60,

                  labelTextStyle: { color: "gray" },
                  frontColor: "#6BCB77",
                  topLabelComponent: () => (
                    <Text
                      style={{
                        color: "#6BCB77",
                        fontSize: 12,
                        marginBottom: 6,
                        width: 60,
                      }}
                    >
                      {Number(
                        data_MNR_Volume?.data?.find(
                          (val: any) => val.name === "size_20"
                        )?.revenue_cleaning
                      )}
                    </Text>
                  ),
                },
              ]}
              yAxisThickness={0}
              xAxisThickness={0}
            />
          )}
          {showVolumeMNR && data_MNR_Volume && (
            <Text style={{ marginTop: 24, textAlign: "center" }}>40ft</Text>
          )}
          {showVolumeMNR && data_MNR_Volume && (
            <BarChart
              barWidth={50}
              noOfSections={5}
              barBorderRadius={4}
              frontColor="lightgray"
              spacing={20}
              yAxisExtraHeight={20}
              xAxisLabelsHeight={20}
              yAxisLabelWidth={60}
              data={[
                {
                  value: Number(
                    data_MNR_Volume?.data?.find(
                      (val: any) => val.name === "size_40"
                    )?.volume
                  ),
                  label: "Volume",
                  spacing: 20,

                  labelTextStyle: { color: "gray" },
                  frontColor: "#177AD5",

                  topLabelComponent: () => (
                    <Text
                      style={{
                        color: "blue",
                        fontSize: 12,
                        marginBottom: 6,
                        width: 60,
                      }}
                    >
                      {Number(
                        data_MNR_Volume?.data?.find(
                          (val: any) => val.name === "size_40"
                        )?.volume
                      )}
                    </Text>
                  ),
                },
                {
                  value: Number(
                    data_MNR_Volume?.data?.find(
                      (val: any) => val.name === "size_40"
                    )?.revenue_damage
                  ),
                  label: "Revenue damage",
                  spacing: 60,
                  labelWidth: 100,
                  barWidth: 60,
                  labelTextStyle: { color: "gray" },
                  frontColor: "#ED6665",
                  topLabelComponent: () => (
                    <Text
                      style={{
                        color: "#ED6665",
                        fontSize: 12,
                        marginBottom: 6,
                        width: 60,
                      }}
                    >
                      {Number(
                        data_MNR_Volume?.data?.find(
                          (val: any) => val.name === "size_40"
                        )?.revenue_damage
                      )}
                    </Text>
                  ),
                },
                {
                  value: Number(
                    data_MNR_Volume?.data?.find(
                      (val: any) => val.name === "size_40"
                    )?.revenue_cleaning
                  ),
                  label: "Revenue cleaning",
                  spacing: 60,
                  labelWidth: 100,
                  barWidth: 60,

                  labelTextStyle: { color: "gray" },
                  frontColor: "#6BCB77",
                  topLabelComponent: () => (
                    <Text
                      style={{
                        color: "#6BCB77",
                        fontSize: 12,
                        marginBottom: 6,
                        width: 60,
                      }}
                    >
                      {Number(
                        data_MNR_Volume?.data?.find(
                          (val: any) => val.name === "size_40"
                        )?.revenue_cleaning
                      )}
                    </Text>
                  ),
                },
              ]}
              yAxisThickness={0}
              xAxisThickness={0}
            />
          )}
        </ThemedView>
        {showVolumeMNR ? (
          <Card
            style={{ marginTop: 60, backgroundColor: "white", marginLeft: -10 }}
            elevation={0}
          >
            <Card.Title
              title={
                <Text
                  style={{ fontSize: 18, fontWeight: 500, letterSpacing: 0.5 }}
                >
                  MNR Volume Table
                </Text>
              }
            />
            <Card.Content>
              <DataTable style={styles.dataTable}>
                <DataTable.Header>
                  <DataTable.Title>
                    <Text style={{ fontWeight: "700", fontSize: 14 }}>
                      Type
                    </Text>
                  </DataTable.Title>
                  <DataTable.Title numeric>
                    {" "}
                    <Text style={{ fontWeight: "700", fontSize: 14 }}>
                      20ft
                    </Text>{" "}
                  </DataTable.Title>
                  <DataTable.Title numeric>
                    {" "}
                    <Text style={{ fontWeight: "700", fontSize: 14 }}>
                      40ft
                    </Text>
                  </DataTable.Title>
                </DataTable.Header>

                <DataTable.Row>
                  <DataTable.Cell>Volume</DataTable.Cell>
                  <DataTable.Cell numeric>
                    {
                      data_MNR_Volume?.data?.find(
                        (val: any) => val.name === "size_20"
                      )?.volume
                    }
                  </DataTable.Cell>
                  <DataTable.Cell numeric>
                    {
                      data_MNR_Volume?.data?.find(
                        (val: any) => val.name === "size_40"
                      )?.volume
                    }
                  </DataTable.Cell>
                </DataTable.Row>
                <DataTable.Row>
                  <DataTable.Cell>Cleaning Revenue</DataTable.Cell>
                  <DataTable.Cell numeric>
                    {
                      data_MNR_Volume?.data?.find(
                        (val: any) => val.name === "size_20"
                      )?.revenue_cleaning
                    }
                  </DataTable.Cell>
                  <DataTable.Cell numeric>
                    {
                      data_MNR_Volume?.data?.find(
                        (val: any) => val.name === "size_40"
                      )?.revenue_cleaning
                    }
                  </DataTable.Cell>
                </DataTable.Row>
                <DataTable.Row>
                  <DataTable.Cell>Damage Revenue</DataTable.Cell>
                  <DataTable.Cell numeric>
                    {
                      data_MNR_Volume?.data?.find(
                        (val: any) => val.name === "size_20"
                      )?.revenue_damage
                    }
                  </DataTable.Cell>
                  <DataTable.Cell numeric>
                    {
                      data_MNR_Volume?.data?.find(
                        (val: any) => val.name === "size_40"
                      )?.revenue_damage
                    }
                  </DataTable.Cell>
                </DataTable.Row>
              </DataTable>
            </Card.Content>
          </Card>
        ) : (
          <Card
            style={{ marginTop: 60, backgroundColor: "white", marginLeft: -10 }}
            elevation={0}
          >
            <Card.Title
              title={
                <Text
                  style={{ fontSize: 18, fontWeight: 500, letterSpacing: 0.5 }}
                >
                  Revenue Table
                </Text>
              }
            />
            <Card.Content>
              <DataTable style={styles.dataTable}>
                <DataTable.Header>
                  <DataTable.Title>
                    {" "}
                    <Text style={{ fontWeight: "700", fontSize: 14 }}>
                      Type
                    </Text>
                  </DataTable.Title>
                  <DataTable.Title numeric>
                    {" "}
                    <Text style={{ fontWeight: "700", fontSize: 14 }}>
                      LOLO IN
                    </Text>{" "}
                  </DataTable.Title>
                  <DataTable.Title numeric>
                    {" "}
                    <Text style={{ fontWeight: "700", fontSize: 14 }}>
                      LOLO OUT
                    </Text>
                  </DataTable.Title>
                </DataTable.Header>

                <DataTable.Row>
                  <DataTable.Cell>20ft Volume</DataTable.Cell>
                  <DataTable.Cell numeric>
                    {
                      data_IN?.data?.find((val: any) => val.name === "20_data")
                        ?.volume
                    }
                  </DataTable.Cell>
                  <DataTable.Cell numeric>
                    {
                      data_OUT?.data?.find((val: any) => val.name === "20_data")
                        ?.volume
                    }
                  </DataTable.Cell>
                </DataTable.Row>
                <DataTable.Row>
                  <DataTable.Cell>20ft Revenue</DataTable.Cell>
                  <DataTable.Cell numeric>
                    {
                      data_IN?.data?.find((val: any) => val.name === "20_data")
                        ?.revenue
                    }
                  </DataTable.Cell>
                  <DataTable.Cell numeric>
                    {
                      data_OUT?.data?.find((val: any) => val.name === "20_data")
                        ?.revenue
                    }
                  </DataTable.Cell>
                </DataTable.Row>
                <DataTable.Row>
                  <DataTable.Cell>40ft Volume</DataTable.Cell>
                  <DataTable.Cell numeric>
                    {
                      data_IN?.data?.find((val: any) => val.name === "40_data")
                        ?.volume
                    }
                  </DataTable.Cell>
                  <DataTable.Cell numeric>
                    {
                      data_OUT?.data?.find((val: any) => val.name === "40_data")
                        ?.volume
                    }
                  </DataTable.Cell>
                </DataTable.Row>
                <DataTable.Row>
                  <DataTable.Cell>40ft Revenue</DataTable.Cell>
                  <DataTable.Cell numeric>
                    {
                      data_IN?.data?.find((val: any) => val.name === "40_data")
                        ?.revenue
                    }
                  </DataTable.Cell>
                  <DataTable.Cell numeric>
                    {
                      data_OUT?.data?.find((val: any) => val.name === "40_data")
                        ?.revenue
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
    gap: 8,
    backgroundColor: "white",
  },
  filterContainer: {
    display: "flex",
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "flex-start",
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },
  filterChips: {
    borderRadius: 50,
  },
});
