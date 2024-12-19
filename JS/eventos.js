document.addEventListener('DOMContentLoaded', () => {
const API_URL = 'http://localhost:3000/api/eventos'; // Ajusta el puerto si es necesario

const fechaSelect = document.getElementById('fecha-select');
const horaSelect = document.getElementById('hora-select');
const filterBtn = document.getElementById('filter-btn');
const clearBtn = document.getElementById('clear-btn');
const eventTableBody = document.querySelector('#event-table tbody');

let originalData = [];

// Cargar todos los eventos al inicio
fetch(API_URL)
    .then(res => res.json())
    .then(data => {
    originalData = data;
    renderOptions(data);
    renderTable(data);
    })
    .catch(error => console.error('Error al cargar eventos:', error));

// Rellena los <select> con las fechas y horas disponibles
function renderOptions(data) {
    // Obtener fechas únicas
    const fechas = [...new Set(data.map(e => e.fecha))].sort();
    // Obtener horas únicas
    const horas = [...new Set(data.map(e => e.hora))];

    // Llenar select de fechas
    fechas.forEach(fecha => {
    const option = document.createElement('option');
    option.value = fecha;
    option.textContent = fecha;
    fechaSelect.appendChild(option);
    });

    // Llenar select de horas
    horas.forEach(hora => {
    const option = document.createElement('option');
    option.value = hora;
    option.textContent = hora;
    horaSelect.appendChild(option);
    });
}

// Renderizar la tabla
function renderTable(data) {
    eventTableBody.innerHTML = '';
    data.forEach(evento => {
    const tr = document.createElement('tr');

    const tdFecha = document.createElement('td');
    tdFecha.textContent = evento.fecha;
    tr.appendChild(tdFecha);

    const tdHora = document.createElement('td');
    tdHora.textContent = evento.hora;
    tr.appendChild(tdHora);

    const tdTitulo = document.createElement('td');
    tdTitulo.textContent = evento.titulo;
    tr.appendChild(tdTitulo);

    const tdDesc = document.createElement('td');
    tdDesc.textContent = evento.descripcion;
    tr.appendChild(tdDesc);

    const tdLugar = document.createElement('td');
    tdLugar.textContent = evento.lugar;
    tr.appendChild(tdLugar);

    eventTableBody.appendChild(tr);
    });
}

// Filtrar al presionar el botón
filterBtn.addEventListener('click', () => {
    const fecha = fechaSelect.value;
    const hora = horaSelect.value;

    let url = API_URL;
    const params = [];
    if (fecha) params.push(`fecha=${encodeURIComponent(fecha)}`);
    if (hora) params.push(`hora=${encodeURIComponent(hora)}`);
    if (params.length > 0) {
    url += '?' + params.join('&');
    }

    fetch(url)
    .then(res => res.json())
    .then(data => {
        renderTable(data);
    })
    .catch(err => console.error('Error al filtrar:', err));
});

// Limpiar filtros
clearBtn.addEventListener('click', () => {
    fechaSelect.value = '';
    horaSelect.value = '';
    renderTable(originalData);
});
});