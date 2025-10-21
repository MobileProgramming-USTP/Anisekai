import { Dimensions, StyleSheet } from "react-native";

import { theme } from "../theme";

const { width } = Dimensions.get("window");
const PREVIEW_WIDTH = width - theme.spacing.large * 2;

export const sceneFinderStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.backgroundAlt,
  },
  header: {
    padding: theme.spacing.large,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderMuted,
    backgroundColor: theme.colors.backgroundAlt,
  },
  title: {
    color: theme.colors.primary,
    fontSize: theme.typography.sizes.xxlarge,
    fontWeight: theme.typography.weights.bold,
  },
  subtitle: {
    color: theme.colors.textSubtle,
    fontSize: theme.typography.sizes.small,
    marginTop: theme.spacing.xsmall,
  },
  contentWrapper: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.large,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.large,
  },
  loadingCard: {
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.radius.large,
    padding: theme.spacing.xlarge,
    alignItems: "center",
  },
  loadingText: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.large,
    fontWeight: theme.typography.weights.semibold,
    marginTop: theme.spacing.medium,
  },
  loadingSubtext: {
    color: theme.colors.textSubtle,
    fontSize: theme.typography.sizes.small,
    marginTop: theme.spacing.small,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.large,
  },
  errorCard: {
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.radius.large,
    padding: theme.spacing.large,
    alignItems: "center",
  },
  errorTitle: {
    color: theme.colors.danger,
    fontSize: theme.typography.sizes.xlarge,
    fontWeight: theme.typography.weights.bold,
    marginTop: theme.spacing.medium,
  },
  errorText: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.medium,
    textAlign: "center",
    marginTop: theme.spacing.small,
  },
  errorHint: {
    color: theme.colors.textSubtle,
    fontSize: theme.typography.sizes.small,
    textAlign: "center",
    marginTop: theme.spacing.small,
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.large,
  },
  placeholderTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.large,
    fontWeight: theme.typography.weights.bold,
    textAlign: "center",
    marginTop: theme.spacing.small,
  },
  placeholderText: {
    color: theme.colors.textSubtle,
    fontSize: theme.typography.sizes.small,
    textAlign: "center",
    marginBottom: theme.spacing.large,
  },
  previewImage: {
    width: PREVIEW_WIDTH,
    height: 200,
    borderRadius: theme.radius.medium,
    marginBottom: theme.spacing.medium,
    alignSelf: "center",
    backgroundColor: theme.colors.surfaceMuted,
  },
  resultContainer: {
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.radius.large,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: theme.colors.borderMuted,
  },
  confidenceBadge: {
    position: "absolute",
    top: theme.spacing.large,
    right: theme.spacing.large,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.8)",
    paddingHorizontal: theme.spacing.medium,
    paddingVertical: theme.spacing.xsmall,
    borderRadius: theme.radius.pill,
    zIndex: 10,
  },
  confidenceIcon: {
    marginRight: theme.spacing.xsmall,
  },
  highConfidence: {
    borderWidth: 1,
    borderColor: "rgba(74,222,128,0.3)",
  },
  lowConfidence: {
    borderWidth: 1,
    borderColor: "rgba(251,191,36,0.3)",
  },
  confidenceText: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.small,
    fontWeight: theme.typography.weights.semibold,
  },
  videoContainer: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: "#000000",
  },
  videoPreview: {
    width: "100%",
    height: "100%",
  },
  resultInfo: {
    padding: theme.spacing.large,
  },
  resultTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.large,
    fontWeight: theme.typography.weights.bold,
    marginBottom: theme.spacing.large,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: theme.spacing.medium,
  },
  infoItem: {
    flex: 1,
    backgroundColor: "rgba(252,191,73,0.05)",
    padding: theme.spacing.medium,
    borderRadius: theme.radius.medium,
  },
  infoItemSpacing: {
    marginLeft: theme.spacing.medium,
  },
  infoLabel: {
    color: theme.colors.textSubtle,
    fontSize: theme.typography.sizes.xs,
    marginTop: theme.spacing.xsmall,
  },
  infoValue: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.medium,
    fontWeight: theme.typography.weights.semibold,
  },
  buttonContainer: {
    padding: theme.spacing.large,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderMuted,
    backgroundColor: theme.colors.backgroundAlt,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.medium,
    borderRadius: theme.radius.medium,
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
});
