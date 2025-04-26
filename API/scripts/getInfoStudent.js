const fs = require('fs');
const csv = require('csv-parser');
const axios = require('axios');
const mysql = require('mysql2/promise'); 

const tokenData = JSON.parse(fs.readFileSync('token.json'));
const token = tokenData.access_token;

const apiBase = 'https://edu-api.21-school.ru/services/21-school/api/v1';
const csvFilePath = 'users.csv';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'qwerty',
  database: 'sber',
};

let db; 

async function fetchAndUpdateLevel(login, retries = 3) {
  const url = `${apiBase}/participants/${login}`;
  let attempt = 0;

  while (attempt < retries) {
    try {
      const res = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        timeout: 10000,
      });

      const level = res.data.level;

      console.log(`Логин ${login}: уровень ${level}`);

      const [result] = await db.execute(
        'UPDATE my_table SET level = ? WHERE Логин = ?',
        [level, login]
      );

      if (result.affectedRows === 0) {
        console.warn(`⚠️ Логин ${login} не найден в базе`);
      }

      return;
    } catch (err) {
      attempt++;
      if (attempt >= retries) {
        if (err.response) {
          console.error(`${login}, Ошибка: ${err.response.status} ${err.response.statusText} - ${JSON.stringify(err.response.data)}`);
        } else if (err.request) {
          console.error(`${login}, Ошибка: Нет ответа - ${err.message}`);
        } else {
          console.error(`${login}, Ошибка: ${err.message}`);
        }
      } else {
        console.log(`${login}, повторная попытка ${attempt}/${retries}`);
        await new Promise(res => setTimeout(res, 3000));
      }
    }
  }
}

async function processUsersWithThrottle(delayBetweenRequests) {
  const userLogins = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream(csvFilePath)
      .pipe(csv({ separator: ';' }))
      .on('data', (row) => {
        const login = row['Логин'];
        if (login) {
          userLogins.push(login);
        }
      })
      .on('end', async () => {
        console.log(`Считано ${userLogins.length} логинов`);

        for (const login of userLogins) {
          await fetchAndUpdateLevel(login);
          console.log(`Ждем ${delayBetweenRequests / 1000} секунд...`);
          await new Promise(res => setTimeout(res, delayBetweenRequests));
        }

        console.log('Обработка завершена');
        resolve();
      })
      .on('error', (err) => {
        reject(err);
      });
  });
}

async function start() {
  const delayBetweenRequests = 2000; 

  db = await mysql.createConnection(dbConfig);
  console.log('Подключено к базе');

  await processUsersWithThrottle(delayBetweenRequests);

  await db.end();
  console.log('Подключение к базе закрыто');
}

start().catch((err) => {
  console.error('Ошибка в процессе:', err);
});
