import React, { useState, useEffect } from 'react';
import fsLogo2 from '../assets/fs_logo1.png';
import domo from "ryuu.js";
import { useNavigate } from 'react-router-dom';
import { FaBook } from 'react-icons/fa';
import seedrandom from 'seedrandom';
// import { FaBed, FaDollarSign, FaUsers, FaUserTimes } from "react-icons/fa";


const Home = () => {
  const [hotelData, setHotelData] = useState([]);
  const [selectedHotel, setSelectedHotel] = useState("");
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [bookingCount, setBookingCount] = useState(0); // Add this state
  const [occupancyData, setOccupancyData] = useState([]);
  const [roomStats, setRoomStats] = useState({
    totalRooms: 0,
    occupiedRooms: 0,
    unoccupiedRooms: 0,
  });
  const navigate = useNavigate();

  const revenueData = {
    "Four Seasons Hotel Mumbai": 494656417.28,
    "Four Seasons Resort Jaipur": 626949991.61,
    "Four Seasons Hotel Paris": 6783058064.81,
    "Four Seasons Resort Mahe Island": 2202875326.27,
    "Four Seasons Resort Ubud": 991208021.6,
    "Four Seasons Resort Koh Samui": 1956580183.78,
    "Four Seasons Hotel New York": 4601567944.47,
    "Four Seasons Resort Orlando": 6311622060.8,
    "Four Seasons Hotel Kyoto": 1739201315.33,
    "Four Seasons Hotel Bangalore": 674403115.66,
  };

  const isWeekend = () => {
    const today = new Date();
    const day = today.getDay();
    return day === 6 || day === 0; 
  };


  const fetchData = async () => {
    try {
      const data = await domo.get("/data/v1/hotel_data");
      setHotelData(data);
      console.log('hotel data', data)
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchBookingData = async () => {
    try {
      const data = await domo.get("/data/v1/booking_data");
      console.log('booked data', data);
  
      // We filter by hotel name to count bookings for a specific hotel
      const bookingsForSelectedHotel = data.filter((booking) => 
        booking.Hotel_Name === selectedHotel && booking.Occupancy_Status === "Occupied"
      );
  
      // Set the booking count (this counts all "Occupied" status rooms for the selected hotel)
      setBookingCount(bookingsForSelectedHotel.length);

      updateRoomStats(selectedHotel); 
    } catch (error) {
      console.error("Error fetching booking data:", error);
    }
  };
  
  useEffect(() => {
    fetchData();
    fetchBookingData();
  }, []);
  

  useEffect(() => {
    // Update room stats only after hotelData is loaded
    if (hotelData.length > 0) {
      updateRoomStats();
    }
  }, [hotelData]);

  const handleHotelSelection = (event) => {
    const hotel = event.target.value;
    setSelectedHotel(hotel);
    updateRoomStats(hotel); // Update stats based on selected hotel
  };

  // const updateRoomStats = (hotel = "") => {
  //   const filteredData = hotel ? hotelData.filter((item) => item.Hotel_Name === hotel) : hotelData;

  //   const totalRooms = filteredData.length;
  //   const rng = seedrandom(hotel || 'default-seed'); // Use a hotel name or default seed
  //   const occupiedPercentage = isWeekend() ? 0.75 + rng() * 0.1 : 0.65 + rng() * 0.1;
  //   const occupiedRooms = Math.floor(totalRooms * occupiedPercentage);
  //   const unoccupiedRooms = totalRooms - occupiedRooms;

  //   setRoomStats({
  //     totalRooms,
  //     occupiedRooms,
  //     unoccupiedRooms,
  //   });

  //   if (hotel && revenueData[hotel]) {
  //     setTotalRevenue(revenueData[hotel]);
  //   } else {
  //     const totalRevenueAllHotels = Object.values(revenueData).reduce((acc, revenue) => acc + revenue, 0);
  //     setTotalRevenue(totalRevenueAllHotels);
  //   }

  //   setOccupancyData(generateOccupancyTableData(occupiedRooms, totalRooms));
  // };

  const updateRoomStats = (hotel = "") => {
  const filteredData = hotel ? hotelData.filter((item) => item.Hotel_Name === hotel) : hotelData;
  const totalRooms = filteredData.length;

  // If the selected hotel has no rooms, skip updates
  if (totalRooms === 0) {
    setRoomStats({
      totalRooms: 0,
      occupiedRooms: 0,
      unoccupiedRooms: 0,
    });
    return;
  }

  const rng = seedrandom(hotel || 'default-seed'); // Use a hotel name or default seed
  const occupiedPercentage = isWeekend() ? 0.75 + rng() * 0.1 : 0.65 + rng() * 0.1;
  const occupiedRooms = Math.floor(totalRooms * occupiedPercentage);

  // Use booking count to adjust occupied and unoccupied rooms
  const adjustedOccupiedRooms = Math.min(occupiedRooms + bookingCount, totalRooms); // Ensure it doesn't exceed total rooms
  const unoccupiedRooms = totalRooms - adjustedOccupiedRooms;

  setRoomStats({
    totalRooms,
    occupiedRooms: adjustedOccupiedRooms,
    unoccupiedRooms,
  });

  if (hotel && revenueData[hotel]) {
    setTotalRevenue(revenueData[hotel]);
  } else {
    const totalRevenueAllHotels = Object.values(revenueData).reduce((acc, revenue) => acc + revenue, 0);
    setTotalRevenue(totalRevenueAllHotels);
  }

  setOccupancyData(generateOccupancyTableData(adjustedOccupiedRooms, totalRooms));
};

  
  const generateOccupancyTableData = (occupiedRooms, totalRooms) => {
    const rows = 5; // 5 weeks (rows)
    const columns = 7; // 7 days a week (columns)
    const tableData = [];

    // Generate a unique seed based on hotelId to ensure consistency for each hotel
    const hotelSeed = occupiedRooms; // Directly use hotel ID for uniqueness

    // Simple pseudo-random number generator (PRNG)
    const random = (seed) => {
      // A simple hash function to generate a pseudo-random number based on the seed
      return (Math.sin(seed) * 10000) % 1;
    };

    for (let i = 0; i < rows; i++) {
      const weekData = [];
      for (let j = 0; j < columns; j++) {
        let occupancyPercentage;
        const randomFactor = random(hotelSeed + i + j); // Combine seed with row and column for variation

        if (j === 0 || j === 6) {
          occupancyPercentage = 80 + randomFactor * 15; // Weekend occupancy higher
        } else {
          occupancyPercentage = 70 + randomFactor * 10; // Weekday occupancy
        }

        weekData.push(occupancyPercentage);
      }
      tableData.push(weekData);
    }
    return tableData;
  };

  const getColorForPercentage = (percentage) => {
    if (percentage < 75) {
      return "bg-[#f0aca7]"; // Below 75%
    }
    if (percentage >= 75 && percentage <= 80) {
      return "bg-[#f6cf8b]"; // 75-84%
    }
    return "bg-[#82a7ab]"; // 85% or above
  };

  const formatRevenue = (value) => {
    if (value >= 1_000_000_000) {
      return `${(value / 1_000_000_000).toFixed(1)}B`;
    }
    if (value >= 1_000_000) {
      return `${(value / 1_000_000).toFixed(1)}M`;
    }
    if (value >= 1_000) {
      return `${(value / 1_000).toFixed(1)}K`;
    }
    return `$${value.toFixed(2)}`;
  };

  const hotels = [...new Set(hotelData.map((item) => item.Hotel_Name))];

  const handleBookNowClick = () => {
    navigate('/booking-form');
  };

  return (
    <div>
      <div className='flex justify-between items-center'>
        <nav className='flex justify-start items-center p-2'>
          <img src={fsLogo2} alt="FS Logo" className="w-[70px] h-[70px] object-cover rounded-full mr-3 bg-white" />
          <div className='flex flex-col'>
            <span className="text-md text-[#035B61] font-semibold spacing">FOUR SEASONS</span>
            <span className="text-xs text-[#035B61] spacing italic">Hotels and Resorts</span>
          </div>
        </nav>
        <button
          className="cursor-pointer bg-[#035B61] mr-5 text-white shadow-lg rounded-lg flex items-center justify-center w-[200px] h-[45px] transition-transform duration-300 transform hover:scale-105 hover:shadow-2xl hover:rotate-7"
          onClick={handleBookNowClick}
        >
          <FaBook className='text-md mr-3' />
          <span className="text-md font-bold">Book Your Stay</span>
        </button>
      </div>
      <div className='text-center font-serif'>
        <h4 className='italic font-semibold text-lg text-white spacing'>A Toast to the spirit of the season</h4>
      </div>
      <div className="container mx-auto mt-6">
        {/* Cards Container - All cards in a single row */}
        <div className="flex justify-between gap-4 mb-6">
          {/* Card 1: Total Rooms */}
          <div className="bg-[#035B61] p-6 shadow-lg rounded-lg flex flex-col items-center justify-center w-1/5 transition-transform duration-300 transform hover:scale-105 hover:shadow-2xl hover:rotate-7">
            <div className="flex items-center justify-center space-x-4">
              <div>
                <span className="text-md font-bold text-white">Total Rooms</span>
                <p className="text-2xl text-center text-[#FB8D43] font-bold">{roomStats.totalRooms > 0 ? roomStats.totalRooms : 0}</p>
              </div>
            </div>
          </div>

          {/* Card 2: Occupied Rooms */}
          <div className="bg-[#035B61] p-6 shadow-lg rounded-lg flex flex-col items-center justify-center w-1/5 transition-transform duration-300 transform hover:scale-105 hover:shadow-2xl hover:rotate-7">
            <div className="flex items-center justify-center space-x-4">
              <div>
                <span className="text-md text-white font-bold">Occupied Rooms</span>
                <p className="text-2xl text-center text-[#FB8D43] font-bold">{roomStats.occupiedRooms > 0 ? roomStats.occupiedRooms : 0}</p>
              </div>
            </div>
          </div>

          {/* Card 3: Unoccupied Rooms */}
          <div className="bg-[#035B61] p-6 shadow-lg rounded-lg flex flex-col items-center justify-center w-1/5 transition-transform duration-300 transform hover:scale-105 hover:shadow-2xl hover:rotate-5">
            <div className="flex items-center justify-center space-x-4">
              <div>
                <h3 className="text-md font-bold text-white">Unoccupied Rooms</h3>
                <p className="text-2xl text-center font-bold text-[#FB8D43]">{roomStats.unoccupiedRooms > 0 ? roomStats.unoccupiedRooms : 0}</p>
              </div>
            </div>
          </div>

          {/* Card 4: Total Revenue */}
          <div className="bg-[#035B61] p-6 shadow-lg rounded-lg flex flex-col items-center justify-center w-1/5 transition-transform duration-300 transform hover:scale-105 hover:shadow-2xl hover:rotate-5">
            <div className="flex items-center justify-center space-x-4">
              <div>
                <span className="text-md font-bold text-white">Total Revenue</span>
                <p className="text-2xl text-center font-bold text-[#FB8D43]">{formatRevenue(totalRevenue)}</p>
              </div>
            </div>
          </div>

          {/* Card 5: Select Hotel */}
          <div className="bg-[#035B61] p-4 shadow-lg rounded-lg flex flex-col items-center justify-center w-1/5 transition-transform duration-300 transform hover:scale-105 hover:shadow-2xl hover:rotate-5">
            <div className="flex items-center justify-center space-x-4">
              <select
                value={selectedHotel}
                onChange={handleHotelSelection}
                className="lg:w-64 md:w-32 h-11 p-3 border border-gray-300 rounded-md"
                style={{ zIndex: 10, position: "relative" }}
              >
                <option value="">SELECT HOTEL</option>
                {hotels.map((hotel, index) => (
                  <option key={index} value={hotel}>
                    {hotel}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Table remains unchanged */}
        <div className="mt-4">
          <h2 className="font-serif italic font-semibold text-white mb-1">Hotel Weekly Occupancy Table</h2>
          <table className="w-full table-auto border border-gray-300">
            <thead>
              <tr className="bg-gray-500 text-white">
                <th className="px-4 py-2 border">Week / Day</th>
                <th className="px-4 py-2 border">Sun</th>
                <th className="px-4 py-2 border">Mon</th>
                <th className="px-4 py-2 border">Tue</th>
                <th className="px-4 py-2 border">Wed</th>
                <th className="px-4 py-2 border">Thu</th>
                <th className="px-4 py-2 border">Fri</th>
                <th className="px-4 py-2 border">Sat</th>
              </tr>
            </thead>
            <tbody>
              {occupancyData.map((week, weekIndex) => (
                <tr key={weekIndex}>
                  <td className="px-4 py-2 text-sm text-center text-white bg-gray-500 font-semibold border">Week {weekIndex + 1}</td>
                  {week.map((percentage, dayIndex) => (
                    <td
                      key={dayIndex}
                      className={`px-4 py-2 text-sm text-center font-semibold border ${getColorForPercentage(
                        percentage,
                        dayIndex === 0 || dayIndex === 6 // Check if it's weekend (Sunday/Saturday)
                      )}`}
                    >
                      {percentage.toFixed(1)}%
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          <div className='mt-3 font-serif'>
            <span className='italic font-semibold text-white'>Click on 'View Analysis' to Explore Detailed Information</span>
          </div>

          <div className="flex flex-row gap-4 justify-center mt-6 overflow-hidden relative">
            {/* Card 1: Booking Analysis */}
            <div className="slider-card bg-[#035B61] p-6 shadow-lg rounded-lg flex flex-col items-center justify-center w-1/6 h-24 animation-delay-0">
              <span className="text-sm text-white font-bold mb-2">Booking Analysis</span>
              <div className="md:w-28 lg:w-36 border-1 h-10 text-center text-white bg-[#FB8D43] rounded-lg">
                <div
                  onClick={() =>
                    domo.navigate("https://gwcteq-partner.domo.com/app-studio/2146868099/pages/484663001")
                  }
                  className="cursor-pointer w-[150px] p-2 text-center text-sm"
                >
                  View Analysis
                </div>
              </div>
            </div>

            {/* Card 2: Financial Performance */}
            <div className="slider-card bg-[#035B61] p-6 shadow-lg rounded-lg flex flex-col items-center justify-center w-1/6 h-24 animation-delay-2">
              <span className="text-sm text-white font-bold mb-2">Financial Performance</span>
              <div className="md:w-28 lg:w-36 border-1 h-10 text-center text-white bg-[#FB8D43] rounded-lg">
                <div
                  onClick={() =>
                    domo.navigate("https://gwcteq-partner.domo.com/app-studio/2146868099/pages/967539995")
                  }
                  className="cursor-pointer w-[150px] p-2 text-center text-sm"
                >
                  View Analysis
                </div>
              </div>
            </div>

            {/* Card 3: Guest & Customer Insights */}
            <div className="slider-card bg-[#035B61] p-6 shadow-lg rounded-lg flex flex-col items-center justify-center w-1/6 h-24 animation-delay-4">
              <span className="text-sm text-white font-bold mb-2">Guest & Customer Insights</span>
              <div className="md:w-28 lg:w-36 border-1 h-10 text-center text-white bg-[#FB8D43] rounded-lg">
                <div
                  onClick={() =>
                    domo.navigate("https://gwcteq-partner.domo.com/app-studio/2146868099/pages/1869224667")
                  }
                  className="cursor-pointer w-[150px] p-2 text-center text-sm"
                >
                  View Analysis
                </div>
              </div>
            </div>

            {/* Card 4: Marketing & Operational */}
            <div className="slider-card bg-[#035B61] p-6 shadow-lg rounded-lg flex flex-col items-center justify-center w-1/6 h-24 animation-delay-6">
              <span className="text-sm text-white font-bold mb-2">Marketing & Operational</span>
              <div className="md:w-28 lg:w-36 border-1 h-10 text-center text-white bg-[#FB8D43] rounded-lg">
                <div
                  onClick={() =>
                    domo.navigate("https://gwcteq-partner.domo.com/app-studio/2146868099/pages/679387174")
                  }
                  className="cursor-pointer w-[150px] p-2 text-center text-sm"
                >
                  View Analysis
                </div>
              </div>
            </div>
          </div>

          <style jsx>{`
  .slider-card {
    animation: moveLeft 8s infinite ease-in-out;
  }

  .animation-delay-0 {
    animation-delay: 0s;
  }
  .animation-delay-2 {
    animation-delay: 2s;
  }
  .animation-delay-4 {
    animation-delay: 4s;
  }
  .animation-delay-6 {
    animation-delay: 6s;
  }

  @keyframes moveLeft {
    0%, 100% {
      transform: translateX(0);
    }
    50% {
      transform: translateX(-10px);
    }
  }
`}</style>
        </div>
      </div>
    </div>
  )
}

export default Home;


