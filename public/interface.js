document.querySelectorAll('.faq-question').forEach(item => {
    item.addEventListener('click', () => {
        
        const parentItem = item.parentElement;
        parentItem.classList.toggle('active');
    });
});


document.addEventListener("DOMContentLoaded", function() {
    let navLinks = document.querySelectorAll(".nav-links a");

    navLinks.forEach(link => {
        link.addEventListener("click", function() {
            // Remove active class from all links
            navLinks.forEach(l => l.classList.remove("active"));
            // Add active class to the clicked link
            this.classList.add("active");
        });
    });
});

document.querySelectorAll(".nav-item").forEach(link => {
    link.addEventListener("click", function(event) {
        event.preventDefault(); // Prevent default link behavior
        const targetClass = this.getAttribute("data-target");
        const targetElement = document.querySelector(`.${targetClass}`);

        if (targetElement) {
            targetElement.scrollIntoView({ behavior: "smooth" });
        }
    });
});

document.addEventListener("DOMContentLoaded", function() {
    const navItems = document.querySelectorAll('.nav-item');

    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();  // Prevent default link behavior
            
            const targetClass = item.getAttribute('data-target');
            const target = document.querySelector(`.${targetClass}`);  // Select the class
            
            if (target) {
                window.scrollTo({
                    top: target.offsetTop - document.querySelector('header').offsetHeight,  // Adjust for header
                    behavior: 'smooth'  // Smooth scroll
                });
            }
        });
    });
});
