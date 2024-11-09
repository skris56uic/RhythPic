import "./SidePanel.css";

export default function SidePanel({ width, sidepanelstate }) {
	return (
		<div className="sidepanel" style={{ width: `${width}vw` }}>
			<div className="sidepaneltile">{sidepanelstate}</div>
		</div>
	);
}
