import type { AgentTool, Evidence, LateReason, RecommendedAction } from "@/types";

/** The steps every investigation walks through, in order. The agent service animates these. */
export const INVESTIGATION_STEPS: Array<{
  id: string;
  label: string;
  tool?: AgentTool;
  running: string;
}> = [
  {
    id: "invoice",
    label: "Retrieved invoice",
    tool: "get_invoice",
    running: "Loading invoice from Xero",
  },
  {
    id: "customer",
    label: "Retrieved customer history",
    tool: "get_customer",
    running: "Loading customer record",
  },
  {
    id: "payments",
    label: "Checked payment history",
    tool: "get_payment_history",
    running: "Analysing payment behaviour",
  },
  {
    id: "emails",
    label: "Searched customer emails",
    tool: "search_customer_emails",
    running: "Analysing customer communications",
  },
  {
    id: "terms",
    label: "Checked payment terms",
    tool: "get_contract",
    running: "Reading contract and payment terms",
  },
  {
    id: "compare",
    label: "Compared previous invoices",
    tool: "compare_invoices",
    running: "Comparing with previous invoices",
  },
  {
    id: "finding",
    label: "Identified likely reason",
    tool: "draft_action",
    running: "Generating recommendation",
  },
];

/** Outcome an investigation reaches once all steps have run. */
export interface InvestigationOutcome {
  likelyReason: LateReason;
  finding: string;
  confidence: number;
  evidence: Evidence[];
  recommendation: RecommendedAction;
  /** Overrides for specific step labels, e.g. how many emails were searched */
  stepDetails?: Partial<Record<string, string>>;
  finalStepLabel?: string;
}

/** Pre-written demo outcomes removed — live invoices use the rule-based generic path. */
export const investigationOutcomes: Record<string, InvestigationOutcome> = {};
