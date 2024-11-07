class PeerService {
  constructor() {
    if (!this.peer) {
      this.peer = new RTCPeerConnection({
        iceServers: [
          {
            urls: [
              "stun:stun.l.google.com:19302",
              "stun:global.stun.twilio.com:3478",
            ],
          },
        ],
      });
    }
  }

  async getAnswer(offer) {
    if (this.peer && offer) {
      try {
        await this.peer.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await this.peer.createAnswer();
        await this.peer.setLocalDescription(answer); // No need for new RTCSessionDescription
        return answer;
      } catch (error) {
        console.error(
          "Error setting remote description or creating answer:",
          error
        );
        throw error;
      }
    } else {
      console.error("Invalid offer provided:", offer);
      throw new Error("Offer cannot be null or undefined");
    }
  }

  async getOffer() {
    if (this.peer) {
      const offer = await this.peer.createOffer();
      await this.peer.setLocalDescription(offer); // No need for new RTCSessionDescription
      return offer;
    }
  }

  async setRemoteDescription(answer) {
    if (this.peer) {
      if (answer) {
        try {
          await this.peer.setRemoteDescription(
            new RTCSessionDescription(answer)
          );
        } catch (error) {
          console.error("Error setting remote description:", error);
          throw error;
        }
      } else {
        console.error("Invalid answer provided:", answer);
        throw new Error("Answer cannot be null or undefined");
      }
    } else {
      console.error("RTCPeerConnection not initialized");
      throw new Error("RTCPeerConnection not initialized");
    }
  }
}

const peer = new PeerService();
export default peer;
