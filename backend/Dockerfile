# Используем официальный Node.js образ
FROM node:18

# Рабочая директория внутри контейнера
WORKDIR /app

# Копируем package.json и package-lock.json
COPY ./package.json ./package-lock.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем все файлы из папки бэкенда
COPY ./ ./

# Собираем TypeScript проект
RUN npm run build

# Открываем порт 3000 для сервиса
EXPOSE 3030

# Запускаем приложение
CMD ["npm", "run", "dev"]
