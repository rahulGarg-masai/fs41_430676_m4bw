let form, formSteps, steps, stepTitles, progressBar;
let nextButtons, prevButtons, submitButton;
let currentStep = 1;

document.addEventListener('DOMContentLoaded', function() {
    
    form = document.getElementById('loanApplicationForm');
    formSteps = document.querySelectorAll('.form-step');
    steps = document.querySelectorAll('.step');
    stepTitles = document.querySelectorAll('.step-title');
    progressBar = document.getElementById('progress');
    
    nextButtons = document.querySelectorAll('.next-btn');
    prevButtons = document.querySelectorAll('.prev-btn');
    submitButton = document.getElementById('submitApplication');
    
    initForm();
    
    setupNavigation();
    
    setupValidation();
    
    setupFormSubmission();

    setupFirebaseAuth();
});

function setupNavigation() {
    // Next button click handlers
    nextButtons.forEach(button => {
        button.addEventListener('click', function() {
            const stepNumber = parseInt(this.id.replace('step', '').replace('Next', ''));
            
            if (validateStep(stepNumber)) {
                saveFormData(); // Save data before moving to next step
                goToStep(stepNumber + 1);
            }
        });
    });
    
    // Previous button click handlers
    prevButtons.forEach(button => {
        button.addEventListener('click', function() {
            const stepNumber = parseInt(this.id.replace('step', '').replace('Prev', ''));
            goToStep(stepNumber - 1);
        });
    });
}

function goToStep(stepNumber) {
    if (stepNumber < 1 || stepNumber > formSteps.length) return;

    // Update current step
    currentStep = stepNumber;

    // Update current form section visibility
    formSteps.forEach((step, index) => {
        if (index + 1 === stepNumber) {
            step.classList.add('active');
        } else {
            step.classList.remove('active');
        }
    });

    // Update steps circle indicator
    steps.forEach((step, index) => {
        if (index + 1 < stepNumber) {
            step.classList.add('completed');
            step.classList.remove('active');
        } else if (index + 1 === stepNumber) {
            step.classList.add('active');
            step.classList.remove('completed');
        } else {
            step.classList.remove('active', 'completed');
        }
    });

    // Update step titles under progress circles
    stepTitles.forEach((title, index) => {
        title.classList.toggle('active', index + 1 === stepNumber);
    });

    // Update progress bar
    const progressPercentage = ((stepNumber - 1) / (formSteps.length - 1)) * 100;
    progressBar.style.width = `${progressPercentage}%`;//changing width as per progress %

    // form starts from top each time next or prev is clicked
    document.querySelector('.form-container').scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

function initForm() {
    // Load saved form data from local storage if available
    const savedFormData = localStorage.getItem('loanApplicationData');
    if (savedFormData) {
        const formData = JSON.parse(savedFormData);
        
        // Fill in form fields with saved data
        Object.keys(formData).forEach(fieldName => {//keys - fullname , email etc
            const field = document.getElementById(fieldName);
            if (field) {
                if (field.type === 'checkbox') {
                    field.checked = formData[fieldName];
                } else {
                    field.value = formData[fieldName];
                }
            }
        });
        
        // Show conditional fields if necessary
        if (document.getElementById('existingLoans').value === 'yes') {
            document.getElementById('existingLoansDetailsGroup').style.display = 'block';
        }
    }
}

function saveFormData() {
    const formData = {};//data cache obj
    
    // Collect all form inputs
    const formInputs = form.querySelectorAll('input, select, textarea');
    formInputs.forEach(input => {
        if (input.type === 'file') return; // Skip file inputs
        
        if (input.type === 'checkbox') {
            formData[input.id] = input.checked;
        } else {
            formData[input.id] = input.value;
        }
    });
    
    // Save to localStorage
    localStorage.setItem('loanApplicationData', JSON.stringify(formData));
}

function setupValidation() {
    // Real-time validation for all form inputs
    const formInputs = form.querySelectorAll('input, select, textarea');
    
    formInputs.forEach(input => {
        // Validate on blur (when field loses focus)
        input.addEventListener('blur', function() {
            validateInput(this);
        });
        
        // For select elements, also validate on change
        if (input.type === 'select-one') {
            input.addEventListener('change', function() {
                validateInput(this);
            });
        }
    });
}

// Input Validation Functions
function validateInput(input) {
    const errorElement = document.getElementById(`${input.id}Error`);
    let isValid = true;
    let errorMessage = '';
    
    // Clear previous error
    errorElement.textContent = '';
    errorElement.classList.remove('show');
    
    // Skip validation if input is not required and empty
    if (!input.required && !input.value) return true;
    
    // Validate based on input type
    switch(input.type) {
        case 'email':
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(input.value)) {
                isValid = false;
                errorMessage = 'Please enter a valid email address';
            }
            break;
            
        case 'tel':
            const phonePattern = /^[0-9\+\-\(\)\s]{10,15}$/;
            if (!phonePattern.test(input.value)) {
                isValid = false;
                errorMessage = 'Please enter a valid phone number';
            }
            break;
            
        case 'date':
            if (!input.value) {
                isValid = false;
                errorMessage = 'Please select a date';
            } else {
                const selectedDate = new Date(input.value);
                const currentDate = new Date();
                const minDate = new Date();
                minDate.setFullYear(currentDate.getFullYear() - 100); // Max age 100 years
                const maxDate = new Date();
                maxDate.setFullYear(currentDate.getFullYear() - 18); // Min age 18 years
                
                if (selectedDate > currentDate) {
                    isValid = false;
                    errorMessage = 'Date cannot be in the future';
                } else if (selectedDate < minDate || selectedDate > maxDate) {
                    isValid = false;
                    errorMessage = 'You must be between 18 and 100 years old';
                }
            }
            break;
            
        case 'number':
            const min = parseFloat(input.min);
            if (input.value < min) {
                isValid = false;
                errorMessage = `Value must be at least ${min}`;
            }
            break;
            
        case 'select-one':
            if (!input.value) {
                isValid = false;
                errorMessage = 'Please select an option';
            }
            break;
            
        case 'checkbox':
            if (!input.checked && input.required) {
                isValid = false;
                errorMessage = 'You must agree to continue';
            }
            break;
            
        case 'file'://add file size , file type
            if (input.required && (!input.files || input.files.length === 0)) {
                isValid = false;
                errorMessage = 'Please select a file';
            }
            break;
            
        default:
            if (!input.value.trim()) {
                isValid = false;
                errorMessage = 'This field is required';
            }
    }
    
    // Special case for specific fields
    if (input.id === 'fullName' && input.value.trim().split(' ').length < 2) {//can inc name length requirements
        isValid = false;
        errorMessage = 'Please enter your full name (first and last name)';
    }
    //can add more address format 
    if (input.id === 'address' && input.value.trim().length < 10) {
        isValid = false;
        errorMessage = 'Please enter a complete address';
    }
    
    // Display error if not valid
    if (!isValid) {
        errorElement.textContent = errorMessage;
        errorElement.classList.add('show');
        input.classList.add('error');
    } else {
        input.classList.remove('error');
    }
    
    return isValid;
}

function validateStep(stepNumber) {
    const currentFormStep = document.getElementById(`step${stepNumber}`);
    const inputs = currentFormStep.querySelectorAll('input, select, textarea');
    
    let isStepValid = true;
    
    // Validate each input in the current step
    inputs.forEach(input => {
        // Skip validation for hidden fields
        if (input.closest('.form-group').style.display === 'none') return;
        
        const inputValid = validateInput(input);
        if (!inputValid) {
            isStepValid = false;
        }
    });
    
    return isStepValid;
}   

// Form Submission
function setupFormSubmission() {
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validate the final step
        if (!validateStep(4)) return;
        
        // Save final form data
        saveFormData();
        
        // Prepare form data for submission
        const userEmail = document.getElementById('email').value.trim();
        const dob = new Date(document.getElementById('dob').value);
        const birthYear = dob.getFullYear().toString();
        //can create stronger pass
        const securePassword = "YEAR-" + birthYear;//alert displays pass after submit clicked
        
        // Create user account & save application data
        submitApplication(userEmail, securePassword);
    });
}

function submitApplication(email, password) {
    // Get form data
    const formData = new FormData(form);//FormData api to capture data
    const formDataObj = {};
    
    formData.forEach((value, key) => {
        if (value instanceof File) {
            formDataObj[key] = value.name; // Just stores filename for now
        } else {
            formDataObj[key] = value;
        }
    });
    
    // Application data to save
    const applicationData = {
        email: email,
        status: 'Submitted',
        submissionDate: new Date().toISOString(), //iso format YYYY-MM-DDTHH:mm:ss.sssZ
        data: formDataObj //formDataObj-created in submitApplication()
    };
    
    // Create Firebase user
    const auth = firebase.auth();
    auth.createUserWithEmailAndPassword(email, password)//email pass promise
        .then(() => {
            saveApplicationData(applicationData, password);
        })
        .catch((error) => {
            // If user already exists, still save the application
            if (error.code === 'auth/email-already-in-use') {
                saveApplicationData(applicationData);
            } else {
                alert(`Error creating account: ${error.message}. Please try again.`);
            }
        });
}

function saveApplicationData(applicationData, password) {
    // Store in localStorage
    let applications = JSON.parse(localStorage.getItem('loanApplications') || '[]');//load data from local storage
    applications.push(applicationData);
    localStorage.setItem('loanApplications', JSON.stringify(applications));
    
    // Clear the current incomplete/old form data
    localStorage.removeItem('loanApplicationData');
    
    // Show success message
    if (password) {//if 1st time user
        alert(`Your loan application has been submitted successfully! You can now track your application by logging in with your email. Your password is "${password}" (without quotes).`);
    } else {//existing user
        alert(`Your loan application has been submitted successfully! You can log in with your existing credentials.`);
    }
}

// Firebase Authentication Setup
function setupFirebaseAuth() {
    // Your Firebase configuration
    const firebaseConfig = {
        apiKey: "AIzaSyCfe4Imjw_rjkRV0PrF8nsXEVQYk8j-kuw",
        authDomain: "loan-application-system-312c3.firebaseapp.com",
        projectId: "loan-application-system-312c3",
        storageBucket: "loan-application-system-312c3.firebasestorage.app",
        messagingSenderId: "1028570891867",
        appId: "1:1028570891867:web:93204ea4918f7cbb02217e"
    };

    try {
        // Initialize Firebase if not already initialized in auth.js
        if (!firebase.apps || !firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
        
        // Initialize Authentication
        firebase.auth();
        console.log("Firebase Authentication initialized");
    } catch (error) {
        console.error("Firebase initialization error:", error);
    }
}