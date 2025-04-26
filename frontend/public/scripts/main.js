window.onload = function() {
    fetch('/statistics')
        .then(response => response.json())
        .then(users => {
            const statsDiv = document.getElementById('statistics');
            statsDiv.innerHTML = `<p>Общее количество студентов: ${users.length}</p>`;

            const table = document.createElement('table');
            table.innerHTML = `
                <thead>
                    <tr>
                        <th>ФИО</th>
                        <th>Логин</th>
                        <th>Level</th>
                    </tr>
                </thead>
                <tbody>
                </tbody>
            `;

            const tbody = table.querySelector('tbody');
            users.forEach(user => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${user.ФИО}</td>
                    <td>${user.Логин}</td>
                    <td>${user.level !== null ? user.level : '-'}</td>
                `;
                tbody.appendChild(row);
            });

            statsDiv.appendChild(table);
        })
        .catch(error => {
            console.error('Ошибка при загрузке статистики:', error);
            const statsDiv = document.getElementById('statistics');
            statsDiv.innerHTML = '<p>Ошибка при загрузке данных.</p>';
        });
        
};
