import { StyleSheet } from "react-native";

import { theme } from "./theme";

const indexStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: theme.spacing.large,
  },
  content: {
    alignItems: "center",
  },
  title: {
    fontSize: theme.typography.sizes.large,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.text,
    marginBottom: theme.spacing.xsmall,
    textAlign: "center",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  brand: {
    fontSize: theme.typography.sizes.hero,
    fontWeight: theme.typography.weights.black,
    textAlign: "center",
    textShadowColor: "rgba(255,255,255,0.5)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 12,
  },
  subtitle: {
    fontSize: theme.typography.sizes.medium,
    color: theme.colors.textMuted,
    textAlign: "center",
    marginBottom: theme.spacing.large + theme.spacing.small,
    marginTop: theme.spacing.medium,
    lineHeight: theme.typography.sizes.medium + 6,
    maxWidth: 300,
  },
  button: {
    borderRadius: theme.radius.pill,
    overflow: "hidden",
    elevation: theme.shadow.elevation,
    shadowColor: theme.colors.accent,
    shadowOpacity: 0.7,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
  },
  buttonGradient: {
    paddingVertical: theme.spacing.small + theme.spacing.xsmall,
    paddingHorizontal: theme.spacing.xlarge + theme.spacing.small,
    borderRadius: theme.radius.pill,
  },
  buttonText: {
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
    fontSize: theme.typography.sizes.medium,
    textAlign: "center",
  },
});

export default indexStyles;
