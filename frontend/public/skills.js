window.onload = function() {
    const secondStatsDiv = document.getElementById('second-statistics');
    const filterPriority = document.getElementById('filter-priority');
    const applyFiltersButton = document.getElementById('apply-filters');

    let allSkills = [];
    let allUsers = [];

    // Загрузка статистики (навыков и пользователей)
    fetch('/second_statistics')
        .then(response => response.json())
        .then(data => {
            allSkills = data.skills;
            allUsers = data.users;
            renderTable(allUsers);
        })
        .catch(error => {
            console.error('Ошибка при загрузке second_statistics:', error);
            secondStatsDiv.innerHTML = '<p>Ошибка при загрузке данных.</p>';
        });

    applyFiltersButton.addEventListener('click', async function () {
        const selectedSkills = [];

        // Получаем приоритеты для каждого навыка
        ['Python', 'Java', 'Linux'].forEach(skill => {
            const priorityInput = document.getElementById(`${skill.toLowerCase()}-priority`);
            const priorityValue = parseInt(priorityInput.value);

            if (!isNaN(priorityValue) && priorityValue >= 1 && priorityValue <= 3) {
                selectedSkills.push({
                    skill: skill,
                    priority: priorityValue  
                });
            }
        });

        console.log("Selected Skills with order:", selectedSkills);

        if (selectedSkills.length === 0) {
            renderTable(allUsers);
            return;
        }

        try {
            // Отправляем запрос на сервер для расчета итоговых баллов
            const response = await fetch('/calculate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filters: selectedSkills }) 
            });

            if (!response.ok) {
                throw new Error('Ошибка при запросе расчета');
            }

            const results = await response.json();
            renderCalculatedTable(results);
        } catch (error) {
            console.error('Ошибка при расчете:', error);
            secondStatsDiv.innerHTML = '<p>Ошибка при расчете.</p>';
        }
    });

    // Функция для отображения таблицы с пользователями и их навыками
    function renderTable(users) {
        secondStatsDiv.innerHTML = '<p>Навыки по студентам:</p>';

        const table = document.createElement('table');
        const thead = document.createElement('thead');
        const tbody = document.createElement('tbody');

        // Заголовок таблицы
        let headerRow = '<tr><th>User ID</th>';
        allSkills.forEach(skill => {
            headerRow += `<th>${skill}</th>`;
        });
        headerRow += '</tr>';
        thead.innerHTML = headerRow;

        // Строки таблицы с данными пользователей
        users.forEach(user => {
            let row = `<tr><td>${user.user_id}</td>`;
            allSkills.forEach(skill => {
                row += `<td>${user[skill] !== null ? user[skill] : '-'}</td>`;
            });
            row += '</tr>';
            tbody.innerHTML += row;
        });

        table.appendChild(thead);
        table.appendChild(tbody);
        secondStatsDiv.appendChild(table);
    }

    // Функция для отображения таблицы с расчетом итогового балла
    function renderCalculatedTable(results) {
        secondStatsDiv.innerHTML = '<p>Результаты расчета приоритета:</p>';

        const table = document.createElement('table');
        const thead = document.createElement('thead');
        const tbody = document.createElement('tbody');

        thead.innerHTML = '<tr><th>User ID</th><th>Итоговый балл</th></tr>';

        results.forEach(user => {
            const row = `<tr><td>${user.user_id}</td><td>${user.total_score}</td></tr>`;
            tbody.innerHTML += row;
        });

        table.appendChild(thead);
        table.appendChild(tbody);
        secondStatsDiv.appendChild(table);
    }
};
