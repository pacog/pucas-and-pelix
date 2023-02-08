export async function getVideoInput() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error(
            "Browser API navigator.mediaDevices.getUserMedia not available"
        );
    }
    const videoElement = document.getElementById("video") as HTMLVideoElement;
    if (!videoElement) {
        throw new Error("Video element not found");
    }
    const { width, height } = videoElement.getBoundingClientRect();

    const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
            facingMode: "user",
            width,
            height,
            frameRate: {
                ideal: 60,
            },
        },
    });
    videoElement.srcObject = stream;

    await new Promise((resolve) => {
        videoElement.onloadedmetadata = () => {
            resolve(true);
        };
    });
    videoElement.play();

    return {
        videoElement,
        containerSize: { width, height },
        contentSize: videoElement.srcObject.getTracks()[0].getSettings(),
    };
}
