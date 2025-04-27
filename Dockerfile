# Используем более легкую версию Node.js для уменьшения размера образа
FROM node:16-alpine

# Устанавливаем рабочую директорию в контейнере
WORKDIR /app

# Копируем package.json и package-lock.json (если он существует) из папки frontend
COPY frontend/package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем весь контент из папки frontend в контейнер
COPY frontend/ ./  

# Открываем порт 3000 для приложения
EXPOSE 3000

# Запускаем сервер из папки src
CMD ["node", "src/server.js"]  

