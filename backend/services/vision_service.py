import os
from google.cloud import vision

# Set the credential env var for Google Cloud Vision API
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = os.path.join(os.path.dirname(os.path.dirname(__file__)), "credentials.json")

def extract_text_and_boxes(image_content: bytes):
    """
    Extracts text and bounding polygons using Google Cloud Vision API.
    Returns the raw text and a list of blocks with their text and bounding box.
    """
    try:
        client = vision.ImageAnnotatorClient()
        image = vision.Image(content=image_content)
        
        response = client.document_text_detection(image=image)
        if response.error.message:
            raise Exception(f"{response.error.message}")
            
        full_text = response.full_text_annotation.text
        blocks_data = []
        
        for page in response.full_text_annotation.pages:
            for block in page.blocks:
                block_text = ""
                for paragraph in block.paragraphs:
                    for word in paragraph.words:
                        word_text = "".join([symbol.text for symbol in word.symbols])
                        block_text += word_text + " "
                
                # Get bounding box vertices
                vertices = [(v.x, v.y) for v in block.bounding_box.vertices]
                blocks_data.append({
                    "text": block_text.strip(),
                    "vertices": vertices
                })
                
        return full_text, blocks_data
    except Exception as e:
        print(f"Vision API Error: {e}")
        return "", []
