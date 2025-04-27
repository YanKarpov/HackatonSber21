let chart;
let averageChart;
let allData;
let isDarkTheme = false;

async function loadData() {
    const response = await fetch('/api/skills');
    allData = await response.json();
    createAverageChart(allData);
    updateChart('all'); // Отображаем все данные по умолчанию
}

function getTextColor() {
    return isDarkTheme ? '#FFFFFF' : '#000000';
}

function getBorderColor(skill) {
    const colors = {
        python: 'rgba(134, 27, 227, 1)',
        go: 'rgba(68,235,153,1)',
        linux: 'rgba(255,197,64,1)',
        JavaScript: 'rgba(68,180,150 ,1)',
        Kotlin: 'rgba(255 ,74 ,80 ,1)'
    };
    return isDarkTheme ? colors[skill].replace(/[\d.]+(?=$)/, '0.7') : colors[skill]; // Уменьшаем прозрачность для темной темы
}

function createChart(data, selectedSkill) {
    const ctx = document.getElementById('myChart').getContext('2d');

    const experienceCounts = {
        python: {},
        go: {},
        linux: {},
        JavaScript: {},
        Kotlin: {}
    };

    data.forEach(row => {
        experienceCounts.python[row.python] = (experienceCounts.python[row.python] || 0) + 1;
        experienceCounts.go[row.go] = (experienceCounts.go[row.go] || 0) + 1;
        experienceCounts.linux[row.linux] = (experienceCounts.linux[row.linux] || 0) + 1;
        experienceCounts.JavaScript[row.JavaScript] = (experienceCounts.JavaScript[row.JavaScript] || 0) + 1;
        experienceCounts.Kotlin[row.Kotlin] = (experienceCounts.Kotlin[row.Kotlin] || 0) + 1;
    });

    const labels = Array.from({ length: Math.floor(500 / 25) + 1 }, (_, i) => i * 25);

    const datasets = [];
    if (selectedSkill === 'all' || selectedSkill === 'python') {
        datasets.push({
            label: 'Python',
            data: labels.map(label => experienceCounts.python[label] || 0),
            borderColor: getBorderColor('python'),
            tension: 0.4,
            borderWidth: 5
        });
    }
    if (selectedSkill === 'all' || selectedSkill === 'go') {
        datasets.push({
            label: 'Go',
            data: labels.map(label => experienceCounts.go[label] || 0),
            borderColor: getBorderColor('go'),
            tension: 0.4,
            borderWidth: 5
        });
    }
    if (selectedSkill === 'all' || selectedSkill === 'linux') {
        datasets.push({
            label: 'Linux',
            data: labels.map(label => experienceCounts.linux[label] || 0),
            borderColor: getBorderColor('linux'),
            tension: 0.4,
            borderWidth: 5
        });
    }
    if (selectedSkill === 'all' || selectedSkill === 'JavaScript') {
        datasets.push({
            label: 'JavaScript',
            data: labels.map(label => experienceCounts.JavaScript[label] || 0),
            borderColor: getBorderColor('JavaScript'),
            tension: 0.4,
            borderWidth: 5
        });
    }
    if (selectedSkill === 'all' || selectedSkill === 'Kotlin') {
        datasets.push({
            label: 'Kotlin',
            data: labels.map(label => experienceCounts.Kotlin[label] || 0),
            borderColor: getBorderColor('Kotlin'),
            tension: 0.4,
            borderWidth: 5
        });
    }

    if (chart) {
        chart.destroy(); 
    }

    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    title:{ display:true , text:'Баллы', font:{ family:'SB Sans Display', weight:'600', size :14 } },
                    beginAtZero:true,
                    ticks:{ font:{ family:'SB Sans Display', weight:'600', size :12, color:getTextColor() } } // Цвет текста оси X
                },
                y:{
                    title:{ display:true , text:'Количество людей', font:{ family:'SB Sans Display', weight:'600', size :14 } },
                    beginAtZero:true,
                    ticks:{ font:{ family:'SB Sans Display', weight:'600', size :12, color:getTextColor() } } // Цвет текста оси Y
                }
            },
            plugins:{
                legend:{
                    position :'bottom',
                    labels:{
                        font:{ family:'SB Sans Display', weight:'600', size :14, color:getTextColor() } // Цвет текста легенды
                    }
                },
                tooltip:{
                    callbacks:{
                        label:function(context){
                            return context.dataset.label + ': '+ context.raw;
                        }
                    }
                }
            }
        }
    });
}

function createAverageChart(data) {
    const ctxAvg = document.getElementById('averageChart').getContext('2d');

    const totalExperienceCount = {};

    data.forEach(row => {
        for (const skill in row) {
            totalExperienceCount[row[skill]] = (totalExperienceCount[row[skill]] || []).concat(row[skill]);
        }
    });

    const averageLabels = Array.from({ length: Math.floor(500 / 25) + 1 }, (_, i) => i * 25);
    const averageData = averageLabels.map(label => totalExperienceCount[label]?.length || 0);

    averageChart = new Chart(ctxAvg, {
        type : 'line',
        data :{
             labels : averageLabels,
             datasets:[{
                 label :'Общее количество',
                 data : averageData,
                 borderColor : isDarkTheme ? '#43E3B4' : '#43E3B4',
                 backgroundColor :'rgba(67,227,180 ,0.2)',
                 fill : true,
                 tension :.4,
                 borderWidth :7,
                 pointRadius :4
             }]
         },
         options:{
             responsive:true,
             scales:{
                 x:{
                     title:{
                         display:true,
                         text :'Баллы',
                         font:{ family:'SB Sans Display', weight:'600', size :14 }
                     },
                     beginAtZero:true,
                     ticks:{ font:{ family:'SB Sans Display', weight:'600', size :12, color:getTextColor() } } // Цвет текста оси X
                 },
                 y:{
                     title:{
                         display:true,
                         text :'Количество людей',
                         font:{ family:'SB Sans Display', weight:'600', size :14 }
                     },

                     ticks:{ font:{ family:'SB Sans Display', weight:'600', size :12, color:getTextColor() } } // Цвет текста оси Y
                 }
             },
             plugins:{
                 legend:{
                     position :'bottom',
                     labels:{
                         font:{ family:'SB Sans Display', weight:'600', size :14, color:getTextColor() } // Цвет текста легенды
                     }
                 },
                 tooltip:{
                     callbacks:{
                         label:function(context){
                             return context.dataset.label + ': '+ context.raw;
                         }
                     }
                 }
             }
         }
     });
 }

 function updateChart(selectedSkill) {
     createChart(allData, selectedSkill);
 }

 function toggleTheme() {
    const body = document.body;
    const desktop = document.querySelector('.desktop');
    const overlap = document.querySelector('.overlap');
    const overlapGroup = document.querySelector('.overlap-group');
    
    // Переключаем классы
    body.classList.toggle('dark-theme');
    desktop.classList.toggle('dark-theme');
    overlap.classList.toggle('dark-theme');
    overlapGroup.classList.toggle('dark-theme');

    // Переключаем классы для всех прямоугольников
    const rectangles = document.querySelectorAll('.rectangle');
    rectangles.forEach(rectangle => {
        rectangle.classList.toggle('dark-theme');
    });
}
 loadData();