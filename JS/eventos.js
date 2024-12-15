// En searchBooksAndDisplay(), agrega funcionalidad para usar la búsqueda desde el modal
document.getElementById('searchForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const query = document.getElementById('searchQuery').value.trim();
    if (query) {
        alert(`Buscando: ${query}`);
        // Aquí puedes redirigir a una página o mostrar los resultados dinámicamente
    }
});
