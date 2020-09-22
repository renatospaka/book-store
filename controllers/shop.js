const Product = require('../models/product');
const Order = require('../models/order');
const user = require('../models/user');

exports.getProducts = (req, res, next) => {
  Product.find()
    .then(products => {
      //console.log('getProducts: ', products);
      res.render('shop/product-list', {
        prods: products,
        pageTitle: 'All Products',
        path: '/products',
        isAuthenticated: req.isLoggedIn
      });
    })
    .catch(err => console.log('getProducts: ', err));
}

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId

  Product.findById(prodId)
    .then(product => {
      res.render('shop/product-detail', {
        product: product,
        pageTitle: product.title,
        path: '/products',
        isAuthenticated: req.isLoggedIn
      })
    })
    .catch(err => console.log('getProduct: ', err))
}

exports.getIndex = (req, res, next) => {
  Product.find()
    .then(products => {
      //console.log('getIndex: ', products);
      res.render('shop/index', {
        prods: products,
        pageTitle: 'Shop',
        path: '/',
        isAuthenticated: req.isLoggedIn
      })
    })
    .catch(err => console.log('getIndex: ', err))
};

exports.getCart = (req, res, next) => {
  req.user.populate('cart.items.productId')
    .execPopulate() //populate doesn't raise a promisse, execPopulate does
    .then(user => {
      const products = user.cart.items;
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products: products,
        isAuthenticated: req.isLoggedIn
      });
    })
    .catch(err => console.log('getCart: ', err));
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then(product => {
      return req.user.addToCart(product);      
    })
    .then(result => {
      console.log('postCart: ', result);
      res.redirect('/cart');
    });
}

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user.removeFromCart(prodId)
    .then(result => {
      res.redirect('/cart')
    })
    .catch(err => console.log('postCartDeleteProduct: ', err));
};

exports.postOrder = (req, res, next) => {
  req.user.populate('cart.items.productId')
    .execPopulate() //populate doesn't raise a promisse, execPopulate does
    .then(user => {
      const products = user.cart.items.map(i => {
        return { quantity: i.quantity, product: { ...i.productId._doc } }; // ._doc é um método do mongoose para popular informações de um documento
      });    
      const order = new Order({
        user: {
          name: req.user.name,
          userId: req.user
        },
        products: products
      });
      return order.save();
    })
    .then(result => {
      return req.user.clearCart();
    })
    .then(() => {
      res.redirect('/orders');
    })
    .catch(err => console.log('postOrder: ', err));
}

exports.getOrders = (req, res, next) => {
  Order.find({ 'user.userId': req.user._id })
    .then(orders => {
      res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders',
        orders: orders,
        isAuthenticated: req.isLoggedIn
      });
    })
    .catch(err => console.log('getOrders: ', err));
}
