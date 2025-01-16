import LocalVideo from "./components/LocalVideo";

function App() {
  return (
    <div>
      <div>Below is the LocalVideo Component</div>
      <br />
      <div>
        We use deepch/RTSPtoWebRTC to convert source RTSP video to native
        browser WebRTC
      </div>
      <LocalVideo stream_server={"http://localhost:8083"} suuid={"MY_STREAM"} />
    </div>
  );
}

export default App;
