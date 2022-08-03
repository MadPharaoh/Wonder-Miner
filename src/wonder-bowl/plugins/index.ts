import { Profile } from "../../modules/Profile";
import { PluginDefinition } from "../models/PluginDefinition";
import { createXmrigPluginDefinitions } from "./windows/XMRig-test";
import process from "process";
import { createXmrigPluginDefinitionsLinux } from "./linux/XMRig-linux";
import { createPhoenixMinerPluginDefinition } from "./windows/PhoenixMiner-test";
import { createPhoenixMinerPluginDefinitionLinux } from "./linux/PhoenixMiner-linux";

export const getPluginDefinitionsXMRig = (profile: Profile, platform = process.platform): PluginDefinition => {
    let pluginDefinition: PluginDefinition
    switch (platform) {
        case 'linux':
            pluginDefinition = createXmrigPluginDefinitionsLinux(profile)
            break
        case 'win32':
            pluginDefinition = createXmrigPluginDefinitions(profile)
            break
        //** TO DO Add MacOS */
        default: 
        pluginDefinition = createXmrigPluginDefinitions(profile)
            break
    }
    return pluginDefinition 
}

export const getPluginDefinitionsPhoenix = (profile: Profile, platform = process.platform): PluginDefinition => {
    let pluginDefinition: PluginDefinition
    switch (platform) {
        case 'linux':
            pluginDefinition = createPhoenixMinerPluginDefinitionLinux(profile)
            break
        case 'win32':
            pluginDefinition = createPhoenixMinerPluginDefinition(profile)
            break
        //** TO DO Add MacOS */
        default:
            pluginDefinition = createPhoenixMinerPluginDefinition(profile)
            break
    }
    return pluginDefinition
}

