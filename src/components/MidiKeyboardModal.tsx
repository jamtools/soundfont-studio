import React from 'react';
import { Modal } from './Modal';

interface MidiKeyboardModalProps {
    isOpen: boolean;
    onClose: () => void;
    keyboardComponent: React.ComponentType;
}

export const MidiKeyboardModal: React.FC<MidiKeyboardModalProps> = ({ 
    isOpen, 
    onClose, 
    keyboardComponent: KeyboardComponent 
}) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="MIDI Keyboard Input Configuration"
        >
            <div className="midi-keyboard-modal-content">
                <p className="modal-description">
                    Configure your MIDI keyboard input settings. You can use your computer keyboard or connect a MIDI device.
                </p>
                <div className="keyboard-container modal-keyboard">
                    <KeyboardComponent />
                </div>
                <div className="modal-footer">
                    <button className="modal-button modal-button-primary" onClick={onClose}>
                        Done
                    </button>
                </div>
            </div>
        </Modal>
    );
};