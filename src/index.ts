import express, { Request, Response } from "express";
import cors from "cors";
import Knex from "knex";

const app = express()

app.use(cors())
app.use(express.json())
app.listen(3003, ()=>{console.log(`Servidor rodando na porta ${3003}`)})

app.get("/users", async (req: Request, res: Response)=>{
    try{
        const db = Knex({
            client: "sqlite3",
            connection: {
                filename: "./src/database/labook.db",
            },
            useNullAsDefault: true,
            pool: { 
                min: 0,
                max: 1,
                afterCreate: (conn: any, cb: any) => {
                    conn.run("PRAGMA foreign_keys = ON", cb)
                }
            }
        })

        const output = await db("users").select()

        res.status(200).send(output)
        
    } catch (error) {
        console.log(error)

        if(error instanceof Error) {
            res.status(500).send(error.message)
        } else {
            res.status(500).send("Erro inesperado")
        }
    }
})