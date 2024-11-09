import { useState } from "react";

import SidePanel from "./SidePanel";
import MainPanel from "./MainPanel";

import "./Home.css";

export default function Home() {
	const [sidepanelstate, setsidepanelstate] = useState("closed");

	function opencloselyricspanel() {
		if (sidepanelstate === "closed") {
			setsidepanelstate("lyrics");
		} else if (sidepanelstate === "trivia") {
			setsidepanelstate("lyrics");
		} else {
			setsidepanelstate("closed");
		}
	}

	function openclosetriviapanel() {
		if (sidepanelstate === "closed") {
			setsidepanelstate("trivia");
		} else if (sidepanelstate === "lyrics") {
			setsidepanelstate("trivia");
		} else {
			setsidepanelstate("closed");
		}
	}

	return (
		<div className="home">
			<MainPanel
				width={sidepanelstate === "closed" ? 100 : 75}
				opencloselyricspanel={opencloselyricspanel}
				openclosetriviapanel={openclosetriviapanel}
			/>
			<SidePanel width={25} sidepanelstate={sidepanelstate} />
		</div>
	);
}
