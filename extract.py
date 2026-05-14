import fitz
import os

doc = fitz.open(r"C:\Users\koush\Downloads\SKJalRakshakInnovationsPvtLtd.pdf")
out_dir = r"C:\Users\koush\OneDrive\Desktop\skjal\img"

for i, page in enumerate(doc):
    for j, img in enumerate(page.get_images(full=True)):
        xref = img[0]
        base_image = doc.extract_image(xref)
        image_bytes = base_image["image"]
        image_ext = base_image["ext"]
        image_name = f"pdf_img_page{i+1}_{j+1}.{image_ext}"
        with open(os.path.join(out_dir, image_name), "wb") as f:
            f.write(image_bytes)
print("Done extracting images.")
