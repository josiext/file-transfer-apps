import { Button, StyleSheet, Text, View } from "react-native";
import * as FileSystem from "expo-file-system";

const BASE_URL = "https://slope-seeing-daily-competent.trycloudflare.com";

const DOWNLOAD_API = `${BASE_URL}/download`;
const UPLOAD_MULTIPLE_API = `${BASE_URL}/upload-multiples`;
const UPLOAD_OCTET_API = `${BASE_URL}/upload-octet-stream`;

export default function App() {
  const showFile = async () => {};

  const downloadFile = async () => {
    const response = await fetch(DOWNLOAD_API);

    if (!response.ok) {
      throw new Error("Failed to download file");
    }

    const blob = await response.blob();

    const filename =
      response.headers.get("Content-Disposition")?.split("=")[1] ||
      "unknown.txt";

    const fr = new FileReader();
    fr.onload = async () => {
      const contentType = response.headers.get("Content-Type") || "text/plain";

      if (typeof fr.result !== "string") {
        throw new Error("FileReader result is not a string");
      }

      const base64 = fr.result.split(",")[1];

      const permissions =
        await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

      if (!permissions.granted) return alert("Permission denied");

      const uri = await FileSystem.StorageAccessFramework.createFileAsync(
        permissions.directoryUri,
        filename,
        contentType
      );

      await FileSystem.writeAsStringAsync(uri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });
    };

    fr.readAsDataURL(blob);
  };

  const uploadFile = async () => {};

  const uploadOctetStream = async () => {};

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
        gap: 40,
      }}
    >
      <Text style={{ fontSize: 24, fontWeight: "bold" }}>
        File Transfers Mobile
      </Text>

      <View
        style={{
          justifyContent: "center",
          alignItems: "center",
          gap: 16,
        }}
      >
        <Button title="Show File" onPress={showFile} />
        <Button title="Download File" onPress={downloadFile} />
        <Button title="Upload File" onPress={uploadFile} />
        <Button
          title="Upload File as Octet Stream"
          onPress={uploadOctetStream}
        />
      </View>
    </View>
  );
}
