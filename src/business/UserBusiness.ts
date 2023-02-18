import { UserDatabase } from "../database/UserDatabase"
import { LoginInputDTO, LoginOutputDTO, SignupInputDTO, SignupOutputDTO } from "../dto/userDTO"
import { BadRequestError } from "../error/BadRequestError"
import { NotFoundError } from "../error/NotFoundError"
import { User } from "../models/users"
import { HashManager } from "../services/hashManager"
import { IdGenerator } from "../services/idGenerator"
import { TokenManager } from "../services/TokenManager"
import { TokenPayload, UserDB, USER_ROLES } from "../types"

export class UserBusiness {
    constructor(
        private userDatabase: UserDatabase,
        private idGenerator: IdGenerator,
        private tokenManager: TokenManager,
        private hashManager: HashManager
    ){}

    public signup = async (input: SignupInputDTO): Promise<SignupOutputDTO> => {
        const {name, email, password} = input

        if(typeof name !== "string") {
            throw new BadRequestError("'name' deve ser string")
        }
        if(typeof email !== "string") {
            throw new BadRequestError("'email' deve ser string")
        }
        if(typeof password !== "string") {
            throw new BadRequestError("'password' deve ser string")
        }

        const hashedPassword = await this.hashManager.hash(password)

        const newUser = new User(
            this.idGenerator.generate(),
            name,
            email,
            hashedPassword,
            USER_ROLES.NORMAL,
            new Date().toISOString()
        )
        
        console.table(newUser)

        const UserDB = newUser.toDBModel()

        await this.userDatabase.insertNewUser(UserDB)

        const payload: TokenPayload = {
            id: newUser.getId(),
            name: newUser.getName(),
            role: newUser.getRole()
        }

        const token = this.tokenManager.createToken(payload)
        console.log(token)

        const output: SignupOutputDTO = {
            token
        }

        return output
    }

    public login = async (input: LoginInputDTO): Promise<LoginOutputDTO> => {
        const { email, password } = input

        if(typeof email !== "string") {
            throw new BadRequestError("'email' deve ser string")
        }
        if(typeof password !== "string") {
            throw new BadRequestError("'password' deve ser string")
        }

        const findUserDB: UserDB = await this.userDatabase.findByEmail(email)

        if(!findUserDB) {
            throw new NotFoundError("'email' não encontrado")
        }
        
        const user = new User(
            findUserDB.id,
            findUserDB.name,
            findUserDB.email,
            findUserDB.password,
            findUserDB.role,
            findUserDB.created_at
        )

        const verifyPassword = await this.hashManager.compare(password, user.getPassword())
    }
}