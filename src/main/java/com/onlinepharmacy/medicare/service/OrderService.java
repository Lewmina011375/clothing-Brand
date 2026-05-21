package com.onlinepharmacy.medicare.service;

import com.onlinepharmacy.medicare.model.Order;
import com.onlinepharmacy.medicare.model.OrderItem;
import com.onlinepharmacy.medicare.model.Product;
import com.onlinepharmacy.medicare.model.User;
import com.onlinepharmacy.medicare.repository.ProductRepository;
import com.onlinepharmacy.medicare.repository.OrderRepository;
import com.onlinepharmacy.medicare.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final DeliveryService deliveryService;

    @Transactional(readOnly = true)
    public List<Order> findAll() {
        // Fetch joins avoid LazyInitializationException when Jackson serializes lazy relations.
        return orderRepository.findAllWithItems();
    }

    public Optional<Order> findById(Long id) {
        return orderRepository.findByIdWithItemsAndUser(id);
    }

    @Transactional(readOnly = true)
    public List<Order> findByUserId(Long userId) {
        // Fetch joins avoid lazy loading gaps in the JSON response.
        return orderRepository.findByUserIdWithItems(userId);
    }

    @Transactional
    public Order createOrder(Long userId, List<OrderItemRequest> items, String deliveryAddress) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        Order order = Order.builder()
                .user(user)
                .status(Order.Status.PENDING)
                .totalAmount(BigDecimal.ZERO)
                .createdAt(java.time.LocalDateTime.now())
                .build();

        BigDecimal total = BigDecimal.ZERO;
        for (OrderItemRequest req : items) {
            Product product = productRepository.findById(req.productId())
                    .orElseThrow(() -> new IllegalArgumentException("Product not found: " + req.productId()));
            if (product.getStockQuantity() < req.quantity()) {
                throw new IllegalArgumentException("Insufficient stock for: " + product.getName());
            }
            BigDecimal lineTotal = product.getPrice().multiply(BigDecimal.valueOf(req.quantity()));
            total = total.add(lineTotal);

            OrderItem item = OrderItem.builder()
                    .order(order)
                    .product(product)
                    .quantity(req.quantity())
                    .unitPrice(product.getPrice())
                    .build();
            order.getItems().add(item);
            product.setStockQuantity(product.getStockQuantity() - req.quantity());
        }
        order.setTotalAmount(total);
        Order saved = orderRepository.save(order);

        String addressForDelivery = (deliveryAddress != null && !deliveryAddress.isBlank())
                ? deliveryAddress.trim()
                : "Address not captured at checkout";
        deliveryService.create(saved.getId(), addressForDelivery);

        return saved;
    }

    @Transactional
    public Order updateStatus(Long id, Order.Status status) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + id));
        order.setStatus(status);
        return orderRepository.save(order);
    }

    @Transactional
    public Order cancelOrder(Long id, Long userId) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + id));
        if (!order.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Not authorized to cancel this order");
        }
        if (order.getStatus() != Order.Status.PENDING && order.getStatus() != Order.Status.PAID) {
            throw new IllegalArgumentException("Order cannot be cancelled in current status");
        }
        for (OrderItem item : order.getItems()) {
            Product p = item.getProduct();
            p.setStockQuantity(p.getStockQuantity() + item.getQuantity());
        }
        order.setStatus(Order.Status.CANCELED);
        return orderRepository.save(order);
    }

    /**
     * Permanently removes the order for the owning user.
     * Restores product stock unless the order was already canceled (stock was restored on cancel).
     * Shipped / delivered orders cannot be deleted.
     */
    @Transactional
    public void deleteOrderForUser(Long id, Long userId) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + id));
        if (!order.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Not authorized to delete this order");
        }
        Order.Status status = order.getStatus();
        if (status == Order.Status.SHIPPED || status == Order.Status.DELIVERED) {
            throw new IllegalArgumentException("Cannot delete an order that is shipped or delivered");
        }
        if (status != Order.Status.CANCELED) {
            for (OrderItem item : order.getItems()) {
                Product p = item.getProduct();
                p.setStockQuantity(p.getStockQuantity() + item.getQuantity());
            }
        }
        // Prevent FK constraint failure: deliveries.order_id references orders.id.
        deliveryService.deleteByOrderId(id);
        orderRepository.delete(order);
    }

    public record OrderItemRequest(Long productId, int quantity) {}
}
