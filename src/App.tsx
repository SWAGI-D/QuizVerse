import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HeroSection from './components/HeroSection';
import RoleSelection from './components/RoleSelection';
import HostDashboard from './components/HostDashboard';
import SignUpForm from './components/SignUpForm';
import HostLobby from './components/HostLobby';
import PlayerJoin from './components/PlayerJoin';
import PlayerLobby from './components/PlayerLobby';
import HostQuestion from './components/HostQuestion';
import PlayerQuestion from './components/PlayerQuestion';
import FakePlayerQuestion from './components/FakePlayerQuestion';
import Scoreboard from './components/Scoreboard';
import React from 'react';
import PlayerGamePage from './components/PlayerGamePage';
import Dashboard from './components/Dashboard';

export default function App(): React.JSX.Element {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HeroSection />} />
        <Route path="/role" element={<RoleSelection />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/host" element={<HostDashboard />} />
        <Route path="/signup" element={<SignUpForm />} />
        <Route path="/host-lobby/:gameCode" element={<HostLobby />} />
        <Route path="/join" element={<PlayerJoin />} />
        <Route path="/player-lobby/:gameCode" element={<PlayerLobby />} />
        <Route path="/host-game/:gameCode/:questionIndex" element={<HostQuestion />} />
        <Route path="/player-game/:gameCode/:qid" element={<PlayerGamePage />} />
        <Route path="/test-player-game/:gameCode/:qid" element={<FakePlayerQuestion />} />
        <Route path="/scoreboard/:gameCode" element={<Scoreboard />} />
      </Routes>
    </Router>
  );
}
