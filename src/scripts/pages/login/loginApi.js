import { MessageHandler } from "./loginMessageHandler";
import { AuthService } from "./loginAuth";
import { Validators } from "./loginValidator";

export class LoginHandler {
    constructor() {
        this.onLoginSuccess = null;
    }

    setOnLoginSuccess(callback) {
        this.onLoginSuccess = callback;
    }

    async handleFormSubmission(e) {
        e.preventDefault();
        
        const form = e.target;
        form.classList.add('loading');
        
        try {
            // Get form data
            const formData = new FormData(form);
            const email = formData.get('email').trim();
            const password = formData.get('password');
            
            // Validate form data
            const errors = Validators.validateLoginForm(email, password);
            if (errors.length > 0) {
                MessageHandler.showMessage(errors[0], 'error');
                return;
            }
            
            // Call the API login function
            const result = await AuthService.loginUser(email, password);
            
            // Show success message
            MessageHandler.showMessage('Login successful! Redirecting...', 'success');
            
            // Save token if login successful
            if (result.loginResult && result.loginResult.token) {
                AuthService.saveToken(result.loginResult.token);
            }
            
            // Reset form and handle success
            setTimeout(() => {
                form.reset();
                this.handleLoginSuccess(result);
            }, 2000);
            
        } catch (error) {
            MessageHandler.showMessage('Login failed: ' + error.message, 'error');
            console.error('Login error:', error);
        } finally {
            form.classList.remove('loading');
        }
    }

    handleLoginSuccess(result) {
        console.log('User logged in:', result);
        
        // Trigger callback if set
        if (this.onLoginSuccess) {
            this.onLoginSuccess(result);
        }
        
        // Example implementations:
        // window.location.href = '/dashboard';
        // window.dispatchEvent(new CustomEvent('userLoggedIn', { detail: result }));
    }
}