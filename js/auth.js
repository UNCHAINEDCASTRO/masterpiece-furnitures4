// Auth State Listener
auth.onAuthStateChanged(user => {
    updateAuthUI();
    if(user) {
        syncCartFromFirestore(user.uid);
    }
});

function updateAuthUI() {
    const user = auth.currentUser;
    const authButtons = document.getElementById('auth-buttons');
    const userMenu = document.getElementById('user-menu');
    const userEmail = document.getElementById('user-email');
    
    if(user) {
        if(authButtons) authButtons.style.display = 'none';
        if(userMenu) userMenu.style.display = 'flex';
        if(userEmail) {
            userEmail.textContent = user.email;
            userEmail.href = "dashboard.html";
        }
    } else {
        if(authButtons) authButtons.style.display = 'flex';
        if(userMenu) userMenu.style.display = 'none';
    }
}

function login(email, password) {
    return auth.signInWithEmailAndPassword(email, password)
        .then(() => {
            alert("Login successful!");
            window.location.href = "dashboard.html";
        })
        .catch(error => {
            alert("Error: " + error.message);
        });
}

function signup(email, password, name) {
    return auth.createUserWithEmailAndPassword(email, password)
        .then(userCredential => {
            return db.collection('users').doc(userCredential.user.uid).set({
                name: name,
                email: email,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        })
        .then(() => {
            alert("Account created successfully!");
            window.location.href = "dashboard.html";
        })
        .catch(error => {
            alert("Error: " + error.message);
        });
}

function logout() {
    auth.signOut().then(() => {
        alert("Logged out successfully");
        window.location.href = "index.html";
    });
}

function syncCartFromFirestore(userId) {
    db.collection('carts').doc(userId).get()
        .then(doc => {
            if(doc.exists) {
                const firestoreCart = doc.data().items;
                if(firestoreCart.length > 0) {
                    localStorage.setItem('cart', JSON.stringify(firestoreCart));
                    updateCartCount();
                }
            }
        });
}

function saveCartToFirestore(userId, cartItems) {
    if(userId) {
        db.collection('carts').doc(userId).set({
            items: cartItems,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }).catch(error => console.error("Error saving cart:", error));
    }
}
