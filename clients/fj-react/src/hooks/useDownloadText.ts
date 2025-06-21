import { useCallback } from "react";

export default function useDownloadText() {
	const downloadText = useCallback((filename: string, text: string) => {
		const blob = new Blob([text], { type: "text/plain" });
		const link = document.createElement("a");
		link.href = URL.createObjectURL(blob);
		link.download = filename;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(link.href);
	}, []);

	// Return the download function

	return downloadText;
}
