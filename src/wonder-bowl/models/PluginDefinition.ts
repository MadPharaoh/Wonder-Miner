import { FileDefinition } from "./FileDefinition";
import { ErrorDefinition } from "./ErrorDefinition";
import { RequirementFn } from "../requirements";

export interface PluginDefinition {
    name: string
    downloadUrl: string
    exe: string
    args?: string
    runningCheck: string
    errors?: ErrorDefinition[]
    requirements: RequirementFn[]
    fileChecks?: string[]
    extraFiles?: FileDefinition[]
    autoRestart?: boolean
}
