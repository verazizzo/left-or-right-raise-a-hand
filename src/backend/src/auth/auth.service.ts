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

    // Rimozione dell'account dal database
    async deleteUser(id: string) {
        const { error: authError } = await this.supabaseAdmin.auth.admin.deleteUser(id);
        
        if (authError) throw new BadRequestException(authError.message);

        return {
            message: 'Utente rimosso correttamente!' 
        };
    }
}
