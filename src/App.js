import React from 'react';
import './index.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import BookingForm from './components/BookingForm';

function App() {
  return (
    <Router>
      <div className='bg-[#2b5251] h-screen px-3 py-1 font-mono'>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/booking-form" element={<BookingForm />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
