import express from "express";
import cloudinary from "../lib/cloudinary.js";
import Book from "../models/book.js";
import protectRoute from "../middleware/authMiddleware.js";

const router = express.Router();

// CREATE BOOK
router.post("/", protectRoute, async (req, res) => {
  try {
    const { title, caption, rating, image } = req.body;

    if (!title || !caption || !rating || !image) {
      return res.status(400).json({ error: "All fields are required" });
    }

    console.log("Creating book with data:", { title, caption, rating: Number(rating) });

    const uploadResponse = await cloudinary.uploader.upload(image);

    const newBook = new Book({
      title,
      caption,
      rating: Number(rating),
      image: uploadResponse.secure_url,
      user: req.user._id,
    });

    await newBook.save();

    res.status(201).json(newBook);

  } catch (error) {
    console.error("Error creating book:", error);
    res.status(500).json({ 
      error: "Failed to create book",
      details: error.message 
    });
  }
});

// GET ALL BOOKS
router.get("/", async (req, res) => {
  try {
    const books = await Book.find()
      .sort({ createdAt: -1 })
      .populate("user", "username profilePicture");

    res.json(books);

  } catch (error) {
    res.status(500).json({ error: "Failed to fetch books" });
  }
});


router.get("/user", protectRoute, async (req, res) => {
  try {
    const books = await Book.find({ user: req.user._id })
    
      .sort({ createdAt: -1 })
      .populate("user", "username profilePicture");

    res.json(books);

  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user books" });
  }
});

// DELETE BOOK
router.delete("/:id", protectRoute, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }

    if (book.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Forbidden" });
    }

    // delete from cloudinary
    if (book.image) {
      const publicId = book.image.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(publicId);
    }

    await Book.findByIdAndDelete(req.params.id);

    res.json({ message: "Deleted successfully" });

  } catch (error) {
    res.status(500).json({ error: "Failed to delete book" });
  }
});

export default router;