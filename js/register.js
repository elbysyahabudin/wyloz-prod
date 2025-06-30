const supabaseUrl = 'https://trqvushwhkvchkgqhmge.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRycXZ1c2h3aGt2Y2hrZ3FobWdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc5MDU1MjUsImV4cCI6MjA1MzQ4MTUyNX0.J-yggfqvHPQtP-Zk-bwOxTRqD64J6jgQ_DOLCCp-JxY'; // Replace with actual key (keep secret in prod)
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

function showError(elementId, message) {
  const errorElement = document.getElementById(elementId);
  errorElement.textContent = message;
  errorElement.style.visibility = 'visible';
}

function hideError(elementId) {
  const errorElement = document.getElementById(elementId);
  errorElement.style.visibility = 'hidden';
}

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

async function register() {
  let isValid = true;

  const username = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();

  if (!username) {
    showError('name-error', 'Username is required');
    isValid = false;
  } else {
    hideError('name-error');
  }

  if (!email) {
    showError('email-error', 'Email is required');
    isValid = false;
  } else if (!validateEmail(email)) {
    showError('email-error', 'Please enter a valid email');
    isValid = false;
  } else {
    hideError('email-error');
  }

  if (!password) {
    showError('password-error', 'Password is required');
    isValid = false;
  } else if (password.length < 6) {
    showError('password-error', 'Password must be at least 6 characters');
    isValid = false;
  } else {
    hideError('password-error');
  }

  if (!isValid) return;

  try {
    const { data: existingUsers, error: checkError } = await supabaseClient
      .from('users')
      .select('*')
      .or(`username.eq.${username},email.eq.${email}`);

    if (checkError) throw checkError;

    if (existingUsers && existingUsers.length > 0) {
      if (existingUsers.some(user => user.username === username)) {
        showError('name-error', 'Username already taken');
      }
      if (existingUsers.some(user => user.email === email)) {
        showError('email-error', 'Email already registered');
      }
      return;
    }
// After including bcryptjs
const bcrypt = window.dcodeIO.bcrypt;

    // 🔒 Hash the password
    const hashedPassword = bcrypt.hashSync(password, 10);

    const { data, error } = await supabaseClient
      .from('users')
      .insert([
        {
          username: username,
          email: email,
          password: hashedPassword,
          created_at: new Date().toISOString()
        }
      ])
      .select();

    if (error) throw error;

    // alert('Registration successful!');
    window.location.href = '../view/login.html';
  } catch (error) {
    console.error('Registration error:', error);
    // alert('An error occurred during registration');
  }
}

// Hide errors on input
document.getElementById('name').addEventListener('input', () => hideError('name-error'));
document.getElementById('email').addEventListener('input', () => hideError('email-error'));
document.getElementById('password').addEventListener('input', () => hideError('password-error'));