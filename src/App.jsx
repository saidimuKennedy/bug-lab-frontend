import Home from "./pages/Home";
import Scientists from "./pages/Scientists";
import Bugs from "./pages/Bugs";
import Navbar from "./components/Navbar";
import "./styles/App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
	return (
		<Router>
			{" "}
			<div className="App">
				<Navbar />
				<main className="container">
					<Routes>
						<Route path="/" element={<Home />} />
						<Route path="/bugs" element={<Bugs />} />
						<Route path="/scientists" element={<Scientists />} />
					</Routes>
				</main>
			</div>
		</Router>
	);
}

export default App;
