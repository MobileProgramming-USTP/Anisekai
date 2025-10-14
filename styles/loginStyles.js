import { StyleSheet } from "react-native";

import { theme } from "./theme";

const loginStyles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: theme.spacing.large + theme.spacing.xsmall,
  },
  container: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.large + theme.spacing.xsmall,
    borderRadius: theme.radius.large,
  },
  title: {
    fontSize: theme.typography.sizes.xxlarge,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary,
    textAlign: "center",
    marginBottom: theme.spacing.large,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
    borderRadius: theme.radius.pill,
    marginVertical: theme.spacing.small,
    width: "100%",
    paddingHorizontal: theme.spacing.medium,
  },
  icon: {
    fontSize: theme.typography.sizes.medium + 2,
    color: theme.colors.primary,
    marginHorizontal: theme.spacing.xsmall,
  },
  input: {
    flex: 1,
    padding: theme.spacing.small + theme.spacing.xsmall,
    color: theme.colors.text,
  },
  toggleButton: {
    padding: theme.spacing.xsmall,
  },
  toggleIcon: {
    fontSize: theme.typography.sizes.medium + 2,
    color: theme.colors.primary,
    marginLeft: theme.spacing.xsmall / 2,
  },
  optionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginTop: theme.spacing.xsmall,
    marginBottom: theme.spacing.small,
  },
  rememberMeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: theme.radius.small / 2,
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  checkboxChecked: {
    backgroundColor: theme.colors.primary,
  },
  checkboxIcon: {
    color: theme.colors.background,
    fontSize: theme.typography.sizes.small,
  },
  rememberMeText: {
    color: theme.colors.text,
    marginLeft: theme.spacing.xsmall,
  },
  button: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.small + theme.spacing.xsmall,
    borderRadius: theme.radius.pill,
    alignItems: "center",
    width: "100%",
    marginVertical: theme.spacing.large - theme.spacing.small,
  },
  buttonText: {
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.background,
    fontSize: theme.typography.sizes.medium,
  },
  footer: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.text,
    textAlign: "center",
  },
  link: {
    color: theme.colors.primary,
    fontWeight: theme.typography.weights.bold,
  },
  banner: {
    position: "absolute",
    top: 60,
    left: "10%",
    right: "10%",
    padding: theme.spacing.medium,
    borderRadius: theme.radius.large,
    alignItems: "center",
    backgroundColor: "rgba(252,191,73,0.9)",
    shadowColor: theme.shadow.color,
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  bannerText: {
    color: theme.colors.background,
    fontSize: theme.typography.sizes.medium,
    fontWeight: theme.typography.weights.bold,
  },
});

export default loginStyles;
