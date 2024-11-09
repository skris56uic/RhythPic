import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Dashboard from "./components/Dashboard";
import MusicPlayer from "./components/MusicPlayer";

import "./App.css";

function App() {
	return (
		<BrowserRouter>
			<div className="app">
				<Navbar />
				<Routes>
					<Route path="/" element={<Dashboard />} />
					<Route path="/musicplayer" element={<MusicPlayer />} />
				</Routes>
				<Footer />
			</div>
		</BrowserRouter>
	);
}

export default App;
