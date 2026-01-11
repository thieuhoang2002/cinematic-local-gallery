import { MediaItem } from '../types';

const photos1 = [
  {
    "id": "2-tay-cầm-đồ-unwatermarked_gemini_generated_image_tinlv0tinlv0tinl.png",
    "title": "unwatermarked_Gemini_Generated_Image_tinlv0tinlv0tinl",
    "category": "2 Tay Cầm Đồ",
    "src": "/image/2 Tay Cầm Đồ/unwatermarked_Gemini_Generated_Image_tinlv0tinlv0tinl.png",
    "date": "2025-12-29",
    "type": "photo"
  },
  {
    "id": "mặc-đồ-tryon-4.png",
    "title": "tryon-4",
    "category": "Mặc đồ",
    "src": "/image/Mặc đồ/tryon-4.png",
    "date": "2025-12-29",
    "type": "photo"
  },
  {
    "id": "sáng-tạo-unwatermarked_gemini_generated_image_4ccmpy4ccmpy4ccm.png",
    "title": "unwatermarked_Gemini_Generated_Image_4ccmpy4ccmpy4ccm",
    "category": "Sáng tạo",
    "src": "/image/Sáng tạo/unwatermarked_Gemini_Generated_Image_4ccmpy4ccmpy4ccm.png",
    "date": "2025-12-29",
    "type": "photo"
  },
  {
    "id": "sáng-tạo-unwatermarked_gemini_generated_image_5xswju5xswju5xsw.png",
    "title": "unwatermarked_Gemini_Generated_Image_5xswju5xswju5xsw",
    "category": "Sáng tạo",
    "src": "/image/Sáng tạo/unwatermarked_Gemini_Generated_Image_5xswju5xswju5xsw.png",
    "date": "2025-12-29",
    "type": "photo"
  },
  {
    "id": "sáng-tạo-unwatermarked_gemini_generated_image_ov5lzgov5lzgov5l.png",
    "title": "unwatermarked_Gemini_Generated_Image_ov5lzgov5lzgov5l",
    "category": "Sáng tạo",
    "src": "/image/Sáng tạo/unwatermarked_Gemini_Generated_Image_ov5lzgov5lzgov5l.png",
    "date": "2025-12-29",
    "type": "photo"
  },
  {
    "id": "sáng-tạo-unwatermarked_gemini_generated_image_uoq02nuoq02nuoq0.png",
    "title": "unwatermarked_Gemini_Generated_Image_uoq02nuoq02nuoq0",
    "category": "Sáng tạo",
    "src": "/image/Sáng tạo/unwatermarked_Gemini_Generated_Image_uoq02nuoq02nuoq0.png",
    "date": "2025-12-29",
    "type": "photo"
  },
  {
    "id": "sáng-tạo-unwatermarked_gemini_generated_image_yaov7vyaov7vyaov.png",
    "title": "unwatermarked_Gemini_Generated_Image_yaov7vyaov7vyaov",
    "category": "Sáng tạo",
    "src": "/image/Sáng tạo/unwatermarked_Gemini_Generated_Image_yaov7vyaov7vyaov.png",
    "date": "2025-12-29",
    "type": "photo"
  },
  {
    "id": "sản-phẩm-unwatermarked_gemini_generated_image_ew9qtsew9qtsew9q.png",
    "title": "unwatermarked_Gemini_Generated_Image_ew9qtsew9qtsew9q",
    "category": "Sản phẩm",
    "src": "/image/Sản phẩm/unwatermarked_Gemini_Generated_Image_ew9qtsew9qtsew9q.png",
    "date": "2025-12-29",
    "type": "photo"
  }
] as MediaItem[];

export const photos = [...photos1] as MediaItem[];

const videos1 = [
  {
    "id": "capcut-damlechvaituarua.mp4",
    "title": "damlechvaituarua",
    "category": "CapCut",
    "src": "/video/CapCut/damlechvaituarua.mp4",
    "thumbnail": "/video/CapCut/damlechvaituarua.mp4",
    "date": "2025-12-29",
    "type": "video"
  }
] as MediaItem[];

export const videos = [...videos1] as MediaItem[];

export const mediaItems = [...photos, ...videos] as MediaItem[];
