package com.onlinepharmacy.medicare.controller;

import com.onlinepharmacy.medicare.model.Delivery;
import com.onlinepharmacy.medicare.service.DeliveryService;
import com.onlinepharmacy.medicare.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/deliveries")
@RequiredArgsConstructor
public class DeliveryController {

    private final DeliveryService deliveryService;
    private final UserService userService;

    @GetMapping
    public List<Delivery> findAll() {
        return deliveryService.findAll();
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<Delivery> findByOrderId(@PathVariable Long orderId) {
        return deliveryService.findByOrderId(orderId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/status/{status}")
    public List<Delivery> findByStatus(@PathVariable Delivery.DeliveryStatus status) {
        return deliveryService.findByStatus(status);
    }

    @GetMapping("/my-deliveries")
    public List<Delivery> findMyDeliveries(@RequestHeader(value = "Authorization", required = false) String auth) {
        Long userId = getUserIdFromAuth(auth);
        return deliveryService.findByUserId(userId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Delivery> findById(@PathVariable Long id) {
        return deliveryService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Delivery> create(@RequestBody CreateDeliveryRequest request) {
        try {
            return ResponseEntity.ok(deliveryService.create(request.orderId(), request.deliveryAddress()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Delivery> updateStatus(@PathVariable Long id, @RequestBody StatusRequest request) {
        try {
            return ResponseEntity.ok(deliveryService.updateStatus(id, request.status()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PatchMapping("/{id}/tracking")
    public ResponseEntity<Delivery> updateTracking(@PathVariable Long id, @RequestBody TrackingRequest request) {
        try {
            return ResponseEntity.ok(deliveryService.updateTracking(id, request.trackingNumber()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    private Long getUserIdFromAuth(String auth) {
        if (auth == null || !auth.startsWith("Bearer ")) {
            throw new IllegalArgumentException("Authorization required");
        }
        try {
            return Long.parseLong(auth.substring(7).trim());
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Invalid token");
        }
    }

    public record CreateDeliveryRequest(Long orderId, String deliveryAddress) {}
    public record StatusRequest(Delivery.DeliveryStatus status) {}
    public record TrackingRequest(String trackingNumber) {}
}
