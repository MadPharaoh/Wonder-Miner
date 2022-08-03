import { STANDARD_ERRORS } from "../errors";
import { PluginDefinition } from "../../models/PluginDefinition";
import { Profile } from "../../../modules/Profile";
import { download } from "../XmrigDownload";
import { hasCpu } from "../../requirements";

export const createXmrigPluginDefinitions = (profile: Profile): PluginDefinition => {
    return {
        name: 'XMRig',
        downloadUrl: download.windowsUrl,
        exe: 'xmrig.exe',
        args: `${profile.settings} ${profile.username}`,
        runningCheck: '(?:accepted|[1-9][0-9]*\\.\\d* H\\/s)',
        errors: [...STANDARD_ERRORS],
        requirements: [hasCpu(3072)]
    }
}
