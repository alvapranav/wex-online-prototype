"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Button } from "./ui/button";
import { CreditCard, Users, ArrowRight } from "lucide-react";

const transactionData = [
  {
    id: 1,
    status: "Transaction limit reached",
    title: "Home Depot",
    amount: "$210.31",
    date: "March 13, 2025",
    driver: "Emma Boyd ID #0239",
    card: "...4321",
    actionText: "Purchase controls",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-5 h-5 text-amber-500"
      >
        <path d="M12 2c-5.5 0-10 4.5-10 10s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 16.2c-.8 0-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5 1.5.7 1.5 1.5-.7 1.5-1.5 1.5zm1.5-5.2c0 .8-.7 1.5-1.5 1.5s-1.5-.7-1.5-1.5V8c0-.8.7-1.5 1.5-1.5s1.5.7 1.5 1.5v5z" />
      </svg>
    ),
  },
  {
    id: 2,
    status: "Uncommon location",
    title: "The Coffee Bean",
    amount: "$8.92",
    date: "March 13, 2025",
    driver: "Bob Ross ID #1342",
    card: "...9876",
    actionText: "Report fraud",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-5 h-5 text-amber-500"
      >
        <path d="M12 2c-5.5 0-10 4.5-10 10s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 16.2c-.8 0-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5 1.5.7 1.5 1.5-.7 1.5-1.5 1.5zm1.5-5.2c0 .8-.7 1.5-1.5 1.5s-1.5-.7-1.5-1.5V8c0-.8.7-1.5 1.5-1.5s1.5.7 1.5 1.5v5z" />
      </svg>
    ),
  },
  {
    id: 3,
    status: "Unusually large charge",
    title: "Luxury electronics",
    amount: "$1,200.00",
    date: "March 01, 2025",
    driver: "Mike Jones ID #2105",
    card: "...1234",
    actionText: "Lock card",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-5 h-5 text-red-500"
      >
        <path d="M12 2c-5.5 0-10 4.5-10 10s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 16.2c-.8 0-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5 1.5.7 1.5 1.5-.7 1.5-1.5 1.5zm1.5-5.2c0 .8-.7 1.5-1.5 1.5s-1.5-.7-1.5-1.5V8c0-.8.7-1.5 1.5-1.5s1.5.7 1.5 1.5v5z" />
      </svg>
    ),
  },
  {
    id: 4,
    status: "Approved purchase",
    title: "Gas Station",
    amount: "$45.67",
    date: "March 12, 2025",
    driver: "John Smith ID #1122",
    card: "...5678",
    actionText: "View details",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-5 h-5 text-amber-500"
      >
        <path d="M12 2c-5.5 0-10 4.5-10 10s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 16.2c-.8 0-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5 1.5.7 1.5 1.5-.7 1.5-1.5 1.5zm1.5-5.2c0 .8-.7 1.5-1.5 1.5s-1.5-.7-1.5-1.5V8c0-.8.7-1.5 1.5-1.5s1.5.7 1.5 1.5v5z" />
      </svg>
    ),
  },
];

export default function TransactionSummary() {
  const scrollByAmount = 320;
  const handleScrollLeft = () => {
    const carousel = document.getElementById("carousel");
    if (carousel) {
      carousel.scrollBy({ left: -scrollByAmount, behavior: "smooth" });
    }
  };

  const handleScrollRight = () => {
    const carousel = document.getElementById("carousel");
    if (carousel) {
      carousel.scrollBy({ left: scrollByAmount, behavior: "smooth" });
    }
  };

  return (
    <Card className="shadow-sm flex flex-col" style={{ height: "550px" }}>
      <CardHeader className="flex flex-row items-center justify-between py-3">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Transaction summary</h2>
        </div>
        <Link href="#" className="text-sm text-blue-500">
          View all
        </Link>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="relative h-full">
          <div className="overflow-hidden h-full">
            <div
              className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4 h-full"
              id="carousel"
            >
              {transactionData.map((tx) => (
                <div key={tx.id} className="min-w-[300px] snap-start">
                  <div className="p-4 border rounded-2xl bg-white h-full">
                    <div className="flex items-center gap-2 mb-2">
                      {tx.icon}
                      <span className="text-[#253746] font-medium">{tx.status}</span>
                    </div>
                    <p className="text-[#1d2c38] text-xl font-semibold mb-1">{tx.title}</p>
                    <p className="text-[#253746] text-3xl font-bold mb-1">{tx.amount}</p>
                    <p className="text-[#515f6b] mb-4">{tx.date}</p>
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-5 h-5 text-[#7c858e]" />
                      <span className="text-[#253746]">{tx.driver}</span>
                    </div>
                    <div className="flex items-center gap-4 mb-4">
                      <CreditCard className="w-5 h-5 text-[#7c858e]" />
                      <span className="text-[#253746]">{tx.card}</span>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full border-[#0058a3] text-[#0058a3] hover:bg-[#e4f5fd] h-10 rounded-xl"
                      onClick={() => {
                        // Add your action logic here (for example, open a modal or navigate)
                      }}
                    >
                      <ArrowRight className="w-5 h-5 mr-2" />
                      {tx.actionText}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button
            className="absolute left-0 top-1/2 -translate-y-1/2 -ml-4 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center z-10"
            onClick={handleScrollLeft}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <button
            className="absolute right-0 top-1/2 -translate-y-1/2 -mr-4 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center z-10"
            onClick={handleScrollRight}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
