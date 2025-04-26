require('dotenv').config(); 
const axios = require('axios');
const fs = require('fs');

const username = process.env.USERNAME21;
const password = process.env.PASSWORD;
const clientId = process.env.CLIENT_ID;
const authUrl = process.env.AUTH_URL;  

async function getAccessToken() {
  try {
    const params = new URLSearchParams();
    params.append('client_id', clientId);
    params.append('username', username);
    params.append('password', password);
    params.append('grant_type', 'password');

    const response = await axios.post(authUrl, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const token = response.data.access_token;

    fs.writeFileSync('token.json', JSON.stringify({ access_token: token }, null, 2));

    console.log('Access token сохранён в файл token.json');
  } catch (error) {
    console.error('Ошибка при получении токена:');
    if (error.response) {
      console.error(error.response.status, error.response.data);
    } else {
      console.error(error.message);
    }
  }
}

getAccessToken();
