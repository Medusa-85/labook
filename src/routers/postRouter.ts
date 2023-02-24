import  express from "express";import { PostBusiness } from "../business/PostBusiness";
import { PostController } from "../controller/PostsController";
import { PostDatabase } from "../database/PostDatabase";
import { IdGenerator } from "../services/idGenerator";
import { TokenManager } from "../services/TokenManager";

export const postRouter = express.Router()

const postController = new PostController(
    new PostBusiness(
        new PostDatabase(),
        new IdGenerator(),
        new TokenManager
    )
)

postRouter.get("/", postController.getPost)
postRouter.post("/", postController.createPost)
postRouter.put("/:id", postController.editPost)
postRouter.delete("/:id", postController.deletePost)