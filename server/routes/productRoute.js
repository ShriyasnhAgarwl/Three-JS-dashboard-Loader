// ENDPOINTS
// +++++++++ PUBLIC ENDPOINTS +++++++++
// Get products: {endpointURL}/public/:userId 


const express = require('express');
const auth = require('../middleware/auth');
const Product = require('../models/products');
const Annotation = require('../models/annotation');
const multer = require('multer');
const path = require('path');
const router = express.Router();


//define storage route to store files ../uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, path.join(__dirname, '../uploads')); // Make sure the /uploads directory exists in your server directory
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage }).fields([
  { name: 'images', maxCount: 5 }, // Adjust maxCount as needed
  { name: 'modelFile', maxCount: 1 }
]);
// Define routes for your Product CRUD operations
// e.g., GET, POST, PUT, DELETE endpoints

//add product to collection
router.post('/', auth, upload, async (req, res) => {
    const imagePath = req.files['images'] ? req.files['images'].map(file => `/uploads/${file.filename}`) : [];
    const modelFilePath = req.files['modelFile'] ? `/uploads/${req.files['modelFile'][0].filename}` : null;
    const product = new Product({
      user: req.user._id,
      name: req.body.name,
      description: req.body.description, 
      images: imagePath,
      modelFile: modelFilePath,
      annotations: JSON.parse(req.body.annotations || '[]') // Assuming annotations are sent as a JSON string
    });
    console.log('Model file stored',modelFilePath);
    
    try {
      const newProduct = await product.save();
      res.status(201).json('Model file stored', modelFilePath, newProduct);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  });
 
// GET route to fetch all products 
router.get('/', auth, async (req, res) => {
    try {
      const products = await Product.find({ user: req.user._id });
      res.json(products);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });


// GET route to fetch a single product by ID
router.get('/:id', auth, getProduct, (req, res) => {
    res.json(res.product);
});
  
// PATCH route to update a product's details
// USES :: get product Middleware 
router.put('/:id', auth, getProduct, async (req, res) => {        
    try {
      const updateVal = req.body;
      delete updateVal['_id'];
      const updatedProduct = await Product.findOneAndUpdate({_id: req.params.id,  user: req.user._id}, {...updateVal});         
      if (!updatedProduct) {
          return res.status(404).json({ message: 'Product not found or user not authorized' });
        } 

      return res.json({updatedProduct});
    } catch (err) {
        console.error('error here', err);
        res.status(400).json({ message: err.message });
    }
});

// DELETE route to delete a product
router.delete('/:id',auth, getProduct, async (req, res) => {
    try {
        const deletedProduct = await Product.findOne({ _id: req.params.id });
        if (!deletedProduct) {
          return res.status(404).json({ message: 'Cannot find product' });
        }
        if (deletedProduct.user.toString() !== req.user.id) {
          return res.status(403).json({ message: 'User not authorized to delete this product' });
        }
        await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted Product ', product: deletedProduct.name });
    } catch (err) {
    res.status(500).json({ message: err.message });
    }
});

// Middleware to get a product by ID
async function getProduct(req, res, next) {
    let product;
    try {
    product = await Product.findById(req.params.id);
    if (product == null) {
        return res.status(404).json({ message: 'Cannot find product' });
    }
    res.product = product;
    next();
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

//#region  PUBLIC END POINTS for [ accessing all products by user || accessing specific product details ]
  //Public data with User ID publically
    router.get('/public/:userId', async (req, res) => {
      try {
        const { userId } = req.params;
        const products = await Product.find({ user: userId });
        res.json(products);
      } catch (err) {
        res.status(500).json({ message: err.message });
      }
    });

    // GET route to fetch a single product publicly by product ID
    router.get('/public/details/:productId', async (req, res) => {
      try {
        const { productId } = req.params;
        const product = await Product.findById(productId);
        
        if (!product) {
          return res.status(404).json({ message: 'Product not found' });
        }

        res.json(product);
      } catch (err) {
        res.status(500).json({ message: err.message });
      }
    });

//#endregion

//#region ANNOTATION DATA 'get' and 'post' requests

  // get annotation data based on product 
      router.get('/products/:productId/annotations', async (req, res) => {
          try {
            const annotations = await Annotation.find({ productId: req.params.productId });
            res.json(annotations);
          } catch (error) {
            res.status(500).json({ message: error.message });
          }
        });

  // post new annotation or update existing data  
      router.post('/products/:productId/annotations', async (req, res) => {
          const annotation = new Annotation({
            ...req.body,
            productId: req.params.productId
          });
        
          try {
            const newAnnotation = await annotation.save();
            res.status(201).json(newAnnotation);
          } catch (error) {
            res.status(400).json({ message: error.message });
          }
        });
//#endregion 

module.exports = router;
