from bs4 import BeautifulSoup

original_file_handle = open("pass2.svg", "r")
original_file = original_file_handle.read()

soup = BeautifulSoup(original_file)

for sprite in soup.find("g").findAll("g", recursive=False):
	rects = sprite.findAll('rect')

	x_offset = float(rects[0]['x']) * 4
	y_offset = (float(rects[0]['y']) - 332.36218) * 4

	sprite['transform'] = "matrix(4 0 0 4 -%f -%f)" % (1260 + x_offset, 2077.09 + y_offset)

	if sprite['id'] == 'wild-wild':
		sprite['transform'] = 'translate(-3120 -1.36523e-005)'

output = soup.prettify("utf-8")
with open("output.svg", "wb") as file:
    file.write(output)
