/**
 * Business Strategy Core Service (Fase E3).
 *
 * Central registry managing all module libraries (strategies + templates).
 * This is the ONLY internal entry point for strategy discovery and template instantiation.
 *
 * The core is initialized with module libraries at composition time (see index.ts).
 * It never exposes strategy details to the user; those remain internal metadata.
 */

import type {
  ModuleStrategyLibrary,
  BusinessStrategyCore,
} from './ports'
import type { StrategyDescriptor } from '../domain/strategy-descriptor'

export class BusinessStrategyCoreService implements BusinessStrategyCore {
  private readonly modules: Map<string, ModuleStrategyLibrary>

  constructor(libraries: readonly ModuleStrategyLibrary[]) {
    this.modules = new Map(libraries.map(lib => [lib.moduleName, lib]))
  }

  getModuleLibrary(moduleName: string): ModuleStrategyLibrary | null {
    return this.modules.get(moduleName) ?? null
  }

  listModules(): readonly string[] {
    return Array.from(this.modules.keys())
  }

  searchStrategiesByGoal(goal: string): readonly StrategyDescriptor[] {
    const lowerGoal = goal.toLowerCase()
    const results: StrategyDescriptor[] = []

    for (const lib of this.modules.values()) {
      for (const strategy of lib.strategies.getAll()) {
        if (
          strategy.objective.toLowerCase().includes(lowerGoal) ||
          strategy.problemSolved.toLowerCase().includes(lowerGoal) ||
          strategy.description.toLowerCase().includes(lowerGoal) ||
          (strategy.name && strategy.name.toLowerCase().includes(lowerGoal))
        ) {
          results.push(strategy)
        }
      }
    }

    return results
  }
}

/**
 * Helper to create and configure the Business Strategy Core service.
 *
 * @example
 *   import { createBusinessStrategyCore } from '@/lib/business-strategy-core'
 *   import { promotionLibrary } from '@/lib/business-strategy-core/infrastructure/strategies/promotion-strategies'
 *   import { membershipLibrary } from '@/lib/business-strategy-core/infrastructure/strategies/membership-strategies'
 *
 *   const core = createBusinessStrategyCore([promotionLibrary, membershipLibrary])
 *   const promotionLibrary = core.getModuleLibrary('promotions')
 */
export function createBusinessStrategyCore(
  libraries: readonly ModuleStrategyLibrary[],
): BusinessStrategyCoreService {
  return new BusinessStrategyCoreService(libraries)
}
