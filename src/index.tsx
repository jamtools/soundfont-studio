import React, { useState } from 'react';

import '@jamtools/core/modules/macro_module/macro_module';
import './styles.css';

import springboard from 'springboard';
// @platform "browser"
import {setupSoundfont} from './use_soundfont';
// @platform end

import {useModule} from './hooks/use_module';
import {Player} from 'soundfont-player';
import {soundfontInstrumentNames} from './soundfont_instrument_names';
import {useOctaveKeyboardShortcuts} from './hooks/useOctaveKeyboardShortcuts';
import { MidiKeyboardModal } from './components/MidiKeyboardModal';

springboard.registerModule('example', {}, async (app) => {
    const currentInstrument = await app.statesAPI.createUserAgentState<typeof soundfontInstrumentNames[number]>('currentInstrument', 'marimba')
    const qwertyOctave = await app.statesAPI.createUserAgentState<number>('qwertyOctave', 4);

    app.deps.module.moduleRegistry.getModule('macro').setLocalMode(true);

    // @platform "browser"
    let sf = await setupSoundfont(currentInstrument.getState());
    // @platform end

    let heldDownNotes = new Map<string, Player>();

    const midiMacros = await app.deps.module.moduleRegistry.getModule('macro').createMacros(app, {
        keyboardInput: {
            type: 'musical_keyboard_input',
            config: {
                enableQwerty: true,
                onTrigger: midiEvent => {
                    let noteNumber = midiEvent.event.number;

                    if (midiEvent.deviceInfo.name === 'qwerty') {
                        noteNumber += qwertyOctave.getState() * 12;
                    }

                    const note = noteNumber.toString();

                    if (midiEvent.event.type === 'noteon') {
                        const player = sf.start(note, undefined, {
                            // loop: true,
                        });
                        heldDownNotes.set(note, player);
                    } else {
                        const player = heldDownNotes.get(note);
                        if (player) {
                            player.stop();
                            heldDownNotes.delete(note);
                        }
                    }
                },
            },
        },
    });


    app.registerRoute('/', {}, () => {
        const instruments = soundfontInstrumentNames;
        const [isModalOpen, setIsModalOpen] = useState(false);

        const qwertyOctaveState = qwertyOctave.useState();

        useOctaveKeyboardShortcuts({
            onOctaveUp: () => qwertyOctave.setState(prev => prev + 1),
            onOctaveDown: () => qwertyOctave.setState(prev => prev - 1)
        });

        return (
            <div className="app-container">
                <div className="main-content">
                    <header className="header">
                        <h1 className="app-title">Soundfont Studio</h1>
                        <p className="app-subtitle">Play virtual instruments with your keyboard</p>
                    </header>

                    <div className="control-panel">
                        <div className="control-group">
                            <label className="control-label">Instrument</label>
                            <select
                                className="instrument-selector"
                                value={currentInstrument.useState()}
                                onChange={async e => {
                                    currentInstrument.setState(e.target.value as typeof instruments[number]);
                                    sf.stop();
                                    sf = await setupSoundfont(e.target.value as typeof instruments[number]);
                                }}
                            >
                                {instruments.map(instrument => (
                                    <option key={instrument} value={instrument}>
                                        {instrument.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="control-group compact">
                            <label className="control-label">QWERTY Octave</label>
                            <div className="octave-controls compact">
                                <button 
                                    className="octave-button compact"
                                    onClick={() => qwertyOctave.setState(prev => prev - 1)}
                                    aria-label="Decrease QWERTY octave"
                                >
                                    −
                                </button>
                                <div className="octave-display compact">
                                    {qwertyOctaveState}
                                </div>
                                <button 
                                    className="octave-button compact"
                                    onClick={() => qwertyOctave.setState(prev => prev + 1)}
                                    aria-label="Increase QWERTY octave"
                                >
                                    +
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="keyboard-actions">
                        <button 
                            className="keyboard-config-button"
                            onClick={() => setIsModalOpen(true)}
                        >
                            Choose MIDI Keyboard Input
                        </button>
                    </div>

                    <div className="info-panel">
                        <div className="info-card">
                            <h3>Keyboard Shortcuts</h3>
                            <p>
                                <span className="keyboard-shortcuts">Z/X</span> - Change octave<br/>
                                <span className="keyboard-shortcuts">QWERTY</span> - Play notes
                            </p>
                        </div>
                        <div className="info-card">
                            <h3>MIDI Support</h3>
                            <p>Connect your MIDI keyboard to play with hardware instruments</p>
                        </div>
                    </div>
                </div>
                
                <MidiKeyboardModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    keyboardComponent={midiMacros.keyboardInput.components.edit as React.ComponentType}
                />
            </div>
        );
    });

    return {

    };
})