import { StyleSheet } from "react-native";

import { theme } from "./theme";

const BASE_BACKGROUND = "#0b141f";
const PANEL_BACKGROUND = "#1a2738";

const profileEditStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BASE_BACKGROUND,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.large,
    paddingVertical: theme.spacing.xlarge,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: BASE_BACKGROUND,
    paddingHorizontal: theme.spacing.large,
    justifyContent: "center",
  },
  header: {
    fontSize: theme.typography.sizes.xlarge,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.large,
    textAlign: "center",
  },
  avatarPreview: {
    width: 140,
    height: 140,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.1)",
    overflow: "hidden",
    alignSelf: "center",
    marginBottom: theme.spacing.large,
  },
  avatarFallback: {
    flex: 1,
    backgroundColor: "#223042",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarFallbackText: {
    fontSize: theme.typography.sizes.large,
    fontWeight: theme.typography.weights.bold,
    color: "#FFB300",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  sectionCard: {
    backgroundColor: PANEL_BACKGROUND,
    borderRadius: 18,
    padding: theme.spacing.large,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
  },
  fieldGroup: {
    marginBottom: theme.spacing.large,
  },
  fieldLabel: {
    fontSize: theme.typography.sizes.small,
    fontWeight: theme.typography.weights.medium,
    color: "rgba(255, 255, 255, 0.7)",
    marginBottom: theme.spacing.xsmall,
  },
  input: {
    backgroundColor: "#142132",
    borderRadius: 12,
    paddingHorizontal: theme.spacing.medium,
    paddingVertical: theme.spacing.medium,
    color: theme.colors.text,
    fontSize: theme.typography.sizes.medium,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  helperText: {
    marginTop: theme.spacing.xsmall,
    fontSize: theme.typography.sizes.xsmall,
    color: "rgba(255, 255, 255, 0.6)",
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: theme.spacing.large,
    gap: theme.spacing.medium,
  },
  button: {
    flex: 1,
    borderRadius: theme.radius.pill,
    paddingVertical: theme.spacing.medium,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: theme.typography.sizes.medium,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
  },
  emptyState: {
    backgroundColor: PANEL_BACKGROUND,
    borderRadius: 18,
    padding: theme.spacing.large,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  emptyTitle: {
    fontSize: theme.typography.sizes.large,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.small,
  },
  emptyBody: {
    fontSize: theme.typography.sizes.medium,
    color: "rgba(255, 255, 255, 0.7)",
    marginBottom: theme.spacing.large,
  },
  emptyButton: {
    alignSelf: "center",
    paddingHorizontal: theme.spacing.large,
    paddingVertical: theme.spacing.medium,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primary,
  },
  emptyButtonText: {
    fontSize: theme.typography.sizes.medium,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
  },
});

export default profileEditStyles;
