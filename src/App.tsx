import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './screens/Home';
import About from './screens/About';
import PrivacyPolicy from './screens/PrivacyPolicy';
import Clock from './screens/Clock';
import ForTime from './screens/ForTime';
import Amrap from './screens/Amrap';
import Emom from './screens/Emom';
import Tabata from './screens/Tabata';
import Complex from './screens/Complex';
import CustomHeader from './components/CustomHeader';
import PageView from './components/PageView';
import RotateHint from './components/RotateHint';
import InstallPrompt from './components/InstallPrompt';

const App: React.FC = () => {
  return (
    <Router>
      <PageView />
      <CustomHeader />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/clock" element={<Clock />} />
        <Route path="/for-time" element={<ForTime />} />
        <Route path="/amrap" element={<Amrap />} />
        <Route path="/emom" element={<Emom />} />
        <Route path="/tabata" element={<Tabata />} />
        <Route path="/complex" element={<Complex />} />
        <Route path="/about" element={<About />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      </Routes>
      <RotateHint />
      <InstallPrompt />
    </Router>
  );
};

export default App;
