"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Button } from "./ui/button";
import { ThumbsUp, ThumbsDown } from "lucide-react";

const recentActivityData = [
  {
    id: 1,
    title: "Auto-Approved",
    description: "12 fuel purchases under $35.00 (kept 12 drivers moving)",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-5 h-5 flex-shrink-0"
        style={{ color: "#00a190" }}
      >
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
      </svg>
    ),
  },
  {
    id: 2,
    title: "Declined",
    description: "5 out-of-policy transactions at non-approved vendors.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-5 h-5 flex-shrink-0"
        style={{ color: "red" }}
      >
        <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41l-3.59 3.59L5 15.59 8.41 12 5 8.41 6.41 7 10 10.59 13.59 7 15 8.41l-3.41 3.59L17 15.59z" />
      </svg>
    ),
    viewDetails: true,
  },
  {
    id: 3,
    title: "Declined",
    description: "3 attempted transactions outside of business hours.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-5 h-5 flex-shrink-0"
        style={{ color: "red" }}
      >
        <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41l-3.59 3.59L5 15.59 8.41 12 5 8.41 6.41 7 10 10.59 13.59 7 15 8.41l-3.41 3.59L17 15.59z" />
      </svg>
    ),
    viewDetails: true,
  },
  {
    id: 4,
    title: "Updated",
    description: "Automatically adjusted purchase limits for 8 high-performing drivers.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-5 h-5 flex-shrink-0"
        style={{ color: "#00a190" }}
      >
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
      </svg>
    ),
  },
  {
    id: 5,
    title: "Detected",
    description: "Unusual spending pattern for driver ID #1342. Flagged for review.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-5 h-5 flex-shrink-0"
        style={{ color: "#00a190" }}
      >
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
      </svg>
    ),
  },
  {
    id: 6,
    title: "Optimized",
    description: "Fuel purchase recommendations sent to 15 drivers based on route analysis.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-5 h-5 flex-shrink-0"
        style={{ color: "#00a190" }}
      >
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
      </svg>
    ),
  },
];

export default function RecentActivity() {
  return (
    <Card className="shadow-sm flex flex-col" style={{ height: "550px" }}>
      <CardHeader className="flex flex-row items-center py-3">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">WEX AI: Recent activity</h2>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto">
        <div className="space-y-3 text-sm">
          {recentActivityData.map((activity) => (
            <div key={activity.id} className="p-3 border rounded-xl">
              <div className="flex items-start gap-3">
                {activity.icon}
                <div className="flex-1">
                  <p className="font-medium">
                    {activity.title}:{" "}
                    <span className="font-normal">{activity.description}</span>
                  </p>
                  {activity.viewDetails && (
                    <Link
                      href="#"
                      className="text-blue-500 text-xs block mb-1"
                      onClick={(e) => {
                        e.preventDefault();
                        // Add your view details action here if needed.
                      }}
                    >
                      View details
                    </Link>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-6 px-2 text-xs text-gray-600 hover:text-[#00a190] hover:border-[#00a190]"
                    >
                      <ThumbsUp className="w-3 h-3 mr-1" />
                      Helpful
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-6 px-2 text-xs text-gray-600 hover:text-red-500 hover:border-red-500"
                    >
                      <ThumbsDown className="w-3 h-3 mr-1" />
                      Not helpful
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
