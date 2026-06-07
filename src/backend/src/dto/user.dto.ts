import { UUID } from "crypto";

export class UserDto {
    name!: string;
    surname!: string;
    email!: string;
    password!: string;
    id?: UUID;
}