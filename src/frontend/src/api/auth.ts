import { api } from './client'

export const register = async (name: string, surname: string, email: string, password: string) => {
    const response = await api.post('/auth/register', {name, surname, email, password});
    return response.data;
}

export const login = async (email: string, password: string) => {
    const response = await api.post('/auth/login', {email, password});
    return response.data;
}

export const modifyUser = async (name: string, surname: string) => {
    const response = await api.put('/auth/modify', {name, surname});
    return response.data;
}

export const getProfile = async () => {
    const response = await api.get('/auth/user');
    return response.data;
}

export const forgotPassword = async (email: string) => {
    const response = await api.post('/auth/forgot-password', {email});
    return response.data;
}

export const resetPasswordOtp = async (email: string, otp: string, new_password: string) => {
    const response = await api.post('/auth/reset-password-otp', { email, otp, new_password });
    return response.data;
}

export const changePassword = async (old_password: string, new_password: string) => {
    const response = await api.put('/auth/change-password', {old_password, new_password});
    return response.data;
}

export const remove = async () => {
    const response = await api.delete('auth/remove');
    return response.data;
}