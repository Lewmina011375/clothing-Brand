package com.onlinepharmacy.medicare.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "products")
@JsonIgnoreProperties(ignoreUnknown = true)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {

    public enum Category {
        WOMEN, MEN, UNISEX
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false)
    private String name;

    @Column(length = 1000)
    private String description;

    @Enumerated(EnumType.STRING)
    private Category category;

    @NotNull
    @DecimalMin("0.01")
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @NotNull
    @Column(nullable = false)
    private Integer stockQuantity;

    // Stored as base64 data URL (data:image/...;base64,...) or a remote URL.
    // Must be large enough for base64 uploads coming from ImageUpload3D.
    @Lob
    @Column(nullable = true, columnDefinition = "NVARCHAR(MAX)")
    private String imageUrl;
}

