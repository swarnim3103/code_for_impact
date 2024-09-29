import React from 'react';
import { Link } from 'react-router-dom';
import {Nav, Footer ,SpeechListener , Pronunciation , Library} from '../sections/index.js';
import { navlinks } from '../constants/index.js';
const Dashboard = () => {
  const scrollToSection = () => {
    const section = document.getElementById('scroll-target');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };
  return (
    <>
      <Nav page="services"/>
      
      <SpeechListener />
      <div className='flex'>
        <div className='flex-1'>
       <img src="./src/assets/icons/download (1).jpeg"/>
        </div>
      <div className='flex-1'>
      <Pronunciation />
      <Library />
      </div>
      
      </div>
      
      <Footer />
    </>
  );
};

export default Dashboard;