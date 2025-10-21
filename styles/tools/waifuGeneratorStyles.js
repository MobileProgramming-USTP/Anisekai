import { Dimensions, StyleSheet } from "react-native";

import { theme } from "../theme";

const { width } = Dimensions.get("window");
const IMAGE_SIZE = Math.min(width - theme.spacing.large * 2, 360);

export const waifuGeneratorStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.backgroundAlt,
  },
  scrollContent: {
    alignItems: "center",
    padding: theme.spacing.large,
  },
  titleContainer: {
    alignItems: "center",
    marginBottom: theme.spacing.large,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.xlarge,
    fontWeight: theme.typography.weights.bold,
  },
  subtitle: {
    color: theme.colors.textSubtle,
    fontSize: theme.typography.sizes.medium,
    marginTop: theme.spacing.xsmall,
  },
  categorySection: {
    width: "100%",
    height: 50,
    marginBottom: theme.spacing.large,
  },
  categoryContainer: {
    alignItems: "center",
    paddingHorizontal: theme.spacing.small,
  },
  categoryChip: {
    backgroundColor: theme.colors.surfaceMuted,
    paddingHorizontal: theme.spacing.medium,
    paddingVertical: theme.spacing.small,
    borderRadius: theme.radius.pill,
    justifyContent: "center",
    marginRight: theme.spacing.small,
  },
  categoryChipActive: {
    backgroundColor: theme.colors.primary,
  },
  categoryText: {
    color: theme.colors.text,
    fontWeight: theme.typography.weights.semibold,
  },
  categoryTextActive: {
    color: theme.colors.primaryForeground,
  },
  imageContainer: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: theme.radius.large,
    backgroundColor: theme.colors.surfaceElevated,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: theme.colors.borderMuted,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: theme.colors.danger,
    fontSize: theme.typography.sizes.medium,
    height: IMAGE_SIZE,
    textAlignVertical: "center",
    textAlign: "center",
  },
  buttonGroup: {
    flexDirection: "row",
    marginTop: theme.spacing.xlarge,
    alignItems: "center",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.medium,
    paddingHorizontal: theme.spacing.xlarge,
    borderRadius: theme.radius.pill,
    shadowColor: theme.shadow.color,
    shadowOffset: theme.shadow.offset,
    shadowOpacity: theme.shadow.opacity,
    shadowRadius: theme.shadow.radius,
    elevation: theme.shadow.elevation,
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonText: {
    color: theme.colors.primaryForeground,
    fontSize: theme.typography.sizes.medium,
    fontWeight: theme.typography.weights.bold,
    marginLeft: theme.spacing.small,
  },
  downloadButton: {
    backgroundColor: theme.colors.surfaceMuted,
    borderRadius: theme.radius.round,
    padding: theme.spacing.medium,
    marginLeft: theme.spacing.medium,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.borderMuted,
  },
  historySection: {
    width: "100%",
    marginTop: theme.spacing.xlarge,
  },
  historyTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.large,
    fontWeight: theme.typography.weights.bold,
    marginBottom: theme.spacing.medium,
  },
  historyThumbnail: {
    width: 80,
    height: 80,
    borderRadius: theme.radius.medium,
    marginRight: theme.spacing.small,
    backgroundColor: theme.colors.surfaceMuted,
  },
  historyList: {
    paddingRight: theme.spacing.small,
  },
});
