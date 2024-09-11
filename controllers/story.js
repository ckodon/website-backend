const express = require("express");
const { isAuthenticated } = require("../middleware/auth");
const catchAsyncErrors = require("../middleware/CatchAsyncErrors");
const router = express.Router();
const Story = require("../models/Story");
const cloudinary = require("cloudinary");
const ErrorHandler = require("../helpers/ErrorHandler");

// get all storys -- All
router.get(
  "/",
  catchAsyncErrors(async (req, res, next) => {
    try {
      //   const page = Number(req.query.page) || 1;
      //   const limit = 12;
      //   const sortType = req.query.sort;
      //   let sortOptions = {};

      //   if (sortType === "popularity") {
      //     sortOptions = { qty_in_stock: -1 };
      //   } else if (sortType === "price_asc") {
      //     sortOptions = { actual_price: 1 };
      //   } else if (sortType === "price_desc") {
      //     sortOptions = { actual_price: -1 };
      //   } else {
      //     sortOptions = { createdAt: -1 };
      //   }

      //   const totalCount = await Story.countDocuments({});
      //   const totalPages = Math.ceil(totalCount / limit);

      const storys = await Story.find();

      res.status(200).json({
        success: true,
        storys,
      });
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  })
);

// create story -- Only admin
router.post(
  "/",
  //   isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const duplicate = await Story.findOne({ title: req.body.title });
      if (duplicate) {
        return next(
          new ErrorHandler(
            "Story with similar title has already been addded",
            400
          )
        );
      }

      const { public_id, secure_url } = await cloudinary.v2.uploader.upload(
        req.body.thumbnail,
        {
          folder: "stories",
        }
      );

      const storyData = req.body;
      const story = await Story.create({
        ...storyData,
        thumbnail: secure_url,
      });

      res.status(201).json({
        success: true,
        story,
      });
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  })
);

// get a specific story
router.get(
  "/:title",
  catchAsyncErrors(async (req, res, next) => {
    try {
      if (!req.params.title) {
        return next(
          new ErrorHandler("Error occured! Story title required", 400)
        );
      }

      const story = await Story.findOne({ title: req.params.title });

      if (!story) {
        return next(
          new ErrorHandler(
            `Story with title ${req.params.title} not found`,
            400
          )
        );
      }

      res.status(200).json({
        success: true,
        story,
      });
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  })
);

// Get all related storys
router.get(
  "/related-stories/:title",
  catchAsyncErrors(async (req, res, next) => {

    try {
      if (!req.params.title) {
        return next(
          new ErrorHandler(
            "Error occured fetch storys. Specify a products to get its realted ones",
            400
          )
        );
      }

      const relatedStories = Story.aggregate([
        { $match: { title: { $ne: req.params.title } } },
        { $sample: { size: 10 } },
      ]);

      return res.status(200).json({
        success: true,
        stories: relatedStories,
      });
      
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  })
);

module.exports = router;
