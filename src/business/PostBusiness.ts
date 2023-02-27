import { Request, Response } from "express";
import { PostDatabase } from "../database/PostDatabase";
import { LikeOrDislikeInputDTO } from "../dto/likes_dislikes";
import { CreatePostInputDTO, DeletePostInputDTO, EditPostInputDTO, GetPostInputDTO, GetPostOutputDTO } from "../dto/postDTO";
import { BadRequestError } from "../error/BadRequestError";
import { NotFoundError } from "../error/NotFoundError";
import { Post } from "../models/posts";
import { IdGenerator } from "../services/idGenerator";
import { TokenManager } from "../services/TokenManager";
import { LikesDislikesDB, PostDB, PostWithCreatorDB, POST_LIKE_DISLIKE, USER_ROLES } from "../types";

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
            //console.log(postsWithCreatorsDB)
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
                console.log(postWithCreatorDB)
                      
                return post.toBusinessModel()
                   
            }
            
        )

        //console.log(posts)

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

        if(postDB.creator_id !== creatorId && creatorRole !== USER_ROLES.ADMIN ) {
            throw new BadRequestError("usuário sem permissão para realizar esta ação")
        }

        await this.postDatabase.delete(idToDelete)

        
    }

    public likeOrDislikePost = async (input: LikeOrDislikeInputDTO): Promise<void> => {
        const { idToLikeOrDislike, token, like } = input

        if(!token) {
            throw new BadRequestError("necessário 'token'")
        }
        const payload = this.tokenManager.getPayload(token)
        if(payload === null) {
            throw new BadRequestError("token inválido")
        }

        if(typeof like !== "boolean") {
            throw new BadRequestError("'like' precisa ser booleano")
        }

        const postWithCreatorDB = await this.postDatabase.findPostWithCreatorById(idToLikeOrDislike)

        if(!postWithCreatorDB) {
            throw new NotFoundError("'id' não encontrado")
        }

        const userId = payload.id
        const likeConvertor = like ? 1 : 0 

        const likeOrDislikeDB: LikesDislikesDB = {
            user_id: userId,
            post_id: postWithCreatorDB.id,
            like: likeConvertor
        } 

        const verifyLikeDislike = await this.postDatabase
            .findLikeDislike(likeOrDislikeDB) 

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

        if(verifyLikeDislike === POST_LIKE_DISLIKE.ALREAD_LIKED) {
            if(like) {
                await this.postDatabase.removeLikeOrDislike(likeOrDislikeDB)
                post.removeLike()
            } else {
                await this.postDatabase.updateLikeDislike(likeOrDislikeDB)
                post.removeLike()
                post.addDislike()
            }
        } else if(verifyLikeDislike === POST_LIKE_DISLIKE.ALREAD_DISLIKED) {
            if(like) {
                await this.postDatabase.updateLikeDislike(likeOrDislikeDB)
                post.removeDislike()
                post.addLike()
            } else {
                await this.postDatabase.removeLikeOrDislike(likeOrDislikeDB)
                post.removeDislike()
            }
        } else {
            await this.postDatabase.likeOrDislikePost(likeOrDislikeDB)
            
            like ? post.addLike() : post.addDislike()
        }

        const updatedPost = post.toDBModel()

        await this.postDatabase.update(idToLikeOrDislike, updatedPost)
               
    }
}