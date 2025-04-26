const express = require('express');
const db = require('./db');  

const router = express.Router();

router.get('/statistics', (req, res) => {
  const query = `
    SELECT 
      ФИО, 
      Логин, 
      level 
    FROM my_table;
  `;

  db.query(query, (err, results) => {
    if (err) {
      res.status(500).send('Ошибка при выполнении запроса');
      return;
    }
    res.json(results);
  });
});

router.get('/second_statistics', async (req, res) => {
  try {
    const [columns] = await db.promise().query(`SHOW COLUMNS FROM user_skills`);
    const skillColumns = columns
      .map(col => col.Field)
      .filter(field => field !== 'user_id');

    if (skillColumns.length === 0) {
      return res.json([]);
    }

    const query = `
      SELECT user_id, ${skillColumns.map(c => `\`${c}\``).join(', ')}
      FROM user_skills
    `;

    const [results] = await db.promise().query(query);

    res.json({
      skills: skillColumns,
      users: results
    });
  } catch (error) {
    console.error('Ошибка при получении second_statistics:', error.message);
    res.status(500).send('Ошибка при выполнении запроса к user_skills');
  }
});

router.post('/calculate', async (req, res) => {
    const { filters } = req.body; 
    
    if (!filters || filters.length === 0) {
        return res.status(400).send('Нет выбранных фильтров');
    }

    try {
        const skillColumns = filters.map((f) => {
            let multiplier = getPriorityMultiplier(f.priority);  
            return { skill: f.skill, multiplier };
        });

        console.log('Skill Columns:', skillColumns); 

        await db.promise().query(`DROP TEMPORARY TABLE IF EXISTS temp_skills`);

        const skillColumnsString = skillColumns.map(f => `\`${f.skill}\``).join(', ');

        await db.promise().query(`
            CREATE TEMPORARY TABLE temp_skills
            SELECT user_id, ${skillColumnsString}
            FROM user_skills
        `);

        const calcFormula = skillColumns.map(f => 
            `IFNULL(\`${f.skill}\`, 0) * ${f.multiplier}`).join(' + ');

        console.log('Calculation Formula:', calcFormula); 

        const [results] = await db.promise().query(`
            SELECT user_id, ${calcFormula} AS total_score
            FROM temp_skills
            ORDER BY total_score DESC
        `);

        res.json(results);

    } catch (error) {
        console.error('Ошибка при расчете:', error.message);
        res.status(500).send('Ошибка на сервере при расчете');
    }
});

function getPriorityMultiplier(priority) {
    if (priority === 1) return 0.9;
    if (priority === 2) return 0.8;
    return 0.7;
}

module.exports = router;
