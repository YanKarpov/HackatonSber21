const express = require('express');
const mysql = require('mysql2');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Создание подключения к базе данных MySQL
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'qwerty',
    database: 'sber'
});

// Подключение к базе данных MySQL
connection.connect(err => {
    if (err) {
        return console.error('Ошибка подключения к MySQL:', err);
    }
    console.log('Подключено к MySQL');
});

// Middleware для парсинга JSON
app.use(express.json());

// Middleware для обслуживания статических файлов из корня проекта
app.use(express.static(path.join(__dirname))); // Обслуживание файлов из корня проекта

// Обработчик для корневого маршрута
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html')); // Убедитесь, что файл index.html находится в корне проекта
});

// Пример маршрута для получения данных из таблицы skills
app.get('/api/skills', (req, res) => {
    connection.query('SELECT * FROM skills', (err, results) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.json(results);
    });
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});