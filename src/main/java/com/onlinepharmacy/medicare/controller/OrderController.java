package com.onlinepharmacy.medicare.controller;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.onlinepharmacy.medicare.model.Order;
import com.onlinepharmacy.medicare.model.User;
import com.onlinepharmacy.medicare.service.OrderService;
import com.onlinepharmacy.medicare.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final UserService userService;

    @GetMapping
    public List<Order> findAll() {
        return orderService.findAll();
    }

    @GetMapping("/my-orders")
    public List<Order> findMyOrders(@RequestHeader(value = "Authorization", required = false) String auth) {
        Long userId = getUserIdFromAuth(auth);
        return orderService.findByUserId(userId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Order> findById(@PathVariable Long id, @RequestHeader(value = "Authorization", required = false) String auth) {
        Long userId = getUserIdFromAuth(auth);
        return orderService.findById(id)
                .filter(order -> order.getUser().getId().equals(userId))
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createOrder(@RequestBody CreateOrderRequest body,
                                         @RequestHeader(value = "Authorization", required = false) String auth) {
        try {
            Long userId = getUserIdFromAuth(auth);
            if (body.items() == null || body.items().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "No order items"));
            }
            List<OrderService.OrderItemRequest> serviceItems = body.items().stream()
                    .map(i -> new OrderService.OrderItemRequest(
                            i.productId(),
                            i.quantity() != null ? i.quantity() : 0))
                    .collect(Collectors.toList());
            return ResponseEntity.ok(orderService.createOrder(userId, serviceItems, body.deliveryAddress()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Order> updateStatus(@PathVariable Long id,
                                               @RequestBody StatusRequest request,
                                               @RequestHeader(value = "Authorization", required = false) String auth) {
        try {
            Long userId = getUserIdFromAuth(auth);
            boolean isAdmin = userService.findById(userId)
                    .map(u -> u.getRole() == User.Role.ADMIN)
                    .orElse(false);

            if (!isAdmin) {
                Order order = orderService.findById(id)
                        .orElseThrow(() -> new IllegalArgumentException("Order not found: " + id));
                if (order.getUser() == null || order.getUser().getId() == null || !order.getUser().getId().equals(userId)) {
                    return ResponseEntity.status(403).build();
                }
            }
            return ResponseEntity.ok(orderService.updateStatus(id, request.status()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<Order> cancelOrder(@PathVariable Long id, @RequestHeader(value = "Authorization", required = false) String auth) {
        Long userId = getUserIdFromAuth(auth);
        try {
            return ResponseEntity.ok(orderService.cancelOrder(id, userId));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteOrder(@PathVariable Long id, @RequestHeader(value = "Authorization", required = false) String auth) {
        try {
            Long userId = getUserIdFromAuth(auth);
            orderService.deleteOrderForUser(id, userId);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
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

    public record CreateOrderRequest(List<OrderItemPayload> items, String deliveryAddress) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record OrderItemPayload(Long productId, Integer quantity) {}

    public record StatusRequest(Order.Status status) {}
}
