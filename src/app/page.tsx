import React from "react";
import { TranscriptProvider } from "@/app/contexts/TranscriptContext";
import { EventProvider } from "@/app/contexts/EventContext";
import App from "./App";
import NewApp from "./NewApp";

export default function Page() {
  return (
    <TranscriptProvider>
      <EventProvider>
        <NewApp />
      </EventProvider>
    </TranscriptProvider>
  );
}
