document.addEventListener("DOMContentLoaded", () => {
    const track = document.querySelector(".carousel-track");
    const prevButton = document.querySelector(".prev-btn");
    const nextButton = document.querySelector(".next-btn");
    const items = Array.from(track.children);

    const itemWidth = items[0].getBoundingClientRect().width;

    // Acomoda los elementos iniciales en el carrusel
    items.forEach((item, index) => {
        item.style.left = `${itemWidth * index}px`;
    });

    let currentIndex = 0;

    nextButton.addEventListener("click", () => {
        if (currentIndex < items.length - 1) {
            currentIndex++;
            track.style.transform = `translateX(-${itemWidth * currentIndex}px)`;
        }
    });

    prevButton.addEventListener("click", () => {
        if (currentIndex > 0) {
            currentIndex--;
            track.style.transform = `translateX(-${itemWidth * currentIndex}px)`;
        }
    });


});


