import { GestureResponderEvent, StyleSheet, Text } from "react-native";
import React from "react";
import { Button, Card, useTheme } from "react-native-paper";
import { ThemedText } from "./themed-text";
import { BarChart } from "react-native-gifted-charts";

type BarChartProps = {
  data: any;
  seeMore?: (e: GestureResponderEvent) => void;
  containerType: string;
  title: string;
  disableButton?: boolean;
  barWidth?:number
};

const BarChartComponent: React.FC<BarChartProps> = ({
  data,
  seeMore,
  containerType,
  title,
  disableButton,
  barWidth
}) => {
  const theme = useTheme();
  return (
    <Card mode="contained" style={styles.barChartCardContainer}>
      <Card.Title
        title={
          <ThemedText
            type="default"
            style={{ color: "black", fontSize: 12, fontWeight: 600 }}
          >
            {title} ({containerType})
          </ThemedText>
        }
      />
      <Card.Content>
        <BarChart
          barWidth={barWidth?barWidth: 30}
          noOfSections={5}
          barBorderRadius={8}
          frontColor="lightgray"
          yAxisExtraHeight={20}
          xAxisLabelsHeight={20}
          data={data?.map((val: any, index: number) => ({
            label:
              val.name === "Survey Pending"
                ? "SP"
                : val.name === "Estimate Pending"
                ? "EP"
                : val.name === "Approval Pending"
                ? "AP"
                : val.name === "Under Repairing"
                ? "UP"
                : val.name === "Available"
                ? "AV"
                : val.name === "Alloted"
                ? "AL"
                : val.name,
            topLabelComponent: () => (
              <Text style={{ color: "blue", fontSize: 12, marginBottom: 6 }}>
                {Number(val.value)}
              </Text>
            ),
            value: val.value,
            frontColor:
              val.name === "Survey Pending" || val.name === "Survey"
                ? "#7acfdc"
                : val.name === "Estimate Pending" || val.name === "Estimate"
                ? "#157ad6"
                : val.name === "Approval Pending" || val.name === "Approval"
                ? "#ef820d"
                : val.name === "Under Repairing" || val.name === "Repair"
                ? "#fe0000"
                : val.name === "Available" || val.name === "Available"
                ? "#a446a7"
                : val.name === "Alloted"
                ? "#008a00"
                : "#cfd5e1",
          }))}
          yAxisThickness={0}
          xAxisThickness={0}
        />
      </Card.Content>

      {!disableButton && (
        <Card.Actions style={styles.barChartCardActionContainer}>
          <Button
            mode="text"
            textColor={theme.colors.primary}
            onPress={seeMore}
          >
            See More{" "}
          </Button>
        </Card.Actions>
      )}
    </Card>
  );
};

export default BarChartComponent;

const styles = StyleSheet.create({
  barChartCardContainer: {
    marginTop: 24,
    backgroundColor: "white",
    marginLeft: -12,
  },
  barChartCardActionContainer: {
    marginTop: 12,
  },
});
