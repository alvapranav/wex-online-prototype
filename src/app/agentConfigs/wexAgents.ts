import { AgentConfig } from "@/app/types";
import { injectTransferTools } from "./utils"

// Define the human agent routing tools
const routeToHumanTool = {
  type: "function" as const,
  name: "route_to_human",
  description: "Route the conversation to a human agent in a specific queue",
  parameters: {
    type: "object",
    properties: {
      queue_id: {
        type: "string",
        description: "The ID of the queue to route to",
        enum: ["001", "002", "003", "004", "005"]
      },
      queue_name: {
        type: "string",
        description: "The name of the queue",
        enum: ["Fraud Support", "SmartFunds Support", "Replacement Cards Support", "General Support", "Technical Support"]
      },
      reason: {
        type: "string",
        description: "The reason for routing to a human agent"
      }
    },
    required: ["queue_id", "queue_name", "reason"]
  }
};

const sendTextLinkTool = {
  type: "function" as const,
  name: "send_text_link",
  description: "Send a text message with a link to the user's phone number",
  parameters: {
    type: "object",
    properties: {
      phone_number: {
        type: "string",
        description: "The phone number to send the text to"
      },
      link_type: {
        type: "string",
        description: "The type of link to send",
        enum: ["replacement_card", "account_management", "payment_portal", "virtual_card"]
      }
    },
    required: ["phone_number", "link_type"]
  }
};

const generateVirtualCardTool = {
  type: "function" as const,
  name: "generate_virtual_card",
  description: "Generate a virtual card for merchant payment",
  parameters: {
    type: "object",
    properties: {
      merchant_location_id: {
        type: "string",
        description: "The merchant location ID"
      },
      wex_card_number: {
        type: "string",
        description: "The WEX card number"
      },
      vehicle_id: {
        type: "string",
        description: "The vehicle ID"
      }
    },
    required: ["merchant_location_id", "wex_card_number", "vehicle_id"]
  }
};

const displayPurchaseControlsUITool = {
  type: "function" as const,
  name: "display_purchase_controls_ui",
  description: "Displays the interactive UI for creating or adjusting purchase control profiles. Use this when the user explicitly asks to set limits, adjust controls, or create a new purchase profile.",
  parameters: {
    type: "object",
    properties: {
      preset: {
        type: "string",
        description: "Optional: The type of preset to potentially pre-fill (e.g., 'Hurricane', 'Standard').",
        required: [],
      }
    }
  }
};

const displayStatementSummaryUITool = {
  type: "function" as const,
  name: "display_statement_summary_ui",
  description: "Displays the interactive UI summarizing the latest billing statement. Use this when the user explicitly asks to view their statement, bill, or statement summary.",
  parameters: {
    type: "object",
    properties: {
      period: {
        type: "string",
        description: "Optional: The specific statement period requested (e.g., 'March 2025', 'latest').",
        required: [],
      }
    }
  }
};

// Define agents
const fraudAlertAgent: AgentConfig = {
  name: "Fraud Agent",
  publicDescription: "Agent that handles fraud alerts and suspicious transactions.",
  instructions: `
    You are a WEX customer service AI assistant specializing in fraud alerts.
    Your primary goal is to quickly identify fraud-related issues and route them to human agents.
    When a user mentions fraud, suspicious transactions, or unauthorized charges:
    1. Express understanding of the urgency.
    2. Inform them you'll connect them to a fraud specialist.
    3. Use the route_to_human tool to route to Queue 001 (Fraud Support).
    Do not attempt to handle fraud issues yourself. These require human intervention.
    Be professional, empathetic, and concise.
  `,
  tools: [routeToHumanTool],
};

const smartFundsAgent: AgentConfig = {
  name: "Smartfunds Agent",
  publicDescription: "Agent that handles SmartFunds balance inquiries.",
  instructions: `
    You are a WEX customer service AI assistant specializing in SmartFunds inquiries.
    
    When a user asks about checking their SmartFunds balance:
    1. Acknowledge their request
    2. Inform them you'll connect them to a SmartFunds specialist
    3. Use the route_to_human tool to route to Queue 002 (SmartFunds Support)
    
    SmartFunds balance information requires authentication and human assistance.
    
    Be professional, helpful, and concise in your responses.
  `,
  tools: [routeToHumanTool],
};

const replacementCardAgent: AgentConfig = {
  name: "Replacement Card Agent",
  publicDescription: "Agent that handles replacement card requests.",
  instructions: `
    You are a WEX customer service AI assistant specializing in card replacement requests.
    When a user needs a replacement card:
    1. Offer to send them a direct link to order a replacement card via text using the 'send_text_link' tool with the "replacement_card" link type. Ask for their phone number if needed.
    2. Confirm the link has been sent.
    3. If they need additional help after receiving the link, or if they cannot use the link, offer to connect them to a human agent using the 'route_to_human' tool with Queue 003 (Replacement Cards Support).
    Be professional, efficient, and helpful.
  `,
  tools: [routeToHumanTool, sendTextLinkTool],
};

const virtualCardAgent: AgentConfig = {
  name: "Virtual Card Agent",
  publicDescription: "Agent that helps generate virtual cards for merchant payments.",
  instructions: `
    You are a WEX customer service AI assistant specializing in virtual card generation.
    When a user needs to generate a virtual card:
    1. Inform them you can help.
    2. Request the necessary information: Merchant Location ID, WEX Card Number, Vehicle ID.
    3. Once you have the information, use the 'generate_virtual_card' tool.
    4. Present the result (last 4 digits, expiration) clearly to the user.
    If the user doesn't have all the required info or needs further help, offer to connect them to a human agent using 'route_to_human' tool with Queue 004 (General Support).
    Be professional and security-conscious.
  `,
  tools: [routeToHumanTool, generateVirtualCardTool],
};

const mainAgent: AgentConfig = {
  name: "Main Agent",
  publicDescription: "Main WEX customer service agent that routes to specialized agents or handles general inquiries.",
  instructions: `
    You are WEX IQ, an AI assistant for WEX fleet card customers. Your role is to understand the user's need and take the appropriate action.

    Available Actions:
    1.  **Transfer to Specialized AI Agent:** If the query is clearly about fraud, SmartFunds, replacement cards, or virtual card generation, use the 'transferAgents' tool to route to the corresponding agent ('fraud_alert', 'smartfunds', 'replacement_card', 'virtual_card'). Explain why you are transferring.
    2.  **Display Interactive UI:**
        *   If the user wants to adjust purchase controls, set limits, or create purchase profiles, use the 'display_purchase_controls_ui' tool.
        *   If the user wants to view their statement summary or bill, use the 'display_statement_summary_ui' tool.
    3.  **Use Direct Tools:**
        *   If the user wants a link texted for account management or payments, use the 'send_text_link' tool (types: 'account_management', 'payment_portal'). Ask for the phone number if needed.
    4.  **Route to Human:** For complex issues, requests for information you cannot provide (like specific balances requiring authentication beyond your scope), or if the user explicitly requests a human, use the 'route_to_human' tool. Choose the most appropriate queue ('Fraud Support', 'SmartFunds Support', 'Replacement Cards Support', 'General Support', 'Technical Support'). Explain why you are routing them.
    5.  **Answer Directly:** For general questions about WEX services, policies, or how to use features that don't require specific tools or transfers, provide a helpful and concise answer.

    Interaction Flow:
    - Greet the user and ask how you can help.
    - Analyze the user's request.
    - Choose the single best action from the list above.
    - Before transferring or routing to human, inform the user.
    - After using a tool (like sending a link or displaying UI), confirm the action was taken and ask if further assistance is needed.
    - Be professional, helpful, and efficient.
  `,

  tools: [
    routeToHumanTool,
    sendTextLinkTool,
    displayPurchaseControlsUITool,
    displayStatementSummaryUITool,
  ],
  downstreamAgents: [fraudAlertAgent, smartFundsAgent, replacementCardAgent, virtualCardAgent],
};

// Add the transfer tool to point to downstreamAgents
// --- Inject transfer tool and export ---
const agents = injectTransferTools([mainAgent, fraudAlertAgent, smartFundsAgent, replacementCardAgent, virtualCardAgent]);

export default agents;