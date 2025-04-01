import { Button } from "@/app/components/ui/button"; // Adjust path if needed
import { Check, ArrowLeft } from "lucide-react"; // Import ArrowLeft

interface PurchaseControlsUIProps {
    onBack: () => void; // Function to go back to chat
}

export function PurchaseControlsUI({ onBack }: PurchaseControlsUIProps) {
    return (
        // Use padding on the outer div for consistent spacing when scrolling
        <div className="p-4 h-full overflow-y-auto bg-white"> {/* Changed background */}
             {/* Back Button - Moved to top */}
            <button onClick={onBack} className="flex items-center gap-1 text-sm text-gray-600 hover:text-black mb-4">
                <ArrowLeft size={16} /> Back to Chat
            </button>

            {/* Removed extra wrapper, apply styles directly if needed */}
            <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full border-2 border-[#1d2c38] flex items-center justify-center">
                    <Check className="w-5 h-5 text-[#1d2c38]" />
                </div>
                <h2 className="text-xl font-bold text-[#1d2c38]">Create new profile</h2> {/* Adjusted size */}
            </div>

            <p className="text-[#1d2c38] mb-6">Emergency preset: Hurricane</p>

            {/* ... rest of the form elements ... */}
             <div className="border-b pb-4 mb-4">
                 <div className="flex justify-between items-center">
                     <div>
                         <p className="font-semibold text-[#1d2c38] mb-1">Duration</p>
                         <p className="text-[#515f6b]">8/10 - 8/15</p>
                     </div>
                     <button className="text-[#0058a3] font-medium text-sm">Edit</button>
                 </div>
             </div>

             <div className="border-b pb-4 mb-4">
                 <div className="flex justify-between items-center">
                     <div>
                         <p className="font-semibold text-[#1d2c38] mb-1">Location</p>
                         <p className="text-[#515f6b]">Miami-Dade, 20 mile radius</p>
                     </div>
                     <button className="text-[#0058a3] font-medium text-sm">Edit</button>
                 </div>
             </div>

             <div className="border-b pb-4 mb-4">
                 <div className="flex justify-between items-center">
                     <div>
                         <p className="font-semibold text-[#1d2c38] mb-1">Spending</p>
                         <p className="text-[#515f6b]">$500 limit per driver</p>
                     </div>
                     <button className="text-[#0058a3] font-medium text-sm">Edit</button>
                 </div>
             </div>

             {/* ... toggles ... */}

            <Button className="w-full bg-[#0058a3] hover:bg-[#004a8c] text-white h-10 rounded-xl mb-3 mt-6"> {/* Added margin-top */}
                Create profile
            </Button>

            <Button
                variant="outline"
                className="w-full border-[#0058a3] text-[#0058a3] hover:bg-[#e4f5fd] h-10 rounded-xl mb-3"
            >
                Go to all purchase profiles
            </Button>

             {/* Removed duplicate back button */}
        </div>
    );
}