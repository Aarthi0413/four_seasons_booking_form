import React, { useEffect, useState } from "react";
import domo from "ryuu.js";
import { useNavigate } from "react-router-dom";
import { MdOutlineCancel } from "react-icons/md";

const BookingForm = () => {
  const [hotelData, setHotelData] = useState([]);
  const [selectedHotel, setSelectedHotel] = useState("");
  const [selectedSegment, setSelectedSegment] = useState("");
  const [selectedRoomType, setSelectedRoomType] = useState("");
  const [selectedRoomID, setSelectedRoomID] = useState([]);
  const [price, setPrice] = useState(0);
  const [totalDays, setTotalDays] = useState(0);
  const [checkingDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [segments, setSegments] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [roomIDs, setRoomIDs] = useState([]);
  const [warningMessage, setWarningMessage] = useState("");
  const [bookedData, setBookedData] = useState([]);
  const [formData, setFormData] = useState({});
  const navigate = useNavigate();


  // Fetch data on load
  const fetchData = async () => {
    try {
      const data = await domo.get("/data/v1/hotel_data");
      console.log('fetched data', data)
      setHotelData(data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchBookingData = async () => {
    try {
      const data = await domo.get("/data/v1/booking_data");
      setBookedData(data.map((booking) => booking.Room_ID));
      console.log('booked data', data)
    } catch (error) {
      console.error("Error fetching booking data:", error);
    }
  }

  useEffect(() => {
    fetchData();
    fetchBookingData();
  }, []);

  useEffect(() => {
    const filteredData = hotelData.filter((item) => {
      return (
        (!selectedHotel || item.Hotel_Name === selectedHotel) &&
        (!selectedSegment || item.Segment === selectedSegment) &&
        (!selectedRoomType || item.Room_Type === selectedRoomType)
      );
    });

    // Update dependent dropdowns
    setSegments([...new Set(filteredData.map((item) => item.Segment))]);
    setRoomTypes([...new Set(filteredData.map((item) => item.Room_Type))]);
    setRoomIDs([...new Set(filteredData.map((item) => item.Room_ID))]);

    // Update price if available
    if (filteredData.length > 0) {
      // Calculate price based on selected rooms
      const selectedRooms = filteredData.filter((item) =>
        selectedRoomID.includes(item.Room_ID)
      );
      const totalRoomPrice = selectedRooms.reduce(
        (acc, room) => acc + room.Price,
        0
      );
      setPrice(totalRoomPrice);
    } else {
      setPrice(0);
    }
  }, [selectedHotel, selectedSegment, selectedRoomType, selectedRoomID, hotelData]);

  const handleSelectionChange = (field, value) => {
    switch (field) {
      case "hotel":
        setSelectedHotel(value);
        setSelectedSegment("");
        setSelectedRoomType("");
        setSelectedRoomID([]);
        break;
      case "segment":
        setSelectedSegment(value);
        setSelectedRoomType("");
        setSelectedRoomID([]);
        break;
      case "roomType":
        setSelectedRoomType(value);
        setSelectedRoomID([]);
        break;
      case "roomID":
        const selectedRoomIDValue = value.target.value; // Correctly access the value
        const isBooked = bookedData.includes(selectedRoomIDValue); // Check if room is booked

        if (isBooked) {
          setWarningMessage(`Room ${selectedRoomIDValue} is already booked. Please select another room.`);
          setSelectedRoomID(""); // Reset selection
        } else {
          setWarningMessage("");
          setSelectedRoomID(selectedRoomIDValue);
        }
        break;
      default:
        break;
    }
  };

  const handleDateChange = (event) => {
    const { name, value } = event.target;

    if (name === "Check_In_Date") {
      setCheckInDate(value);

      // Calculate days and update price if check-out date is set
      if (checkOutDate) {
        const checkIn = new Date(value);
        const checkOut = new Date(checkOutDate);
        const days = Math.max(0, (checkOut - checkIn) / (1000 * 3600 * 24));
        setTotalDays(days);
        // Recalculate total price based on selected rooms and days
        setPrice(days * selectedRoomID.length * parseFloat(price || 0));
      }
    } else if (name === "Check_Out_Date") {
      setCheckOutDate(value);

      // Calculate days and update price if check-in date is set
      if (checkingDate) {
        const checkIn = new Date(checkingDate);
        const checkOut = new Date(value);
        const days = Math.max(0, (checkOut - checkIn) / (1000 * 3600 * 24));
        setTotalDays(days);
        // Recalculate total price based on selected rooms and days
        setPrice(days * selectedRoomID.length * parseFloat(price || 0));
      }
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const bookingDate = new Date();
    // const formattedBookingDate = `${String(bookingDate.getDate()).padStart(2, '0')}-${String(bookingDate.getMonth() + 1).padStart(2, '0')}-${bookingDate.getFullYear()}`;

    const formData = {
      Guest_Name: event.target.Name.value,
      Mobile: event.target.Phone.value,
      Email: event.target.Email.value,
      Proof_Type: event.target.Proof_Type.value,
      Hotel_Name: selectedHotel,
      Booking_Date: bookingDate,
      Segment: selectedSegment,
      Room_Type: selectedRoomType,
      Room_ID: selectedRoomID,
      Checking_Date: checkingDate,
      Checkout_Date: checkOutDate,
      Total_Days: totalDays,
      Price: price,
      Occupancy_Status: "Occupied",
    };
    setFormData(formData)
    console.log("formData", formData);

    // Now, make the POST request
    try {
      const response = await domo.post(
        "/domo/workflow/v1/models/four_seasons_booking_form/start",
        formData
      );

      if (response.status === 200) {
        console.log("Form submitted successfully");
      }
    } catch (error) {
      console.error("Error updating dataset:", error);
    }
  };


  return (
    <form onSubmit={handleSubmit} className="bg-[#035B61] w-[600px] mx-auto p-5 mt-6 space-y-2 rounded shadow-lg">
      {/* First Row: Guest name */}
      <div className="relative">
        <h3 className="text-xl text-white font-bold text-center">Book Your Stay</h3>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="absolute top-0 right-0 p-2 text-white rounded-md"
        >
          <MdOutlineCancel className="hover:bg-[#FB8D43] rounded-full" size={25} />
        </button>
      </div>
      <div className="grid grid-cols-1 gap-6">
        <div>
          <label className="block text-white">Guest Name:</label>
          <input
            type="text"
            name="Name"
            className="mt-2 p-3 w-full border border-gray-300 rounded-md"
          />
        </div>
      </div>

      {/* Second Row: Email, Phone, Proof Type */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div>
          <label className="block text-white">Email:</label>
          <input
            type="email"
            name="Email"
            className="mt-2 p-3 w-full border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-white">Phone Number:</label>
          <input
            type="text"
            name="Phone"
            className="mt-2 p-3 w-full border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-white">Proof Type:</label>
          <select
            name="Proof_Type"
            className="mt-2 p-3 w-full border border-gray-300 rounded-md"
          >
            <option value="">Select</option>
            <option value="Passport">Passport</option>
            <option value="Aadhaar">Aadhaar</option>
            <option value="Pan">Pan</option>
          </select>
        </div>
      </div>

      {/* Third Row: Hotel Name */}
      <div className="grid grid-cols-1 gap-6">
        <div>
          <label className="block text-white">Hotel Name:</label>
          <select
            name="Hotel_name"
            value={selectedHotel}
            onChange={(e) => handleSelectionChange("hotel", e.target.value)}
            className="mt-2 p-3 w-full border border-gray-300 rounded-md"
          >
            <option value="">Select</option>
            {[...new Set(hotelData.map((hotel) => hotel.Hotel_Name))].map((hotelName) => (
              <option key={hotelName} value={hotelName}>
                {hotelName}
              </option>
            ))}
          </select>
        </div>
      </div>


      {/* Fourth Row: Segment, Room Type, Room ID */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="mt-3">
          <label className="block text-white">Segment:</label>
          <select
            name="Segment"
            value={selectedSegment}
            onChange={(e) => handleSelectionChange("segment", e.target.value)}
            className="mt-2 p-3 w-full border border-gray-300 rounded-md"
          >
            <option value="">Segment</option>
            {segments.map((segment) => (
              <option key={segment} value={segment}>
                {segment}
              </option>
            ))}
          </select>
        </div>
        <div className="mt-3">
          <label className="block text-white">Room Type:</label>
          <select
            name="Room_Type"
            value={selectedRoomType}
            onChange={(e) => handleSelectionChange("roomType", e.target.value)}
            className="mt-2 p-3 w-full border border-gray-300 rounded-md"
          >
            <option value="">Select</option>
            {roomTypes.map((roomType) => (
              <option key={roomType} value={roomType}>
                {roomType}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-3">
          <label className="block text-white">Rooms:</label>
          <select
            name="Room_ID"
            value={selectedRoomID}
            onChange={(e) => handleSelectionChange("roomID", e)} // Pass the event object
            className="mt-2 p-3 w-full border border-gray-300 rounded-md"
          >
            <option value="">Select</option>
            {roomIDs.map((roomID) => {
              const isBooked = bookedData.includes(roomID); // Check if room is booked
              return (
                <option
                  key={roomID}
                  value={roomID}
                  disabled={isBooked} // Disable booked rooms
                  style={{ color: isBooked ? "red" : "black" }} // Style booked rooms in red
                >
                  {roomID} {isBooked ? "(Booked)" : ""}
                </option>
              );
            })}
          </select>

        </div>
      </div>
      {/* Warning Message */}
      {warningMessage && (
        <div className="mt-2 p-3 text-red-500 bg-red-100 rounded-md">
          {warningMessage}
        </div>
      )}


      {/* Fifth Row: Check-In and Check-Out Dates */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-white">Check-In:</label>
          <input
            type="date"
            name="Check_In_Date"
            value={checkingDate}
            onChange={handleDateChange}
            className="mt-2 p-3 w-full border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-white">Check-Out:</label>
          <input
            type="date"
            name="Check_Out_Date"
            value={checkOutDate}
            onChange={handleDateChange}
            className="mt-2 p-3 w-full border border-gray-300 rounded-md"
          />
        </div>
      </div>

      {/* Sixth Row: Total Days and Price */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="mt-3">
          <label className="block text-white">Total Days:</label>
          <input
            type="text"
            name="total_days"
            value={totalDays}
            readOnly
            className="mt-2 p-3 w-full border border-gray-300 rounded-md"
          />
        </div>
        <div className="mt-3">
          <label className="block text-white">Price:</label>
          <input
            type="text"
            name="price"
            value={price}
            readOnly
            className="mt-2 p-3 w-full border border-gray-300 rounded-md"
          />
        </div>
      </div>

      {/* Seventh Row: Submit Button */}
      <div>
        <button
          onClick={() => navigate('/')}
          type="submit"
          className="mt-4 p-3 w-full bg-[#FB8D43] text-white rounded-md hover:bg-orange-500"
        >
          Book Now
        </button>
      </div>
    </form>

  );
};

export default BookingForm;
