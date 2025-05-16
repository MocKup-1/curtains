document.addEventListener('DOMContentLoaded', function() {
    // Initialize cart from localStorage or empty array
    let cart = JSON.parse(localStorage.getItem('bumuCart')) || [];
    let totalPrice = 0;

    // Mobile menu toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu');
    const nav = document.querySelector('nav');
    
    if (mobileMenuBtn && nav) {
        mobileMenuBtn.addEventListener('click', function() {
            nav.classList.toggle('active');
        });
    }

    // Cart elements
    const cartIcon = document.querySelector('.cart-icon a');
    const cartSidebar = document.querySelector('.cart-sidebar');
    const cartOverlay = document.querySelector('.cart-overlay');
    const closeCart = document.querySelector('.close-cart');
    const cartItemsContainer = document.querySelector('.cart-items');
    const cartCountElements = document.querySelectorAll('.cart-count');
    const totalPriceElement = document.querySelector('.total-price');
    const checkoutBtn = document.querySelector('.checkout-btn');

    // Toggle cart sidebar
    function toggleCart() {
        cartSidebar.classList.toggle('active');
        cartOverlay.classList.toggle('active');
    }

    if (cartIcon) {
        cartIcon.addEventListener('click', function(e) {
            e.preventDefault();
            toggleCart();
        });
    }

    if (closeCart) {
        closeCart.addEventListener('click', toggleCart);
    }

    if (cartOverlay) {
        cartOverlay.addEventListener('click', toggleCart);
    }

    // Update cart UI
    function updateCart() {
        // Clear cart items
        if (cartItemsContainer) {
            cartItemsContainer.innerHTML = '';
        }
        
        totalPrice = 0;

        if (cart.length === 0) {
            if (cartItemsContainer) {
                cartItemsContainer.innerHTML = '<p>Your cart is empty</p>';
            }
            
            cartCountElements.forEach(el => {
                el.textContent = '0';
            });
            
            if (totalPriceElement) {
                totalPriceElement.textContent = 'UGX 0';
            }
            
            return;
        }

        // Add each item to cart UI
        cart.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            totalPrice += itemTotal;

            if (cartItemsContainer) {
                const cartItemElement = document.createElement('div');
                cartItemElement.className = 'cart-item';
                cartItemElement.innerHTML = `
                    <img src="${item.img}" alt="${item.title}" class="cart-item-img">
                    <div class="cart-item-details">
                        <h4 class="cart-item-title">${item.title}</h4>
                        <p class="cart-item-size">Size: ${item.size}</p>
                        <p class="cart-item-price">UGX ${item.price.toLocaleString()} x ${item.quantity}</p>
                    </div>
                    <button class="remove-item" data-index="${index}">
                        <i class="fas fa-trash"></i>
                    </button>
                `;
                cartItemsContainer.appendChild(cartItemElement);
            }
        });

        // Update cart count and total
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        
        cartCountElements.forEach(el => {
            el.textContent = totalItems;
        });
        
        if (totalPriceElement) {
            totalPriceElement.textContent = `UGX ${totalPrice.toLocaleString()}`;
        }

        // Add event listeners to remove buttons
        document.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                cart.splice(index, 1);
                saveCart();
                updateCart();
            });
        });
    }

    // Save cart to localStorage
    function saveCart() {
        localStorage.setItem('bumuCart', JSON.stringify(cart));
    }

    // Add to cart functionality
    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', function() {
            const productCard = this.closest('.product-card');
            const productId = productCard.getAttribute('data-id');
            const productTitle = productCard.querySelector('.product-title').textContent;
            const productImg = productCard.querySelector('.product-img').src;
            const sizeSelect = productCard.querySelector('.size-select');
            const selectedOption = sizeSelect.options[sizeSelect.selectedIndex];
            const size = selectedOption.value;
            const price = parseInt(selectedOption.getAttribute('data-price'));
            
            // Check if item already exists in cart
            const existingItemIndex = cart.findIndex(item => 
                item.id === productId && item.size === size
            );

            if (existingItemIndex >= 0) {
                // Update quantity if item exists
                cart[existingItemIndex].quantity += 1;
            } else {
                // Add new item to cart
                cart.push({
                    id: productId,
                    title: productTitle,
                    img: productImg,
                    size: size,
                    price: price,
                    quantity: 1
                });
            }

            saveCart();
            updateCart();
            showAddToCartFeedback(productCard);
        });
    });

    // Show feedback when item is added to cart
    function showAddToCartFeedback(productCard) {
        const feedback = document.createElement('div');
        feedback.textContent = 'Added to cart!';
        feedback.style.position = 'absolute';
        feedback.style.backgroundColor = 'var(--success)';
        feedback.style.color = 'white';
        feedback.style.padding = '5px 10px';
        feedback.style.borderRadius = '4px';
        feedback.style.top = '10px';
        feedback.style.left = '10px';
        feedback.style.zIndex = '10';
        feedback.style.animation = 'fadeOut 2s forwards';

        productCard.style.position = 'relative';
        productCard.appendChild(feedback);

        // Remove feedback after animation
        setTimeout(() => {
            feedback.remove();
        }, 2000);
    }

    // Checkout functionality
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
            if (cart.length === 0) {
                alert('Your cart is empty');
                return;
            }

            // Format the message for WhatsApp
            let message = `Hello Bumu Interiors! I would like to order:\n\n`;
            
            cart.forEach(item => {
                message += `- ${item.title} (${item.size}) x ${item.quantity} = UGX ${(item.price * item.quantity).toLocaleString()}\n`;
            });
            
            message += `\nTotal: UGX ${totalPrice.toLocaleString()}\n\n`;
            message += `Please confirm availability and payment details. Thank you!`;
            
            // Encode the message for URL
            const encodedMessage = encodeURIComponent(message);
            const whatsappUrl = `https://wa.me/256778228724?text=${encodedMessage}`;
            
            // Open WhatsApp in a new tab
            window.open(whatsappUrl, '_blank');
        });
    }

    // Close cart when clicking on links inside it
    if (cartSidebar) {
        cartSidebar.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', toggleCart);
        });
    }

    // Initialize cart on page load
    updateCart();
});