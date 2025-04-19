// Admin Dashboard JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const approveAllBtn = document.getElementById('approve-all-btn');
    const applicationsList = document.getElementById('applications-list');
    
    // Load applications on page load
    loadApplications();
    
    // Set up approve button event listener
    approveAllBtn.addEventListener('click', function() {
        const applications = JSON.parse(localStorage.getItem('loanApplications') || '[]');
        
        if (applications.length === 0) {
            alert('No applications to approve.');
            return;
        }
        
        // Update all applications to approved status
        const approvedApplications = applications.map(app => ({...app, status: 'Approved'}));
        localStorage.setItem('loanApplications', JSON.stringify(approvedApplications));
        
        // Refresh the display
        loadApplications();
        alert('All applications have been approved successfully!');
    });
    
    // Function to load and display applications
    function loadApplications() {
        const applications = JSON.parse(localStorage.getItem('loanApplications') || '[]');
        
        // Clear and update applications list
        applicationsList.innerHTML = applications.length ? '' : 
            '<div class="no-applications">No applications found</div>';
        
        // Create application items
        applications.forEach(app => {
            const isApproved = app.status === 'Approved';
            
            // Create application element
            const appItem = document.createElement('div');
            appItem.className = 'application-item';
            appItem.innerHTML = `
                <div class="application-header">
                    <div class="application-name">${app.data?.fullName || 'Unnamed Applicant'}</div>
                    <span class="status-badge ${isApproved ? 'approved' : 'under-review'}">
                        ${app.status || 'Under Review'}
                    </span>
                </div>
                <div class="application-details">
                    <div class="detail-row">
                        <span class="detail-label">Email: </span>
                        <span class="detail-value">${app.email || 'No email'}</span>
                    </div>
                </div>
            `;
            
            applicationsList.appendChild(appItem);
        });
    }
}); 