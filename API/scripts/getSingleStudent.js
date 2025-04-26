const fs = require('fs');
const axios = require('axios');

const tokenData = JSON.parse(fs.readFileSync('token.json'));
const token = tokenData.access_token;

const apiBase = 'https://edu-api.21-school.ru/services/21-school/api/v1';

const login = 'bachmapl'; // Указываем один логин

async function fetchParticipantData(login) {
  const url = `${apiBase}/participants/${login}`;
  
  try {
    const res = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      timeout: 10000 // Таймаут на запрос
    });

    const data = res.data;
    console.log([
      data.login,
      data.className,
      data.parallelName,
      data.level,
      data.expValue,
      data.expToNextLevel,
      data.campus.shortName,
      data.status,
    ].join(','));
  } catch (err) {
    if (err.response) {
      console.error(`${login}, ERROR: ${err.response.status} ${err.response.statusText} - ${JSON.stringify(err.response.data)}`);
    } else if (err.request) {
      console.error(`${login}, ERROR: No response received - ${err.message}`);
    } else {
      console.error(`${login}, ERROR: ${err.message}`);
    }
  }
}

async function startProcess() {
  console.log(`Обрабатываем логин: ${login}`);
  await fetchParticipantData(login); 
  console.log('Завершено');
}

startProcess().catch((err) => {
  console.error('Ошибка при обработке:', err);
});
