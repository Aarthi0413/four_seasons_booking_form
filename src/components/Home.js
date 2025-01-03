import React from 'react';
import fsLogo from '../assets/fs_logo1.png';
import { useNavigate } from 'react-router-dom';
import { FaBook } from 'react-icons/fa'

const Home = () => {
    const navigate = useNavigate();

    const handleBookNowClick = () => {
        navigate('/booking-form');
    };

    return (
        <div>
            <div className='flex justify-between items-center'>
                <nav className='flex justify-start items-center p-2'>
                    <img src={fsLogo} alt="FS Logo" className="w-[70px] h-[70px] object-cover rounded-full mr-3 bg-white" />
                    <div className='flex flex-col'>
                        <span className="text-md text-white font-semibold spacing">FOUR SEASONS</span>
                        <span className="text-xs text-white spacing italic">Hotels and Resots</span>
                    </div>
                </nav>
                <button
                    className="cursor-pointer bg-gray-300 shadow-lg rounded-lg flex items-center justify-center w-[150px] h-[45px] transition-transform duration-300 transform hover:scale-105 hover:shadow-2xl hover:rotate-7"
                    onClick={handleBookNowClick}
                >
                    <FaBook className='text-md mr-3' />
                    <span className="text-md font-bold">Book Now</span>
                </button>
            </div>
            <div className='text-center font-serif'>
                <h4 className='italic font-semibold text-lg text-white spacing'>A Toast to the spirit of the season</h4>
            </div>
            <div className="grid grid-cols-5 gap-5 mt-14">
                {/* Card 1 */}
                <div className="bg-gray-300 p-8 shadow-lg rounded-lg flex items-center justify-center transition-transform duration-300 transform hover:scale-105 hover:shadow-2xl hover:rotate-7">
                    <span className="text-2xl font-bold">1</span>
                </div>
                {/* Card 2 */}
                <div className="bg-gray-300 p-8 shadow-lg rounded-lg flex items-center justify-center transition-transform duration-300 transform hover:scale-105 hover:shadow-2xl hover:rotate-7">
                    <span className="text-2xl font-bold">2</span>
                </div>
                {/* Card 3 */}
                <div className="bg-gray-300 p-8 shadow-lg rounded-lg flex items-center justify-center transition-transform duration-300 transform hover:scale-105 hover:shadow-2xl hover:rotate-5">
                    <span className="text-2xl font-bold">3</span>
                </div>
                {/* Card 4 */}
                <div className="bg-gray-300 p-8 shadow-lg rounded-lg flex items-center justify-center transition-transform duration-300 transform hover:scale-105 hover:shadow-2xl hover:rotate-5">
                    <span className="text-2xl font-bold">4</span>
                </div>
                {/* Card 5 */}
                <div className="bg-gray-300 p-8 shadow-lg rounded-lg flex items-center justify-center transition-transform duration-300 transform hover:scale-105 hover:shadow-2xl hover:rotate-5">
                    <span className="text-2xl font-bold">5</span>
                </div>
            </div>

        </div>
    )
}

export default Home
