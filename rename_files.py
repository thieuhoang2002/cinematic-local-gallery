import os
import re
from pathlib import Path
from unidecode import unidecode
import subprocess

def sanitize_filename(filename):
    """
    Chuyển tên file về dạng an toàn:
    - Bỏ dấu tiếng Việt
    - Thay dấu cách bằng underscore
    - Bỏ ký tự đặc biệt
    - Giữ nguyên extension
    """
    # Tách tên và extension
    name, ext = os.path.splitext(filename)
    
    # Bỏ dấu tiếng Việt
    name = unidecode(name)
    
    # Thay dấu cách và ký tự đặc biệt bằng underscore
    name = re.sub(r'[^\w\s-]', '_', name)
    name = re.sub(r'[-\s]+', '_', name)
    
    # Loại bỏ underscore thừa
    name = re.sub(r'_+', '_', name)
    name = name.strip('_')
    
    # Giới hạn độ dài tên file
    if len(name) > 100:
        name = name[:100]
    
    return name + ext.lower()

def rename_files_in_directory(directory):
    """Đổi tên tất cả file trong thư mục"""
    renamed_count = 0
    errors = []
    
    for root, dirs, files in os.walk(directory):
        for filename in files:
            old_path = Path(root) / filename
            
            # Bỏ qua file ẩn
            if filename.startswith('.'):
                continue
            
            new_filename = sanitize_filename(filename)
            
            # Nếu tên không thay đổi thì bỏ qua
            if new_filename == filename:
                continue
            
            new_path = Path(root) / new_filename
            
            # Kiểm tra file đã tồn tại chưa
            if new_path.exists():
                # Thêm số vào cuối nếu trùng
                name, ext = os.path.splitext(new_filename)
                counter = 1
                while new_path.exists():
                    new_filename = f"{name}_{counter}{ext}"
                    new_path = Path(root) / new_filename
                    counter += 1
            
            try:
                os.rename(old_path, new_path)
                print(f"✅ Renamed: {filename}")
                print(f"   -> {new_filename}")
                renamed_count += 1
            except Exception as e:
                error_msg = f"❌ Error renaming {filename}: {str(e)}"
                print(error_msg)
                errors.append(error_msg)
    
    return renamed_count, errors

def main():
    print("🔍 Scanning and renaming files with special characters...\n")
    
    # Đổi tên file trong thư mục image
    print("📁 Processing public/image...")
    image_renamed, image_errors = rename_files_in_directory('./public/image')
    
    # Đổi tên file trong thư mục video
    print("\n📁 Processing public/video...")
    video_renamed, video_errors = rename_files_in_directory('./public/video')
    
    total_renamed = image_renamed + video_renamed
    total_errors = len(image_errors) + len(video_errors)
    
    print(f"\n{'='*60}")
    print(f"📊 Summary:")
    print(f"   ✅ Total files renamed: {total_renamed}")
    print(f"   ❌ Total errors: {total_errors}")
    print(f"{'='*60}")
    
    if total_renamed > 0:
        print("\n🔄 Regenerating db.ts...")
        try:
            # Chạy generate_db.py để cập nhật database
            result = subprocess.run(['python', 'generate_db.py'], 
                                  capture_output=True, 
                                  text=True)
            print(result.stdout)
            if result.returncode == 0:
                print("✅ Database updated successfully!")
            else:
                print("❌ Error updating database:")
                print(result.stderr)
        except Exception as e:
            print(f"❌ Error running generate_db.py: {str(e)}")
    else:
        print("\n✅ No files needed renaming. Database is up to date.")
    
    if total_errors > 0:
        print("\n⚠️ Errors encountered:")
        for error in image_errors + video_errors:
            print(f"   {error}")

if __name__ == "__main__":
    main()
