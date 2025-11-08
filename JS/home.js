// Link desktop grid images to modal carousel
document.querySelectorAll(".gallery-img[data-index]").forEach((img) => {
  img.addEventListener("click", () => {
    const index = parseInt(img.dataset.index);
    const carousel = bootstrap.Carousel.getOrCreateInstance("#carouselGallery");
    carousel.to(index);
  });
});



  let lastScrollTop = 0;
  const navbar = document.querySelector('.navbar-custom');

  window.addEventListener('scroll', function() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    // Shrink navbar on scroll
    if (scrollTop > 50) {
      navbar.classList.add('shrink');
    } else {
      navbar.classList.remove('shrink');
    }

    // Mobile: hide on scroll down, show on scroll up
    if (window.innerWidth <= 768) {
      if (scrollTop > lastScrollTop) {
        // scrolling down
        navbar.classList.remove('navbar-visible');
        navbar.classList.add('navbar-hidden');
      } else {
        // scrolling up
        navbar.classList.remove('navbar-hidden');
        navbar.classList.add('navbar-visible');
      }
    }

    lastScrollTop = scrollTop <= 0 ? 0 : scrollTop; // avoid negative scroll
  });

