import { StyleSheet } from "react-native";

import { theme } from "./theme";

export const latestEpisodesStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.backgroundAlt,
    paddingHorizontal: theme.spacing.large,
    paddingBottom: theme.spacing.medium,
  },
  closeButton: {
    position: "absolute",
    left: theme.spacing.medium,
    zIndex: 10,
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(15, 23, 25, 0.85)",
    borderWidth: 1,
    borderColor: theme.colors.borderMuted,
  },
  centerContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  statusText: {
    marginTop: theme.spacing.medium,
    color: theme.colors.textSubtle,
    fontSize: theme.typography.sizes.medium,
    textAlign: "center",
  },
  listContent: {
    paddingTop: 76,
    paddingBottom: theme.spacing.large,
  },
  episodeRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.spacing.small,
    paddingHorizontal: theme.spacing.medium,
    backgroundColor: theme.colors.surfaceMuted,
    borderRadius: theme.radius.medium,
  },
  episodeImageWrapper: {
    marginRight: theme.spacing.medium,
    borderRadius: theme.radius.medium,
    overflow: "hidden",
    backgroundColor: theme.colors.surfaceElevated,
  },
  episodeImage: {
    width: 90,
    height: 130,
  },
  episodeImageFallback: {
    width: 90,
    height: 130,
    alignItems: "center",
    justifyContent: "center",
  },
  episodeFallbackText: {
    color: theme.colors.primary,
    fontSize: theme.typography.sizes.xlarge,
    fontWeight: theme.typography.weights.bold,
  },
  episodeContent: {
    flex: 1,
  },
  episodeTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.medium,
    fontWeight: theme.typography.weights.bold,
  },
  episodeSubtitle: {
    color: theme.colors.textSubtle,
    fontSize: theme.typography.sizes.small,
    marginTop: theme.spacing.xsmall,
  },
  episodeMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginTop: theme.spacing.small,
  },
  metaBadge: {
    backgroundColor: "rgba(252,191,73,0.18)",
    borderRadius: theme.radius.round,
    paddingHorizontal: theme.spacing.small,
    paddingVertical: theme.spacing.xxsmall,
    marginRight: theme.spacing.small,
    marginBottom: theme.spacing.xsmall,
  },
  metaBadgeText: {
    color: theme.colors.primary,
    fontWeight: theme.typography.weights.bold,
    fontSize: theme.typography.sizes.xs,
    letterSpacing: 0.4,
  },
  metaText: {
    color: theme.colors.textSubtle,
    fontSize: theme.typography.sizes.xs,
    marginRight: theme.spacing.small,
    marginBottom: theme.spacing.xsmall,
  },
  separator: {
    height: theme.spacing.small,
  },
});
