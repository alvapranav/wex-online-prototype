import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Check, ArrowLeft, Calendar, MapPin, DollarSign, Loader2, CheckCircle2 } from "lucide-react";

interface PurchaseControlsUIProps {
    onBack: () => void; // Function to go back to chat
}

type EditSection = "duration" | "location" | "spending" | null;
type SaveState = "idle" | "saving" | "success";

export function PurchaseControlsUI({ onBack }: PurchaseControlsUIProps) {
    // State for tracking which section is being edited
    const [editSection, setEditSection] = useState<EditSection>(null);
    
    // State for form values
    const [startDate, setStartDate] = useState("8/10");
    const [endDate, setEndDate] = useState("8/15");
    const [location, setLocation] = useState("Miami-Dade");
    const [radius, setRadius] = useState("20");
    const [spendingLimit, setSpendingLimit] = useState(500);
    
    // State for save button
    const [saveState, setSaveState] = useState<SaveState>("idle");
    
    // Handle save profile
    const handleSaveProfile = () => {
        setSaveState("saving");
        // Simulate API call
        setTimeout(() => {
            setSaveState("success");
        }, 1500);
    };
    
    // If we're in success state, show the success message
    if (saveState === "success") {
        return (
            <div className="p-4 h-full overflow-y-auto bg-white flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-full bg-[#e6f7f1] flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-8 h-8 text-[#00a190]" />
                </div>
                <h2 className="text-xl font-bold text-[#1d2c38] mb-2">Purchase Controls Updated</h2>
                <p className="text-[#515f6b] mb-6">Your new purchase controls have been set successfully.</p>
                <Button 
                    className="bg-[#0058a3] hover:bg-[#004a8c] text-white h-10 rounded-xl mb-3"
                    onClick={() => onBack()}
                >
                    Return to Chat
                </Button>
            </div>
        );
    }
    
    return (
        <div className="p-4 h-full overflow-y-auto bg-white">
            {/* Back Button */}
            <button onClick={onBack} className="flex items-center gap-1 text-sm text-gray-600 hover:text-black mb-4">
                <ArrowLeft size={16} /> Back to Chat
            </button>

            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full border-2 border-[#1d2c38] flex items-center justify-center">
                    <Check className="w-5 h-5 text-[#1d2c38]" />
                </div>
                <h2 className="text-xl font-bold text-[#1d2c38]">Create new profile</h2>
            </div>

            <p className="text-[#1d2c38] mb-6">Emergency preset: Hurricane</p>

            {/* Duration Section */}
            <div className="border-b pb-4 mb-4">
                {editSection === "duration" ? (
                    <div>
                        <p className="font-semibold text-[#1d2c38] mb-2">Duration</p>
                        <div className="flex gap-2 mb-3">
                            <div className="flex-1">
                                <label className="text-xs text-[#515f6b] mb-1 block">Start Date</label>
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        className="w-full p-2 border rounded-lg pl-8" 
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        placeholder="MM/DD"
                                    />
                                    <Calendar className="w-4 h-4 absolute left-2 top-1/2 transform -translate-y-1/2 text-[#515f6b]" />
                                </div>
                            </div>
                            <div className="flex-1">
                                <label className="text-xs text-[#515f6b] mb-1 block">End Date</label>
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        className="w-full p-2 border rounded-lg pl-8" 
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        placeholder="MM/DD"
                                    />
                                    <Calendar className="w-4 h-4 absolute left-2 top-1/2 transform -translate-y-1/2 text-[#515f6b]" />
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button 
                                variant="outline" 
                                className="text-sm h-8" 
                                onClick={() => setEditSection(null)}
                            >
                                Cancel
                            </Button>
                            <Button 
                                className="bg-[#0058a3] text-white text-sm h-8" 
                                onClick={() => setEditSection(null)}
                            >
                                Save
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="font-semibold text-[#1d2c38] mb-1">Duration</p>
                            <p className="text-[#515f6b]">{startDate} - {endDate}</p>
                        </div>
                        <button 
                            className="text-[#0058a3] font-medium text-sm"
                            onClick={() => setEditSection("duration")}
                        >
                            Edit
                        </button>
                    </div>
                )}
            </div>

            {/* Location Section */}
            <div className="border-b pb-4 mb-4">
                {editSection === "location" ? (
                    <div>
                        <p className="font-semibold text-[#1d2c38] mb-2">Location</p>
                        <div className="mb-3">
                            <label className="text-xs text-[#515f6b] mb-1 block">City/County</label>
                            <div className="relative">
                                <input 
                                    type="text" 
                                    className="w-full p-2 border rounded-lg pl-8" 
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    placeholder="Enter location"
                                    list="locations"
                                />
                                <MapPin className="w-4 h-4 absolute left-2 top-1/2 transform -translate-y-1/2 text-[#515f6b]" />
                                <datalist id="locations">
                                    <option value="Miami-Dade" />
                                    <option value="Broward County" />
                                    <option value="Palm Beach County" />
                                    <option value="Orlando" />
                                    <option value="Tampa" />
                                </datalist>
                            </div>
                        </div>
                        <div className="mb-3">
                            <label className="text-xs text-[#515f6b] mb-1 block">Radius (miles)</label>
                            <input 
                                type="number" 
                                className="w-full p-2 border rounded-lg" 
                                value={radius}
                                onChange={(e) => setRadius(e.target.value)}
                                min="1"
                                max="100"
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button 
                                variant="outline" 
                                className="text-sm h-8" 
                                onClick={() => setEditSection(null)}
                            >
                                Cancel
                            </Button>
                            <Button 
                                className="bg-[#0058a3] text-white text-sm h-8" 
                                onClick={() => setEditSection(null)}
                            >
                                Save
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="font-semibold text-[#1d2c38] mb-1">Location</p>
                            <p className="text-[#515f6b]">{location}, {radius} mile radius</p>
                        </div>
                        <button 
                            className="text-[#0058a3] font-medium text-sm"
                            onClick={() => setEditSection("location")}
                        >
                            Edit
                        </button>
                    </div>
                )}
            </div>

            {/* Spending Section */}
            <div className="border-b pb-4 mb-4">
                {editSection === "spending" ? (
                    <div>
                        <p className="font-semibold text-[#1d2c38] mb-2">Spending Limit</p>
                        <div className="mb-3">
                            <div className="flex items-center gap-2 mb-1">
                                <DollarSign className="w-4 h-4 text-[#515f6b]" />
                                <span className="text-lg font-bold text-[#1d2c38]">{spendingLimit}</span>
                            </div>
                            <input 
                                type="range" 
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" 
                                min="0" 
                                max="2000" 
                                step="50"
                                value={spendingLimit}
                                onChange={(e) => setSpendingLimit(parseInt(e.target.value))}
                            />
                            <div className="flex justify-between text-xs text-[#515f6b] mt-1">
                                <span>$0</span>
                                <span>$1000</span>
                                <span>$2000</span>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button 
                                variant="outline" 
                                className="text-sm h-8" 
                                onClick={() => setEditSection(null)}
                            >
                                Cancel
                            </Button>
                            <Button 
                                className="bg-[#0058a3] text-white text-sm h-8" 
                                onClick={() => setEditSection(null)}
                            >
                                Save
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="font-semibold text-[#1d2c38] mb-1">Spending</p>
                            <p className="text-[#515f6b]">${spendingLimit} per transaction</p>
                        </div>
                        <button 
                            className="text-[#0058a3] font-medium text-sm"
                            onClick={() => setEditSection("spending")}
                        >
                            Edit
                        </button>
                    </div>
                )}
            </div>

            {/* Categories Section */}
            <div className="border-b pb-4 mb-4">
                <div className="flex justify-between items-center">
                    <div>
                        <p className="font-semibold text-[#1d2c38] mb-1">Categories</p>
                        <p className="text-[#515f6b]">Fuel, Groceries, Lodging</p>
                    </div>
                    <button className="text-[#0058a3] font-medium text-sm">
                        Edit
                    </button>
                </div>
            </div>

            {/* Save Button */}
            <Button 
                className="w-full bg-[#0058a3] hover:bg-[#004a8c] text-white h-10 rounded-xl mb-3 mt-6 flex items-center justify-center"
                onClick={handleSaveProfile}
                disabled={saveState === "saving"}
            >
                {saveState === "saving" ? (
                    <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating profile...
                    </>
                ) : (
                    "Create profile"
                )}
            </Button>

            <Button
                variant="outline"
                className="w-full border-[#0058a3] text-[#0058a3] hover:bg-[#e4f5fd] h-10 rounded-xl mb-3"
            >
                Go to all purchase profiles
            </Button>
        </div>
    );
}