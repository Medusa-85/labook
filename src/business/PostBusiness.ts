import { Request, Response } from "express";
import { PostDatabase } from "../database/PostDatabase";
import { CreatePostInputDTO, DeletePostInputDTO, EditPostInputDTO, GetPostInputDTO, GetPostOutputDTO } from "../dto/postDTO";
import { BadRequestError } from "../error/BadRequestError";
import { NotFoundError } from "../error/NotFoundError";
import { Post } from "../models/posts";
import { IdGenerator } from "../services/idGenerator";
import { TokenManager } from "../services/TokenManager";
import { PostDB, PostWithCreatorDB } from "../types";

export class PostBusiness {
    constructor(
        private postDatabase: PostDatabase,
        private idGenerator: IdGenerator,
        private tokenManager: TokenManager
    ){}

    public getPost = async (input: GetPostInputDTO): Promise<GetPostOutputDTO> => {
        const { token } = input

        if(!token){
            throw new BadRequestError("token precisa existir")
        }
        const payload = this.tokenManager.getPayload(token)
        if(payload === null){
            throw new BadRequestError("Token inválido")
        }

        const postsWithCreatorsDB: PostWithCreatorDB[] = await this.postDatabase.getPostsWithCreators()   
        console.log(postsWithCreatorsDB)        
        const posts = postsWithCreatorsDB.map(
            (postWithCreatorDB) => {
                const post = new Post(
                    postWithCreatorDB.id,
                    postWithCreatorDB.creator_id,
                    postWithCreatorDB.content,
                    postWithCreatorDB.likes,
                    postWithCreatorDB.dislikes,
                    postWithCreatorDB.created_at,
                    postWithCreatorDB.updated_at,
                    postWithCreatorDB.creator_name
                )
                //console.log(post)        
                return post.toBusinessModel()
            }
        )

        
        const output: GetPostOutputDTO = posts

        return output    

    }

    public createPost = async (input: CreatePostInputDTO): Promise<void> => {
        const { token, content } = input

        if(!token) {
            throw new BadRequestError("token precisa existir")
        }
        const payload = this.tokenManager.getPayload(token)
        if(payload === null) {
            throw new BadRequestError("token inválido")
        }

        if(typeof content !== "string") {
            throw new BadRequestError("'content' precisa ser string")
        }

        const id = this.idGenerator.generate()
        const createdAt = new Date().toISOString()
        const updatedAt = new Date().toISOString()
        const creatorId = payload.id
        const creatorName = payload.name

        const post = new Post(
            id,
            creatorId,
            content,
            0,
            0,
            createdAt,
            updatedAt,
            creatorName,
        )
        
        const postDB = post.toDBModel()

        await this.postDatabase.insert(postDB)

    }

    public editPost = async (input: EditPostInputDTO): Promise<void> => {
        const { idToEdit, token, editedContent } = input

        if(!token) {
            throw new BadRequestError("token precisa existir")
        }
        const payload = this.tokenManager.getPayload(token)
        if(payload === null) {
            throw new BadRequestError("token inválido")
        }

        if(typeof editedContent !== "string") {
            throw new BadRequestError("'content' precisa ser string")
        }

        const postDB: PostDB | undefined = await this.postDatabase.findById(idToEdit)
        
        if(!postDB) {
            throw new NotFoundError("'id' não encontrado")
        }

        const creatorId = payload.id
        const creatorName = payload.name

        if(creatorId !== postDB.creator_id) {
            throw new BadRequestError("'id' com acesso negado")
        }

        const editedPost = new Post(
            postDB.id, 
            creatorId,
            postDB.content,
            postDB.likes,
            postDB.dislikes,
            postDB.created_at,
            postDB.updated_at,
            creatorName
        )
        
        editedPost.setContent(editedContent)
        editedPost.setUpdatedAt(new Date().toISOString())

        const newPostDB = editedPost.toDBModel()

        await this.postDatabase.update(idToEdit, newPostDB)

    }

    public deletePost = async (input: DeletePostInputDTO) => {
        const { idToDelete, token } = input

        if(!token) {
            throw new BadRequestError("necessário 'token'")
        }
        const payload = this.tokenManager.getPayload(token)
        if(payload === null) {
            throw new BadRequestError("token inválido")
        }

        const postDB = await this.postDatabase.findById(idToDelete)

        if(!postDB) {
            throw new NotFoundError("'id' não encontrado")
        }

        const creatorId = payload.id
        const creatorRole = payload.role

        if(creatorId !== postDB.creator_id) {
            throw new BadRequestError("usuário sem permissão para realizar esta ação")
        }

        await this.postDatabase.delete(idToDelete)

        if(creatorRole !== "ADMIN") {
            throw new BadRequestError("usuário sem permissão para realizar esta ação")
        }




    }
}