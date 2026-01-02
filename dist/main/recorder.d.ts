/**
 * Mouse/Keyboard event recorder
 */
import { MacroEvent } from './events';
export type RecordEventCallback = (event: MacroEvent) => void;
export declare class Recorder {
    private events;
    private startTime;
    private recording;
    private initialized;
    onEvent?: RecordEventCallback;
    get isRecording(): boolean;
    getEvents(): MacroEvent[];
    init(): void;
    start(): void;
    stop(): MacroEvent[];
    destroy(): void;
    private setupListeners;
    private getTimestamp;
    private addEvent;
    private convertMouseButton;
}
//# sourceMappingURL=recorder.d.ts.map