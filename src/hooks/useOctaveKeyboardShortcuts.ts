import { useEffect } from 'react';

interface UseOctaveKeyboardShortcutsProps {
    onOctaveUp: () => void;
    onOctaveDown: () => void;
}

export function useOctaveKeyboardShortcuts({
    onOctaveUp,
    onOctaveDown
}: UseOctaveKeyboardShortcutsProps) {
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key.toLowerCase() === 'z') {
                onOctaveDown();
            } else if (event.key.toLowerCase() === 'x') {
                onOctaveUp();
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [onOctaveUp, onOctaveDown]);
}