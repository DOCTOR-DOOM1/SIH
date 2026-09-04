import cv2
import numpy as np
from typing import List, Dict

def analyze_bounding_boxes(blocks: List[Dict]) -> List[Dict]:
    """
    Takes blocks from Vision API and calculates bounding box properties
    like area, height, and relative prominence.
    """
    if not blocks:
        return []

    processed_blocks = []
    max_area = 0

    for block in blocks:
        vertices = block.get("vertices", [])
        if len(vertices) == 4:
            # Calculate width and height using Euclidean distance
            width = np.linalg.norm(np.array(vertices[0]) - np.array(vertices[1]))
            height = np.linalg.norm(np.array(vertices[1]) - np.array(vertices[2]))
            area = width * height
            
            if area > max_area:
                max_area = area

            processed_blocks.append({
                "text": block["text"],
                "width": round(width, 2),
                "height": round(height, 2),
                "area": round(area, 2)
            })

    # Add relative prominence (0 to 1) based on area
    for pb in processed_blocks:
        pb["prominence"] = round(pb["area"] / max_area, 3) if max_area > 0 else 0

    # Sort blocks by prominence (largest text first)
    processed_blocks.sort(key=lambda x: x["prominence"], reverse=True)
    return processed_blocks
