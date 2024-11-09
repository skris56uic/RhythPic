import "./MainPanel.css";
import starboyImage_1 from "../assets/STARBOY_01.jpeg";
import starboyImage_2 from "../assets/STARBOY_02.jpg";
import starboyImage_3 from "../assets/STARBOY_03.jpg";
import starboyImage_4 from "../assets/STARBOY_04.jpg";
import starboyImage_5 from "../assets/STARBOY_05.jpg";
import starboyImage_6 from "../assets/STARBOY_06.jpg";

export default function MainPanel({
	width,
	opencloselyricspanel,
	openclosetriviapanel,
}) {
	return (
		<div className="mainpanel" style={{ width: `${width}vw` }}>
			<img
				className="generatedimage"
				src={starboyImage_1}
				alt="Starboy"
				style={{ width: `${width}vw` }}
			/>
			<div className="sidebarbuttons">
				<div className="sidebarbutton" onClick={opencloselyricspanel}>
					<svg
						className="sidebaricon"
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="currentColor"
					>
						<path
							fillRule="evenodd"
							d="M19.952 1.651a.75.75 0 0 1 .298.599V16.303a3 3 0 0 1-2.176 2.884l-1.32.377a2.553 2.553 0 1 1-1.403-4.909l2.311-.66a1.5 1.5 0 0 0 1.088-1.442V6.994l-9 2.572v9.737a3 3 0 0 1-2.176 2.884l-1.32.377a2.553 2.553 0 1 1-1.402-4.909l2.31-.66a1.5 1.5 0 0 0 1.088-1.442V5.25a.75.75 0 0 1 .544-.721l10.5-3a.75.75 0 0 1 .658.122Z"
							clipRule="evenodd"
						/>
					</svg>
					<div>Lyrics</div>
				</div>

				<div className="sidebarbutton" onClick={openclosetriviapanel}>
					<svg
						className="sidebaricon"
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="currentColor"
					>
						<path
							fillRule="evenodd"
							d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0 0 16.5 9h-1.875a1.875 1.875 0 0 1-1.875-1.875V5.25A3.75 3.75 0 0 0 9 1.5H5.625ZM7.5 15a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5A.75.75 0 0 1 7.5 15Zm.75 2.25a.75.75 0 0 0 0 1.5H12a.75.75 0 0 0 0-1.5H8.25Z"
							clipRule="evenodd"
						/>
						<path d="M12.971 1.816A5.23 5.23 0 0 1 14.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 0 1 3.434 1.279 9.768 9.768 0 0 0-6.963-6.963Z" />
					</svg>
					<div>Trivia</div>
				</div>
			</div>
		</div>
	);
}
