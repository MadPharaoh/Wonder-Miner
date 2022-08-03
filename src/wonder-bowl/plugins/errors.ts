import { ErrorAction } from "../models/ErrorAction";
import { ErrorCategory } from "../models/ErrorCategory";

let ErrorCode = 100000000

const antiVirusErrorMessages: string[] = [
    'not recognized as an internal or external command',
    'cannot find the path specified',
    'cannot access the file because it is being used',
    'The system cannot execute the specified program',
    'The system cannot find the file',
    'Command is either misspelt or could not be found',
    'The process cannot access the file because it is being used by another process',
    'Anti-hacking system detected modification of the miner memory',
]

export const STANDARD_ERRORS = antiVirusErrorMessages.map((message, index) => {
    if (index !== 0) {
        ErrorCode += 2
    }
    return {
        message: message,
        errorCode: ErrorCode,
        errorCategory: ErrorCategory.AntiVirus,
        errorAction: ErrorAction.Ignore,
    }
})

