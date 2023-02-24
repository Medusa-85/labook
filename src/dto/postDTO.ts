import { PostModel } from "../types"

export class PostDTO {
    // método input
    public insertNewPost(
        content: unknown
    ){}
}

export interface GetPostInputDTO{
    token: string | undefined
}

export type GetPostOutputDTO = PostModel[]

export interface CreatePostInputDTO{
    token: string | undefined,
    content: unknown
}

export interface EditPostInputDTO {
    idToEdit: string,
    token: string | undefined,
    editedContent: unknown 
}

export interface DeletePostInputDTO {
    idToDelete: string,
    token: string | undefined
}