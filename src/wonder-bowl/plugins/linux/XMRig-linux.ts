import { STANDARD_ERRORS } from "../errors";
import { PluginDefinition } from "../../models/PluginDefinition";
import { Profile } from "../../../modules/Profile";
import { download } from "../XmrigDownload";
import { hasCpu } from "../../requirements";

export const createXmrigPluginDefinitionsLinux = (profile: Profile): PluginDefinition => {
    return {
        name: 'XMRig',
        downloadUrl: download.linuxUrl,
        exe: 'xmrig',
        args: `${profile.settings} ${profile.username}`,
        runningCheck: '(?:accepted|[1-9][0-9]*\\.\\d* H\\/s)',
        errors: [...STANDARD_ERRORS],
        requirements: [hasCpu(3072)]

    }
}