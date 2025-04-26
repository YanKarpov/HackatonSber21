window.onload = function() {
    fetch('/statistics')
        .then(response => response.json())
        .then(users => {
            const statsDiv = document.getElementById('statistics');
            statsDiv.innerHTML = `<p>Общее количество студентов: ${users.length}</p>`;

            const cardsContainer = document.createElement('div');
            cardsContainer.classList.add('cards-container');

            users.forEach(user => {
                const card = document.createElement('div');
                card.classList.add('card');
                card.innerHTML = `
                    <div class="card-header">
                        <h3>${user.ФИО}</h3>
                    </div>
                    <div class="card-body">
                        <p><strong>Логин:</strong> ${user.Логин}</p>
                        <p><strong>Level:</strong> ${user.level !== null ? user.level : '-'}</p>
                    </div>
                `;
                cardsContainer.appendChild(card);
            });

            statsDiv.appendChild(cardsContainer);
        })
        .catch(error => {
            console.error('Ошибка при загрузке статистики:', error);
            const statsDiv = document.getElementById('statistics');
            statsDiv.innerHTML = '<p>Ошибка при загрузке данных.</p>';
        });
};
