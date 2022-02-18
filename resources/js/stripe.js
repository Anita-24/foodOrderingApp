import { placeOrder } from "./apiService";
import { loadStripe } from "@stripe/stripe-js";

export async function initStripe() {
  const stripe = await loadStripe(
    "pk_test_51JX7E1SD8KoJhrSNxuahRcbVP6F93nCJwVL6GiBEPgEn8GvD6gE7gSuzkWVQHqXCQdR1n0xLWS0b9MWeN7zYWQHt00DHzS7Ihz"
  );

  let card = null;

  function mountWidget() {
    const elements = stripe.elements();

    let style = {
      base: {
        color: "#32325d",
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSmoothing: "antialiased",
        fontSize: "16px",
        "::placeholder": {
          color: "#aab7c4",
        },
      },
      invalid: {
        color: "#fa755a",
        iconColor: "#fa755a",
      },
    };

    card = elements.create("card", { style: style, hidePostalCode: true });
    card.mount("#cardElement");
  }

  let paymentType = document.querySelector("#payment_type");
  if (!paymentType) {
    return;
  }
  if (paymentType) {
    paymentType.addEventListener("change", (event) => {
      if (event.target.value === "card") {
        //Display card widget
        mountWidget();
      } else {
        card.destroy();
      }
    });
  }

  //Ajax Call

  let payment_form = document.querySelector("#payment_form");

  if (payment_form) {
    payment_form.addEventListener("submit", (event) => {
      event.preventDefault();

      let formData = new FormData(payment_form);
      let formObject = {};
      for (let [key, value] of formData.entries()) {
        formObject[key] = value;
      }

      if (!card) {
        //Ajax call
        placeOrder(formObject);
        return;
      }

      // Verify by stripe

      stripe
        .createToken(card)
        .then((result) => {
          formObject.stripeToken = result.token.id;
          placeOrder(formObject);
        })
        .catch((err) => {
          console.log(err);
        });
    });
  }
}
