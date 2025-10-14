import { StyleSheet } from "react-native";

import { theme } from "./theme";

const exploreStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    paddingBottom: theme.spacing.xlarge,
  },
  filterBar: {
    paddingHorizontal: theme.spacing.large,
    paddingTop: theme.spacing.large,
  },
  searchBox: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.large,
    padding: theme.spacing.medium,
    marginBottom: theme.spacing.medium,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  searchLabel: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.sizes.small,
    marginBottom: theme.spacing.xsmall,
  },
  searchInput: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.medium,
  },
  filterChips: {
    paddingVertical: theme.spacing.xsmall,
    paddingRight: theme.spacing.large,
  },
  chip: {
    marginRight: theme.spacing.small,
    paddingHorizontal: theme.spacing.medium,
    paddingVertical: theme.spacing.small,
    borderRadius: theme.radius.pill,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "transparent",
  },
  chipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  chipText: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.sizes.small,
    fontWeight: theme.typography.weights.medium,
  },
  chipTextActive: {
    color: theme.colors.background,
  },
  summary: {
    paddingHorizontal: theme.spacing.large,
    paddingBottom: theme.spacing.large,
  },
  summaryTitle: {
    fontSize: theme.typography.sizes.xlarge,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary,
    marginBottom: theme.spacing.small,
  },
  summaryCopy: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.medium,
    lineHeight: theme.typography.sizes.medium + 6,
    marginBottom: theme.spacing.small,
  },
  summaryMetrics: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.sizes.small,
  },
  section: {
    marginBottom: theme.spacing.xlarge,
  },
  sectionHeader: {
    paddingHorizontal: theme.spacing.large,
    marginBottom: theme.spacing.medium,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.large,
    fontWeight: theme.typography.weights.bold,
  },
  sectionSubtitle: {
    color: theme.colors.textSubtle,
    fontSize: theme.typography.sizes.small,
    marginTop: theme.spacing.xsmall,
  },
  carouselContent: {
    paddingHorizontal: theme.spacing.large,
  },
  card: {
    width: 180,
    marginRight: theme.spacing.medium,
    borderRadius: theme.radius.large,
    overflow: "hidden",
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    position: "relative",
  },
  poster: {
    width: "100%",
    height: 220,
  },
  cardBody: {
    padding: theme.spacing.small,
  },
  cardTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.medium,
    fontWeight: theme.typography.weights.medium,
  },
  cardMeta: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.sizes.small,
    marginTop: theme.spacing.xsmall,
  },
  countdownPill: {
    marginTop: theme.spacing.small,
    alignSelf: "flex-start",
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.radius.pill,
    paddingVertical: theme.spacing.xsmall,
    paddingHorizontal: theme.spacing.small,
  },
  countdownText: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.small,
    fontWeight: theme.typography.weights.medium,
  },
  cardOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(5, 5, 15, 0.94)",
    padding: theme.spacing.medium,
    justifyContent: "space-between",
  },
  synopsis: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.small,
    lineHeight: theme.typography.sizes.small + 6,
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: theme.spacing.small,
  },
  genreTag: {
    paddingHorizontal: theme.spacing.small,
    paddingVertical: theme.spacing.xsmall,
    borderRadius: theme.radius.pill,
    backgroundColor: "rgba(255,255,255,0.1)",
    marginRight: theme.spacing.xsmall,
    marginBottom: theme.spacing.xsmall,
  },
  genreText: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.sizes.small - 2,
  },
  addButton: {
    marginTop: theme.spacing.medium,
    backgroundColor: theme.colors.accent,
    borderRadius: theme.radius.pill,
    paddingVertical: theme.spacing.small,
    alignItems: "center",
  },
  addButtonText: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.small,
    fontWeight: theme.typography.weights.bold,
  },
  emptyState: {
    paddingHorizontal: theme.spacing.large,
    alignItems: "center",
    paddingBottom: theme.spacing.xlarge,
  },
  emptyTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.large,
    fontWeight: theme.typography.weights.bold,
    marginBottom: theme.spacing.small,
  },
  emptyCopy: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.sizes.small,
    textAlign: "center",
    lineHeight: theme.typography.sizes.small + 6,
  },
});

export default exploreStyles;
