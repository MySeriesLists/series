import News from "../models/News.js";

export default class NewsController {
  // create news
  async createNews(news, userId) {
    try {
      const newNews = await News.create({
        ...news,
        createdBy: userId,
        updatedBy: userId,
      });
      return newNews;
    } catch (err) {
      throw err;
    }
  }

  // get news
  async getNews(newsId) {
    try {
      const news = await News.findById(newsId);
      return news;
    } catch (err) {
      throw err;
    }
  }

  // get all news
  async getAllNews(offset, limit) {
    try {
      !offset && (offset = 0);
      !limit && (limit = 10);
      const news = await News.find()
        .skip(offset)
        .limit(limit)
        .sort({ createdAt: -1 });
      return news;
    } catch (err) {
      throw err;
    }
  }

  // update news
  async updateNews(newsId, news, userId) {
    try {
      const updatedNews = await News.findByIdAndUpdate({ _id: newsId });
      if (updatedNews.createdBy !== userId || updatedNews.isLocked) {
        return { error: "You are not allowed to update this news" };
      }
      updatedNews.description = news;
      updateNews.updateAt = Date.now();
      updatedNews.save();

      return updatedNews;
    } catch (err) {
      throw err;
    }
  }

  // lock news
  async lockNews(newsId, news, userId) {
    try {
      const updatedNews = await News.findByIdAndUpdate(
        newsId,
        {
          ...news,
          updatedBy: userId,
        },
        { new: true }
      );
      return updatedNews;
    } catch (err) {
      throw err;
    }
  }

  // delete news
  async deleteNews(newsId, userId) {
    try {
      const deletedNews = await News.findByIdAndDelete(newsId);
      return deletedNews;
    } catch (err) {
      throw err;
    }
  }
}
