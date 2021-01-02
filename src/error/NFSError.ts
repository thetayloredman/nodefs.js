/*
 * nodefs.js -- Node.js filesystem library
 * Copyright (C) 2020  BadBoyHaloCat
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import type ErrorData from './ErrorData';

const messages: Map<string, ErrorData> = new Map();

/**
 * Extend an error of some sort into a NFSError
 * @param Base Base error to extend
 * @returns The generated error
 * @ignore
 */
function makeNFSError(Base: typeof Error) {
    return class NFSError extends Base {
        public constructor(key: string, ...args: string[] | ((...args: any[]) => string)[]) {
            super(message(key, ...args));
            this.code = key;
            if (Error.captureStackTrace) Error.captureStackTrace(this, NFSError);
        }

        public code: string;

        public get name(): string {
            return `${super.name} [${this.code}]`;
        }
    };
}

/**
 * Format the message for an error
 * @param key Error key
 * @param args Args to pass to util.format or function
 * @returns Formatted string
 * @ignore
 */
function message(key: string, ...args: string[] | ((...args: any[]) => string)[]): string {
    const msg = messages.get(key);
    if (!msg) {
        throw new Error(`An invalid error message key was used: ${key}.`);
    }
    if (typeof msg === 'function') {
        return msg(...args);
    }
    if (args === undefined || args.length === 0) {
        return msg;
    }
    // @ts-ignore
    args.unshift(msg);
    return String(...args);
}

/**
 * Register an error code and message.
 * @param sym Unique name for the error
 * @param val Value of the error
 * @ignore
 */
function register(sym: string, val: ErrorData) {
    messages.set(sym, typeof val === 'function' ? val : String(val));
}

// Export
/** @ignore */
const _Error = makeNFSError(Error);
/** @ignore */
const _TypeError = makeNFSError(TypeError);
/** @ignore */
const _RangeError = makeNFSError(RangeError);

export { register, _Error as Error, _TypeError as TypeError, _RangeError as RangeError };
