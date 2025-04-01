import { AllAgentConfigsType } from "@/app/types";
import wexAgents from "./wexAgents";

export const allAgentSets: AllAgentConfigsType = {
  wexFleet: wexAgents,
};

export const defaultAgentSetKey = "wexFleet";
