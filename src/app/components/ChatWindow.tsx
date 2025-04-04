"use client";

import {
    Maximize2,
    X,
    ArrowRight,
    Send,
    Mic,
    Check,
} from "lucide-react";
import Image from "next/image";
import { useRef, useEffect, useState } from "react";
import { PurchaseControlsUI } from "./PurchaseControlsUI";
import { StatementSummaryUI } from "./StatementSummaryUI";

// Define the types needed as props
type MessageType = {
    id: string;
    sender: "user" | "bot" | "system";
    text: string;
    timestamp: string;
    isLoading?: boolean;
    type?: 'message' | 'separator';
};

type SuggestionType = {
    text: string;
    action?: string;
};

// Define the props the ChatWindow component would expect
interface ChatWindowProps {
    chatOpen: boolean;
    setChatOpen: (isOpen: boolean) => void;
    activeUIComponent: string | null;
    onBack: () => void;
    chatView: "initial" | "purchase-controls" | string;
    messages: MessageType[];
    inputValue: string;
    setInputValue: (value: string) => void;
    isTyping: boolean;
    suggestions: SuggestionType[];
    handleSendMessage: () => void;
    handleSuggestionClick: (suggestionText: string) => void;
    // --- Handlers for initial view cards ---
    onAdjustControlsClick: () => void;
    onManageCardsClick: () => void;
    onViewStatementsClick: () => void;
    onReviewDeclinedClick: () => void;
    // --- New props ---
    sessionStatus: "CONNECTED" | "CONNECTING" | "DISCONNECTED" | "TRANSFERRING";
    agentName: string;
    isAudioPlaybackEnabled: boolean;
    setIsAudioPlaybackEnabled: (enabled: boolean) => void;
    isPTTActive: boolean;
    handleTalkButtonDown: () => void;
    handleTalkButtonUp: () => void;
    currentSpeechText?: string; // Add this prop to receive the current speech text
}

export function ChatWindow({
    chatOpen,
    setChatOpen,
    activeUIComponent,
    onBack,
    chatView,
    messages,
    inputValue,
    setInputValue,
    isTyping,
    suggestions,
    handleSendMessage,
    handleSuggestionClick,
    onAdjustControlsClick,
    onManageCardsClick,
    onViewStatementsClick,
    onReviewDeclinedClick,
    sessionStatus,
    agentName,
    isAudioPlaybackEnabled,
    setIsAudioPlaybackEnabled,
    isPTTActive,
    handleTalkButtonDown,
    handleTalkButtonUp,
    currentSpeechText,
}: ChatWindowProps) {

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [isMicActive, setIsMicActive] = useState(false);
    const [speechText, setSpeechText] = useState("");

    // Update speech text when currentSpeechText prop changes
    useEffect(() => {
        if (currentSpeechText !== undefined) {
            setSpeechText(currentSpeechText);
        }
    }, [currentSpeechText]);

    // Scroll to bottom of messages
    useEffect(() => {
        if (!activeUIComponent) { // Only scroll if chat is visible
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, activeUIComponent, speechText]);

    // Determine if the initial view should be shown
    const showInitialView = !activeUIComponent && messages.length === 0;
    // Determine if the conversation view should be shown
    const showConversationView = !activeUIComponent && messages.length > 0;

    // Function to get status color
    const getStatusColor = () => {
        switch (sessionStatus) {
            case "CONNECTED":
                return "bg-green-500";
            case "CONNECTING":
            case "TRANSFERRING":
                return "bg-orange-500";
            default:
                return "bg-gray-400";
        }
    };

    return (
        <div
            className={`fixed top-0 right-0 h-full w-[400px] bg-white shadow-xl z-50 transition-transform duration-300 ease-in-out ${chatOpen ? "translate-x-0" : "translate-x-full"
                }`}
        >
            <div className="flex flex-col h-full">
                {/* --- Chat Header --- */}
                <div className="flex items-center justify-between p-4 border-b">
                    {/* Header Title/Icon */}
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#d23f57] to-[#f97316] flex items-center justify-center">
                            <Image
                                unoptimized
                                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-CBZCvLyY7pIHy6Hez4MexhgRljVkjE.png"
                                alt="WEX IQ Icon"
                                width={16}
                                height={16}
                                className="w-4 h-4"
                            />
                        </div>
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-lg text-[#1d2c38]">WEX IQ</span>
                                {/* Status indicator */}
                                <div className={`w-2 h-2 rounded-full ${getStatusColor()}`}></div>
                            </div>
                            {/* Agent name - only show when connected */}
                            {sessionStatus !== "DISCONNECTED" && agentName && (
                                <span className="text-xs text-gray-500">{agentName}</span>
                            )}
                        </div>
                    </div>
                    {/* Header Controls */}
                    <div className="flex items-center">
                        <button className="p-2 hover:bg-gray-100 rounded-full mr-2" aria-label="Expand">
                            <Maximize2 className="w-5 h-5 text-gray-500" />
                        </button>
                        <button
                            className="p-2 hover:bg-gray-100 rounded-full"
                            aria-label="Close"
                            onClick={() => setChatOpen(false)}
                        >
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>
                </div>

                {/* --- Chat Content Area (Scrollable) --- */}
                <div className="flex-1 overflow-y-auto p-0"> 
                    <div className="p-6 relative">
                            {/* Initial View - Always visible */}
                            <div className="w-14 h-14 rounded-full bg-gradient-to-r from-[#d23f57] to-[#f97316] flex items-center justify-center mb-4">
                                <Image
                                    unoptimized
                                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-CBZCvLyY7pIHy6Hez4MexhgRljVkjE.png"
                                    alt="WEX IQ Icon"
                                    width={24}
                                    height={24}
                                    className="w-6 h-6"
                                />
                            </div>
                            <h1 className="text-4xl font-bold text-[#1d2c38] mb-4">Hey, Jonny!</h1>
                            <p className="text-[#253746] text-lg mb-8">
                                I'm <span className="font-bold">WEX IQ</span>, designed to answer your questions and help you
                                throughout the day. What would you like to do?
                            </p>
                            {/* Action Cards */}
                            <div className="grid grid-cols-2 gap-4 mb-8">
                                {/* Card 1 */}
                                <div
                                    className="bg-[#f0f9ff] p-4 rounded-lg cursor-pointer hover:bg-[#e4f5fd]"
                                    onClick={onAdjustControlsClick}
                                >
                                    <h3 className="font-semibold text-[#1d2c38] mb-1">Adjust purchase controls</h3>
                                    <p className="text-[#515f6b] text-sm mb-3">Set limits and rules for card usage</p>
                                    <div className="flex justify-end">
                                        <ArrowRight className="w-5 h-5 text-[#0058a3]" />
                                    </div>
                                </div>
                                {/* Card 2 */}
                                <div
                                    className="bg-[#f0f9ff] p-4 rounded-lg cursor-pointer hover:bg-[#e4f5fd]"
                                    onClick={onManageCardsClick}
                                >
                                    <h3 className="font-semibold text-[#1d2c38] mb-1">Manage my cards</h3>
                                    <p className="text-[#515f6b] text-sm mb-3">Lock, unlock, or request new cards</p>
                                    <div className="flex justify-end">
                                        <ArrowRight className="w-5 h-5 text-[#0058a3]" />
                                    </div>
                                </div>
                                {/* Card 3 */}
                                <div
                                    className="bg-[#f0f9ff] p-4 rounded-lg cursor-pointer hover:bg-[#e4f5fd]"
                                    onClick={onViewStatementsClick}
                                >
                                    <h3 className="font-semibold text-[#1d2c38] mb-1">View all statements</h3>
                                    <p className="text-[#515f6b] text-sm mb-3">Access billing history and payments</p>
                                    <div className="flex justify-end">
                                        <ArrowRight className="w-5 h-5 text-[#0058a3]" />
                                    </div>
                                </div>
                                {/* Card 4 */}
                                <div
                                    className="bg-[#f0f9ff] p-4 rounded-lg cursor-pointer hover:bg-[#e4f5fd]"
                                    onClick={onReviewDeclinedClick}
                                >
                                    <h3 className="font-semibold text-[#1d2c38] mb-1">Review declined transactions</h3>
                                    <p className="text-[#515f6b] text-sm mb-3">Understand and resolve declined purchases</p>
                                    <div className="flex justify-end">
                                        <ArrowRight className="w-5 h-5 text-[#0058a3]" />
                                    </div>
                                </div>
                            </div>
                            
                            {/* Conversation View - Only show if there are messages */}
                            {messages.length > 0 && (
                                <div className="p-0">
                                    <div className="space-y-6">
                                        {/* Message Mapping */}
                                        {messages.map((message) => (
                                            // --- CHECK FOR SEPARATOR TYPE ---
                                            message.type === 'separator' ? (
                                                <div key={message.id} className="text-center my-3 py-2"> {/* Add padding */}
                                                    {/* Centered, light grey text */}
                                                    <span className="text-xs text-gray-500 px-2">
                                                        {message.text}
                                                    </span>
                                                    {/* Line below the text */}
                                                    <hr className="mt-2 border-t border-gray-200" /> {/* Adjusted line style */}
                                                </div>
                                            ) : (
                                                // --- ELSE RENDER REGULAR MESSAGE (existing logic) ---
                                                <div key={message.id} className="flex items-start">
                                                    {/* Bot Avatar */}
                                                    {message.sender === "bot" && (
                                                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#d23f57] to-[#f97316] flex-shrink-0 flex items-center justify-center mr-3">
                                                            {/* Bot avatar image */}
                                                            <Image unoptimized src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-CBZCvLyY7pIHy6Hez4MexhgRljVkjE.png" alt="WEX IQ Icon" width={16} height={16} className="w-4 h-4" />
                                                        </div>
                                                    )}
                                                    {/* Message Bubble Container */}
                                                    <div className={`flex flex-col ${message.sender === "user" ? "items-end ml-auto" : "items-start"}`}>
                                                        <div className="text-xs text-gray-500 mb-1">{message.timestamp}</div>
                                                        {/* Existing rendering for actual message bubbles */}
                                                        {message.isLoading ? (
                                                            <div className={`p-4 rounded-xl ${message.sender === "bot" ? "bg-[#e4f5fd] text-[#1d2c38]" : "bg-[#f0f9ff] text-[#1d2c38] ml-auto"} max-w-[300px]`}> Loading... </div>
                                                        ) : message.text === "__PROFILE_TEMPLATE__" || message.text === "__STATEMENT_TEMPLATE__" ? (
                                                            <div className={`p-4 rounded-xl ${message.sender === "bot" ? "bg-[#e4f5fd] text-[#1d2c38]" : "bg-[#f0f9ff] text-[#1d2c38] ml-auto"} max-w-[300px] border border-dashed border-gray-400`}> Template... </div>
                                                        ) : message.text === "Here are your purchase controls settings:" ? (
                                                            <div className={`p-4 rounded-xl ${message.sender === "bot" ? "bg-[#e4f5fd] text-[#1d2c38]" : "bg-[#f0f9ff] text-[#1d2c38] ml-auto"} max-w-[320px]`}>
                                                                <div className="mb-2">{message.text}</div>
                                                                <PurchaseControlsUI onBack={() => {}} />
                                                            </div>
                                                        ) : message.text === "Here's your latest statement summary:" ? (
                                                            <div className={`p-4 rounded-xl ${message.sender === "bot" ? "bg-[#e4f5fd] text-[#1d2c38]" : "bg-[#f0f9ff] text-[#1d2c38] ml-auto"} max-w-[320px]`}>
                                                                <div className="mb-2">{message.text}</div>
                                                                <StatementSummaryUI onBack={() => {}} />
                                                            </div>
                                                        ) : (
                                                            <div className={`p-4 rounded-xl ${message.sender === "bot" ? "bg-[#e4f5fd] text-[#1d2c38]" : "bg-[#f0f9ff] text-[#1d2c38] ml-auto"} max-w-[300px]`}> {message.text} </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )
                                        ))}

                                        {isTyping && (
                                            <div className="flex items-start"> {/* Mimic message structure */}
                                                {/* Bot Avatar */}
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#d23f57] to-[#f97316] flex-shrink-0 flex items-center justify-center mr-3">
                                                    <Image
                                                        unoptimized
                                                        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-CBZCvLyY7pIHy6Hez4MexhgRljVkjE.png"
                                                        alt="WEX IQ Icon"
                                                        width={16}
                                                        height={16}
                                                        className="w-4 h-4"
                                                    />
                                                </div>
                                                {/* Loading Indicator Bubble */}
                                                <div className={`flex flex-col items-start`}>
                                                    <div className="text-xs text-gray-500 mb-1">Now</div> {/* Optional: Timestamp */}
                                                    <div className={`p-4 rounded-xl bg-[#e4f5fd] text-[#1d2c38] max-w-[300px]`}>
                                                        {/* Ellipses animation */}
                                                        <div className="flex space-x-1">
                                                            <div className="w-2 h-2 bg-[#0058a3] rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                                                            <div className="w-2 h-2 bg-[#0058a3] rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                                                            <div className="w-2 h-2 bg-[#0058a3] rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Show user's speech text while microphone is active */}
                                        {isMicActive && speechText && (
                                            <div className="flex items-start">
                                                {/* User Speech Message */}
                                                <div className="flex flex-col items-end ml-auto">
                                                    <div className="text-xs text-gray-500 mb-1">Now</div>
                                                    <div className="p-4 rounded-xl bg-[#f0f9ff] text-[#1d2c38] ml-auto max-w-[300px] border border-blue-300">
                                                        {speechText}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Div to scroll to */}
                                        <div ref={messagesEndRef} />
                                    </div>

                                    {/* Suggestion Chips (conditional) */}
                                    {!isTyping && suggestions.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-4 mb-2">
                                            {suggestions.map((suggestion, index) => (
                                                <button
                                                    key={index}
                                                    className="px-3 py-2 bg-[#f0f9ff] text-[#0058a3] rounded-full text-sm hover:bg-[#e4f5fd] transition-colors"
                                                    onClick={() => handleSuggestionClick(suggestion.text)}
                                                >
                                                    {suggestion.text}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                            
                            {/* Audio playback toggle button */}
                            <div className="absolute bottom-4 right-4">
                                <button
                                    onClick={() => setIsAudioPlaybackEnabled(!isAudioPlaybackEnabled)}
                                    className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
                                    title={isAudioPlaybackEnabled ? "Mute audio" : "Enable audio"}
                                >
                                    {isAudioPlaybackEnabled ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                                            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                                            <line x1="23" y1="9" x2="17" y2="15"></line>
                                            <line x1="17" y1="9" x2="23" y2="15"></line>
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>
                </div>

                {/* --- Chat Input Area --- */}
                <div className="p-4 border-t">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Ask me anything"
                            className="w-full p-3 pr-20 border rounded-full focus:outline-none focus:ring-2 focus:ring-[#0058a3] focus:border-transparent"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    handleSendMessage();
                                }
                            }}
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                            <button className="p-2 text-[#0058a3] hover:bg-[#f0f9ff] rounded-full" onClick={handleSendMessage}>
                                <Send className="w-5 h-5" />
                            </button>
                            {isPTTActive && (
                                <div className="relative">
                                    <button
                                        className="p-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white"
                                        onMouseDown={() => {
                                            setIsMicActive(true);
                                            handleTalkButtonDown();
                                        }}
                                        onMouseUp={() => {
                                            setIsMicActive(false);
                                            handleTalkButtonUp();
                                        }}
                                        onMouseLeave={() => {
                                            setIsMicActive(false);
                                            handleTalkButtonUp();
                                        }}
                                        onTouchStart={() => {
                                            setIsMicActive(true);
                                            handleTalkButtonDown();
                                        }}
                                        onTouchEnd={() => {
                                            setIsMicActive(false);
                                            handleTalkButtonUp();
                                        }}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                                            <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                                            <line x1="12" y1="19" x2="12" y2="23"></line>
                                            <line x1="8" y1="23" x2="16" y2="23"></line>
                                        </svg>
                                    </button>
                                    
                                    {/* Audio wave animation - appears when microphone is active */}
                                    {isMicActive && (
                                        <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-white p-3 rounded-lg shadow-md z-10 w-40">
                                            <div className="flex justify-center items-end h-10 gap-1">
                                                {[...Array(8)].map((_, i) => (
                                                    <div 
                                                        key={i} 
                                                        className="w-1 bg-blue-500 rounded-full animate-pulse"
                                                        style={{
                                                            height: `${Math.max(20, Math.floor(Math.random() * 40))}px`,
                                                            animationDuration: `${0.7 + Math.random() * 0.6}s`,
                                                            animationDelay: `${i * 0.05}s`
                                                        }}
                                                    ></div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                    {/* Disclaimer */}
                    <p className="text-xs text-gray-500 mt-2 text-center">
                        WEX IQ may make mistakes. See full{" "}
                        <a href="#" className="text-[#0058a3] underline">
                            disclaimer
                        </a>{" "}
                        for more information.
                    </p>
                </div>
            </div>
        </div>
    );
} 