package com.onlinepharmacy.medicare.repository;

import com.onlinepharmacy.medicare.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByCategory(Product.Category category);

    List<Product> findByNameContainingIgnoreCase(String name);
}

