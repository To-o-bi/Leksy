// components/HeroBanner.jsx
import { ArrowRight } from "lucide-react";

const HeroBanner = () => {
  return (
    <div className="container mx-auto px-6">
      <div className="rounded-lg overflow-hidden bg-gradient-to-r from-pink-100 to-pink-200 relative">
        <div className="flex items-center p-8">
          <div className="w-1/2">
            <div className="uppercase text-pink-500 font-medium text-sm mb-2">
              BEST DEALS
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              Sale of the Month
            </h1>

            {/* Countdown Timer */}
            <div className="flex space-x-2 mb-6">
              {[
                { label: "DAYS", value: "00" },
                { label: "HOURS", value: "06" },
                { label: "MINS", value: "38" },
                { label: "SECS", value: "45" },
              ].map((item, index) => (
                <div className="flex flex-col items-center" key={index}>
                  <div className="bg-white rounded px-3 py-2 text-center">
                    <span className="text-lg font-bold">{item.value}</span>
                  </div>
                  <span className="text-xs text-gray-500 mt-1">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>

            <button className="bg-pink-500 text-white px-4 py-2 rounded-full flex items-center text-sm">
              Shop Now <ArrowRight className="ml-2 w-4 h-4" />
            </button>
          </div>

          <div className="w-1/2 flex justify-end">
            <div className="relative">
              <div className="absolute -top-4 -left-8 bg-pink-500 text-white text-sm font-bold rounded-full w-16 h-16 flex flex-col items-center justify-center">
                <span>56%</span>
                <span className="text-xs">OFF</span>
              </div>
              <img
                src="/api/placeholder/300/250"
                alt="April Combo Sales"
                className="max-h-64"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;
