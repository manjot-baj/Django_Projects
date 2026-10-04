import {
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Image } from "expo-image";
import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";
import { Text } from "react-native";
import { Fonts } from "@/constants/theme";
import LayoutContainer from "@/components/LayoutContainer";
import { useAuthStore } from "@/store/authStore";
import { productivityAction } from "@/services/api/yard/productivityAction";
import { useProductivityStore } from "@/store/productivityStore";
import { Card, Chip, DataTable, useTheme } from "react-native-paper";
import Color from "color";
import { BarChart } from "react-native-gifted-charts";
import ModalWrapperComponent from "@/components/ModalWrapperComponent";
import DateTimePicker from "@react-native-community/datetimepicker";
import { handleDateFormatChangeUtil } from "@/utils/dateFormater";

const productivity = () => {
  const { user } = useAuthStore();
  const theme = useTheme();
  const [lolo_20_ft, setLOLO_20_ft] = useState(true);
  const [showSnackbaar, setShowSnackbaar] = useState(false);
  const [lolo_40_ft, setLOLO_40_ft] = useState(false);
  const [visibleMenu, setVisibleMenu] = React.useState(false);
  const [showPicker, setShowPicker] = useState<null | string>(null);
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());

  const {
    productivity_data,
    loading_productivity,
    from_date,
    to_date,
    setFromAndToDateProductivity,
  } = useProductivityStore();
  const onToggleSnackBar = () => setShowSnackbaar(!showSnackbaar);
  const onDismissSnackBar = () => setShowSnackbaar(false);
  const data_20_ft = productivity_data?.["mnr_20_data"];
  const data_40_ft = productivity_data?.["mnr_40_data"];

  const openMenu = () => setVisibleMenu(!visibleMenu);

  const closeMenu = () => {
    setShowPicker(null);
    setVisibleMenu(false);
  };

  useEffect(() => {
    if (user?.site && user?.location) {
      productivityAction(user, ["yard_mnr_productivity"], onToggleSnackBar);
    }
  }, [user?.site]);

  const onRefresh = (disableDateChange: boolean) => {
    if (!disableDateChange) {
      setFromAndToDateProductivity("", "");
    }
    if (user?.site && user?.location) {
      productivityAction(user, ["yard_mnr_productivity"], onToggleSnackBar);
    }
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
        source={require("@/assets/images/onboarding/team_image.png")}
      />

      <ThemedView style={styles.titleContainer}>
        <ThemedText
          type="title"
          style={{
            fontFamily: Fonts.rounded,
            color: "black",
          }}
        >
          Productivity
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
              setFromAndToDateProductivity(
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
            refreshing={loading_productivity}
            onRefresh={() => onRefresh(false)}
            colors={["#9Bd35A", "#689F38"]} // Example colors for Android
            progressBackgroundColor="#ffffff" // Example for Android
          />
        }
      >
        <ThemedView style={{ backgroundColor: "white" }}>
          {lolo_20_ft ? (
            <BarChart
              barWidth={90}
              noOfSections={3}
              barBorderRadius={4}
              yAxisExtraHeight={20}
              xAxisLabelsHeight={20}
              frontColor="lightgray"
              data={[
                {
                  value: data_20_ft?.["greater_than_4000"],
                  label: "4000 Above",
                  frontColor: "#177AD5",
                },
                {
                  value: data_20_ft?.["less_than_or_equalto_1500"],
                  label: "1500 <=",
                  frontColor: "#a446a7",
                },
                {
                  value: data_20_ft?.["less_than_or_equalto_4000"],
                  label: "4000 <=",
                  frontColor: "#a446a7",
                },
              ]}
              yAxisThickness={0}
              xAxisThickness={0}
            />
          ) : (
            <BarChart
              barWidth={90}
              noOfSections={3}
              barBorderRadius={4}
              frontColor="lightgray"
              yAxisExtraHeight={20}
              xAxisLabelsHeight={20}
              data={[
                {
                  value: data_40_ft?.["greater_than_4000"],
                  label: "4000 Above",
                  frontColor: "#177AD5",
                },
                {
                  value: data_40_ft?.["less_than_or_equalto_1500"],
                  label: "1500 <=",
                  frontColor: "#a446a7",
                },
                {
                  value: data_40_ft?.["less_than_or_equalto_4000"],
                  label: "4000 <=",
                  frontColor: "#008a00",
                },
              ]}
              yAxisThickness={0}
              xAxisThickness={0}
            />
          )}
        </ThemedView>
        <Card
          style={{ marginTop: 60, backgroundColor: "white", marginLeft: -10 }}
          elevation={0}
        >
          <Card.Title
            title={
              <Text
                style={{ fontSize: 18, fontWeight: 500, letterSpacing: 0.5 }}
              >
                Productivity Table
              </Text>
            }
          />
          <Card.Content>
            <DataTable style={styles.dataTable}>
              <DataTable.Header>
                <DataTable.Title>
                  {" "}
                  <Text style={{ fontWeight: "700", fontSize: 14 ,color:'black' }}>Type</Text>
                </DataTable.Title>
                <DataTable.Title numeric>
                  {" "}
                  <Text style={{ fontWeight: "700", fontSize: 14,color:'black' }}>20ft</Text>
                </DataTable.Title>
                <DataTable.Title numeric>
                  {" "}
                  <Text style={{ fontWeight: "700", fontSize: 14 ,color:'black'}}>40ft</Text>
                </DataTable.Title>
              </DataTable.Header>

              <DataTable.Row>
                <DataTable.Cell>4000 Above</DataTable.Cell>
                <DataTable.Cell numeric>
                  {data_20_ft?.["greater_than_4000"]}
                </DataTable.Cell>
                <DataTable.Cell numeric>
                  {data_40_ft?.["greater_than_4000"]}
                </DataTable.Cell>
              </DataTable.Row>
              <DataTable.Row>
                <DataTable.Cell>1500 {"<="}</DataTable.Cell>
                <DataTable.Cell numeric>
                  {data_20_ft?.["less_than_or_equalto_1500"]}
                </DataTable.Cell>
                <DataTable.Cell numeric>
                  {data_40_ft?.["less_than_or_equalto_1500"]}
                </DataTable.Cell>
              </DataTable.Row>
              <DataTable.Row>
                <DataTable.Cell>4000 {"<="}</DataTable.Cell>
                <DataTable.Cell numeric>
                  {data_20_ft?.["less_than_or_equalto_4000"]}
                </DataTable.Cell>
                <DataTable.Cell numeric>
                  {data_40_ft?.["less_than_or_equalto_4000"]}
                </DataTable.Cell>
              </DataTable.Row>
            </DataTable>
          </Card.Content>
        </Card>
      </ScrollView>
    </LayoutContainer>
  );
};

export default productivity;

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
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "flex-start",
    flexDirection: "row",
    marginTop: 24,
    marginBottom: 24,
    gap: 12,
  },
  filterChips: {
    borderRadius: 50,
  },
});
