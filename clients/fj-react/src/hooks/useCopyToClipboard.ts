import { toaster } from "@/components/Toaster";
import { useCallback, useState } from "react";

type CopiedValue = string | null;

type CopyFn = (text: string) => Promise<boolean>;

export function useCopyToClipboard(): [CopiedValue, CopyFn] {
	const [copiedText, setCopiedText] = useState<CopiedValue>(null);

	const copy: CopyFn = useCallback(async (text) => {
		if (!navigator?.clipboard) {
			toaster.warning({
				description: "Clipboard API is not supported in this browser.",
				title: "Copy Failed",
			});
			return false;
		}

		// Try to save to clipboard then save it in the state if worked
		try {
			await navigator.clipboard.writeText(text);
			setCopiedText(text);
			toaster.success({
				description: "Copied to clipboard!",
				title: "Success",
			});
			return true;
		} catch (error) {
			console.warn("Copy failed", error);
			toaster.error({
				description: "Failed to copy to clipboard.",
				title: "Copy Failed",
			});
			setCopiedText(null);
			return false;
		}
	}, []);

	return [copiedText, copy];
}
