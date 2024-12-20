document.addEventListener('DOMContentLoaded', () => {
  const API_EVENTS = 'http://localhost:3000/api/events';
  const API_USER_EVENTS = 'http://localhost:3000/api/userevents';

  const fechaSelect = document.getElementById('fecha-select');
  const horaSelect = document.getElementById('hora-select');
  const filterBtn = document.getElementById('filter-btn');
  const clearBtn = document.getElementById('clear-btn');
  const eventTableBody = document.querySelector('#event-table tbody');

  const userEventsSection = document.getElementById('user-events-section');
  const userEventsTable = document.getElementById('user-events-table');
  const userEventsTableBody = userEventsTable.querySelector('tbody');
  const noUserEvents = document.getElementById('no-user-events');

  // Modal elements
  const modal = document.getElementById('modal');
  const closeModalBtn = document.getElementById('close-modal');
  const modalTitle = document.getElementById('modal-title');
  const modalFecha = document.getElementById('modal-fecha');
  const modalHora = document.getElementById('modal-hora');
  const modalLugar = document.getElementById('modal-lugar');
  const modalDescripcion = document.getElementById('modal-descripcion');
  const asistirBtn = document.getElementById('asistir-btn');

  let eventsData = [];
  let filteredData = [];
  let userEventsData = [];
  let currentEventId = null;
  let noSession = false; // Para indicar si no hay sesión

  // Obtener el token si existe (ajusta según tu lógica)
  const token = localStorage.getItem('token'); // Asegúrate que el token se guarde al iniciar sesión

  // Cargar datos
  fetchEvents();
  fetchUserEvents();

  filterBtn.addEventListener('click', applyFilters);
  clearBtn.addEventListener('click', clearFilters);
  closeModalBtn.addEventListener('click', () => { modal.style.display = 'none'; });
  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  });

  asistirBtn.addEventListener('click', () => {
    if (!currentEventId) return;
    if (noSession) {
      // Si no hay sesión, mostrar alerta
      Swal.fire({
        icon: 'error',
        title: 'No autorizado',
        text: 'Necesitas iniciar sesión para agregar eventos a tu lista.'
      });
      return;
    }

    fetch(API_USER_EVENTS, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}) 
      },
      body: JSON.stringify({ eventoId: currentEventId })
    })
    .then(res => {
      if (!res.ok) {
        if (res.status === 401) {
          noSession = true;
          Swal.fire({
            icon: 'error',
            title: 'No autorizado',
            text: 'Necesitas iniciar sesión para agregar eventos a tu lista.'
          });
          throw new Error('No autorizado');
        }
        throw new Error('Error al agregar el evento');
      }
      return res.json();
    })
    .then(newUe => {
      userEventsData.push(newUe);
      renderUserEvents();
      asistirBtn.textContent = 'Ya estás asistiendo';
      asistirBtn.disabled = true;
      fetchUserEvents(); // Vuelve a cargar la lista completa y renderiza de nuevo
    })
    .catch(err => {
      console.error('Error al agregar evento:', err);
    });
  });

  function fetchEvents() {
    fetch(API_EVENTS)
      .then(res => {
        if (!res.ok) {
          throw new Error('Error al cargar eventos');
        }
        return res.json();
      })
      .then(data => {
        eventsData = data;
        filteredData = data;
        populateHoraSelect(data);
        renderTable(filteredData);

        if (data.length === 0) {
          // No hay eventos disponibles
          Swal.fire({
            icon: 'info',
            title: 'Sin eventos',
            text: 'No hay eventos disponibles en este momento.'
          });
        }
      })
      .catch(err => {
        console.error('Error al cargar eventos:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error de conexión',
          text: 'No se pudo conectar con el servidor. Intenta más tarde.'
        });
      });
  }

  function fetchUserEvents() {
    fetch(API_USER_EVENTS, {
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    })
    .then(res => {
      if (!res.ok) {
        if (res.status === 401) {
          noSession = true; 
          // Sin sesión, no se pueden obtener eventos del usuario
          return []; // Retorna array vacío
        }
        throw new Error('Error al cargar userEvents');
      }
      return res.json();
    })
    .then(data => {
      userEventsData = data;
      renderUserEvents();
    })
    .catch(err => {
      console.error('Error al cargar userEvents:', err);
      noSession = true;
      userEventsData = [];
      renderUserEvents();
    });
  }

  function renderTable(data) {
    eventTableBody.innerHTML = '';
    data.forEach(evento => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${evento.fecha}</td>
        <td>${evento.hora}</td>
        <td>${evento.titulo}</td>
        <td>${evento.descripcion}</td>
        <td>${evento.lugar}</td>
      `;

      tr.addEventListener('click', () => openModal(evento.id));
      eventTableBody.appendChild(tr);
    });
  }

  function openModal(id) {
    const evento = eventsData.find(e => e.id === id);
    if (!evento) return;
    currentEventId = id;
    modalTitle.textContent = evento.titulo;
    modalFecha.textContent = evento.fecha;
    modalHora.textContent = evento.hora;
    modalLugar.textContent = evento.lugar;
    modalDescripcion.textContent = evento.descripcion;
    modal.style.display = 'block';

    // Verificar si ya se asiste (si hay sesión)
    if (!noSession && Array.isArray(userEventsData)) {
      const alreadyAttending = userEventsData.some(ue => ue.eventoId === id);
      if (alreadyAttending) {
        asistirBtn.textContent = 'Ya estás asistiendo';
        asistirBtn.disabled = true;
      } else {
        asistirBtn.textContent = 'Asistir';
        asistirBtn.disabled = false;
      }
    } else {
      // Si no hay sesión
      asistirBtn.textContent = 'Asistir';
      asistirBtn.disabled = false;
    }
  }

  function renderUserEvents() {
    userEventsTableBody.innerHTML = '';

    if (noSession) {
      // Si no hay sesión, mostrar mensaje diferente
      noUserEvents.style.display = 'block';
      noUserEvents.textContent = "Necesitas iniciar sesión para ver tus eventos.";
      userEventsTable.style.display = 'none';
      return;
    }

    if (!Array.isArray(userEventsData) || userEventsData.length === 0) {
      noUserEvents.style.display = 'block';
      noUserEvents.textContent = "No hay eventos por asistir";
      userEventsTable.style.display = 'none';
      return;
    }

    noUserEvents.style.display = 'none';
    userEventsTable.style.display = 'table';

    userEventsData.forEach((ue, index) => {
      const ev = eventsData.find(e => e.id === ue.eventoId);
      if (!ev) return;
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${ue.eventoId || ''}</td>
        <td>${ev.titulo}</td>
        <td>${ue.estado}</td>
        <td></td>
      `;
      const tdActions = tr.querySelector('td:last-child');

      const estadoBtn = document.createElement('button');
      estadoBtn.textContent = ue.estado === 'pendiente' ? 'Marcar como Asistió' : 'Marcar como Pendiente';
      estadoBtn.classList.add(ue.estado === 'pendiente' ? 'mark-done' : 'mark-pending');
      estadoBtn.addEventListener('click', () => {
        const newEstado = ue.estado === 'pendiente' ? 'asistió' : 'pendiente';
        fetch(`${API_USER_EVENTS}/${ue.eventoId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: JSON.stringify({ estado: newEstado })
        })        
        .then(res => {
          if (!res.ok) throw new Error('Error al actualizar estado');
          return res.json();
        })
        .then(updated => {
          const index = userEventsData.findIndex(u => u.eventoId === ue.eventoId);
          if (index !== -1) {
            userEventsData[index].estado = updated.estado;
          }
          renderUserEvents();
          fetchUserEvents(); // Vuelve a cargar la lista completa y renderiza de nuevo
        })        
        .catch(err => {
          console.error('Error actualizando estado:', err);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo actualizar el estado del evento.'
          });
        });
      });
      tdActions.appendChild(estadoBtn);

      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = 'Eliminar';
      deleteBtn.classList.add('delete-event');
      deleteBtn.addEventListener('click', () => {
        fetch(`${API_USER_EVENTS}/${ue.eventoId}`, {
          method: 'DELETE',
          headers: {
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          }
        })        
        .then(res => {
          if (!res.ok) throw new Error('Error al eliminar evento');
          return res.json();
        })
        .then(() => {
          userEventsData = userEventsData.filter(u => u.id !== ue.id);
          renderUserEvents();
          fetchUserEvents(); // Vuelve a cargar la lista completa y renderiza de nuevo
        })
        .catch(err => {
          console.error('Error eliminando evento:', err);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo eliminar el evento de tu lista.'
          });
        });
      });
      tdActions.appendChild(deleteBtn);

      userEventsTableBody.appendChild(tr);
    });
  }

  function applyFilters() {
    const fecha = fechaSelect.value;
    const hora = horaSelect.value;

    let url = API_EVENTS;
    const params = [];
    if (fecha) params.push(`fecha=${encodeURIComponent(fecha)}`);
    if (hora) params.push(`hora=${encodeURIComponent(hora)}`);
    if (params.length > 0) {
      url += '?' + params.join('&');
    }

    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error('Error al filtrar');
        return res.json();
      })
      .then(data => {
        filteredData = data;
        renderTable(filteredData);
        if (data.length === 0) {
          Swal.fire({
            icon: 'info',
            title: 'Sin eventos',
            text: 'No se encontraron eventos con esos filtros.'
          });
        }
      })
      .catch(err => {
        console.error('Error al filtrar:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error de conexión',
          text: 'No se pudo conectar con el servidor para filtrar.'
        });
      });
  }

  function clearFilters() {
    fechaSelect.value = '';
    horaSelect.value = '';
    filteredData = eventsData;
    renderTable(filteredData);
  }

  function populateHoraSelect(data) {
    const horas = [...new Set(data.map(e => e.hora))];
    horas.sort();
    horas.forEach(h => {
      const option = document.createElement('option');
      option.value = h;
      option.textContent = h;
      horaSelect.appendChild(option);
    });
  }
});
