
export type SortOption = 
  | 'alphabet-asc'    // A → Z (mặc định)
  | 'alphabet-desc'   // Z → A
  | 'date-desc'       // Mới nhất trước
  | 'date-asc'        // Cũ nhất trước
  | 'views-desc'      // Nhiều view nhất
  | 'views-asc';      // Ít view nhất

export type MediaCategory = 
  | 'All'
  | '2 Tay Cầm Đồ'
  | 'CapCut'
  | 'Mặc đồ'
  | 'Sáng tạo'
  | 'Sản phẩm';

export interface MediaItem {
  id: string;
  title: string;
  category: MediaCategory;
  src: string;
  date: string;
  type: 'photo' | 'video';
  thumbnail?: string; // For videos
  tags?: string[];
  views?: number; // View count
}

export interface AppState {
  view: 'photos' | 'videos';
  searchQuery: string;
  selectedCategory: MediaCategory;
}
