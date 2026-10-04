import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "expo-router";
import { login } from "@/services/api/authService/authService";
import { Formik } from "formik";
import * as Yup from "yup";
import { Button } from "react-native-paper";
import { Image } from "expo-image";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import Feather from "@expo/vector-icons/Feather";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

const LoginSchema = Yup.object().shape({
  username: Yup.string().required("Username is required"),
  password: Yup.string().required("Password is required"),
});

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const setTokens = useAuthStore((s) => s.setTokens);
  const setUser = useAuthStore((s) => s.setUser);
  const router = useRouter();
  const [showloginError, setShowloginError] = useState(false);

  return (
    <View style={{ flex: 1 }}>
      <KeyboardAwareScrollView
        contentContainerStyle={styles.container}
        enableOnAndroid
        extraScrollHeight={300}
        keyboardShouldPersistTaps="handled"
        enableAutomaticScroll
        resetScrollToCoords={{ x: 0, y: 0 }}
      >
        <Image
          source={require("@/assets/images/onboarding/stock_image.png")}
          style={styles.logo}
        />
        <Text style={styles.title}>Login</Text>
        <Formik
          initialValues={{ username: "", password: "" }}
          validationSchema={LoginSchema}
          onSubmit={(values) =>
            login(
              values.username,
              values.password,
              setLoading,
              setTokens,
              setUser,
              router,
              setShowloginError
            )
          }
        >
          {({
            handleChange,
            handleBlur,
            handleSubmit,
            values,
            errors,
            touched,
          }) => (
            <>
              <View style={{ width: "100%", marginBottom: 10 }}>
                <View style={styles.inputContainer}>
                  {/* Username Field */}
                  <FontAwesome5
                    name="user"
                    size={24}
                    color="black"
                    style={styles.icon}
                  />
                  <TextInput
                    value={values.username}
                    onChangeText={handleChange("username")}
                    onBlur={handleBlur("username")}
                    placeholder="User Name"
                    style={styles.input}
                    placeholderTextColor="gray"
                  />
                </View>
                {errors.username && touched.username && (
                  <Text style={styles.errorText}>{errors.username}</Text>
                )}
              </View>
              <View style={{ width: "100%", marginBottom: 10 }}>
                <View style={styles.inputContainer}>
                  <Feather
                    name="lock"
                    size={24}
                    color="black"
                    style={styles.icon}
                  />
                  {/* Password Field */}
                  <TextInput
                    secureTextEntry={!showPassword}
                    placeholder="Password"
                    value={values.password}
                    onChangeText={handleChange("password")}
                    onBlur={handleBlur("password")}
                    style={styles.input}
                    placeholderTextColor="gray"
                  />

                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Feather
                      name={showPassword ? "eye" : "eye-off"}
                      size={20}
                      color="black"
                    />
                  </TouchableOpacity>
                </View>
                {errors.password && touched.password && (
                  <Text style={styles.errorText}>{errors.password}</Text>
                )}
                {showloginError && (
                  <Text style={styles.errorText}>
                    Please Login as Admin & try again.
                  </Text>
                )}
              </View>

              {/* Login Button */}
              <Button
                labelStyle={styles.labelStyle}
                style={styles.loginButton}
                mode="contained"
                elevation={5}
                onPress={() => handleSubmit()}
              >
                {loading ? "Please  wait..." : "Login"}
              </Button>
            </>
          )}
        </Formik>
      </KeyboardAwareScrollView>
    </View>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingTop: 100,
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 20,
  },
  logo: {
    height: 300,
    width: 400,
    resizeMode: "contain",
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    marginBottom: 40,
    fontWeight: "bold",
    color: "black",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    height: 50,
    backgroundColor: "#f1f1f1",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: "100%",
    color: "black",
  },
  errorText: {
    color: "red",
    alignSelf: "flex-start",
    marginBottom: 10,
  },
  loginButton: {
    width: "100%",
    minWidth: "100%",
    marginTop: 12,
    borderRadius: 10,
    height: 45,
  },
  labelStyle: {
    fontSize: 15,
  },
});
