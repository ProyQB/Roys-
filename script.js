// Sample Products Database
const products = [
    {
        id: 1,
        name: 'Classic Hoodie',
        category: 'hoodies',
        price: 49.99,
        description: 'Comfortable and warm hoodie perfect for any season',
        emoji: '👕',
        sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL']
    },
    {
        id: 2,
        name: 'Premium Sweatpants',
        category: 'sweats',
        price: 39.99,
        description: 'Soft and stylish sweatpants for casual wear',
        emoji: '👖',
        sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL']
    },
    {
        id: 3,
        name: 'Graphic T-Shirt',
        category: 'shirts',
        price: 24.99,
        description: 'Trendy graphic design t-shirt with high-quality print',
        emoji: '👕',
        sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL']
    },
    {
        id: 4,
        name: 'Oversized Hoodie',
        category: 'hoodies',
        price: 54.99,
        description: 'Relaxed fit oversized hoodie for maximum comfort',
        emoji: '🧥',
        sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL']
    },
    {
        id: 5,
        name: 'Track Sweats',
        category: 'sweats',
        price: 44.99,
        description: 'Athletic sweats with modern design and functionality',
        emoji: '👖',
        sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL']
    },
    {
        id: 6,
        name: 'Polo Shirt',
        category: 'shirts',
        price: 29.99,
        description: 'Classic polo shirt suitable for casual and semi-formal occasions',
        emoji: '👕',
        sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL']
    },
    {
        id: 7,
        name: 'Zip-Up Hoodie',
        category: 'hoodies',
        price: 59.99,
        description: 'Convenient zip-up hoodie with kangaroo pockets',
        emoji: '🧥',
        sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL']
    },
    {
        id: 8,
        name: 'Lounge Sweats',
        category: 'sweats',
        price: 34.99,
        description: 'Ultra-soft lounge sweats perfect for relaxing at home',
        emoji: '👖',
        sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL']
    },
];

// Cart Array
let cart = [];
let currentUser = null;

// Local Storage Keys
const USERS_KEY = 'orc_users';
const CART_KEY = 'orc_cart';
const CURRENT_USER_KEY = 'orc_current_user';

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
    loadCart();
    loadCurrentUser();
    setupEventListeners();
});

// Setup Event Listeners
function setupEventListeners() {
    // Login Form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Signup Form
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }

    // Checkout Form
    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', handleCheckout);
    }

    // Cart Icon
    const cartIcon = document.querySelector('.cart-link');
    if (cartIcon) {
        cartIcon.addEventListener('click', function(e) {
            e.preventDefault();
            openCartModal();
        });
    }
}

// Load Products
function loadProducts() {
    const container = document.getElementById('products-container');
    container.innerHTML = '';

    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <div class="product-image">${product.emoji}</div>
            <div class="product-info">
                <p class="product-category">${product.category}</p>
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <p class="product-price">$${product.price}</p>
                <div class="product-sizes" id="sizes-${product.id}">
                    ${product.sizes.map(size => 
                        `<button class="size-btn" data-size="${size}" onclick="selectSize(this, ${product.id})">${size}</button>`
                    ).join('')}
                </div>
                <button class="add-to-cart" onclick="addToCart(${product.id})">Add to Cart</button>
            </div>
        `;
        container.appendChild(productCard);
    });
}

// Select Size
function selectSize(element, productId) {
    const sizeBtns = document.querySelectorAll(`#sizes-${productId} .size-btn`);
    sizeBtns.forEach(btn => btn.classList.remove('active'));
    element.classList.add('active');
}

// Add to Cart
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const sizeBtn = document.querySelector(`#sizes-${productId} .size-btn.active`);
    
    if (!sizeBtn) {
        showError('Please select a size');
        return;
    }

    const size = sizeBtn.getAttribute('data-size');
    
    const cartItem = {
        id: cart.length,
        productId: productId,
        name: product.name,
        price: product.price,
        size: size,
        quantity: 1
    };

    const existingItem = cart.find(item => item.productId === productId && item.size === size);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push(cartItem);
    }

    saveCart();
    updateCartCount();
    showSuccess(`${product.name} added to cart!`);
}

// Remove from Cart
function removeFromCart(cartId) {
    cart = cart.filter(item => item.id !== cartId);
    saveCart();
    updateCartCount();
    loadCartItems();
}

// Update Cart Count
function updateCartCount() {
    const countElement = document.getElementById('cart-count');
    countElement.textContent = cart.length;
}

// Save Cart to Local Storage
function saveCart() {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

// Load Cart from Local Storage
function loadCart() {
    const savedCart = localStorage.getItem(CART_KEY);
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartCount();
    }
}

// Load Cart Items in Modal
function loadCartItems() {
    const cartItemsDiv = document.getElementById('cart-items');
    cartItemsDiv.innerHTML = '';

    if (cart.length === 0) {
        cartItemsDiv.innerHTML = '<p style="text-align: center; color: #666;">Your cart is empty</p>';
        return;
    }

    let total = 0;
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;

        const cartItemDiv = document.createElement('div');
        cartItemDiv.className = 'cart-item';
        cartItemDiv.innerHTML = `
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <p>Size: ${item.size} | Qty: ${item.quantity}</p>
            </div>
            <div>
                <div class="cart-item-price">$${itemTotal.toFixed(2)}</div>
                <button class="remove-btn" onclick="removeFromCart(${item.id})">Remove</button>
            </div>
        `;
        cartItemsDiv.appendChild(cartItemDiv);
    });

    document.getElementById('cart-total').textContent = total.toFixed(2);
    document.getElementById('checkout-total').textContent = total.toFixed(2);
}

// Filter Products by Search
function filterProducts() {
    const searchInput = document.getElementById('search-input').value.toLowerCase();
    const productCards = document.querySelectorAll('.product-card');

    productCards.forEach(card => {
        const productName = card.querySelector('.product-name').textContent.toLowerCase();
        const productCategory = card.querySelector('.product-category').textContent.toLowerCase();
        const productDescription = card.querySelector('.product-description').textContent.toLowerCase();

        if (productName.includes(searchInput) || 
            productCategory.includes(searchInput) || 
            productDescription.includes(searchInput)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Modal Functions
function showLoginModal() {
    const modal = document.getElementById('login-modal');
    modal.classList.add('active');
}

function closeLoginModal() {
    const modal = document.getElementById('login-modal');
    modal.classList.remove('active');
}

function openCartModal() {
    loadCartItems();
    const modal = document.getElementById('cart-modal');
    modal.classList.add('active');
}

function closeCartModal() {
    const modal = document.getElementById('cart-modal');
    modal.classList.remove('active');
}

function proceedToCheckout() {
    if (cart.length === 0) {
        showError('Cart is empty');
        return;
    }

    if (!currentUser) {
        showError('Please login first');
        closeCartModal();
        showLoginModal();
        return;
    }

    closeCartModal();
    const modal = document.getElementById('checkout-modal');
    modal.classList.add('active');
}

function closeCheckoutModal() {
    const modal = document.getElementById('checkout-modal');
    modal.classList.remove('active');
}

// Auth Functions
function showLogin() {
    document.getElementById('login-form').classList.add('active');
    document.getElementById('signup-form').classList.remove('active');
    document.querySelectorAll('.toggle-btn')[0].classList.add('active');
    document.querySelectorAll('.toggle-btn')[1].classList.remove('active');
}

function showSignup() {
    document.getElementById('signup-form').classList.add('active');
    document.getElementById('login-form').classList.remove('active');
    document.querySelectorAll('.toggle-btn')[1].classList.add('active');
    document.querySelectorAll('.toggle-btn')[0].classList.remove('active');
}

// Handle Login
function handleLogin(e) {
    e.preventDefault();
    
    const email = e.target.querySelector('input[type="email"]').value;
    const password = e.target.querySelector('input[type="password"]').value;

    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        currentUser = user;
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
        showSuccess('Login successful!');
        closeLoginModal();
        updateAuthMenu();
        e.target.reset();
    } else {
        document.getElementById('login-error').textContent = 'Invalid email or password';
    }
}

// Handle Signup
function handleSignup(e) {
    e.preventDefault();
    
    const name = e.target.querySelector('input[type="text"]').value;
    const email = e.target.querySelectorAll('input[type="email"]')[0].value;
    const password = e.target.querySelectorAll('input[type="password"]')[0].value;
    const confirmPassword = e.target.querySelectorAll('input[type="password"]')[1].value;

    if (password !== confirmPassword) {
        document.getElementById('signup-error').textContent = 'Passwords do not match';
        return;
    }

    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    
    if (users.find(u => u.email === email)) {
        document.getElementById('signup-error').textContent = 'Email already registered';
        return;
    }

    const newUser = {
        id: Date.now(),
        name: name,
        email: email,
        password: password,
        createdAt: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));

    currentUser = newUser;
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));

    showSuccess('Account created successfully!');
    closeLoginModal();
    updateAuthMenu();
    e.target.reset();
}

// Handle Checkout
function handleCheckout(e) {
    e.preventDefault();

    // Validate form
    const inputs = e.target.querySelectorAll('input');
    let isValid = true;
    inputs.forEach(input => {
        if (!input.value.trim()) {
            isValid = false;
        }
    });

    if (!isValid) {
        showError('Please fill all fields');
        return;
    }

    // Process payment (simulate)
    const orderNumber = '#' + Math.random().toString(36).substr(2, 9).toUpperCase();
    const orderDate = new Date().toLocaleDateString();

    // Clear cart after successful checkout
    cart = [];
    saveCart();
    updateCartCount();

    showSuccess(`Order placed successfully! Order Number: ${orderNumber}`);
    closeCheckoutModal();
    e.target.reset();
}

// Update Auth Menu
function updateAuthMenu() {
    const authMenu = document.getElementById('auth-menu');
    
    if (currentUser) {
        authMenu.innerHTML = `
            <a href="#" class="nav-link" onclick="logout(event)">${currentUser.name} (Logout)</a>
        `;
    } else {
        authMenu.innerHTML = `
            <a href="#login" class="nav-link" onclick="showLoginModal()">Login</a>
        `;
    }
}

// Logout
function logout(e) {
    e.preventDefault();
    currentUser = null;
    localStorage.removeItem(CURRENT_USER_KEY);
    updateAuthMenu();
    showSuccess('Logged out successfully!');
}

// Load Current User
function loadCurrentUser() {
    const savedUser = localStorage.getItem(CURRENT_USER_KEY);
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        updateAuthMenu();
    }
}

// Utility Functions
function showSuccess(message) {
    const successDiv = document.getElementById('success-message');
    document.getElementById('success-text').textContent = message;
    successDiv.classList.add('active');

    setTimeout(() => {
        successDiv.classList.remove('active');
    }, 3000);
}

function showError(message) {
    alert(message); // Simple error display
}

function scrollToShop() {
    const shopSection = document.getElementById('shop');
    shopSection.scrollIntoView({ behavior: 'smooth' });
}

// Close modals when clicking outside
window.addEventListener('click', function(event) {
    const loginModal = document.getElementById('login-modal');
    const cartModal = document.getElementById('cart-modal');
    const checkoutModal = document.getElementById('checkout-modal');

    if (event.target === loginModal) {
        loginModal.classList.remove('active');
    }
    if (event.target === cartModal) {
        cartModal.classList.remove('active');
    }
    if (event.target === checkoutModal) {
        checkoutModal.classList.remove('active');
    }
});