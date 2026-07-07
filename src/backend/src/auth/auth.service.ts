import { Injectable, BadRequestException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { UserDto } from 'src/dto/user.dto';

@Injectable()
export class AuthService {
    private supabase: SupabaseClient;
    private supabaseAdmin: SupabaseClient;

    constructor() {
        this.supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);
        this.supabaseAdmin = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
    }

    // Registrazione dell'utente e salvataggio dei dati nel database
    async registerUser(user: UserDto) {
        const { data: authData, error: authError } = await this.supabase.auth.signUp({
            email: user.email,
            password: user.password,
            options: {
                emailRedirectTo: 'http://localhost:5173/login',
                data: {
                    name: user.name,
                }
            }
        });

        if (authError) throw new BadRequestException(authError.message);

        const { error: dbError } = await this.supabase
        .from('user_profiles') 
        .insert({
            id: authData.user!.id,
            name: user.name,
            surname: user.surname,
            email: user.email
        });

        if (dbError) throw new BadRequestException(dbError.message);

        return { 
            message: 'Utente registrato e riga inserita nella tabella!' 
        };
    }

    // Accesso all'account presente sul database
    async login(user: UserDto) {
        const { data: authData, error: authError } = await this.supabase.auth.signInWithPassword({
            email: user.email,
            password: user.password,
        });

        if (authError) throw new BadRequestException(authError.message);

        const { data: profileData, error: dbError } = await this.supabase
        .from('user_profiles')
        .select('*') 
        .eq('id', authData.user!.id)
        .single();

        if (dbError) throw new BadRequestException(dbError.message);
        
        const accessToken = authData.session?.access_token;

        return {
            message: 'Login effettuato con successo',
            token: accessToken,
            user: {
                id: authData.user!.id,
                email: authData.user!.email,
                name: profileData.name,
                surname: profileData.surname
            }
        };
    }

    // Modifiche dati dell'utente loggato
    async modifyUser(name: string, surname: string, user_id: string) {
        const new_name = name;
        const new_surname = surname;

        const { error: updateError } = await this.supabase
        .from('user_profiles')
        .update({'name': new_name, 'surname': new_surname})
        .eq('id', user_id)

        if (updateError) throw new BadRequestException(updateError.message);

        return {
            message: "Profilo aggiornato correttamente"
        };
    }
    
    // Visualizzazione dati utente
    async getProfile(user_id: string) {
        const { data: profileData, error: dbError } = await this.supabase
        .from('user_profiles')
        .select('name, surname, email') 
        .eq('id', user_id)
        .single();

        if (dbError) throw new BadRequestException(dbError.message);

        return {
            name: profileData.name,
            surname: profileData.surname,
            email: profileData.email
        };
    }

    // Richiesta email per il reset della password
    async sendPasswordResetEmail(email: string) {
        const { error } = await this.supabase.auth.resetPasswordForEmail(email);

        if (error) throw new BadRequestException(error.message);

        return { 
            message: 'Se l\'email esiste, riceverai un codice a 6 cifre.' 
        };
    }

    // Verifica del codice e cambio della password
    async resetPasswordWithOtp(email: string, otp: string, new_password: string) {
        const { data, error: verifyError } = await this.supabase.auth.verifyOtp({
            email: email,
            token: otp,
            type: 'recovery',
        });

        if (verifyError) throw new BadRequestException('Il codice inserito non è valido o è scaduto.');

        const { error: updateError } = await this.supabaseAdmin.auth.admin.updateUserById(
            data.user!.id, 
            { password: new_password }
        );

        if (updateError) throw new BadRequestException(updateError.message);

        await this.supabase.auth.signOut();

        return { 
            message: 'Password aggiornata con successo!' 
        };
    }

    // Aggiornamento della password quando l'utente è loggato
    async updatePassword(user_id: string, old_password: string, new_password: string) {
        const { data: userAdmin, error: fetchError } = await this.supabaseAdmin.auth.admin.getUserById(user_id);
        
        if (fetchError || !userAdmin.user) {
            throw new BadRequestException('Utente non trovato');
        }

        // 2. Verifichiamo se la VECCHIA password è corretta tentando un login
        const { error: signInError } = await this.supabase.auth.signInWithPassword({
            email: userAdmin.user.email!,
            password: old_password,
        });

        if (signInError) {
            // Rilanciamo un errore con un testo specifico che il frontend riconoscerà
            throw new BadRequestException('Vecchia password errata');
        }

        const { error } = await this.supabaseAdmin.auth.admin.updateUserById(user_id, {
            password: new_password
        });

        if (error) throw new BadRequestException(error.message);

        return { 
            message: 'Password aggiornata con successo!' 
        };
    }

    // Rimozione dell'account dal database
    async deleteUser(id: string) {
        const { error: authError } = await this.supabaseAdmin.auth.admin.deleteUser(id);
        
        if (authError) throw new BadRequestException(authError.message);

        return {
            message: 'Utente rimosso correttamente!' 
        };
    }
}
