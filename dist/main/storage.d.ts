/**
 * Binary file format for macro storage
 *
 * File format:
 * - Header (16 bytes)
 *   - Magic number: "CLKM" (4 bytes)
 *   - Version: uint16 (2 bytes)
 *   - Event count: uint32 (4 bytes)
 *   - Reserved: (6 bytes)
 * - Event data (variable length)
 *   - Event type: uint8 (1 byte)
 *   - Timestamp: double (8 bytes)
 *   - Event-specific data (variable)
 */
import { MacroEvent } from './events';
export declare class MacroFile {
    static save(filepath: string, events: MacroEvent[]): void;
    static load(filepath: string): MacroEvent[];
    private static encodeEvent;
    private static decodeEvent;
}
//# sourceMappingURL=storage.d.ts.map