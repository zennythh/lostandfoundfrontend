document.querySelectorAll('.faq-question').forEach(item => {
    item.addEventListener('click', () => {
        
        const parentItem = item.parentElement;
        parentItem.classList.toggle('active');
    });
});