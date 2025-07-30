import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HeroSection from './components/shared/HeroSection';
import RoleSelection from './components/shared/RoleSelection';
import Dashboard from './components/shared/Dashboard';
import AuthPage from './components/shared/AuthPage';
import LoginForm from './components/shared/LoginForm';
import SignUpForm from './components/shared/SignUpForm';
import QuizPreview from './components/shared/QuizPreview';
import TemplateGallery from './components/shared/TemplateGallery';
import Scoreboard from './components/shared/Scoreboard';
import QuizVideo from './components/shared/QuizVideo';
import HostDashboard from './components/host/HostDashboard';
import HostLobby from './components/host/HostLobby';
import HostQuestion from './components/host/HostQuestion';

import PlayerJoin from './components/player/PlayerJoin';
import PlayerLobby from './components/player/PlayerLobby';
import PlayerGamePage from './components/player/PlayerGamePage';
import PlayerQuestion from './components/player/PlayerQuestion';
import PlayerScoreboard from './components/player/PlayerScoreboard';



export default function App(): React.JSX.Element {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HeroSection />} />
        <Route path="/role" element={<RoleSelection />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/host/preview/:id" element={<QuizPreview />} />
        <Route path="/host" element={<HostDashboard />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/signup" element={<SignUpForm />} />
        <Route path="/host-lobby/:gameCode" element={<HostLobby />} />
        <Route path="/join" element={<PlayerJoin />} />
        <Route path="/player-lobby/:gameCode" element={<PlayerLobby />} />
        <Route path="/host-game/:gameCode/:questionIndex" element={<HostQuestion />} />
        <Route path="/player-game/:gameCode" element={<PlayerGamePage />} />
        <Route path="/scoreboard/:gameCode" element={<Scoreboard />} />
        <Route path="/player/:gameCode/scoreboard" element={<PlayerScoreboard />} />
        <Route path="/video" element={<QuizVideo />} />
        <Route path="/templates" element={<TemplateGallery />} />

      </Routes>
    </Router>
  );
}
