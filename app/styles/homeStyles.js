import { StyleSheet } from "react-native";

import { theme } from "./theme";

const homeStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  hero: {
    height: 220,
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    backgroundColor: "rgba(0,0,0,0.4)",
    padding: theme.spacing.large,
    borderRadius: theme.radius.medium,
  },
  heroText: {
    fontSize: theme.typography.sizes.large + 6,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary,
    textAlign: "center",
  },
  heroSub: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.text,
    marginTop: theme.spacing.xsmall,
    textAlign: "center",
  },
  section: {
    padding: theme.spacing.large,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.large,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary,
    marginBottom: theme.spacing.medium,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: theme.spacing.medium,
  },
  featureButton: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.medium - theme.spacing.xsmall,
    borderRadius: theme.radius.medium,
    marginHorizontal: theme.spacing.xsmall,
    alignItems: "center",
  },
  featureText: {
    fontSize: theme.typography.sizes.small,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.text,
  },
});

export default homeStyles;
