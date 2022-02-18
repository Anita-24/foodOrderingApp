const { model } = require("mongoose")
const Order = require('../../../models/order');


function statusController(){

    return{
        updateStatus(req,res){

            //Fetch the orders of admin from db
            Order.updateOne({_id : req.body.orderId} ,{status : req.body.status} , (err,data)=>{
                if(err){
                    req.flash(err , 'Error in updated record')
                    return  res.redirect('/admin/orders');
                }
                //Emit Event

                const eventEmitter = req.app.get('eventEmitter');
                eventEmitter.emit('orderUpdated' , {id:req.body.orderId , status : req.body.status});

                return res.redirect('/admin/orders');
            })
        }
    }
}
module.exports = statusController;