import { useEffect, useRef, useState } from "react";
import $ from "jquery";

const App = () => {
  const suuid = "MY_STREAM";
  const stream = new MediaStream();
  const videoElem = useRef(null);
  const divElem = useRef(null);

  const config = {
    iceServers: [
      {
        urls: ["stun:stun.l.google.com:19302"],
      },
    ],
  };

  const pc = new RTCPeerConnection(config);

  const log = (msg) => {
    if (divElem.current) {
      divElem.current.innerHTML += msg + "<br>";
    }
  };

  const handleNegotiationNeededEvent = async () => {
    let offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    getRemoteSdp();
  };

  const getCodecInfo = () => {
    $.get(`http://localhost:8083/stream/codec/${suuid}`, function (data) {
      try {
        data = JSON.parse(data);
      } catch (e) {
        console.log(e);
      } finally {
        $.each(data, function (index, value) {
          pc.addTransceiver(value.Type, {
            direction: "sendrecv",
          });
        });
      }
    });
  };

  const getRemoteSdp = () => {
    $.post(
      `http://localhost:8083/stream/receiver/${suuid}`,
      {
        suuid: suuid,
        data: btoa(pc.localDescription.sdp),
      },
      function (data) {
        try {
          pc.setRemoteDescription(
            new RTCSessionDescription({
              type: "answer",
              sdp: atob(data),
            })
          );
        } catch (e) {
          console.warn(e);
        }
      }
    );
  };

  useEffect(() => {
    $("#" + suuid).addClass("active");
    getCodecInfo();

    pc.onnegotiationneeded = handleNegotiationNeededEvent;

    pc.ontrack = function (event) {
      stream.addTrack(event.track);
      if (videoElem.current) {
        videoElem.current.srcObject = stream;
      }
      log(event.streams.length + " track is delivered");
    };

    pc.oniceconnectionstatechange = (e) => log(pc.iceConnectionState);
  }, [suuid, stream]);

  return (
    <div>
      <div ref={divElem}></div>
      <div>
        <div className="col">
          <input type="hidden" name="suuid" id="suuid" value="MY_STREAM" />
          {/* <input type="hidden" name="port" id="port" value=":8083" /> */}
          <input type="hidden" id="localSessionDescription" readOnly={true} />
          <input type="hidden" id="remoteSessionDescription" />
          <div id="remoteVideos">
            <video
              style={{ width: "600px" }}
              id="videoElem"
              ref={videoElem}
              autoPlay
              muted
              controls
            ></video>
          </div>
          <div id="div"></div>
        </div>
      </div>
    </div>
  );
};

export default App;
