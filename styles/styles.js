import { StyleSheet } from "react-native";

import { theme } from "./theme";

export const globalStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  screenAlt: {
    flex: 1,
    backgroundColor: theme.colors.backgroundAlt,
  },
  contentPadding: {
    paddingHorizontal: theme.spacing.medium,
    paddingVertical: theme.spacing.large,
  },
  title: {
    fontSize: theme.typography.sizes.xlarge,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary,
    marginBottom: theme.spacing.medium,
  },
  subtitle: {
    fontSize: theme.typography.sizes.large,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textSubtle,
  },
  bodyText: {
    fontSize: theme.typography.sizes.medium,
    color: theme.colors.text,
  },
  mutedText: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.textMuted,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.small,
    paddingHorizontal: theme.spacing.large,
    borderRadius: theme.radius.pill,
    shadowColor: theme.shadow.color,
    shadowOffset: theme.shadow.offset,
    shadowOpacity: theme.shadow.opacity,
    shadowRadius: theme.shadow.radius,
    elevation: theme.shadow.elevation,
  },
  buttonText: {
    color: theme.colors.primaryForeground,
    fontSize: theme.typography.sizes.medium,
    fontWeight: theme.typography.weights.medium,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.medium,
    padding: theme.spacing.medium,
    marginVertical: theme.spacing.small,
    shadowColor: theme.shadow.subtle.color,
    shadowOffset: theme.shadow.subtle.offset,
    shadowOpacity: theme.shadow.subtle.opacity,
    shadowRadius: theme.shadow.subtle.radius,
    elevation: theme.shadow.subtle.elevation,
  },
  sectionSurface: {
    backgroundColor: theme.colors.surfaceMuted,
    borderRadius: theme.radius.large,
    padding: theme.spacing.medium,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.borderMuted,
  },
  chip: {
    backgroundColor: theme.colors.surfaceMuted,
    borderRadius: theme.radius.pill,
    paddingHorizontal: theme.spacing.small,
    paddingVertical: theme.spacing.xsmall,
  },
  chipActive: {
    backgroundColor: theme.colors.primary,
  },
  chipText: {
    color: theme.colors.textSubtle,
    fontWeight: theme.typography.weights.medium,
  },
  chipTextActive: {
    color: theme.colors.primaryForeground,
  },
});

export default globalStyles;
