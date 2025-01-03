import React, {useEffect } from 'react';
import domo from 'ryuu.js';

const BookingForm = () => {

  useEffect(() => {
    const fetchData = async() => {
      const data = await domo.get('/data/v1/booking_data');
      console.log("data", data)
    }
    fetchData()
  }, [])

  return (
    <div>
      
    </div>
  );
};

export default BookingForm;
