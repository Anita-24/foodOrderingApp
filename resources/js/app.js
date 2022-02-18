import moment from 'moment';  
 import Axios from 'axios'
 import Noty from 'noty'
import {initAdmin } from './admin';
import {initStripe} from './stripe';

const addToCart = document.querySelectorAll('.add-to-cart');
const cartCounter =  document.querySelector('#cartCounter');

    function updateCart(pizza){
        Axios.post('/update-cart', pizza).then(res =>{
            cartCounter.innerText = res.data.totalQty;

            new Noty({
                text: " Item Added to Cart",
                type : 'success',
                timeout : 1000,
                progressBar : false
              }).show();
        }).catch(err=>{
            new Noty({
                text: "OOPS! Something went wrong 🙄",
                type : 'error',
                timeout : 1000,
                progressBar : false
              }).show();
        });
    }
addToCart.forEach((button)=>{
    button.addEventListener('click',(e)=>{
        let pizza = JSON.parse(button.dataset.pizza);
        updateCart(pizza);
    })
});

//Hamburger slider functionality
let hamburger = document.querySelector('.hamburger');
let closeIcon = document.querySelector('.fa-window-close');
let mobileNav = document.querySelector('.mobile_nav');

hamburger.addEventListener('click' , ()=>{
    mobileNav.classList.add('open');
})
closeIcon.addEventListener('click' , ()=>{
    mobileNav.classList.remove('open');
    
})

//Remove alert message after X second

const alertMsg = document.querySelector('#success-alert');

if(alertMsg){
    setTimeout(()=>{
        alertMsg.remove();
        },2000);
}



// Change Order Status
    let statuses = document.querySelectorAll('.status_line');
    let hiddenInput =  document.querySelector('#hiddenInput');
    let order =  hiddenInput ? hiddenInput.value : null  ;
    order = JSON.parse(order);
    let time = document.createElement('small');


function updateStatus(order){
    statuses.forEach((status)=>{
        status.classList.remove('step_cpmpleted');
        status.classList.remove('current');
    })

    statuses.forEach((status)=>{
        let dataProp = status.dataset.status;

        let stepCompleted = true;

        if(stepCompleted){
            status.classList.add('step_completed');
        }
        if(dataProp === order.status){
            stepCompleted = false;

            time.innerText = moment(order.updatedAt).format('hh:mm A');
            status.appendChild(time);

            if(status.nextElementSibling){
                status.nextElementSibling.classList.add('current');
            }
        }
    })
    
}

updateStatus(order);

initStripe();

//Socket

let socket = io();


//Join
if(order){
    // creating room for different ids
    socket.emit('join' , `order_${order._id}` )
}

let adminAreaPath = window.location.pathname;
if(adminAreaPath.includes('admin')){
    
    initAdmin(socket);

    // creating another room with adminRoom
    socket.emit('join', 'adminRoom');
}

socket.on('orderUpdated', (data)=>{
    const updatedOrder =  { ...order };
    updatedOrder.updatedAt = moment().format();
    updatedOrder.status = data.status;

    updateStatus(updatedOrder);
    new Noty({
        text: " Order Updated",
        type : 'success',
        timeout : 1000,
        progressBar : false
      }).show();

})