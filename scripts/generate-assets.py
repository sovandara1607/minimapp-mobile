from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter

# Original vector-like navigation artwork, rendered with supersampling.
def arrow(size, background=None):
    scale = 4
    image = Image.new('RGBA', (size*scale, size*scale), background or (0,0,0,0))
    def points(coords): return [(int(x*size*scale), int(y*size*scale)) for x,y in coords]
    shadow = Image.new('RGBA', image.size)
    draw = ImageDraw.Draw(shadow)
    draw.polygon(points([(0.5,0.12),(0.87,0.87),(0.5,0.72),(0.13,0.87)]), fill=(20,40,35,65))
    image.alpha_composite(shadow.filter(ImageFilter.GaussianBlur(size*scale*.04)))
    draw = ImageDraw.Draw(image)
    draw.polygon(points([(0.5,0.06),(0.88,0.86),(0.5,0.70),(0.12,0.86)]), fill='#253A38')
    draw.line(points([(0.5,0.06),(0.88,0.86),(0.5,0.70),(0.12,0.86),(0.5,0.06)]), fill='#86968B', width=max(1,int(size*scale*.012)), joint='curve')
    draw.polygon(points([(0.5,0.23),(0.72,0.71),(0.5,0.61),(0.28,0.71)]), fill='#FFFFFF')
    return image.resize((size,size),Image.Resampling.LANCZOS)

Path('assets').mkdir(exist_ok=True)
arrow(96).save('assets/player-arrow.png')
Image.new('RGBA',(2,2),(0,0,0,0)).save('assets/player-empty.png')
icon=Image.new('RGBA',(1024,1024),'#CCD3C9')
puck=arrow(600)
icon.alpha_composite(puck,(212,212))
icon.convert('RGB').save('assets/icon.png')
foreground=Image.new('RGBA',(1024,1024))
foreground.alpha_composite(arrow(460),(282,282))
foreground.save('assets/android-icon-foreground.png')
