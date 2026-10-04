import { ExpoConfig, ConfigContext } from "@expo/config";
import "dotenv/config";

export default ({ config }: ConfigContext): ExpoConfig => {
  const ENV = process.env.APP_ENV || "development";

  // Select API based on environment
  const API_URL =
    ENV === "production"
      ? process.env.PROD_API ?? "https://api.decomans.com"
      : process.env.PREVIEW_API ??
        process.env.DEV_API ??
        "https://newstag-api.decomans.com";

  return {
    ...config,
    name: "yard-monitoring",
    slug: "yard-monitoring",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "yardmonitoring",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    
    ios: {
      supportsTablet: true,
      bundleIdentifier:
        ENV === "production"
          ? "com.snp.yardmonitoring"
          : "com.snp.yardmonitoring.dev", // optional
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
      },
    },

    android: {
      adaptiveIcon: {
        backgroundColor: "#FFFFFF",
        foregroundImage: "./assets/images/icon.png",
      },
    
      softwareKeyboardLayoutMode: "resize",
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      package:
        ENV === "production"
          ? "com.anonymous.yardmonitoring"
          : "com.anonymous.yardmonitoring.dev", // optional
    },

    web: {
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#FFFFFF",
          dark: {
            image: "./assets/images/icon.png",
            backgroundColor: "#FFFFFF",
          },
        },
      ],
    ],

    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },

    extra: {
      router: {},
      apiUrl: API_URL,
      env: ENV,
      eas: {
        projectId: "a51ef33d-f185-42e5-8fb6-967923714478",
      },
    },

    owner: "amanpant",
  };
};
