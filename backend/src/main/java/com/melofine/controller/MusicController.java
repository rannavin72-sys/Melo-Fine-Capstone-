package com.melofine.controller;

import com.melofine.model.Song;
import com.melofine.service.MusicService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/music")
@RequiredArgsConstructor
public class MusicController {

    private final MusicService musicService;

    @GetMapping("/search")
    public ResponseEntity<List<Song>> search(@RequestParam String query) {
        return ResponseEntity.ok(musicService.searchSongs(query));
    }

    @GetMapping("/trending")
    public ResponseEntity<List<Song>> getTrending() {
        return ResponseEntity.ok(musicService.getTrendingSongs());
    }
}
