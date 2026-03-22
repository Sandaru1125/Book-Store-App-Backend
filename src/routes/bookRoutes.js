import express from "express";
import cloudinary from "../lib/cloudinary.js";
import Book from "../models/book.js";
import protectRoute from "../middleware/authMiddleware.js";

const router = express.Router();


// CREATE BOOK
router.post("/", protectRoute, async (req, res) => {
  try {

    const { title, author, description, price, coverImage } = req.body;

    // Validation
    if (!title || !author || !description || !price || !coverImage) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Upload image to Cloudinary
    const uploadResponse = await cloudinary.uploader.upload(coverImage);

    const imageURL = uploadResponse.secure_url;

    const newBook = new Book({
      title,
      author,
      description,
      price,
      coverImage: imageURL,
      user: req.user._id,
    });

    await newBook.save();

    res.status(201).json(newBook);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create book" });
  }
});



// GET ALL BOOKS WITH PAGINATION
router.get("/", async (req, res) => {
  try {

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    const books = await Book.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", "username profilePicture");

    const totalBooks = await Book.countDocuments();

    const totalPages = Math.ceil(totalBooks / limit);

    res.json({
      books,
      currentPage: page,
      totalPages,
      totalBooks,
    });

  } catch (error) {
    res.status(500).json({ error: "Failed to fetch books" });
  }
});



// DELETE BOOK
router.delete("/:id", protectRoute, async (req, res) => {
  try {

    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }

    // Check ownership
    if (book.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Forbidden" });
    }

    // Delete image from Cloudinary
    if (book.coverImage && book.coverImage.startsWith("http")) {
      try {
        const publicId = book.coverImage.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(publicId);
      } catch (error) {
        console.error("Cloudinary delete failed:", error);
      }
    }

    // Delete book from database
    await Book.findByIdAndDelete(req.params.id);

    res.json({ message: "Book deleted successfully" });

  } catch (error) {
    res.status(500).json({ error: "Failed to delete book" });
  }
});


export default router;
