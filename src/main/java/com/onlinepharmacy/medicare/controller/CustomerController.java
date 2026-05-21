package com.onlinepharmacy.medicare.controller;

import com.onlinepharmacy.medicare.model.Order;
import com.onlinepharmacy.medicare.model.Product;
import com.onlinepharmacy.medicare.service.OrderService;
import com.onlinepharmacy.medicare.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
@CrossOrigin
public class CustomerController {

    private final ProductService productService;
    private final OrderService orderService;

    @GetMapping("/products")
    public List<Product> listProducts(@RequestParam(required = false) String q) {
        if (q != null && !q.isBlank()) {
            return productService.searchByName(q);
        }
        return productService.findAll();
    }

    @GetMapping("/orders")
    public List<Order> listOrders() {
        // TODO: filter by authenticated customer
        return orderService.findAll();
    }
}

