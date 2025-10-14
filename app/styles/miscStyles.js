import { StyleSheet } from "react-native";

import { theme } from "./theme";

const miscStyles = StyleSheet.create({
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
    paddingBottom: theme.spacing.large,
  },
  pageTitle: {
    color: theme.colors.primary,
    fontSize: theme.typography.sizes.xlarge,
    fontWeight: theme.typography.weights.bold,
    marginBottom: theme.spacing.small,
  },
  pageSubtitle: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.small,
    lineHeight: theme.typography.sizes.small + 6,
  },
  sectionCard: {
    marginHorizontal: theme.spacing.large,
    marginBottom: theme.spacing.xlarge,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.large,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.large,
  },
  cardHeader: {
    marginBottom: theme.spacing.medium,
  },
  cardTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.large,
    fontWeight: theme.typography.weights.bold,
  },
  cardSubtitle: {
    color: theme.colors.textSubtle,
    fontSize: theme.typography.sizes.small,
    marginTop: theme.spacing.xsmall,
    lineHeight: theme.typography.sizes.small + 4,
  },
  waifuContent: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  waifuPortrait: {
    width: 120,
    height: 180,
    borderRadius: theme.radius.medium,
    marginRight: theme.spacing.medium,
    marginBottom: theme.spacing.medium,
  },
  waifuDetails: {
    flex: 1,
    minWidth: 160,
  },
  waifuName: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.large,
    fontWeight: theme.typography.weights.bold,
    marginBottom: theme.spacing.xsmall,
  },
  waifuCatch: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.sizes.small,
    marginBottom: theme.spacing.small,
  },
  traitRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: theme.spacing.medium,
  },
  traitBadge: {
    backgroundColor: "rgba(252,191,73,0.18)",
    borderRadius: theme.radius.pill,
    paddingHorizontal: theme.spacing.small,
    paddingVertical: theme.spacing.xsmall,
    marginRight: theme.spacing.small,
    marginBottom: theme.spacing.small,
  },
  traitText: {
    color: theme.colors.primary,
    fontSize: theme.typography.sizes.small - 1,
    fontWeight: theme.typography.weights.medium,
  },
  buttonRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  actionButton: {
    paddingHorizontal: theme.spacing.medium,
    paddingVertical: theme.spacing.small,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    marginRight: theme.spacing.small,
    marginBottom: theme.spacing.small,
  },
  actionPrimary: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  actionSecondary: {
    backgroundColor: "rgba(91,95,247,0.35)",
    borderColor: "rgba(91,95,247,0.6)",
  },
  actionGhost: {
    backgroundColor: "transparent",
  },
  actionText: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.small,
    fontWeight: theme.typography.weights.medium,
  },
  quoteText: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.medium,
    lineHeight: theme.typography.sizes.medium + 10,
    marginBottom: theme.spacing.small,
  },
  quoteSource: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.sizes.small,
    marginBottom: theme.spacing.medium,
  },
  traceDropzone: {
    borderStyle: "dashed",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
    borderRadius: theme.radius.large,
    paddingVertical: theme.spacing.xlarge,
    alignItems: "center",
    justifyContent: "center",
  },
  tracePrompt: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.medium,
    marginBottom: theme.spacing.small,
  },
  traceStatus: {
    color: theme.colors.textSubtle,
    fontSize: theme.typography.sizes.small,
  },
  gameCard: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: theme.radius.medium,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    padding: theme.spacing.medium,
  },
  gameTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.medium,
    fontWeight: theme.typography.weights.bold,
    marginBottom: theme.spacing.small,
  },
  gamePrompt: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.small,
    lineHeight: theme.typography.sizes.small + 6,
    marginBottom: theme.spacing.medium,
  },
  gameOption: {
    borderRadius: theme.radius.medium,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    paddingVertical: theme.spacing.small,
    paddingHorizontal: theme.spacing.medium,
    marginBottom: theme.spacing.small,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  gameOptionActive: {
    borderColor: theme.colors.secondary,
  },
  gameOptionCorrect: {
    borderColor: theme.colors.primary,
    backgroundColor: "rgba(252,191,73,0.2)",
  },
  gameOptionWrong: {
    borderColor: theme.colors.danger,
    backgroundColor: "rgba(230,57,70,0.2)",
  },
  gameOptionText: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.small,
  },
  gameFeedback: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.sizes.small,
    marginBottom: theme.spacing.medium,
  },
  newsItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: theme.spacing.small,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  newsMarker: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.secondary,
    marginTop: theme.spacing.small,
    marginRight: theme.spacing.medium,
  },
  newsCopy: {
    flex: 1,
  },
  newsHeadline: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.small,
    lineHeight: theme.typography.sizes.small + 4,
  },
  newsMeta: {
    color: theme.colors.textSubtle,
    fontSize: theme.typography.sizes.small - 1,
    marginTop: theme.spacing.xsmall,
  },
  newsShare: {
    paddingHorizontal: theme.spacing.small,
    paddingVertical: theme.spacing.xsmall,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    marginLeft: theme.spacing.small,
  },
  newsShareText: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.small - 1,
  },
});

export default miscStyles;
