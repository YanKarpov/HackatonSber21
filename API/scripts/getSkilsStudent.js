const fs = require('fs');
const axios = require('axios');
const mysql = require('mysql2/promise');

const tokenData = JSON.parse(fs.readFileSync('token.json'));
const token = tokenData.access_token;

const apiBase = 'https://edu-api.21-school.ru/services/21-school/api/v1';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'qwerty',
  database: 'sber',
};

async function fetchSkillsData(login) {
  const url = `${apiBase}/participants/${login}/skills`;

  try {
    const res = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return res.data.skills.map(skill => ({
      skill_name: skill.name,
      points: skill.points,
    }));
  } catch (err) {
    console.error(`${login}, ERROR: ${err.message}`);
    return [];
  }
}

async function addSkillColumnIfNeeded(connection, skillName) {
  const safeSkillName = skillName.replace(/[^a-zA-Z0-9_]/g, '_');

  try {
    const [columns] = await connection.execute(
      `SHOW COLUMNS FROM user_skills LIKE '${safeSkillName}'`
    );

    if (columns.length === 0) {
      const alterQuery = `ALTER TABLE user_skills ADD COLUMN \`${safeSkillName}\` INT DEFAULT NULL`;
      await connection.execute(alterQuery);
    }
  } catch (error) {
    console.error('Ошибка при добавлении столбца:', error.message);
  }
}

async function checkUserExists(connection, userId) {
  const [rows] = await connection.execute(
    `SELECT COUNT(*) AS count FROM user_skills WHERE user_id = ?`,
    [userId]
  );
  return rows[0].count > 0;
}

async function addUserIfNeeded(connection, userId) {
  const userExists = await checkUserExists(connection, userId);

  if (!userExists) {
    await connection.execute(
      `INSERT INTO user_skills (user_id) VALUES (?)`,
      [userId]
    );
  }
}

async function insertSkillsToDb(connection, userId, skills) {
  await addUserIfNeeded(connection, userId);

  for (const skill of skills) {
    const safeSkillName = skill.skill_name.replace(/[^a-zA-Z0-9_]/g, '_');

    await addSkillColumnIfNeeded(connection, safeSkillName);

    await connection.execute(
      `UPDATE user_skills SET \`${safeSkillName}\` = ? WHERE user_id = ?`,
      [skill.points ?? null, userId]
    );
  }
}

async function processAllUsers() {
  const connection = await mysql.createConnection(dbConfig);

  const [users] = await connection.execute(`SELECT id, Логин FROM my_table WHERE Логин IS NOT NULL`);

  console.log(`Найдено пользователей: ${users.length}`);

  for (const user of users) {
    const userId = user.id;
    const login = user.Логин; // <--- тут правильный Логин

    if (!login) {
      console.warn(`Пропущен user_id=${userId}: нет логина`);
      continue;
    }

    console.log(`Обработка user_id=${userId}, login=${login}`);

    const skills = await fetchSkillsData(login);

    if (skills.length > 0) {
      await insertSkillsToDb(connection, userId, skills);
    }

    await new Promise(resolve => setTimeout(resolve, 500));
  }

  await connection.end();
}

processAllUsers().catch(err => console.error('Ошибка при обработке всех пользователей:', err));
