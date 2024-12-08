import { Button, Platform, Text, View } from "react-native";
import * as FileSystem from "expo-file-system";
import * as DocumentPicker from "expo-document-picker";
import * as IntentLauncher from "expo-intent-launcher";
import * as Sharing from "expo-sharing";
import { StatusBar } from "expo-status-bar";

const BASE_URL = "http://10.0.2.2:3100";

const DOWNLOAD_API = `${BASE_URL}/download`;
const UPLOAD_MULTIPLE_API = `${BASE_URL}/upload-multiples`;
const UPLOAD_OCTET_API = `${BASE_URL}/upload-octet-stream`;

export default function App() {
  const showFile = async () => {
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

      const uri = `${FileSystem.cacheDirectory}${filename}`;

      await FileSystem.writeAsStringAsync(uri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      if (Platform.OS === "android") {
        const contentURL = await FileSystem.getContentUriAsync(uri);
        await IntentLauncher.startActivityAsync("android.intent.action.VIEW", {
          data: contentURL,
          flags: 1,
          type: contentType,
        });
      } else {
        await Sharing.shareAsync(uri);
      }
    };

    fr.readAsDataURL(blob);
  };

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

  const uploadFile = async () => {
    const files = await DocumentPicker.getDocumentAsync({ multiple: true });

    if (files.canceled) return;

    const formData = new FormData();

    files.assets.forEach((file) => {
      formData.append("files", {
        uri: file.uri,
        name: file.name,
        type: file.mimeType,
      });
    });

    const response = await fetch(UPLOAD_MULTIPLE_API, {
      method: "POST",
      body: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to upload file");
    }

    alert("File uploaded successfully");
  };

  const uploadOctetStream = async () => {
    const data = await DocumentPicker.getDocumentAsync();

    if (data.canceled) return;

    const file = data.assets[0];

    const headers = new Headers();
    headers.append("Content-Type", "application/octet-stream");
    headers.append("x-file-name", file.name);

    const response = await fetch(UPLOAD_OCTET_API, {
      method: "POST",
      body: file,
      headers,
    });

    if (!response.ok) throw new Error("Failed to upload file");

    alert("File uploaded successfully");
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#f8f8f8",
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

      <StatusBar style="auto" />
    </View>
  );
}
