import { api } from './client'

export const register = async (name: string, surname: string, email: string, password: string) => {
    const response = await api.post('/auth/register', {name, surname, email, password});
    return response.data;
}

export const login = async (email: string, password: string) => {
    const response = await api.post('/auth/login', {email, password});
    return response.data;
}

export const remove = async (id: string) => {
    const response = await api.delete('auth/remove', {data: {id}});
    return response.data;
}