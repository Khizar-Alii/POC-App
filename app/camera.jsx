import { CameraView } from "expo-camera";
import { useState, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import { useRouter } from "expo-router";

export default function CameraScreen() {
  const cameraRef = useRef(null);
  const [recording, setRecording] = useState(false);
  const router = useRouter();

  const startRecording = async () => {
    if (cameraRef.current) {
      setRecording(true);
      console.log("Starting recording...");
      const video = await cameraRef.current.recordAsync();

      if (video?.uri) {
        console.log("Video recorded at:", video.uri);
        await saveVideo(video.uri);
      }

      setRecording(false);
      router.back(); // Return to home screen after recording
    }
  };

  const stopRecording = async () => {
    if (cameraRef.current) {
      console.log("Stopping recording...");
      cameraRef.current.stopRecording();
    }
  };

  const saveVideo = async (uri) => {
    try {
      // Request media library permissions
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        console.log("Media Library permission not granted.");
        return;
      }

      // Save video to Media Library
      const asset = await MediaLibrary.createAssetAsync(uri);

      // Create or find the album
      const albumName = "MyAppVideos"; // Change this to your app's name
      let album = await MediaLibrary.getAlbumAsync(albumName);

      if (!album) {
        album = await MediaLibrary.createAlbumAsync(albumName, asset, false);
      } else {
        await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
      }

      console.log("Video saved to album:", albumName);
    } catch (error) {
      console.error("Error saving video:", error);
    }
  };

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        mode="video"
        facing="back"
        style={styles.camera}
      >
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={recording ? stopRecording : startRecording}
          >
            <Text style={styles.text}>
              {recording ? "Stop Recording" : "Start Recording"}
            </Text>
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center" },
  camera: { flex: 1 },
  buttonContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  button: { padding: 15, backgroundColor: "red", borderRadius: 5 },
  text: { fontSize: 18, color: "white" },
});
