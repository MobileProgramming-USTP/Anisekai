import { StyleSheet } from "react-native";

import { theme } from "./theme";

const ACCENT = "#FFB300";
const BASE_BACKGROUND = "#0b141f";
const PANEL_BACKGROUND = "#2B3E57";

const profileStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BASE_BACKGROUND,
  },
  content: {
    paddingBottom: theme.spacing.xlarge * 2,
  },
  coverContainer: {
    backgroundColor: "#1E2A3A",
    paddingHorizontal: theme.spacing.large,
    paddingTop: theme.spacing.xlarge,
    paddingBottom: 0,
  },
  coverProfileRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginBottom: theme.spacing.large,
  },
  avatarFrame: {
    width: 120,
    height: 120,
    borderRadius: 18,
    overflow: "hidden",
    marginRight: theme.spacing.medium,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
    backgroundColor: "#0f172a",
  },
  avatarFrameDisabled: {
    opacity: 0.5,
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  profileDetails: {
    flex: 1,
    justifyContent: "center",
  },
  username: {
    fontSize: theme.typography.sizes.xlarge,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
  },
  email: {
    fontSize: theme.typography.sizes.small,
    color: "rgba(255, 255, 255, 0.75)",
    marginTop: theme.spacing.xsmall,
  },
  tabStrip: {
    flexDirection: "row",
    backgroundColor: PANEL_BACKGROUND,
    paddingHorizontal: 0,
    paddingVertical: theme.spacing.small + 2,
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.05)",
  },
  tabButton: {
    flex: 1,
    paddingVertical: theme.spacing.small + 2,
    paddingHorizontal: theme.spacing.small,
    alignItems: "center",
    justifyContent: "center",
  },
  tabButtonActive: {},
  tabButtonDisabled: {
    opacity: 0.4,
  },
  tabLabel: {
    fontSize: theme.typography.sizes.medium,
    fontWeight: theme.typography.weights.medium,
    color: "rgba(216, 224, 232, 0.75)",
  },
  tabLabelActive: {
    color: ACCENT,
    fontWeight: theme.typography.weights.bold,
  },
  tabLabelDisabled: {
    color: "rgba(216, 224, 232, 0.45)",
  },
  statsBlock: {
    paddingHorizontal: theme.spacing.large,
    marginTop: theme.spacing.large,
    marginBottom: theme.spacing.medium,
  },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 18,
    paddingVertical: theme.spacing.medium,
    paddingHorizontal: theme.spacing.large,
    marginBottom: theme.spacing.medium,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  statRowPrimary: {
    backgroundColor: PANEL_BACKGROUND,
  },
  statRowSecondary: {
    backgroundColor: "#25364a",
  },
  statRowLast: {
    marginBottom: 0,
  },
  statSegment: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  statSegmentDivider: {
    borderLeftWidth: 1,
    borderLeftColor: "rgba(255, 255, 255, 0.1)",
    paddingLeft: theme.spacing.large,
  },
  statValue: {
    fontSize: theme.typography.sizes.large,
    fontWeight: theme.typography.weights.bold,
    color: ACCENT,
  },
  statLabel: {
    fontSize: theme.typography.sizes.small,
    color: "rgba(255, 255, 255, 0.75)",
    marginTop: 4,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  sectionHeader: {
    paddingHorizontal: theme.spacing.large,
    marginTop: theme.spacing.large,
    marginBottom: theme.spacing.small,
  },
  sectionBlock: {
    paddingHorizontal: theme.spacing.large,
    marginTop: theme.spacing.large,
    marginBottom: theme.spacing.large,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.large,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
  },
  sectionTitleAccent: {
    color: ACCENT,
  },
  sectionSubtitle: {
    fontSize: theme.typography.sizes.small,
    color: "rgba(255, 255, 255, 0.65)",
    marginTop: theme.spacing.xsmall,
  },
  activityList: {
    paddingHorizontal: theme.spacing.large,
    marginTop: theme.spacing.small,
    marginBottom: theme.spacing.large,
  },
  activityCard: {
    flexDirection: "row",
    backgroundColor: PANEL_BACKGROUND,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
    marginBottom: theme.spacing.small,
  },
  activityImageWrapper: {
    width: 72,
    backgroundColor: "#243042",
  },
  activityImage: {
    flex: 1,
  },
  activityPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#243042",
  },
  activityPlaceholderText: {
    fontSize: theme.typography.sizes.medium,
    fontWeight: theme.typography.weights.bold,
    color: ACCENT,
  },
  activityContent: {
    flex: 1,
    paddingVertical: theme.spacing.medium,
    paddingHorizontal: theme.spacing.medium,
    justifyContent: "center",
  },
  activityHeadlineRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-end",
    marginBottom: 2,
  },
  activityHeadline: {
    fontSize: theme.typography.sizes.medium,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.text,
    flexShrink: 1,
  },
  activityHighlight: {
    color: ACCENT,
    fontWeight: theme.typography.weights.bold,
    flexShrink: 1,
  },
  activityMeta: {
    fontSize: theme.typography.sizes.small,
    color: "rgba(255, 255, 255, 0.65)",
    marginTop: theme.spacing.xsmall,
  },
  emptyStateCard: {
    marginTop: theme.spacing.small,
    marginBottom: theme.spacing.large,
    backgroundColor: PANEL_BACKGROUND,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
    padding: theme.spacing.large,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyStateText: {
    fontSize: theme.typography.sizes.small,
    color: "rgba(255, 255, 255, 0.65)",
    textAlign: "center",
    lineHeight: 20,
  },
  libraryCard: {
    flexDirection: "row",
    backgroundColor: PANEL_BACKGROUND,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
    marginBottom: theme.spacing.small,
  },
  libraryImageWrapper: {
    width: 82,
    backgroundColor: "#243042",
  },
  libraryImage: {
    flex: 1,
  },
  libraryImagePlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#243042",
  },
  libraryImagePlaceholderText: {
    fontSize: theme.typography.sizes.large,
    fontWeight: theme.typography.weights.bold,
    color: ACCENT,
  },
  libraryCardBody: {
    flex: 1,
    paddingVertical: theme.spacing.medium,
    paddingHorizontal: theme.spacing.medium,
    justifyContent: "center",
  },
  libraryTitle: {
    fontSize: theme.typography.sizes.medium,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
  },
  libraryMeta: {
    fontSize: theme.typography.sizes.small,
    color: "rgba(255, 255, 255, 0.7)",
    marginTop: theme.spacing.xsmall,
  },
  logoutButton: {
    backgroundColor: theme.colors.danger,
    paddingVertical: theme.spacing.medium,
    borderRadius: theme.radius.pill,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: theme.spacing.large,
    marginTop: theme.spacing.large,
    marginBottom: theme.spacing.large,
  },
  logoutButtonDisabled: {
    opacity: 0.5,
  },
  logoutText: {
    fontSize: theme.typography.sizes.medium,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
  },
});

export default profileStyles;
