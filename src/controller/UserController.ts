import { Request, Response } from "express"
import { UserBusiness } from "../business/UserBusiness"
import { LoginInputDTO, SignupInputDTO } from "../dto/userDTO"

export class UserController {
    constructor (
        private userBusiness: UserBusiness
    ){}

    public signup = async (req: Request, res: Response)=>{
        try{
            const input: SignupInputDTO = {
                name: req.body.name,
                email: req.body.email,
                password: req.body.password
            }
            const output = await this.userBusiness.signup(input)

            res.status(201).send(output)

        } catch (error) {
            console.log(error)
    
            if(error instanceof Error) {
                res.status(500).send(error.message)
            } else {
                res.status(500).send("Erro inesperado")
            }
        }
    }

    public login = async (req: Request, res: Response)=>{
        try{
            const input: LoginInputDTO = {
                email: req.body.email,
                password: req.body.password
            }
            const output = await this.userBusiness.login(input)

            res.status(200).send(output)

        } catch (error) {
            console.log(error)
    
            if(error instanceof Error) {
                res.status(500).send(error.message)
            } else {
                res.status(500).send("Erro inesperado")
            }
        }
    }
}