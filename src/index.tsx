
import React from 'react';

import '@jamtools/core/modules/macro_module/macro_module';

import springboard from 'springboard';
// @platform "browser"
import {setupSoundfont} from './use_soundfont';
// @platform end

import {useModule} from './hooks/use_module';
import {Player} from 'soundfont-player';
import {soundfontInstrumentNames} from './soundfont_instrument_names';
import {useOctaveKeyboardShortcuts} from './hooks/useOctaveKeyboardShortcuts';

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

        const qwertyOctaveState = qwertyOctave.useState();

        useOctaveKeyboardShortcuts({
            onOctaveUp: () => qwertyOctave.setState(prev => prev + 1),
            onOctaveDown: () => qwertyOctave.setState(prev => prev - 1)
        });

        return (
            <div>
                <midiMacros.keyboardInput.components.edit/>

                <select
                    value={currentInstrument.useState()}
                    onChange={async e => {
                        currentInstrument.setState(e.target.value as typeof instruments[number]);
                        sf.stop();
                        sf = await setupSoundfont(e.target.value as typeof instruments[number]);
                    }}
                >
                    {instruments.map(instrument => (
                        <option key={instrument} value={instrument}>{instrument}</option>
                    ))}
                </select>

                <div>
                    <button onClick={() => qwertyOctave.setState(prev => prev - 1)}>
                        - 
                    </button>
                    {qwertyOctaveState}
                    <button onClick={() => qwertyOctave.setState(prev => prev + 1)}>
                        + 
                    </button>
                </div>
            </div>
        )
    });

    return {

    };
})
