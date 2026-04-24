import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  BarChart2,
  ShieldCheck,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import findparkgo from "../../components/images/findparkgo.png";
import { API_URL } from "../lib/api";

export default function Home() {

  const isMobile = window.innerWidth < 768;

  const totalParking = 200;

  const [occupied, setOccupied] = useState(120);
  const available = totalParking - occupied;

  useEffect(() => {
    const interval = setInterval(() => {
      setOccupied(prev => {
        const change = Math.random() > 0.5 ? 1 : -1;
        let next = prev + change;

        if (next < 0) next = 0;
        if (next > totalParking) next = totalParking;

        return next;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (

    <div className="flex flex-col min-h-screen w-full">

      <main className="flex-1 pt-24 sm:pt-28 pb-10 px-4 sm:px-6 md:px-10 xl:px-16 2xl:px-24 max-w-[1800px] mx-auto w-full">

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 sm:gap-8 lg:gap-10 items-start justify-center w-full">

          <section className="xl:col-span-12 space-y-6 sm:space-y-8 w-full">

            <div className="relative rounded-2xl overflow-hidden w-full">

              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `url(${findparkgo})`,
                  backgroundSize: '120%',
                  backgroundPosition: 'center center',
                  animation: isMobile
                    ? 'bgMoveMobile 25s ease-in-out infinite alternate'
                    : 'bgMove 20s ease-in-out infinite alternate',
                }}
              />

              <div className="absolute inset-0 bg-black/60" />

              <div className="relative z-10 h-full flex items-center justify-start px-6 sm:px-10 text-white w-full">

                <header className="mb-10 sm:mb-12 lg:mb-16 w-full max-w-3xl">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex flex-col gap-5 w-full items-start text-left pt-6 sm:pt-10"
                  >

                    <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/80">
                      Park 'n Spot Home Dashboard
                    </span>

                    <h1 className="text-2xl sm:text-3xl md:text-4xl xl:text-5xl font-black leading-tight">
                      WHERE EVERY SPACE BECOMES A MOMENT OF CONVENIENCE
                    </h1>

                    <div className="flex flex-col items-start mt-2">

                      <h3 className="text-lg sm:text-xl font-bold mb-2">
                        Find Parking Near You
                      </h3>
                      <p className="text-white/80 text-xs sm:text-sm mb-4 whitespace-nowrap">
                        Real-time parking availability across Singapore.
                      </p>

                      <Link
                        to="/explore"
                        className="inline-flex items-center gap-2 bg-[#660000] text-white px-4 sm:px-6 py-2 sm:py-3 rounded-md font-bold text-xs uppercase tracking-widest hover:bg-[#7a0000] transition-all"
                      >
                        Open Map <ArrowRight size={14} />
                      </Link>

                    </div>

                  </motion.div>
                </header>

              </div>
            </div>

            <div className="bg-surface-container-low p-6 sm:p-8 lg:p-10 rounded-2xl border w-full">
              <h3 className="text-lg font-bold uppercase mb-6 text-center">
                Smart Parking Insights
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                <div className="p-4 bg-white rounded-xl text-center">
                  <p className="font-bold text-sm">Hotspots</p>
                  <p className="text-xs text-gray-500">
                    Orchard • Marina Bay • Bugis
                  </p>
                </div>

                <div className="p-4 bg-white rounded-xl text-center">
                  <p className="font-bold text-sm">Best Time</p>
                  <p className="text-xs text-gray-500">
                    10 AM – 12 PM
                  </p>
                </div>

                <div className="p-4 bg-white rounded-xl text-center">
                  <p className="font-bold text-sm">Tip</p>
                  <p className="text-xs text-gray-500">
                    Avoid 6–8 PM rush hour
                  </p>
                </div>

              </div>
            </div>

            <div className="bg-surface-container-low rounded-2xl p-6 sm:p-8 lg:p-10 border text-center w-full">

              <div className="flex justify-center items-center mb-6 gap-2">
                <h3 className="text-lg font-bold uppercase">
                  Live Parking Overview
                </h3>
                <BarChart2 className="text-[#660000]" />
              </div>

              <div className="grid grid-cols-3 text-center items-center">

                <div className="flex flex-col items-center justify-center">
                  <p className="text-2xl font-black">{available}</p>
                  <p className="text-xs uppercase">Available</p>
                </div>

                <div className="flex flex-col items-center justify-center">
                  <p className="text-2xl font-black">{occupied}</p>
                  <p className="text-xs uppercase">Occupied</p>
                </div>

                <div className="flex flex-col items-center justify-center">
                  <p className="text-2xl font-black text-[#660000]">7 PM</p>
                  <p className="text-xs uppercase">Peak</p>
                </div>

              </div>

              <div className="mt-6 h-2 bg-gray-300 rounded-full overflow-hidden">
                <motion.div
                  animate={{ width: `${(occupied / totalParking) * 100}%` }}
                  className="h-full bg-[#660000]"
                />
              </div>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">

              <div className="bg-surface-container p-6 rounded-2xl w-full">
                <h3 className="text-xs uppercase font-bold mb-4 text-center">
                  Prediction Insight
                </h3>

                <div className="flex items-center gap-3 mb-3">
                  <AlertTriangle className="text-[#660000]" />
                  <p className="text-sm">High congestion at 7 PM</p>
                </div>

                <div className="flex items-center gap-3">
                  <TrendingUp className="text-[#660000]" />
                  <p className="text-sm">Best time: 10 AM – 12 PM</p>
                </div>
              </div>

              <div className="bg-[#660000] text-white p-6 rounded-2xl flex flex-col justify-center w-full">
                <h3 className="font-bold mb-2 text-center">System Status</h3>
                <p className="text-sm mb-3 text-center">
                  Singapore Smart Parking Network Online
                </p>

                <div className="flex items-center justify-center gap-2 text-xs font-bold">
                  <ShieldCheck size={16} />
                  Operational
                </div>
              </div>

            </div>

          </section>

        </div>
      </main>

      <style>{`
        @keyframes bgMove {
          0% { transform: scale(1.05); }
          100% { transform: scale(1.15); }
        }

        @keyframes bgMoveMobile {
          0% { transform: scale(1.02); }
          100% { transform: scale(1.06); }
        }
      `}</style>

    </div>
  );
}