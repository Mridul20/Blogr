import sys
import pyttsx3
key = sys.argv[1]
author = sys.argv[2]

txt = ""
with open("bloggers/" + author + "/" + key + ".txt") as f:
    for line in f:
        txt = txt + line

# print(txt)

engine = pyttsx3.init() # object creation

rate = engine.getProperty('rate')
engine.setProperty('rate', 125)     # setting up new voice rate

voices = engine.getProperty('voices') 
engine.setProperty('voice', voices[1].id)   #changing index, changes voices. 1 for female

engine.save_to_file(txt, "bloggers/" + author + "/" + key +".mp3")
engine.runAndWait()