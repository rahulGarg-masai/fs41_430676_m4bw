// auth.js
document.addEventListener('DOMContentLoaded', function() {
    // Firebase configuration
    const firebaseConfig = {
        apiKey: "AIzaSyCfe4Imjw_rjkRV0PrF8nsXEVQYk8j-kuw",
        authDomain: "loan-application-system-312c3.firebaseapp.com",
        databaseURL: "https://loan-application-system-312c3-default-rtdb.asia-southeast1.firebasedatabase.app",
        projectId: "loan-application-system-312c3",
        storageBucket: "loan-application-system-312c3.firebasestorage.app",
        messagingSenderId: "1028570891867",
        appId: "1:1028570891867:web:93204ea4918f7cbb02217e",
        measurementId: "G-D2QPE0ETJK"
    };

    try {
        // Check if Firebase is already initialized
        if (!firebase.apps || !firebase.apps.length) {
            // Initialize Firebase
            firebase.initializeApp(firebaseConfig);
        }
        
        const auth = firebase.auth();
        
        // Form elements
        const authForm = document.getElementById('authForm');
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        const statusMessage = document.getElementById('statusMessage');
        
        console.log("Status message element:", statusMessage); // Debug

        // Check if user is already logged in
        auth.onAuthStateChanged(user => {
            if (user) {
                // User is signed in - redirect to dashboard
                window.location.href = 'dashboard.html';
            }
        });
        
        // Handle form submission
        authForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Clear previous errors
            statusMessage.textContent = '';
            statusMessage.className = 'error-message';
            
            const email = emailInput.value.trim();
            let password = passwordInput.value.trim();
            
            if (!email || !password) {
                statusMessage.textContent = 'Please enter both email and password';
                statusMessage.style.display = 'block';
                return;
            }
            
            // Always prefix with YEAR- to match the format used during account creation
            password = "YEAR-" + password;
            
            try {
                // Try to sign in with provided credentials
                await auth.signInWithEmailAndPassword(email, password);
                // Redirect to dashboard upon successful login
                window.location.href = 'dashboard.html';
            } catch (error) {
                console.error("Authentication error:", error.code, error.message); // Debug
                handleAuthError(error);
            }
        });
        
        function handleAuthError(error) {
            // Error messages map - updated with the latest Firebase error codes
            const errorMessages = {
                'auth/wrong-password': 'Incorrect password',
                'auth/user-not-found': 'Invalid account',
                'auth/invalid-email': 'Invalid email format',
                'auth/invalid-login-credentials': 'Invalid email or password',
                'auth/invalid-credential': 'Invalid credentials',
                'auth/too-many-requests': 'Too many failed login attempts. Please try again later.'
            };
            
            // Get the appropriate error message or use the default
            const errorMessage = errorMessages[error.code] || `Login error: ${error.message}`;
            console.log("Setting error message:", errorMessage); // Debug
            
            // Set error message and ensure it's visible
            statusMessage.textContent = errorMessage;
            statusMessage.className = 'error-message';
            statusMessage.style.display = 'block';
        }
    } catch (error) {
        console.error("Firebase initialization error:", error);
        alert("There was an error connecting to the authentication service. Please try again later.");
    }
});