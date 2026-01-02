"use strict";
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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MacroFile = void 0;
const fs = __importStar(require("fs"));
const events_1 = require("./events");
const MAGIC = Buffer.from('CLKM');
const VERSION = 1;
class MacroFile {
    static save(filepath, events) {
        const chunks = [];
        // Write header
        const header = Buffer.alloc(16);
        MAGIC.copy(header, 0);
        header.writeUInt16LE(VERSION, 4);
        header.writeUInt32LE(events.length, 6);
        // Reserved bytes 10-15 are already zero
        chunks.push(header);
        // Write events
        for (const event of events) {
            chunks.push(this.encodeEvent(event));
        }
        fs.writeFileSync(filepath, Buffer.concat(chunks));
    }
    static load(filepath) {
        const data = fs.readFileSync(filepath);
        const events = [];
        // Read header
        const magic = data.subarray(0, 4);
        if (!magic.equals(MAGIC)) {
            throw new Error(`Invalid file format: ${magic.toString()}`);
        }
        const version = data.readUInt16LE(4);
        if (version > VERSION) {
            throw new Error(`Unsupported version: ${version}`);
        }
        const eventCount = data.readUInt32LE(6);
        // Read events
        let offset = 16;
        for (let i = 0; i < eventCount; i++) {
            const { event, bytesRead } = this.decodeEvent(data, offset);
            events.push(event);
            offset += bytesRead;
        }
        return events;
    }
    static encodeEvent(event) {
        const chunks = [];
        // Event type (1 byte)
        const typeBuf = Buffer.alloc(1);
        typeBuf.writeUInt8(event.eventType, 0);
        chunks.push(typeBuf);
        // Timestamp (8 bytes)
        const timestampBuf = Buffer.alloc(8);
        timestampBuf.writeDoubleLE(event.timestamp, 0);
        chunks.push(timestampBuf);
        if ((0, events_1.isMouseEvent)(event)) {
            // x, y coordinates (4 bytes each)
            const coordBuf = Buffer.alloc(8);
            coordBuf.writeInt32LE(event.x, 0);
            coordBuf.writeInt32LE(event.y, 4);
            chunks.push(coordBuf);
            if (event.eventType === events_1.EventType.MOUSE_CLICK) {
                // Button (1 byte) + pressed (1 byte)
                const clickBuf = Buffer.alloc(2);
                clickBuf.writeUInt8(event.button || 0, 0);
                clickBuf.writeUInt8(event.pressed ? 1 : 0, 1);
                chunks.push(clickBuf);
            }
            else if (event.eventType === events_1.EventType.MOUSE_SCROLL) {
                // scroll_dx, scroll_dy (4 bytes each)
                const scrollBuf = Buffer.alloc(8);
                scrollBuf.writeInt32LE(event.scrollDx || 0, 0);
                scrollBuf.writeInt32LE(event.scrollDy || 0, 4);
                chunks.push(scrollBuf);
            }
        }
        else if ((0, events_1.isKeyboardEvent)(event)) {
            // Key code (4 bytes)
            const keyCodeBuf = Buffer.alloc(4);
            keyCodeBuf.writeUInt32LE(event.keyCode, 0);
            chunks.push(keyCodeBuf);
            // Key char (1 byte length + UTF-8 string)
            if (event.keyChar) {
                const charBytes = Buffer.from(event.keyChar, 'utf-8');
                const lenBuf = Buffer.alloc(1);
                lenBuf.writeUInt8(charBytes.length, 0);
                chunks.push(lenBuf, charBytes);
            }
            else {
                const lenBuf = Buffer.alloc(1);
                lenBuf.writeUInt8(0, 0);
                chunks.push(lenBuf);
            }
        }
        return Buffer.concat(chunks);
    }
    static decodeEvent(data, offset) {
        let pos = offset;
        // Event type
        const eventType = data.readUInt8(pos);
        pos += 1;
        // Timestamp
        const timestamp = data.readDoubleLE(pos);
        pos += 8;
        if ([events_1.EventType.MOUSE_MOVE, events_1.EventType.MOUSE_CLICK, events_1.EventType.MOUSE_SCROLL].includes(eventType)) {
            // Mouse event
            const x = data.readInt32LE(pos);
            const y = data.readInt32LE(pos + 4);
            pos += 8;
            if (eventType === events_1.EventType.MOUSE_CLICK) {
                const buttonVal = data.readUInt8(pos);
                const pressed = data.readUInt8(pos + 1) === 1;
                pos += 2;
                const event = {
                    eventType: events_1.EventType.MOUSE_CLICK,
                    timestamp,
                    x,
                    y,
                    button: buttonVal ? buttonVal : undefined,
                    pressed,
                };
                return { event, bytesRead: pos - offset };
            }
            else if (eventType === events_1.EventType.MOUSE_SCROLL) {
                const scrollDx = data.readInt32LE(pos);
                const scrollDy = data.readInt32LE(pos + 4);
                pos += 8;
                const event = {
                    eventType: events_1.EventType.MOUSE_SCROLL,
                    timestamp,
                    x,
                    y,
                    scrollDx,
                    scrollDy,
                };
                return { event, bytesRead: pos - offset };
            }
            else {
                const event = {
                    eventType: events_1.EventType.MOUSE_MOVE,
                    timestamp,
                    x,
                    y,
                };
                return { event, bytesRead: pos - offset };
            }
        }
        else {
            // Keyboard event
            const keyCode = data.readUInt32LE(pos);
            pos += 4;
            const charLen = data.readUInt8(pos);
            pos += 1;
            let keyChar;
            if (charLen > 0) {
                keyChar = data.subarray(pos, pos + charLen).toString('utf-8');
                pos += charLen;
            }
            const event = {
                eventType: eventType,
                timestamp,
                keyCode,
                keyChar,
            };
            return { event, bytesRead: pos - offset };
        }
    }
}
exports.MacroFile = MacroFile;
//# sourceMappingURL=storage.js.map