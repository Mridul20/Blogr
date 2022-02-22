from text_to_speech import speak
import sys

key = sys.argv[1]
author = sys.argv[2]

txt = ""
with open("bloggers/" + author + "/" + key + ".txt") as f:
    for line in f:
        txt = txt + line

speak(txt, "en", save=True, file="bloggers/" + author + "/" + key +".mp3")
