import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import {
  Building2,
  Landmark,
  TreePine,
  Star,
  Calendar,
  ChevronDown,
  X
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import findparkgo from "../../components/images/findparkgo.png";

export default function History() {

  const initialLocations = [
    {
      id: 1,
      name: "Marina Bay Sands Parking",
      type: "Integrated Resort",
      area: "Marina Bay • Basement B2",
      status: "Available",
      statusColor: "bg-green-800",
      favorite: true,
      active: false,
      icon: Building2,
      distance: "1.2 km",
      slots: "120 slots"
    },
    {
      id: 2,
      name: "Orchard Central Parking",
      type: "Shopping District",
      area: "Orchard Road • Level 6",
      status: "Full",
      statusColor: "bg-red-900",
      favorite: false,
      active: false,
      icon: Landmark,
      distance: "3.5 km",
      slots: "0 slots"
    },
    {
      id: 3,
      name: "Gardens by the Bay Lot",
      type: "Tourist Attraction",
      area: "Bay South • Open Lot A",
      status: "Available",
      statusColor: "bg-green-800",
      favorite: true,
      active: false,
      icon: TreePine,
      distance: "2.0 km",
      slots: "85 slots"
    },
    {
      id: 4,
      name: "Changi Airport Terminal 3",
      type: "Airport Parking",
      area: "Terminal 3 • Basement 1",
      status: "Available",
      statusColor: "bg-green-800",
      favorite: false,
      active: false,
      icon: Building2,
      distance: "18 km",
      slots: "300 slots"
    },
    {
      id: 5,
      name: "VivoCity HarbourFront",
      type: "Mall Parking",
      area: "HarbourFront • Zone C",
      status: "Full",
      statusColor: "bg-red-900",
      favorite: false,
      active: false,
      icon: Landmark,
      distance: "6.1 km",
      slots: "0 slots"
    }
  ];

  const [locations, setLocations] = useState(initialLocations);
  const [visibleCount, setVisibleCount] = useState(3);
  const [filterRange, setFilterRange] = useState("7");
  const [openCalendar, setOpenCalendar] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);

  const buttonRef = useRef(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });

  const toggleCalendar = () => {
    if (!openCalendar && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + 8,
        left: rect.left,
        width: rect.width
      });
    }
    setOpenCalendar(!openCalendar);
  };

  const toggleFavorite = (id) => {
    setLocations(prev =>
      prev.map(loc =>
        loc.id === id ? { ...loc, favorite: !loc.favorite } : loc
      )
    );
  };

  const setActive = (id) => {
    const loc = locations.find(l => l.id === id);
    setSelectedLocation(loc);

    setLocations(prev =>
      prev.map(loc =>
        loc.id === id
          ? { ...loc, active: true }
          : { ...loc, active: false }
      )
    );
  };

  const loadMore = () => {
    setVisibleCount(prev => prev + 2);
  };

  const options = [
    { value: "7", label: "Last 7 Days" },
    { value: "30", label: "Last 30 Days" },
    { value: "90", label: "Last 90 Days" },
    { value: "all", label: "All Time" }
  ];

  const selectedLabel =
    options.find(o => o.value === filterRange)?.label;

  return (
    <div className="flex flex-col min-h-screen">

      <div className="px-4 sm:px-6 md:px-10 xl:px-16 2xl:px-24 max-w-[1800px] mx-auto pt-24 sm:pt-28">

        <div className="relative rounded-2xl overflow-hidden">

          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${findparkgo})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              animation: 'bgMove 20s ease-in-out infinite alternate',
              transform: 'scale(1.08)',
            }}
          />

          <div className="absolute inset-0 bg-black/60" />

          <div className="relative z-10 p-6 sm:p-8 lg:p-10">

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-6"
            >
              <span className="text-white font-bold tracking-[0.2em] uppercase text-[10px] opacity-90">
                Park ‘n Spot History Dashboard
              </span>

              <h1 className="text-2xl sm:text-3xl md:text-4xl xl:text-5xl font-black text-white leading-tight mt-2">
                WHERE EVERY SPACE BECOMES A MOMENT OF CONVENIENCE
              </h1>

              <p className="text-white/80 text-xs sm:text-sm max-w-xl mt-2">
                Track your parking history across Singapore — Marina Bay, Orchard Road, Changi Airport and more.
              </p>
            </motion.div>

            {/* CALENDAR BUTTON */}
            <div className="relative w-fit">

              <button
                ref={buttonRef}
                onClick={toggleCalendar}
                className="flex items-center gap-2 bg-[#660000] px-4 py-2 rounded-md text-white text-xs font-bold uppercase tracking-widest"
              >
                <Calendar size={16} />
                <span>{selectedLabel}</span>
                <ChevronDown
                  size={16}
                  className={cn(
                    "transition-transform duration-200",
                    openCalendar ? "rotate-180" : "rotate-0"
                  )}
                />
              </button>

            </div>

          </div>
        </div>
      </div>

      {openCalendar && (
        <div
          className="fixed z-50 bg-white rounded-md shadow-lg overflow-hidden"
          style={{
            top: dropdownPos.top,
            left: dropdownPos.left,
            width: dropdownPos.width
          }}
        >
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                setFilterRange(opt.value);
                setOpenCalendar(false);
              }}
              className={cn(
                "w-full text-left px-4 py-2 text-sm hover:bg-gray-100",
                filterRange === opt.value && "bg-gray-200 font-bold"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      <main className="py-12 px-6 md:px-12 lg:px-24 max-w-7xl mx-auto w-full">

        <div className="space-y-4">

          {locations.slice(0, visibleCount).map((loc) => (
            <motion.div
              key={loc.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActive(loc.id)}
              className={cn(
                "p-5 rounded-xl border cursor-pointer transition-all bg-white",
                loc.active ? "border-[#660000] shadow-lg" : "border-gray-200"
              )}
            >
              <div className="flex justify-between items-start">

                <div className="flex items-center gap-3">

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(loc.id);
                    }}
                  >
                    <Star
                      size={18}
                      className={loc.favorite ? "fill-yellow-500 text-yellow-500" : "text-gray-400"}
                    />
                  </button>

                  <div className="w-10 h-10 flex items-center justify-center text-[#660000]">
                    <loc.icon size={18} />
                  </div>

                  <div>
                    <h4 className="font-bold text-sm md:text-base">{loc.name}</h4>
                    <p className="text-xs opacity-70">{loc.type}</p>
                    <p className="text-[11px] opacity-60">{loc.area}</p>
                  </div>

                </div>

                <span className={cn(
                  "text-[10px] uppercase font-bold text-white px-2 py-1 rounded",
                  loc.statusColor
                )}>
                  {loc.status}
                </span>

              </div>

            </motion.div>
          ))}

        </div>

        {visibleCount < locations.length && (
          <div className="flex justify-center mt-8">
            <button
              onClick={loadMore}
              className="px-5 py-2 bg-[#660000] text-white rounded-lg hover:opacity-90"
            >
              Load More
            </button>
          </div>
        )}

      </main>

      {selectedLocation && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
          onClick={() => setSelectedLocation(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white w-[90%] max-w-md rounded-xl p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >

            <button
              onClick={() => setSelectedLocation(null)}
              className="absolute top-3 right-3 text-gray-500"
            >
              <X size={18} />
            </button>

            <h2 className="text-lg font-bold text-[#660000]">
              {selectedLocation.name}
            </h2>

            <p className="text-sm opacity-70 mt-1">
              {selectedLocation.type}
            </p>

            <div className="mt-4 space-y-3 text-sm">

              <div className="flex justify-between bg-gray-50 border-l-4 border-[#660000] px-3 py-2 rounded-md">
                <span>📍 Location</span>
                <span className="text-[#660000] font-bold">{selectedLocation.area}</span>
              </div>

              <div className="flex justify-between bg-gray-50 border-l-4 border-[#660000] px-3 py-2 rounded-md">
                <span>🚗 Status</span>
                <span>{selectedLocation.status}</span>
              </div>

              <div className="flex justify-between bg-gray-50 border-l-4 border-[#660000] px-3 py-2 rounded-md">
                <span>📏 Distance</span>
                <span className="text-[#660000] font-bold">{selectedLocation.distance}</span>
              </div>

              <div className="flex justify-between bg-gray-50 border-l-4 border-[#660000] px-3 py-2 rounded-md">
                <span>🅿️ Slots</span>
                <span className="text-[#660000] font-bold">{selectedLocation.slots}</span>
              </div>

            </div>

          </motion.div>
        </div>
      )}

      <style>{`
        @keyframes bgMove {
          0% { transform: scale(1.05); }
          100% { transform: scale(1.15); }
        }
      `}</style>

    </div>
  );
}