import { useEffect, useRef } from "react";
import { Animated, Text } from "react-native";

const WelcomeBanner = ({ username, onFinish }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.delay(2000),
      Animated.timing(fadeAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start(() => onFinish?.());
  }, []);

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          top: 60,
          left: "10%",
          right: "10%",
          padding: 15,
          borderRadius: 20,
          alignItems: "center",
          backgroundColor: "rgba(252,191,73,0.9)",
          shadowColor: "#000",
          shadowOpacity: 0.3,
          shadowRadius: 6,
          elevation: 5,
        },
        { opacity: fadeAnim },
      ]}
    >
      <Text style={{ color: "#000", fontSize: 18, fontWeight: "bold" }}>
        👋 Welcome back, {username}!
      </Text>
    </Animated.View>
  );
};

export default WelcomeBanner;
