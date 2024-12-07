import "./App.css";

const BASE_URL = "http://10.0.2.2:3100";

const DOWNLOAD_API = `${BASE_URL}/download`;
const UPLOAD_MULTIPLE_API = `${BASE_URL}/upload-multiples`;
const UPLOAD_OCTET_API = `${BASE_URL}/upload-octet-stream`;

function App() {
  const downloadFile = async () => {
    const response = await fetch(DOWNLOAD_API);

    const blob = await response.blob();

    const contentDisposition = response.headers.get("Content-Disposition");

    const isInline = contentDisposition?.split(";")[0] === "inline";
    const filename = contentDisposition?.split("filename=")[1];

    const url = window.URL.createObjectURL(blob);

    if (isInline) {
      window.open(url, "_blank");
    } else {
      const a = document.createElement("a");
      a.href = url;
      a.download = filename || "file.txt";
      document.body.appendChild(a);
      a.click();
    }

    window.URL.revokeObjectURL(url);
  };

  const uploadFile = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.click();

    input.onchange = async (event) => {
      const files = (event as unknown as React.ChangeEvent<HTMLInputElement>)
        .target?.files;

      if (!files) return;

      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append("files", file);
      });

      const res = await fetch(UPLOAD_MULTIPLE_API, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      alert(JSON.stringify(data));
    };
  };

  const uploadOctetStream = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = false;
    input.click();

    input.onchange = async (event) => {
      const file = (event as unknown as React.ChangeEvent<HTMLInputElement>)
        .target?.files?.[0];

      if (!file) return;

      const headers = new Headers();
      headers.append("Content-Type", "application/octet-stream");
      headers.append("x-file-name", file.name);

      const res = await fetch(UPLOAD_OCTET_API, {
        method: "POST",
        headers,
        body: file,
      });

      const data = await res.json();

      alert(JSON.stringify(data));
    };
  };

  return (
    <div>
      <h1>File Transfer Apps - Web</h1>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          width: "100%",
          maxWidth: "300px",
          margin: "0 auto",
        }}
      >
        <button onClick={downloadFile}>Download file</button>
        <button onClick={uploadFile}>Upload file</button>
        <button onClick={uploadOctetStream}>Upload file as Octet Stream</button>
      </div>
    </div>
  );
}

export default App;
