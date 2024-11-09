import "./Dashboard.css";

export default function Dashboard() {
	return (
		<div className="dashboard">
			<div className="playlists">
				<h2>Recently Played</h2>
				<div className="songlist">
					<div className="songtile">Song</div>
				</div>
			</div>
			<div className="queuedsongs">
				<h2>Queued Songs</h2>
				<div className="songlist">
					<div className="songtile">Song</div>
				</div>
			</div>
		</div>
	);
}
