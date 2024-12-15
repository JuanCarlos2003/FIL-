// eventbrite.js
const API_KEY = 'TU_API_KEY_EVENTBRITE';
const eventList = document.getElementById('event-list');

fetch(`https://www.eventbriteapi.com/v3/events/search/?q=FIL&token=${API_KEY}`)
    .then(response => response.json())
    .then(data => {
        data.events.forEach(event => {
            const eventDiv = document.createElement('div');
            eventDiv.classList.add('event');
            eventDiv.innerHTML = `
                <h3>${event.name.text}</h3>
                <p>${event.description.text}</p>
                <p><strong>Fecha:</strong> ${event.start.local}</p>
                <a href="${event.url}" target="_blank">Más Información</a>
            `;
            eventList.appendChild(eventDiv);
        });
    });
