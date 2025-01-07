import { app } from './app'
import { logger } from './logger'

const port = app.get('port')
const host = app.get('host')

process.on('unhandledRejection', (reason) => logger.error('Unhandled Rejection %O', reason))

// Прослушивание входящих запросов
app.listen(port)
  .then(server => {
    logger.info(`Feathers app listening on http://${host}:${port}`)
  })
  .catch(error => {
    logger.error('Ошибка при запуске приложения:', error)
  })
