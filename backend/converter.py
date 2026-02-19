import os
import tempfile
from pathlib import Path
from PIL import Image
import tifffile
import numpy as np
import imagecodecs

# Ensure large images can be opened
Image.MAX_IMAGE_PIXELS = None

def convert_jp2_to_jpeg(input_path: str, output_path: str, quality: int = 90):
    """
    Converts a JP2 file to a standardized JPEG.
    """
    try:
        try:
            with Image.open(input_path) as img:
                if img.mode in ("RGBA", "P"):
                    img = img.convert("RGB")
                img.save(output_path, "JPEG", quality=quality, optimize=True)
        except Exception:
            # Fallback to imagecodecs if Pillow fails to read JP2 (common on some builds)
            data = imagecodecs.imread(input_path)
            img = Image.fromarray(data)
            if img.mode != 'RGB':
                img = img.convert('RGB')
            img.save(output_path, "JPEG", quality=quality, optimize=True)
            
        return output_path
    except Exception as e:
        raise RuntimeError(f"Failed to convert to JPEG: {str(e)}")

def convert_jp2_to_pyramidal_tiff(input_path: str, output_path: str, tile_size: int = 256):
    """
    Converts a JP2 file to a Pyramidal OME-TIFF style or Generic Tiled Pyramidal TIFF.
    Uses tifffile to write generating sub-resolutions.
    """
    try:
        # Try reading with Pillow first, then imagecodecs
        try:
            with Image.open(input_path) as img:
               if img.mode == 'P':
                   img = img.convert('RGB')
               base_image = np.array(img)
        except Exception:
            base_image = imagecodecs.imread(input_path)
            
        # Ensure we have a valid array
        if base_image.ndim == 2:
            # Grayscale to RGB? Or keep grayscale. 
            # If we want generic viewer support, RGB is safer or Grayscale is fine.
            pass
        elif base_image.ndim == 3 and base_image.shape[2] > 3:
            # Drop alpha for TIFF if complexity is high? 
            # Actually TIFF supports Alpha but JPEG compression in TIFF might not.
            # Convert to RGB if alpha exists for JPEG compression compatibility
            if base_image.shape[2] == 4:
                base_image = base_image[..., :3]
            
        # Generate pyramid levels (downsampling by 2 until smallest dimension < tile_size)
        levels = []
        current_image = base_image
        
        h, w = current_image.shape[:2]
        
        # Original Image
        levels.append(current_image)
        
        while h > tile_size and w > tile_size:
            # Downsample by 2
            # Use Pillow for high quality resize
            pil_img = Image.fromarray(current_image)
            new_size = (max(1, w // 2), max(1, h // 2))
            
            pil_img = pil_img.resize(new_size, Image.Resampling.LANCZOS)
            current_image = np.array(pil_img)
            h, w = current_image.shape[:2]
            levels.append(current_image)

        # Write to TIFF
        options = dict(
            tile=(tile_size, tile_size),
            compression='jpeg',
            metadata={'axes': 'YXS' if base_image.ndim == 3 else 'YX'}
        )
        
        with tifffile.TiffWriter(output_path, bigtiff=True) as tif:
            # Write the main image and point to subsequent levels as subifds
            tif.write(
                levels[0],
                subifds=int(len(levels)-1),
                **options
            )
            
            # Write subsequent levels
            for level in levels[1:]:
                tif.write(
                    level,
                    **options
                )
                
        return output_path

    except Exception as e:
        raise RuntimeError(f"Failed to convert to Pyramidal TIFF: {str(e)}")
