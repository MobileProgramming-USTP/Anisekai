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
  episodeBadge: {
    position: "absolute",
    left: theme.spacing.small,
    bottom: theme.spacing.small,
    backgroundColor: "#FFB300",
    paddingHorizontal: theme.spacing.small + 2,
    paddingVertical: theme.spacing.xsmall + 1,
    borderRadius: theme.radius.small,
  },
  episodeBadgeText: {
    fontSize: theme.typography.sizes.xsmall + 2,
    fontWeight: theme.typography.weights.bold,
    color: "#090D12",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  episodeFallbackText: {
    fontSize: theme.typography.sizes.large + 2,
    fontWeight: theme.typography.weights.bold,
    color: "#FFB300",
  },
  episodeDetails: {
    minHeight: 52,
    justifyContent: "flex-start",
  },
  episodeTitle: {
    color: "#E7EDF5",
    fontSize: theme.typography.sizes.small,
    fontWeight: theme.typography.weights.medium,
  },
  emptyStateText: {
    fontSize: theme.typography.sizes.small,
    color: TEXT_MUTED,
  },
});

export default homeStyles;
