import React from 'react';
import { Link } from 'react-router-dom';
import {Nav, Footer ,SpeechListener} from '../sections/index.js';
const Dashboard = () => {
  const scrollToSection = () => {
    const section = document.getElementById('scroll-target');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };
  return (
    <>
      <Nav />
      <h1>hi</h1>
      <SpeechListener />
      <Footer />
    </>
  );
};

export default Dashboard;