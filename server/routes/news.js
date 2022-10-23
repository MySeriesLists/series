import News from "../models/News.js";
import express from "express";
const newsRouter = express.Router();


//import controller

import NewsController from "../controllers/News.js";

const newsController = new NewsController();

// mioddleware to use for all requests
newsRouter.use(async (req, res, next) => {
    console.log("News router middleware");
    if(req.originalUrl.includes('get-news') || req.session.user){
        return  next();
    }
    return res.status(401).send("Unauthorized");
});



// get all news
newsRouter.get("/get-news", async (req, res) => {
    try {
        const news = await newsController.getAllNews();
        return res.status(200).json(news);
    } catch (err) {
        res.json({ message: err });
    }
});

// get news by id
newsRouter.get("/get-news/:newsId", async (req, res) => {
    try {
        const newsId = req.params.newsId;
        const news = await newsController.getNewsById(newsId);
        return res.status(200).json(news);
    } catch (err) {
        res.json({ message: err });
    }
});

// create news
newsRouter.post("/create-news", async (req, res) => {
    try {
        const news = req.body;
        const userId = req.session.user;
        const newNews = await newsController.createNews(news, userId);
        return res.status(200).json(newNews);
    } catch (err) {
        res.json({ message: err });
    }
});

// update news
newsRouter.put("/update-news/:newsId", async (req, res) => {
    try {
        const newsId = req.params.newsId;
        const news = req.body;
        const userId = req.session.user;

        const updatedNews = await newsController.updateNews(newsId, news, userId);
        return res.status(200).json(updatedNews);
    } catch (err) {
        return res.json({ message: err });
    }
});

// lock news
newsRouter.put("/lock-news/:newsId", async (req, res) => {
    try {
        const newsId = req.params.newsId;
        const news = req.body;
        const userId = req.session.user;
        const updatedNews = await newsController.lockNews(newsId, news, userId);
        return res.status(200).json(updatedNews);
    } catch (err) {
        return res.json({ message: err });
    }
});


// delete news
newsRouter.delete("/delete-news/:newsId", async (req, res) => {
    try {
        const newsId = req.params.newsId;
        const userId = req.session.user;
        const deletedNews = await newsController.deleteNews(newsId, userId);
        return res.status(200).json(deletedNews);
    } catch (err) {
        return res.json({ message: err });
    }
});






export default newsRouter;

