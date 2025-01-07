// hooks/log-error.ts
import type { HookContext, NextFunction } from '../declarations'
import { logger } from '../logger'

// Глобальный обработчик ошибок
export const logError = async (context: HookContext, next: NextFunction) => {
  try {
    await next()
  } catch (error: any) {
    // Логирование ошибки
    logger.error(error.stack)

    // Логирование данных ошибки (например, валидационные ошибки)
    if (error.data) {
      logger.error('Data: %O', error.data)
    }

    throw error // Повторно выбрасываем ошибку
  }
}

