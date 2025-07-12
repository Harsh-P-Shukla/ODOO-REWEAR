// ReWear Platform JavaScript

// DOM Elements
const loginBtn = document.getElementById('loginBtn');
const signupBtn = document.getElementById('signupBtn');
const loginModal = document.getElementById('loginModal');
const signupModal = document.getElementById('signupModal');
const addItemModal = document.getElementById('addItemModal');
const closeLoginModal = document.getElementById('closeLoginModal');
const closeSignupModal = document.getElementById('closeSignupModal');
const closeAddItemModal = document.getElementById('closeAddItemModal');
const cancelAddItem = document.getElementById('cancelAddItem');

// Form elements
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const addItemForm = document.getElementById('addItemForm');

// Validation patterns
const patterns = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    name: /^[a-zA-Z\s]{2,50}$/,
    title: /^[a-zA-Z0-9\s\-_]{3,100}$/,
    description: /^[\s\S]{10,500}$/
};

// Validation messages
const messages = {
    email: {
        required: 'Email is required',
        invalid: 'Please enter a valid email address'
    },
    password: {
        required: 'Password is required',
        invalid: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character'
    },
    name: {
        required: 'Name is required',
        invalid: 'Name must be 2-50 characters long'
    },
    confirmPassword: {
        required: 'Please confirm your password',
        mismatch: 'Passwords do not match'
    },
    title: {
        required: 'Title is required',
        invalid: 'Title must be 3-100 characters'
    },
    description: {
        required: 'Description is required',
        invalid: 'Description must be 10-500 characters'
    },
    category: {
        required: 'Please select a category'
    },
    type: {
        required: 'Please select a type'
    },
    size: {
        required: 'Please select a size'
    },
    condition: {
        required: 'Please select a condition'
    },
    images: {
        required: 'Please upload at least one image',
        invalid: 'Please upload valid image files (JPG, PNG, GIF)'
    }
};

// Utility functions
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification notification-enhanced ${type}`;
    
    const icon = type === 'success' ? 'fas fa-check-circle' : 
                 type === 'error' ? 'fas fa-exclamation-circle' : 
                 type === 'warning' ? 'fas fa-exclamation-triangle' : 'fas fa-info-circle';
    
    notification.innerHTML = `
        <div class="flex items-center space-x-3">
            <i class="${icon} text-lg"></i>
            <span>${message}</span>
            <button class="ml-auto text-white opacity-70 hover:opacity-100 transition-opacity" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.transform = 'translateX(100%)';
            notification.style.opacity = '0';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }
    }, 4000);
}

function validateField(value, pattern, fieldName) {
    if (!value.trim()) {
        return { valid: false, message: messages[fieldName]?.required || 'This field is required' };
    }
    
    if (pattern && !pattern.test(value)) {
        return { valid: false, message: messages[fieldName]?.invalid || 'Invalid format' };
    }
    
    return { valid: true, message: '' };
}

function showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const errorSpan = document.getElementById(fieldId + 'Error');
    
    if (field && errorSpan) {
        field.classList.add('input-invalid');
        field.classList.remove('input-valid');
        errorSpan.textContent = message;
        errorSpan.classList.remove('hidden');
        field.classList.add('error-shake');
        
        setTimeout(() => {
            field.classList.remove('error-shake');
        }, 500);
    }
}

function clearFieldError(fieldId) {
    const field = document.getElementById(fieldId);
    const errorSpan = document.getElementById(fieldId + 'Error');
    
    if (field && errorSpan) {
        field.classList.remove('input-invalid');
        field.classList.add('input-valid');
        errorSpan.classList.add('hidden');
        errorSpan.textContent = '';
    }
}

// Modal functions
function openModal(modal) {
    modal.classList.remove('hidden');
    modal.classList.add('modal-backdrop');
    document.body.style.overflow = 'hidden';
    
    // Add animation to modal content
    const modalContent = modal.querySelector('[id$="ModalContent"]');
    if (modalContent) {
        setTimeout(() => {
            modalContent.classList.add('modal-enter');
            modalContent.style.transform = 'scale(1)';
            modalContent.style.opacity = '1';
        }, 50);
    }
}

function closeModal(modal) {
    const modalContent = modal.querySelector('[id$="ModalContent"]');
    if (modalContent) {
        modalContent.style.transform = 'scale(0.95)';
        modalContent.style.opacity = '0';
    }
    
    setTimeout(() => {
        modal.classList.add('hidden');
        modal.classList.remove('modal-backdrop');
        document.body.style.overflow = 'auto';
        if (modalContent) {
            modalContent.classList.remove('modal-enter');
        }
    }, 300);
}

// Event listeners for modal controls
loginBtn.addEventListener('click', () => openModal(loginModal));
signupBtn.addEventListener('click', () => openModal(signupModal));

closeLoginModal.addEventListener('click', () => closeModal(loginModal));
closeSignupModal.addEventListener('click', () => closeModal(signupModal));
closeAddItemModal.addEventListener('click', () => closeModal(addItemModal));
cancelAddItem.addEventListener('click', () => closeModal(addItemModal));

// Close modals when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === loginModal) closeModal(loginModal);
    if (e.target === signupModal) closeModal(signupModal);
    if (e.target === addItemModal) closeModal(addItemModal);
});

// Login form validation and submission
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    // Clear previous errors
    clearFieldError('loginEmail');
    clearFieldError('loginPassword');
    
    let isValid = true;
    
    // Validate email
    const emailValidation = validateField(email, patterns.email, 'email');
    if (!emailValidation.valid) {
        showFieldError('loginEmail', emailValidation.message);
        isValid = false;
    }
    
    // Validate password
    if (!password.trim()) {
        showFieldError('loginPassword', messages.password.required);
        isValid = false;
    }
    
    if (isValid) {
        // Simulate login process
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        const originalContent = submitBtn.innerHTML;
        
        submitBtn.classList.add('btn-loading');
        submitBtn.disabled = true;
        
        setTimeout(() => {
            loginForm.classList.add('form-success');
            showNotification('Login successful!', 'success');
            
            setTimeout(() => {
                closeModal(loginModal);
                loginForm.reset();
                submitBtn.classList.remove('btn-loading');
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalContent;
                loginForm.classList.remove('form-success');
            }, 600);
        }, 1500);
    }
});

// Signup form validation and submission
signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupConfirmPassword').value;
    
    // Clear previous errors
    clearFieldError('signupName');
    clearFieldError('signupEmail');
    clearFieldError('signupPassword');
    clearFieldError('signupConfirmPassword');
    
    let isValid = true;
    
    // Validate name
    const nameValidation = validateField(name, patterns.name, 'name');
    if (!nameValidation.valid) {
        showFieldError('signupName', nameValidation.message);
        isValid = false;
    }
    
    // Validate email
    const emailValidation = validateField(email, patterns.email, 'email');
    if (!emailValidation.valid) {
        showFieldError('signupEmail', emailValidation.message);
        isValid = false;
    }
    
    // Validate password
    const passwordValidation = validateField(password, patterns.password, 'password');
    if (!passwordValidation.valid) {
        showFieldError('signupPassword', passwordValidation.message);
        isValid = false;
    }
    
    // Validate confirm password
    if (!confirmPassword.trim()) {
        showFieldError('signupConfirmPassword', messages.confirmPassword.required);
        isValid = false;
    } else if (password !== confirmPassword) {
        showFieldError('signupConfirmPassword', messages.confirmPassword.mismatch);
        isValid = false;
    }
    
    if (isValid) {
        // Simulate signup process
        const submitBtn = signupForm.querySelector('button[type="submit"]');
        const originalContent = submitBtn.innerHTML;
        
        submitBtn.classList.add('btn-loading');
        submitBtn.disabled = true;
        
        setTimeout(() => {
            signupForm.classList.add('form-success');
            showNotification('Account created successfully!', 'success');
            
            setTimeout(() => {
                closeModal(signupModal);
                signupForm.reset();
                submitBtn.classList.remove('btn-loading');
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalContent;
                signupForm.classList.remove('form-success');
            }, 600);
        }, 1500);
    }
});

// Add item form validation and submission
addItemForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const formData = new FormData(addItemForm);
    const title = formData.get('title');
    const category = formData.get('category');
    const type = formData.get('type');
    const size = formData.get('size');
    const condition = formData.get('condition');
    const description = formData.get('description');
    const images = document.getElementById('itemImages').files;
    
    // Clear previous errors
    clearFieldError('itemTitle');
    clearFieldError('itemCategory');
    clearFieldError('itemType');
    clearFieldError('itemSize');
    clearFieldError('itemCondition');
    clearFieldError('itemDescription');
    clearFieldError('itemImages');
    
    let isValid = true;
    
    // Validate title
    const titleValidation = validateField(title, patterns.title, 'title');
    if (!titleValidation.valid) {
        showFieldError('itemTitle', titleValidation.message);
        isValid = false;
    }
    
    // Validate category
    if (!category) {
        showFieldError('itemCategory', messages.category.required);
        isValid = false;
    }
    
    // Validate type
    if (!type) {
        showFieldError('itemType', messages.type.required);
        isValid = false;
    }
    
    // Validate size
    if (!size) {
        showFieldError('itemSize', messages.size.required);
        isValid = false;
    }
    
    // Validate condition
    if (!condition) {
        showFieldError('itemCondition', messages.condition.required);
        isValid = false;
    }
    
    // Validate description
    const descriptionValidation = validateField(description, patterns.description, 'description');
    if (!descriptionValidation.valid) {
        showFieldError('itemDescription', descriptionValidation.message);
        isValid = false;
    }
    
    // Validate images
    if (images.length === 0) {
        showFieldError('itemImages', messages.images.required);
        isValid = false;
    } else {
        for (let i = 0; i < images.length; i++) {
            const file = images[i];
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
            if (!validTypes.includes(file.type)) {
                showFieldError('itemImages', messages.images.invalid);
                isValid = false;
                break;
            }
        }
    }
    
    if (isValid) {
        // Simulate item upload process
        const submitBtn = addItemForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Uploading...';
        submitBtn.disabled = true;
        
        setTimeout(() => {
            showNotification('Item uploaded successfully!', 'success');
            closeModal(addItemModal);
            addItemForm.reset();
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }, 2000);
    }
});

// Real-time validation for form fields
function setupRealTimeValidation() {
    const fields = [
        { id: 'loginEmail', pattern: patterns.email, fieldName: 'email' },
        { id: 'loginPassword', pattern: null, fieldName: 'password' },
        { id: 'signupName', pattern: patterns.name, fieldName: 'name' },
        { id: 'signupEmail', pattern: patterns.email, fieldName: 'email' },
        { id: 'signupPassword', pattern: patterns.password, fieldName: 'password' },
        { id: 'signupConfirmPassword', pattern: null, fieldName: 'confirmPassword' },
        { id: 'itemTitle', pattern: patterns.title, fieldName: 'title' },
        { id: 'itemDescription', pattern: patterns.description, fieldName: 'description' }
    ];
    
    fields.forEach(field => {
        const element = document.getElementById(field.id);
        if (element) {
            element.addEventListener('blur', () => {
                const value = element.value;
                if (value.trim()) {
                    const validation = validateField(value, field.pattern, field.fieldName);
                    if (validation.valid) {
                        clearFieldError(field.id);
                    } else {
                        showFieldError(field.id, validation.message);
                    }
                }
            });
            
            element.addEventListener('input', () => {
                clearFieldError(field.id);
            });
        }
    });
}

// Password strength indicator
function setupPasswordStrength() {
    const passwordField = document.getElementById('signupPassword');
    if (passwordField) {
        passwordField.addEventListener('input', (e) => {
            const password = e.target.value;
            const strength = calculatePasswordStrength(password);
            updatePasswordStrengthIndicator(strength);
        });
    }
}

function calculatePasswordStrength(password) {
    let score = 0;
    let feedback = [];
    
    if (password.length >= 8) {
        score += 1;
        feedback.push('At least 8 characters');
    }
    if (/[a-z]/.test(password)) {
        score += 1;
        feedback.push('Lowercase letter');
    }
    if (/[A-Z]/.test(password)) {
        score += 1;
        feedback.push('Uppercase letter');
    }
    if (/\d/.test(password)) {
        score += 1;
        feedback.push('Number');
    }
    if (/[@$!%*?&]/.test(password)) {
        score += 1;
        feedback.push('Special character');
    }
    
    return { score, feedback };
}

function updatePasswordStrengthIndicator(strength) {
    const strengthBars = document.querySelectorAll('.password-strength-bar div');
    const strengthText = document.getElementById('passwordStrengthText');
    
    if (strengthBars.length > 0) {
        // Reset all bars
        strengthBars.forEach((bar, index) => {
            bar.className = 'h-1 flex-1 bg-gray-200 rounded-full transition-all duration-300';
        });
        
        // Update bars based on strength
        const strengthLevels = ['weak', 'fair', 'good', 'strong', 'excellent'];
        const colors = {
            weak: 'bg-red-500',
            fair: 'bg-orange-500', 
            good: 'bg-yellow-500',
            strong: 'bg-green-500',
            excellent: 'bg-green-600'
        };
        
        const textMessages = {
            weak: 'Very weak password',
            fair: 'Fair password',
            good: 'Good password',
            strong: 'Strong password',
            excellent: 'Excellent password'
        };
        
        const level = strengthLevels[Math.min(strength.score - 1, 4)];
        
        for (let i = 0; i < strength.score; i++) {
            if (strengthBars[i]) {
                strengthBars[i].className = `h-1 flex-1 ${colors[level]} rounded-full transition-all duration-300`;
            }
        }
        
        if (strengthText) {
            strengthText.textContent = textMessages[level] || 'Password strength';
            strengthText.className = `text-xs mt-1 ${level === 'weak' || level === 'fair' ? 'text-red-500' : level === 'good' ? 'text-yellow-500' : 'text-green-500'}`;
        }
    }
}

// Image preview functionality
function setupImagePreview() {
    const imageInput = document.getElementById('itemImages');
    if (imageInput) {
        imageInput.addEventListener('change', (e) => {
            const files = e.target.files;
            const previewContainer = document.getElementById('imagePreview');
            
            if (previewContainer) {
                previewContainer.innerHTML = '';
                
                for (let i = 0; i < files.length; i++) {
                    const file = files[i];
                    if (file.type.startsWith('image/')) {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                            const img = document.createElement('img');
                            img.src = e.target.result;
                            img.className = 'w-20 h-20 object-cover rounded mr-2 mb-2';
                            previewContainer.appendChild(img);
                        };
                        reader.readAsDataURL(file);
                    }
                }
            }
        });
    }
}

// Smooth scrolling for navigation links
function setupSmoothScrolling() {
    const navLinks = document.querySelectorAll('a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Initialize all functionality
document.addEventListener('DOMContentLoaded', () => {
    setupThemeToggle();
    setupRealTimeValidation();
    setupPasswordStrength();
    setupImagePreview();
    setupSmoothScrolling();
    setupEnhancedModals();
    setupPasswordToggles();
    setupSocialButtons();
    setupModalSwitching();
    
    // Add fade-in animation to elements
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    document.querySelectorAll('section, .card-hover').forEach(el => {
        observer.observe(el);
    });
    
    // Add "List an Item" button functionality
    const listItemBtn = document.querySelector('button:contains("List an Item")');
    if (listItemBtn) {
        listItemBtn.addEventListener('click', () => {
            openModal(addItemModal);
        });
    }
    
    // Add "Browse Items" button functionality
    const browseItemsBtn = document.querySelector('button:contains("Browse Items")');
    if (browseItemsBtn) {
        browseItemsBtn.addEventListener('click', () => {
            document.getElementById('browse').scrollIntoView({ behavior: 'smooth' });
        });
    }
    
    // Add "Start Swapping" button functionality
    const startSwappingBtn = document.querySelector('button:contains("Start Swapping")');
    if (startSwappingBtn) {
        startSwappingBtn.addEventListener('click', () => {
            openModal(signupModal);
        });
    }
});

// Enhanced modal functionality
function setupEnhancedModals() {
    // Add enhanced input effects
    const inputs = document.querySelectorAll('input[type="email"], input[type="password"], input[type="text"]');
    inputs.forEach(input => {
        input.classList.add('form-input-enhanced');
        
        input.addEventListener('focus', () => {
            input.parentElement.classList.add('input-focus-ring');
        });
        
        input.addEventListener('blur', () => {
            input.parentElement.classList.remove('input-focus-ring');
        });
    });
}

// Password toggle functionality
function setupPasswordToggles() {
    const toggleButtons = document.querySelectorAll('#toggleLoginPassword, #toggleSignupPassword, #toggleSignupConfirmPassword');
    
    toggleButtons.forEach(button => {
        button.addEventListener('click', () => {
            const input = button.previousElementSibling;
            const icon = button.querySelector('i');
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    });
}

// Social button functionality
function setupSocialButtons() {
    const socialButtons = document.querySelectorAll('.social-btn');
    
    socialButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const platform = button.textContent.trim();
            showNotification(`${platform} login coming soon!`, 'warning');
        });
    });
}

// Modal switching functionality
function setupModalSwitching() {
    const switchToSignup = document.getElementById('switchToSignup');
    const switchToLogin = document.getElementById('switchToLogin');
    
    if (switchToSignup) {
        switchToSignup.addEventListener('click', (e) => {
            e.preventDefault();
            closeModal(loginModal);
            setTimeout(() => {
                openModal(signupModal);
            }, 300);
        });
    }
    
    if (switchToLogin) {
        switchToLogin.addEventListener('click', (e) => {
            e.preventDefault();
            closeModal(signupModal);
            setTimeout(() => {
                openModal(loginModal);
            }, 300);
        });
    }
}

// Keyboard navigation support
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (!loginModal.classList.contains('hidden')) closeModal(loginModal);
        if (!signupModal.classList.contains('hidden')) closeModal(signupModal);
        if (!addItemModal.classList.contains('hidden')) closeModal(addItemModal);
    }
});

// Form field focus management
function setupFormFocus() {
    const forms = [loginForm, signupForm, addItemForm];
    forms.forEach(form => {
        if (form) {
            const firstInput = form.querySelector('input, select, textarea');
            if (firstInput) {
                form.addEventListener('submit', () => {
                    setTimeout(() => {
                        firstInput.focus();
                    }, 100);
                });
            }
        }
    });
}

// Initialize form focus
setupFormFocus();

// Theme toggle functionality
function setupThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    const html = document.documentElement;
    
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        html.classList.add('dark');
        updateThemeIcon('dark');
    } else {
        html.classList.remove('dark');
        updateThemeIcon('light');
    }
    
    // Theme toggle click handler
    themeToggle.addEventListener('click', () => {
        const isDark = html.classList.contains('dark');
        
        if (isDark) {
            html.classList.remove('dark');
            localStorage.setItem('theme', 'light');
            updateThemeIcon('light');
            showNotification('Switched to light mode', 'success');
        } else {
            html.classList.add('dark');
            localStorage.setItem('theme', 'dark');
            updateThemeIcon('dark');
            showNotification('Switched to dark mode', 'success');
        }
    });
    
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            if (e.matches) {
                html.classList.add('dark');
                updateThemeIcon('dark');
            } else {
                html.classList.remove('dark');
                updateThemeIcon('light');
            }
        }
    });
}

function updateThemeIcon(theme) {
    const themeToggle = document.getElementById('themeToggle');
    const sunIcon = themeToggle.querySelector('.fa-sun');
    const moonIcon = themeToggle.querySelector('.fa-moon');
    
    if (theme === 'dark') {
        sunIcon.classList.add('hidden');
        moonIcon.classList.remove('hidden');
        themeToggle.classList.add('dark-mode-active');
    } else {
        sunIcon.classList.remove('hidden');
        moonIcon.classList.add('hidden');
        themeToggle.classList.remove('dark-mode-active');
    }
}

// Export functions for potential use in other modules
window.ReWear = {
    showNotification,
    validateField,
    openModal,
    closeModal,
    setupThemeToggle
}; 