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
});

export default homeStyles;
