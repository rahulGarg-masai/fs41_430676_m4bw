// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCfe4Imjw_rjkRV0PrF8nsXEVQYk8j-kuw",
    authDomain: "loan-application-system-312c3.firebaseapp.com",
    databaseURL: "https://loan-application-system-312c3-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "loan-application-system-312c3",
    storageBucket: "loan-application-system-312c3.firebasestorage.app",
    messagingSenderId: "1028570891867",
    appId: "1:1028570891867:web:93204ea4918f7cbb02217e"
};

// Initialize Firebase
if (!firebase.apps || !firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore();

// Get DOM elements
const usernameElement = document.getElementById('username');
const logoutButton = document.getElementById('logout-btn');
const loanStatusElement = document.getElementById('loan-status');
const documentStatusElement = document.getElementById('document-status');

// Check authentication state
auth.onAuthStateChanged(user => {
    if (user) {
        // User is signed in
        getUserInfo(user.email);
    } else {
        // User is signed out, redirect to auth page
        window.location.href = 'auth.html';
    }
});

// Get user information from form data
function getUserInfo(email) {
    // Get saved application data from localStorage
    const applications = JSON.parse(localStorage.getItem('loanApplications') || '[]');
    const userApp = applications.find(app => app.email === email);
    
    if (userApp) {
        // Display user's full name
        if (userApp.data && userApp.data.fullName) {
            usernameElement.textContent = userApp.data.fullName;
        } else {
            // Fallback to email if name not found
            usernameElement.textContent = email.split('@')[0];
        }
        
        // Update application status on dashboard
        if (userApp.status === 'Approved') {
            loanStatusElement.textContent = 'Approved';
            loanStatusElement.style.backgroundColor = '#e8f5e9';
            loanStatusElement.style.color = '#2e7d32';
            
            documentStatusElement.textContent = 'Approved';
            documentStatusElement.style.backgroundColor = '#e8f5e9';
            documentStatusElement.style.color = '#2e7d32';
            
            // Show approval alert if not already shown
            const approvalAlertKey = `approval_alert_shown_${email}`;
            if (!localStorage.getItem(approvalAlertKey)) {
                setTimeout(() => {
                    alert('Congratulations! Your loan application has been approved!');
                    localStorage.setItem(approvalAlertKey, 'true');
                }, 1000); // Small delay to ensure UI is loaded first
            }
        } else {
            loanStatusElement.textContent = 'Under Review';
            documentStatusElement.textContent = 'Under Review';
        }
    } else {
        // No application found for this user
        usernameElement.textContent = email.split('@')[0];
        loanStatusElement.textContent = 'No Application';
        documentStatusElement.textContent = 'No Application';
    }
}

// Handle logout
logoutButton.addEventListener('click', () => {
    auth.signOut()
        .then(() => {
            // Sign-out successful, redirect to login
            window.location.href = 'auth.html';
        })
        .catch((error) => {
            // An error happened during sign out
            console.error("Logout error:", error);
            alert("Error signing out");
        });
});

