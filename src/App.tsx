import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LogIn from "./pages/LogIn";
import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<LandingPage/>} />

        {/* Login Page */}
        <Route path="/login" element={<LogIn/>} />
      </Routes>
    </Router>
  );
}

export default App;