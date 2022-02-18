const Order = require("../../../models/order");
const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);
const moment = require("moment");



function orderController() {
  return {
    store(req, res) {
      console.log(req.body);

      //validate request
      const { phone, address, stripeToken, paymentType } = req.body;

      if (!phone || !address) {
        return res.status(422).json({ message: "All fields are required " });
        // req.flash('error' , "All fields are required");
        // return res.redirect('/cart');
      }

      //Create an order in db
      const order = new Order({
        customerId: req.user._id,
        items: req.session.cart.items,
        phone: phone,
        address: address,
      });

      order.save().then((result) => {
          Order.populate(result, { path: "customerId" }, (err, placedOrder) => {

            // Stripe Payment
            if(paymentType === 'card') {
                stripe.charges.create({
                    amount: req.session.cart.totalPrice  * 100,
                    source: stripeToken,
                    currency: 'inr',
                    description: `Pizza order: ${placedOrder._id}`
                }).then(() => {
                    placedOrder.paymentStatus = true;
                    placedOrder.paymentType = paymentType;
                    placedOrder.save().then((ord) => {

                        // Emit
                        const eventEmitter = req.app.get('eventEmitter');
                        eventEmitter.emit('orderPlaced', ord);
                        delete req.session.cart;

                        return res.json({ message : 'Payment successful, Order placed successfully' });
                    }).catch((err) => {
                        console.log(err)
                    })

                }).catch((err) => {
                    delete req.session.cart
                    return res.json({ message : 'OrderPlaced but payment failed, You can pay at delivery time' });
                })
            } else {
                delete req.session.cart;
                return res.json({ message : "Order placed successfully" });
            }
        })
    }).catch(err => {
        return res.status(500).json({ message : 'Something went wrong' });
    })
    },

    
    async index(req, res) {
      // Fetch the order from db
      const orders = await Order.find({ customerId: req.user._id }, null, {
        sort: { createdAt: -1 },
      });
      res.header("Cache-Control", "no-store");
      res.render("customers/orders", { orders: orders, moment: moment });
    },


    async show(req, res) {
      const order = await Order.findById(req.params.id);
      // Authorize User
      if (req.user._id.toString() == order.customerId.toString()) {
        return res.render("customers/singleOrder", { order: order });
      }

      return res.redirect("/");
    },
  };
}
module.exports = orderController;
