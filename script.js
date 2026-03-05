// ============================================
// SUPABASE CONFIGURATION
// ============================================
const SUPABASE_URL = 'https://gxjgxxewwqqzfdpakmym.supabase.co';
const SUPABASE_KEY = 'sb_publishable_PdBj_TZlHQpVwHQmQt4x5g_HAQ47znq';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ============================================
// Sample Products Database (unchanged)
// ============================================
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

// ============================================
// Cart Array & State
// ============================================
let cart = [];
let currentUser = null;

// ============================================
// Initialize App
// ============================================
document.addEventListener('DOMContentLoaded', async function () {
    loadProducts();
    await loadCurrentUser();   // Supabase session check
    await loadCart();          // Load cart from Supabase
    setupEventListeners();
});

// ============================================
// Setup Event Listeners (unchanged)
// ============================================
function setupEventListeners() {
    const loginForm = document.getElementById('login-form');
    if (loginForm) loginForm.addEventListener('submit', handleLogin);

    const signupForm = document.getElementById('signup-form');
    if (signupForm) signupForm.addEventListener('submit', handleSignup);

    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) checkoutForm.addEventListener('submit', handleCheckout);

    const cartIcon = document.querySelector('.cart-link');
    if (cartIcon) {
        cartIcon.addEventListener('click', function (e) {
            e.preventDefault();
            openCartModal();
        });
    }
}

// ============================================
// Load Products (unchanged)
// ============================================
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

// ============================================
// Select Size (unchanged)
// ============================================
function selectSize(element, productId) {
    const sizeBtns = document.querySelectorAll(`#sizes-${productId} .size-btn`);
    sizeBtns.forEach(btn => btn.classList.remove('active'));
    element.classList.add('active');
}

// ============================================
// CART - Supabase powered
// ============================================

// Load cart from Supabase (if logged in) else empty
async function loadCart() {
    if (!currentUser) {
        cart = [];
        updateCartCount();
        return;
    }
    const { data, error } = await supabase
        .from('cart')
        .select('*')
        .eq('user_id', currentUser.id);

    if (error) {
        console.error('Error loading cart:', error.message);
        cart = [];
    } else {
        cart = data || [];
    }
    updateCartCount();
}

// Add to cart - saves to Supabase
async function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const sizeBtn = document.querySelector(`#sizes-${productId} .size-btn.active`);

    if (!sizeBtn) {
        showError('Please select a size');
        return;
    }
    const size = sizeBtn.getAttribute('data-size');

    if (!currentUser) {
        showError('Please login to add items to cart');
        showLoginModal();
        return;
    }

    // Check if item already exists in cart
    const existingItem = cart.find(item => item.product_id === productId && item.size === size);

    if (existingItem) {
        // Update quantity in Supabase
        const { error } = await supabase
            .from('cart')
            .update({ quantity: existingItem.quantity + 1 })
            .eq('id', existingItem.id);

        if (!error) existingItem.quantity += 1;
    } else {
        // Insert new cart item
        const { data, error } = await supabase
            .from('cart')
            .insert([{
                user_id: currentUser.id,
                product_id: productId,
                name: product.name,
                price: product.price,
                size: size,
                quantity: 1
            }])
            .select()
            .single();

        if (!error && data) cart.push(data);
        if (error) console.error('Add to cart error:', error.message);
    }

    updateCartCount();
    showSuccess(`${product.name} added to cart!`);
}

// Remove from cart - deletes from Supabase
async function removeFromCart(cartId) {
    const { error } = await supabase
        .from('cart')
        .delete()
        .eq('id', cartId);

    if (!error) {
        cart = cart.filter(item => item.id !== cartId);
        updateCartCount();
        loadCartItems();
    } else {
        console.error('Remove from cart error:', error.message);
    }
}

// Update Cart Count (unchanged)
function updateCartCount() {
    const countElement = document.getElementById('cart-count');
    countElement.textContent = cart.length;
}

// Load Cart Items in Modal (updated to use Supabase cart shape)
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

// ============================================
// Filter Products (unchanged)
// ============================================
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

// ============================================
// Modal Functions (unchanged)
// ============================================
function showLoginModal() {
    document.getElementById('login-modal').classList.add('active');
}
function closeLoginModal() {
    document.getElementById('login-modal').classList.remove('active');
}
function openCartModal() {
    loadCartItems();
    document.getElementById('cart-modal').classList.add('active');
}
function closeCartModal() {
    document.getElementById('cart-modal').classList.remove('active');
}
function proceedToCheckout() {
    if (cart.length === 0) { showError('Cart is empty'); return; }
    if (!currentUser) {
        showError('Please login first');
        closeCartModal();
        showLoginModal();
        return;
    }
    closeCartModal();
    document.getElementById('checkout-modal').classList.add('active');
}
function closeCheckoutModal() {
    document.getElementById('checkout-modal').classList.remove('active');
}

// ============================================
// Auth Toggle (unchanged)
// ============================================
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

// ============================================
// AUTH - Supabase powered
// ============================================

// Handle Login via Supabase Auth
async function handleLogin(e) {
    e.preventDefault();
    const email = e.target.querySelector('input[type="email"]').value;
    const password = e.target.querySelector('input[type="password"]').value;

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
        document.getElementById('login-error').textContent = error.message;
        return;
    }

    currentUser = data.user;
    // Fetch profile name
    const { data: profile } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', currentUser.id)
        .single();
    if (profile) currentUser.name = profile.name;

    await loadCart();
    showSuccess('Login successful!');
    closeLoginModal();
    updateAuthMenu();
    e.target.reset();
}

// Handle Signup via Supabase Auth
async function handleSignup(e) {
    e.preventDefault();
    const name = e.target.querySelector('input[type="text"]').value;
    const email = e.target.querySelectorAll('input[type="email"]')[0].value;
    const password = e.target.querySelectorAll('input[type="password"]')[0].value;
    const confirmPassword = e.target.querySelectorAll('input[type="password"]')[1].value;

    if (password !== confirmPassword) {
        document.getElementById('signup-error').textContent = 'Passwords do not match';
        return;
    }

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } }   // stored in raw_user_meta_data, trigger picks it up
    });

    if (error) {
        document.getElementById('signup-error').textContent = error.message;
        return;
    }

    currentUser = data.user;
    if (currentUser) currentUser.name = name;

    showSuccess('Account created successfully!');
    closeLoginModal();
    updateAuthMenu();
    e.target.reset();
}

// Handle Checkout - saves order to Supabase, clears cart
async function handleCheckout(e) {
    e.preventDefault();
    const inputs = e.target.querySelectorAll('input');
    let isValid = true;
    inputs.forEach(input => { if (!input.value.trim()) isValid = false; });
    if (!isValid) { showError('Please fill all fields'); return; }

    const [fullName, email, address, city, zipCode] = [...inputs].map(i => i.value.trim());
    const orderNumber = '#' + Math.random().toString(36).substr(2, 9).toUpperCase();
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Save order to Supabase
    const { error: orderError } = await supabase
        .from('orders')
        .insert([{
            user_id: currentUser.id,
            order_number: orderNumber,
            full_name: fullName,
            email: email,
            address: address,
            city: city,
            zip_code: zipCode,
            total: total.toFixed(2),
            items: cart,
            status: 'pending'
        }]);

    if (orderError) {
        console.error('Order save error:', orderError.message);
        showError('Order failed. Please try again.');
        return;
    }

    // Clear cart in Supabase
    await supabase.from('cart').delete().eq('user_id', currentUser.id);
    cart = [];
    updateCartCount();
    showSuccess(`Order placed successfully! Order: ${orderNumber}`);
    closeCheckoutModal();
    e.target.reset();
}

// ============================================
// Auth Menu & Session
// ============================================

// Update nav auth menu (unchanged logic)
function updateAuthMenu() {
    const authMenu = document.getElementById('auth-menu');
    if (currentUser) {
        authMenu.innerHTML = `
            <a href="#" class="nav-link" onclick="logout(event)">${currentUser.name || currentUser.email} (Logout)</a>
        `;
    } else {
        authMenu.innerHTML = `
            <a href="#login" class="nav-link" onclick="showLoginModal()">Login</a>
        `;
    }
}

// Logout via Supabase
async function logout(e) {
    e.preventDefault();
    await supabase.auth.signOut();
    currentUser = null;
    cart = [];
    updateCartCount();
    updateAuthMenu();
    showSuccess('Logged out successfully!');
}

// Load current session from Supabase on page load
async function loadCurrentUser() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session && session.user) {
        currentUser = session.user;
        // Fetch profile name
        const { data: profile } = await supabase
            .from('profiles')
            .select('name')
            .eq('id', currentUser.id)
            .single();
        if (profile) currentUser.name = profile.name;
        updateAuthMenu();
    }
}

// Listen for auth state changes (handles email confirmation, token refresh etc.)
supabase.auth.onAuthStateChange(async (event, session) => {
    if (session && session.user) {
        currentUser = session.user;
        const { data: profile } = await supabase
            .from('profiles')
            .select('name')
            .eq('id', currentUser.id)
            .single();
        if (profile) currentUser.name = profile.name;
        updateAuthMenu();
        await loadCart();
    } else {
        currentUser = null;
        cart = [];
        updateCartCount();
        updateAuthMenu();
    }
});

// ============================================
// Utility Functions (unchanged)
// ============================================
function showSuccess(message) {
    const successDiv = document.getElementById('success-message');
    document.getElementById('success-text').textContent = message;
    successDiv.classList.add('active');
    setTimeout(() => { successDiv.classList.remove('active'); }, 3000);
}
function showError(message) {
    alert(message);
}
function scrollToShop() {
    document.getElementById('shop').scrollIntoView({ behavior: 'smooth' });
}

// Close modals when clicking outside (unchanged)
window.addEventListener('click', function (event) {
    const loginModal = document.getElementById('login-modal');
    const cartModal = document.getElementById('cart-modal');
    const checkoutModal = document.getElementById('checkout-modal');
    if (event.target === loginModal) loginModal.classList.remove('active');
    if (event.target === cartModal) cartModal.classList.remove('active');
    if (event.target === checkoutModal) checkoutModal.classList.remove('active');
});
