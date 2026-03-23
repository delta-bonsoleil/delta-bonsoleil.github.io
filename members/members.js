(function() {
    const overlay = document.getElementById('modal-overlay');
    const modalImg = document.getElementById('modal-img');
    const modalName = document.getElementById('modal-name');
    const modalRole = document.getElementById('modal-role');
    const modalDesc = document.getElementById('modal-desc');
    const closeBtn = document.getElementById('modal-close');

    function openModal(card) {
        const img = card.querySelector('.member-avatar img');
        const name = card.querySelector('.member-name').textContent;
        const role = card.querySelector('.member-role').textContent;
        const desc = card.querySelector('.member-desc').textContent;
        modalImg.src = img ? img.src : '';
        modalImg.alt = name;
        modalName.textContent = name;
        modalRole.textContent = role;
        modalDesc.textContent = desc;
        overlay.classList.add('open');
        closeBtn.focus();
    }

    function closeModal() {
        overlay.classList.remove('open');
    }

    document.querySelectorAll('.member-card').forEach(card => {
        card.addEventListener('click', () => openModal(card));
        card.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(card); }
        });
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'button');
    });

    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
})();
