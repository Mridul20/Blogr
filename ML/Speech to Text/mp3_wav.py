from os import path
from pydub import AudioSegment

AudioSegment.ffmpeg = r"C:\Path Programs\ffmpeg\bin\ffmpeg.exe"
# assign files
input_file = "Hello.mp3"
output_file = "result.wav"
  
# convert mp3 file to wav file
sound = AudioSegment.from_mp3(input_file)
sound.export(output_file, format="wav")


# import speech_recognition as sr
# r = sr.Recognizer()
# with sr.WavFile("result.wav") as source:              # use "test.wav" as the audio source
#     audio = r.record(source)                        # extract audio data from the file

# try:
#     print("Transcription: " + r.recognize_api(audio))   # recognize speech using Google Speech Recognition
# except LookupError:                                 # speech is unintelligible
#     print("Could not understand audio")