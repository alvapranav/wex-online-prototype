"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { v4 as uuidv4 } from "uuid";

import Image from "next/image";
import { Button } from "@/app/components/ui/button";

// UI components
import Transcript from "./components/Transcript";
import Events from "./components/Events";
import BottomToolbar from "./components/BottomToolbar";
import { ChatWindow } from "./components/ChatWindow";
import { PurchaseControlsUI } from "./components/PurchaseControlsUI";
import { StatementSummaryUI } from "./components/StatementSummaryUI";

// Types
import { AgentConfig, SessionStatus } from "@/app/types";

// Context providers & hooks
import { useTranscript } from "@/app/contexts/TranscriptContext";
import { useEvent } from "@/app/contexts/EventContext";
import { useHandleServerEvent } from "./hooks/useHandleServerEvent";

// Utilities
import { createRealtimeConnection } from "./lib/realtimeConnection";

// Agent configs
import { allAgentSets, defaultAgentSetKey } from "@/app/agentConfigs";

function App() {
  const searchParams = useSearchParams();

  const { transcriptItems, addTranscriptMessage, addTranscriptBreadcrumb } =
    useTranscript();
  const { logClientEvent, logServerEvent } = useEvent();

  const [selectedAgentName, setSelectedAgentName] = useState<string>("");
  const [selectedAgentConfigSet, setSelectedAgentConfigSet] =
    useState<AgentConfig[] | null>(null);

  const [dataChannel, setDataChannel] = useState<RTCDataChannel | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const [sessionStatus, setSessionStatus] =
    useState<SessionStatus>("DISCONNECTED");
  const prevStatusRef = useRef<SessionStatus>(sessionStatus);
  const processedAgentRef = useRef<string | null>(null);

  const [isEventsPaneExpanded, setIsEventsPaneExpanded] =
    useState<boolean>(true);
  const [userText, setUserText] = useState<string>("");
  const [isPTTActive, setIsPTTActive] = useState<boolean>(true);
  const [isPTTUserSpeaking, setIsPTTUserSpeaking] = useState<boolean>(false);
  const [isAudioPlaybackEnabled, setIsAudioPlaybackEnabled] =
    useState<boolean>(false);

  const [isChatVisible, setIsChatVisible] = useState<boolean>(false);

  const [chatView, setChatView] = useState<"initial" | "conversation">("initial");
  const [chatMessages, setChatMessages] = useState<Array<{
    id: string;
    sender: "user" | "bot" | "system";
    text: string;
    timestamp: string;
    isLoading?: boolean;
    type?: 'message' | 'separator';
  }>>([]);
  const [chatInput, setChatInput] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [suggestions, setSuggestions] = useState<Array<{ text: string; action?: string }>>([
    { text: "How do I adjust my purchase controls?" },
    { text: "Can I see my recent transactions?" },
    { text: "What's my current balance?" }
  ]);

  const currentBotMessageIdRef = useRef<string | null>(null);
  const messageBufferRef = useRef<string>("");

  const [activeUIComponent, setActiveUIComponent] = useState<string | null>(null);

  const handleShowUIComponent = (componentName: string, params?: any) => {
    console.log("Setting active UI component:", componentName);
    console.log("With params:", params);
    setActiveUIComponent(componentName);
  };

  const sendClientEvent = (eventObj: any, eventNameSuffix = "") => {
    if (dcRef.current && dcRef.current.readyState === "open") {
      logClientEvent(eventObj, eventNameSuffix);
      dcRef.current.send(JSON.stringify(eventObj));
    } else {
      logClientEvent(
        { attemptedEvent: eventObj.type },
        "error.data_channel_not_open"
      );
      console.error(
        "Failed to send message - no data channel available",
        eventObj
      );
    }
  };

  const handleServerEventRef = useHandleServerEvent({
    setSessionStatus,
    selectedAgentName,
    selectedAgentConfigSet,
    sendClientEvent,
    setSelectedAgentName,
    onAgentResponse: (text) => {
      if (isChatVisible) {
        messageBufferRef.current += text;
        if (!currentBotMessageIdRef.current) {
          const botMessageId = uuidv4();
          currentBotMessageIdRef.current = botMessageId;
          const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          setChatMessages(prev => [...prev, { id: botMessageId, sender: "bot", text: text, timestamp: timestamp }]);
        } else {
          setChatMessages(prev => prev.map(msg => msg.id === currentBotMessageIdRef.current ? { ...msg, text: messageBufferRef.current } : msg));
        }
      }
    },
    setIsTyping: (isTypingUpdate) => {
      setIsTyping(isTypingUpdate);
      if (!isTypingUpdate) {
        if (currentBotMessageIdRef.current && messageBufferRef.current) {
          setChatMessages(prev => prev.map(msg => msg.id === currentBotMessageIdRef.current ? { ...msg, text: messageBufferRef.current } : msg));
        }
        messageBufferRef.current = "";
        currentBotMessageIdRef.current = null;
      }
    },
    onShowUIComponent: handleShowUIComponent,
  });

  useEffect(() => {
    let finalAgentConfig = searchParams.get("agentConfig");
    if (!finalAgentConfig || !allAgentSets[finalAgentConfig]) {
      finalAgentConfig = defaultAgentSetKey;
      const url = new URL(window.location.toString());
      url.searchParams.set("agentConfig", finalAgentConfig);
      window.location.replace(url.toString());
      return;
    }

    const agents = allAgentSets[finalAgentConfig];
    const agentKeyToUse = agents[0]?.name || "";

    setSelectedAgentName(agentKeyToUse);
    setSelectedAgentConfigSet(agents);
  }, [searchParams]);

  useEffect(() => {
    if (!isChatVisible || sessionStatus === "DISCONNECTED") {
      setActiveUIComponent(null);
    }
  }, [isChatVisible, sessionStatus]);

  useEffect(() => {
    if (selectedAgentName && sessionStatus === "DISCONNECTED" && isChatVisible) {
      connectToRealtime();
    }
  }, [selectedAgentName, isChatVisible]);

  useEffect(() => {
    if (sessionStatus === "CONNECTED" && selectedAgentConfigSet && selectedAgentName) {
      if (processedAgentRef.current !== selectedAgentName) {
        console.log(`Processing agent change/connect for: ${selectedAgentName}`);

        const separatorText = `Connected to ${selectedAgentName}`;
        setChatMessages(prev => {
          const lastMessage = prev[prev.length - 1];
          if (!lastMessage || !(lastMessage.type === 'separator' && lastMessage.text === separatorText)) {
            console.log("Adding separator message.");
            return [...prev, {
              id: uuidv4(), sender: 'system', type: 'separator', text: separatorText, timestamp: new Date().toISOString()
            }];
          }
          return prev;
        });

        const currentAgent = selectedAgentConfigSet.find(a => a.name === selectedAgentName);
        const breadcrumbText = `Agent: ${selectedAgentName}`;
        if (!transcriptItems.some(item => item.type === 'BREADCRUMB' && item.title === breadcrumbText)) {
          addTranscriptBreadcrumb(breadcrumbText, currentAgent);
        }

        console.log("Updating session and triggering greeting for new agent.");
        updateSession(true);

        processedAgentRef.current = selectedAgentName;
      }
      else {
        // Example: Maybe update session context *without* greeting if only config changes?
        // updateSession(false); // Decide if this is needed on non-agent-change updates
        // console.log(`Agent ${selectedAgentName} already processed, skipping separator/greeting.`);
      }

    } else if (sessionStatus !== "CONNECTED") {
      if (processedAgentRef.current !== null) {
        console.log("Disconnected, resetting processed agent ref.");
        processedAgentRef.current = null;
      }
    }

  }, [selectedAgentConfigSet, selectedAgentName, sessionStatus, addTranscriptBreadcrumb])

  useEffect(() => {
    if (sessionStatus === "CONNECTED") {
      console.log(
        `updatingSession, isPTTACtive=${isPTTActive} sessionStatus=${sessionStatus}`
      );
      updateSession();
    }
  }, [isPTTActive]);

  const fetchEphemeralKey = async (): Promise<string | null> => {
    logClientEvent({ url: "/session" }, "fetch_session_token_request");
    const tokenResponse = await fetch("/api/session");
    const data = await tokenResponse.json();
    logServerEvent(data, "fetch_session_token_response");

    if (!data.client_secret?.value) {
      logClientEvent(data, "error.no_ephemeral_key");
      console.error("No ephemeral key provided by the server");
      setSessionStatus("DISCONNECTED");
      return null;
    }

    return data.client_secret.value;
  };

  const connectToRealtime = async () => {
    if (sessionStatus !== "DISCONNECTED") return;
    setSessionStatus("CONNECTING");

    try {
      const EPHEMERAL_KEY = await fetchEphemeralKey();
      if (!EPHEMERAL_KEY) {
        return;
      }

      if (!audioElementRef.current) {
        audioElementRef.current = document.createElement("audio");
      }
      audioElementRef.current.autoplay = isAudioPlaybackEnabled;

      const { pc, dc } = await createRealtimeConnection(
        EPHEMERAL_KEY,
        audioElementRef
      );
      pcRef.current = pc;
      dcRef.current = dc;

      dc.addEventListener("open", () => {
        logClientEvent({}, "data_channel.open");
      });
      dc.addEventListener("close", () => {
        logClientEvent({}, "data_channel.close");
      });
      dc.addEventListener("error", (err: any) => {
        logClientEvent({ error: err }, "data_channel.error");
      });
      dc.addEventListener("message", (e: MessageEvent) => {
        handleServerEventRef.current(JSON.parse(e.data));
      });

      setDataChannel(dc);
    } catch (err) {
      console.error("Error connecting to realtime:", err);
      setSessionStatus("DISCONNECTED");
    }
  };

  const disconnectFromRealtime = () => {
    if (pcRef.current) {
      pcRef.current.getSenders().forEach((sender) => {
        if (sender.track) {
          sender.track.stop();
        }
      });

      pcRef.current.close();
      pcRef.current = null;
    }
    setDataChannel(null);
    setSessionStatus("DISCONNECTED");
    setIsPTTUserSpeaking(false);

    logClientEvent({}, "disconnected");
  };

  const sendSimulatedUserMessage = (text: string) => {
    const id = uuidv4().slice(0, 32);
    addTranscriptMessage(id, "user", text, true);

    sendClientEvent(
      {
        type: "conversation.item.create",
        item: {
          id,
          type: "message",
          role: "user",
          content: [{ type: "input_text", text }],
        },
      },
      "(simulated user text message)"
    );
    sendClientEvent(
      { type: "response.create" },
      "(trigger response after simulated user text message)"
    );
  };

  const updateSession = (shouldTriggerResponse: boolean = false) => {
    sendClientEvent(
      { type: "input_audio_buffer.clear" },
      "clear audio buffer on session update"
    );

    const currentAgent = selectedAgentConfigSet?.find(
      (a) => a.name === selectedAgentName
    );

    const turnDetection = isPTTActive
      ? null
      : {
        type: "server_vad",
        threshold: 0.5,
        prefix_padding_ms: 300,
        silence_duration_ms: 200,
        create_response: true,
      };

    const instructions = currentAgent?.instructions || "";
    const tools = currentAgent?.tools || [];

    const sessionUpdateEvent = {
      type: "session.update",
      session: {
        modalities: ["text", "audio"],
        instructions,
        voice: "coral",
        input_audio_format: "pcm16",
        output_audio_format: "pcm16",
        input_audio_transcription: { model: "whisper-1" },
        turn_detection: turnDetection,
        tools,
      },
    };

    sendClientEvent(sessionUpdateEvent);

    if (shouldTriggerResponse) {
      sendSimulatedUserMessage("hi");
    }
  };

  const cancelAssistantSpeech = async () => {
    const mostRecentAssistantMessage = [...transcriptItems]
      .reverse()
      .find((item) => item.role === "assistant");

    if (!mostRecentAssistantMessage) {
      console.warn("can't cancel, no recent assistant message found");
      return;
    }
    if (mostRecentAssistantMessage.status === "DONE") {
      console.log("No truncation needed, message is DONE");
      return;
    }

    sendClientEvent({
      type: "conversation.item.truncate",
      item_id: mostRecentAssistantMessage?.itemId,
      content_index: 0,
      audio_end_ms: Date.now() - mostRecentAssistantMessage.createdAtMs,
    });
    sendClientEvent(
      { type: "response.cancel" },
      "(cancel due to user interruption)"
    );
  };

  const handleSendTextMessage = () => {
    if (!userText.trim()) return;
    cancelAssistantSpeech();

    sendClientEvent(
      {
        type: "conversation.item.create",
        item: {
          type: "message",
          role: "user",
          content: [{ type: "input_text", text: userText.trim() }],
        },
      },
      "(send user text message)"
    );
    setUserText("");

    sendClientEvent({ type: "response.create" }, "trigger response");
  };

  const handleTalkButtonDown = () => {
    if (sessionStatus !== "CONNECTED" || dataChannel?.readyState !== "open")
      return;
    cancelAssistantSpeech();

    setIsPTTUserSpeaking(true);
    sendClientEvent({ type: "input_audio_buffer.clear" }, "clear PTT buffer");
  };

  const handleTalkButtonUp = () => {
    if (
      sessionStatus !== "CONNECTED" ||
      dataChannel?.readyState !== "open" ||
      !isPTTUserSpeaking
    )
      return;

    setIsPTTUserSpeaking(false);
    sendClientEvent({ type: "input_audio_buffer.commit" }, "commit PTT");
    sendClientEvent({ type: "response.create" }, "trigger response PTT");
  };

  const onToggleConnection = () => {
    if (sessionStatus === "CONNECTED" || sessionStatus === "CONNECTING") {
      disconnectFromRealtime();
      setSessionStatus("DISCONNECTED");
    } else {
      connectToRealtime();
    }
  };

  const handleAgentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newAgentConfig = e.target.value;
    const url = new URL(window.location.toString());
    url.searchParams.set("agentConfig", newAgentConfig);
    window.location.replace(url.toString());
  };

  const handleSelectedAgentChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newAgentName = e.target.value;
    setSelectedAgentName(newAgentName);
  };

  useEffect(() => {
    const storedPushToTalkUI = localStorage.getItem("pushToTalkUI");
    if (storedPushToTalkUI) {
      setIsPTTActive(storedPushToTalkUI === "true");
    }
    const storedLogsExpanded = localStorage.getItem("logsExpanded");
    if (storedLogsExpanded) {
      setIsEventsPaneExpanded(storedLogsExpanded === "true");
    }
    const storedAudioPlaybackEnabled = localStorage.getItem(
      "audioPlaybackEnabled"
    );
    if (storedAudioPlaybackEnabled) {
      setIsAudioPlaybackEnabled(storedAudioPlaybackEnabled === "true");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("pushToTalkUI", isPTTActive.toString());
  }, [isPTTActive]);

  useEffect(() => {
    localStorage.setItem("logsExpanded", isEventsPaneExpanded.toString());
  }, [isEventsPaneExpanded]);

  useEffect(() => {
    localStorage.setItem(
      "audioPlaybackEnabled",
      isAudioPlaybackEnabled.toString()
    );
  }, [isAudioPlaybackEnabled]);

  useEffect(() => {
    if (audioElementRef.current) {
      if (isAudioPlaybackEnabled) {
        audioElementRef.current.play().catch((err) => {
          console.warn("Autoplay may be blocked by browser:", err);
        });
      } else {
        audioElementRef.current.pause();
      }
    }
  }, [isAudioPlaybackEnabled]);

  const agentSetKey = searchParams.get("agentConfig") || "default";

  const toggleChat = () => {
    const newVisibility = !isChatVisible;
    setIsChatVisible(newVisibility);

    // Connect when opening, disconnect when closing
    if (newVisibility) {
      if (sessionStatus === "DISCONNECTED") {
        connectToRealtime();
      }
    } else {
      if (sessionStatus === "CONNECTED" || sessionStatus === "CONNECTING") {
        disconnectFromRealtime();
      }
    }
  };

  const handleBackToChat = () => {
    setActiveUIComponent(null);
  };

  const handleSendChatMessage = () => {
    if (!chatInput.trim()) return;

    // Add user message
    const userMessageId = uuidv4();
    const now = new Date();
    setChatMessages(prev => [...prev, {
      id: userMessageId,
      sender: "user",
      text: chatInput,
      timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);

    // Clear input
    setChatInput("");

    // Show typing indicator
    setIsTyping(true);

    // Simulate bot response after a delay
    setTimeout(() => {
      // const botMessageId = uuidv4();
      // setChatMessages(prev => [...prev, {
      //   id: botMessageId,
      //   sender: "bot",
      //   text: `I received your message: "${chatInput}"`,
      //   timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      // }]);
      setIsTyping(false);

      // If we're in initial view, switch to conversation view
      if (chatView === "initial") {
        setChatView("conversation");
      }

      // Also send the message to the OpenAI agent if connected
      if (sessionStatus === "CONNECTED" && dcRef.current?.readyState === "open") {
        sendClientEvent(
          {
            type: "conversation.item.create",
            item: {
              type: "message",
              role: "user",
              content: [{ type: "input_text", text: chatInput }],
            },
          },
          "(send user text message from chat window)"
        );
        sendClientEvent({ type: "response.create" }, "trigger response");
      }
    }, 1000);
  };

  const handleSuggestionClick = (text: string) => {
    setChatInput(text);
    handleSendChatMessage();
  };

  // Card action handlers
  const handleAdjustControlsClick = () => {
    handleSuggestionClick("I want to adjust my purchase controls");
  };

  const handleManageCardsClick = () => {
    handleSuggestionClick("I need to manage my cards");
  };

  const handleViewStatementsClick = () => {
    handleSuggestionClick("Show me my statements");
  };

  const handleReviewDeclinedClick = () => {
    handleSuggestionClick("I want to review my declined transactions");
  };

  return (
    <div className="text-base flex flex-col h-screen bg-gray-100 text-gray-800 relative">
      <div className="p-5 text-lg font-semibold flex justify-between items-center">
        <div className="flex items-center">
          <div onClick={() => window.location.reload()} style={{ cursor: 'pointer' }}>
            <Image
              src="/openai-logomark.svg"
              alt="OpenAI Logo"
              width={20}
              height={20}
              className="mr-2"
            />
          </div>
          <div>
            Realtime API <span className="text-gray-500">Agents</span>
          </div>
        </div>
        <div className="flex items-center">
          <Button
            className="rounded-full bg-gradient-to-r from-[#d23f57] to-[#f97316] hover:from-[#c02d45] hover:to-[#ea580c] border-0 mr-4"
            onClick={toggleChat}
          >
            <div className="flex items-center">
              {/* WEX IQ Icon */}
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-CBZCvLyY7pIHy6Hez4MexhgRljVkjE.png"
                alt="WEX IQ Icon"
                width={16}
                height={16}
                className="h-4 w-4 mr-2"
              />
              {/* Button Text */}
              <span className="text-white">WEX IQ</span>
            </div>
          </Button>

          <label className="flex items-center text-base gap-1 mr-2 font-medium">
            Scenario
          </label>
          <div className="relative inline-block">
            <select
              value={agentSetKey}
              onChange={handleAgentChange}
              className="appearance-none border border-gray-300 rounded-lg text-base px-2 py-1 pr-8 cursor-pointer font-normal focus:outline-none"
            >
              {Object.keys(allAgentSets).map((agentKey) => (
                <option key={agentKey} value={agentKey}>
                  {agentKey}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 text-gray-600">
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M5.23 7.21a.75.75 0 011.06.02L10 10.44l3.71-3.21a.75.75 0 111.04 1.08l-4.25 3.65a.75.75 0 01-1.04 0L5.21 8.27a.75.75 0 01.02-1.06z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>

          {agentSetKey && (
            <div className="flex items-center ml-6">
              <label className="flex items-center text-base gap-1 mr-2 font-medium">
                Agent
              </label>
              <div className="relative inline-block">
                <select
                  value={selectedAgentName}
                  onChange={handleSelectedAgentChange}
                  className="appearance-none border border-gray-300 rounded-lg text-base px-2 py-1 pr-8 cursor-pointer font-normal focus:outline-none"
                >
                  {selectedAgentConfigSet?.map(agent => (
                    <option key={agent.name} value={agent.name}>
                      {agent.name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 text-gray-600">
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.23 7.21a.75.75 0 011.06.02L10 10.44l3.71-3.21a.75.75 0 111.04 1.08l-4.25 3.65a.75.75 0 01-1.04 0L5.21 8.27a.75.75 0 01.02-1.06z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {isChatVisible && (
        <div className="flex flex-1 gap-2 px-2 overflow-hidden relative">
          <Transcript
            userText={userText}
            setUserText={setUserText}
            onSendMessage={handleSendTextMessage}
            canSend={
              sessionStatus === "CONNECTED" &&
              dcRef.current?.readyState === "open"
            }
          />

          <Events isExpanded={isEventsPaneExpanded} />
        </div>
      )}

      {isChatVisible && (
        <BottomToolbar
          sessionStatus={sessionStatus}
          onToggleConnection={onToggleConnection}
          isPTTActive={isPTTActive}
          setIsPTTActive={setIsPTTActive}
          isPTTUserSpeaking={isPTTUserSpeaking}
          handleTalkButtonDown={handleTalkButtonDown}
          handleTalkButtonUp={handleTalkButtonUp}
          isEventsPaneExpanded={isEventsPaneExpanded}
          setIsEventsPaneExpanded={setIsEventsPaneExpanded}
          isAudioPlaybackEnabled={isAudioPlaybackEnabled}
          setIsAudioPlaybackEnabled={setIsAudioPlaybackEnabled}
        />
      )}

      <ChatWindow
        chatOpen={isChatVisible}
        setChatOpen={setIsChatVisible}
        activeUIComponent={activeUIComponent}
        onBack={handleBackToChat}
        chatView={chatView}
        messages={chatMessages}
        inputValue={chatInput}
        setInputValue={setChatInput}
        isTyping={isTyping}
        suggestions={suggestions}
        handleSendMessage={handleSendChatMessage}
        handleSuggestionClick={handleSuggestionClick}
        onAdjustControlsClick={handleAdjustControlsClick}
        onManageCardsClick={handleManageCardsClick}
        onViewStatementsClick={handleViewStatementsClick}
        onReviewDeclinedClick={handleReviewDeclinedClick}
        sessionStatus={sessionStatus}
        agentName={selectedAgentName}
        isAudioPlaybackEnabled={isAudioPlaybackEnabled}
        setIsAudioPlaybackEnabled={setIsAudioPlaybackEnabled}
        isPTTActive={isPTTActive}
        handleTalkButtonDown={handleTalkButtonDown}
        handleTalkButtonUp={handleTalkButtonUp}
      />
    </div>
  );
}

export default App;
