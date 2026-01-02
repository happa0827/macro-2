/**
 * Macro playback engine
 */
import { MacroEvent } from './events';
export type PlayerCallback = () => void;
export type LoopCallback = (current: number, total: number) => void;
export type EventCallback = (event: MacroEvent) => void;
export declare class Player {
    private playing;
    private stopRequested;
    private currentLoop;
    private totalLoops;
    onStart?: PlayerCallback;
    onStop?: PlayerCallback;
    onLoop?: LoopCallback;
    onEvent?: EventCallback;
    constructor();
    get isPlaying(): boolean;
    get currentLoopCount(): number;
    play(events: MacroEvent[], loops?: number): Promise<void>;
    stop(): void;
    private playOnce;
    private executeEvent;
    private executeMouseEvent;
    private executeKeyboardEvent;
    private convertButton;
    private getKeyFromCode;
    private sleep;
}
//# sourceMappingURL=player.d.ts.map