let ctx = document.getElementById('energyChart').getContext('2d');
let m = parseFloat(document.getElementById('mass').value); // Масса (кг)
let l = parseFloat(document.getElementById('large').value); // Длина (см)
let gr = -parseFloat(document.getElementById('gravity').value); // Ускорение свободного падения

let init = [Math.PI, Math.PI, 0, 0]; // Начальные данные
let poses1 = []; // Координаты для первого маятника
let poses2 = []; // Координаты для второго маятника
let energyData = []; // Данные для общей энергии
let isDrawing = false;
let step = 0; // счетчик времени

function setup() {
    createCanvas(400, 400);
}

function toggleDrawing() {
    m = parseFloat(document.getElementById('mass').value);
    l =  parseFloat(document.getElementById('large').value);
    gr = -parseFloat(document.getElementById('gravity').value);
    init = [Math.PI / 2, Math.PI / 2, 0, 0];
    poses1 = [];
    poses2 = [];
    energyData = [];
    energyChart.data.labels = [];
    energyChart.data.datasets[0].data = [];
    isDrawing = !isDrawing;
    step = 0; // Сбросить счетчик времени
}

function draw() {
    background(220);

    if (isDrawing) {
        init = RK4(init);

        step += 0.08; // увеличение времени на шаг интеграции

        const t1 = init[0];
        const t2 = init[1];
        const p1 = init[2];
        const p2 = init[3];
        console.log(p1, "     ", p2)

        let KE = kineticEnergy(m, l, Math.abs(t1), Math.abs(t2), Math.abs(p1), Math.abs(p2));
        let PE = potentialEnergy(m, l, Math.abs(t1), Math.abs(t2));
        let totalEnergy = Math.abs(KE) + Math.abs(PE);

        // Сохранение данных энергии и времени
        energyData.push({ time: step, energy: totalEnergy });

        // Держим только последние 500 точек
        if (energyData.length > 1000) {
            energyData.shift();
        }

        let x1 = l * Math.sin(t1) + 200;
        let y1 = -l * Math.cos(t1) + 200;
        poses1.push({ x1, y1 });

        let x2 = l * Math.sin(t2) + x1;
        let y2 = -l * Math.cos(t2) + y1;
        poses2.push({ x2, y2 });

        for (let p = 0; p < poses1.length - 1; p++) {
            stroke(color(255, 0, 0, 100));
            line(poses1[p].x1, poses1[p].y1, poses1[p + 1].x1, poses1[p + 1].y1);
        }

        for (let p = 0; p < poses2.length - 1; p++) {
            stroke(color(0, 0, 255, 100));
            line(poses2[p].x2, poses2[p].y2, poses2[p + 1].x2, poses2[p + 1].y2);
        }

        stroke(color(0, 0, 0, 255));
        line(200, 200, x1, y1);
        fill(color(255, 0, 0, 255));
        circle(x1, y1, m * 10);
        line(x1, y1, x2, y2);
        fill(color(0, 0, 255, 255));
        circle(x2, y2, m * 10);
    }

    // Обновление графика энергии
    updateEnergyChart();
}

function kineticEnergy(m, l, t1, t2, p1, p2) {
    let KE1 = 0.5 * m * Math.pow(l * p1, 2);
    let KE2 = 0.5 * m * (Math.pow(l * p1, 2) + Math.pow(l * p2, 2) + 2 * l * l * p1 * p2 * Math.cos(t1 - t2));
    // console.log(Math.pow(l * p1, 2), "     ", (Math.pow(l * p1, 2) + Math.pow(l * p2, 2) + 2 * l * l * p1 * p2 * Math.cos(t1 - t2)));
    return KE1 + KE2;
}

// Функция для вычисления потенциальной энергии
function potentialEnergy(m, l, t1, t2) {
    let PE1 = m * gr * l * Math.cos(t1);
    let PE2 = m * gr * l * (Math.cos(t1) + Math.cos(t2));
    return PE1 + PE2;
}
function RK4(init) {
    const t1 = init[0];  // Угол первого маятника
    const t2 = init[1];  // Угол второго маятника
    const p1 = init[2];  // Угловая скорость первого маятника
    const p2 = init[3];  // Угловая скорость второго маятника

    const h = 0.08;      // Шаг интеграции

    // Промежуточные значения
    const k0 = h * f(t1, t2, p1, p2);
    const l0 = h * g(t1, t2, p1, p2);
    const m0 = h * j(t1, t2, p1, p2);
    const n0 = h * k(t1, t2, p1, p2);

    const k1 = h * f(t1 + 0.5 * k0, t2 + 0.5 * l0, p1 + 0.5 * m0, p2 + 0.5 * n0);
    const l1 = h * g(t1 + 0.5 * k0, t2 + 0.5 * l0, p1 + 0.5 * m0, p2 + 0.5 * n0);
    const m1 = h * j(t1 + 0.5 * k0, t2 + 0.5 * l0, p1 + 0.5 * m0, p2 + 0.5 * n0);
    const n1 = h * k(t1 + 0.5 * k0, t2 + 0.5 * l0, p1 + 0.5 * m0, p2 + 0.5 * n0);

    const k2 = h * f(t1 + 0.5 * k1, t2 + 0.5 * l1, p1 + 0.5 * m1, p2 + 0.5 * n1);
    const l2 = h * g(t1 + 0.5 * k1, t2 + 0.5 * l1, p1 + 0.5 * m1, p2 + 0.5 * n1);
    const m2 = h * j(t1 + 0.5 * k1, t2 + 0.5 * l1, p1 + 0.5 * m1, p2 + 0.5 * n1);
    const n2 = h * k(t1 + 0.5 * k1, t2 + 0.5 * l1, p1 + 0.5 * m1, p2 + 0.5 * n1);

    const k3 = h * f(t1 + k2, t2 + l2, p1 + m2, p2 + n2);
    const l3 = h * g(t1 + k2, t2 + l2, p1 + m2, p2 + n2);
    const m3 = h * j(t1 + k2, t2 + l2, p1 + m2, p2 + n2);
    const n3 = h * k(t1 + k2, t2 + l2, p1 + m2, p2 + n2);

    // Обновление углов и угловых скоростей
    const new_t1 = t1 + (1 / 6) * (k0 + 2 * k1 + 2 * k2 + k3);
    const new_t2 = t2 + (1 / 6) * (l0 + 2 * l1 + 2 * l2 + l3);
    const new_p1 = p1 + (1 / 6) * (m0 + 2 * m1 + 2 * m2 + m3);
    const new_p2 = p2 + (1 / 6) * (n0 + 2 * n1 + 2 * n2 + n3);

    return [new_t1, new_t2, new_p1, new_p2];
}

// Считаем ускорение для первого маятника
function f(t1, t2, p1, p2) {
    return ((6 / (m * l * l)) * (2 * p1 - 3 * Math.cos(t1 - t2) * p2)) / (16 - 9 * Math.cos(t1 - t2) * Math.cos(t1 - t2));
}

function g(t1, t2, p1, p2) {
    return ((6 / (m * l * l)) * (8 * p2 - 3 * Math.cos(t1 - t2) * p1)) / (16 - 9 * Math.cos(t1 - t2) * Math.cos(t1 - t2));
}

function j(t1, t2, p1, p2) {
    return -0.5 * m * l * l * (f(t1, t2, p1, p2) * g(t1, t2, p1, p2) * Math.sin(t1 - t2) + (3 * gr / l) * Math.sin(t1));
}

function k(t1, t2, p1, p2) {
    return -0.5 * m * l * l * (-f(t1, t2, p1, p2) * g(t1, t2, p1, p2) * Math.sin(t1 - t2) + (gr / l) * Math.sin(t2));
}

let energyChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [], // Метки времени будут обновляться динамически
        datasets: [{
            label: 'Total Energy',
            data: [],
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
        }]
    },
    options: {
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Time'
                }
            },
            y: {
                title: {
                    display: true,
                    text: 'Energy'
                }
            }
        }
    }
});

// Функция для обновления данных на графике
function updateEnergyChart() {
    if (energyData.length > 0) {
        let labels = energyData.map(point => point.time.toFixed(2));
        let data = energyData.map(point => point.energy);

        energyChart.data.labels = labels;
        energyChart.data.datasets[0].data = data;

        // Обновление графика
        energyChart.update();
    }
}
