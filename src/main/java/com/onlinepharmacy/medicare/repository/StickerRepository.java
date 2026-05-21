package com.onlinepharmacy.medicare.repository;

import com.onlinepharmacy.medicare.model.Sticker;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StickerRepository extends JpaRepository<Sticker, Long> {
    List<Sticker> findByPublishedTrueOrderByIdDesc();
}

