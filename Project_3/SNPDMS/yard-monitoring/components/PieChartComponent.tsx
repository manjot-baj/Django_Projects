import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { Button, Card, useTheme } from "react-native-paper";
import { GestureResponderEvent } from "react-native";
import { ThemedText } from "./themed-text";
import { PieChart } from "react-native-gifted-charts";

type PieChartProps = {
  data: any;
  seeMore: (e: GestureResponderEvent) => void;
  containerType: string;
  title: string;
};

const PieChartComponent: React.FC<PieChartProps> = ({
  data,
  seeMore,
  containerType,
  title,
}) => {
  const theme = useTheme();
  return (
    <Card mode="contained" style={styles.barChartCardContainer}>
      <Card.Title
        title={
          <ThemedText type="defaultSemiBold">
            {title} ({containerType})
          </ThemedText>
        }
      />
      <Card.Content>
        <PieChart
          showText
          textColor="black"
          radius={100}
          textSize={14}
          showTextBackground
          textBackgroundRadius={1}
          data={data}
        />
      </Card.Content>

      <Card.Actions style={styles.barChartCardActionContainer}>
        <Button
          mode="text"
          textColor={theme.colors.primary}
          icon={"arrow-right-thin"}
          onPress={seeMore}
        >
          See More{" "}
        </Button>
      </Card.Actions>
    </Card>
  );
};

export default PieChartComponent;

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
