package com.onlinepharmacy.medicare.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "deliveries")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Delivery {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false, unique = true)
    private Order order;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DeliveryStatus status = DeliveryStatus.PENDING;

    @Column(nullable = false)
    private String deliveryAddress;

    private String trackingNumber;

    private LocalDateTime estimatedDeliveryDate;

    private LocalDateTime actualDeliveryDate;

    @Column(nullable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum DeliveryStatus {
        PENDING, PICKED_UP, IN_TRANSIT, DELIVERED, FAILED
    }
}
