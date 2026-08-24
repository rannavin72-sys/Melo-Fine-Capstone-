package com.melofine.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "songs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Song {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "youtube_video_id", nullable = false, unique = true, length = 50)
    private String youtubeVideoId;

    @Column(nullable = false, length = 500)
    private String title;

    @Column(nullable = false, length = 300)
    private String artist;

    @Column(name = "thumbnail_url", length = 1000)
    private String thumbnailUrl;

    @Column(length = 50)
    private String duration;

    @Column(name = "cached_at")
    private LocalDateTime cachedAt;

    @PrePersist
    protected void onCreate() {
        this.cachedAt = LocalDateTime.now();
    }
}
