package com.onlinepharmacy.medicare.service;

import com.onlinepharmacy.medicare.model.Delivery;
import com.onlinepharmacy.medicare.model.Order;
import com.onlinepharmacy.medicare.repository.DeliveryRepository;
import com.onlinepharmacy.medicare.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class DeliveryService {

    private final DeliveryRepository deliveryRepository;
    private final OrderRepository orderRepository;

    public List<Delivery> findAll() {
        return deliveryRepository.findAllWithOrderAndUser();
    }

    public Optional<Delivery> findById(Long id) {
        return deliveryRepository.findById(id);
    }

    public Optional<Delivery> findByOrderId(Long orderId) {
        return deliveryRepository.findByOrder_Id(orderId);
    }

    public List<Delivery> findByStatus(Delivery.DeliveryStatus status) {
        return deliveryRepository.findByStatus(status);
    }

    public List<Delivery> findByUserId(Long userId) {
        return deliveryRepository.findByOrder_User_IdOrderByCreatedAtDesc(userId);
    }

    @Transactional
    public Delivery create(Long orderId, String deliveryAddress) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + orderId));
        if (deliveryRepository.findByOrder_Id(orderId).isPresent()) {
            throw new IllegalArgumentException("Delivery already exists for this order");
        }
        Delivery delivery = Delivery.builder()
                .order(order)
                .status(Delivery.DeliveryStatus.PENDING)
                .deliveryAddress(deliveryAddress)
                .build();
        return deliveryRepository.save(delivery);
    }

    @Transactional
    public Delivery updateStatus(Long id, Delivery.DeliveryStatus status) {
        Delivery delivery = deliveryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Delivery not found: " + id));
        delivery.setStatus(status);
        if (status == Delivery.DeliveryStatus.DELIVERED) {
            delivery.setActualDeliveryDate(java.time.LocalDateTime.now());
        }
        return deliveryRepository.save(delivery);
    }

    @Transactional
    public Delivery updateTracking(Long id, String trackingNumber) {
        Delivery delivery = deliveryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Delivery not found: " + id));
        delivery.setTrackingNumber(trackingNumber);
        return deliveryRepository.save(delivery);
    }

    /**
     * Creates a delivery row for each order that does not have one yet (e.g. orders from before checkout sent an address).
     */
    @Transactional
    public int createDeliveriesForOrdersMissing(String placeholderAddress) {
        String safe = (placeholderAddress != null && !placeholderAddress.isBlank())
                ? placeholderAddress.trim()
                : "No address on file";
        int count = 0;
        for (Order o : orderRepository.findAll()) {
            if (deliveryRepository.findByOrder_Id(o.getId()).isEmpty()) {
                create(o.getId(), safe);
                count++;
            }
        }
        return count;
    }

    /**
     * Deletes the delivery row linked to the given order (if any).
     * This avoids FK constraint errors when deleting orders.
     */
    @Transactional
    public void deleteByOrderId(Long orderId) {
        deliveryRepository.findByOrder_Id(orderId).ifPresent(deliveryRepository::delete);
    }
}
