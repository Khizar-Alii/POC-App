import { CameraView } from "expo-camera";
import { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
  Dimensions,
} from "react-native";
import * as MediaLibrary from "expo-media-library";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function CameraScreen() {
  const cameraRef = useRef(null);
  const [recording, setRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [cameraFacing, setCameraFacing] = useState("back");
  const router = useRouter();
  let timer;

  // Get screen dimensions
  const { width: screenWidth } = Dimensions.get("window");
  const cameraHeight = Math.round((screenWidth * 16) / 9); // Adjust aspect ratio (16:9)

  useEffect(() => {
    return () => {
      if (timer) clearInterval(timer);
    };
  }, []);

  const toggleCameraFacing = () => {
    if (recording) {
      Alert.alert("Cannot switch camera", "Stop recording before switching.");
      return;
    }
    setCameraFacing((prev) => (prev === "back" ? "front" : "back"));
  };

  const startRecording = async () => {
    if (!cameraRef.current) return;

    setRecording(true);
    setRecordTime(0);

    timer = setInterval(() => setRecordTime((prev) => prev + 1), 1000);

    try {
      const video = await cameraRef.current.recordAsync();
      clearInterval(timer);

      if (video?.uri) {
        await saveVideo(video.uri);
      }
    } catch (error) {
      console.error("Recording error:", error);
    } finally {
      setRecording(false);
      router.back();
    }
  };

  const stopRecording = () => {
    if (cameraRef.current) {
      setShowModal(true); // Show confirmation modal
    }
  };

  const confirmStopRecording = () => {
    setShowModal(false);
    if (cameraRef.current) {
      cameraRef.current.stopRecording();
    }
  };

  const saveVideo = async (uri) => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "You must allow access to save the video.",
          [{ text: "OK", onPress: () => router.back() }]
        );
        return;
      }

      const asset = await MediaLibrary.createAssetAsync(uri);
      const albumName = "MyAppVideos";
      let album = await MediaLibrary.getAlbumAsync(albumName);

      if (!album) {
        await MediaLibrary.createAlbumAsync(albumName, asset, false);
      } else {
        await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
      }
    } catch (error) {
      console.error("Error saving video:", error);
    }
  };

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        mode="video"
        facing={cameraFacing}
        style={[styles.camera, { width: screenWidth, height: cameraHeight }]} 
        resizeMode="cover" 
        zoom={0}
      >
        {/* Switch Camera Button */}
        <TouchableOpacity
          style={styles.switchCameraButton}
          onPress={toggleCameraFacing}
        >
          <Ionicons name="camera-reverse" size={32} color="white" />
        </TouchableOpacity>

        {/* Recording Timer */}
        {recording && (
          <View style={styles.timerContainer}>
            <Ionicons name="videocam" size={24} color="red" />
            <Text style={styles.timerText}>{recordTime}s</Text>
          </View>
        )}

        {/* Record Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.recordButton}
            onPress={recording ? stopRecording : startRecording}
          >
            <Ionicons
              name={recording ? "stop-circle" : "radio-button-on"}
              size={64}
              color="white"
            />
          </TouchableOpacity>
        </View>
      </CameraView>

      {/* Stop Recording Confirmation Modal */}
      <Modal transparent={true} visible={showModal} animationType="fade">
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Stop Recording?</Text>
            <Text style={styles.modalMessage}>
              Do you want to stop the recording?
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.denyButton}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.allowButton}
                onPress={confirmStopRecording}
              >
                <Text style={styles.buttonText}>Stop</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  camera: {
    flex: 1,
    alignSelf: 'center'
  },

  // Switch Camera Button
  switchCameraButton: {
    position: "absolute",
    top: 40,
    right: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 10,
    borderRadius: 20,
  },

  // Timer
  timerContainer: {
    position: "absolute",
    top: 50,
    left: "50%",
    transform: [{ translateX: -50 }],
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
  },
  timerText: { color: "white", fontSize: 18, marginLeft: 5 },

  // Record Button
  buttonContainer: {
    position: "absolute",
    bottom: 50,
    alignSelf: "center",
  },
  recordButton: {
    backgroundColor: "rgba(255,0,0,0.8)",
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },

  // Modal Styles
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContainer: {
    width: 300,
    padding: 20,
    backgroundColor: "white",
    borderRadius: 15,
    alignItems: "center",
  },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  modalMessage: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  denyButton: {
    backgroundColor: "gray",
    padding: 10,
    borderRadius: 10,
    flex: 1,
    margin: 5,
  },
  allowButton: {
    backgroundColor: "red",
    padding: 10,
    borderRadius: 10,
    flex: 1,
    margin: 5,
  },
  buttonText: { textAlign: "center", color: "white", fontSize: 16 },
});
