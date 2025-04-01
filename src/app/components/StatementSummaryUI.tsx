import { Button } from "@/app/components/ui/button"; // Adjust path if needed
import { ArrowLeft } from "lucide-react"; // Import ArrowLeft

interface StatementSummaryUIProps {
    onBack: () => void; // Function to go back to chat
}

export function StatementSummaryUI({ onBack }: StatementSummaryUIProps) {
    return (
        // Use padding on the outer div
        <div className="p-4 h-full overflow-y-auto bg-white"> {/* Changed background */}
            {/* Back Button - Moved to top */}
            <button onClick={onBack} className="flex items-center gap-1 text-sm text-gray-600 hover:text-black mb-4">
                <ArrowLeft size={16} /> Back to Chat
            </button>

            {/* Removed extra wrapper */}
             <div className="flex items-center justify-between mb-4">
                 <h2 className="text-xl font-bold text-[#1d2c38]">March 2025 Statement</h2>
                 <div className="text-xs px-2 py-1 bg-[#e4f5fd] text-[#0058a3] rounded-full">
                     Current
                 </div>
             </div>
            {/* ... rest of the summary elements ... */}
             <div className="flex justify-between items-center mb-6">
                 <div>
                     <p className="text-[#515f6b] text-sm">Total Due</p>
                     <p className="text-[#1d2c38] text-2xl font-bold">$12,458.92</p>
                 </div>
                 <div>
                     <p className="text-[#515f6b] text-sm">Due Date</p>
                     <p className="text-[#1d2c38] font-semibold">April 15, 2025</p>
                 </div>
             </div>

             <div className="bg-[#f0f9ff] p-3 rounded-lg mb-4">
                {/* ... savings info ... */}
                 <div className="flex items-center gap-2 mb-1">
                     <svg /* ... */ className="w-5 h-5 text-[#00a190]"></svg>
                     <span className="text-[#00a190] font-medium">Savings this month</span>
                 </div>
                 <p className="text-[#1d2c38] text-xl font-bold">$1,245.30</p>
                 <p className="text-[#515f6b] text-sm">Through fuel discounts and rebates</p>
             </div>

             {/* ... transaction summary ... */}

            <Button className="w-full bg-[#0058a3] hover:bg-[#004a8c] text-white h-10 rounded-xl mb-3 mt-6"> {/* Added margin-top */}
                Pay now
            </Button>

            <Button
                variant="outline"
                className="w-full border-[#0058a3] text-[#0058a3] hover:bg-[#e4f5fd] h-10 rounded-xl"
            >
                Download PDF
            </Button>

            {/* Removed duplicate back button */}
        </div>
    );
}