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

export const remove = async () => {
    const response = await api.delete('auth/remove');
    return response.data;
}