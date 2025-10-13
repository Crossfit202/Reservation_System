package com.hotelreservation.controller;

import com.hotelreservation.service.StripeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/stripe")
public class StripeController {

    @Autowired
    private StripeService stripeService;

    @PostMapping("/create-payment-intent")
    public Map<String, String> createPaymentIntent(@RequestBody Map<String, Object> data) throws Exception {
        long amount = ((Number) data.get("amount")).longValue();
        String currency = (String) data.get("currency");
        String description = (String) data.getOrDefault("description", "Hotel Reservation Payment");
        String clientSecret = stripeService.createPaymentIntent(amount, currency, description);
        return Map.of("clientSecret", clientSecret);
    }

    // Add refund and webhook endpoints as needed
}