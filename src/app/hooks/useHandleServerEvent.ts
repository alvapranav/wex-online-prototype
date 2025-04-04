"use client";

import { ServerEvent, SessionStatus, AgentConfig } from "@/app/types";
import { useTranscript } from "@/app/contexts/TranscriptContext";
import { useEvent } from "@/app/contexts/EventContext";
import { useRef, useCallback, useEffect } from "react";

export interface UseHandleServerEventParams {
  setSessionStatus: (status: SessionStatus) => void;
  selectedAgentName: string;
  selectedAgentConfigSet: AgentConfig[] | null;
  sendClientEvent: (eventObj: any, eventNameSuffix?: string) => void;
  setSelectedAgentName: (name: string) => void;
  onAgentResponse?: (text: string) => void;
  setIsTyping?: (isTyping: boolean) => void;
  onShowUIComponent?: (componentName: string, params?: any) => void;
}

export function useHandleServerEvent({
  setSessionStatus,
  selectedAgentName,
  selectedAgentConfigSet,
  sendClientEvent,
  setSelectedAgentName,
  onAgentResponse,
  setIsTyping,
  onShowUIComponent
}: UseHandleServerEventParams) {
  const {
    transcriptItems,
    addTranscriptBreadcrumb,
    addTranscriptMessage,
    updateTranscriptMessage,
    updateTranscriptItemStatus,
  } = useTranscript();

  const { logServerEvent } = useEvent();

  const handleFunctionCall = async (functionCallParams: {
    name: string;
    call_id?: string;
    arguments: string;
  }) => {
    const args = JSON.parse(functionCallParams.arguments);
    const currentAgent = selectedAgentConfigSet?.find(
      (a) => a.name === selectedAgentName
    );
  
    addTranscriptBreadcrumb(`function call: ${functionCallParams.name}`, args);
  
    // List of tool names to be routed through the API endpoint.
    const apiRoutedTools = [
      "display_purchase_controls_ui",
      "display_statement_summary_ui",
      "transferAgents",
      "route_to_human",
      "send_text_link",
      "generate_virtual_card"
    ];
  
    if (apiRoutedTools.includes(functionCallParams.name)) {
      console.log(`Routing ${functionCallParams.name} via API`);
      try {
        const res = await fetch("/api/tools", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tool_name: functionCallParams.name,
            tool_params: args,
          }),
        });
        const data = await res.json();
        if (data.success) {
          // For UI tools, handle via onShowUIComponent.
          if (
            (functionCallParams.name === "display_purchase_controls_ui" ||
              functionCallParams.name === "display_statement_summary_ui") &&
            onShowUIComponent
          ) {
            console.log("Calling onShowUIComponent with:", data.displayUI, data.params || args);
            onShowUIComponent(data.displayUI, data.params || args);
          }
          // For transferAgents, update the selected agent.
          if (functionCallParams.name === "transferAgents" && data.transfer_to) {
            setSelectedAgentName(data.transfer_to);
          }
          // For generate_virtual_card, build a custom message that includes the full card details.
          if (functionCallParams.name === "generate_virtual_card") {
            sendClientEvent({
              type: "conversation.item.create",
              item: {
                type: "function_call_output",
                call_id: functionCallParams.call_id,
                output: JSON.stringify({
                  name: functionCallParams.name,
                  arguments: data,
                }),
              },
            });
            addTranscriptBreadcrumb(
              `function call: ${functionCallParams.name} response`,
              data
            );
            sendClientEvent({ type: "response.create" });
          } else {
            // For all other routed tools, send the API response directly.
            sendClientEvent({
              type: "conversation.item.create",
              item: {
                type: "function_call_output",
                call_id: functionCallParams.call_id,
                output: JSON.stringify(data),
              },
            });
            addTranscriptBreadcrumb(
              `function call: ${functionCallParams.name} response`,
              data
            );
          }
        } else {
          console.error("Tool API error:", data.error);
        }
      } catch (err) {
        console.error(`Error calling tools API for ${functionCallParams.name}:`, err);
      }
      return;
    } else if (currentAgent?.toolLogic?.[functionCallParams.name]) {
      // Fall back to local tool logic if defined.
      const fn = currentAgent.toolLogic[functionCallParams.name];
      const fnResult = await fn(args, transcriptItems);
      addTranscriptBreadcrumb(
        `function call result: ${functionCallParams.name}`,
        fnResult
      );
      sendClientEvent({
        type: "conversation.item.create",
        item: {
          type: "function_call_output",
          call_id: functionCallParams.call_id,
          output: JSON.stringify(fnResult),
        },
      });
      sendClientEvent({ type: "response.create" });
    } else {
      // Fallback for unknown tool calls.
      const simulatedResult = { result: true };
      addTranscriptBreadcrumb(
        `function call fallback: ${functionCallParams.name}`,
        simulatedResult
      );
      sendClientEvent({
        type: "conversation.item.create",
        item: {
          type: "function_call_output",
          call_id: functionCallParams.call_id,
          output: JSON.stringify(simulatedResult),
        },
      });
      sendClientEvent({ type: "response.create" });
    }
  };  

  const handleServerEvent = useCallback((serverEvent: ServerEvent) => {
    logServerEvent(serverEvent);

    switch (serverEvent.type) {
      case "session.created": {
        if (serverEvent.session?.id) {
          setSessionStatus("CONNECTED");
          addTranscriptBreadcrumb(
            `session.id: ${serverEvent.session.id
            }\nStarted at: ${new Date().toLocaleString()}`
          );
        }
        break;
      }

      case "conversation.item.created": {
        let text =
          serverEvent.item?.content?.[0]?.text ||
          serverEvent.item?.content?.[0]?.transcript ||
          "";
        const role = serverEvent.item?.role as "user" | "assistant";
        const itemId = serverEvent.item?.id;

        if (itemId && transcriptItems.some((item) => item.itemId === itemId)) {
          break;
        }

        if (itemId && role) {
          if (role === "user" && !text) {
            text = "[Transcribing...]";
          }
          addTranscriptMessage(itemId, role, text);

          if (role === "assistant" && text && onAgentResponse) {
            onAgentResponse(text);
          }
        }
        break;
      }

      case "conversation.item.input_audio_transcription.completed": {
        const itemId = serverEvent.item_id;
        const finalTranscript =
          !serverEvent.transcript || serverEvent.transcript === "\n"
            ? "[inaudible]"
            : serverEvent.transcript;
        if (itemId) {
          updateTranscriptMessage(itemId, finalTranscript, false);
        }
        break;
      }

      case "response.audio_transcript.delta": {
        const itemId = serverEvent.item_id;
        const deltaText = serverEvent.delta || "";
        if (itemId) {
          updateTranscriptMessage(itemId, deltaText, true);

          if (deltaText && onAgentResponse) {
            onAgentResponse(deltaText);
          }
        }
        break;
      }

      case "response.start": {
        if (setIsTyping) {
          setIsTyping(true);
        }
        break;
      }

      case "response.done": {
        if (setIsTyping) {
          setIsTyping(false);
        }

        if (serverEvent.response?.output) {
          serverEvent.response.output.forEach((outputItem) => {
            if (
              outputItem.type === "function_call" &&
              outputItem.name &&
              outputItem.arguments
            ) {
              handleFunctionCall({
                name: outputItem.name,
                call_id: outputItem.call_id,
                arguments: outputItem.arguments,
              });
            }
          });
        }
        break;
      }

      case "response.output_item.done": {
        const itemId = serverEvent.item?.id;
        if (itemId) {
          updateTranscriptItemStatus(itemId, "DONE");
        }
        break;
      }

      default:
        break;
    }
  }, [
    logServerEvent,
    setSessionStatus,
    addTranscriptBreadcrumb,
    addTranscriptMessage,
    updateTranscriptMessage,
    updateTranscriptItemStatus,
    transcriptItems,
    selectedAgentConfigSet,
    selectedAgentName,
    setSelectedAgentName,
    sendClientEvent,
    onAgentResponse,
    setIsTyping,
  ]);

  const handleServerEventRef = useRef(handleServerEvent);

  useEffect(() => {
    handleServerEventRef.current = handleServerEvent;
  }, [handleServerEvent]);

  return handleServerEventRef;
}
