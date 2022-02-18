

import Noty from 'noty';
import Axios from 'axios'

export function placeOrder(formObject){

    //Ajax call
    Axios.post('/orders', formObject).then((res)=>{
        new Noty({
            text: res.data.message,
            type : 'success',
            timeout : 1000,
            progressBar : false
        }).show();

        setTimeout(()=>{
            window.location.href = "/customer/orders";
        } ,1000);
        
    }).catch(err=>{
        new Noty({
            text: err.res.data.message,
            type : 'success',
            timeout : 1000,
            progressBar : false
        }).show();
    })


}