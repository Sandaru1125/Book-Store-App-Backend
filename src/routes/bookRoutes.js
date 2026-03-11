import express from 'express';
const router = express.Router();
import cloudinary from '../lib/cloudinari';
import Book from '../models/book.js';


router.post("/",protectRoute, async(req, res) => {
    try {
      
     const { title, author, description, price, coverImage } = req.body;

      // Validate required fields
      if (!title || !author || !description || !price || !coverImage) {
        return res.status(400).json({ error: "All fields are required" });
      }

     // Upload cover image to Cloudinary
     const uplodResponse = await cloudinary.uploader.upload(Image);
     const imageURL = uplodResponse.secure_url;
      const newBook = new Book({
        title,
        author,
        description,
        price,
        coverImage: imageURL,
      });
      await newBook.save();
      res.status(201).json(newBook);





    } catch (error) {
        res.status(500).json({ error: "Failed to create book" });
    }
});