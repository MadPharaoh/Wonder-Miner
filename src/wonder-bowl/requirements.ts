import type { MachineSystem } from '../modules/MachineSystem'

export type RequirementFn = (
   system: MachineSystem,
   prefernces: { cpu: boolean; gpu: boolean; cpuOverridden: boolean; gpuOverridden: boolean  } 

) => boolean

/**
 * @param ram 
 *@returns */

export const hasCpu = (ram: number): RequirementFn => (system, preferences) =>
  preferences.cpu &&
  (preferences.cpuOverridden ||
    (system.memLayout !== undefined &&
      system.memLayout.reduce((amount, memory) => amount + memory.size, 0) >= ram * 1024 * 1024))


/**
 * @param framework
 * @param vram
 * @returns */ 

 export const hasGpu = (framework: '*' | 'cuda' | 'opencl', vram: number): RequirementFn => (system, preferences) =>
 preferences.gpu&&
 (preferences.gpuOverridden ||
    (system.graphics !== undefined &&
      system.graphics.controllers.some((controller) => {
        const intel = controller.vendor.toLowerCase().includes('intel')
        if (intel) {
          return false
        }

        const nvidia = controller.vendor.toLowerCase().includes('nvidia')
        if (framework === 'cuda' && !nvidia) {
          return false
        }

        if (framework === 'opencl' && nvidia) {
          return false
        }

        const amount = controller.memoryTotal !== undefined ? controller.memoryTotal : controller.vram ?? 0
        return amount >= vram * 0.9
      })))

