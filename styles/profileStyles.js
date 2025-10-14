import { StyleSheet } from "react-native";

import { theme } from "./theme";

const profileStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    alignItems: "center",
    paddingVertical: theme.spacing.large + theme.spacing.small,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    marginBottom: theme.spacing.large,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: theme.radius.round,
    marginBottom: theme.spacing.medium,
  },
  username: {
    fontSize: theme.typography.sizes.large + 2,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary,
  },
  email: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.textSubtle,
    marginTop: theme.spacing.xsmall,
    textAlign: "center",
  },
  section: {
    paddingHorizontal: theme.spacing.large,
    marginBottom: theme.spacing.large + theme.spacing.small,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.large,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary,
    marginBottom: theme.spacing.medium,
  },
  item: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.medium,
    borderRadius: theme.radius.medium,
    marginBottom: theme.spacing.medium - theme.spacing.xsmall,
  },
  itemText: {
    fontSize: theme.typography.sizes.medium,
    color: theme.colors.text,
  },
  disabledText: {
    color: theme.colors.textSubtle,
  },
  logoutButton: {
    backgroundColor: theme.colors.danger,
    padding: theme.spacing.medium,
    borderRadius: theme.radius.medium,
    alignItems: "center",
    marginHorizontal: theme.spacing.large,
    marginBottom: theme.spacing.xlarge + theme.spacing.small,
  },
  logoutText: {
    fontSize: theme.typography.sizes.medium,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
  },
});

export default profileStyles;
