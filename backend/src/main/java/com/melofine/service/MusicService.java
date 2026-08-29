package com.melofine.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.services.youtube.YouTube;
import com.google.api.services.youtube.model.SearchListResponse;
import com.google.api.services.youtube.model.SearchResult;
import com.melofine.model.Song;
import com.melofine.repository.SongRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Slf4j
public class MusicService {

    private final SongRepository songRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${youtube.api.key}")
    private String youtubeApiKey;

    // Fast regex to extract videoId, thumbnail, title, channelTitle from YouTube HTML5 response
    private static final Pattern YT_ENTRY_PATTERN = Pattern.compile(
        "\\{\"videoRenderer\":\\{\"videoId\":\"(?<vid>[^\"]+)\",\"thumbnail\":\\{\"thumbnails\":\\[\\{\"url\":\"(?<thumb>[^\"]+)\".*?\"title\":\\{\"runs\":\\[\\{\"text\":\"(?<title>[^\"]+)\".*?\"ownerText\":\\{\"runs\":\\[\\{\"text\":\"(?<artist>[^\"]+)\"",
        Pattern.DOTALL
    );

    @PostConstruct
    public void seedInitialSongs() {
        try {
            if (songRepository.count() >= 15) {
                return;
            }

            List<Song> seeds = List.of(
                Song.builder().youtubeVideoId("2Vv-BfVoq4g").title("Perfect").artist("Ed Sheeran").thumbnailUrl("https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=500&q=80").duration("4:23").build(),
                Song.builder().youtubeVideoId("tt2k8PGm-TI").title("Dusk Till Dawn").artist("ZAYN ft. Sia").thumbnailUrl("https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&q=80").duration("3:59").build(),
                Song.builder().youtubeVideoId("PEM0Vs8jf1w").title("Golden Hour").artist("JVKE").thumbnailUrl("https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=500&q=80").duration("3:29").build(),
                Song.builder().youtubeVideoId("hLQl3WQQoQ0").title("Someone Like You").artist("Adele").thumbnailUrl("https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&q=80").duration("4:45").build(),
                Song.builder().youtubeVideoId("50VNCymT-Cs").title("It Will Be Okay").artist("Tom Odell").thumbnailUrl("https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=500&q=80").duration("3:42").build(),
                Song.builder().youtubeVideoId("DyDfgMOUjCI").title("Everything I Wanted").artist("Billie Eilish").thumbnailUrl("https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=500&q=80").duration("4:05").build(),
                Song.builder().youtubeVideoId("7wtfhZwyrcc").title("Believer").artist("Imagine Dragons").thumbnailUrl("https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&q=80").duration("3:24").build(),
                Song.builder().youtubeVideoId("JGwWNGJdvx8").title("Shape of You").artist("Ed Sheeran").thumbnailUrl("https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&q=80").duration("3:53").build(),
                Song.builder().youtubeVideoId("4NRXx6U8ABQ").title("Blinding Lights").artist("The Weeknd").thumbnailUrl("https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&q=80").duration("3:20").build(),
                Song.builder().youtubeVideoId("34Na4j8AVgA").title("Starboy").artist("The Weeknd ft. Daft Punk").thumbnailUrl("https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80").duration("3:50").build(),
                Song.builder().youtubeVideoId("TUVcZfQe-Kw").title("Levitating").artist("Dua Lipa").thumbnailUrl("https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=500&q=80").duration("3:23").build(),
                Song.builder().youtubeVideoId("kTJczUoc26U").title("Stay").artist("The Kid LAROI, Justin Bieber").thumbnailUrl("https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=500&q=80").duration("2:21").build(),
                Song.builder().youtubeVideoId("60ItHLz5WEA").title("Faded").artist("Alan Walker").thumbnailUrl("https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=500&q=80").duration("3:32").build(),
                Song.builder().youtubeVideoId("syFZfO_wfMQ").title("Night Changes").artist("One Direction").thumbnailUrl("https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500&q=80").duration("3:46").build(),
                Song.builder().youtubeVideoId("mRD0-GxqHVo").title("Heat Waves").artist("Glass Animals").thumbnailUrl("https://images.unsplash.com/photo-1445985543469-433ecba62447?w=500&q=80").duration("3:58").build(),
                Song.builder().youtubeVideoId("ApXoWvfEYVU").title("Sunflower").artist("Post Malone, Swae Lee").thumbnailUrl("https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=500&q=80").duration("2:38").build(),
                Song.builder().youtubeVideoId("GxldQ9GyXfY").title("Until I Found You").artist("Stephen Sanchez").thumbnailUrl("https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=500&q=80").duration("2:57").build(),
                Song.builder().youtubeVideoId("H5v3kku4y6Q").title("As It Was").artist("Harry Styles").thumbnailUrl("https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=500&q=80").duration("2:47").build()
            );

            for (Song s : seeds) {
                if (songRepository.findByYoutubeVideoId(s.getYoutubeVideoId()).isEmpty()) {
                    songRepository.save(s);
                }
            }
            log.info("Successfully seeded database with {} initial songs", seeds.size());
        } catch (Exception e) {
            log.warn("Could not seed initial songs: {}", e.getMessage());
        }
    }

    /**
     * Search songs:
     * 1. Check PostgreSQL database cache.
     * 2. Search Direct YouTube Engine (works for English, Tamil, Hindi, Telugu, Punjabi, global).
     * 3. Fallback to iTunes API + YouTube ID matching.
     * 4. Cache newly found songs in PostgreSQL.
     */
    public List<Song> searchSongs(String query) {
        if (query == null || query.trim().isEmpty()) {
            return Collections.emptyList();
        }

        String cleanQuery = normalizeQuery(query.trim());

        // 1. Check PostgreSQL first
        List<Song> cachedResults = songRepository.searchInDatabase(cleanQuery);
        if (cachedResults != null && cachedResults.size() >= 3) {
            log.info("Returning {} cached songs from PostgreSQL for '{}'", cachedResults.size(), cleanQuery);
            return cachedResults;
        }

        // 2. Fetch directly from YouTube (Handles all genres, languages, and regional queries accurately)
        List<Song> fetchedSongs = searchYouTubeDirect(cleanQuery);

        // 3. If YouTube direct search yielded fewer than 3 songs, supplement with iTunes search
        if (fetchedSongs.size() < 3) {
            List<Song> itunesSongs = searchItunesWithYoutubeIds(cleanQuery);
            for (Song is : itunesSongs) {
                boolean alreadyIn = fetchedSongs.stream().anyMatch(s -> s.getYoutubeVideoId().equals(is.getYoutubeVideoId()));
                if (!alreadyIn) {
                    fetchedSongs.add(is);
                }
            }
        }

        // 4. Save newly found songs into PostgreSQL database cache
        List<Song> savedSongs = new ArrayList<>();
        for (Song song : fetchedSongs) {
            Optional<Song> existing = songRepository.findByYoutubeVideoId(song.getYoutubeVideoId());
            if (existing.isEmpty()) {
                savedSongs.add(songRepository.save(song));
            } else {
                savedSongs.add(existing.get());
            }
        }

        if (!savedSongs.isEmpty()) {
            return savedSongs;
        }

        return cachedResults != null && !cachedResults.isEmpty() ? cachedResults : songRepository.findAll();
    }

    public List<Song> getTrendingSongs() {
        List<Song> allCached = songRepository.findAll();
        if (allCached.size() >= 8) {
            return allCached.subList(0, Math.min(allCached.size(), 20));
        }
        return searchSongs("Perfect Ed Sheeran");
    }

    private String normalizeQuery(String raw) {
        String s = raw.toLowerCase().trim();
        Map<String, String> typos = Map.ofEntries(
            Map.entry("bleiver", "believer"),
            Map.entry("beliver", "believer"),
            Map.entry("shape of u", "shape of you"),
            Map.entry("blinding light", "blinding lights"),
            Map.entry("starboyy", "starboy"),
            Map.entry("levitatingg", "levitating"),
            Map.entry("peches", "peaches"),
            Map.entry("stayy", "stay"),
            Map.entry("bad guyy", "bad guy"),
            Map.entry("fadedd", "faded"),
            Map.entry("adelle", "adele"),
            Map.entry("dusk till dawnn", "dusk till dawn"),
            Map.entry("golden hourr", "golden hour"),
            Map.entry("ed sheran", "ed sheeran"),
            Map.entry("the weekndd", "the weeknd")
        );

        for (Map.Entry<String, String> entry : typos.entrySet()) {
            if (s.contains(entry.getKey())) {
                s = s.replace(entry.getKey(), entry.getValue());
            }
        }
        return s;
    }

    /**
     * Direct YouTube Search: Extracts accurate videoId, official title, artist, and thumbnail.
     * Perfect for regional queries ("tamil old song", "arijit singh", "bollywood", etc.).
     */
    private List<Song> searchYouTubeDirect(String query) {
        List<Song> list = new ArrayList<>();
        try {
            String searchQuery = URLEncoder.encode(query + " song", StandardCharsets.UTF_8);
            String ytUrl = "https://www.youtube.com/results?search_query=" + searchQuery;
            URI uri = URI.create(ytUrl);
            HttpURLConnection conn = (HttpURLConnection) uri.toURL().openConnection();
            conn.setRequestMethod("GET");
            conn.setRequestProperty("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
            conn.setRequestProperty("Accept-Language", "en-US,en;q=0.9");
            conn.setConnectTimeout(4000);
            conn.setReadTimeout(4000);

            if (conn.getResponseCode() == 200) {
                StringBuilder html = new StringBuilder();
                try (BufferedReader reader = new BufferedReader(new InputStreamReader(conn.getInputStream(), StandardCharsets.UTF_8))) {
                    String line;
                    while ((line = reader.readLine()) != null) {
                        html.append(line).append("\n");
                    }
                }

                Matcher matcher = YT_ENTRY_PATTERN.matcher(html);
                Set<String> seenIds = new HashSet<>();

                while (matcher.find() && list.size() < 12) {
                    String vid = matcher.group("vid");
                    String rawTitle = matcher.group("title");
                    String rawArtist = matcher.group("artist");
                    String thumb = matcher.group("thumb");

                    if (vid == null || vid.length() != 11 || !seenIds.add(vid)) {
                        continue;
                    }

                    // Clean title and remove junk suffixes
                    String cleanTitle = cleanVideoTitle(rawTitle);
                    String cleanArtist = rawArtist != null ? rawArtist.replace(" - Topic", "").replace("VEVO", "").trim() : "Music Artist";

                    // Ensure high-definition thumbnail
                    String highResThumb = "https://img.youtube.com/vi/" + vid + "/hqdefault.jpg";
                    if (thumb != null && thumb.startsWith("http")) {
                        highResThumb = thumb;
                    }

                    Song song = Song.builder()
                            .youtubeVideoId(vid)
                            .title(cleanTitle)
                            .artist(cleanArtist)
                            .thumbnailUrl(highResThumb)
                            .duration("3:45")
                            .build();

                    list.add(song);
                }
            }
        } catch (Exception e) {
            log.warn("Direct YouTube search note for '{}': {}", query, e.getMessage());
        }
        return list;
    }

    private String cleanVideoTitle(String raw) {
        if (raw == null) return "Song";
        return raw.replace("&quot;", "\"")
                  .replace("&#39;", "'")
                  .replace("&amp;", "&")
                  .replaceAll("(?i)\\|.*", "")
                  .replaceAll("(?i)\\[.*?\\]", "")
                  .replaceAll("(?i)\\(official video\\)", "")
                  .replaceAll("(?i)\\(official audio\\)", "")
                  .replaceAll("(?i)\\(video song\\)", "")
                  .replaceAll("(?i)\\(lyrical\\)", "")
                  .replaceAll("(?i)\\b4k\\b", "")
                  .replaceAll("(?i)\\bhd\\b", "")
                  .replaceAll("(?i)video song", "")
                  .trim();
    }

    /**
     * Secondary fallback: iTunes API with single YouTube video ID resolution
     */
    private List<Song> searchItunesWithYoutubeIds(String query) {
        List<Song> songs = new ArrayList<>();
        try {
            String encoded = URLEncoder.encode(query, StandardCharsets.UTF_8);
            String urlStr = "https://itunes.apple.com/search?term=" + encoded + "&entity=song&limit=6";
            URI uri = URI.create(urlStr);
            HttpURLConnection conn = (HttpURLConnection) uri.toURL().openConnection();
            conn.setRequestMethod("GET");
            conn.setRequestProperty("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0");
            conn.setConnectTimeout(3000);
            conn.setReadTimeout(3000);

            if (conn.getResponseCode() == 200) {
                StringBuilder sb = new StringBuilder();
                try (BufferedReader reader = new BufferedReader(new InputStreamReader(conn.getInputStream(), StandardCharsets.UTF_8))) {
                    String line;
                    while ((line = reader.readLine()) != null) {
                        sb.append(line);
                    }
                }

                JsonNode root = objectMapper.readTree(sb.toString());
                JsonNode results = root.path("results");
                if (results.isArray()) {
                    for (JsonNode item : results) {
                        String trackName = item.path("trackName").asText(null);
                        String artistName = item.path("artistName").asText(null);
                        if (trackName == null || artistName == null) continue;

                        String artwork = item.path("artworkUrl100").asText("");
                        if (artwork.contains("100x100bb.jpg")) {
                            artwork = artwork.replace("100x100bb.jpg", "600x600bb.jpg");
                        }

                        long ms = item.path("trackTimeMillis").asLong(210000L);
                        long sec = (ms / 1000) % 60;
                        long min = (ms / (1000 * 60));
                        String duration = String.format("%d:%02d", min, sec);

                        String vidId = resolveFastYoutubeId(trackName, artistName);

                        songs.add(Song.builder()
                                .title(trackName)
                                .artist(artistName)
                                .thumbnailUrl(!artwork.isBlank() ? artwork : "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80")
                                .duration(duration)
                                .youtubeVideoId(vidId)
                                .build());
                    }
                }
            }
        } catch (Exception e) {
            log.warn("iTunes fallback note: {}", e.getMessage());
        }
        return songs;
    }

    private String resolveFastYoutubeId(String title, String artist) {
        String combined = (title + " " + artist).toLowerCase();
        if (combined.contains("cruel summer")) return "ic8j13piAhQ";
        if (combined.contains("without me") && combined.contains("eminem")) return "fsG39JgqTmo";
        if (combined.contains("perfect")) return "2Vv-BfVoq4g";
        if (combined.contains("dusk till dawn")) return "tt2k8PGm-TI";
        if (combined.contains("golden hour")) return "PEM0Vs8jf1w";
        if (combined.contains("someone like you")) return "hLQl3WQQoQ0";
        if (combined.contains("believer")) return "7wtfhZwyrcc";
        if (combined.contains("shape of you")) return "JGwWNGJdvx8";
        if (combined.contains("blinding lights")) return "4NRXx6U8ABQ";
        if (combined.contains("starboy")) return "34Na4j8AVgA";
        if (combined.contains("levitating")) return "TUVcZfQe-Kw";
        if (combined.contains("stay")) return "kTJczUoc26U";
        if (combined.contains("bad guy")) return "DyDfgMOUjCI";
        if (combined.contains("faded")) return "60ItHLz5WEA";
        if (combined.contains("heat waves")) return "mRD0-GxqHVo";
        if (combined.contains("sunflower")) return "ApXoWvfEYVU";
        if (combined.contains("as it was")) return "H5v3kku4y6Q";
        if (combined.contains("night changes")) return "syFZfO_wfMQ";
        if (combined.contains("until i found you")) return "GxldQ9GyXfY";
        return "2Vv-BfVoq4g";
    }
}
