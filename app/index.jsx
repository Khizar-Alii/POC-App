import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { Link, useFocusEffect } from "expo-router";
import { Video } from "expo-av";
import * as MediaLibrary from "expo-media-library";
import { useCallback, useState, useRef } from "react";
import { Ionicons } from "@expo/vector-icons"; 

export default function Index() {
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const videoRefs = useRef({}); 

  // Fetch recorded videos from the app's album
  const fetchVideos = async () => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        console.log("Media library permission not granted.");
        return;
      }

      const album = await MediaLibrary.getAlbumAsync("MyAppVideos");
      if (!album) {
        console.log("Album not found.");
        return;
      }

      const media = await MediaLibrary.getAssetsAsync({
        album: album,
        mediaType: MediaLibrary.MediaType.video,
        sortBy: MediaLibrary.SortBy.creationTime,
      });

      setVideos(
        media.assets.map((asset) => ({ id: asset.id, uri: asset.uri }))
      );
    } catch (error) {
      console.error("Error fetching videos:", error);
    }
  };

  // Fetch videos every time the screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchVideos();
    }, [])
  );

  // Function to play/pause video on click
  const handleVideoPress = (id) => {
    setSelectedVideo(id);
    Object.values(videoRefs.current).forEach((video) => video?.pauseAsync());
    videoRefs.current[id]?.playAsync();
  };

  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: "#f5f5f5" }}>
      {/* Header */}
      <Text
        style={{
          fontSize: 24,
          fontWeight: "bold",
          textAlign: "center",
          marginBottom: 20,
          color: "#333",
        }}
      >
        🎥 Video Recorder App
      </Text>

      {/* Open Camera Button */}
      <Link href="/camera" asChild>
        <TouchableOpacity
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#007AFF",
            padding: 12,
            borderRadius: 10,
            marginBottom: 20,
          }}
        >
          <Ionicons
            name="camera"
            size={24}
            color="white"
            style={{ marginRight: 8 }}
          />
          <Text style={{ color: "white", fontSize: 16, fontWeight: "bold" }}>
            Open Camera
          </Text>
        </TouchableOpacity>
      </Link>

      {/* Recorded Videos Section */}
      <Text
        style={{
          fontSize: 20,
          fontWeight: "bold",
          color: "#333",
          marginBottom: 10,
        }}
      >
        🎬 Recorded Videos
      </Text>

      {videos.length === 0 ? (
        <Text
          style={{
            fontSize: 16,
            color: "#777",
            textAlign: "center",
            marginTop: 20,
          }}
        >
          No videos recorded yet
        </Text>
      ) : (
        <FlatList
          data={videos}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false} 
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => handleVideoPress(item.id)}
              style={{ marginBottom: 15 }}
            >
              <Video
                ref={(ref) => (videoRefs.current[item.id] = ref)}
                source={{ uri: item.uri }}
                style={{ width: "100%", height: 200, borderRadius: 10 }}
                resizeMode="cover"
                useNativeControls={selectedVideo === item.id} 
              />
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}
