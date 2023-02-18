import { UserDB } from "../types";
import { BaseDatabase } from "./BaseDatabase";

export class UserDatabase extends BaseDatabase{
    public static TABLE_USERS = "users"

    public insertNewUser = async (newUserDB: UserDB) => {
        const usersDB = await BaseDatabase
        .connection(UserDatabase.TABLE_USERS)
        .insert(newUserDB)

        return usersDB
    } 
    public getUsers = async () => {
        const usersDB = await BaseDatabase
        .connection(UserDatabase.TABLE_USERS)
        .select()

        return usersDB
    } 
}