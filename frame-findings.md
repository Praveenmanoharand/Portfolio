# Uploaded frame findings

The archive contains two JPEG frame images plus the source MP4. The implementation must use the still frames, not an HTML video element. Both supplied frames are 1536 × 1024 (3:2), warm cinematic portraits of the same subject in a dark interior with orange window light. Frame `1000252027.png_202608301933.jpeg` shows the subject looking up/right; frame `1000252028.png_202608301933.jpeg` shows the subject looking down. Preserve the 3:2 ratio, use `object-fit: contain` or an equivalent composition-safe canvas, and map scroll progress across the two supplied endpoints without cropping or stretching.

Because only two extracted frames are present, the scroll controller should still support an arbitrary frame array so additional frames can be dropped in later without changing the playback logic. Preload both images, draw the current frame with requestAnimationFrame, and keep the animation viewport sticky only within the hero frame section.
