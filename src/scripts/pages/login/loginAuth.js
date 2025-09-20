// services/authService.js
import CONFIG from "../../config";

const ENDPOINTS = {
    BASE_URL: CONFIG.BASE_URL,
    LOGIN: '/login'
};

export class AuthService {
    static async loginUser(email, password) {
        const url = `${ENDPOINTS.BASE_URL}${ENDPOINTS.LOGIN}`;
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email,
                    password
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Login failed');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            throw new Error(`Login error: ${error.message}`);
        }
    }

    static saveToken(token) {
        localStorage.setItem('authToken', token);
    }

    static getToken() {
        return localStorage.getItem('authToken');
    }

    static removeToken() {
        localStorage.removeItem('authToken');
    }
}
