document.addEventListener('DOMContentLoaded', () => {
      const loginForm = document.getElementById('login-form');
      const usernameInput = document.getElementById('username');
      const passwordInput = document.getElementById('password');
      const errorMessage = document.getElementById('error-message');
      const currentYear = new Date().getFullYear();

      // Update year display in login info
      document.getElementById('login-year').textContent = currentYear;
      document.getElementById('login-year-pw').textContent = currentYear;
      document.getElementById('login-year-pw2').textContent = currentYear;


      // --- Simulated User Roles & Credentials ---
      // In a real app, this comes from a secure backend database.
      // This is INSECURE and for demonstration only.
      const users = {
        // O-Level Teachers (Assigned to specific classes/streams)
        "qom01": { password: `qom01${currentYear}`, role: "teacher", assignedClasses: ["S1-North", "S1-South"] },
        "qom02": { password: `qom02${currentYear}`, role: "teacher", assignedClasses: ["S2-North", "S2-South"] },
        "qom03": { password: `qom03${currentYear}`, role: "teacher", assignedClasses: ["S3-North", "S3-South"] },
        "qom04": { password: `qom04${currentYear}`, role: "teacher", assignedClasses: ["S4-North", "S4-South"] },
        // A-Level Teachers
        "qom05": { password: `qom05${currentYear}`, role: "teacher", assignedClasses: ["S5-Arts", "S5-Science"] },
        "qom06": { password: `qom06${currentYear}`, role: "teacher", assignedClasses: ["S6-Arts", "S6-Science"] },
        // Example Admin (can see everything)
        "admin": { password: `admin${currentYear}`, role: "admin", assignedClasses: ["all"] } // 'all' signifies admin access
      };

      loginForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const enteredUsername = usernameInput.value.trim().toLowerCase(); // Ensure lowercase match
        const enteredPassword = passwordInput.value;

        const user = users[enteredUsername];

        if (user && user.password === enteredPassword) {
          // Successful login
          errorMessage.textContent = '';
          errorMessage.classList.remove('show');
          console.log(`Login successful for ${enteredUsername} with role ${user.role}`);

          // Store login status and role info (INSECURE - for simulation)
          sessionStorage.setItem('isLoggedIn', 'true');
          sessionStorage.setItem('username', enteredUsername);
          sessionStorage.setItem('userRole', user.role);
          sessionStorage.setItem('assignedClasses', JSON.stringify(user.assignedClasses)); // Store assigned classes as JSON string

          // Redirect to the main application page
          window.location.href = 'index.html';

        } else {
          // Failed login
          errorMessage.textContent = 'Invalid username or password.';
          errorMessage.classList.add('show');
          console.log('Login failed');
          loginForm.classList.add('shake-animation');
          setTimeout(() => {
            loginForm.classList.remove('shake-animation');
          }, 500);
        }
      });

      // Add shake animation CSS
      const style = document.createElement('style');
      style.textContent = `
        .shake-animation {
          animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
          transform: translate3d(0, 0, 0);
          backface-visibility: hidden;
          perspective: 1000px;
        }
        @keyframes shake {
          10%, 90% { transform: translate3d(-1px, 0, 0); }
          20%, 80% { transform: translate3d(2px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
          40%, 60% { transform: translate3d(4px, 0, 0); }
        }
      `;
      document.head.appendChild(style);
    });
