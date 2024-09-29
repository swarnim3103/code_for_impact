import React from 'react';
import { Link } from 'react-router-dom';
import {Nav, Footer ,SpeechListener} from '../sections/index.js';
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
      <Footer />
    </>
  );
};

export default Dashboard;