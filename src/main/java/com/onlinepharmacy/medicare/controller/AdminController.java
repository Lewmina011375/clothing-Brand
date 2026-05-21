package com.onlinepharmacy.medicare.controller;

import com.onlinepharmacy.medicare.model.Order;
import com.onlinepharmacy.medicare.model.Product;
import com.onlinepharmacy.medicare.repository.OrderRepository;
import com.onlinepharmacy.medicare.repository.ProductRepository;
import com.onlinepharmacy.medicare.repository.UserRepository;
import com.onlinepharmacy.medicare.service.DeliveryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final DeliveryService deliveryService;

    @GetMapping("/stats")
    public StatsResponse getStats() {
        long totalUsers = userRepository.count();
        long totalProducts = productRepository.count();
        long totalOrders = orderRepository.count();

        long activeOrders = orderRepository.findAll().stream()
                .filter(order -> order.getStatus() == Order.Status.PENDING
                        || order.getStatus() == Order.Status.PAID
                        || order.getStatus() == Order.Status.SHIPPED)
                .count();

        BigDecimal totalRevenue = orderRepository.findAll().stream()
                .map(Order::getTotalAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new StatsResponse(totalUsers, totalProducts, totalOrders, activeOrders, totalRevenue);
    }

    @GetMapping("/reports/sales")
    public SalesReportResponse getSalesReport(@RequestParam(defaultValue = "monthly") String range) {
        List<Order> orders = orderRepository.findAll();
        LocalDateTime cutoff = switch (range.toLowerCase()) {
            case "daily" -> LocalDate.now().atStartOfDay();
            case "weekly" -> LocalDate.now().minusDays(7).atStartOfDay();
            default -> LocalDate.now().minusMonths(1).atStartOfDay();
        };

        BigDecimal total = orders.stream()
                .filter(o -> o.getCreatedAt() != null && o.getCreatedAt().isAfter(cutoff))
                .map(Order::getTotalAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long count = orders.stream()
                .filter(o -> o.getCreatedAt() != null && o.getCreatedAt().isAfter(cutoff))
                .count();

        return new SalesReportResponse(total, count, range);
    }

    @GetMapping("/reports/top-products")
    public List<TopProductDto> getTopProducts(@RequestParam(defaultValue = "5") int limit) {
        Map<Long, Long> qtyByProduct = new HashMap<>();
        orderRepository.findAllWithItems().stream()
                .flatMap(o -> o.getItems().stream())
                .forEach(item -> {
                    Long pid = item.getProduct().getId();
                    qtyByProduct.merge(pid, (long) item.getQuantity(), Long::sum);
                });

        return qtyByProduct.entrySet().stream()
                .sorted(Map.Entry.<Long, Long>comparingByValue().reversed())
                .limit(limit)
                .map(e -> {
                    Product p = productRepository.findById(e.getKey()).orElse(null);
                    return new TopProductDto(p != null ? p.getName() : "Unknown", e.getValue());
                })
                .toList();
    }

    /**
     * One-time / admin repair: create {@link com.onlinepharmacy.medicare.model.Delivery} rows for orders
     * that never had one (e.g. checkouts before shipping details were wired).
     */
    @PostMapping("/deliveries/backfill-from-orders")
    public Map<String, Integer> backfillDeliveriesFromOrders() {
        int created = deliveryService.createDeliveriesForOrdersMissing(
                "Legacy order — address was not stored at checkout");
        return Map.of("created", created);
    }

    @GetMapping("/reports/customer-activity")
    public List<CustomerActivityDto> getCustomerActivity() {
        Map<Long, Long> orderCountByUser = new HashMap<>();
        Map<Long, BigDecimal> totalByUser = new HashMap<>();
        orderRepository.findAll().forEach(o -> {
            Long uid = o.getUser().getId();
            orderCountByUser.merge(uid, 1L, Long::sum);
            totalByUser.merge(uid, o.getTotalAmount() != null ? o.getTotalAmount() : BigDecimal.ZERO, BigDecimal::add);
        });

        return orderCountByUser.entrySet().stream()
                .map(e -> {
                    var u = userRepository.findById(e.getKey()).orElse(null);
                    return new CustomerActivityDto(
                            u != null ? u.getFullName() : "Unknown",
                            u != null ? u.getEmail() : "",
                            e.getValue(),
                            totalByUser.getOrDefault(e.getKey(), BigDecimal.ZERO)
                    );
                })
                .sorted((a, b) -> Long.compare(b.orderCount(), a.orderCount()))
                .limit(10)
                .toList();
    }

    public record StatsResponse(long totalUsers, long totalProducts, long totalOrders, long activeOrders, BigDecimal totalRevenue) {}
    public record SalesReportResponse(BigDecimal total, long orderCount, String range) {}
    public record TopProductDto(String productName, long quantitySold) {}
    public record CustomerActivityDto(String fullName, String email, long orderCount, BigDecimal totalSpent) {}
}


