// Check if user is authenticated (for protected pages)

function checkAuth() {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    if (!isAuthenticated) {
        window.location.href = '/view/login.html';
        return false;
    }
    return true;
}

// Check if user is NOT authenticated (for login/register pages)
function checkNotAuth() {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    if (isAuthenticated) {
        window.location.href = '/view/index.html';
        return false;
    }
    return true;
}

function logout() {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userEmail');
    window.location.href = '/view/login.html';
}

function getCurrentUserEmail() {
    return localStorage.getItem('userEmail');
}