# Astro Portfolio Project Requirements

## 1. Project Overview

Xây dựng một website portfolio bằng Astro.

Website có phong cách desktop tương tác, bao gồm:

- Loading screen khi truy cập lần đầu.
- Hiệu ứng chuyển từ loading screen sang màn hình chính.
- Header và footer cố định.
- Các component trong body có thể kéo thả.
- Nội dung chính được hiển thị trong một component dạng cửa sổ.
- Khu vực Works có danh sách project và popup chi tiết.

---

## 2. Technology

- Framework: Astro
- Language: TypeScript
- Styling: CSS hoặc Tailwind CSS
- Ưu tiên JavaScript tối thiểu.
- Không sử dụng framework UI khác như React, Vue hoặc Svelte nếu không thực sự cần thiết.
- Animation cần nhẹ, mượt và không ảnh hưởng nhiều đến hiệu năng.

---

## 3. Screen Flow

Luồng hiển thị chính của website:

```text
Initial Loading
    ↓
Loading Completed Screen
    ↓
Scroll Transition
    ↓
Main Screen
