// app/onboarding.js
import React, { useEffect, useRef, useState } from "react";
import { Redirect, useRouter } from "expo-router";

import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

interface Slide {
  id: string;
  title: string;
  subtitle: string;
  image: any;
}

const slides: Slide[] = [
  {
    id: "1",
    title: "Track Yard Revenue Instantly",
    subtitle:
      "Monitor your earnings with clear insights and smart monthly summaries.",
    image: require("@/assets/images/onboarding/track_image.png"),
  },
  {
    id: "2",
    title: "Know Your Stocks Anytime",
    subtitle: "Stay updated with accurate, real-time yard inventory reports.",
    image: require("@/assets/images/onboarding/stock_image.png"),
  },
  {
    id: "3",
    title: "Boost Team Efficiency",
    subtitle:
      "See daily workforce performance and improve operations seamlessly.",
    image: require("@/assets/images/onboarding/team_image.png"),
  },
];

const OnboardingScreen = () => {
  const router = useRouter();
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      setIsLoading(true);
      try {
        const status = await AsyncStorage.getItem("onboarding_complete");
        if (status === "true") {
          setIsOnboardingComplete(true);
        }
      } catch (error) {
        console.error("Error checking onboarding status:", error);
      } finally {
        setTimeout(() => {
          setIsLoading(false);
        }, 3000);
      }
    };
    checkOnboardingStatus();
  }, []);

  const viewableItemsChanged = useRef(({ viewableItems }: any) => {
    setCurrentIndex(viewableItems[0]?.index || 0);
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      handleFinishOnboarding();
    }
  };

  const renderItem = ({ item }: { item: Slide }) => (
    <View style={[styles.slide, { width }]}>
      <Image source={item.image} style={styles.image} resizeMode="contain" />
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.subtitle}>{item.subtitle}</Text>
    </View>
  );

  const Dot = ({ index }: { index: number }) => {
    const opacity = scrollX.interpolate({
      inputRange: [(index - 1) * width, index * width, (index + 1) * width],
      outputRange: [0.3, 1, 0.3],
      extrapolate: "clamp",
    });
    return <Animated.View style={[styles.dot, { opacity }]} />;
  };

  const handleFinishOnboarding = async () => {
    // Logic to mark onboarding as complete (e.g., store in AsyncStorage)
    // Then navigate to the main app

    await AsyncStorage.setItem("onboarding_complete", "true");

    router.replace("/(tabs)"); // Or whatever your main app route is
  };

  if (isLoading) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "white",
        }}
      >
        <Image
          source={require("@/assets/images/yard-monitoring-app-icon.png")}
          style={{
            width: 200,
            height: 200,
            objectFit: "contain",
          }}
        />
        <ActivityIndicator
          size="large"
          color="#004474"
          style={{ marginBottom: -44 }}
        />
      </SafeAreaView>
    );
  }

  if (isOnboardingComplete) {
    return <Redirect href={"/(tabs)"} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={slides}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        bounces={false}
        ref={flatListRef}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onViewableItemsChanged={viewableItemsChanged}
        viewabilityConfig={viewConfig}
      />

      {/* Pagination */}
      <View style={styles.pagination}>
        {slides.map((_, i) => (
          <Dot key={i.toString()} index={i} />
        ))}
      </View>

      {/* Button */}
      <TouchableOpacity style={styles.button} onPress={handleNext}>
        <Text style={styles.buttonText}>
          {currentIndex === slides.length - 1 ? "Get Started" : "Next"}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default OnboardingScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  slide: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  image: { width: "80%", height: "50%", marginBottom: 30 },
  title: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    color: "#004474",
  },
  subtitle: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginTop: 10,
    paddingHorizontal: 30,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 20,
  },
  dot: {
    height: 8,
    width: 8,
    borderRadius: 4,
    backgroundColor: "#333",
    marginHorizontal: 5,
  },
  button: {
    backgroundColor: "#1624E2",
    marginHorizontal: 40,
    paddingVertical: 15,
    marginBottom: 24,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
