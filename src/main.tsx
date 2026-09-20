import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { HelmetProvider } from "react-helmet-async";

// Automatically reload on new deployments when old chunk hashes are replaced on server
window.addEventListener("vite:preloadError", (event) => {
	event.preventDefault();
	window.location.reload();
});

window.addEventListener("error", (event) => {
	if (
		event?.message &&
		(event.message.includes("dynamically imported module") ||
			event.message.includes("Failed to fetch dynamically imported module"))
	) {
		const key = "spa_chunk_reload_lock";
		const lastReload = Number(sessionStorage.getItem(key) || "0");
		if (Date.now() - lastReload > 10000) {
			sessionStorage.setItem(key, String(Date.now()));
			window.location.reload();
		}
	}
});

createRoot(document.getElementById("root")!).render(
	<HelmetProvider>
		<App />
	</HelmetProvider>
);
