package com.onlinepharmacy.medicare.repository;

import com.onlinepharmacy.medicare.model.Delivery;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface DeliveryRepository extends JpaRepository<Delivery, Long> {

    Optional<Delivery> findByOrder_Id(Long orderId);

    List<Delivery> findByStatus(Delivery.DeliveryStatus status);

    List<Delivery> findByOrder_User_IdOrderByCreatedAtDesc(Long userId);

    @Query("SELECT DISTINCT d FROM Delivery d JOIN FETCH d.order o JOIN FETCH o.user")
    List<Delivery> findAllWithOrderAndUser();
}
