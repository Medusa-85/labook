import { PostDB, PostWithCreatorDB } from "../types";
import { BaseDatabase } from "./BaseDatabase";

export class PostDatabase extends BaseDatabase{
    public static TABLE_POSTS = "posts"

    public getPostsWithCreators = async () => {
        const result: PostWithCreatorDB[] = await BaseDatabase
        .connection(PostDatabase.TABLE_POSTS)
        .select(
            "posts.id",
            "posts.creator_id",
            "posts.content",
            "posts.likes",
            "posts.dislikes",
            "posts.created_at",
            "posts.updated_at",
            "users.name"       
        )
        .join("users", "posts.creator_id", "=", "users.id")
        
        return result
    }

    public insert = async (postDB: PostDB): Promise<void> => {
        const result = await BaseDatabase
        .connection(PostDatabase.TABLE_POSTS)
        .insert(postDB)

    }

    public findById = async (id: string): Promise< PostDB | undefined > => {
        const result: PostDB[] = await BaseDatabase
        .connection(PostDatabase.TABLE_POSTS)
        .select()
        .where({id})

        return result[0]
    }

    public update = async (idToEdit: string, postDB: PostDB): Promise<void> => {
        await BaseDatabase
            .connection(PostDatabase.TABLE_POSTS)
            .update(postDB)
            .where({ id: idToEdit })

    }

    public delete = async (IdToDelete: string): Promise<void> => {
        await BaseDatabase
        .connection(PostDatabase.TABLE_POSTS)
        .delete()
        .where({ id: IdToDelete })
    }
}
