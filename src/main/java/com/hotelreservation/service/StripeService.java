package com.hotelreservation.service;

import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.model.Refund;
import com.stripe.param.PaymentIntentCreateParams;
import com.stripe.param.RefundCreateParams;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;

@Service
public class StripeService {

    @Value("${stripe.secret.key}")
    private String stripeSecretKey;

    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeSecretKey;
    }

    // Create a PaymentIntent and return the client secret
    public String createPaymentIntent(long amount, String currency, String description) throws StripeException {
        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount(amount) // amount in cents
                .setCurrency(currency)
                .setDescription(description)
                .build();

        PaymentIntent intent = PaymentIntent.create(params);
        return intent.getClientSecret();
    }

    // Refund a payment by PaymentIntent or Charge ID
    public Refund refundPayment(String paymentIntentId, Long amount) throws StripeException {
        RefundCreateParams.Builder paramsBuilder = RefundCreateParams.builder()
                .setPaymentIntent(paymentIntentId);
        if (amount != null) {
            paramsBuilder.setAmount(amount);
        }
        return Refund.create(paramsBuilder.build());
    }

    // Optionally: Add more methods for webhooks, retrieving payment status, etc.
}
