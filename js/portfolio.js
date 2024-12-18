const thumbnails = document.querySelectorAll('.thumbnail');
const carouselImage = document.querySelector('.carousel-image img');
const projectInfo = document.querySelector('.project-info');

const projects = [
    {
        img: 'images/yolomy.PNG',
        title: 'YOLOMY',
        description: 'This a static landing page for Yolomy store..',
    },
    {
        img: 'images/cloudshamba.PNG',
        title: 'CLOUD SHAMBA',
        description: 'app that enables farmers to send photos and videos of their sick animals and get instant prompt diagnosis and prescription. This will help farmers to minimize animal deaths in farms by getting veterinary services in a easier and affordable way without a real vet attending to the animals. ',
    },
    {
        img: 'images/pizzariba.PNG',
        title: 'PIZZARIBA',
        description: 'a simple webpage to take pizza orders based on size, toppings, crust and quantity',
    },
    {
        img: 'images/knights.PNG',
        title: 'THEFOREVERKNIGHTS',
        description: 'Company landing page, still in the works.',
    },
];

let currentIndex = 0;

function updateCarousel(index) {
    carouselImage.src = projects[index].img;
    projectInfo.querySelector('h2').textContent = projects[index].title;
    projectInfo.querySelector('p').textContent = projects[index].description;
    thumbnails.forEach(thumb => thumb.classList.remove('active'));
    thumbnails[index].classList.add('active');
}

document.getElementById('prev-button').addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + projects.length) >= 0 ? currentIndex - 1 : projects.length - 1;
    updateCarousel(currentIndex);
});

document.getElementById('next-button').addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % projects.length;
    updateCarousel(currentIndex);
});

thumbnails.forEach((thumbnail, index) => {
    thumbnail.addEventListener('click', () => {
        currentIndex = index;
        updateCarousel(currentIndex);
    });
});

updateCarousel(currentIndex);

document.getElementById('contactForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the form from submitting

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const message = document.getElementById('message').value;

    // Construct the WhatsApp link
    const whatsappNumber = '254715135257'; // Replace with your WhatsApp number
    const whatsappMessage = `Name: ${name}%0AEmail: ${email}%0AMessage: ${message}`;
    const whatsappLink = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

    // Open the WhatsApp chat
    window.open(whatsappLink);
});
