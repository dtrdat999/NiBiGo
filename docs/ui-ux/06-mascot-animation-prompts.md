# NiBiGo Mascot Animation Prompts

## 1. Ảnh tham chiếu nên cung cấp

Khi tạo ảnh động, nên cung cấp ít nhất hai ảnh.

### Bắt buộc

- Ảnh mascot chính: dùng ảnh mascot rõ và đúng nhận diện nhất, nền càng sạch càng tốt.
- Ảnh logo hoặc logo-mark: giúp giữ đúng nhận diện trên ngực và các chi tiết thương hiệu.

### Nếu có thì càng tốt

- Ảnh màu thương hiệu: xanh lá, trắng, be nhạt.
- Ảnh pose hoặc trạng thái khác: thinking, success, error để đồng bộ nhiều trạng thái.

## 2. Cách cung cấp ảnh cho công cụ tạo animation

Nếu dùng Flow, Gemini hoặc công cụ image-to-video:

1. Upload ảnh 1: mascot chính.
2. Upload ảnh 2: logo.
3. Upload ảnh 3 nếu cần: trạng thái tham chiếu.

Mô tả rõ vai trò của từng ảnh:

```text
Use Image 1 as the main mascot reference.
Use Image 2 as the logo reference for the chest emblem and brand identity.
Preserve the mascot’s exact identity, proportions, green-white palette, facial expression style, and glossy 3D toy-like rendering.
Do not redesign the character.
```

## 3. Prompt nền dùng chung

```text
Use Image 1 as the main mascot reference and Image 2 as the logo reference.

Create a cute looping animation of a friendly AI travel mascot for NiBiGo AI Planner. The mascot is a small glossy 3D robot with a white and green color palette, a dark green digital face, big expressive eyes, a small smiling mouth, a leaf sprout on top of its head, and a glowing chest logo based on the provided brand logo. Preserve the mascot’s exact identity, proportions, colors, face style, and logo.

Style: polished 3D, adorable, premium, soft lighting, toy-like, clean and modern, friendly for a travel AI product.

Background: minimal, soft pale green and white gradient, subtle shadow, a few floating leaves, small sparkles, clean UI-friendly composition.

Important:
- Keep the animation smooth and loopable
- Keep motion subtle and elegant
- Do not redesign the mascot
- Do not distort the chest logo
- Avoid extra limbs, warped hands, messy background, or unstable facial features
- Keep the camera mostly static and centered
```

## 4. Prompt cho từng trạng thái

### A. Default / Idle

Tên đầu ra đề xuất: `mascot-default.webm`

```text
Use Image 1 as the main mascot reference and Image 2 as the logo reference.

Create a seamless idle animation for this mascot. The robot stands centered, smiling gently. It softly blinks, slightly bobs up and down, and the small leaf sprout on its head gently bounces. Add subtle floating leaves and tiny sparkles around it. Keep the motion calm, charming, and premium. Minimal background, static camera, 5 seconds, perfect loop.
```

### B. Thinking

Tên đầu ra đề xuất: `mascot-thinking.webm`

```text
Use Image 1 as the main mascot reference and Image 2 as the logo reference.

Create a seamless “thinking” animation for this mascot. The robot looks thoughtful and adorable, with one hand near its chin. It blinks softly, tilts its head slightly, and its eyes move subtly as if processing information. A thought bubble with three dots appears and gently animates. The leaf sprout on top softly bounces. Keep the motion subtle, smart, and cute. Minimal pale green background, centered composition, 5 to 6 seconds, perfect loop.
```

### C. Loading 01

Tên đầu ra đề xuất: `mascot-loading-01.webm`

```text
Use Image 1 as the main mascot reference and Image 2 as the logo reference.

Create a seamless loading animation for this mascot. The robot is waiting while the AI generates a travel plan. It gently bounces, blinks, and gives a tiny friendly wave. A speech bubble beside it animates from one dot to two dots to three dots in a loop. Add a few floating leaves and soft sparkles. Keep the animation smooth, subtle, premium, and loopable. Static camera, clean background, 5 to 6 seconds.
```

### D. Loading 02

Tên đầu ra đề xuất: `mascot-loading-02.webm`

```text
Use Image 1 as the main mascot reference and Image 2 as the logo reference.

Create a seamless loading animation variation for this mascot. The robot holds a small travel map and looks at it briefly, then looks back forward. It blinks softly, gently bounces, and the leaf sprout on top moves lightly. A speech bubble with animated dots appears beside it. Add tiny floating travel-themed sparkles and leaves. Keep the animation cute, polished, and loopable. Minimal pale green background, centered composition, 5 to 6 seconds.
```

### E. Success

Tên đầu ra đề xuất: `mascot-success.webm`

```text
Use Image 1 as the main mascot reference and Image 2 as the logo reference.

Create a cute success animation for this mascot. The robot looks happy and proud, smiles brightly, blinks, and raises one hand in a cheerful gesture. A soft green check mark or heart icon appears in a speech bubble beside it. Add a few sparkles around the mascot. Keep the movement gentle, clean, and delightful. Minimal premium background, static camera, 4 to 5 seconds, loopable or end-clean.
```

### F. Error

Tên đầu ra đề xuất: `mascot-error.webm`

```text
Use Image 1 as the main mascot reference and Image 2 as the logo reference.

Create a cute error or confusion animation for this mascot. The robot looks slightly confused but still friendly and safe, with a small worried expression. It tilts its head, blinks, and makes a tiny unsure gesture with one hand. A speech bubble with a small exclamation mark or question mark appears beside it. Keep the emotion soft and not dramatic. Minimal pale green background, subtle floating leaves, premium UI-friendly style, 4 to 5 seconds, loopable.
```

## 5. Negative prompt

```text
Do not redesign the mascot, do not change the logo, no extra fingers, no extra limbs, no distorted face, no messy background, no sudden camera movement, no flickering, no unstable eyes, no low-quality render, no horror or sci-fi mood.
```

Nếu công cụ không có ô negative prompt, thêm đoạn này vào cuối prompt chính.

## 6. Câu khóa giữ đúng nhận diện

Luôn thêm:

```text
Preserve the mascot’s exact identity, face shape, eye style, body proportions, green-white color palette, leaf sprout, chest logo, and glossy 3D toy-like material.
```

Nếu thiếu yêu cầu này, công cụ có thể đổi khuôn mặt, logo, màu hoặc tỷ lệ nhân vật.

## 7. Quy chuẩn file đầu ra cho website

Đặt file tại:

```text
public/assets/brand/mascot/animations/
```

Ưu tiên:

- `WebM` nền trong suốt cho website.
- `MP4` làm bản dự phòng nếu công cụ không xuất WebM.
- Không chuyển video 3D thành JSON vì thường nặng và sai hình.

Danh sách file:

```text
mascot-default.webm
mascot-thinking.webm
mascot-loading-01.webm
mascot-loading-02.webm
mascot-success.webm
mascot-error.webm
```

## 8. Yêu cầu xuất video

- Tỷ lệ: vuông `1:1`.
- Kích thước khuyến nghị: `800×800` hoặc `1024×1024`.
- Camera tĩnh, mascot ở giữa và không bị cắt.
- Chuyển động chậm, ít biên độ, không rung.
- Loop không có điểm giật rõ.
- Nền trong suốt nếu công cụ hỗ trợ; nếu không, dùng nền xanh rất nhạt đồng nhất để dễ xử lý.
