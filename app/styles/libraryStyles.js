import { StyleSheet } from "react-native";

import { theme } from "./theme";

const libraryStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    paddingBottom: theme.spacing.xlarge * 2,
  },
  pageHeader: {
    paddingHorizontal: theme.spacing.large,
    paddingTop: theme.spacing.xlarge,
    paddingBottom: theme.spacing.medium,
  },
  pageTitle: {
    fontSize: theme.typography.sizes.xlarge,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary,
    marginBottom: theme.spacing.small,
  },
  pageSubtitle: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.medium,
    lineHeight: theme.typography.sizes.medium + 6,
  },
  tabRow: {
    flexDirection: "row",
    paddingHorizontal: theme.spacing.large,
    marginBottom: theme.spacing.large,
  },
  tabPill: {
    paddingHorizontal: theme.spacing.medium,
    paddingVertical: theme.spacing.small,
    borderRadius: theme.radius.pill,
    backgroundColor: "rgba(255,255,255,0.06)",
    marginRight: theme.spacing.small,
  },
  tabText: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.sizes.small,
    fontWeight: theme.typography.weights.medium,
  },
  tabTextActive: {
    color: theme.colors.background,
  },
  filterPanel: {
    paddingHorizontal: theme.spacing.large,
    marginBottom: theme.spacing.xlarge,
  },
  filterGroup: {
    marginBottom: theme.spacing.medium,
  },
  filterLabel: {
    color: theme.colors.textSubtle,
    fontSize: theme.typography.sizes.small,
    marginBottom: theme.spacing.small,
  },
  filterChip: {
    paddingHorizontal: theme.spacing.medium,
    paddingVertical: theme.spacing.small,
    borderRadius: theme.radius.pill,
    backgroundColor: "rgba(255,255,255,0.08)",
    marginRight: theme.spacing.small,
    borderWidth: 1,
    borderColor: "transparent",
  },
  filterChipActive: {
    borderColor: theme.colors.primary,
    backgroundColor: "rgba(252,191,73,0.25)",
  },
  filterChipText: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.sizes.small,
  },
  filterChipTextActive: {
    color: theme.colors.primary,
    fontWeight: theme.typography.weights.bold,
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
  card: {
    marginHorizontal: theme.spacing.large,
    marginBottom: theme.spacing.large,
    borderRadius: theme.radius.large,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.medium,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cardHeader: {
    flexDirection: "row",
  },
  poster: {
    width: 110,
    height: 160,
    borderRadius: theme.radius.medium,
    marginRight: theme.spacing.medium,
  },
  cardMeta: {
    flex: 1,
  },
  cardTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.medium + 2,
    fontWeight: theme.typography.weights.bold,
    marginBottom: theme.spacing.xsmall,
  },
  cardSub: {
    color: theme.colors.textSubtle,
    fontSize: theme.typography.sizes.small,
    marginBottom: theme.spacing.xsmall,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: theme.spacing.small,
  },
  progressLabel: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.sizes.small,
  },
  progressPercent: {
    fontSize: theme.typography.sizes.small,
    fontWeight: theme.typography.weights.bold,
  },
  progressTrack: {
    height: 6,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: theme.radius.pill,
    overflow: "hidden",
    marginTop: theme.spacing.xsmall,
  },
  progressFill: {
    height: "100%",
    borderRadius: theme.radius.pill,
  },
  scoreText: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.sizes.small,
    marginTop: theme.spacing.xsmall,
  },
  reviewSection: {
    marginTop: theme.spacing.medium,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: theme.spacing.medium,
  },
  reviewLabel: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.medium,
    fontWeight: theme.typography.weights.medium,
    marginBottom: theme.spacing.small,
  },
  reviewBody: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.small,
    lineHeight: theme.typography.sizes.small + 6,
    marginBottom: theme.spacing.small,
  },
  addReviewButton: {
    alignSelf: "flex-start",
    paddingVertical: theme.spacing.xsmall,
  },
  addReviewText: {
    fontSize: theme.typography.sizes.small,
    fontWeight: theme.typography.weights.bold,
  },
  reviewInput: {
    minHeight: 80,
    borderRadius: theme.radius.medium,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.small,
    color: theme.colors.text,
    marginBottom: theme.spacing.small,
    textAlignVertical: "top",
  },
  reviewActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  primaryButton: {
    borderRadius: theme.radius.pill,
    paddingHorizontal: theme.spacing.large,
    paddingVertical: theme.spacing.small,
    marginLeft: theme.spacing.small,
  },
  primaryButtonText: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.small,
    fontWeight: theme.typography.weights.bold,
  },
  secondaryButton: {
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.large,
    paddingVertical: theme.spacing.small,
  },
  secondaryButtonText: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.sizes.small,
  },
  cardFooter: {
    marginTop: theme.spacing.medium,
  },
  tagGroup: {
    marginBottom: theme.spacing.small,
  },
  tagLabel: {
    color: theme.colors.textSubtle,
    fontSize: theme.typography.sizes.small,
    marginBottom: theme.spacing.xsmall,
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  tagPill: {
    paddingHorizontal: theme.spacing.small,
    paddingVertical: theme.spacing.xsmall,
    borderRadius: theme.radius.pill,
    backgroundColor: "rgba(255,255,255,0.08)",
    marginRight: theme.spacing.xsmall,
    marginBottom: theme.spacing.xsmall,
  },
  tagText: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.sizes.small - 1,
  },
  emptyState: {
    paddingHorizontal: theme.spacing.large,
    paddingVertical: theme.spacing.large,
    alignItems: "center",
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
  ratingRow: {
    flexDirection: "row",
    marginBottom: theme.spacing.small,
  },
  ratingPill: {
    paddingHorizontal: theme.spacing.medium,
    paddingVertical: theme.spacing.xsmall,
    borderRadius: theme.radius.pill,
    backgroundColor: "rgba(255,255,255,0.06)",
    marginRight: theme.spacing.small,
    borderWidth: 1,
    borderColor: "transparent",
  },
  ratingPillActive: {
    borderColor: theme.colors.accent,
    backgroundColor: "rgba(255,0,128,0.18)",
  },
  ratingPillText: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.sizes.small,
  },
  ratingPillTextActive: {
    color: theme.colors.text,
    fontWeight: theme.typography.weights.bold,
  },
  favoritesGrid: {
    flexDirection: "row",
    paddingHorizontal: theme.spacing.large,
    paddingBottom: theme.spacing.xlarge,
  },
  favoriteColumn: {
    flex: 1,
  },
  favoriteLabel: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.medium,
    fontWeight: theme.typography.weights.bold,
    marginBottom: theme.spacing.small,
  },
  favoriteItem: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.sizes.small,
    marginBottom: theme.spacing.xsmall,
  },
});

export default libraryStyles;
