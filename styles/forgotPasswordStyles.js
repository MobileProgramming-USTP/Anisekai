import { StyleSheet } from "react-native";

import { theme } from "./theme";

const forgotPasswordStyles = StyleSheet.create({
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
    fontSize: theme.typography.sizes.xlarge,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary,
    textAlign: "center",
    marginBottom: theme.spacing.small,
  },
  subtitle: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.textMuted,
    textAlign: "center",
    marginBottom: theme.spacing.medium,
    paddingHorizontal: theme.spacing.medium,
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
});

export default forgotPasswordStyles;
