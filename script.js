// Supabase configuration
const { createClient } = supabase;  
const supabaseUrl = 'YOUR_SUPABASE_URL';  
const supabaseKey = 'YOUR_SUPABASE_KEY';  
const supabase = createClient(supabaseUrl, supabaseKey);

// User authentication functions
async function signUp(email, password) {  
    const { user, error } = await supabase.auth.signUp({ email, password });  
    return { user, error };  
}

async function signIn(email, password) {  
    const { user, error } = await supabase.auth.signIn({ email, password });  
    return { user, error };  
}

async function signOut() {  
    const { error } = await supabase.auth.signOut();  
    return { error };  
}

// Product fetching function
async function fetchProducts() {  
    let { data: products, error } = await supabase.from('products').select('*');  
    return { products, error };  
}

// Cart management functions
let cart = [];
function addToCart(product) {  
    cart.push(product);  
}

function removeFromCart(productId) {  
    cart = cart.filter(product => product.id !== productId);  
}

function viewCart() {  
    return cart;  
}

// Checkout function
async function checkout(orderDetails) {  
    const { data, error } = await supabase.from('orders').insert([orderDetails]);  
    return { data, error };  
}

// Exporting functions for external use
export { signUp, signIn, signOut, fetchProducts, addToCart, removeFromCart, viewCart, checkout };