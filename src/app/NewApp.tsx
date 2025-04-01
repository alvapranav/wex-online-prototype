"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader } from "@/app/components/ui/card";
import RecentActivity from "./components/RecentActivity";
import TransactionSummary from "./components/TransactionSummary";

// UI components from your chat functionality
import { ChatWindow } from "./components/ChatWindow";

// Types and context/hook imports
import { AgentConfig, SessionStatus } from "@/app/types";
import { useTranscript } from "@/app/contexts/TranscriptContext";
import { useEvent } from "@/app/contexts/EventContext";
import { useHandleServerEvent } from "./hooks/useHandleServerEvent";
import { createRealtimeConnection } from "./lib/realtimeConnection";
import { allAgentSets, defaultAgentSetKey } from "@/app/agentConfigs";

// Icon imports (from lucide-react)
import {
    CreditCard,
    FileText,
    HomeIcon,
    Settings,
    Truck,
    Users,
    BarChart2,
    ThumbsUp,
    ThumbsDown,
    Maximize2,
    X,
    ArrowRight,
    Send,
    Mic,
    Check,
    Calendar,
    Info,
} from "lucide-react";

function NewApp() {
    // --- Chat & Agent State and Realtime Connection Logic ---
    const searchParams = useSearchParams();
    const { transcriptItems, addTranscriptMessage, addTranscriptBreadcrumb } = useTranscript();
    const { logClientEvent, logServerEvent } = useEvent();

    const [selectedAgentName, setSelectedAgentName] = useState<string>("");
    const [selectedAgentConfigSet, setSelectedAgentConfigSet] = useState<AgentConfig[] | null>(null);
    const [sessionStatus, setSessionStatus] = useState<SessionStatus>("DISCONNECTED");

    const [isEventsPaneExpanded, setIsEventsPaneExpanded] = useState<boolean>(true);
    const [userText, setUserText] = useState<string>("");
    const [isPTTActive, setIsPTTActive] = useState<boolean>(true);
    const [isPTTUserSpeaking, setIsPTTUserSpeaking] = useState<boolean>(false);
    const [isAudioPlaybackEnabled, setIsAudioPlaybackEnabled] = useState<boolean>(false);

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
        { text: "What's my current balance?" },
    ]);

    const [dataChannel, setDataChannel] = useState<RTCDataChannel | null>(null);
    const pcRef = useRef<RTCPeerConnection | null>(null);
    const dcRef = useRef<RTCDataChannel | null>(null);
    const audioElementRef = useRef<HTMLAudioElement | null>(null);
    const prevStatusRef = useRef<SessionStatus>(sessionStatus);
    const processedAgentRef = useRef<string | null>(null);
    const currentBotMessageIdRef = useRef<string | null>(null);
    const messageBufferRef = useRef<string>("");

    const [activeUIComponent, setActiveUIComponent] = useState<string | null>(null);

    const handleShowUIComponent = (componentName: string, params?: any) => {
        console.log("Setting active UI component:", componentName, "with params:", params);
        setActiveUIComponent(componentName);
    };

    const sendClientEvent = (eventObj: any, eventNameSuffix = "") => {
        if (dcRef.current && dcRef.current.readyState === "open") {
            logClientEvent(eventObj, eventNameSuffix);
            dcRef.current.send(JSON.stringify(eventObj));
        } else {
            logClientEvent({ attemptedEvent: eventObj.type }, "error.data_channel_not_open");
            console.error("Failed to send message - no data channel available", eventObj);
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
                    setChatMessages((prev) => [...prev, { id: botMessageId, sender: "bot", text, timestamp }]);
                } else {
                    setChatMessages((prev) =>
                        prev.map((msg) =>
                            msg.id === currentBotMessageIdRef.current ? { ...msg, text: messageBufferRef.current } : msg
                        )
                    );
                }
            }
        },
        setIsTyping: (isTypingUpdate) => {
            setIsTyping(isTypingUpdate);
            if (!isTypingUpdate) {
                if (currentBotMessageIdRef.current && messageBufferRef.current) {
                    setChatMessages((prev) =>
                        prev.map((msg) =>
                            msg.id === currentBotMessageIdRef.current ? { ...msg, text: messageBufferRef.current } : msg
                        )
                    );
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
                const separatorText = `Connected to ${selectedAgentName}`;
                setChatMessages((prev) => {
                    const lastMessage = prev[prev.length - 1];
                    if (!lastMessage || !(lastMessage.type === 'separator' && lastMessage.text === separatorText)) {
                        return [
                            ...prev,
                            {
                                id: uuidv4(),
                                sender: 'system',
                                type: 'separator',
                                text: separatorText,
                                timestamp: new Date().toISOString(),
                            },
                        ];
                    }
                    return prev;
                });
                const currentAgent = selectedAgentConfigSet.find((a) => a.name === selectedAgentName);
                const breadcrumbText = `Agent: ${selectedAgentName}`;
                if (!transcriptItems.some((item) => item.type === 'BREADCRUMB' && item.title === breadcrumbText)) {
                    addTranscriptBreadcrumb(breadcrumbText, currentAgent);
                }
                updateSession(true);
                processedAgentRef.current = selectedAgentName;
            }
        } else if (sessionStatus !== "CONNECTED") {
            processedAgentRef.current = null;
        }
    }, [selectedAgentConfigSet, selectedAgentName, sessionStatus, addTranscriptBreadcrumb]);

    useEffect(() => {
        if (sessionStatus === "CONNECTED") {
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
            if (!EPHEMERAL_KEY) return;
            if (!audioElementRef.current) {
                audioElementRef.current = document.createElement("audio");
            }
            audioElementRef.current.autoplay = isAudioPlaybackEnabled;
            const { pc, dc } = await createRealtimeConnection(EPHEMERAL_KEY, audioElementRef);
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
                if (sender.track) sender.track.stop();
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
                item: { id, type: "message", role: "user", content: [{ type: "input_text", text }] },
            },
            "(simulated user text message)"
        );
        sendClientEvent({ type: "response.create" }, "(trigger response after simulated user text message)");
    };

    const updateSession = (shouldTriggerResponse: boolean = false) => {
        sendClientEvent({ type: "input_audio_buffer.clear" }, "clear audio buffer on session update");
        const currentAgent = selectedAgentConfigSet?.find((a) => a.name === selectedAgentName);
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
        sendClientEvent({ type: "response.cancel" }, "(cancel due to user interruption)");
    };

    const handleSendTextMessage = () => {
        if (!userText.trim()) return;
        cancelAssistantSpeech();
        sendClientEvent(
            {
                type: "conversation.item.create",
                item: { type: "message", role: "user", content: [{ type: "input_text", text: userText.trim() }] },
            },
            "(send user text message)"
        );
        setUserText("");
        sendClientEvent({ type: "response.create" }, "trigger response");
    };

    const handleTalkButtonDown = () => {
        if (sessionStatus !== "CONNECTED" || dcRef.current?.readyState !== "open") return;
        cancelAssistantSpeech();
        setIsPTTUserSpeaking(true);
        sendClientEvent({ type: "input_audio_buffer.clear" }, "clear PTT buffer");
    };

    const handleTalkButtonUp = () => {
        if (sessionStatus !== "CONNECTED" || dcRef.current?.readyState !== "open" || !isPTTUserSpeaking) return;
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

    const handleSelectedAgentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedAgentName(e.target.value);
    };

    useEffect(() => {
        const storedPushToTalkUI = localStorage.getItem("pushToTalkUI");
        if (storedPushToTalkUI) setIsPTTActive(storedPushToTalkUI === "true");
        const storedLogsExpanded = localStorage.getItem("logsExpanded");
        if (storedLogsExpanded) setIsEventsPaneExpanded(storedLogsExpanded === "true");
        const storedAudioPlaybackEnabled = localStorage.getItem("audioPlaybackEnabled");
        if (storedAudioPlaybackEnabled) setIsAudioPlaybackEnabled(storedAudioPlaybackEnabled === "true");
    }, []);

    useEffect(() => {
        localStorage.setItem("pushToTalkUI", isPTTActive.toString());
    }, [isPTTActive]);

    useEffect(() => {
        localStorage.setItem("logsExpanded", isEventsPaneExpanded.toString());
    }, [isEventsPaneExpanded]);

    useEffect(() => {
        localStorage.setItem("audioPlaybackEnabled", isAudioPlaybackEnabled.toString());
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
        if (newVisibility) {
            if (sessionStatus === "DISCONNECTED") connectToRealtime();
        } else {
            if (sessionStatus === "CONNECTED" || sessionStatus === "CONNECTING") disconnectFromRealtime();
        }
    };

    const handleBackToChat = () => {
        setActiveUIComponent(null);
    };

    const handleSendChatMessage = () => {
        if (!chatInput.trim()) return;
        const userMessageId = uuidv4();
        const now = new Date();
        setChatMessages((prev) => [
            ...prev,
            {
                id: userMessageId,
                sender: "user",
                text: chatInput,
                timestamp: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            },
        ]);
        setChatInput("");
        setIsTyping(true);
        setTimeout(() => {
            setIsTyping(false);
            if (chatView === "initial") setChatView("conversation");
            if (sessionStatus === "CONNECTED" && dcRef.current?.readyState === "open") {
                sendClientEvent(
                    {
                        type: "conversation.item.create",
                        item: { type: "message", role: "user", content: [{ type: "input_text", text: chatInput }] },
                    },
                    "(send user text message from chat window)"
                );
                sendClientEvent({ type: "response.create" }, "trigger response");
            }
        }, 1000);
    };

    const handleSuggestionClick = (text: string) => {
        setChatInput(text);
        const userMessageId = uuidv4();
        const now = new Date();
        setChatMessages((prev) => [
            ...prev,
            {
                id: userMessageId,
                sender: "user",
                text,
                timestamp: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            },
        ]);
        setIsTyping(true);
        if (sessionStatus === "CONNECTED" && dcRef.current?.readyState === "open") {
            sendClientEvent(
                {
                    type: "conversation.item.create",
                    item: { type: "message", role: "user", content: [{ type: "input_text", text }] },
                },
                "(send user text message from suggestion)"
            );
            sendClientEvent({ type: "response.create" }, "trigger response");
        }
        setChatInput("");
        if (chatView === "initial") setChatView("conversation");
    };

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

    // --- Layout: Merged Page (Header, Sidebar, Main Content) ---
    return (
        <div className="min-h-screen bg-[#f6f6f6]">
            {/* Header */}
            <header className="flex items-center justify-between p-4 pt-6 bg-[#001B32] border-b border-[#0a345a] h-[72px]">
                <div className="flex items-center">
                    <div onClick={() => window.location.reload()} style={{ cursor: "pointer" }}>
                        <Image
                            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-Xy8OLb2CfT9TZjhQ2gxsk7Ifo8BHvs.png"
                            alt="WEX Logo"
                            width={80}
                            height={40}
                            className="h-8 w-auto mr-2"
                        />
                    </div>
                    <div>Realtime API Agents</div>
                </div>
                <div className="flex items-center">
                    <Button
                        className="rounded-full bg-gradient-to-r from-[#d23f57] to-[#f97316] hover:from-[#c02d45] hover:to-[#ea580c] border-0 mr-4"
                        onClick={toggleChat}
                    >
                        <div className="flex items-center">
                            <Image
                                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-CBZCvLyY7pIHy6Hez4MexhgRljVkjE.png"
                                alt="WEX IQ Icon"
                                width={16}
                                height={16}
                                className="h-4 w-4 mr-2"
                            />
                            <span className="text-white">WEX IQ</span>
                        </div>
                    </Button>
                </div>
            </header>
            <div className="flex h-[calc(100vh-72px)] overflow-hidden">
                {/* Sidebar */}
                <aside className="w-60 bg-[#001B32] border-r border-[#0a345a] flex flex-col h-full">
                    <nav className="p-2 flex-1 overflow-y-auto">
                        <div className="space-y-1 py-2">
                            <Link
                                href="#"
                                className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md bg-[#0a345a] text-white"
                            >
                                <HomeIcon className="w-5 h-5" />
                                Home
                            </Link>
                            <p className="px-3 py-2 text-sm text-gray-300">My fleet</p>
                            <Link
                                href="#"
                                className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-gray-200 hover:bg-[#0a345a]"
                            >
                                <CreditCard className="w-5 h-5" />
                                Cards
                            </Link>
                            <Link
                                href="#"
                                className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-gray-200 hover:bg-[#0a345a]"
                            >
                                <FileText className="w-5 h-5" />
                                Purchase controls
                            </Link>
                            <Link
                                href="#"
                                className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-gray-200 hover:bg-[#0a345a]"
                            >
                                <Users className="w-5 h-5" />
                                Drivers
                            </Link>
                            <Link
                                href="#"
                                className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-gray-200 hover:bg-[#0a345a]"
                            >
                                <Truck className="w-5 h-5" />
                                Vehicles
                            </Link>
                            <p className="px-3 py-2 text-sm text-gray-300">Billing and payments</p>
                            <Link
                                href="#"
                                className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-gray-200 hover:bg-[#0a345a]"
                            >
                                <CreditCard className="w-5 h-5" />
                                Credit & transactions
                            </Link>
                            <Link
                                href="#"
                                className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-gray-200 hover:bg-[#0a345a]"
                            >
                                <FileText className="w-5 h-5" />
                                Statements
                            </Link>
                            <Link
                                href="#"
                                className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-gray-200 hover:bg-[#0a345a]"
                            >
                                <CreditCard className="w-5 h-5" />
                                Payments
                            </Link>
                            <p className="px-3 py-2 text-sm text-gray-300">More</p>
                            <Link
                                href="#"
                                className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-gray-200 hover:bg-[#0a345a]"
                            >
                                <BarChart2 className="w-5 h-5" />
                                Reports
                            </Link>
                            <Link
                                href="#"
                                className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-gray-200 hover:bg-[#0a345a]"
                            >
                                <Settings className="w-5 h-5" />
                                Settings
                            </Link>
                        </div>
                    </nav>
                    <div className="p-4 flex items-center gap-2 border-t border-[#0a345a] mt-auto">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500 text-white">A</div>
                        <span className="text-sm font-medium text-white">Acme & Sons LLC</span>
                    </div>
                </aside>
                {/* Main Content */}
                <main className="flex-1 overflow-y-auto p-6">
                    {/* Alert Banner */}
                    <div className="mb-6 p-4 pt-6 bg-[#f1fafe] rounded-xl flex items-center justify-between shadow-md">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 flex-shrink-0">
                                <Image
                                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-4bThpKbOjIlnsLRatVUfKkHuT5zd40.png"
                                    alt="Alert Icon"
                                    width={40}
                                    height={40}
                                    className="w-10 h-10"
                                />
                            </div>
                            <div>
                                <h3 className="text-[#243746] font-semibold text-lg">
                                    Your fleet had more unusual card activity during the past month.
                                </h3>
                                <p className="text-[#1d2c38]">WEX IQ can help you dive deeper.</p>
                            </div>
                        </div>
                        <button className="text-[#0058a3] font-medium">Learn more</button>
                    </div>
                    {/* Insights Section */}
                    <div className="mb-6 p-6 bg-white rounded-xl shadow-sm">
                        <h2 className="text-2xl font-semibold text-[#1d2c38] mb-6">Insights</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Total Card Activity */}
                            <div className="border rounded-xl p-5 md:col-span-1">
                                <h3 className="text-[#1d2c38] font-medium mb-4">Total card activity</h3>
                                <p className="text-[#1d2c38] text-3xl font-bold mb-1">$901.03</p>
                                <p className="text-[#515f6b] mb-4">Week of 03/12/2025</p>
                                {/* Interactive Chart */}
                                <div
                                    className="h-24 w-full relative"
                                    id="activity-chart"
                                    onMouseMove={(e) => {
                                        const chart = document.getElementById("activity-chart");
                                        if (!chart) return;
                                        const rect = chart.getBoundingClientRect();
                                        const x = e.clientX - rect.left;
                                        const percentage = x / rect.width;
                                        const dataPoints = [
                                            { day: "Mon", value: 120, y: 70 },
                                            { day: "Tue", value: 150, y: 90 },
                                            { day: "Wed", value: 90, y: 85 },
                                            { day: "Thu", value: 180, y: 60 },
                                            { day: "Fri", value: 130, y: 65 },
                                            { day: "Sat", value: 200, y: 50 },
                                            { day: "Sun", value: 220, y: 20 },
                                        ];
                                        const index = Math.min(Math.floor(percentage * dataPoints.length), dataPoints.length - 1);
                                        const pointX = percentage * rect.width;
                                        const pointY = (dataPoints[index].y / 100) * rect.height;
                                        const tooltip = document.getElementById("chart-tooltip");
                                        const dot = document.getElementById("chart-dot");
                                        if (tooltip && dot) {
                                            tooltip.style.opacity = "1";
                                            tooltip.style.left = `${pointX}px`;
                                            tooltip.style.top = `${pointY}px`;
                                            tooltip.textContent = `${dataPoints[index].day}: $${dataPoints[index].value}`;
                                            dot.style.opacity = "1";
                                            dot.style.left = `${pointX}px`;
                                            dot.style.top = `${pointY}px`;
                                        }
                                    }}
                                    onMouseLeave={() => {
                                        const tooltip = document.getElementById("chart-tooltip");
                                        const dot = document.getElementById("chart-dot");
                                        if (tooltip && dot) {
                                            tooltip.style.opacity = "0";
                                            dot.style.opacity = "0";
                                        }
                                    }}
                                >
                                    <svg viewBox="0 0 300 100" className="w-full h-full">
                                        <defs>
                                            <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                                <stop offset="0%" stopColor="rgba(52, 211, 153, 0.5)" />
                                                <stop offset="100%" stopColor="rgba(52, 211, 153, 0)" />
                                            </linearGradient>
                                        </defs>
                                        <path
                                            d="M0,80 C20,70 40,90 60,85 C80,80 100,60 120,65 C140,70 160,80 180,75 C200,70 220,60 240,50 C260,40 280,30 300,20"
                                            fill="none"
                                            stroke="#34D399"
                                            strokeWidth="2"
                                            className="chart-line"
                                        />
                                        <path
                                            d="M0,80 C20,70 40,90 60,85 C80,80 100,60 120,65 C140,70 160,80 180,75 C200,70 220,60 240,50 C260,40 280,30 300,20 L300,100 L0,100 Z"
                                            fill="url(#chartGradient)"
                                            className="chart-area"
                                        />
                                    </svg>
                                    <div
                                        id="chart-tooltip"
                                        className="absolute bg-[#1d2c38] text-white px-2 py-1 rounded text-xs pointer-events-none opacity-0 transition-opacity duration-200"
                                        style={{ transform: "translate(-50%, -100%)", marginTop: "-8px" }}
                                    ></div>
                                    <div
                                        id="chart-dot"
                                        className="absolute w-3 h-3 bg-[#34D399] rounded-full pointer-events-none opacity-0 transition-opacity duration-200"
                                        style={{ transform: "translate(-50%, -50%)" }}
                                    ></div>
                                </div>
                            </div>
                            {/* Combined Balance Section */}
                            <div className="border rounded-xl p-5 md:col-span-2">
                                <div className="flex h-full">
                                    <div className="flex-1 pr-4">
                                        <div className="flex items-center gap-1 mb-4">
                                            <h3 className="text-[#1d2c38] font-medium">Current balance</h3>
                                            <Info className="w-4 h-4 text-gray-400" />
                                        </div>
                                        <p className="text-[#1d2c38] text-3xl font-bold mb-1">$700.00</p>
                                        <p className="text-[#515f6b] mb-4">Total credit limit $15,000</p>
                                        <div className="h-2 w-full bg-gray-200 rounded-full mb-4">
                                            <div className="h-full rounded-full bg-gradient-to-r from-[#0058a3] to-[#0058a3] w-[15%]"></div>
                                            <div className="h-full rounded-full bg-[#fab21b] w-[1%] -mt-2 ml-[15%]"></div>
                                        </div>
                                        <div className="flex flex-col gap-2 text-sm">
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full bg-[#0058a3]"></div>
                                                <span className="text-[#1d2c38]">Current balance</span>
                                                <span className="ml-auto font-medium">$700.00</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full bg-[#fab21b]"></div>
                                                <span className="text-[#1d2c38]">Pending</span>
                                                <span className="ml-auto font-medium">$50.00</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                                                <span className="text-[#1d2c38]">Available</span>
                                                <span className="ml-auto font-medium">$4,300.00</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="w-px bg-gray-200 mx-4"></div>
                                    <div className="flex-1 pl-4">
                                        <div className="flex items-center gap-1 mb-4">
                                            <h3 className="text-[#1d2c38] font-medium">Statement balance</h3>
                                            <Info className="w-4 h-4 text-gray-400" />
                                        </div>
                                        <p className="text-[#1d2c38] text-3xl font-bold mb-6">$500.00</p>
                                        <div className="bg-[#f1fafe] p-4 rounded-lg mb-4">
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className="text-[#1d2c38]">Your January balance is due in 6 days</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-[#0058a3]" />
                                                <p className="text-[#1d2c38] font-medium">February 28, 2025</p>
                                            </div>
                                        </div>
                                        <Button className="w-full bg-white border border-[#0058a3] text-[#0058a3] hover:bg-[#e4f5fd] h-10 rounded-lg">
                                            Make a payment
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Cards Section (Recent Activity & Transaction Summary) */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                        <div className="md:col-span-4">
                            <RecentActivity />
                        </div>
                        <div className="md:col-span-8">
                            <TransactionSummary />
                        </div>
                    </div>
                </main>
            </div>
            {/* --- Chat Panel (Overlay) --- */}
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

export default NewApp;
