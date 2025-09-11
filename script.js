// Global State
const state = {
    postits: [],
    selectedColor: '#D6A99D',
    isDragging: false,
    dragStartX: 0,
    dragElement: null,
    dragCurrentX: 0
};

// DOM Elements
let elements = {};

// Initialize App
function init() {
    console.log('🚀 Toodooist iniciado');
    
    // Cache DOM elements
    elements = {
        fabButton: document.getElementById('fabButton'),
        modal: document.getElementById('modal'),
        modalBackdrop: document.getElementById('modalBackdrop'),
        modalClose: document.getElementById('modalClose'),
        postitForm: document.getElementById('postitForm'),
        description: document.getElementById('description'),
        date: document.getElementById('date'),
        colorPicker: document.getElementById('colorPicker'),
        charCount: document.getElementById('charCount'),
        submitButton: document.getElementById('submitButton'),
        cancelButton: document.getElementById('cancelButton'),
        postitsGrid: document.getElementById('postitsGrid'),
        emptyState: document.getElementById('emptyState')
    };
    
    // Load data from localStorage
    loadFromStorage();
    
    // Setup event listeners
    setupEventListeners();
    
    // Initial render
    renderPostits();
}

// LocalStorage Functions
function saveToStorage() {
    try {
        localStorage.setItem('toodooist_data', JSON.stringify(state.postits));
        console.log('💾 Dados salvos:', state.postits.length, 'post-its');
        return true;
    } catch (error) {
        console.error('❌ Erro ao salvar no localStorage:', error);
        return false;
    }
}

function loadFromStorage() {
    try {
        const data = localStorage.getItem('toodooist_data');
        if (data) {
            state.postits = JSON.parse(data);
            console.log('📂 Dados carregados:', state.postits.length, 'post-its');
        }
        console.log('✅ localStorage funcionando:', !!data);
        return true;
    } catch (error) {
        console.error('❌ Erro ao carregar do localStorage:', error);
        state.postits = [];
        return false;
    }
}

// Core Functions
function createPostit(description, date, color) {
    const postit = {
        id: Date.now() + Math.floor(Math.random() * 1000),
        description: description.trim(),
        date: date || null,
        color: color,
        createdAt: new Date().toISOString()
    };
    
    state.postits.push(postit);
    saveToStorage();
    console.log('✅ Post-it criado e salvo:', postit);
    
    return postit;
}

function deletePostit(id) {
    const index = state.postits.findIndex(p => p.id === id);
    if (index !== -1) {
        const deleted = state.postits.splice(index, 1)[0];
        saveToStorage();
        console.log('🗑️ Post-it excluído:', deleted);
        return deleted;
    }
    return null;
}

function formatDate(dateString) {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `📅 ${day}/${month}/${year}`;
}

// Render Functions
function renderPostits() {
    const grid = elements.postitsGrid;
    const emptyState = elements.emptyState;
    
    // Clear grid
    grid.innerHTML = '';
    
    if (state.postits.length === 0) {
        emptyState.classList.add('show');
        return;
    }
    
    emptyState.classList.remove('show');
    
    // Render each post-it
    state.postits.forEach(postit => {
        const postitElement = createPostitElement(postit);
        grid.appendChild(postitElement);
    });
    
    // Attach drag events to all post-its
    attachDragEvents();
}

function createPostitElement(postit) {
    const element = document.createElement('div');
    element.className = 'postit';
    element.dataset.id = postit.id;
    
    element.innerHTML = `
        <div class="postit-color-bar" style="background-color: ${postit.color};"></div>
        <div class="postit-content">
            <div class="postit-description">${escapeHtml(postit.description)}</div>
            ${postit.date ? `<div class="postit-date">${formatDate(postit.date)}</div>` : ''}
        </div>
    `;
    
    return element;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Modal Functions
function openModal() {
    elements.modal.classList.add('show');
    elements.description.focus();
    resetForm();
}

function closeModal() {
    elements.modal.classList.remove('show');
    resetForm();
}

function resetForm() {
    elements.postitForm.reset();
    elements.charCount.textContent = '0';
    elements.submitButton.disabled = true;
    
    // Reset color selection
    document.querySelectorAll('.color-option').forEach(option => {
        option.classList.remove('selected');
    });
    document.querySelector(`[data-color="${state.selectedColor}"]`).classList.add('selected');
    
    // Reset char counter style
    elements.charCount.parentElement.className = 'char-counter';
}

// Validation Functions
function validateForm() {
    const description = elements.description.value.trim();
    const isValid = description.length > 0 && description.length <= 40;
    
    elements.submitButton.disabled = !isValid;
    return isValid;
}

function updateCharCount() {
    const length = elements.description.value.length;
    elements.charCount.textContent = length;
    
    const counter = elements.charCount.parentElement;
    counter.className = 'char-counter';
    
    if (length > 35) {
        counter.classList.add('warning');
    }
    if (length >= 40) {
        counter.classList.add('error');
    }
    
    validateForm();
}

// Drag Functions
function attachDragEvents() {
    const postits = document.querySelectorAll('.postit');
    
    postits.forEach(postit => {
        // Mouse events
        postit.addEventListener('mousedown', handleDragStart);
        
        // Touch events for mobile
        postit.addEventListener('touchstart', handleTouchStart, { passive: false });
    });
}

function handleDragStart(e) {
    if (e.target.closest('.postit-content')) {
        state.isDragging = true;
        state.dragStartX = e.clientX;
        state.dragElement = e.currentTarget;
        state.dragCurrentX = 0;
        
        state.dragElement.classList.add('dragging');
        
        document.addEventListener('mousemove', handleDragMove);
        document.addEventListener('mouseup', handleDragEnd);
        
        e.preventDefault();
    }
}

function handleTouchStart(e) {
    const touch = e.touches[0];
    if (e.target.closest('.postit-content')) {
        state.isDragging = true;
        state.dragStartX = touch.clientX;
        state.dragElement = e.currentTarget;
        state.dragCurrentX = 0;
        
        state.dragElement.classList.add('dragging');
        
        document.addEventListener('touchmove', handleTouchMove, { passive: false });
        document.addEventListener('touchend', handleTouchEnd);
        
        e.preventDefault();
    }
}

function handleDragMove(e) {
    if (!state.isDragging || !state.dragElement) return;
    
    const currentX = e.clientX - state.dragStartX;
    state.dragCurrentX = Math.max(0, currentX); // Only allow dragging to the right
    
    updateDragVisuals();
    e.preventDefault();
}

function handleTouchMove(e) {
    if (!state.isDragging || !state.dragElement) return;
    
    const touch = e.touches[0];
    const currentX = touch.clientX - state.dragStartX;
    state.dragCurrentX = Math.max(0, currentX); // Only allow dragging to the right
    
    updateDragVisuals();
    e.preventDefault();
}

function updateDragVisuals() {
    if (!state.dragElement) return;
    
    const progress = Math.min(state.dragCurrentX / 150, 1);
    const rotation = progress * 15; // Max 15 degrees rotation
    const opacity = 1 - (progress * 0.7); // Min 30% opacity
    
    state.dragElement.style.transform = `translateX(${state.dragCurrentX}px) rotate(${rotation}deg)`;
    state.dragElement.style.opacity = opacity;
}

function handleDragEnd(e) {
    if (!state.isDragging || !state.dragElement) return;
    
    document.removeEventListener('mousemove', handleDragMove);
    document.removeEventListener('mouseup', handleDragEnd);
    
    finalizeDrag();
}

function handleTouchEnd(e) {
    if (!state.isDragging || !state.dragElement) return;
    
    document.removeEventListener('touchmove', handleTouchMove);
    document.removeEventListener('touchend', handleTouchEnd);
    
    finalizeDrag();
}

function finalizeDrag() {
    const shouldDelete = state.dragCurrentX > 150;
    
    if (shouldDelete) {
        // Delete the post-it
        const id = parseInt(state.dragElement.dataset.id);
        deletePostit(id);
        
        // Animate deletion
        state.dragElement.style.transition = 'all 0.3s ease-out';
        state.dragElement.style.transform = 'translateX(100%) rotate(20deg)';
        state.dragElement.style.opacity = '0';
        
        setTimeout(() => {
            renderPostits();
        }, 300);
    } else {
        // Return to original position
        state.dragElement.style.transition = 'all 0.3s ease-out';
        state.dragElement.style.transform = '';
        state.dragElement.style.opacity = '';
        
        setTimeout(() => {
            if (state.dragElement) {
                state.dragElement.classList.remove('dragging');
                state.dragElement.style.transition = '';
            }
        }, 300);
    }
    
    // Reset drag state
    state.isDragging = false;
    state.dragElement = null;
    state.dragCurrentX = 0;
    state.dragStartX = 0;
}

// Event Listeners Setup
function setupEventListeners() {
    // FAB button
    elements.fabButton.addEventListener('click', openModal);
    
    // Modal close events
    elements.modalClose.addEventListener('click', closeModal);
    elements.cancelButton.addEventListener('click', closeModal);
    elements.modalBackdrop.addEventListener('click', closeModal);
    
    // Form events
    elements.description.addEventListener('input', updateCharCount);
    elements.postitForm.addEventListener('submit', handleFormSubmit);
    
    // Color picker
    elements.colorPicker.addEventListener('click', handleColorSelect);
    
    // Keyboard events
    document.addEventListener('keydown', handleKeyDown);
}

function handleFormSubmit(e) {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const description = elements.description.value.trim();
    const date = elements.date.value || null;
    const color = state.selectedColor;
    
    createPostit(description, date, color);
    closeModal();
    renderPostits();
}

function handleColorSelect(e) {
    if (e.target.classList.contains('color-option')) {
        // Remove selection from all options
        document.querySelectorAll('.color-option').forEach(option => {
            option.classList.remove('selected');
        });
        
        // Add selection to clicked option
        e.target.classList.add('selected');
        state.selectedColor = e.target.dataset.color;
    }
}

function handleKeyDown(e) {
    // Close modal with Escape key
    if (e.key === 'Escape' && elements.modal.classList.contains('show')) {
        closeModal();
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);