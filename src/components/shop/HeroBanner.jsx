// components/shop/HeroBanner.jsx
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from 'react-router-dom'; // Import Link for navigation

const HeroBanner = ({ bestDealProduct }) => {
  const [timeLeft, setTimeLeft] = useState({});

  const calculateTimeLeft = (endDate) => {
    const difference = +new Date(endDate) - +new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        mins: Math.floor((difference / 1000 / 60) % 60),
        secs: Math.floor((difference / 1000) % 60),
      };
    } else {
      timeLeft = { days: 0, hours: 0, mins: 0, secs: 0 };
    }
    return timeLeft;
  };

  useEffect(() => {
    if (!bestDealProduct) return;

    // Set initial time left immediately
    setTimeLeft(calculateTimeLeft(bestDealProduct.deal_end_date));

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(bestDealProduct.deal_end_date));
    }, 1000);

    return () => clearInterval(timer);
  }, [bestDealProduct]);

  if (!bestDealProduct) {
    return null; // Render nothing if no deal is passed
  }

  // Use the deal price for the discount calculation
  const discount = Math.round(
    ((bestDealProduct.slashed_price - bestDealProduct.deal_price) / bestDealProduct.slashed_price) * 100
  );

  const timerData = [
    { label: "DAYS", value: String(timeLeft.days || 0).padStart(2, '0') },
    { label: "HOURS", value: String(timeLeft.hours || 0).padStart(2, '0') },
    { label: "MINS", value: String(timeLeft.mins || 0).padStart(2, '0') },
    { label: "SECS", value: String(timeLeft.secs || 0).padStart(2, '0') },
  ];

  return (
    <div className="container mx-auto px-6 mt-6">
      <div className="rounded-lg overflow-hidden bg-gradient-to-r from-pink-100 to-pink-200 relative">
        <div className="flex flex-col md:flex-row items-center p-8">
          <div className="w-full md:w-1/2 mb-6 md:mb-0">
            <div className="uppercase text-pink-500 font-medium text-sm mb-2">
              BEST DEAL
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              {bestDealProduct.name}
            </h1>

            <div className="flex space-x-2 mb-6">
              {timerData.map((item, index) => (
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

            <Link to={`/product/${bestDealProduct.product_id}`}>
              <button className="bg-pink-500 text-white px-4 py-2 rounded-full flex items-center text-sm hover:bg-pink-600 transition-colors">
                Shop Now <ArrowRight className="ml-2 w-4 h-4" />
              </button>
            </Link>
          </div>

          <div className="w-full md:w-1/2 flex justify-center md:justify-end">
            <div className="relative">
              <div className="absolute -top-4 -left-8 bg-pink-500 text-white text-sm font-bold rounded-full w-16 h-16 flex flex-col items-center justify-center shadow-lg">
                <span>{discount}%</span>
                <span className="text-xs">OFF</span>
              </div>
              <img
                src={bestDealProduct.images[0]}
                alt={bestDealProduct.name}
                className="max-h-64 object-cover rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;
