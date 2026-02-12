import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LogIn from "./pages/LogIn";
import "./App.css";
import ApplicationsPage from "./pages/Application";

function App() {
  return (
    <Router>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<LandingPage/>} />

        {/* Login Page */}
        <Route path="/login" element={<LogIn/>} />
          <Route path="/applications" element={<ApplicationsPage/>} />

      </Routes>
    </Router>
  );
}

export default App;