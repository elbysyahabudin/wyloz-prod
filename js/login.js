const supabaseUrl = 'https://trqvushwhkvchkgqhmge.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRycXZ1c2h3aGt2Y2hrZ3FobWdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc5MDU1MjUsImV4cCI6MjA1MzQ4MTUyNX0.J-yggfqvHPQtP-Zk-bwOxTRqD64J6jgQ_DOLCCp-JxY';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    errorElement.textContent = message;
    errorElement.style.visibility = 'visible';
}

function hideError(elementId) {
    document.getElementById(elementId).style.visibility = 'hidden';
}

async function login() {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    let isValid = true;

    // Validation
    if (!email) {
        showError('email-error', 'Please enter your email');
        isValid = false;
    } else {
        hideError('email-error');
    }

    if (!password) {
        showError('password-error', 'Please enter your password');
        isValid = false;
    } else {
        hideError('password-error');
    }

    if (!isValid) return;

    try {
        const { data: users, error } = await supabaseClient
            .from('users')
            .select('*')
            .eq('email', email);

        if (error) throw error;

        if (!users || users.length === 0) {
            showError('email-error', 'No user found with that email');
            return;
        }
        const bcrypt = window.dcodeIO.bcrypt;
        const user = users[0];
        const passwordMatch = bcrypt.compareSync(password, user.password);

        if (!passwordMatch) {
            showError('password-error', 'Incorrect password');
            return;
        }

        localStorage.setItem('userEmail', email);
        localStorage.setItem('isAuthenticated', 'true');

        // window.location.href = '/view/index.html';
        window.location.href = '/view/analytic.html';

    } catch (err) {
        console.error('Login error:', err);
    }
}

async function handleCredentialResponse(response) {
    try {
        const { email, name, picture, sub } = parseJwt(response.credential);
        
        const { data: users, error: userError } = await supabaseClient
            .from('users')
            .select('*')
            .eq('email', email);
        
        if (userError) throw userError;
        
        if (!users || users.length === 0) {
            // Create new user if doesn't exist
            const { error: insertError } = await supabaseClient
                .from('users')
                .insert([{
                    email: email,
                    name: name,
                    google_id: sub,
                    avatar_url: picture,
                    // Add any other required fields
                }]);
            
            if (insertError) throw insertError;
        }
        
        // Store user info and redirect
        localStorage.setItem('userEmail', email);
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userName', name);
        localStorage.setItem('userPicture', picture);
        
        window.location.href = '/view/analytic.html';
        
    } catch (error) {
        console.error('Google sign-in error:', error);
        alert('Google sign-in failed. Please try again.');
    }
}

function parseJwt(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
}

// Hide errors while typing
document.getElementById('email').addEventListener('input', () => hideError('email-error'));
document.getElementById('password').addEventListener('input', () => hideError('password-error'));


document.addEventListener('DOMContentLoaded', function() {
    const backgrounds = [
        '../assets/bg1.png',
        '../assets/bg2.png',
        '../assets/bg3.png',
        '../assets/bg4.png',
        '../assets/bg5.png',
        '../assets/bg6.png',
        '../assets/bg7.png',
        '../assets/bg8.png',
        '../assets/bg9.png'
    ];
    
    const slideshowContainer = document.querySelector('.bg-slideshow');
    let currentIndex = 0;
    
    // Preload all images and add them to the DOM
    backgrounds.forEach((bg, index) => {
        const img = document.createElement('img');
        img.src = bg;
        img.alt = `Background ${index + 1}`;
        if (index === 0) img.classList.add('active');
        slideshowContainer.appendChild(img);
    });
    
    function changeBackground() {
        const images = document.querySelectorAll('.bg-slideshow img');
        
        // Remove active class from current image
        images[currentIndex].classList.remove('active');
        
        // Move to next image (loop back to 0 if at end)
        currentIndex = (currentIndex + 1) % backgrounds.length;
        
        // Add active class to new image
        images[currentIndex].classList.add('active');
    }
    
    // Change every 5 seconds (5000ms)
    setInterval(changeBackground, 5000);
});