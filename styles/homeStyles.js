import { StyleSheet } from "react-native";

import { theme } from "./theme";

const ACCENT = "#fcbf49";
const TEXT_MUTED = "rgba(227, 235, 243, 0.75)";

const homeStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F1719",
  },
  heroWrapper: {
    paddingHorizontal: 0,
    paddingTop: 0,
  },
  hero: {
    height: 300,
    borderRadius: 0,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.medium,
  },
  heroImage: {
    borderRadius: 0,
  },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  heroLogo: {
    width: 320,
    height: 240,
  },
  section: {
    paddingHorizontal: theme.spacing.large,
    paddingTop: theme.spacing.large,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.medium - theme.spacing.xsmall,
  },
  sectionTitle: {
    color: "#A5B2C2",
    fontSize: theme.typography.sizes.small,
    fontWeight: theme.typography.weights.bold,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  sectionAction: {
    fontSize: theme.typography.sizes.small,
    fontWeight: theme.typography.weights.bold,
    color: "#FFB300",
  },
  sectionDescription: {
    color: TEXT_MUTED,
    fontSize: theme.typography.sizes.small,
    lineHeight: 20,
    marginBottom: theme.spacing.small,
  },
  aiPromptLead: {
    color: "#E7EDF5",
    fontSize: theme.typography.sizes.small + 1,
    fontWeight: theme.typography.weights.medium,
    marginBottom: theme.spacing.small,
  },
  aiPromptScroll: {
    paddingVertical: theme.spacing.xsmall,
    paddingRight: theme.spacing.medium,
  },
  aiPromptChip: {
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
    paddingVertical: theme.spacing.xsmall + 2,
    paddingHorizontal: theme.spacing.medium,
    marginRight: theme.spacing.xsmall + theme.spacing.small,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
  },
  aiPromptChipActive: {
    backgroundColor: "#5b5ff7",
    borderColor: "#5b5ff7",
  },
  aiPromptChipDisabled: {
    opacity: 0.55,
  },
  aiPromptChipText: {
    color: "#E7EDF5",
    fontSize: theme.typography.sizes.small,
    fontWeight: theme.typography.weights.medium,
  },
  aiPromptChipTextActive: {
    color: "#FFFFFF",
  },
  episodeList: {
    paddingRight: theme.spacing.medium,
  },
  episodeCard: {
    width: 150,
    marginRight: theme.spacing.small + theme.spacing.xsmall,
  },
  episodeImageWrapper: {
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#121A21",
    marginBottom: theme.spacing.small,
    position: "relative",
  },
  episodeImage: {
    width: "100%",
    height: 210,
  },
  episodeImageFallback: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.04)",
  },
  episodeImageOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  episodeBadgeText: {
    position: "absolute",
    left: theme.spacing.small,
    bottom: theme.spacing.small,
    fontSize: theme.typography.sizes.xsmall + 2,
    fontWeight: theme.typography.weights.bold,
    color: "#FFB300",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    textShadowColor: "rgba(0, 0, 0, 0.65)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  episodeFallbackText: {
    fontSize: theme.typography.sizes.large + 2,
    fontWeight: theme.typography.weights.bold,
    color: "#FFB300",
  },
  episodeDetails: {
    minHeight: 52,
    justifyContent: "flex-start",
    marginTop: theme.spacing.xsmall,
  },
  episodeTitle: {
    color: "#E7EDF5",
    fontSize: theme.typography.sizes.small,
    fontWeight: theme.typography.weights.medium,
    letterSpacing: 0.6,
  },
  emptyStateText: {
    fontSize: theme.typography.sizes.small,
    color: TEXT_MUTED,
  },
  aiInput: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: theme.radius.medium,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
    color: "#E7EDF5",
    paddingVertical: theme.spacing.small + theme.spacing.xsmall,
    paddingHorizontal: theme.spacing.medium,
    fontSize: theme.typography.sizes.medium - 1,
    minHeight: 72,
    textAlignVertical: "top",
  },
  aiActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: theme.spacing.small,
  },
  aiPrimaryButton: {
    borderRadius: theme.radius.pill,
    overflow: "hidden",
  },
  aiPrimaryGradient: {
    paddingVertical: theme.spacing.small + theme.spacing.xsmall,
    paddingHorizontal: theme.spacing.large,
    borderRadius: theme.radius.pill,
  },
  aiPrimaryButtonDisabled: {
    opacity: 0.6,
  },
  aiPrimaryText: {
    color: "#FFFFFF",
    fontSize: theme.typography.sizes.small + 1,
    fontWeight: theme.typography.weights.bold,
    textAlign: "center",
  },
  aiClearButton: {
    marginLeft: theme.spacing.small,
    paddingHorizontal: theme.spacing.small,
    paddingVertical: theme.spacing.xsmall,
  },
  aiClearButtonText: {
    color: ACCENT,
    fontSize: theme.typography.sizes.small,
    fontWeight: theme.typography.weights.medium,
  },
  aiLoadingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: theme.spacing.small,
  },
  aiLoadingText: {
    color: TEXT_MUTED,
    marginLeft: theme.spacing.xsmall + 2,
    fontSize: theme.typography.sizes.small,
  },
  aiErrorText: {
    color: theme.colors.danger,
    marginTop: theme.spacing.small,
    fontSize: theme.typography.sizes.small,
  },
  recommendationList: {
    marginTop: theme.spacing.medium,
  },
  recommendationCard: {
    backgroundColor: "rgba(18, 26, 33, 0.85)",
    borderRadius: theme.radius.large,
    padding: theme.spacing.medium,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
    marginBottom: theme.spacing.medium,
  },
  recommendationTitle: {
    color: "#E7EDF5",
    fontSize: theme.typography.sizes.large,
    fontWeight: theme.typography.weights.bold,
  },
  recommendationMeta: {
    color: TEXT_MUTED,
    marginTop: theme.spacing.xsmall,
    fontSize: theme.typography.sizes.small,
    letterSpacing: 0.3,
  },
  recommendationSynopsis: {
    color: "#E7EDF5",
    marginTop: theme.spacing.small,
    fontSize: theme.typography.sizes.small + 1,
    lineHeight: 20,
  },
  recommendationReason: {
    color: ACCENT,
    marginTop: theme.spacing.small,
    fontSize: theme.typography.sizes.small,
  },
});

export default homeStyles;
