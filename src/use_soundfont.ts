import Soundfont from 'soundfont-player';
import {soundfontInstrumentNames} from './soundfont_instrument_names';

export const setupSoundfont = async (instrument: typeof soundfontInstrumentNames[number]) => {
    const sf = await Soundfont.instrument(new AudioContext(), instrument);
    return sf;
}
