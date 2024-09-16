document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    // This is a simple example. In a real application, you would validate against a server.
    if (username === 'admin' && password === 'admin') {
        localStorage.setItem('isLoggedIn', 'true');
        window.location.href = 'TrangChu.html';
    } else {
        document.getElementById('loginMessage').textContent = 'Tên đăng nhập hoặc mật khẩu không đúng.';
    }
});