//user blogs
import Blog from "../models/Blogs/Blog.js";
import Comments from "../models/Comment.js";
import { User } from "../models/User.js";

export default class BlogController {
  constructor() {
    this.Blog = Blog;
    this.Comments = Comments;
    this.User = User;
  }

  // get all blogs for user
  async getBlogs(data) {
    try {
      const { offset, limit, userId } = data;
      !offset ? (data.offset = 0) : (data.offset = parseInt(offset));
      !limit ? (data.limit = 10) : (data.limit = parseInt(limit));
      if (!userId) {
        return { error: "No data provided!", status: "error" };
      }

      const blogs = await this.Blog.find({ userId })
        .populate("userId", "username")
        .skip(data.offset)
        .limit(data.limit)
        .sort({ createdAt: -1 });

      const blogCount = await this.Blog.countDocuments({ userId });
      let nextPage = "";

      blogCount - data.offset < data.limit
        ? (nextPage = limit + 10)
        : (nextPage = null);
      if (!blogs) {
        return { error: "No blogs found!", status: "error" };
      }
      return { status: "success", blogs, blogCount, nextPage };
    } catch (error) {
      console.log(error);
      return { error: error.message };
    }
  }

  // get blog by id
  async getBlogById({ blogId }) {
    try {
      if (!blogId) {
        return { error: "No data provided!", status: "error" };
      }
      const blog = await this.Blog.findById({ _id: blogId });
      if (!blog) {
        return { error: "Blog not found!", status: "error" };
      }
      return { status: "success", blog };
    } catch (error) {
      return { error: error.message };
    }
  }

  // create blog
  async createBlog({ userId, title, content, relatedMovies }) {
    try {
      console.log(userId, title, content, relatedMovies);
      if (!userId || !title || !content) {
        return { error: "No data provided!", status: "error" };
      }
      const blog = new this.Blog({
        userId,
        title,
        content,
        relatedMovies,
      });
      await blog.save();
      return { status: "success", blog };
    } catch (error) {
      return { error: error.message };
    }
  }

  // update blog
  async updateBlog({ blogId, title, content, relatedMovies }) {
    try {
      if (!blogId || !title || !content) {
        return { error: "No data provided!", status: "error" };
      }
      const blog = await this.Blog.findByIdAndUpdate(blogId, {
        title,
        content,
        relatedMovies,
      });
      if (!blog) {
        return { error: "Blog not found!", status: "error" };
      }
      return { status: "success", blog };
    } catch (error) {
      return { error: error.message };
    }
  }

  // delete blog
  async deleteBlog({ blogId }) {
    try {
      if (!blogId) {
        return { error: "No data provided!", status: "error" };
      }
      const blog = await this.Blog.findByIdAndDelete(blogId);
      if (!blog) {
        return { error: "Blog not found!", status: "error" };
      }
      return { status: "success", blog };
    } catch (error) {
      return { error: error.message };
    }
  }
}
