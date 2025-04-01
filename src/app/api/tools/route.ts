import { NextRequest, NextResponse } from "next/server";

function handleRouteToHuman(params: any) {
    const { queue_id, queue_name, reason } = params;

    // In a real implementation, this would integrate with your routing system
    console.log(`Routing to human agent in Queue ${queue_id} (${queue_name}): ${reason}`);

    return {
        success: true,
        message: `✅ Successfully routed to Queue ${queue_id} (${queue_name})`,
        queue_id,
        queue_name
    };
}

function handleSendTextLink(params: any) {
    const { phone_number, link_type } = params;

    // In a real implementation, this would send an actual text message
    let link = "";
    let description = "";

    switch (link_type) {
        case "replacement_card":
            link = "https://wex.com/account/order-replacement";
            description = "replacement card order form";
            break;
        case "account_management":
            link = "https://wex.com/account/manage";
            description = "account management portal";
            break;
        case "payment_portal":
            link = "https://wex.com/payments";
            description = "payment portal";
            break;
        case "virtual_card":
            link = "https://wex.com/virtual-cards";
            description = "virtual card generator";
            break;
    }

    console.log(`Sending ${description} link to ${phone_number}: ${link}`);

    return {
        success: true,
        message: `Text message with ${description} link sent to ${phone_number}`,
        phone_number,
        link_type,
        link
    };
}

function handleGenerateVirtualCard(params: any) {
    const { merchant_location_id, wex_card_number, vehicle_id } = params;

    // In a real implementation, this would call your card generation API
    // Here we're generating mock data
    const last4 = Math.floor(1000 + Math.random() * 9000).toString();
    const expirationMonth = Math.floor(1 + Math.random() * 12).toString().padStart(2, '0');
    const expirationYear = (new Date().getFullYear() + 3).toString().slice(-2);

    console.log(`Generated virtual card for merchant ${merchant_location_id}, card ${wex_card_number}, vehicle ${vehicle_id}`);

    return {
        success: true,
        card_number_last4: last4,
        expiration_date: `${expirationMonth}/${expirationYear}`,
        merchant_location_id,
        wex_card_number,
        vehicle_id
    };
}

function handleDisplayPurchaseControlsUI(params: any) {
    console.log("Request received to display Purchase Controls UI", params);
    return {
        success: true,
        message: "Displaying purchase controls interface.", // Message for system/debug log
        displayUI: "purchaseControls", // Signal to frontend
        params: params // Pass any params received (like 'preset') back to frontend if needed
    };
}

function handleDisplayStatementSummaryUI(params: any) {
    console.log("Request received to display Statement Summary UI", params);
    return {
        success: true,
        message: "Displaying statement summary interface.", // Message for system/debug log
        displayUI: "statementSummary", // Signal to frontend
        params: params // Pass any params received (like 'period') back to frontend if needed
    };
}

function handleTransferAgent(params: any) {
    const { destination_agent, rationale_for_transfer, conversation_context } = params;
    console.log(`AI requested transfer to Agent: ${destination_agent}`);
    console.log(`Rationale: ${rationale_for_transfer}`);
    console.log(`Context: ${conversation_context}`);
    return {
        success: true,
        message: `✅ Requesting transfer to ${destination_agent}.`,
        transfer_to: destination_agent, // Signal the target agent to the frontend
        rationale: rationale_for_transfer
    };
}

export async function POST(req: NextRequest) {
    const { tool_name, tool_params } = await req.json();

    try {
        let response;

        switch (tool_name) {
            case "route_to_human":
                response = handleRouteToHuman(tool_params);
                break;
            case "send_text_link":
                response = handleSendTextLink(tool_params);
                break;
            case "generate_virtual_card":
                response = handleGenerateVirtualCard(tool_params);
                break;
            // *** ADD CASES for UI Display ***
            case "display_purchase_controls_ui":
                response = handleDisplayPurchaseControlsUI(tool_params);
                break;
            case "display_statement_summary_ui":
                response = handleDisplayStatementSummaryUI(tool_params);
                break;
            case "transferAgents":
                response = handleTransferAgent(tool_params);
                break;
            default:
                console.warn(`Received unknown tool request: ${tool_name}`); // Log warning
                return NextResponse.json(
                    { error: `Unknown tool: ${tool_name}` },
                    { status: 400 }
                );
        }

        // Log the successful response being sent back
        console.log(`Tool '${tool_name}' executed successfully, responding to frontend.`);
        return NextResponse.json(response);

    } catch (error) {
        console.error(`Error handling tool ${tool_name}:`, error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        return NextResponse.json(
            { error: `Failed to execute tool ${tool_name}: ${errorMessage}` },
            { status: 500 }
        );
    }
}