import { STANDARD_ERRORS } from "../errors";
import { PluginDefinition } from "../../models/PluginDefinition";
import { Profile } from "../../../modules/Profile";
import { download } from "../phoenixDownload";
import { hasGpu } from "../../requirements";

export const createPhoenixMinerPluginDefinitionLinux = (profile: Profile): PluginDefinition => {
    return {
        name: 'PhoenixMiner',
        downloadUrl: download.linuxUrl,
        exe: 'PhoenixMiner',
        args:  `${profile.settings} ${profile.username}`,
        runningCheck:  '(?:Share accepted|[1-9][0-9]*\\.\\d* (?:kh|kH|Kh|KH|mh|mH|Mh|MH)\\/s)',
        errors: [...STANDARD_ERRORS],
        requirements: [hasGpu('*', 3072)]
    } 
}