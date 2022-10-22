// route for blogs
import express from 'express';
import dotenv from "dotenv";
dotenv.config({ path: "../.env" });


const blogRouter = express.Router();


//import instance
import BlogController from '/home/meteor314/Desktop/series/server/controllers/Blog.js';
import CommentController from '../controllers/Comment.js';

const blogController = new BlogController();
const commentController = new CommentController();
//middleware
blogRouter.use(async (req , res  , next) => {
    if(req.session.user || req.originalUrl.includes("get-user-blogs")) {
        return next();
    }
    res.status(401).json({message: "Unauthorized"});
});

//get all blogs

blogRouter.get('/get-user-blogs', async (req, res) => {
    try {
        const {offset, limit, userId} = req.query;
        const data = {offset, limit, userId};
        const response = await blogController.getBlogs(data);
        if(response.error) {
            return res.status(400).json({message: response.error});
        }
        res.status(200).json({message: response.blogs});
    } catch (error) {
        res.status(500).json({message: error.message});
    }
});

//get blog by id

blogRouter.get('/get-blog-by-id', async (req, res) => {
    try {
        const { blogId } = req.query;
        const response = await blogController.getBlogById({ blogId });
        if(response.error) {
            return res.status(400).json({message: response.error});
        }
        res.status(200).json({message: response.blog});
    } catch (error) {
        res.status(500).json({message: error.message});
    }
});

//create blog

blogRouter.post('/create-blog', async (req, res) => {
    try {
        const { title, content, relatedMovies } = req.body;
        const  userId  = req.session.user
        console.log("userId", userId);
        const response = await blogController.createBlog({ userId, title, content, relatedMovies });
        if(response.error) {
            return res.status(400).json({message: response.error});
        }
        res.status(200).json({message: response.blog});
    } catch (error) {
        res.status(500).json({message: error.message});
    }
});


//update blog

blogRouter.put('/update-blog', async (req, res) => {
    try {
        const { blogId, title, content, relatedMovies } = req.body;
        const response = await blogController.updateBlog({ blogId, title, content, relatedMovies });
        if(response.error) {
            return res.status(400).json({message: response.error});
        }
        res.status(200).json({message: response.blog});
    } catch (error) {
        res.status(500).json({message: error.message});
    }
});


//delete blog

blogRouter.delete('/delete-blog', async (req, res) => {
    try {
        const { blogId } = req.query;
        const response = await blogController.deleteBlog({ blogId });
        if(response.error) {
            return res.status(400).json({message: response.error});
        }
        res.status(200).json({message: response.blog});
    } catch (error) {
        res.status(500).json({message: error.message});
    }
});


//get all comments for blog
blogRouter.get('/get-blog-comments', async (req, res) => {
    try {
        const {idOfCommentedItem, type, offset, limit} = req.query;
        const response = await commentController.getComments({idOfCommentedItem, type, offset, limit});
        if(response.error) {
            return res.status(400).json({message: response.error});
        }
        res.status(200).json({message: response.comments});
    } catch (error) {
        res.status(500).json({message: error.message});
    }
});


//create comment for blog
blogRouter.post('/create-blog-comment', async (req, res) => {
    try {
        const {_id ,  content, type } = req.body; // _id is blogId
        const userId = req.session.user;

        const response = await commentController.createComment({ _id, userId, content, type });
        if(response.error) {
            return res.status(400).json({message: response.error});
        }
        res.status(200).json({message: response.comment});
    } catch (error) {
        res.status(500).json({message: error.message});
    }
});

//update comment for blog
blogRouter.put('/update-blog-comment', async (req, res) => {
    try {
        const { commentId, content } = req.body;
        const response = await commentController.updateComment({ commentId, content });
        if(response.error) {
            return res.status(400).json({message: response.error});
        }
        res.status(200).json({message: response.comment});
    } catch (error) {
        res.status(500).json({message: error.message});
    }
});

//delete comment for blog
blogRouter.delete('/delete-blog-comment', async (req, res) => {
    try {
        const { commentId } = req.query;
        const response = await commentController.deleteComment({ commentId });
        if(response.error) {
            return res.status(400).json({message: response.error});
        }
        res.status(200).json({message: response.comment});
    } catch (error) {
        res.status(500).json({message: error.message});
    }
});




export default blogRouter;
