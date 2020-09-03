import { AuthsScript } from './auths-script';

export class Auths {
    expires_at: Date;
    id: number;
    script: AuthsScript[];
    script_id: number;
    user_id: number;
}
