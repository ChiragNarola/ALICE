import { useState } from "react";
import { toast } from "react-toastify";
import { verifyPin } from "../api/api-services";
import { Eye, EyeOff} from "lucide-react";

interface LockScreenProps{
    onUnlock: () => void;
}

const LockScreen: React.FC<LockScreenProps> = ({
  onUnlock
}) => {
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPin, setShowPin] = useState(false);

  const handleUnlock = async (e: React.FormEvent) =>{
    e.preventDefault();
    if(!pin){
        toast.error("Enter your pin");
        return;
    }
    if (!/^\d{4}$/.test(pin)) {
        toast.error("PIN must be exactly 4 digits");
        return;
    }
    setLoading(true);
    try{

        const res= await verifyPin(pin);
        if(res?.IsSuccess){
            toast.success("Unlocked successfully");
            setPin("");
            onUnlock();
        }else {
            toast.error(res.Message|| "Incorrect Pin")
        }
    } catch (error: any){
        toast.error (error?.Message || "Something went wrong.Please try again later.");
    }finally{
        setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Blurred Background
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div> */}

      {/* Lock Screen Modal */}
      <div className="relative bg-white rounded-xl shadow-lg p-6 w-full max-w-sm z-10">
        <h2 className="text-xl font-semibold text-center mb-4">Session Locked</h2>
        <p className="text-center text-gray-600 mb-6">Enter your pin to unlock</p>

        <form onSubmit={handleUnlock} className="space-y-4">
          <div className="relative">
            <input
              type={showPin ? "text" : "password"}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Enter Pin"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <button
              type="button"
              onClick={() => setShowPin(!showPin)}
              className="absolute right-3 top-2 text-gray-500 hover:text-gray-700"
            >
              {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-teal-600 text-white py-2 rounded-lg font-semibold hover:bg-teal-700 transition ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
          >
            {loading ? "Unlocking..." : "Unlock"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LockScreen;