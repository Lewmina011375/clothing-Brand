package com.onlinepharmacy.medicare.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Entity
@Table(name = "stickers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Sticker {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false)
    private String title;

    /**
     * Stored as a data URL (base64) or a remote URL.
     * This keeps the feature simple without multipart uploads.
     */
    @NotBlank
    @Lob
    @Column(nullable = false, columnDefinition = "NVARCHAR(MAX)")
    private String imageUrl;

    @NotNull
    @Column(nullable = false)
    @Builder.Default
    private Boolean published = true;

    @Column(length = 40)
    private String printMethod;
}

