export interface LikeOrDislikeInputDTO {
    idToLikeOrDislike: string,
    token: string | undefined,
    like: unknown
}

export interface LikeOrDislikeOutputDTO {
    idToLikeOrDislike: string,
    token: string | undefined,
    like: unknown
}