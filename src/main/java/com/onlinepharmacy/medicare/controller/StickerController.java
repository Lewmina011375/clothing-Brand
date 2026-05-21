package com.onlinepharmacy.medicare.controller;

import com.onlinepharmacy.medicare.model.Sticker;
import com.onlinepharmacy.medicare.repository.StickerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stickers")
@RequiredArgsConstructor
public class StickerController {

    private final StickerRepository stickerRepository;

    @GetMapping
    public List<Sticker> list(@RequestParam(defaultValue = "true") boolean publishedOnly) {
        if (publishedOnly) {
            return stickerRepository.findByPublishedTrueOrderByIdDesc();
        }
        return stickerRepository.findAll();
    }

    @PostMapping
    public Sticker create(@RequestBody Sticker sticker) {
        sticker.setId(null);
        return stickerRepository.save(sticker);
    }

    @PutMapping("/{id}")
    public Sticker update(@PathVariable Long id, @RequestBody Sticker sticker) {
        sticker.setId(id);
        return stickerRepository.save(sticker);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        stickerRepository.deleteById(id);
    }
}

