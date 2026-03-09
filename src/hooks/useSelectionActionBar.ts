import { useEffect } from "react";

/**
 * Dispatches a custom event when a floating selection action bar is visible/hidden.
 * Used to hide the floating bot/dock icons on mobile to prevent overlap.
 */
export function useSelectionActionBarVisibility(isVisible: boolean) {
    useEffect(() => {
        window.dispatchEvent(new CustomEvent("selection-action-bar", { detail: { visible: isVisible } }));
        return () => {
            if (isVisible) {
                window.dispatchEvent(new CustomEvent("selection-action-bar", { detail: { visible: false } }));
            }
        };
    }, [isVisible]);
}

/** Listen for selection action bar visibility changes */
export function useHideOnSelectionBar(setHidden: (hidden: boolean) => void) {
    useEffect(() => {
        const handler = (e: Event) => {
            const visible = (e as CustomEvent).detail?.visible;
            setHidden(!!visible);
        };
        window.addEventListener("selection-action-bar", handler);
        return () => window.removeEventListener("selection-action-bar", handler);
    }, [setHidden]);
}
