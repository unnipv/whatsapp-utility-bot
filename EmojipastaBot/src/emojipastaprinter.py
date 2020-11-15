from emojipasta.generator import EmojipastaGenerator
import sys
import os


text=''
for word in sys.argv[1:]:
    text+=str(word)+' '

generator = EmojipastaGenerator.of_default_mappings()
pasta = str(generator.generate_emojipasta(text))
# b = bytes(text, 'utf-8')
with open("..\\..\\media\\emojipasta.txt","a",encoding = 'utf-8') as f:
    f.write('\n' + pasta)