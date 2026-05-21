package com.onlinepharmacy.medicare.repository;

import com.onlinepharmacy.medicare.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByUser_IdOrderByCreatedAtDesc(Long userId);

    @Query("SELECT DISTINCT o FROM Order o LEFT JOIN FETCH o.user u LEFT JOIN FETCH o.items i LEFT JOIN FETCH i.product p")
    List<Order> findAllWithItems();

    @Query("""
            SELECT DISTINCT o
            FROM Order o
            LEFT JOIN FETCH o.user u
            LEFT JOIN FETCH o.items i
            LEFT JOIN FETCH i.product p
            WHERE u.id = :userId
            ORDER BY o.createdAt DESC
            """)
    List<Order> findByUserIdWithItems(Long userId);

    @Query("""
            SELECT DISTINCT o
            FROM Order o
            LEFT JOIN FETCH o.user u
            LEFT JOIN FETCH o.items i
            LEFT JOIN FETCH i.product p
            WHERE o.id = :id
            """)
    Optional<Order> findByIdWithItemsAndUser(@Param("id") Long id);
}
