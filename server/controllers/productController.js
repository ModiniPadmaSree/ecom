const Product = require('../models/productModel');

const { CustomErrorHandler, catchAsyncErrors } = require('../middleware/errorMiddleware');



// Utility for API Features (Search, Filter, Pagination)

// This class helps build dynamic queries based on request parameters.

class ApiFeatures {

    constructor(query, queryStr) {

        this.query = query;    // Mongoose query (e.g., Product.find())

        this.queryStr = queryStr; // Query string from req.query (e.g., { keyword: 'laptop', price: { gt: 1000 } })

    }



    // Search functionality based on a keyword in product name

    search() {

        const keyword = this.queryStr.keyword ?

            {

                name: {

                    $regex: this.queryStr.keyword, // MongoDB regex operator for pattern matching

                    $options: 'i',                 // 'i' for case-insensitive matching

                },

            } :

            {}; // If no keyword, return an empty object



        this.query = this.query.find({ ...keyword }); // Apply the keyword filter to the query

        return this; // Return 'this' for chaining

    }



    // Filter functionality for categories, price ranges, etc.

    filter() {

        const queryCopy = { ...this.queryStr }; // Create a copy of the query string object



        // Remove fields that are not for filtering specific data (e.g., pagination, search keyword)

        const removeFields = ['keyword', 'page', 'limit'];

        removeFields.forEach((key) => delete queryCopy[key]);



        // Convert query string to add MongoDB operators ($gte, $lte, etc.) for price and ratings

        // Example: { price: { gt: '100', lt: '500' } } becomes { price: { $gt: 100, $lt: 500 } }

        let queryStr = JSON.stringify(queryCopy);

        queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (key) => `$${key}`);



        this.query = this.query.find(JSON.parse(queryStr)); // Apply filters to the query

        return this; // Return 'this' for chaining

    }



    // Pagination functionality

    pagination(resultPerPage) {

        const currentPage = Number(this.queryStr.page) || 1; // Current page number, default to 1

        const skip = resultPerPage * (currentPage - 1);     // Number of documents to skip



        this.query = this.query.limit(resultPerPage).skip(skip); // Apply limit and skip for pagination

        return this; // Return 'this' for chaining

    }

}





// @desc    Create a new product (Admin only)

// @route   POST /api/v1/admin/products/new

// @access  Private/Admin

exports.createProduct = catchAsyncErrors(async (req, res, next) => {

    // Attach the ID of the user creating the product (from the `protect` middleware)

    req.body.user = req.user._id;



    // For simplicity, providing default image if none is provided.

    // In a real application, you would integrate actual image upload services (e.g., Cloudinary).

    if (!req.body.images || req.body.images.length === 0) {

        req.body.images = [

            {

                public_id: 'default_product_id',

                url: 'https://placehold.co/400x300/cccccc/ffffff?text=Product',

            },

        ];

    }



    const product = await Product.create(req.body); // Create the product in the database



    res.status(201).json({

        success: true,

        product,

    });

});



// @desc    Get all products (Public access)

// @route   GET /api/v1/products

// @access  Public

exports.getAllProducts = catchAsyncErrors(async (req, res) => {

    const resultPerPage = 10; // Number of products to display per page

    const productsCount = await Product.countDocuments(); // Get total count of products for pagination info



    // Apply API features (search, filter, pagination) to the Mongoose query

    const apiFeature = new ApiFeatures(Product.find(), req.query)

        .search()

        .filter()

        .pagination();



    const products = await apiFeature.query; // Execute the built query



    res.status(200).json({

        success: true,

        products,

        productsCount,

        resultPerPage,

    });

});



// @desc    Get single product details (Public access)

// @route   GET /api/v1/product/:id

// @access  Public

exports.getProductDetails = catchAsyncErrors(async (req, res, next) => {

    console.log(`[Backend] Attempting to fetch product with ID: ${req.params.id}`);

   

    const product = await Product.findById(req.params.id); // Find product by ID



    if (!product) {

        // If product not found, create and pass a custom error to the error middleware

        return next(new CustomErrorHandler('Product not found', 404));

    }



    res.status(200).json({

        success: true,

        product,

    });

});



// @desc    Update product (Admin only)

// @route   PUT /api/v1/admin/product/:id

// @access  Private/Admin

exports.updateProduct = catchAsyncErrors(async (req, res, next) => {

    let product = await Product.findById(req.params.id); // Find product by ID



    if (!product) {

        return next(new CustomErrorHandler('Product not found', 404));

    }



    // Update the product. `findByIdAndUpdate` returns the updated document.

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {

        new: true,           // Return the modified document rather than the original

        runValidators: true, // Run schema validators on update

        useFindAndModify: false, // Prevents deprecation warning

    });



    res.status(200).json({

        success: true,

        product,

    });

});



// @desc    Delete product (Admin only)

// @route   DELETE /api/v1/admin/product/:id

// @access  Private/Admin

exports.deleteProduct = catchAsyncErrors(async (req, res, next) => {

    const product = await Product.findById(req.params.id); // Find product by ID



    if (!product) {

        return next(new CustomErrorHandler('Product not found', 404));

    }



    // Delete the product. For Mongoose 6.x+ `deleteOne()` is preferred over `remove()`.

    await product.deleteOne();



    res.status(200).json({

        success: true,

        message: 'Product deleted successfully',

    });

});



// @desc    Create new review or update an existing review for a product (User/Admin)

// @route   PUT /api/v1/review

// @access  Private

exports.createProductReview = catchAsyncErrors(async (req, res, next) => {

    const { rating, comment, productId } = req.body;



    // Create a review object

    const review = {

        user: req.user._id, // User ID from authenticated request

        name: req.user.name, // User name from authenticated request

        rating: Number(rating), // Convert rating to a number

        comment,

    };



    const product = await Product.findById(productId); // Find the product



    if (!product) {

        return next(new CustomErrorHandler('Product not found', 404));

    }



    // Check if the user has already reviewed this product

    const isReviewed = product.reviews.find(

        (rev) => rev.user.toString() === req.user._id.toString()

    );



    if (isReviewed) {

        // If already reviewed, update the existing review

        product.reviews.forEach((rev) => {

            if (rev.user.toString() === req.user._id.toString()) {

                rev.rating = rating;

                rev.comment = comment;

            }

        });

    } else {

        // If not reviewed, add a new review

        product.reviews.push(review);

        product.numOfReviews = product.reviews.length; // Update total number of reviews

    }



    // Calculate the new average rating for the product

    let avg = 0;

    product.reviews.forEach((rev) => {

        avg += rev.rating;

    });

    product.ratings = avg / product.reviews.length; // Update product's average rating



    await product.save({ validateBeforeSave: false }); // Save the updated product



    res.status(200).json({

        success: true,

    });

});



// @desc    Get all reviews of a single product (Public access)

// @route   GET /api/v1/reviews?id=productId

// @access  Public

exports.getProductReviews = catchAsyncErrors(async (req, res, next) => {

    const product = await Product.findById(req.query.id); // Find product using query parameter



    if (!product) {

        return next(new CustomErrorHandler('Product not found', 404));

    }



    res.status(200).json({

        success: true,

        reviews: product.reviews, // Return all reviews for the product

    });

});



// @desc    Delete a review (Admin only)

// @route   DELETE /api/v1/reviews?id=reviewId&productId=productId

// @access  Private/Admin

exports.deleteReview = catchAsyncErrors(async (req, res, next) => {

    const product = await Product.findById(req.query.productId); // Find the product by ID



    if (!product) {

        return next(new CustomErrorHandler('Product not found', 404));

    }



    // Filter out the review to be deleted from the product's reviews array

    const reviews = product.reviews.filter(

        (rev) => rev._id.toString() !== req.query.id.toString()

    );



    // Recalculate average rating after review deletion

    let avg = 0;

    if (reviews.length > 0) {

        reviews.forEach((rev) => {

            avg += rev.rating;

        });

        product.ratings = avg / reviews.length;

    } else {

        product.ratings = 0; // If no reviews are left, set ratings to 0

    }



    product.numOfReviews = reviews.length; // Update the total number of reviews

product.reviews = reviews; // Assign the filtered reviews back to the product



    await product.save({ validateBeforeSave: false }); // Save the updated product



    res.status(200).json({

        success: true,

        message: 'Review deleted successfully',

    });

});